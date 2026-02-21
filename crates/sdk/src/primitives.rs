use std::str::FromStr;

use alloy_primitives::{hex, Address, B256, U256};

use crate::error::ProofError;

/// Removes an optional `0x` or `0X` prefix from a hex-like string.
///
/// # Arguments
/// - `value`: Input string that may include a hex prefix.
///
/// # Returns
/// - The same string slice without the prefix when it is present.
pub(crate) fn strip_hex_prefix(value: &str) -> &str {
    if value.starts_with("0x") || value.starts_with("0X") {
        &value[2..]
    } else {
        value
    }
}

/// Parses hex text into bytes and optionally enforces an exact byte length.
///
/// # Arguments
/// - `field`: Logical field name used in error messages.
/// - `value`: Hex string input.
/// - `expected_len`: Optional exact decoded length in bytes.
///
/// # Returns
/// - Decoded byte vector.
///
/// # Errors
/// - [`ProofError::InvalidHex`] if `value` cannot be decoded as hex.
/// - [`ProofError::InvalidHashLength`] if `expected_len` is set and decoded length differs.
pub(crate) fn parse_hex_bytes(
    field: &'static str,
    value: &str,
    expected_len: Option<usize>,
) -> Result<Vec<u8>, ProofError> {
    let normalized = strip_hex_prefix(value);
    let decoded = hex::decode(normalized).map_err(|_e| ProofError::InvalidHex {
        field,
        value: value.to_string(),
    })?;

    if let Some(len) = expected_len {
        if decoded.len() != len {
            return Err(ProofError::InvalidHashLength { field });
        }
    }

    Ok(decoded)
}

/// Parses a 32-byte hex value into [`B256`].
///
/// # Arguments
/// - `field`: Logical field name used in error messages.
/// - `value`: Hex string expected to represent a 32-byte value.
///
/// # Returns
/// - Parsed [`B256`] value.
///
/// # Errors
/// - [`ProofError::InvalidHex`] if parsing fails.
pub(crate) fn parse_hash32(field: &'static str, value: &str) -> Result<B256, ProofError> {
    B256::from_str(value).map_err(|_e| ProofError::InvalidHex {
        field,
        value: value.to_string(),
    })
}

/// Parses an EVM address string into [`Address`].
///
/// # Arguments
/// - `field`: Logical field name used in error messages.
/// - `value`: Hex address string.
///
/// # Returns
/// - Parsed [`Address`] value.
///
/// # Errors
/// - [`ProofError::InvalidAddress`] if parsing fails.
pub(crate) fn parse_address(field: &'static str, value: &str) -> Result<Address, ProofError> {
    Address::from_str(value).map_err(|_e| ProofError::InvalidAddress {
        field,
        value: value.to_string(),
    })
}

/// Parses decimal or hex text into [`U256`].
///
/// # Arguments
/// - `field`: Logical field name used in error messages.
/// - `value`: Decimal string or `0x`-prefixed hex string.
///
/// # Returns
/// - Parsed [`U256`] value.
///
/// # Errors
/// - [`ProofError::InvalidUint256`] if parsing fails.
pub(crate) fn parse_u256(field: &'static str, value: &str) -> Result<U256, ProofError> {
    let parsed = if value.starts_with("0x") || value.starts_with("0X") {
        U256::from_str_radix(strip_hex_prefix(value), 16)
    } else {
        U256::from_str_radix(value, 10)
    };

    parsed.map_err(|_e| ProofError::InvalidUint256 {
        field,
        value: value.to_string(),
    })
}

/// Encodes bytes as lowercase `0x`-prefixed hex.
///
/// # Arguments
/// - `bytes`: Byte slice to encode.
///
/// # Returns
/// - Hex string in canonical `0x...` format.
pub(crate) fn encode_hex_prefixed(bytes: &[u8]) -> String {
    format!("0x{}", hex::encode(bytes))
}
