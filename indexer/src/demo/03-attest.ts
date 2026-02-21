#!/usr/bin/env bun
import 'dotenv/config';
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { type Address, type Hex } from 'viem';
import {
  makePublicClient,
  makeWalletClient,
  makeRedis,
  contractAddresses,
  issuanceRegistryAbi,
  attestorLeaf,
  singleAttestorRoot,
  PRIVACY_LABEL,
  REQUEST_STATUS_LABEL,
} from './shared.js';

const program = new Command();
program
  .name('demo-attest')
  .description('Attestor: sign the request parametersHash and store attestation in Redis')
  .requiredOption('--attestor-key <hex>', 'Private key of the attestor wallet')
  .requiredOption('--request-id <n>', 'Issuance request identifier')
  .parse();

const opts = program.opts<{
  attestorKey: string;
  requestId: string;
}>();

function parseRequestId(raw: string): bigint {
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) return BigInt(trimmed);
  const fallback = trimmed.match(/\d+/)?.[0];
  if (!fallback) throw new Error(`Invalid request id: ${raw}`);
  return BigInt(fallback);
}

const attestorKey = opts.attestorKey as Hex;
const requestId = parseRequestId(opts.requestId);

const pub = makePublicClient();
const { account } = makeWalletClient(attestorKey);
const attestor = account.address as Address;
const addrs = contractAddresses();
const redis = makeRedis();

console.log(chalk.bold.cyan('\n╔══════════════════════════════════════╗'));
console.log(chalk.bold.cyan('║  Eudemonia · Attestation              ║'));
console.log(chalk.bold.cyan('╚══════════════════════════════════════╝\n'));
console.log(chalk.dim(`  Attestor:   ${attestor}`));
console.log(chalk.dim(`  Request ID: ${requestId}`));
console.log();

let parametersHash: Hex;
{
  const sp = ora(chalk.yellow(`Fetching request #${requestId} from chain…`)).start();
  try {
    const req = await pub.readContract({
      address: addrs.issuanceRegistry,
      abi: issuanceRegistryAbi,
      functionName: 'getRequest',
      args: [requestId],
    });

    parametersHash = req.parametersHash as Hex;

    sp.succeed(chalk.green(`Request #${requestId} fetched`));
    console.log(chalk.dim(`    parametersHash: ${parametersHash}`));
    console.log(chalk.dim(`    issuer:         ${req.issuer}`));
    console.log(chalk.dim(`    subject:        ${req.subject}`));
    console.log(chalk.dim(`    amount:         ${req.amount.toLocaleString()}`));
    console.log(
      chalk.dim(`    privacyMode:    ${PRIVACY_LABEL[req.privacyMode] ?? req.privacyMode}`),
    );
    console.log(chalk.dim(`    status:         ${REQUEST_STATUS_LABEL[req.status] ?? req.status}`));
    console.log();
  } catch (err) {
    sp.fail(chalk.red(`Failed: ${String(err)}`));
    process.exit(1);
  }
}

const signedDigest = parametersHash;

let signature: Hex;
{
  const sp = ora(chalk.yellow('Signing attestation digest with attestor key…')).start();
  try {
    signature = await account.sign({ hash: signedDigest });
    sp.succeed(chalk.green('Attestation signed') + chalk.dim(`  sig: ${signature.slice(0, 18)}…`));
  } catch (err) {
    sp.fail(chalk.red(`Failed: ${String(err)}`));
    process.exit(1);
  }
}

const leaf = attestorLeaf(attestor);
const merkleProof: Hex[] = [];
const computedRoot = singleAttestorRoot(attestor);

console.log(chalk.dim(`    Merkle leaf:  ${leaf}`));
console.log(chalk.dim(`    Merkle root:  ${computedRoot}`));
console.log(chalk.dim(`    Proof nodes:  [] (single-attestor tree)`));
console.log();

{
  const sp = ora(chalk.yellow('Storing attestation record in Redis…')).start();
  try {
    const now = Date.now();
    const redisKey = `attestation:request:${requestId}:attestor:${attestor.toLowerCase()}`;

    const attestationRecord = {
      schemaVersion: 1,
      source: 'demo-attest',
      createdAt: now,
      updatedAt: now,
      requestId: requestId.toString(),
      attestor: attestor.toLowerCase() as Hex,
      signature,
      signedDigest,
      merkleProof,
      leaf,
    };

    await redis.set(redisKey, JSON.stringify(attestationRecord));

    sp.succeed(chalk.green('Attestation stored in Redis') + chalk.dim(`  key: ${redisKey}`));
  } catch (err) {
    sp.fail(chalk.red(`Failed: ${String(err)}`));
    process.exit(1);
  }
}

await redis.quit();

console.log();
console.log(chalk.bold.green('✔ Attestation complete'));
console.log(
  chalk.dim(`  The worker will pick up request #${requestId} on its next scheduling cycle.`),
);
console.log(chalk.dim(`  Run 04-status.ts to watch proof progress: --request-id ${requestId}`));
console.log();
