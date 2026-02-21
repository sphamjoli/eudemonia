import { setTimeout as sleep } from 'node:timers/promises';
import type { Hex } from 'viem';
import { ChainClient } from './chain.js';
import { loadWorkerConfig } from './config.js';
import { IndexerClient } from './indexerClient.js';
import { proveWitness } from './prover.js';
import { RedisStore } from './redisStore.js';
import { nextRetryTimestampMs } from './retry.js';
import type { IndexedProofJob, ProofJobState } from './types.js';
import { buildWitnessInput, subjectIdFromRequest } from './witness.js';
import { startWorkerAdminApi } from './adminApi.js';

/** Runtime worker telemetry used by admin API and UI proof-ops dashboards. */
interface WorkerRuntimeStatus {
  startedAtMs: number;
  lastLoopStartedAtMs: number;
  lastLoopCompletedAtMs: number;
  lastPolledAtMs: number;
  lastPolledJobCount: number;
  lastProcessedRequestId: string | null;
  lastProcessedPolicyId: string | null;
  lastProcessedAtMs: number;
  lastError: string | null;
}

/** Returns current wall-clock timestamp in milliseconds. */
function nowMs(): number {
  return Date.now();
}

/**
 * Converts an indexed proof job row into durable Redis job state.
 *
 * @param job Indexed proof job from GraphQL.
 * @returns Initial `ProofJobState` representation.
 */
function defaultStateFromJob(job: IndexedProofJob): ProofJobState {
  return {
    schemaVersion: 1,
    source: 'indexer',
    createdAt: Number(job.updatedAt),
    updatedAt: Number(job.updatedAt),
    requestId: job.requestIdentifier,
    policyId: job.policyIdentifier,
    status: job.status,
    attemptCount: job.attemptCount,
    nextAttemptAt: Number(job.nextAttemptAt),
  };
}

/**
 * Marks a job as completed in Redis.
 *
 * @param redis Redis store adapter.
 * @param base Existing job state to update.
 * @param txHash Optional transaction hash of successful execution.
 */
async function markCompleted(redis: RedisStore, base: ProofJobState, txHash?: Hex): Promise<void> {
  await redis.setProofJobState({
    ...base,
    status: 'COMPLETED',
    updatedAt: nowMs(),
    nextAttemptAt: nowMs(),
    lastTxHash: txHash ?? base.lastTxHash,
    lastError: undefined,
  });
}

/**
 * Marks a job for retry or dead-letter based on retry policy.
 *
 * @param redis Redis store adapter.
 * @param base Existing job state to update.
 * @param message Failure reason.
 * @param retryWindow Retry policy configuration.
 */
async function markRetry(
  redis: RedisStore,
  base: ProofJobState,
  message: string,
  retryWindow: { maxRetries: number; backoffBaseMs: number; backoffMaxMs: number },
): Promise<void> {
  const attempts = base.attemptCount + 1;
  if (attempts > retryWindow.maxRetries) {
    await redis.setProofJobState({
      ...base,
      attemptCount: attempts,
      status: 'DEAD_LETTER',
      lastError: message,
      updatedAt: nowMs(),
      nextAttemptAt: nowMs(),
    });
    return;
  }

  await redis.setProofJobState({
    ...base,
    attemptCount: attempts,
    status: 'RETRY',
    lastError: message,
    updatedAt: nowMs(),
    nextAttemptAt: nextRetryTimestampMs({
      nowMs: nowMs(),
      attemptCount: attempts,
      backoffBaseMs: retryWindow.backoffBaseMs,
      backoffMaxMs: retryWindow.backoffMaxMs,
    }),
  });
}

/**
 * Processes one proof job end-to-end with lock + retry handling.
 *
 * @param args Job processing dependencies.
 * `args.job`: Indexed proof job candidate.
 * `args.redis`: Redis data/state adapter.
 * `args.indexer`: GraphQL indexer client.
 * `args.chain`: Onchain read/submit client.
 * `args.cfg`: Worker runtime configuration.
 */
