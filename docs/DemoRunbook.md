# Demo Runbook (Judges)

## What you'll see
1) Admin configures an issuance policy (attestors + threshold).
2) Issuer creates an issuance request.
3) Attestors approve by signing.
4) Prover generates an SP1 proof.
5) Issuer executes issuance on ADI; token mints and request becomes consumed.
6) Replay attempt fails (already consumed).

## Setup (TODO)
- Deploy contracts to ADI testnet (addresses in README)
- Start Envio indexer + SP1 worker + UI
- Use pre-funded test accounts
