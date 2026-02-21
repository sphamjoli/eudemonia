import type { Hex } from 'viem';
import type {
  AttestationRecord,
  CheckRecord,
  IndexedIssuanceRequest,
  IndexedPolicy,
  PolicyDefinitionRecord,
  PrivacyMode,
  WorkerWitnessInput,
} from './types.js';

/**
 * Normalizes a possibly mixed-case hex string to lowercase.
 *
 * @param value Input hex string.
 * @returns Lowercased hex value typed as `Hex`.
 */
export function toHex(value: string): Hex {
  return value.toLowerCase() as Hex;
}

/**
 * Resolves subject id for Redis compliance lookup from a request row.
 *
 * @param request Indexed issuance request.
 * @returns Subject id used in Redis compliance keys.
 */
export function subjectIdFromRequest(request: IndexedIssuanceRequest): string {
  return request.subject.toLowerCase();
}

/**
 * Converts privacy mode label to the solidity enum integer.
 *
 * @param mode Privacy mode from indexer schema.
 * @returns Solidity enum value as number.
 */
function privacyModeToEnumValue(mode: PrivacyMode): number {
  if (mode === 'DESTINATION_PRIVATE') return 1;
  if (mode === 'AMOUNT_PRIVATE') return 2;
  if (mode === 'FULL_PRIVATE') return 3;
  return 0;
}

/**
 * Guards witness construction against policy hash drift between sources.
 *
 * @param policy Indexed onchain policy.
 * @param policyDefinition Redis policy definition record.
 * @throws Error when hashes differ.
 */
export function validatePolicyDefinition(
  policy: IndexedPolicy,
  policyDefinition: PolicyDefinitionRecord,
): void {
  if (policyDefinition.policyHash.toLowerCase() !== policy.policyHash.toLowerCase()) {
    throw new Error(
      `Policy hash mismatch between indexer policy(${policy.policyHash}) and redis policy definition(${policyDefinition.policyHash})`,
    );
  }
}

/**
 * Builds canonical witness input consumed by the Rust prover.
 *
 * @param args Witness construction dependencies.
 * `args.request`: Indexed request state.
 * `args.policy`: Indexed policy state.
 * `args.policyDefinition`: Redis policy definition.
 * `args.attestations`: Redis attestation records.
 * `args.checks`: Redis compliance check records.
 * `args.chainId`: Chain id for request hash recomputation.
 * `args.issuanceRegistryAddress`: Registry address for domain separation.
 * `args.currentTimestamp`: Current timestamp in seconds.
 * @returns Canonical `WorkerWitnessInput` object.
 * @throws Error when required checks are missing or hashes mismatch.
 */
export function buildWitnessInput(args: {
  request: IndexedIssuanceRequest;
  policy: IndexedPolicy;
  policyDefinition: PolicyDefinitionRecord;
  attestations: AttestationRecord[];
  checks: CheckRecord[];
  chainId: number;
  issuanceRegistryAddress: Hex;
  currentTimestamp: number;
}): WorkerWitnessInput {
  const {
    request,
    policy,
    policyDefinition,
    attestations,
    checks,
    chainId,
    issuanceRegistryAddress,
  } = args;

  validatePolicyDefinition(policy, policyDefinition);

  const checkMap = new Map(checks.map((check) => [check.checkId, check]));
  for (const requiredCheck of policyDefinition.requiredChecks) {
    if (!checkMap.has(requiredCheck)) {
      throw new Error(
        `Missing required check '${requiredCheck}' for request ${request.requestIdentifier}`,
      );
    }
  }

  return {
    request_identifier: request.requestIdentifier,
    policy_identifier: policy.policyIdentifier,
    chain_id: chainId.toString(),
    issuance_registry: issuanceRegistryAddress,
    request: {
      asset_identifier: request.assetIdentifier,
      amount: request.amount,
      beneficiary: toHex(request.beneficiary),
      amount_commitment: toHex(request.amountCommitment),
      destination_commitment: toHex(request.destinationCommitment),
      payload_hash: toHex(request.payloadHash),
      expiry_timestamp: request.expiryTimestamp,
      documentation_hash: toHex(request.documentationHash),
      issuer: toHex(request.issuer),
      subject: toHex(request.subject),
      privacy_mode: privacyModeToEnumValue(request.privacyMode),
      privacy_context_hash: toHex(request.privacyContextHash),
      parameters_hash: toHex(request.parametersHash),
    },
    policy: {
      policy_hash: toHex(policy.policyHash),
      policy_preimage: toHex(policyDefinition.policyPreimage),
      attestor_set_root: toHex(policy.attestorSetRoot),
      attestor_threshold: Number(policy.attestorThreshold),
      valid_from_timestamp: Number(policy.validFromTimestamp),
      valid_until_timestamp: Number(policy.validUntilTimestamp),
      required_checks: policyDefinition.requiredChecks,
      freshness_windows: policyDefinition.freshnessWindows,
    },
    attestations: attestations.map((attestation) => ({
      attestor: toHex(attestation.attestor),
      signature: toHex(attestation.signature),
      signed_digest: toHex(attestation.signedDigest),
      merkle_proof: attestation.merkleProof.map((node) => toHex(node)),
      leaf: toHex(attestation.leaf),
    })),
    checks: checks.map((check) => ({
      check_id: check.checkId,
      passed: check.passed,
      observed_at: check.observedAt,
      digest: toHex(check.digest),
    })),
    current_timestamp: args.currentTimestamp,
  };
}
