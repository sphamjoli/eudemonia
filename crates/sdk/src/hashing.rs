use alloy_primitives::{keccak256, U256};
use alloy_sol_types::SolValue;

use crate::error::ProofError;
use crate::primitives::{parse_address, parse_hash32, parse_hex_bytes, parse_u256};
use crate::traits::WitnessHashing;
use crate::types::WitnessInput;

/// Recomputes `parametersHash` using Solidity ABI encoding semantics.
///
/// # Arguments
/// - `witness`: [`WitnessInput`] containing request parameters and domain-separation fields.
///
/// # Returns
/// - 32-byte `parametersHash` commitment.
///
/// # Errors
/// - [`ProofError`] when any required witness field cannot be parsed.
pub fn compute_parameters_hash(witness: &WitnessInput) -> Result<[u8; 32], ProofError> {
    let encoded = (
        parse_u256("asset_identifier", &witness.request.asset_identifier)?,
        parse_u256("amount", &witness.request.amount)?,
        parse_address("beneficiary", &witness.request.beneficiary)?,
        parse_hash32("amount_commitment", &witness.request.amount_commitment)?,
        parse_hash32(
            "destination_commitment",
            &witness.request.destination_commitment,
        )?,
        parse_hash32("payload_hash", &witness.request.payload_hash)?,
        parse_u256("expiry_timestamp", &witness.request.expiry_timestamp)?,
        parse_hash32("documentation_hash", &witness.request.documentation_hash)?,
        parse_address("issuer", &witness.request.issuer)?,
        parse_address("subject", &witness.request.subject)?,
        U256::from(witness.request.privacy_mode),
        parse_hash32(
            "privacy_context_hash",
            &witness.request.privacy_context_hash,
        )?,
        parse_u256("chain_id", &witness.chain_id)?,
        parse_address("issuance_registry", &witness.issuance_registry)?,
    )
        .abi_encode();

    Ok(keccak256(&encoded).0)
}

/// Recomputes `policyHash` from policy preimage bytes.
///
/// # Arguments
/// - `witness`: [`WitnessInput`] containing `policy.policy_preimage`.
///
/// # Returns
/// - 32-byte `policyHash` commitment.
///
/// # Errors
/// - [`ProofError`] when `policy_preimage` cannot be parsed as hex.
pub fn compute_policy_hash(witness: &WitnessInput) -> Result<[u8; 32], ProofError> {
    let policy_preimage =
        parse_hex_bytes("policy_preimage", &witness.policy.policy_preimage, None)?;
    Ok(keccak256(&policy_preimage).0)
}

impl WitnessHashing for WitnessInput {
    fn parameters_hash(&self) -> Result<[u8; 32], ProofError> {
        compute_parameters_hash(self)
    }

    fn policy_hash(&self) -> Result<[u8; 32], ProofError> {
        compute_policy_hash(self)
    }
}
