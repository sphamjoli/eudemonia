use std::fs;
use std::path::PathBuf;
use std::process::Command;

use clap::{Parser, Subcommand};
use eudemonia_sp1_sdk::{
    decode_public_values, encode_public_values, validate_witness_and_build_public_values,
    WitnessInput,
};
use serde_json::json;

use crate::types::{
    EmitCalldataParams, PrepareInputsParams, ProveParams, Utf8Path, VerifyLocalParams,
};

mod types;

/// CLI arguments for prover orchestration commands.
#[derive(Parser, Debug)]
#[command(name = "eudemonia_sp1_prover")]
#[command(about = "SP1 prover orchestration CLI for Eudemonia issuance proofs")]
struct Cli {
    /// Selected subcommand.
    #[command(subcommand)]
    command: Commands,
}

/// Supported prover orchestration subcommands.
#[derive(Subcommand, Debug)]
enum Commands {
    /// Build witness JSON from component files.
    PrepareInputs {
        /// Issuance request identifier.
        #[arg(long)]
        request_identifier: String,
        /// Policy identifier.
        #[arg(long)]
        policy_identifier: String,
        /// Chain id for request hash domain separation.
        #[arg(long)]
        chain_id: String,
        /// Issuance registry address for request hash domain separation.
        #[arg(long)]
        issuance_registry: String,
        /// Current timestamp used by policy/freshness checks.
        #[arg(long)]
        current_timestamp: u64,
        /// Path to request JSON fragment.
        #[arg(long)]
        request: PathBuf,
        /// Path to policy JSON fragment.
        #[arg(long)]
        policy: PathBuf,
        /// Path to attestation array JSON.
        #[arg(long)]
        attestations: PathBuf,
        /// Path to compliance check array JSON.
        #[arg(long)]
        checks: PathBuf,
        /// Output path for assembled witness JSON.
        #[arg(long)]
        out: PathBuf,
    },
    /// Validate witness, emit canonical public values, and invoke external SP1 prover.
    Prove {
        /// Path to witness JSON.
        #[arg(long)]
        witness: PathBuf,
        /// Output path for proof bytes/hex.
        #[arg(long)]
        proof_out: PathBuf,
        /// Output path for public values bytes/hex.
        #[arg(long)]
        public_values_out: PathBuf,
        /// External proof command template.
        #[arg(long)]
        sp1_command: String,
        /// Program id template value.
        #[arg(long)]
        program_id: String,
    },
    /// Recompute and verify public values against witness, then optionally run external verify.
    VerifyLocal {
        /// Path to witness JSON.
        #[arg(long)]
        witness: PathBuf,
        /// Path to public values bytes/hex.
        #[arg(long)]
        public_values: PathBuf,
        /// Optional path to proof bytes/hex.
        #[arg(long)]
        proof: Option<PathBuf>,
        /// Optional external verification command template.
        #[arg(long)]
        sp1_command: Option<String>,
        /// Program id template value.
        #[arg(long, default_value = "")]
        program_id: String,
    },
    /// Emit calldata JSON payload from proof/public-values files.
    EmitCalldata {
        /// Path to proof bytes/hex.
        #[arg(long)]
        proof: PathBuf,
        /// Path to public values bytes/hex.
        #[arg(long)]
        public_values: PathBuf,
        /// Optional output path (stdout when omitted).
        #[arg(long)]
        out: Option<PathBuf>,
    },
}

/// Reads a UTF-8 text file.
///
/// # Arguments
/// - `path`: Input file path.
///
/// # Returns
/// - File contents as UTF-8 string.
///
/// # Errors
/// - Returns a formatted error string when file reading fails.
fn read_text(path: &PathBuf) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| format!("read {}: {}", path.display(), e))
}

/// Reads and parses a JSON file.
///
/// # Arguments
/// - `path`: Input file path.
///
/// # Returns
/// - Parsed [`serde_json::Value`].
///
/// # Errors
/// - Returns a formatted error string when file reading or JSON parsing fails.
fn read_json(path: &PathBuf) -> Result<serde_json::Value, String> {
    let raw = read_text(path)?;
    serde_json::from_str(&raw).map_err(|e| format!("parse JSON {}: {}", path.display(), e))
}

/// Applies `{key}` substitutions on a command template.
///
/// # Arguments
/// - `template`: Command template containing placeholders.
/// - `values`: Key-value substitutions using placeholder names without braces.
///
/// # Returns
/// - Rendered command string.
fn replace_template(template: &str, values: &[(&str, String)]) -> String {
    let mut out = template.to_string();
    for (key, value) in values {
        out = out.replace(&format!("{{{}}}", key), value);
    }
    out
}

