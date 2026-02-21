use std::collections::HashMap;

use crate::{
    compute_parameters_hash, compute_policy_hash, decode_public_values, encode_public_values,
    validate_witness_and_build_public_values, ComplianceCheckRecord, PolicyWitness, ProofError,
    PublicValues, RequestWitness, WitnessInput,
};

/// Builds a deterministic baseline witness used by unit tests.
fn base_witness() -> WitnessInput {
    WitnessInput {
        request_identifier: "1".to_string(),
        policy_identifier: "1".to_string(),
        chain_id: "99999".to_string(),
        issuance_registry: "0x1000000000000000000000000000000000000001".to_string(),
        request: RequestWitness {
            asset_identifier: "7".to_string(),
            amount: "100".to_string(),
            beneficiary: "0x2000000000000000000000000000000000000002".to_string(),
            amount_commitment: "0x0000000000000000000000000000000000000000000000000000000000000000"
                .to_string(),
            destination_commitment:
                "0x0000000000000000000000000000000000000000000000000000000000000000".to_string(),
            payload_hash: "0x0000000000000000000000000000000000000000000000000000000000000000"
                .to_string(),
            expiry_timestamp: "0".to_string(),
            documentation_hash:
                "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa".to_string(),
            issuer: "0x3000000000000000000000000000000000000003".to_string(),
            subject: "0x4000000000000000000000000000000000000004".to_string(),
            privacy_mode: 0,
            privacy_context_hash:
                "0x0000000000000000000000000000000000000000000000000000000000000000".to_string(),
            parameters_hash: "0x0000000000000000000000000000000000000000000000000000000000000000"
                .to_string(),
        },
        policy: PolicyWitness {
            policy_hash: "0x0000000000000000000000000000000000000000000000000000000000000000"
                .to_string(),
            policy_preimage: "0x1234".to_string(),
            attestor_set_root: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
                .to_string(),
            attestor_threshold: 0,
            valid_from_timestamp: 0,
            valid_until_timestamp: 0,
            required_checks: vec!["KYC_PASS".to_string()],
            freshness_windows: HashMap::from([(String::from("KYC_PASS"), 3600)]),
        },
        attestations: Vec::new(),
        checks: vec![ComplianceCheckRecord {
            check_id: "KYC_PASS".to_string(),
            passed: true,
            observed_at: 1_000,
            digest: "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"
                .to_string(),
        }],
        current_timestamp: 1_100,
    }
}

#[test]
fn public_values_roundtrip() {
    let values = PublicValues {
        parameters_hash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
            .to_string(),
        policy_hash: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
            .to_string(),
    };

    let encoded = encode_public_values(&values).expect("encode");
    assert_eq!(encoded.len(), 64);

    let decoded = decode_public_values(&encoded).expect("decode");
    assert_eq!(decoded.parameters_hash, values.parameters_hash);
    assert_eq!(decoded.policy_hash, values.policy_hash);
}

#[test]
fn validate_rejects_stale_check() {
    let mut witness = base_witness();
    witness.current_timestamp = 10_000;

    let parameters_hash = compute_parameters_hash(&witness).expect("parameters hash");
    witness.request.parameters_hash = format!("0x{}", hex::encode(parameters_hash));

    let policy_hash = compute_policy_hash(&witness).expect("policy hash");
    witness.policy.policy_hash = format!("0x{}", hex::encode(policy_hash));

    let result = validate_witness_and_build_public_values(&witness);
    assert!(matches!(
        result,
        Err(ProofError::ComplianceCheckStale { check_id }) if check_id == "KYC_PASS"
    ));
}

#[test]
fn validate_rejects_unmet_threshold() {
    let mut witness = base_witness();
    witness.policy.attestor_threshold = 1;

    let parameters_hash = compute_parameters_hash(&witness).expect("parameters hash");
    witness.request.parameters_hash = format!("0x{}", hex::encode(parameters_hash));

    let policy_hash = compute_policy_hash(&witness).expect("policy hash");
    witness.policy.policy_hash = format!("0x{}", hex::encode(policy_hash));

    let result = validate_witness_and_build_public_values(&witness);
    assert!(matches!(
        result,
        Err(ProofError::ThresholdNotMet {
            expected: 1,
            actual: 0
        })
    ));
}
