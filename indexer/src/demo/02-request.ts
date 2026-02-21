#!/usr/bin/env bun
import 'dotenv/config';
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import {
  keccak256,
  toHex,
  zeroHash,
  encodeAbiParameters,
  parseAbiParameters,
  type Address,
  type Hex,
} from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import {
  makePublicClient,
  makeWalletClient,
  contractAddresses,
  issuanceRegistryAbi,
  PRIVACY_MODE,
  PRIVACY_LABEL,
} from './shared.js';

const program = new Command();
program
  .name('demo-request')
  .description("Issuer: create an issuance request for Alice's payment")
  .requiredOption('--issuer-key <hex>', 'Private key of the issuer wallet')
  .requiredOption('--subject <address>', 'Employee (Alice) address — must hold EMPLOYEE role')
  .option('--beneficiary <address>', 'Payment destination (defaults to subject)')
  .option('--amount <n>', 'Payment amount (base units)', '5000')
  .option('--asset <n>', 'Asset identifier', '1')
  .option(
    '--privacy <mode>',
    'Privacy mode: none | dest-private | amount-private | full-private',
    'none',
  )
  .option('--expiry <timestamp>', 'Expiry unix timestamp (0 = no expiry)', '0')
  .option('--doc-ref <string>', 'Documentation reference string for audit', `DEMO:${Date.now()}`)
  .parse();

const opts = program.opts<{
  issuerKey: string;
  subject: string;
  beneficiary?: string;
  amount: string;
  asset: string;
  privacy: string;
  expiry: string;
  docRef: string;
}>();

const issuerKey = opts.issuerKey as Hex;
const subject = opts.subject as Address;
const beneficiary = (opts.beneficiary ?? opts.subject) as Address;
const amount = BigInt(opts.amount);
const asset = BigInt(opts.asset);
const privacyMode = PRIVACY_MODE[opts.privacy] ?? 0;
const expiry = BigInt(opts.expiry);
const docHash = keccak256(toHex(opts.docRef)) as Hex;
const zeroAddress = '0x0000000000000000000000000000000000000000' as Address;
const privacySeed = keccak256(
  toHex(
    `${opts.docRef}:${subject.toLowerCase()}:${beneficiary.toLowerCase()}:${amount.toString()}:${asset.toString()}:${privacyMode.toString()}`,
  ),
) as Hex;
const amountCommitment = keccak256(
  encodeAbiParameters(parseAbiParameters('bytes32,uint256,address,uint8'), [
    privacySeed,
    amount,
    subject,
    BigInt(privacyMode),
  ]),
) as Hex;
const destinationCommitment = keccak256(
  encodeAbiParameters(parseAbiParameters('bytes32,address,address,uint8'), [
    privacySeed,
    subject,
    beneficiary,
    BigInt(privacyMode),
  ]),
) as Hex;
const payloadHash = keccak256(
  encodeAbiParameters(parseAbiParameters('bytes32,bytes32,bytes32,address,uint256,uint64,uint8'), [
    privacySeed,
    amountCommitment,
    destinationCommitment,
    subject,
    asset,
    expiry,
    BigInt(privacyMode),
  ]),
) as Hex;

let requestAmount = amount;
let requestBeneficiary = beneficiary;
let requestAmountCommitment = zeroHash;
let requestDestinationCommitment = zeroHash;
let requestPayloadHash = zeroHash;

if (privacyMode !== 0) {
  requestPayloadHash = payloadHash;
}
if (privacyMode === PRIVACY_MODE['dest-private']) {
  requestBeneficiary = zeroAddress;
  requestDestinationCommitment = destinationCommitment;
}
if (privacyMode === PRIVACY_MODE['amount-private']) {
  requestAmount = 0n;
  requestAmountCommitment = amountCommitment;
}
if (privacyMode === PRIVACY_MODE['full-private']) {
  requestAmount = 0n;
  requestBeneficiary = zeroAddress;
  requestAmountCommitment = amountCommitment;
  requestDestinationCommitment = destinationCommitment;
}

const pub = makePublicClient();
const { client: wc, account } = makeWalletClient(issuerKey);
const addrs = contractAddresses();

