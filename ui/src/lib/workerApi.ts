/** Redis key/value row returned by worker API scan endpoints. */
export interface RedisJsonRow<T = unknown> {
  key: string;
  value: T;
}

/** Aggregated employee scenario snapshot fetched from Redis worker API. */
export interface EmployeeScenarioSnapshot {
  subjectId: string;
  masterKey: string;
  master: Record<string, unknown> | null;
  checks: Array<RedisJsonRow<Record<string, unknown>>>;
  proofJob: Record<string, unknown> | null;
}

/** Worker runtime status snapshot used by proof-ops views. */
export interface WorkerStatusSnapshot {
  instanceId: string;
  pollIntervalMs: number;
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

/** Redis-backed payroll intent used as issuer source-of-truth. */
export interface PayrollIntentRecord {
  schemaVersion: number;
  source: string;
  createdAt: number;
  updatedAt: number;
  paymentId: string;
  runId: string;
  subjectId: string;
  fullName: string;
  level: string;
  currency: string;
  assetIdentifier: string;
  grossAmount: string;
  netAmount: string;
  amount: string;
  beneficiary: string;
  intendedBeneficiary: string;
  documentationRef: string;
  documentationHash: string;
  expiryTimestamp: string;
  effectiveAt: number;
}

/** Redis-backed payroll commitment details associated with one payment intent. */
export interface PayrollCommitmentRecord {
  schemaVersion: number;
  source: string;
  createdAt: number;
  updatedAt: number;
  paymentId: string;
  runId: string;
  intentDigest: string;
  amountCommitment: string;
  destinationCommitment: string;
  payloadHash: string;
  documentationHash: string;
}

/** Worker API response for seeded payroll run retrieval. */
export interface PayrollRunSnapshot {
  runId: string;
  runKey: string;
  run: Record<string, unknown>;
  intents: Array<RedisJsonRow<PayrollIntentRecord>>;
  commitments: Array<RedisJsonRow<PayrollCommitmentRecord>>;
}

/** Worker API response for payroll seeding requests. */
export interface SeedPayrollRunResult {
  ok: boolean;
  runId: string;
  seededEmployees: number;
  paymentIntentKeys: string[];
  subjects: string[];
  auditors: string[];
}

/** Available source batch summary discovered from Redis. */
export interface SourceRunSummary {
  key: string;
  runId: string;
  participantCount: number;
  updatedAt: number;
}

/** Source participant row used when seeding Redis batch data. */
export interface SourceParticipantInput {
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
}

const workerApiUrl = String(
  import.meta.env.VITE_WORKER_API_URL || 'http://127.0.0.1:8787',
);

/** Issues a JSON request to worker admin API. */
async function workerRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${workerApiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Worker API request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

/** Returns whether worker admin API is reachable. */
export async function pingWorkerApi(): Promise<boolean> {
  try {
    const payload = await workerRequest<{ ok: boolean }>('/health');
    return payload.ok;
  } catch {
    return false;
  }
}

/** Returns runtime worker status for proof operations dashboards. */
export async function fetchWorkerStatus(): Promise<WorkerStatusSnapshot> {
  return workerRequest<WorkerStatusSnapshot>('/worker/status');
}

/** Fetches employee/offchain compliance snapshot from Redis namespace. */
export async function fetchEmployeeScenario(
  subjectId: string,
  requestId?: string,
): Promise<EmployeeScenarioSnapshot> {
  const query = new URLSearchParams({ subjectId });
  if (requestId) {
    query.set('requestId', requestId);
  }

  return workerRequest<EmployeeScenarioSnapshot>(
    `/scenario/employee?${query.toString()}`,
  );
}

/** Seeds demo employee + compliance records in Redis. */
export async function seedEmployeeScenario(args: {
  subjectId: string;
  fullName?: string;
  jurisdiction?: string;
  checkIds?: string[];
}): Promise<void> {
  await workerRequest('/scenario/seed-employee', {
    method: 'POST',
    body: JSON.stringify(args),
  });
}

/** Mutates one compliance check to simulate offchain tampering. */
export async function tamperComplianceCheck(args: {
  subjectId: string;
  checkId: string;
  passed?: boolean;
  digest?: string;
}): Promise<void> {
  await workerRequest('/scenario/tamper-check', {
    method: 'POST',
    body: JSON.stringify(args),
  });
}

/** Re-queues one request in Redis proofjob state for another worker attempt. */
export async function requeueProofRequest(args: {
  requestId: string;
  policyId?: string;
}): Promise<void> {
  await workerRequest('/scenario/requeue-request', {
    method: 'POST',
    body: JSON.stringify(args),
  });
}

/** Lists keys for ad-hoc operator debugging. */
export async function scanRedis(pattern: string): Promise<string[]> {
  const payload = await workerRequest<{ keys: string[] }>(
    `/redis/scan?pattern=${encodeURIComponent(pattern)}`,
  );
  return payload.keys;
}

/** Reads one Redis JSON value by key. */
export async function getRedisValue<T = unknown>(key: string): Promise<T | null> {
  const payload = await workerRequest<{ value: T | null }>(
    `/redis/get?key=${encodeURIComponent(key)}`,
  );
  return payload.value;
}

/** Writes one Redis JSON value by key. */
export async function setRedisValue(key: string, value: unknown): Promise<void> {
  await workerRequest('/redis/set', {
    method: 'PUT',
    body: JSON.stringify({ key, value }),
  });
}

/** Seeds deterministic payroll-run records for demo flows. */
export async function seedPayrollRun(args: {
  runId?: string;
  currency?: string;
  assetIdentifier?: string;
  effectiveAt?: number;
  participants: SourceParticipantInput[];
  auditors?: string[];
}): Promise<SeedPayrollRunResult> {
  return workerRequest<SeedPayrollRunResult>('/scenario/seed-payroll-run', {
    method: 'POST',
    body: JSON.stringify(args),
  });
}

/** Loads payroll-run source data from Redis worker API. */
export async function fetchPayrollRun(runId: string): Promise<PayrollRunSnapshot> {
  return workerRequest<PayrollRunSnapshot>(
    `/scenario/payroll-run?runId=${encodeURIComponent(runId)}`,
  );
}

/** Lists available source batches from Redis. */
export async function fetchSourceRuns(): Promise<SourceRunSummary[]> {
  const payload = await workerRequest<{ runs: SourceRunSummary[] }>(
    '/scenario/source-runs',
  );
  return payload.runs;
}
