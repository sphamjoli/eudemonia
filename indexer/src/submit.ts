import { bytesToHex } from 'viem';
import { ChainClient } from './worker/chain.js';
import { loadWorkerConfig } from './worker/config.js';

/**
 * Backward-compatible execution wrapper used by legacy indexer callsites.
 *
 * @param requestId Issuance request identifier.
 * @param policyId Policy identifier selected for verification.
 * @param publicValues ABI-encoded public values bytes.
 * @param proof SP1 proof bytes.
 * @returns Confirmed transaction hash after successful receipt.
 */
export async function submitExecution(
  requestId: bigint,
  policyId: bigint,
  publicValues: Uint8Array,
  proof: Uint8Array,
) {
  const cfg = loadWorkerConfig();
  const chain = new ChainClient(cfg);

  return chain.submitExecution({
    requestIdentifier: requestId,
    policyIdentifier: policyId,
    publicValues: bytesToHex(publicValues),
    proofBytes: bytesToHex(proof),
  });
}