/// Executes a shell command via `sh -lc`.
///
/// # Arguments
/// - `command`: Shell command string.
///
/// # Returns
/// - `Ok(())` when the command exits successfully.
///
/// # Errors
/// - Returns a formatted error string when spawning fails or exit status is non-zero.
fn run_shell(command: &str) -> Result<(), String> {
    let status = Command::new("sh")
        .arg("-lc")
        .arg(command)
        .status()
        .map_err(|e| format!("spawn command: {}", e))?;

    if !status.success() {
        return Err(format!(
            "command failed with status {}: {}",
            status
                .code()
                .map_or_else(|| "unknown".to_string(), |code| code.to_string()),
            command
        ));
    }

    Ok(())
}

/// Encodes bytes as `0x`-prefixed hex.
///
/// # Arguments
/// - `bytes`: Byte slice to encode.
///
/// # Returns
/// - Lowercase `0x`-prefixed hex string.
fn encode_hex_prefixed(bytes: &[u8]) -> String {
    let mut out = String::from("0x");
    out.push_str(&hex::encode(bytes));
    out
}

/// Reads a file as binary bytes or `0x`-prefixed hex text.
///
/// # Arguments
/// - `path`: Input file path.
///
/// # Returns
/// - Decoded bytes.
///
/// # Errors
/// - Returns a formatted error string when reading fails or hex decoding fails.
fn parse_hex_or_binary(path: &PathBuf) -> Result<Vec<u8>, String> {
    let raw = fs::read(path).map_err(|e| format!("read {}: {}", path.display(), e))?;
    if let Ok(text) = std::str::from_utf8(&raw) {
        let trimmed = text.trim();
        if let Some(stripped) = trimmed.strip_prefix("0x") {
            return hex::decode(stripped)
                .map_err(|e| format!("decode hex {}: {}", path.display(), e));
        }
    }
    Ok(raw)
}

/// Writes bytes as `0x`-prefixed hex text.
///
/// # Arguments
/// - `path`: Output file path.
/// - `bytes`: Bytes to encode and write.
///
/// # Returns
/// - `Ok(())` when writing succeeds.
///
/// # Errors
/// - Returns a formatted error string when writing fails.
fn write_hex(path: &PathBuf, bytes: &[u8]) -> Result<(), String> {
    fs::write(path, encode_hex_prefixed(bytes))
        .map_err(|e| format!("write {}: {}", path.display(), e))
}

/// Assembles a witness JSON payload from component files.
///
/// # Arguments
/// - `params`: [`PrepareInputsParams`](crate::types::PrepareInputsParams).
///
/// # Returns
/// - `Ok(())` when the witness file is written.
///
/// # Errors
/// - Returns a formatted error string when input reading/parsing or output writing fails.
fn cmd_prepare_inputs(params: PrepareInputsParams) -> Result<(), String> {
    let request_json = read_json(&params.request)?;
    let policy_json = read_json(&params.policy)?;
    let attestation_json = read_json(&params.attestations)?;
    let checks_json = read_json(&params.checks)?;

    let witness = json!({
        "request_identifier": params.request_identifier,
        "policy_identifier": params.policy_identifier,
        "chain_id": params.chain_id,
        "issuance_registry": params.issuance_registry,
        "request": request_json,
        "policy": policy_json,
        "attestations": attestation_json,
        "checks": checks_json,
        "current_timestamp": params.current_timestamp
    });

    let rendered =
        serde_json::to_string_pretty(&witness).map_err(|e| format!("serialize witness: {}", e))?;
    fs::write(&params.out, rendered)
        .map_err(|e| format!("write {}: {}", params.out.display(), e))?;
    println!("witness written: {}", params.out.display());
    Ok(())
}

/// Validates a witness, emits canonical public values, and invokes external proving.
///
/// # Arguments
/// - `params`: [`ProveParams`](crate::types::ProveParams).
///
/// # Returns
/// - `Ok(())` when proving command succeeds and output files are produced.
///
/// # Errors
/// - Returns a formatted error string on witness parse/validation failures, file IO failures,
///   UTF-8 path conversion failures, command execution failures, or missing proof output.
fn cmd_prove(params: ProveParams) -> Result<(), String> {
    let raw = read_text(&params.witness_path)?;
    let witness: WitnessInput =
        serde_json::from_str(&raw).map_err(|e| format!("parse witness: {}", e))?;

    let public_values = validate_witness_and_build_public_values(&witness)
        .map_err(|e| format!("witness validation failed: {}", e))?;
    let encoded_public_values =
        encode_public_values(&public_values).map_err(|e| format!("encode public values: {}", e))?;
    write_hex(&params.public_values_out, &encoded_public_values)?;

    let proof_out_str = params.proof_out.to_utf8_string("proof_out")?;
    let witness_str = params.witness_path.to_utf8_string("witness")?;
    let public_values_str = params
        .public_values_out
        .to_utf8_string("public_values_out")?;

    let command = replace_template(
        &params.sp1_command,
        &[
            ("program_id", params.program_id),
            ("witness", witness_str),
            ("proof", proof_out_str.clone()),
            ("public_values", public_values_str),
        ],
    );

    run_shell(&command)?;

    if !params.proof_out.exists() {
        return Err(format!(
            "SP1 prove command did not output proof file at {}",
            params.proof_out.display()
        ));
    }

    println!(
        "proof generated: {} | public values: {}",
        params.proof_out.display(),
        params.public_values_out.display()
    );
    Ok(())
}

