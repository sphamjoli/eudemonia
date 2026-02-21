use std::collections::HashMap;

use alloy_primitives::B256;
use serde::{Deserialize, Serialize};

/// Canonical public values consumed by `TokenisationEngine`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublicValues {
    /// Request commitment (`parametersHash`) from the issuance registry.
    pub parameters_hash: String,
    /// Policy commitment (`policyHash`) from the policy registry.
    pub policy_hash: String,
}

/// Canonical witness payload used by prover/guest validation logic.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WitnessInput {
    /// Issuance request identifier.
    pub request_identifier: String,
    /// Policy identifier.
    pub policy_identifier: String,
    /// Chain id bound into parameters hash domain separation.
    pub chain_id: String,
    /// IssuanceRegistry contract address bound into parameters hash domain separation.
    pub issuance_registry: String,
    /// Request field set used to recompute `parametersHash`.
    pub request: RequestWitness,
    /// Policy field set used to recompute `policyHash` and enforce policy rules.
    pub policy: PolicyWitness,
    /// Attestation records used for signature + membership threshold verification.
    pub attestations: Vec<AttestationWitness>,
    /// Compliance checks used for required-check and freshness validation.
    pub checks: Vec<ComplianceCheckRecord>,
    /// Current timestamp (seconds since epoch) used for validity/freshness checks.
    pub current_timestamp: u64,
}

/// Issuance request values required for parameters hash recomputation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequestWitness {
    /// Asset identifier.
    pub asset_identifier: String,
    /// Public amount (`0` when amount is private).
    pub amount: String,
    /// Public beneficiary (`0x0...0` when destination is private).
    pub beneficiary: String,
    /// Commitment to private amount details.
    pub amount_commitment: String,
    /// Commitment to private destination details.
    pub destination_commitment: String,
    /// Commitment to full payment payload for private modes.
    pub payload_hash: String,
    /// Request expiry timestamp.
    pub expiry_timestamp: String,
    /// Documentation hash pointer/commitment.
    pub documentation_hash: String,
    /// Issuer address.
    pub issuer: String,
    /// Subject address bound to worker context.
    pub subject: String,
    /// Privacy mode enum value from solidity (`IIssuanceRegistry.PrivacyMode`).
    pub privacy_mode: u8,
    /// Hash commitment to privacy profile snapshot used by the request.
    pub privacy_context_hash: String,
    /// Expected onchain `parametersHash`.
    pub parameters_hash: String,
}

/// Policy values required for policy hash recomputation and rule checks.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolicyWitness {
    /// Expected onchain `policyHash`.
    pub policy_hash: String,
    /// Policy preimage bytes used to recompute `policyHash`.
    pub policy_preimage: String,
    /// Merkle root of authorized attestors.
    pub attestor_set_root: String,
    /// Minimum number of unique valid attestors.
    pub attestor_threshold: u64,
    /// Policy valid-from timestamp.
    pub valid_from_timestamp: u64,
    /// Policy valid-until timestamp (`0` means no expiry).
    pub valid_until_timestamp: u64,
    /// Required compliance check ids.
    pub required_checks: Vec<String>,
    /// Max age per check id (seconds).
    pub freshness_windows: HashMap<String, u64>,
}

/// Attestation input required for signature + membership verification.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttestationWitness {
    /// Attestor address expected to have signed `signed_digest`.
    pub attestor: String,
    /// ECDSA signature bytes (`r||s||v`).
    pub signature: String,
    /// Digest that must recover to `attestor`.
    pub signed_digest: String,
    /// Merkle proof path showing attestor membership in attestor set root.
    pub merkle_proof: Vec<String>,
    /// Merkle leaf corresponding to attestor membership.
    pub leaf: String,
}

/// One compliance check record consumed by policy rule evaluation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComplianceCheckRecord {
    /// Logical check id (for example `KYC_PASS`).
    pub check_id: String,
    /// Pass/fail result of the check.
    pub passed: bool,
    /// Timestamp when this check was last observed.
    pub observed_at: u64,
    /// Deterministic digest for the check evidence.
    pub digest: String,
}

/// Context for validating required compliance checks.
#[derive(Debug, Clone)]
pub struct ComplianceValidationContext<'a> {
    /// Compliance check rows provided in witness input.
    pub checks: &'a [ComplianceCheckRecord],
    /// Required check ids from policy.
    pub required_checks: &'a [String],
    /// Freshness windows keyed by check id.
    pub freshness_windows: &'a HashMap<String, u64>,
    /// Current timestamp used to evaluate check freshness.
    pub current_timestamp: u64,
}

/// Context for verifying attestation signatures, membership, and threshold.
#[derive(Debug, Clone)]
pub struct AttestationValidationContext<'a> {
    /// Merkle root for valid attestors.
    pub policy_root: B256,
    /// Required unique signer threshold.
    pub threshold: usize,
    /// Witness attestation rows.
    pub attestations: &'a [AttestationWitness],
}
