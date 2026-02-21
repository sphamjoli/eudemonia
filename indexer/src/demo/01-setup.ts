#!/usr/bin/env bun
import 'dotenv/config';
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import {
  keccak256,
  toHex,
  parseAbiParameters,
  encodeAbiParameters,
  type Address,
  type Hex,
} from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import {
  makePublicClient,
  makeWalletClient,
  makeRedis,
  contractAddresses,
  paymentRegistryAbi,
  policyRegistryAbi,
  singleAttestorRoot,
  PAYMENT_ROLE,
} from './shared.js';

const program = new Command();
program
  .name('demo-setup')
  .description('Admin: grant roles, create policy, seed Redis compliance data')
  .requiredOption('--admin-key <hex>', 'Private key of the admin wallet')
  .requiredOption('--issuer <address>', 'Address to grant ISSUER role')
  .requiredOption('--employee <address>', 'Address to grant EMPLOYEE role')
  .requiredOption('--attestor <address>', 'Attestor address (single-node Merkle tree)')
  .option('--threshold <n>', 'Attestor threshold', '1')
  .option('--checks <ids>', 'Comma-separated required check IDs', 'KYC_PASS,AML_PASS')
  .option('--freshness <seconds>', 'Freshness window for each check (seconds)', String(86400 * 365))
  .parse();

const opts = program.opts<{
  adminKey: string;
  issuer: string;
  employee: string;
  attestor: string;
  threshold: string;
  checks: string;
  freshness: string;
}>();

const adminKey = opts.adminKey as Hex;
const issuer = opts.issuer as Address;
const employee = opts.employee as Address;
const attestor = opts.attestor as Address;
const threshold = BigInt(opts.threshold);
const checkIds = opts.checks
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const freshnessSeconds = Number(opts.freshness);

const pub = makePublicClient();
const { client: wc, account } = makeWalletClient(adminKey);
const addrs = contractAddresses();
const redis = makeRedis();

console.log(chalk.bold.cyan('\n╔══════════════════════════════════════╗'));
console.log(chalk.bold.cyan('║  Eudemonia · Demo Setup               ║'));
console.log(chalk.bold.cyan('╚══════════════════════════════════════╝\n'));
console.log(chalk.dim(`  Admin:    ${account.address}`));
console.log(chalk.dim(`  Issuer:   ${issuer}`));
console.log(chalk.dim(`  Employee: ${employee}`));
console.log(chalk.dim(`  Attestor: ${attestor}`));
console.log(chalk.dim(`  Threshold: ${threshold}`));
console.log();

async function sendTx(spinner: ReturnType<typeof ora>, hash: Hex): Promise<void> {
  spinner.text = `${spinner.text.split('…')[0]} · waiting for receipt…`;
  const receipt = await waitForTransactionReceipt(pub, { hash });
  if (receipt.status !== 'success') throw new Error(`Transaction reverted: ${hash}`);
}

{
  const sp = ora(chalk.yellow(`Granting ISSUER role → ${issuer}…`)).start();
  try {
    const hasRole = await pub.readContract({
      address: addrs.paymentRegistry,
      abi: paymentRegistryAbi,
      functionName: 'hasRole',
      args: [issuer, PAYMENT_ROLE.ISSUER],
    });
    if (hasRole) {
      sp.succeed(chalk.green(`ISSUER role already granted to ${issuer}`));
    } else {
      const hash = await wc.writeContract({
        address: addrs.paymentRegistry,
        abi: paymentRegistryAbi,
        functionName: 'setParticipantRole',
        args: [issuer, PAYMENT_ROLE.ISSUER, true],
      });
      await sendTx(sp, hash);
      sp.succeed(chalk.green(`ISSUER role granted to ${issuer}`) + chalk.dim(`  tx: ${hash}`));
    }
  } catch (err) {
    sp.fail(chalk.red(`Failed: ${String(err)}`));
    process.exit(1);
  }
}

