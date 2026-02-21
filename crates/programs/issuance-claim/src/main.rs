#![cfg_attr(target_os = "zkvm", no_main)]

#[cfg(not(target_os = "zkvm"))]
use std::io::{Read, Write};

use eudemonia_sp1_sdk::WitnessInput;

use crate::runner::run_witness;

mod runner;
#[cfg(test)]
mod runner_tests;

#[cfg(target_os = "zkvm")]
sp1_zkvm::entrypoint!(zkvm_main);

/// SP1 zkVM entrypoint.
///
/// # Panics
/// - Panics if witness validation fails.
/// - Panics if public-value encoding fails.
#[cfg(target_os = "zkvm")]
fn zkvm_main() {
    let witness = sp1_zkvm::io::read::<WitnessInput>();
    let encoded = run_witness(&witness).expect("validate witness and encode public values");
    sp1_zkvm::io::commit_slice(&encoded);
}

/// Host entrypoint for local witness execution.
///
/// # Panics
/// - Panics if stdin cannot be read.
/// - Panics if witness JSON is missing or malformed.
/// - Panics if witness validation fails.
/// - Panics if public-value encoding fails.
/// - Panics if stdout cannot be written.
#[cfg(not(target_os = "zkvm"))]
fn main() {
    let mut raw = String::new();
    std::io::stdin()
        .read_to_string(&mut raw)
        .expect("read witness from stdin");
    assert!(!raw.trim().is_empty(), "witness JSON is required on stdin");

    let witness: WitnessInput = serde_json::from_str(&raw).expect("parse witness JSON");
    let encoded = run_witness(&witness).expect("validate witness and encode public values");

    std::io::stdout()
        .write_all(&encoded)
        .expect("write public values to stdout");
}