/// Verifies local witness/public-values consistency and optionally invokes external verify.
///
/// # Arguments
/// - `params`: [`VerifyLocalParams`](crate::types::VerifyLocalParams).
///
/// # Returns
/// - `Ok(())` when local verification passes and optional external verification succeeds.
///
/// # Errors
/// - Returns a formatted error string for parse/validation failures, IO failures,
///   path conversion failures, command failures, or value mismatches.
fn cmd_verify_local(params: VerifyLocalParams) -> Result<(), String> {
    let raw = read_text(&params.witness)?;
    let witness: WitnessInput =
        serde_json::from_str(&raw).map_err(|e| format!("parse witness: {}", e))?;

    let computed = validate_witness_and_build_public_values(&witness)
        .map_err(|e| format!("witness validation failed: {}", e))?;
    let computed_bytes =
        encode_public_values(&computed).map_err(|e| format!("encode public values: {}", e))?;

    let provided_bytes = parse_hex_or_binary(&params.public_values)?;
    let decoded = decode_public_values(&provided_bytes)
        .map_err(|e| format!("decode provided public values: {}", e))?;

    if provided_bytes != computed_bytes {
        return Err(format!(
            "public values mismatch; computed={} provided={}",
            serde_json::to_string(&computed).unwrap_or_else(|_| "{}".to_string()),
            serde_json::to_string(&decoded).unwrap_or_else(|_| "{}".to_string())
        ));
    }

    if let Some(command_template) = params.sp1_command {
        let proof_path = params
            .proof
            .ok_or_else(|| "proof path required when sp1_command is set".to_string())?;
        let command = replace_template(
            &command_template,
            &[
                ("program_id", params.program_id),
                ("proof", proof_path.to_utf8_string("proof")?),
            ],
        );
        run_shell(&command)?;
    }

    println!("local verification passed");
    Ok(())
}

/// Emits JSON calldata payload from proof and public-values files.
///
/// # Arguments
/// - `params`: [`EmitCalldataParams`](crate::types::EmitCalldataParams).
///
/// # Returns
/// - `Ok(())` when payload serialization and output succeed.
///
/// # Errors
/// - Returns a formatted error string on input parse failures, serialization failures,
///   or output writing failures.
fn cmd_emit_calldata(params: EmitCalldataParams) -> Result<(), String> {
    let proof_bytes = parse_hex_or_binary(&params.proof)?;
    let public_values_bytes = parse_hex_or_binary(&params.public_values)?;

    let payload = json!({
        "proofBytes": encode_hex_prefixed(&proof_bytes),
        "publicValues": encode_hex_prefixed(&public_values_bytes),
    });
    let serialized =
        serde_json::to_string_pretty(&payload).map_err(|e| format!("serialize payload: {}", e))?;

    if let Some(out_path) = params.out {
        fs::write(&out_path, serialized)
            .map_err(|e| format!("write {}: {}", out_path.display(), e))?;
    } else {
        println!("{}", serialized);
    }

    Ok(())
}

/// Parses CLI input and dispatches to command handlers.
///
/// # Returns
/// - Does not return a value; exits with status code `1` when a command fails.
fn main() {
    let cli = Cli::parse();
    let result = match cli.command {
        Commands::PrepareInputs {
            request_identifier,
            policy_identifier,
            chain_id,
            issuance_registry,
            current_timestamp,
            request,
            policy,
            attestations,
            checks,
            out,
        } => cmd_prepare_inputs(PrepareInputsParams {
            request_identifier,
            policy_identifier,
            chain_id,
            issuance_registry,
            current_timestamp,
            request,
            policy,
            attestations,
            checks,
            out,
        }),
        Commands::Prove {
            witness,
            proof_out,
            public_values_out,
            sp1_command,
            program_id,
        } => cmd_prove(ProveParams {
            witness_path: witness,
            proof_out,
            public_values_out,
            sp1_command,
            program_id,
        }),
        Commands::VerifyLocal {
            witness,
            public_values,
            proof,
            sp1_command,
            program_id,
        } => cmd_verify_local(VerifyLocalParams {
            witness,
            public_values,
            proof,
            sp1_command,
            program_id,
        }),
        Commands::EmitCalldata {
            proof,
            public_values,
            out,
        } => cmd_emit_calldata(EmitCalldataParams {
            proof,
            public_values,
            out,
        }),
    };

    if let Err(error) = result {
        eprintln!("{}", error);
        std::process::exit(1);
    }
}
