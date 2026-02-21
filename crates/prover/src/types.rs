use std::path::{Path, PathBuf};

/// Parameters for assembling a full witness JSON document.
#[derive(Debug, Clone)]
pub struct PrepareInputsParams {
    /// Issuance request identifier.
    pub request_identifier: String,
    /// Policy identifier.
    pub policy_identifier: String,
    /// Chain id for domain separation.
    pub chain_id: String,
    /// Issuance registry address for domain separation.
    pub issuance_registry: String,
    /// Current timestamp used for policy validity and freshness checks.
    pub current_timestamp: u64,
    /// Path to request JSON fragment.
    pub request: PathBuf,
    /// Path to policy JSON fragment.
    pub policy: PathBuf,
    /// Path to attestation array JSON fragment.
    pub attestations: PathBuf,
    /// Path to compliance check array JSON fragment.
    pub checks: PathBuf,
    /// Output path for generated witness JSON.
    pub out: PathBuf,
}

/// Parameters for proving command execution.
#[derive(Debug, Clone)]
pub struct ProveParams {
    /// Path to witness JSON.
    pub witness_path: PathBuf,
    /// Output path for proof bytes/hex.
    pub proof_out: PathBuf,
    /// Output path for public values bytes/hex.
    pub public_values_out: PathBuf,
    /// External proof command template.
    pub sp1_command: String,
    /// Program id template value.
    pub program_id: String,
}

/// Parameters for local verification command execution.
#[derive(Debug, Clone)]
pub struct VerifyLocalParams {
    /// Path to witness JSON.
    pub witness: PathBuf,
    /// Path to public values bytes/hex.
    pub public_values: PathBuf,
    /// Optional path to proof bytes/hex.
    pub proof: Option<PathBuf>,
    /// Optional external verification command template.
    pub sp1_command: Option<String>,
    /// Program id template value.
    pub program_id: String,
}

/// Parameters for calldata emission command execution.
#[derive(Debug, Clone)]
pub struct EmitCalldataParams {
    /// Path to proof bytes/hex.
    pub proof: PathBuf,
    /// Path to public values bytes/hex.
    pub public_values: PathBuf,
    /// Optional output path.
    pub out: Option<PathBuf>,
}

/// Converts filesystem paths to UTF-8 strings with a stable field label.
pub trait Utf8Path {
    /// Renders a UTF-8 string or returns a labeled error when path is non-UTF8.
    fn to_utf8_string(&self, field: &'static str) -> Result<String, String>;
}

impl Utf8Path for Path {
    fn to_utf8_string(&self, field: &'static str) -> Result<String, String> {
        self.to_str()
            .map(|value| value.to_string())
            .ok_or_else(|| format!("{} path is not valid UTF-8", field))
    }
}

impl Utf8Path for PathBuf {
    fn to_utf8_string(&self, field: &'static str) -> Result<String, String> {
        self.as_path().to_utf8_string(field)
    }
}
