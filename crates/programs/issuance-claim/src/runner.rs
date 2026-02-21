use eudemonia_sp1_sdk::{
    encode_public_values, validate_witness_and_build_public_values, ProofError, WitnessInput,
};

/// Runs witness validation and encodes canonical public values.
///
/// # Arguments
/// - `witness`: [`WitnessInput`] consumed by validation and commitment derivation.
///
/// # Returns
/// - ABI-compatible 64-byte public-values payload.
///
/// # Errors
/// - [`ProofError`] if witness validation fails or public-value encoding fails.
pub fn run_witness(witness: &WitnessInput) -> Result<Vec<u8>, ProofError> {
    let public_values = validate_witness_and_build_public_values(witness)?;
    encode_public_values(&public_values)
}
