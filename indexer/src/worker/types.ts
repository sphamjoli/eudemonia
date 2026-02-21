/** Hex string constrained to a `0x`-prefixed value. */
export type Hex = `0x${string}`;

/** Lifecycle state for a proof job managed by the worker. */
export type ProofJobLifecycleStatus = 'PENDING' | 'RUNNING' | 'RETRY' | 'COMPLETED' | 'DEAD_LETTER';

/** Mode-aware privacy selection mirrored from `IIssuanceRegistry.PrivacyMode`. */
export type PrivacyMode = 'NONE' | 'DESTINATION_PRIVATE' | 'AMOUNT_PRIVATE' | 'FULL_PRIVATE';

/**
 * Shared metadata for all Redis-backed records used by the worker.
 * These fields provide schema evolution support and auditability.
 */
export interface BaseRedisRecord {
  /** Schema version for backward-compatible record decoding. */
  schemaVersion: number;
  /** Origin of the record payload (service/component name). */
  source: string;
  /** Record creation timestamp in milliseconds since Unix epoch. */
  createdAt: number;
  /** Last update timestamp in milliseconds since Unix epoch. */
  updatedAt: number;
}

/** Policy material consumed by witness construction and SP1 proving. */
export interface PolicyDefinitionRecord extends BaseRedisRecord {
  /** Policy identifier, aligned with onchain `policyIdentifier`. */
  policyId: string;
  /** Canonical policy hash committed onchain. */
  policyHash: Hex;
  /** Full preimage used to recompute `policyHash` in the prover. */
  policyPreimage: Hex;
  /** Merkle root of authorized attestor addresses. */
  attestorSetRoot: Hex;
  /** Minimum distinct valid attestors required for approval. */
  attestorThreshold: number;
  /** Policy activation timestamp (seconds since Unix epoch). */
  validFromTimestamp: number;
  /** Policy expiry timestamp (0 means no expiry). */
  validUntilTimestamp: number;
  /** Policy template version used by proof logic. */
  templateVersion: string;
  /** Required check IDs that must be present and passing. */
  requiredChecks: string[];
  /** Maximum allowed age (seconds) for each required check. */
  freshnessWindows: Record<string, number>;
  /** Domain separator used for attestation digest derivation. */
  domainSeparator: Hex;
}

/** Per-subject compliance check persisted in Redis. */
export interface CheckRecord extends BaseRedisRecord {
  /** Stable subject key (for example offchain worker id or subject address). */
  subjectId: string;
  /** Logical check id (for example `KYC_PASS`). */
  checkId: string;
  /** Whether the check passed at evaluation time. */
  passed: boolean;
  /** Check observation timestamp in seconds since Unix epoch. */
  observedAt: number;
  /** Deterministic digest committed into witness inputs. */
  digest: Hex;
  /** Hash of the full provider payload used to derive `digest`. */
  payloadHash: Hex;
}

/** Attestor signature + membership material for one request. */
export interface AttestationRecord extends BaseRedisRecord {
  /** Request identifier this attestation belongs to. */
  requestId: string;
  /** Attestor address that signed approval material. */
  attestor: Hex;
  /** ECDSA signature bytes (`r||s||v`) encoded as hex. */
  signature: Hex;
  /** Digest that was signed by the attestor. */
  signedDigest: Hex;
  /** Merkle proof nodes proving attestor membership. */
  merkleProof: Hex[];
  /** Merkle leaf hash corresponding to the attestor. */
  leaf: Hex;
}

/** Durable worker-side state for retry and idempotency control. */
export interface ProofJobState extends BaseRedisRecord {
  /** Issuance request identifier being processed. */
  requestId: string;
  /** Policy identifier used by the job. */
  policyId: string;
  /** Current lifecycle status of the job. */
  status: ProofJobLifecycleStatus;
  /** Number of attempts executed so far. */
  attemptCount: number;
  /** Earliest timestamp in ms when another attempt is allowed. */
  nextAttemptAt: number;
  /** Last error message associated with the job. */
  lastError?: string;
  /** Worker instance currently holding the distributed lock. */
  lockOwner?: string;
  /** Lock acquisition time in milliseconds since Unix epoch. */
  lockedAt?: number;
  /** Last successful execution transaction hash, when available. */
  lastTxHash?: Hex;
}

/** Indexed proof job row fetched from the Envio GraphQL API. */
export interface IndexedProofJob {
  /** Stable primary key from indexer storage. */
  id: string;
  /** Issuance request identifier represented as stringified bigint. */
  requestIdentifier: string;
  /** Policy identifier represented as stringified bigint. */
  policyIdentifier: string;
  /** Job lifecycle status as tracked in indexer state. */
  status: ProofJobLifecycleStatus;
  /** Attempt count mirrored from indexer state. */
  attemptCount: number;
  /** Next attempt timestamp represented as stringified bigint. */
  nextAttemptAt: string;
  /** Last update timestamp represented as stringified bigint. */
  updatedAt: string;
}

