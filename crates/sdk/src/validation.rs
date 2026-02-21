use std::collections::{HashMap, HashSet};

use alloy_primitives::{keccak256, Address, Signature, B256};
use alloy_sol_types::SolValue;

use crate::error::ProofError;
use crate::hashing::{compute_parameters_hash, compute_policy_hash};
use crate::primitives::{encode_hex_prefixed, parse_address, parse_hash32, parse_hex_bytes};
use crate::types::{
    AttestationValidationContext, ComplianceCheckRecord, ComplianceValidationContext, PublicValues,
    WitnessInput,
};

/// Verifies a Merkle membership proof against a root.
///
/// # Arguments
/// - `leaf`: Leaf hash representing the attestor membership leaf.
/// - `proof`: Ordered sibling hashes from leaf level to root.
/// - `root`: Expected Merkle root.
///
/// # Returns
/// - `true` when the proof resolves to `root`; otherwise `false`.
fn verify_merkle_membership(leaf: B256, proof: &[B256], root: B256) -> bool {
    let mut hash = leaf;
    for sibling in proof {
        let mut combined = [0u8; 64];
        if hash <= *sibling {
            combined[..32].copy_from_slice(hash.as_slice());
            combined[32..].copy_from_slice(sibling.as_slice());
        } else {
            combined[..32].copy_from_slice(sibling.as_slice());
            combined[32..].copy_from_slice(hash.as_slice());
        }
        hash = keccak256(&combined);
    }
    hash == root
}

/// Recovers an Ethereum signer address from a prehash and signature bytes.
///
/// # Arguments
/// - `digest`: 32-byte message prehash.
/// - `signature_bytes`: Signature encoded as `r || s || v` (65 bytes).
///
/// # Returns
/// - Recovered [`Address`] signer.
///
/// # Errors
/// - [`ProofError::InvalidSignature`] if signature decoding or recovery fails.
fn recover_address_from_signature(
    digest: B256,
    signature_bytes: &[u8],
) -> Result<Address, ProofError> {
    let signature =
        Signature::try_from(signature_bytes).map_err(|_e| ProofError::InvalidSignature {
            attestor: "unknown".to_string(),
        })?;

    signature
        .recover_address_from_prehash(&digest)
        .map_err(|_e| ProofError::InvalidSignature {
            attestor: "unknown".to_string(),
        })
}

/// Validates that the policy is active at `witness.current_timestamp`.
///
/// # Arguments
/// - `witness`: [`WitnessInput`] containing policy validity bounds.
///
/// # Returns
/// - `Ok(())` when the policy is active at the provided timestamp.
///
/// # Errors
/// - [`ProofError::PolicyNotValidAt`] when policy bounds are violated.
fn validate_policy_window(witness: &WitnessInput) -> Result<(), ProofError> {
    let now = witness.current_timestamp;
    if now < witness.policy.valid_from_timestamp
        || (witness.policy.valid_until_timestamp != 0 && now > witness.policy.valid_until_timestamp)
    {
        return Err(ProofError::PolicyNotValidAt { timestamp: now });
    }
    Ok(())
}

/// Validates required compliance checks and freshness windows.
///
/// # Arguments
/// - `context`: [`ComplianceValidationContext`] with check rows and policy requirements.
///
/// # Returns
/// - `Ok(())` when all required checks are present, passing, and fresh.
///
/// # Errors
/// - [`ProofError::MissingComplianceCheck`] when a required check is absent.
/// - [`ProofError::ComplianceCheckFailed`] when a required check has `passed = false`.
/// - [`ProofError::ComplianceCheckStale`] when a required check exceeds freshness bounds.
/// - [`ProofError::InvalidHex`] when a check digest is malformed.
fn validate_compliance_checks(context: ComplianceValidationContext<'_>) -> Result<(), ProofError> {
    let checks_by_id: HashMap<&str, &ComplianceCheckRecord> = context
        .checks
        .iter()
        .map(|check| (check.check_id.as_str(), check))
        .collect();

    for required in context.required_checks {
        let check = checks_by_id.get(required.as_str()).ok_or_else(|| {
            ProofError::MissingComplianceCheck {
                check_id: required.clone(),
            }
        })?;

        if !check.passed {
            return Err(ProofError::ComplianceCheckFailed {
                check_id: required.clone(),
            });
        }

        let max_age = context
            .freshness_windows
            .get(required)
            .copied()
            .unwrap_or(u64::MAX);

        if context.current_timestamp.saturating_sub(check.observed_at) > max_age {
            return Err(ProofError::ComplianceCheckStale {
                check_id: required.clone(),
            });
        }

        let _parsed_digest = parse_hash32("check.digest", &check.digest)?;
    }

    Ok(())
}

