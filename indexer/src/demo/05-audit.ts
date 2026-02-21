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
  policyRegistryAbi,
  gqlQuery,
  PRIVACY_LABEL,
  REQUEST_STATUS_LABEL,
} from './shared.js';

const program = new Command();
program
  .name('demo-audit')
  .description('Print full verifiable audit trail for an issuance request')
  .requiredOption('--request-id <n>', 'Issuance request identifier')
  .parse();

const opts = program.opts<{ requestId: string }>();
function parseRequestId(raw: string): bigint {
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) return BigInt(trimmed);
  const fallback = trimmed.match(/\d+/)?.[0];
  if (!fallback) throw new Error(`Invalid request id: ${raw}`);
  return BigInt(fallback);
}
const requestId = parseRequestId(opts.requestId);

interface GqlRequest {
  id: string;
  requestIdentifier: string;
  parametersHash: string;
  issuer: string;
  subject: string;
  beneficiary: string;
  assetIdentifier: string;
  amount: string;
  privacyMode: string;
  status: string;
  expiryTimestamp: string;
  documentationHash: string;
}

interface GqlProofJob {
  id: string;
  requestIdentifier: string;
  policyIdentifier: string;
  status: string;
  attemptCount: number;
  updatedAt: string;
}

interface RedisAttestation {
  requestId: string;
  attestor: string;
  signature: string;
  signedDigest: string;
  merkleProof: string[];
  leaf: string;
  createdAt: number;
}

interface RedisProofJob {
  requestId: string;
  policyId: string;
  status: string;
  attemptCount: number;
  lastTxHash?: string;
  lastError?: string;
  updatedAt: number;
}

const pub = makePublicClient();
const redis = makeRedis();
const addrs = contractAddresses();

console.log(chalk.bold.cyan('\n╔══════════════════════════════════════╗'));
console.log(chalk.bold.cyan('║  Eudemonia · Audit Dashboard          ║'));
console.log(chalk.bold.cyan('╚══════════════════════════════════════╝\n'));
console.log(chalk.dim(`  Request ID: ${requestId}\n`));

const sp = ora(chalk.yellow('Collecting audit data from indexer + Redis…')).start();

let gqlRequest: GqlRequest | null = null;
try {
  const data = await gqlQuery<{ reqs: GqlRequest[] }>(
    `query AuditRequest($id: numeric!) {
      reqs: IssuanceRequest(where: { requestIdentifier: { _eq: $id } }, limit: 1) {
        id requestIdentifier parametersHash issuer subject beneficiary
        assetIdentifier amount privacyMode status expiryTimestamp documentationHash
      }
    }`,
    { id: requestId.toString() },
  );
  gqlRequest = data.reqs?.[0] ?? null;
} catch {
  /* fall back to on-chain read */
}

let onchainStatus: number | null = null;
let onchainPrivacy: number | null = null;
let onchainParametersHash: string | null = null;
let onchainAsset: bigint | null = null;
try {
  const req = await pub.readContract({
    address: addrs.issuanceRegistry,
    abi: issuanceRegistryAbi,
    functionName: 'getRequest',
    args: [requestId],
  });
  onchainStatus = req.status;
  onchainPrivacy = req.privacyMode;
  onchainParametersHash = req.parametersHash;
  onchainAsset = req.assetIdentifier;
} catch {
  /* non-critical */
}

let gqlJob: GqlProofJob | null = null;
try {
  const data = await gqlQuery<{ jobs: GqlProofJob[] }>(
    `query AuditProofJob($id: numeric!) {
      jobs: ProofJob(where: { requestIdentifier: { _eq: $id } }, limit: 1) {
        id requestIdentifier policyIdentifier status attemptCount updatedAt
      }
    }`,
    { id: requestId.toString() },
  );
  gqlJob = data.jobs?.[0] ?? null;
} catch {
  /* non-critical */
}

let redisJob: RedisProofJob | null = null;
try {
  const raw = await redis.get(`proofjob:request:${requestId}`);
  if (raw) redisJob = JSON.parse(raw) as RedisProofJob;
} catch {
  /* non-critical */
}

