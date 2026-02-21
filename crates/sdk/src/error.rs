use thiserror::Error;

/// Errors returned by witness validation, hash derivation, and public-values encoding.
#[derive(Debug, Error)]
pub enum ProofError {
    /// Hex input decoding failed.
    #[error("invalid hex value for {field}: {value}")]
    InvalidHex { field: &'static str, value: String },
    /// Address decoding failed.
    #[error("invalid address for {field}: {value}")]
    InvalidAddress { field: &'static str, value: String },
    /// Uint256 parsing failed.
    #[error("invalid uint256 for {field}: {value}")]
    InvalidUint256 { field: &'static str, value: String },
    /// Hash had unexpected byte length.
    #[error("invalid hash length for {field}; expected 32 bytes")]
    InvalidHashLength { field: &'static str },
    /// Signature bytes or recovery metadata were invalid.
    #[error("invalid signature for attestor {attestor}")]
    InvalidSignature { attestor: String },
    /// Signed digest did not match expected digest.
    #[error("attestor signature digest mismatch for {attestor}")]
    SignatureDigestMismatch { attestor: String },
    /// Recovered signer address did not match attestor.
    #[error("attestor recovery mismatch; expected {expected}, got {actual}")]
    AttestorRecoveryMismatch { expected: String, actual: String },
    /// Merkle proof did not validate against policy root.
    #[error("merkle proof verification failed for attestor {attestor}")]
    MerkleVerificationFailed { attestor: String },
    /// A required compliance check was missing from witness input.
    #[error("missing required compliance check {check_id}")]
    MissingComplianceCheck { check_id: String },
    /// A required compliance check returned `passed = false`.
    #[error("required compliance check failed {check_id}")]
    ComplianceCheckFailed { check_id: String },
    /// A required compliance check exceeded freshness window.
    #[error("required compliance check stale {check_id}")]
    ComplianceCheckStale { check_id: String },
    /// Policy validity window did not include provided timestamp.
    #[error("policy not valid at timestamp {timestamp}")]
    PolicyNotValidAt { timestamp: u64 },
    /// Unique valid attestation count did not reach threshold.
    #[error("threshold not met: expected >= {expected}, got {actual}")]
    ThresholdNotMet { expected: usize, actual: usize },
    /// Recomputed parameters hash differed from expected request commitment.
    #[error("parameters hash mismatch: expected {expected}, got {actual}")]
    ParametersHashMismatch { expected: String, actual: String },
    /// Recomputed policy hash differed from expected policy commitment.
    #[error("policy hash mismatch: expected {expected}, got {actual}")]
    PolicyHashMismatch { expected: String, actual: String },
    /// Public values byte payload was not exactly two 32-byte words.
    #[error("public values must be exactly 64 bytes")]
    InvalidPublicValuesLength,
}
