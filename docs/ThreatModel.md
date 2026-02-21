# Threat Model (Minimal)

## Assumptions
- ADI chain provides consensus/finality for contract state.
- SP1 verifier correctly verifies the proof.

## Threats addressed
- Unauthorized minting: only possible with a valid proof bound to request params.
- Replay/double mint: requestId is consumed once.
- Admin abuse: admin is multisig; pausable; policy updates are versioned and logged.

## Out of scope (MVP)
- Proving real-world backing (external data availability/oracles).
- Advanced privacy requirements.