/// Validates attestation signatures, membership proofs, and quorum threshold.
///
/// # Arguments
/// - `context`: [`AttestationValidationContext`] containing root, threshold, and attestations.
///
/// # Returns
/// - `Ok(())` when all attestations are valid and unique signer count meets threshold.
///
/// # Errors
/// - [`ProofError::InvalidAddress`] when an attestor address is malformed.
/// - [`ProofError::InvalidHex`] when attestation hashes or proof nodes are malformed.
/// - [`ProofError::InvalidSignature`] when signature decoding or recovery fails.
/// - [`ProofError::AttestorRecoveryMismatch`] when recovered signer differs from attestor.
/// - [`ProofError::MerkleVerificationFailed`] when leaf/proof validation fails.
/// - [`ProofError::ThresholdNotMet`] when unique signer count is below threshold.
fn validate_attestations(context: AttestationValidationContext<'_>) -> Result<(), ProofError> {
    let mut unique_attestors: HashSet<Address> = HashSet::new();

    for attestation in context.attestations {
        let attestor_address = parse_address("attestation.attestor", &attestation.attestor)?;
        let digest = parse_hash32("attestation.signed_digest", &attestation.signed_digest)?;
        let signature_bytes =
            parse_hex_bytes("attestation.signature", &attestation.signature, Some(65))?;
        let recovered = recover_address_from_signature(digest, &signature_bytes)?;

        if recovered != attestor_address {
            return Err(ProofError::AttestorRecoveryMismatch {
                expected: encode_hex_prefixed(attestor_address.as_slice()),
                actual: encode_hex_prefixed(recovered.as_slice()),
            });
        }

        let expected_leaf = keccak256(attestor_address.abi_encode());
        let provided_leaf = parse_hash32("attestation.leaf", &attestation.leaf)?;
        if expected_leaf != provided_leaf {
            return Err(ProofError::MerkleVerificationFailed {
                attestor: attestation.attestor.clone(),
            });
        }

        let proof_nodes: Result<Vec<B256>, ProofError> = attestation
            .merkle_proof
            .iter()
            .map(|node| parse_hash32("attestation.merkle_proof", node))
            .collect();

        if !verify_merkle_membership(expected_leaf, &proof_nodes?, context.policy_root) {
            return Err(ProofError::MerkleVerificationFailed {
                attestor: attestation.attestor.clone(),
            });
        }

        unique_attestors.insert(attestor_address);
    }

    if unique_attestors.len() < context.threshold {
        return Err(ProofError::ThresholdNotMet {
            expected: context.threshold,
            actual: unique_attestors.len(),
        });
    }

    Ok(())
}

/// Validates a witness and produces canonical public values.
///
/// # Arguments
/// - `witness`: [`WitnessInput`] to validate.
///
/// # Returns
/// - [`PublicValues`] containing canonical `parameters_hash` and `policy_hash`.
///
/// # Errors
/// - [`ProofError`] when any commitment, policy check, compliance check, signature, membership
///   proof, or threshold rule fails.
pub fn validate_witness_and_build_public_values(
    witness: &WitnessInput,
) -> Result<PublicValues, ProofError> {
    let parameters_hash = compute_parameters_hash(witness)?;
    let policy_hash = compute_policy_hash(witness)?;

    let actual_parameters = B256::from(parameters_hash);
    let actual_policy = B256::from(policy_hash);

    let expected_parameters =
        parse_hash32("request.parameters_hash", &witness.request.parameters_hash)?;
    let expected_policy = parse_hash32("policy.policy_hash", &witness.policy.policy_hash)?;

    if actual_parameters != expected_parameters {
        return Err(ProofError::ParametersHashMismatch {
            expected: encode_hex_prefixed(expected_parameters.as_slice()),
            actual: encode_hex_prefixed(actual_parameters.as_slice()),
        });
    }

    if actual_policy != expected_policy {
        return Err(ProofError::PolicyHashMismatch {
            expected: encode_hex_prefixed(expected_policy.as_slice()),
            actual: encode_hex_prefixed(actual_policy.as_slice()),
        });
    }

    validate_policy_window(witness)?;

    validate_compliance_checks(ComplianceValidationContext {
        checks: &witness.checks,
        required_checks: &witness.policy.required_checks,
        freshness_windows: &witness.policy.freshness_windows,
        current_timestamp: witness.current_timestamp,
    })?;

    let root = parse_hash32(
        "policy.attestor_set_root",
        &witness.policy.attestor_set_root,
    )?;
    validate_attestations(AttestationValidationContext {
        policy_root: root,
        threshold: witness.policy.attestor_threshold as usize,
        attestations: &witness.attestations,
    })?;

    Ok(PublicValues {
        parameters_hash: encode_hex_prefixed(actual_parameters.as_slice()),
        policy_hash: encode_hex_prefixed(actual_policy.as_slice()),
    })
}