console.log(chalk.bold.cyan('\n╔══════════════════════════════════════╗'));
console.log(chalk.bold.cyan('║  Eudemonia · Issuance Request         ║'));
console.log(chalk.bold.cyan('╚══════════════════════════════════════╝\n'));
console.log(chalk.dim(`  Issuer:       ${account.address}`));
console.log(chalk.dim(`  Subject:      ${subject}`));
console.log(chalk.dim(`  Beneficiary:  ${requestBeneficiary}`));
console.log(chalk.dim(`  Amount:       ${requestAmount.toLocaleString()}`));
console.log(chalk.dim(`  Asset:        ${asset}`));
console.log(chalk.dim(`  Privacy:      ${PRIVACY_LABEL[privacyMode]}`));
console.log(
  chalk.dim(
    `  Expiry:       ${expiry === 0n ? 'never' : new Date(Number(expiry) * 1000).toISOString()}`,
  ),
);
console.log(chalk.dim(`  DocRef hash:  ${docHash.slice(0, 18)}…`));
console.log();

let expectedId: bigint;
{
  const sp = ora(chalk.yellow('Fetching next request identifier…')).start();
  try {
    expectedId = await pub.readContract({
      address: addrs.issuanceRegistry,
      abi: issuanceRegistryAbi,
      functionName: 'nextRequestIdentifier',
    });
    sp.succeed(chalk.green(`Incoming request will be assigned ID #${expectedId}`));
  } catch (err) {
    sp.fail(chalk.red(`Failed: ${String(err)}`));
    process.exit(1);
  }
}

let requestId: bigint;
{
  const sp = ora(chalk.yellow('Submitting issuance request to IssuanceRegistry…')).start();
  try {
    const hash = await wc.writeContract({
      address: addrs.issuanceRegistry,
      abi: issuanceRegistryAbi,
      functionName: 'createIssuanceRequest',
      args: [
        {
          subject,
          assetIdentifier: asset,
          amount: requestAmount,
          beneficiary: requestBeneficiary,
          amountCommitment: requestAmountCommitment,
          destinationCommitment: requestDestinationCommitment,
          payloadHash: requestPayloadHash,
          expiryTimestamp: expiry,
          documentationHash: docHash,
          privacyMode,
        },
      ],
    });

    sp.text = chalk.yellow('Waiting for transaction receipt…');
    const receipt = await waitForTransactionReceipt(pub, { hash });

    if (receipt.status !== 'success') {
      sp.fail(chalk.red(`Transaction reverted: ${hash}`));
      process.exit(1);
    }

    requestId = expectedId;
    sp.succeed(chalk.green(`Request #${requestId} created`) + chalk.dim(`  tx: ${hash}`));
  } catch (err) {
    sp.fail(chalk.red(`Failed: ${String(err)}`));
    process.exit(1);
  }
}

{
  const sp = ora(chalk.yellow(`Verifying request #${requestId} on-chain…`)).start();
  try {
    const req = await pub.readContract({
      address: addrs.issuanceRegistry,
      abi: issuanceRegistryAbi,
      functionName: 'getRequest',
      args: [requestId],
    });

    sp.succeed(chalk.green(`Request #${requestId} confirmed on-chain`));
    console.log();
    console.log(chalk.bold('  Request details:'));
    console.log(chalk.dim(`    parametersHash: ${req.parametersHash}`));
    console.log(chalk.dim(`    issuer:         ${req.issuer}`));
    console.log(chalk.dim(`    subject:        ${req.subject}`));
    console.log(chalk.dim(`    beneficiary:    ${req.beneficiary}`));
    console.log(chalk.dim(`    amount:         ${req.amount.toLocaleString()}`));
    console.log(
      chalk.dim(`    privacyMode:    ${PRIVACY_LABEL[req.privacyMode] ?? req.privacyMode}`),
    );
    console.log(chalk.dim(`    status:         REQUESTED`));
  } catch (err) {
    sp.fail(chalk.red(`Failed to verify: ${String(err)}`));
    process.exit(1);
  }
}

console.log();
console.log(chalk.bold.green('✔ Issuance request submitted'));
console.log(chalk.dim(`  Run 03-attest.ts next with --request-id ${requestId}`));
console.log();
