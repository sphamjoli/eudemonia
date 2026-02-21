mod encoding;
mod error;
mod hashing;
mod primitives;
mod traits;
mod types;
mod validation;

pub use encoding::{decode_public_values, encode_public_values};
pub use error::ProofError;
pub use hashing::{compute_parameters_hash, compute_policy_hash};
pub use traits::{PublicValuesEncoding, WitnessHashing};
pub use types::{
    AttestationValidationContext, AttestationWitness, ComplianceCheckRecord,
    ComplianceValidationContext, PolicyWitness, PublicValues, RequestWitness, WitnessInput,
};
pub use validation::validate_witness_and_build_public_values;

#[cfg(test)]
mod tests;
