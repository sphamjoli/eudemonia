import { hexToBytes } from 'viem';
import { loadWorkerConfig } from './worker/config.js';
import { proveWitness } from './worker/prover.js';
import type { WorkerWitnessInput } from './worker/types.js';

/**
 * Backward-compatible proof generation wrapper used by legacy indexer callsites.
 *
 * @param requestId Issuance request identifier.
 * @param witness Canonical witness payload for the Rust prover.
 * @returns Public values + proof bytes as `Uint8Array`.
 */
export async function generateProof(requestId: bigint, witness: WorkerWitnessInput) {
  const cfg = loadWorkerConfig();
  const { publicValues, proofBytes } = await proveWitness({
    cfg,
    requestIdentifier: requestId.toString(),
    witness,
  });

  return {
    publicValues: hexToBytes(publicValues),
    proof: hexToBytes(proofBytes),
  };
}