/** Indexed issuance request row used by the worker for proving. */
export interface IndexedIssuanceRequest {
  /** Stable primary key (same as `requestIdentifier` string). */
  id: string;
  /** Onchain request identifier represented as stringified bigint. */
  requestIdentifier: string;
  /** Request parameter commitment stored in registry. */
  parametersHash: Hex;
  /** Issuer address that created the request. */
  issuer: Hex;
  /** Subject address bound to worker context and privacy profile. */
  subject: Hex;
  /** Public beneficiary address (`0x0...0` when destination is private). */
  beneficiary: Hex;
  /** Asset identifier represented as stringified bigint. */
  assetIdentifier: string;
  /** Requested public amount represented as stringified bigint. */
  amount: string;
  /** Amount commitment for private amount modes. */
  amountCommitment: Hex;
  /** Destination commitment for private destination modes. */
  destinationCommitment: Hex;
  /** Payload commitment for private modes. */
  payloadHash: Hex;
  /** Expiry timestamp represented as stringified bigint. */
  expiryTimestamp: string;
  /** Hash pointer to offchain documentation. */
  documentationHash: Hex;
  /** Request privacy mode bound in issuance registry. */
  privacyMode: PrivacyMode;
  /** Hash commitment to worker privacy configuration snapshot. */
  privacyContextHash: Hex;
  /** Current lifecycle status from indexed contract events. */
  status: 'NONE' | 'REQUESTED' | 'CONSUMED' | 'CANCELLED';
}

/** Indexed policy row used for policy selection and verification. */
export interface IndexedPolicy {
  /** Stable primary key (same as `policyIdentifier` string). */
  id: string;
  /** Onchain policy identifier represented as stringified bigint. */
  policyIdentifier: string;
  /** Policy commitment currently tracked onchain. */
  policyHash: Hex;
  /** Merkle root of authorized attestors. */
  attestorSetRoot: Hex;
  /** Required threshold represented as stringified bigint. */
  attestorThreshold: string;
  /** Policy valid-from timestamp represented as stringified bigint. */
  validFromTimestamp: string;
  /** Policy valid-until timestamp represented as stringified bigint. */
  validUntilTimestamp: string;
  /** Whether transparent mode is allowed. */
  allowNone: boolean;
  /** Whether destination-private mode is allowed. */
  allowDestinationPrivate: boolean;
  /** Whether amount-private mode is allowed. */
  allowAmountPrivate: boolean;
  /** Whether full-private mode is allowed. */
  allowFullPrivate: boolean;
  /** Whether per-issuance privacy override is allowed by policy. */
  allowPerIssuanceOverride: boolean;
  /** Whether worker privacy updates are allowed under policy governance. */
  allowConfigurationUpdates: boolean;
  /** Policy privacy schema version. */
  privacySchemaVersion: number;
  /** Lifecycle status from policy registry events. */
  status: 'NONE' | 'ACTIVE' | 'DEPRECATED';
  /** Whether this policy is the currently active selection. */
  isActive: boolean;
}

/** Canonical witness payload provided to the Rust prover. */
export interface WorkerWitnessInput {
  /** Issuance request identifier bound into the proof. */
  request_identifier: string;
  /** Policy identifier bound into the proof. */
  policy_identifier: string;
  /** Chain id used in request hash recomputation. */
  chain_id: string;
  /** Issuance registry address used for domain separation. */
  issuance_registry: Hex;
  /** Request fields used for parameters hash recomputation. */
  request: {
    /** Asset identifier represented as stringified bigint. */
    asset_identifier: string;
    /** Public amount represented as stringified bigint. */
    amount: string;
    /** Public beneficiary address. */
    beneficiary: Hex;
    /** Amount commitment for private amount modes. */
    amount_commitment: Hex;
    /** Destination commitment for private destination modes. */
    destination_commitment: Hex;
    /** Payload commitment for private modes. */
    payload_hash: Hex;
    /** Expiry timestamp represented as stringified bigint. */
    expiry_timestamp: string;
    /** Documentation hash bound to the request. */
    documentation_hash: Hex;
    /** Issuer address that created the request. */
    issuer: Hex;
    /** Subject address bound to this request. */
    subject: Hex;
    /** Numeric privacy mode aligned with solidity enum value. */
    privacy_mode: number;
    /** Privacy profile context hash bound to the request. */
    privacy_context_hash: Hex;
    /** Expected onchain parameters hash to match. */
    parameters_hash: Hex;
  };
  /** Policy fields used for policy hash and rule checks. */
  policy: {
    /** Expected policy hash to match. */
    policy_hash: Hex;
    /** Policy preimage used to recompute `policyHash`. */
    policy_preimage: Hex;
    /** Authorized attestor merkle root. */
    attestor_set_root: Hex;
    /** Minimum required unique valid attestations. */
    attestor_threshold: number;
    /** Policy valid-from timestamp (seconds). */
    valid_from_timestamp: number;
    /** Policy valid-until timestamp (seconds). */
    valid_until_timestamp: number;
    /** Required check ids to enforce. */
    required_checks: string[];
    /** Maximum allowed check age by check id (seconds). */
    freshness_windows: Record<string, number>;
  };
  /** Attestation witnesses used for signature + membership checks. */
  attestations: Array<{
    /** Attestor address that signed this attestation. */
    attestor: Hex;
    /** Signature bytes (`r||s||v`) as hex string. */
    signature: Hex;
    /** Digest that the attestor signed. */
    signed_digest: Hex;
    /** Merkle proof nodes for attestor membership. */
    merkle_proof: Hex[];
    /** Merkle leaf hash corresponding to the attestor. */
    leaf: Hex;
  }>;
  /** Compliance checks consumed by proof policy logic. */
  checks: Array<{
    /** Logical check id (for example `KYC_PASS`). */
    check_id: string;
    /** Pass/fail result for this check. */
    passed: boolean;
    /** Observation timestamp (seconds since Unix epoch). */
    observed_at: number;
    /** Deterministic digest for this check input. */
    digest: Hex;
  }>;
  /** Timestamp used by the prover for validity/freshness assertions. */
  current_timestamp: number;
}
