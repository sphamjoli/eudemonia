import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import type { Hex } from 'viem';
import type { WorkerConfig } from './config.js';
import type { WorkerWitnessInput } from './types.js';

/**
 * Executes a shell command and waits for completion.
 *
 * @param command Command string to execute.
 * @returns Promise resolved on zero exit status.
 * @throws Error when process exits non-zero.
 */
function exec(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('sh', ['-lc', command], {
      stdio: 'inherit',
      env: process.env,
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Command failed with exit code ${String(code)}: ${command}`));
    });
  });
}

/**
 * Converts file contents to hex output expected by chain submit.
 *
 * @param contents File buffer or string.
 * @returns `0x`-prefixed hex string.
 */
function asHex(contents: Buffer | string): Hex {
  const text = typeof contents === 'string' ? contents.trim() : contents.toString('utf8').trim();
  if (text.startsWith('0x')) return text as Hex;
  return `0x${Buffer.from(contents).toString('hex')}` as Hex;
}

/**
 * Replaces command template variables (`{key}`) with values.
 *
 * @param template Command template string.
 * @param values Key-value substitutions.
 * @returns Rendered command string.
 */
function replaceTemplate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, value),
    template,
  );
}

/**
 * Runs the prover CLI end-to-end for a witness payload.
 *
 * @param args Prover execution parameters.
 * `args.cfg`: Worker runtime configuration.
 * `args.requestIdentifier`: Request id used for temp workspace naming.
 * `args.witness`: Canonical witness JSON payload.
 * @returns Generated public values and proof bytes as hex.
 */
export async function proveWitness(args: {
  cfg: WorkerConfig;
  requestIdentifier: string;
  witness: WorkerWitnessInput;
}): Promise<{ publicValues: Hex; proofBytes: Hex }> {
  const { cfg, requestIdentifier, witness } = args;
  if (cfg.sp1MockMode) {
    return {
      publicValues: `${witness.request.parameters_hash}${witness.policy.policy_hash.slice(2)}` as Hex,
      proofBytes: '0x01',
    };
  }
  const workingDir = await mkdtemp(join(tmpdir(), `eudemonia-sp1-${requestIdentifier}-`));
  const witnessPath = join(workingDir, 'witness.json');
  const publicValuesPath = join(workingDir, 'public_values.hex');
  const proofPath = join(workingDir, 'proof.hex');

  try {
    await writeFile(witnessPath, JSON.stringify(witness));

    const proveCommandTemplate = replaceTemplate(cfg.sp1ProveCommand, {
      witness: witnessPath,
      proof: proofPath,
      program_id: cfg.sp1ProgramId,
    });

    const command = [
      cfg.sp1ProverCmd,
      'prove',
      `--witness ${witnessPath}`,
      `--proof-out ${proofPath}`,
      `--public-values-out ${publicValuesPath}`,
      `--sp1-command "${proveCommandTemplate}"`,
      `--program-id ${cfg.sp1ProgramId}`,
    ].join(' ');

    await exec(command);

    const publicValuesRaw = await readFile(publicValuesPath);
    const proofRaw = await readFile(proofPath);

    return {
      publicValues: asHex(publicValuesRaw),
      proofBytes: asHex(proofRaw),
    };
  } finally {
    await rm(workingDir, { recursive: true, force: true });
  }
}
