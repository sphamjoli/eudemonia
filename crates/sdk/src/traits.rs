use crate::error::ProofError;

/// Trait for witness types that can deterministically derive hash commitments.
pub trait WitnessHashing {
    /// Recomputes the canonical request commitment (`parametersHash`).
    fn parameters_hash(&self) -> Result<[u8; 32], ProofError>;

    /// Recomputes the canonical policy commitment (`policyHash`).
    fn policy_hash(&self) -> Result<[u8; 32], ProofError>;
}

/// Trait for values that can be serialized to EVM ABI-compatible public values bytes.
pub trait PublicValuesEncoding {
    /// Encodes fields to the canonical 64-byte payload (`parametersHash || policyHash`).
    fn to_abi_public_values(&self) -> Result<Vec<u8>, ProofError>;
}