const attestations: RedisAttestation[] = [];
try {
  const keys = await (async () => {
    const all: string[] = [];
    let cursor = '0';
    do {
      const [next, page] = await redis.scan(
        cursor,
        'MATCH',
        `attestation:request:${requestId}:attestor:*`,
        'COUNT',
        '100',
      );
      cursor = next;
      all.push(...page);
    } while (cursor !== '0');
    return all;
  })();

  for (const key of keys) {
    const raw = await redis.get(key);
    if (raw) attestations.push(JSON.parse(raw) as RedisAttestation);
  }
} catch {
  /* non-critical */
}

const policyId = redisJob?.policyId ?? gqlJob?.policyIdentifier ?? null;
let policyDef: Record<string, unknown> | null = null;
let onchainPolicyHash: string | null = null;

if (policyId) {
  try {
    const raw = await redis.get(`policy:def:${policyId}`);
    if (raw) policyDef = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    /* non-critical */
  }

  try {
    const policy = (await pub.readContract({
      address: addrs.policyRegistry,
      abi: policyRegistryAbi,
      functionName: 'getPolicy' as never,
      args: [BigInt(policyId)],
    })) as {
      policyHash: string;
      attestorSetRoot: string;
      attestorThreshold: bigint;
      status: number;
    };
    onchainPolicyHash = policy.policyHash;
  } catch {
    /* non-critical */
  }
}

sp.succeed(chalk.green('Audit data collected'));
console.log();

const sep = chalk.dim('─'.repeat(60));

console.log(chalk.bold.white('REQUEST') + chalk.dim(`  #${requestId}`));
console.log(sep);

if (gqlRequest || onchainParametersHash) {
  const mode =
    gqlRequest?.privacyMode ?? (onchainPrivacy !== null ? PRIVACY_LABEL[onchainPrivacy] : '—');
  const status =
    gqlRequest?.status ??
    (onchainStatus !== null ? (REQUEST_STATUS_LABEL[onchainStatus] ?? String(onchainStatus)) : '—');
  const pHash = gqlRequest?.parametersHash ?? onchainParametersHash ?? '—';
  const issuer = gqlRequest?.issuer ?? '—';
  const subject = gqlRequest?.subject ?? '—';
  const amount = gqlRequest?.amount ?? '—';
  const asset = gqlRequest?.assetIdentifier ?? String(onchainAsset ?? '—');

  console.log(chalk.dim('  parametersHash  ') + pHash);
  console.log(chalk.dim('  issuer          ') + issuer);
  console.log(chalk.dim('  subject         ') + subject);
  console.log(chalk.dim('  asset           ') + asset);
  console.log(chalk.dim('  amount          ') + amount);
  console.log(chalk.bold('  privacy         ') + chalk.cyan(mode));
  console.log(
    chalk.bold('  status          ') +
      (status === 'CONSUMED' ? chalk.green(status) : chalk.yellow(status)),
  );
} else {
  console.log(chalk.dim('  (request not yet indexed)'));
}
console.log();

console.log(chalk.bold.white('POLICY') + chalk.dim(policyId ? `  #${policyId}` : '  (unknown)'));
console.log(sep);

if (policyDef || onchainPolicyHash) {
  console.log(
    chalk.dim('  policyHash      ') + (onchainPolicyHash ?? String(policyDef?.policyHash ?? '—')),
  );
  console.log(chalk.dim('  attestorRoot    ') + String(policyDef?.attestorSetRoot ?? '—'));
  console.log(chalk.dim('  threshold       ') + String(policyDef?.attestorThreshold ?? '—'));
  console.log(chalk.dim('  requiredChecks  ') + JSON.stringify(policyDef?.requiredChecks ?? ['—']));
} else {
  console.log(chalk.dim('  (policy definition not found in Redis)'));
}
console.log();

console.log(
  chalk.bold.white('ATTESTATION(S)') + chalk.dim(`  ${attestations.length} found in Redis`),
);
console.log(sep);