async function processJob(args: {
  job: IndexedProofJob;
  redis: RedisStore;
  indexer: IndexerClient;
  chain: ChainClient;
  cfg: ReturnType<typeof loadWorkerConfig>;
  runtime: WorkerRuntimeStatus;
}): Promise<void> {
  const { job, redis, indexer, chain, cfg, runtime } = args;
  const lockOwner = `${cfg.workerInstanceId}:${job.requestIdentifier}`;
  const gotLock = await redis.acquireLock(job.requestIdentifier, lockOwner, cfg.proofLockTtlMs);
  if (!gotLock) return;

  try {
    const persistedState =
      (await redis.getProofJobState(job.requestIdentifier)) ?? defaultStateFromJob(job);

    if (persistedState.status === 'COMPLETED' || persistedState.status === 'DEAD_LETTER') {
      return;
    }

    if (persistedState.nextAttemptAt > nowMs()) {
      return;
    }

    const runningState: ProofJobState = {
      ...persistedState,
      status: 'RUNNING',
      lockOwner,
      lockedAt: nowMs(),
      updatedAt: nowMs(),
    };
    await redis.setProofJobState(runningState);

    const requestId = BigInt(job.requestIdentifier);
    const request = await indexer.fetchIssuanceRequest(job.requestIdentifier);
    if (!request) {
      await markRetry(redis, runningState, `Missing indexed request ${job.requestIdentifier}`, {
        maxRetries: cfg.proofMaxRetries,
        backoffBaseMs: cfg.proofBackoffBaseMs,
        backoffMaxMs: cfg.proofBackoffMaxMs,
      });
      return;
    }

    if (request.status !== 'REQUESTED') {
      await markCompleted(redis, runningState);
      return;
    }

    const chainRequest = await chain.getRequest(requestId);
    if (chainRequest.status !== 1) {
      await markCompleted(redis, runningState);
      return;
    }
    if (chainRequest.parametersHash.toLowerCase() !== request.parametersHash.toLowerCase()) {
      await markRetry(
        redis,
        runningState,
        `Indexed request hash drift for ${job.requestIdentifier}`,
        {
          maxRetries: cfg.proofMaxRetries,
          backoffBaseMs: cfg.proofBackoffBaseMs,
          backoffMaxMs: cfg.proofBackoffMaxMs,
        },
      );
      return;
    }

    const indexedPolicy =
      job.policyIdentifier !== '0'
        ? await indexer.fetchPolicyById(job.policyIdentifier)
        : await indexer.fetchActivePolicy();
    if (!indexedPolicy) {
      await markRetry(redis, runningState, 'No active policy in indexer', {
        maxRetries: cfg.proofMaxRetries,
        backoffBaseMs: cfg.proofBackoffBaseMs,
        backoffMaxMs: cfg.proofBackoffMaxMs,
      });
      return;
    }

    const policyId = BigInt(indexedPolicy.policyIdentifier);
    const policyDefinition = await redis.getPolicyDefinition(indexedPolicy.policyIdentifier);
    if (!policyDefinition) {
      await markRetry(
        redis,
        { ...runningState, policyId: indexedPolicy.policyIdentifier },
        `Missing redis policy definition for policy ${indexedPolicy.policyIdentifier}`,
        {
          maxRetries: cfg.proofMaxRetries,
          backoffBaseMs: cfg.proofBackoffBaseMs,
          backoffMaxMs: cfg.proofBackoffMaxMs,
        },
      );
      return;
    }

    const subjectId = subjectIdFromRequest(request);
    const checks = await redis.getChecks(subjectId, policyDefinition.requiredChecks);
    const attestations = await redis.getAttestations(job.requestIdentifier);

    const chainPolicy = await chain.getPolicy(policyId);
    if (chainPolicy.status !== 1) {
      await markRetry(redis, runningState, `Policy ${policyId.toString()} not ACTIVE onchain`, {
        maxRetries: cfg.proofMaxRetries,
        backoffBaseMs: cfg.proofBackoffBaseMs,
        backoffMaxMs: cfg.proofBackoffMaxMs,
      });
      return;
    }

    const isValidAt = await chain.isPolicyValidAt(policyId, BigInt(Math.floor(Date.now() / 1000)));
    if (!isValidAt) {
      await markRetry(
        redis,
        runningState,
        `Policy ${policyId.toString()} not valid at current timestamp`,
        {
          maxRetries: cfg.proofMaxRetries,
          backoffBaseMs: cfg.proofBackoffBaseMs,
          backoffMaxMs: cfg.proofBackoffMaxMs,
        },
      );
      return;
    }

    const witness = buildWitnessInput({
      request,
      policy: indexedPolicy,
      policyDefinition,
      checks,
      attestations,
      chainId: cfg.chainId,
      issuanceRegistryAddress: cfg.issuanceRegistry,
      currentTimestamp: Math.floor(nowMs() / 1000),
    });

    const { publicValues, proofBytes } = await proveWitness({
      cfg,
      requestIdentifier: job.requestIdentifier,
      witness,
    });

    const txHash = await chain.submitExecution({
      requestIdentifier: requestId,
      policyIdentifier: policyId,
      publicValues,
      proofBytes,
    });

    await markCompleted(
      redis,
      { ...runningState, policyId: indexedPolicy.policyIdentifier },
      txHash,
    );
    runtime.lastProcessedRequestId = job.requestIdentifier;
    runtime.lastProcessedPolicyId = indexedPolicy.policyIdentifier;
    runtime.lastProcessedAtMs = nowMs();
    runtime.lastError = null;
    console.log(
      `[worker] completed request=${job.requestIdentifier} policy=${indexedPolicy.policyIdentifier} tx=${txHash}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const current =
      (await redis.getProofJobState(job.requestIdentifier)) ?? defaultStateFromJob(job);
    await markRetry(redis, current, message, {
      maxRetries: cfg.proofMaxRetries,
      backoffBaseMs: cfg.proofBackoffBaseMs,
      backoffMaxMs: cfg.proofBackoffMaxMs,
    });
    runtime.lastError = message;
    console.error(`[worker] failed request=${job.requestIdentifier}: ${message}`);
  } finally {
    await redis.releaseLock(job.requestIdentifier, lockOwner);
  }
}

/**
 * Worker loop entrypoint.
 * Polls due jobs, processes each sequentially, then sleeps.
 */
async function main(): Promise<void> {
  const cfg = loadWorkerConfig();
  const redis = RedisStore.connect(cfg.redisUrl);
  const indexer = new IndexerClient(cfg.graphQlUrl, cfg.graphQlAdminSecret);
  const chain = new ChainClient(cfg);
  const runtime: WorkerRuntimeStatus = {
    startedAtMs: nowMs(),
    lastLoopStartedAtMs: 0,
    lastLoopCompletedAtMs: 0,
    lastPolledAtMs: 0,
    lastPolledJobCount: 0,
    lastProcessedRequestId: null,
    lastProcessedPolicyId: null,
    lastProcessedAtMs: 0,
    lastError: null,
  };
  startWorkerAdminApi({
    redis,
    cfg,
    getStatus: () => ({ ...runtime }),
  });

  console.log(`[worker] starting instance=${cfg.workerInstanceId} chainId=${cfg.chainId}`);
  let lastPollErrorMessage = '';
  let lastPollErrorAtMs = 0;

  while (true) {
    runtime.lastLoopStartedAtMs = nowMs();
    try {
      runtime.lastPolledAtMs = nowMs();
      const jobs = await indexer.fetchPendingProofJobs(
        cfg.jobBatchSize,
        BigInt(Math.floor(nowMs() / 1000)),
      );
      runtime.lastPolledJobCount = jobs.length;
      if (jobs.length > 0) {
        console.log(`[worker] picked ${jobs.length} pending job(s), head=${jobs[0].requestIdentifier}`);
      }

      for (const job of jobs) {
        await processJob({ job, redis, indexer, chain, cfg, runtime });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      runtime.lastError = message;
      const now = nowMs();
      const shouldLog = message !== lastPollErrorMessage || now - lastPollErrorAtMs >= 30000;
      if (shouldLog) {
        console.error(`[worker] polling error: ${message}`);
        lastPollErrorMessage = message;
        lastPollErrorAtMs = now;
      }
    }
    runtime.lastLoopCompletedAtMs = nowMs();

    await sleep(cfg.pollIntervalMs);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