{
  const sp = ora(chalk.yellow(`Activating issuer ${issuer} in PaymentRegistry…`)).start();
  try {
    const hash = await wc.writeContract({
      address: addrs.paymentRegistry,
      abi: paymentRegistryAbi,
      functionName: 'setParticipantStatus',
      args: [issuer, true],
    });
    await sendTx(sp, hash);
    sp.succeed(chalk.green(`Issuer ${issuer} activated`) + chalk.dim(`  tx: ${hash}`));
  } catch (err) {
    sp.fail(chalk.red(`Failed: ${String(err)}`));
    process.exit(1);
  }
}

{
  const sp = ora(chalk.yellow(`Granting EMPLOYEE role → ${employee}…`)).start();
  try {
    const hasRole = await pub.readContract({
      address: addrs.paymentRegistry,
      abi: paymentRegistryAbi,
      functionName: 'hasRole',
      args: [employee, PAYMENT_ROLE.EMPLOYEE],
    });
    if (hasRole) {
      sp.succeed(chalk.green(`EMPLOYEE role already granted to ${employee}`));
    } else {
      const hash = await wc.writeContract({
        address: addrs.paymentRegistry,
        abi: paymentRegistryAbi,
        functionName: 'setParticipantRole',
        args: [employee, PAYMENT_ROLE.EMPLOYEE, true],
      });
      await sendTx(sp, hash);
      sp.succeed(chalk.green(`EMPLOYEE role granted to ${employee}`) + chalk.dim(`  tx: ${hash}`));
    }
  } catch (err) {
    sp.fail(chalk.red(`Failed: ${String(err)}`));
    process.exit(1);
  }
}

{
  const sp = ora(chalk.yellow(`Activating employee ${employee} in PaymentRegistry…`)).start();
  try {
    const hash = await wc.writeContract({
      address: addrs.paymentRegistry,
      abi: paymentRegistryAbi,
      functionName: 'setParticipantStatus',
      args: [employee, true],
    });
    await sendTx(sp, hash);
    sp.succeed(chalk.green(`Employee ${employee} activated`) + chalk.dim(`  tx: ${hash}`));
  } catch (err) {
    sp.fail(chalk.red(`Failed: ${String(err)}`));
    process.exit(1);
  }
}

let policyId: bigint;
let policyHash: Hex;
const policyPreimage = keccak256(toHex(`eudemonia-demo-policy-${Date.now()}`));

{
  const sp = ora(chalk.yellow('Creating policy in PolicyRegistry…')).start();
  try {
    policyHash = keccak256(policyPreimage);
    const attestorRoot = singleAttestorRoot(attestor);
    const validFrom = BigInt(Math.floor(Date.now() / 1000) - 60);

    const nextId = await pub.readContract({
      address: addrs.policyRegistry,
      abi: policyRegistryAbi,
      functionName: 'nextPolicyIdentifier',
    });
    policyId = nextId;

    const hash = await wc.writeContract({
      address: addrs.policyRegistry,
      abi: policyRegistryAbi,
      functionName: 'createPolicy',
      args: [
        {
          policyHash,
          attestorSetRoot: attestorRoot,
          attestorThreshold: threshold,
          validFromTimestamp: validFrom,
          validUntilTimestamp: 0n,
        },
      ],
    });
    await sendTx(sp, hash);
    sp.succeed(
      chalk.green(`Policy #${policyId} created`) +
        chalk.dim(`  hash: ${policyHash.slice(0, 18)}…  tx: ${hash}`),
    );
  } catch (err) {
    sp.fail(chalk.red(`Failed: ${String(err)}`));
    process.exit(1);
  }
}

{
  const sp = ora(chalk.yellow(`Activating policy #${policyId}…`)).start();
  try {
    const hash = await wc.writeContract({
      address: addrs.policyRegistry,
      abi: policyRegistryAbi,
      functionName: 'setActivePolicyIdentifier',
      args: [policyId],
    });
    await sendTx(sp, hash);
    sp.succeed(chalk.green(`Policy #${policyId} is now active`) + chalk.dim(`  tx: ${hash}`));
  } catch (err) {
    sp.fail(chalk.red(`Failed: ${String(err)}`));
    process.exit(1);
  }
}

