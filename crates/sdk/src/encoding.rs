use alloy_primitives::B256;

use crate::error::ProofError;
use crate::primitives::{encode_hex_prefixed, parse_hash32};
use crate::traits::PublicValuesEncoding;
use crate::types::PublicValues;

/// Encodes public values as two ABI-compatible 32-byte words.
///
/// # Arguments
/// - `values`: [`PublicValues`] with `parameters_hash` and `policy_hash`.
///
/// # Returns
/// - 64-byte payload in the order `parametersHash || policyHash`.
///
/// # Errors
/// - [`ProofError`] when either hash field is malformed.
pub fn encode_public_values(values: &PublicValues) -> Result<Vec<u8>, ProofError> {
    let parameters_hash = parse_hash32("parameters_hash", &values.parameters_hash)?;
    let policy_hash = parse_hash32("policy_hash", &values.policy_hash)?;
    let mut out = Vec::with_capacity(64);
    out.extend_from_slice(parameters_hash.as_slice());
    out.extend_from_slice(policy_hash.as_slice());
    Ok(out)
}

/// Decodes a 64-byte public-values payload into [`PublicValues`].
///
/// # Arguments
/// - `bytes`: Raw public-values byte payload.
///
/// # Returns
/// - Decoded [`PublicValues`] with hex-prefixed hash strings.
///
/// # Errors
/// - [`ProofError::InvalidPublicValuesLength`] if `bytes.len() != 64`.
pub fn decode_public_values(bytes: &[u8]) -> Result<PublicValues, ProofError> {
    if bytes.len() != 64 {
        return Err(ProofError::InvalidPublicValuesLength);
    }

    let mut parameters_hash = [0u8; 32];
    let mut policy_hash = [0u8; 32];
    parameters_hash.copy_from_slice(&bytes[..32]);
    policy_hash.copy_from_slice(&bytes[32..64]);

    Ok(PublicValues {
        parameters_hash: encode_hex_prefixed(B256::from(parameters_hash).as_slice()),
        policy_hash: encode_hex_prefixed(B256::from(policy_hash).as_slice()),
    })
}

impl PublicValuesEncoding for PublicValues {
    fn to_abi_public_values(&self) -> Result<Vec<u8>, ProofError> {
        encode_public_values(self)
    }
}
