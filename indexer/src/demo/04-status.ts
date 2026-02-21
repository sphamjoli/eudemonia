#!/usr/bin/env bun
import 'dotenv/config';
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import {
  makePublicClient,
  makeRedis,
  contractAddresses,
  issuanceRegistryAbi,
  rwaToken1155Abi,
  gqlQuery,
  optionalEnv,
  PRIVACY_LABEL,
  REQUEST_STATUS_LABEL,
} from './shared.js';
import type { Address } from 'viem';

const program = new Command();
program
  .name('demo-status')
  .description('Poll proof job status from Redis + GraphQL indexer')
  .requiredOption('--request-id <n>', 'Issuance request identifier to watch')
  .option('--poll <seconds>', 'Seconds between status polls', '5')
  .option('--timeout <seconds>', 'Give up after this many seconds (0 = forever)', '300')
  .parse();

const opts = program.opts<{
  requestId: string;
  poll: string;
  timeout: string;
}>();

interface GqlProofJob {
  id: string;
  requestIdentifier: string;
  policyIdentifier: string;
  status: string;
  attemptCount: number;
  nextAttemptAt: string;
  updatedAt: string;
}

interface RedisProofJob {
  requestId: string;
  policyId: string;
  status: string;
  attemptCount: number;
  nextAttemptAt: number;
  lastError?: string;
  lastTxHash?: string;
  lockOwner?: string;
  lockedAt?: number;
}

function parseRequestId(raw: string): bigint {
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) return BigInt(trimmed);
  const fallback = trimmed.match(/\d+/)?.[0];
  if (!fallback) throw new Error(`Invalid request id: ${raw}`);
  return BigInt(fallback);
}

const requestId = parseRequestId(opts.requestId);
const pollMs = Number(opts.poll) * 1000;
const timeoutMs = Number(opts.timeout) * 1000;

const pub = makePublicClient();
const redis = makeRedis();
const addrs = contractAddresses();

console.log(chalk.bold.cyan('\n╔══════════════════════════════════════╗'));
console.log(chalk.bold.cyan('║  Eudemonia · Proof Job Status         ║'));
console.log(chalk.bold.cyan('╚══════════════════════════════════════╝\n'));
console.log(chalk.dim(`  Request ID:  ${requestId}`));
console.log(
  chalk.dim(
    `  GraphQL:     ${optionalEnv('INDEXER_GRAPHQL_URL', 'http://127.0.0.1:8081/v1/graphql')}`,
  ),
);
console.log(chalk.dim(`  Poll every:  ${opts.poll}s`));
console.log(
  chalk.dim(`  Timeout:     ${Number(opts.timeout) === 0 ? 'none' : opts.timeout + 's'}`),
);
console.log();

async function fetchRedisJob(): Promise<RedisProofJob | null> {
  const raw = await redis.get(`proofjob:request:${requestId}`);
  if (!raw) return null;
  return JSON.parse(raw) as RedisProofJob;
}

async function fetchGqlJob(): Promise<GqlProofJob | null> {
  try {
    const data = await gqlQuery<{ jobs: GqlProofJob[] }>(
      `query ProofJobStatus($id: numeric!) {
        jobs: ProofJob(where: { requestIdentifier: { _eq: $id } }, limit: 1) {
          id requestIdentifier policyIdentifier status attemptCount nextAttemptAt updatedAt
        }
      }`,
      { id: requestId.toString() },
    );
    return data.jobs?.[0] ?? null;
  } catch {
    return null;
  }
}

function statusColour(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return chalk.bold.green(status);
    case 'RUNNING':
      return chalk.bold.yellow(status);
    case 'RETRY':
      return chalk.yellow(status);
    case 'DEAD_LETTER':
      return chalk.bold.red(status);
    default:
      return chalk.dim(status);
  }
}

const sp = ora(chalk.yellow('Starting poll…')).start();
const startedAt = Date.now();
let lastStatusStr = '';

while (true) {
  const [redisJob, gqlJob] = await Promise.all([fetchRedisJob(), fetchGqlJob()]);

  const status = redisJob?.status ?? gqlJob?.status ?? 'NOT_FOUND';
  const attempt = redisJob?.attemptCount ?? gqlJob?.attemptCount ?? 0;
  const txHash = redisJob?.lastTxHash;
  const lastError = redisJob?.lastError;
  const elapsed = Math.round((Date.now() - startedAt) / 1000);

  const statusStr = `${status}  attempt=${attempt}  elapsed=${elapsed}s`;

  if (statusStr !== lastStatusStr) {
    sp.text = `ProofJob #${requestId}  ${statusColour(status)}  attempt=${attempt}  elapsed=${elapsed}s`;
    lastStatusStr = statusStr;
  }

  if (status === 'COMPLETED') {
    sp.succeed(
      chalk.bold.green(`ProofJob #${requestId} · COMPLETED`) +
        (txHash ? chalk.dim(`  tx: ${txHash}`) : ''),
    );

    try {
      const req = await pub.readContract({
        address: addrs.issuanceRegistry,
        abi: issuanceRegistryAbi,
        functionName: 'getRequest',
        args: [requestId],
      });

      console.log();
      console.log(chalk.bold('  On-chain request:'));
      console.log(chalk.dim(`    status:      ${REQUEST_STATUS_LABEL[req.status] ?? req.status}`));
      console.log(
        chalk.dim(`    privacy:     ${PRIVACY_LABEL[req.privacyMode] ?? req.privacyMode}`),
      );

      if (
        addrs.rwaToken &&
        req.beneficiary &&
        req.beneficiary !== '0x0000000000000000000000000000000000000000'
      ) {
        const balance = await pub.readContract({
          address: addrs.rwaToken,
          abi: rwaToken1155Abi,
          functionName: 'balanceOf',
          args: [req.beneficiary as Address, req.assetIdentifier],
        });
        console.log(chalk.dim(`    beneficiary: ${req.beneficiary}`));
        console.log(
          chalk.dim(
            `    token bal:   ${balance.toLocaleString()} (assetId ${req.assetIdentifier})`,
          ),
        );
      }
    } catch {
      /* balance check is best-effort */
    }

    if (txHash) {
      console.log();
      console.log(chalk.bold.green('  Execution tx: ') + chalk.cyan(txHash));
      console.log(
        chalk.dim('  The ZK proof verified on-chain. Compliance is proven. Payment data is not.'),
      );
    }
    break;
  }

  if (status === 'DEAD_LETTER') {
    sp.fail(chalk.bold.red(`ProofJob #${requestId} · DEAD_LETTER`));
    if (lastError) console.log(chalk.red(`  Last error: ${lastError}`));
    console.log(chalk.dim('  Inspect Redis key: proofjob:request:' + requestId));
    break;
  }

  if (status === 'RUNNING' && redisJob?.lockedAt) {
    const lockedForMs = Date.now() - redisJob.lockedAt;
    sp.text = `ProofJob #${requestId}  ${statusColour(status)}  attempt=${attempt}  locked for ${Math.round(lockedForMs / 1000)}s`;
  }

  if (timeoutMs > 0 && Date.now() - startedAt > timeoutMs) {
    sp.warn(chalk.yellow(`Timeout after ${opts.timeout}s — status is still ${status}`));
    break;
  }

  await new Promise((resolve) => setTimeout(resolve, pollMs));
}

await redis.quit();
console.log();
console.log(
  chalk.dim(`  Run 05-audit.ts for the full verifiable trail: --request-id ${requestId}`),
);
console.log();