{
  const sp = ora(chalk.yellow('Setting privacy constraints (all modes allowed)…')).start();
  try {
    const hash = await wc.writeContract({
      address: addrs.policyRegistry,
      abi: policyRegistryAbi,
      functionName: 'setPolicyPrivacyConstraints',
      args: [
        policyId,
        {
          allowNone: true,
          allowDestinationPrivate: true,
          allowAmountPrivate: true,
          allowFullPrivate: true,
          allowPerIssuanceOverride: true,
          allowConfigurationUpdates: true,
          schemaVersion: 1,
        },
      ],
    });
    await sendTx(sp, hash);
    sp.succeed(chalk.green('Privacy constraints set') + chalk.dim(`  tx: ${hash}`));
  } catch (err) {
    sp.fail(chalk.red(`Failed: ${String(err)}`));
    process.exit(1);
  }
}

{
  const sp = ora(
    chalk.yellow(`Seeding policy definition in Redis (policy:def:${policyId})…`),
  ).start();
  try {
    const now = Date.now();
    const validFrom = Math.floor(now / 1000) - 60;
    const freshnessWindows: Record<string, number> = {};
    for (const checkId of checkIds) {
      freshnessWindows[checkId] = freshnessSeconds;
    }

    const attestorRoot = singleAttestorRoot(attestor);
    const domainSeparator = keccak256(
      encodeAbiParameters(parseAbiParameters('string,string,uint256,address'), [
        'Eudemonia',
        '1',
        BigInt(addrs.issuanceRegistry.length > 0 ? 99999 : 99999),
        addrs.issuanceRegistry,
      ]),
    );

    const policyDef = {
      schemaVersion: 1,
      source: 'demo-setup',
      createdAt: now,
      updatedAt: now,
      policyId: policyId.toString(),
      policyHash,
      policyPreimage,
      attestorSetRoot: attestorRoot,
      attestorThreshold: Number(threshold),
      validFromTimestamp: validFrom,
      validUntilTimestamp: 0,
      templateVersion: '1',
      requiredChecks: checkIds,
      freshnessWindows,
      domainSeparator,
    };

    await redis.set(`policy:def:${policyId}`, JSON.stringify(policyDef));
    sp.succeed(chalk.green(`Policy definition seeded  policy:def:${policyId}`));
  } catch (err) {
    sp.fail(chalk.red(`Failed: ${String(err)}`));
    process.exit(1);
  }
}

{
  const sp = ora(chalk.yellow(`Seeding compliance checks for ${employee}…`)).start();
  try {
    const now = Date.now();
    const subjectId = employee.toLowerCase();

    await redis.set(
      `employee:master:${subjectId}`,
      JSON.stringify({
        schemaVersion: 1,
        source: 'demo-setup',
        createdAt: now,
        updatedAt: now,
        subjectId,
        fullName: 'Alice (Demo Employee)',
        jurisdiction: 'ZA',
        employmentStatus: 'ACTIVE',
      }),
    );

    for (const checkId of checkIds) {
      const digest = keccak256(toHex(`${subjectId}:${checkId}:PASS:${now}`));
      await redis.set(
        `compliance:subject:${subjectId}:check:${checkId}`,
        JSON.stringify({
          schemaVersion: 1,
          source: 'demo-setup',
          createdAt: now,
          updatedAt: now,
          subjectId,
          checkId,
          passed: true,
          observedAt: Math.floor(now / 1000),
          digest,
          payloadHash: digest,
        }),
      );
    }

    sp.succeed(
      chalk.green(`Seeded ${checkIds.length} compliance check(s) for ${employee}`) +
        chalk.dim(`  [${checkIds.join(', ')}]`),
    );
  } catch (err) {
    sp.fail(chalk.red(`Failed: ${String(err)}`));
    process.exit(1);
  }
}

await redis.quit();

console.log();
console.log(chalk.bold.green('✔ Setup complete'));
console.log(
  chalk.dim(
    `  Policy #${policyId}  active  threshold=${threshold}  root=${singleAttestorRoot(attestor).slice(0, 18)}…`,
  ),
);
console.log(chalk.dim(`  Run 02-request.ts next with --policy-id ${policyId}`));
console.log();
