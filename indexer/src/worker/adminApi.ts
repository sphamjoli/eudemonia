import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { isAddress, keccak256, toHex, type Hex } from 'viem';
import type { WorkerConfig } from './config.js';
import type { ProofJobState } from './types.js';
import { RedisStore } from './redisStore.js';

/** Shared CORS headers for local UI integration. */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
};

/** Writes a JSON response with CORS headers. */
function writeJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    ...CORS_HEADERS,
  });
  res.end(JSON.stringify(payload));
}

/** Reads and parses JSON body from an incoming request. */
async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {} as T;
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T;
}

/** Builds deterministic digest from plain text payload. */
function digestFromText(value: string): Hex {
  return keccak256(toHex(value));
}

/** Runtime status snapshot exposed by worker API. */
interface WorkerStatusSnapshot {
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

const ZERO_HASH = `0x${'00'.repeat(32)}` as Hex;

function toLowerAddress(value: string): string {
  return value.toLowerCase();
}

function paymentIdFor(runId: string, index: number): string {
  return `${runId}-p${String(index + 1).padStart(2, '0')}`;
}

/** Starts worker-side API for Redis scenario inspection and mutation. */
export function startWorkerAdminApi(args: {
  redis: RedisStore;
  cfg: WorkerConfig;
  getStatus?: () => WorkerStatusSnapshot;
}): void {
  const { redis, cfg, getStatus } = args;
  if (!cfg.workerApiEnabled) {
    console.log('[worker-api] disabled via WORKER_API_ENABLED=false');
    return;
  }

  const server = createServer(async (req, res) => {
    if (!req.url || !req.method) {
      writeJson(res, 400, { error: 'Malformed request' });
      return;
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }

    const url = new URL(req.url, 'http://localhost');

    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        writeJson(res, 200, { ok: true, service: 'worker-api' });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/worker/status') {
        writeJson(res, 200, {
          instanceId: cfg.workerInstanceId,
          pollIntervalMs: cfg.pollIntervalMs,
          ...(getStatus?.() ?? {}),
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/redis/scan') {
        const pattern = url.searchParams.get('pattern') ?? '*';
        const keys = await redis.listKeys(pattern);
        writeJson(res, 200, { pattern, keys });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/redis/get') {
        const key = url.searchParams.get('key');
        if (!key) {
          writeJson(res, 400, { error: 'Missing key query param' });
          return;
        }

        const value = await redis.getJson<unknown>(key);
        writeJson(res, 200, { key, value });
        return;
      }

      if (req.method === 'PUT' && url.pathname === '/redis/set') {
        const body = await readJsonBody<{ key?: string; value?: unknown }>(req);
        if (!body.key) {
          writeJson(res, 400, { error: 'Body requires key' });
          return;
        }

        await redis.setJson(body.key, body.value ?? null);
        writeJson(res, 200, { ok: true, key: body.key });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/scenario/employee') {
        const subjectId = url.searchParams.get('subjectId');
        if (!subjectId) {
          writeJson(res, 400, { error: 'Missing subjectId query param' });
          return;
        }

        const requestId = url.searchParams.get('requestId') ?? undefined;

        const masterKey = `employee:master:${subjectId}`;
        const checkKeys = await redis.listKeys(`compliance:subject:${subjectId}:check:*`);
        const checks = await redis.mgetJson<unknown>(checkKeys);

        const proofJob = requestId ? await redis.getProofJobState(requestId) : null;

        writeJson(res, 200, {
          subjectId,
          masterKey,
          master: await redis.getJson<unknown>(masterKey),
          checks,
          proofJob,
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/scenario/seed-employee') {
        const body = await readJsonBody<{
          subjectId?: string;
          fullName?: string;
          jurisdiction?: string;
          checkIds?: string[];
        }>(req);

        const subjectId = body.subjectId?.toLowerCase();
        if (!subjectId) {
          writeJson(res, 400, { error: 'Body requires subjectId' });
          return;
        }

        const now = Date.now();
        const defaultChecks =
          body.checkIds && body.checkIds.length > 0 ? body.checkIds : ['KYC_PASS', 'AML_PASS'];

        await redis.setJson(`employee:master:${subjectId}`, {
          schemaVersion: 1,
          source: 'worker-api',
          createdAt: now,
          updatedAt: now,
          subjectId,
          fullName: body.fullName ?? 'Demo Worker',
          jurisdiction: body.jurisdiction ?? 'ZA',
          employmentStatus: 'ACTIVE',
        });
        await redis.deleteKey(`employee:privacy:${subjectId}`);

        for (const checkId of defaultChecks) {
          const checkKey = `compliance:subject:${subjectId}:check:${checkId}`;
          const digest = digestFromText(`${subjectId}:${checkId}:PASS:${now}`);
          await redis.setJson(checkKey, {
            schemaVersion: 1,
            source: 'worker-api',
            createdAt: now,
            updatedAt: now,
            subjectId,
            checkId,
            passed: true,
            observedAt: Math.floor(now / 1000),
            digest,
            payloadHash: digest,
          });
        }

        writeJson(res, 200, { ok: true, subjectId, checksSeeded: defaultChecks });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/scenario/seed-payroll-run') {
        const body = await readJsonBody<{
          runId?: string;
          currency?: string;
          assetIdentifier?: string;
          effectiveAt?: number;
          participants?: Array<{
            subjectId: string;
            fullName?: string;
            level?: string;
            jurisdiction?: string;
            grossAmount?: string | number;
            netAmount?: string | number;
            beneficiary?: string;
            paymentId?: string;
            documentationRef?: string;
            expiryTimestamp?: string | number;
            checkIds?: string[];
          }>;
          auditors?: string[];
        }>(req);

        const runId = (body.runId ?? 'source-batch-v1').trim();
        if (runId.length === 0) {
          writeJson(res, 400, { error: 'Body requires non-empty runId' });
          return;
        }

        const participants = Array.isArray(body.participants) ? body.participants : [];
        if (participants.length === 0) {
          writeJson(res, 400, {
            error: 'Body requires participants[]. Offchain source data must be explicit.',
          });
          return;
        }

        const currency = (body.currency ?? 'USDC').toUpperCase();
        const assetIdentifier = body.assetIdentifier ?? '1';
        const now = Date.now();
        const effectiveAt = Number(body.effectiveAt ?? Math.floor(now / 1000));
        const paymentIds: string[] = [];
        const subjects: string[] = [];
        const auditors = (Array.isArray(body.auditors) ? body.auditors : [])
          .map(toLowerAddress)
          .filter((value) => isAddress(value));
        const paymentIntentKeys: string[] = [];

        for (let index = 0; index < participants.length; index += 1) {
          const participant = participants[index];
          const subjectAddress = toLowerAddress(participant.subjectId);
          if (!isAddress(subjectAddress)) {
            writeJson(res, 400, {
              error: `participants[${index}].subjectId must be a valid address`,
            });
            return;
          }

          const paymentId = participant.paymentId?.trim() || paymentIdFor(runId, index);
          const level = participant.level?.trim() || `L${index + 1}`;
          const grossAmount = Number(participant.grossAmount ?? participant.netAmount ?? 0);
          const netAmount = Number(participant.netAmount ?? participant.grossAmount ?? 0);
          if (!Number.isFinite(netAmount) || netAmount <= 0) {
            writeJson(res, 400, {
              error: `participants[${index}].netAmount must be a positive number`,
            });
            return;
          }

          const amount = netAmount.toString();
          const beneficiary = toLowerAddress(participant.beneficiary ?? subjectAddress);
          if (!isAddress(beneficiary)) {
            writeJson(res, 400, {
              error: `participants[${index}].beneficiary must be a valid address`,
            });
            return;
          }

          const documentationRef =
            participant.documentationRef?.trim() || `SOURCE:${runId}:${paymentId}`;
          const documentationHash = digestFromText(`DOC:${documentationRef}`);
          const checkIds =
            participant.checkIds && participant.checkIds.length > 0
              ? participant.checkIds
              : ['KYC_PASS', 'AML_PASS'];
          const fullName = participant.fullName?.trim() || `Participant ${index + 1}`;
          const expiryTimestamp = String(participant.expiryTimestamp ?? '0');

          subjects.push(subjectAddress);
          paymentIds.push(paymentId);

          await redis.setJson(`employee:master:${subjectAddress}`, {
            schemaVersion: 1,
            source: 'worker-api',
            createdAt: now,
            updatedAt: now,
            subjectId: subjectAddress,
            fullName,
            jurisdiction: participant.jurisdiction ?? 'ZA',
            employmentStatus: 'ACTIVE',
            level,
          });
          await redis.deleteKey(`employee:privacy:${subjectAddress}`);

          for (const checkId of checkIds) {
            const digest = digestFromText(`${subjectAddress}:${checkId}:PASS:${runId}`);
            await redis.setJson(`compliance:subject:${subjectAddress}:check:${checkId}`, {
              schemaVersion: 1,
              source: 'worker-api',
              createdAt: now,
              updatedAt: now,
              subjectId: subjectAddress,
              checkId,
              passed: true,
              observedAt: effectiveAt,
              digest,
              payloadHash: digest,
            });
          }

          const paymentIntentKey = `payment:intent:${paymentId}`;
          paymentIntentKeys.push(paymentIntentKey);
          await redis.setJson(paymentIntentKey, {
            schemaVersion: 1,
            source: 'worker-api',
            createdAt: now,
            updatedAt: now,
            paymentId,
            runId,
            subjectId: subjectAddress,
            fullName,
            level,
            currency,
            assetIdentifier,
            grossAmount: grossAmount.toString(),
            netAmount: netAmount.toString(),
            amount,
            beneficiary,
            intendedBeneficiary: subjectAddress,
            documentationRef,
            documentationHash,
            expiryTimestamp,
            effectiveAt,
          });

          await redis.setJson(`payment:commitment:${paymentId}`, {
            schemaVersion: 1,
            source: 'worker-api',
            createdAt: now,
            updatedAt: now,
            paymentId,
            runId,
            intentDigest: digestFromText(`${paymentId}:${subjectAddress}:${netAmount}`),
            amountCommitment: ZERO_HASH,
            destinationCommitment: ZERO_HASH,
            payloadHash: ZERO_HASH,
            documentationHash,
          });
        }

        await redis.setJson(`payment:run:${runId}`, {
          schemaVersion: 1,
          source: 'worker-api',
          createdAt: now,
          updatedAt: now,
          runId,
          participantCount: participants.length,
          currency,
          assetIdentifier,
          effectiveAt,
          paymentIds,
          subjects,
          auditors,
        });

        writeJson(res, 200, {
          ok: true,
          runId,
          seededEmployees: participants.length,
          paymentIntentKeys,
          subjects,
          auditors,
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/scenario/payroll-run') {
        const runId = url.searchParams.get('runId')?.trim();
        if (!runId) {
          writeJson(res, 400, { error: 'Missing runId query param' });
          return;
        }

        const runKey = `payment:run:${runId}`;
        const run = await redis.getJson<Record<string, unknown>>(runKey);
        if (!run) {
          writeJson(res, 404, { error: `Payroll run not found: ${runId}` });
          return;
        }

        const paymentIds = Array.isArray(run.paymentIds)
          ? run.paymentIds.filter((value): value is string => typeof value === 'string')
          : [];
        const intentKeys = paymentIds.map((paymentId) => `payment:intent:${paymentId}`);
        const commitmentKeys = paymentIds.map((paymentId) => `payment:commitment:${paymentId}`);
        const intents = await redis.mgetJson<Record<string, unknown>>(intentKeys);
        const commitments = await redis.mgetJson<Record<string, unknown>>(commitmentKeys);

        writeJson(res, 200, {
          runId,
          runKey,
          run,
          intents,
          commitments,
        });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/scenario/source-runs') {
        const runKeys = await redis.listKeys('payment:run:*');
        const rows = await redis.mgetJson<Record<string, unknown>>(runKeys);
        const runs = rows
          .map(({ key, value }) => ({
            key,
            runId: String(value.runId ?? key.replace('payment:run:', '')),
            participantCount: Number(value.participantCount ?? 0),
            updatedAt: Number(value.updatedAt ?? 0),
          }))
          .sort((left, right) => right.updatedAt - left.updatedAt);

        writeJson(res, 200, { runs });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/scenario/tamper-check') {
        const body = await readJsonBody<{
          subjectId?: string;
          checkId?: string;
          passed?: boolean;
          digest?: string;
        }>(req);

        if (!body.subjectId || !body.checkId) {
          writeJson(res, 400, { error: 'Body requires subjectId and checkId' });
          return;
        }

        const key = `compliance:subject:${body.subjectId.toLowerCase()}:check:${body.checkId}`;
        const current = (await redis.getJson<Record<string, unknown>>(key)) ?? {};
        const now = Date.now();
        const digest =
          body.digest && body.digest.startsWith('0x')
            ? body.digest
            : digestFromText(`${body.subjectId}:${body.checkId}:TAMPERED:${now}`);

        const mutated = {
          schemaVersion: Number(current.schemaVersion ?? 1),
          source: String(current.source ?? 'worker-api'),
          createdAt: Number(current.createdAt ?? now),
          updatedAt: now,
          subjectId: body.subjectId.toLowerCase(),
          checkId: body.checkId,
          passed: body.passed ?? false,
          observedAt: Number(current.observedAt ?? Math.floor(now / 1000)),
          digest,
          payloadHash: String(current.payloadHash ?? digest),
        };

        await redis.setJson(key, mutated);
        writeJson(res, 200, { ok: true, key, value: mutated });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/scenario/requeue-request') {
        const body = await readJsonBody<{ requestId?: string; policyId?: string }>(req);
        if (!body.requestId) {
          writeJson(res, 400, { error: 'Body requires requestId' });
          return;
        }

        const now = Date.now();
        const existing = await redis.getProofJobState(body.requestId);
        const state: ProofJobState = {
          ...(existing ?? {
            schemaVersion: 1,
            source: 'worker-api',
            createdAt: now,
            requestId: body.requestId,
            policyId: body.policyId ?? '0',
            attemptCount: 0,
          }),
          updatedAt: now,
          status: 'RETRY',
          nextAttemptAt: now,
          lastError: undefined,
          lockOwner: undefined,
          lockedAt: undefined,
        };

        if (body.policyId) {
          state.policyId = body.policyId;
        }

        await redis.setProofJobState(state);
        writeJson(res, 200, { ok: true, state });
        return;
      }

      writeJson(res, 404, { error: 'Not found' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      writeJson(res, 500, { error: message });
    }
  });

  server.listen(cfg.workerApiPort, '0.0.0.0', () => {
    console.log(`[worker-api] listening on 0.0.0.0:${cfg.workerApiPort}`);
  });
}