if (attestations.length > 0) {
  for (const attest of attestations) {
    const ts = new Date(attest.createdAt).toISOString();
    console.log(chalk.dim('  attestor        ') + attest.attestor);
    console.log(chalk.dim('  signedDigest    ') + attest.signedDigest);
    console.log(chalk.dim('  signature       ') + attest.signature.slice(0, 22) + '…');
    console.log(chalk.dim('  leaf            ') + attest.leaf);
    console.log(
      chalk.dim('  merkleProof     ') +
        (attest.merkleProof.length === 0
          ? '[] (single-attestor tree)'
          : JSON.stringify(attest.merkleProof)),
    );
    console.log(chalk.dim('  createdAt       ') + ts);
    console.log();
  }
} else {
  console.log(chalk.yellow('  No attestations found in Redis.'));
  console.log(chalk.dim('  Run 03-attest.ts to create one.'));
  console.log();
}

const jobStatus = redisJob?.status ?? gqlJob?.status ?? 'NOT_FOUND';
const jobAttempts = redisJob?.attemptCount ?? gqlJob?.attemptCount ?? 0;
const txHash = redisJob?.lastTxHash;

console.log(chalk.bold.white('PROOF JOB') + chalk.dim(`  request #${requestId}`));
console.log(sep);
console.log(
  chalk.dim('  status          ') +
    (jobStatus === 'COMPLETED'
      ? chalk.bold.green(jobStatus)
      : jobStatus === 'DEAD_LETTER'
        ? chalk.bold.red(jobStatus)
        : chalk.yellow(jobStatus)),
);
console.log(chalk.dim('  attempts        ') + jobAttempts);
if (policyId) console.log(chalk.dim('  policyId        ') + policyId);
if (txHash) console.log(chalk.dim('  executionTx     ') + chalk.cyan(txHash));
if (redisJob?.lastError)
  console.log(chalk.dim('  lastError       ') + chalk.red(redisJob.lastError));
console.log();

const subject = gqlRequest?.subject ?? null;
if (subject) {
  const checkKeys: string[] = [];
  try {
    let cursor = '0';
    do {
      const [next, page] = await redis.scan(
        cursor,
        'MATCH',
        `compliance:subject:${subject.toLowerCase()}:check:*`,
        'COUNT',
        '100',
      );
      cursor = next;
      checkKeys.push(...page);
    } while (cursor !== '0');
  } catch {
    /* non-critical */
  }

  if (checkKeys.length > 0) {
    console.log(chalk.bold.white('COMPLIANCE CHECKS') + chalk.dim(`  subject ${subject}`));
    console.log(sep);
    for (const key of checkKeys) {
      try {
        const raw = await redis.get(key);
        if (!raw) continue;
        const check = JSON.parse(raw) as {
          checkId: string;
          passed: boolean;
          observedAt: number;
          digest: string;
        };
        const age = Math.round(Date.now() / 1000 - check.observedAt);
        console.log(
          chalk.dim(`  ${check.checkId.padEnd(18)}`) +
            (check.passed ? chalk.green('PASS') : chalk.red('FAIL')) +
            chalk.dim(`  age=${age}s  digest=${check.digest.slice(0, 14)}…`),
        );
      } catch {
        /* non-critical */
      }
    }
    console.log();
  }
}

await redis.quit();

console.log(sep);
console.log();

if (jobStatus === 'COMPLETED' && txHash) {
  console.log(chalk.bold.green('  ✔ Proof is on-chain. Compliance data is not.'));
  console.log();
  console.log(chalk.dim('  The SP1 ZK proof commits to the parameters hash and policy hash.'));
  console.log(chalk.dim('  Regulators can verify the proof on-chain without seeing the data.'));
  console.log(chalk.dim(`  Execution tx: ${txHash}`));
} else if (jobStatus === 'PENDING' || jobStatus === 'RUNNING' || jobStatus === 'RETRY') {
  console.log(chalk.yellow('  ⏳ Proof is being generated. Run 04-status.ts to watch progress.'));
} else if (attestations.length === 0) {
  console.log(chalk.yellow('  ⚠  No attestation found. Run 03-attest.ts to sign the request.'));
} else {
  console.log(chalk.dim(`  Job status: ${jobStatus}. Run 04-status.ts for live updates.`));
}
console.log();
