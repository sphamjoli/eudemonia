import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Seeds institution source records in Redis via worker admin API.
 *
 * Usage:
 *   bun run seed:redis --participants-file ./seed/participants.json
 *   bun run seed:redis --runId demo-source-v2 --participants-json '[{"subjectId":"0x...","netAmount":1200}]'
 */
type SeedResponse = {
  ok: boolean;
  runId: string;
  seededEmployees: number;
  paymentIntentKeys: string[];
  subjects: string[];
  auditors: string[];
};

const DEFAULT_WORKER_API_URL = 'http://127.0.0.1:8787';

function readArg(flag: string): string | undefined {
  const index = process.argv.findIndex((value) => value === flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function parseJsonInput<T>(raw: string, label: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(`${label} must be valid JSON`);
  }
}

type SourceParticipant = {
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
};

function loadParticipants(): SourceParticipant[] {
  const jsonArg = readArg('--participants-json');
  const fileArg = readArg('--participants-file');
  const envJson = process.env.SEED_PARTICIPANTS_JSON;
  const envFile = process.env.SEED_PARTICIPANTS_FILE;

  if (jsonArg) {
    return parseJsonInput<SourceParticipant[]>(jsonArg, '--participants-json');
  }
  if (envJson) {
    return parseJsonInput<SourceParticipant[]>(envJson, 'SEED_PARTICIPANTS_JSON');
  }

  const filePath = fileArg || envFile;
  if (!filePath) {
    throw new Error(
      'Provide participants via --participants-file or --participants-json (or matching env vars).',
    );
  }

  const raw = readFileSync(resolve(filePath), 'utf8');
  return parseJsonInput<SourceParticipant[]>(raw, '--participants-file');
}

function loadAuditors(): string[] | undefined {
  const auditorsArg = readArg('--auditors');
  const envAuditors = process.env.SEED_AUDITORS;
  const raw = auditorsArg ?? envAuditors;
  if (!raw) return undefined;
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

async function seedPayroll(): Promise<void> {
  const workerApiUrl =
    process.env.WORKER_API_URL ??
    process.env.VITE_WORKER_API_URL ??
    DEFAULT_WORKER_API_URL;
  const runId = readArg('--runId') ?? 'source-batch-v1';
  const participants = loadParticipants();
  if (!Array.isArray(participants) || participants.length === 0) {
    throw new Error('participants payload must include at least one participant');
  }
  const auditors = loadAuditors();

  const response = await fetch(`${workerApiUrl}/scenario/seed-payroll-run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      runId,
      currency: 'USDC',
      assetIdentifier: '1',
      participants,
      auditors,
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Seed request failed (${response.status}): ${payload}`);
  }

  const payload = (await response.json()) as SeedResponse;
  console.log(
    JSON.stringify(
      {
        ok: payload.ok,
        runId: payload.runId,
        seededEmployees: payload.seededEmployees,
        paymentIntentKeys: payload.paymentIntentKeys,
        subjects: payload.subjects,
        auditors: payload.auditors,
      },
      null,
      2,
    ),
  );
}

seedPayroll().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[seed:redis] ${message}`);
  process.exit(1);
});
