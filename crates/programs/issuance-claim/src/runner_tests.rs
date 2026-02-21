#[cfg(test)]
mod tests {
    use std::collections::HashMap;

    use eudemonia_sp1_sdk::{ComplianceCheckRecord, PolicyWitness, RequestWitness, WitnessInput};

    use crate::runner::run_witness;

    /// Ensures malformed witness data returns a deterministic validation error.
    #[test]
    fn run_witness_rejects_malformed_hash() {
        let witness = WitnessInput {
            request_identifier: "1".to_string(),
            policy_identifier: "1".to_string(),
            chain_id: "99999".to_string(),
            issuance_registry: "0x1000000000000000000000000000000000000001".to_string(),
            request: RequestWitness {
                asset_identifier: "7".to_string(),
                amount: "100".to_string(),
                beneficiary: "0x2000000000000000000000000000000000000002".to_string(),
                amount_commitment:
                    "0x0000000000000000000000000000000000000000000000000000000000000000".to_string(),
                destination_commitment:
                    "0x0000000000000000000000000000000000000000000000000000000000000000".to_string(),
                payload_hash: "0x0000000000000000000000000000000000000000000000000000000000000000"
                    .to_string(),
                expiry_timestamp: "0".to_string(),
                documentation_hash: "0xinvalid".to_string(),
                issuer: "0x3000000000000000000000000000000000000003".to_string(),
                subject: "0x4000000000000000000000000000000000000004".to_string(),
                privacy_mode: 0,
                privacy_context_hash:
                    "0x0000000000000000000000000000000000000000000000000000000000000000".to_string(),
                parameters_hash:
                    "0x0000000000000000000000000000000000000000000000000000000000000000".to_string(),
            },
            policy: PolicyWitness {
                policy_hash: "0x0000000000000000000000000000000000000000000000000000000000000000"
                    .to_string(),
                policy_preimage: "0x1234".to_string(),
                attestor_set_root:
                    "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb".to_string(),
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
        };

        assert!(run_witness(&witness).is_err());
    }
}
