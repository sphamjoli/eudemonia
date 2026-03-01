# Eudemonia · SP1 RWA Tokenisation

Compliance-bound institutional issuance on ADI Chain. Off-chain approval decisions enforced on-chain, no trusted intermediary required.

---

## Context

RWA tokenisation is early. Institutions are experimenting, but adoption is slow for concrete reasons.

Trust remains the core problem. The cloud took a decade to move from institutional scepticism to standard infrastructure. Blockchain is somewhere in that curve. Institutions need compliance tooling that maps to their regulatory obligations and existing workflows, not generic infrastructure that requires them to change how they operate. The ask is not "use blockchain"; it is "here is how this fits your existing approval process and compliance requirements."

Privacy is a requirement, not a feature. Institutional workflows carry sensitive information: counterparty addresses, positions, trade sizes, approval quorums. Institutions will not put those on a transparent chain. Configurable, compliant privacy, where each party sees only what they need to see, is a precondition for adoption. This is not a product differentiator; it is table stakes.

Tokenisation is useful when it increases utility. Access, settlement speed, programmability: these justify the complexity. A digital representation of an asset that still settles the same way, with the same counterparties, through the same process, does not. This project focuses specifically on the compliance and trust layer.

---

## The problem

How do you mint tokens only when off-chain compliance decisions have actually been made, without a trusted intermediary certifying them?

The decisions in question: a quorum of authorised compliance officers approved this issuance; the beneficiary passed KYC/AML within the last N days; the parameters have not changed since approval. These involve private data, multi-party coordination, and off-chain processes.

Three approaches fall short.

**Trusted oracle.** One operator certifies compliance and submits the transaction. There is no on-chain way to verify the certification corresponds to an actual quorum decision over the actual parameters.

**On-chain multisig.** Attestors sign on-chain transactions. This leaks compliance data publicly, costs O(n) ECDSA verifications, and does not bind the signed data to execution parameters without putting everything on-chain.

**Off-chain multisig relayed by oracle.** Attestors sign off-chain; an oracle relays signatures; the contract verifies them. This still requires O(n) on-chain verification, growing with quorum size, and the oracle remains trusted.

What is needed is a single constant-size proof that certifies k-of-n authorised attestors signed these exact parameters, those attestors are registered, compliance records are fresh, and the policy window holds. Verification cost must be fixed regardless of quorum size.

---

## What this is

An end-to-end institutional issuance pipeline on ADI Chain using SP1 (Succinct's zkVM).

`TokenisationEngine.verifyAndExecuteIssuance()` mints if and only if a valid SP1 proof certifies `(parametersHash, policyHash)`, and those values match on-chain state.

```
parametersHash = keccak256(requestId, beneficiary, amount, privacyMode, chainId, issuanceRegistryAddress)
policyHash     = keccak256(policyId, attestorMerkleRoot, threshold, validFrom, validUntil, privacyConstraints)
```

To mint with forged parameters, an attacker must break SNARK soundness. To replay a past proof, the attacker must bypass the `CONSUMED` flag set on first execution, which causes any subsequent call to revert.

---

## Architecture

```mermaid
flowchart LR
    Issuer((Issuer))
    Attestor((Attestor))
    IR[IssuanceRegistry]
    PR[PolicyRegistry]
    IDX[Envio Indexer]
    RDS[(Redis)]
    W[Worker]
    SP1[SP1 Guest zkVM]
    TE[TokenisationEngine]
    TKN[RwaToken1155]

    Issuer -->|createPolicy| PR
    PR -->|PolicyCreated| IDX

    Issuer -->|createIssuanceRequest| IR
    IR -->|IssuanceRequestCreated| IDX

    Attestor -->|storeAttestation| RDS

    W -->|fetchPendingProofJobs| IDX
    W -->|fetchRequest + fetchPolicy| IDX
    W -->|getAttestations + getComplianceChecks| RDS
    W -->|prove WitnessInput| SP1
    SP1 -->|publicValues + proofBytes| W

    W -->|verifyAndExecuteIssuance| TE
    TE -->|verifyProof| TE
    TE -->|assert parametersHash| IR
    TE -->|assert policyHash| PR
    TE -->|markConsumed| IR
    TE -->|mint| TKN
    TKN -->|Transfer| Issuer
```

---

## Components

| Layer | Crate / package | Purpose |
|---|---|---|
| ZK program | `crates/programs/issuance-claim` | SP1 guest. Receives witness, runs all checks, outputs public values |
| ZK SDK | `crates/sdk` | Shared Rust library: Merkle verification, ECDSA recovery, hash computation, ABI encoding |
| Prover CLI | `crates/prover` | Assembles witness JSON, validates it, writes public values, calls external SP1 prover |
| Contracts | `contracts/` | IssuanceRegistry, PolicyRegistry, PaymentRegistry, TokenisationEngine, RwaToken1155, ConfidentialSettlement |
| Indexer + worker | `indexer/src/` | Envio HyperIndex event handlers; Redis-backed async proof worker; GraphQL serving |
| Dashboard | `ui/` | Vue 3 multi-role interface (admin, issuer, attestor, worker) |

---

## Cryptographic design

### The witness

The SP1 guest receives a `WitnessInput` struct (`crates/sdk/src/types.rs`):

```rust
/// Canonical witness payload used by prover/guest validation logic.
pub struct WitnessInput {
    /// Issuance request identifier.
    pub request_identifier: String,
    /// Policy identifier.
    pub policy_identifier: String,
    /// Chain id bound into parameters hash domain separation.
    pub chain_id: String,
    /// IssuanceRegistry contract address bound into parameters hash domain separation.
    pub issuance_registry: String,
    /// Request field set used to recompute `parametersHash`.
    pub request: RequestWitness,
    /// Policy field set used to recompute `policyHash` and enforce policy rules.
    pub policy: PolicyWitness,
    /// Attestation records used for signature and membership threshold verification.
    pub attestations: Vec<AttestationWitness>,
    /// Compliance checks used for required-check and freshness validation.
    pub checks: Vec<ComplianceCheckRecord>,
    /// Current timestamp (seconds since epoch) used for validity and freshness checks.
    pub current_timestamp: u64,
}
```

### What the guest proves

Seven checks run inside the circuit. If any fails, no valid proof is produced and nothing is minted.

**1. Hash recomputation.** Recomputes `parametersHash` from request fields and `policyHash` from policy fields. These become the public values. Any field change shifts the hash, causing a mismatch against the on-chain commitment.

**2. Merkle membership.** For each attestation, verifies the attestor's address is a leaf in the Merkle tree whose root is committed in `policyHash`. Addresses outside the registered set cannot contribute to the threshold regardless of whether they produce a valid signature.

**3. ECDSA signature recovery.** Recovers the signing address from the signature over `keccak256(parametersHash ++ policyHash)`. The recovered address must match the Merkle leaf, confirming the signer is authorised and signed these specific parameters.

**4. Threshold.** The count of attestations passing checks 2 and 3 must be greater than or equal to the threshold committed in `policyHash`.

**5. Policy validity window.** `current_timestamp` must fall within `[validFrom, validUntil]` as committed in `policyHash`.

**6. Compliance check freshness.** Each compliance record must have been issued within the staleness window committed in the policy. Outdated KYC data causes proof generation to fail.

**7. Domain separation.** `chainId` and `issuanceRegistryAddress` are embedded in the hash inputs. A proof from one chain or registry cannot be replayed on another.

Output is exactly two 32-byte values: `(parametersHash, policyHash)`. The `TokenisationEngine` reads the same values from its registries and checks equality. They match only if the witness fields are byte-for-byte consistent with what was stored when the request was created.

### Verification cost

SP1 is a zkVM: it proves that a Rust binary executed correctly on a given input and produced a specific output. The on-chain verifier checks a constant-size proof against the verification key and public values; it does not re-execute the computation. Verification cost on ADI Chain is fixed regardless of quorum size, number of compliance checks, or witness complexity.

The verification key (`artifacts/sp1/issuance-claim.vkey.txt`) is derived from the compiled guest binary. If the binary changes, the key changes and proofs from the old binary stop verifying. `TokenisationEngine` stores the expected key and rejects anything else.

---

## Security model

### Trusted

- ADI Chain BFT consensus and finality
- The deployed `ISP1Verifier` contract correctly verifies SP1 proofs
- The ELF binary in `artifacts/sp1/issuance-claim` matches the source in `crates/programs/issuance-claim/src/`

### Handled by the circuit

| Threat | Mitigation |
|---|---|
| Worker submits proof for wrong parameters | `parametersHash` recomputed inside guest; on-chain equality check fails if any field was altered |
| Replay of a past valid proof | `requestId` committed inside `parametersHash`; request marked `CONSUMED` on first execution; second call reverts |
| Forged attestations or insufficient quorum | ECDSA recovery and Merkle membership verified inside circuit; threshold enforced; too few valid sigs cause proof generation to fail |
| Expired policy | Validity window checked against committed timestamps inside circuit |
| Stale KYC/AML data | Compliance record freshness enforced inside circuit |
| Admin creates fraudulent policy | Admin is a multisig (`MultisigOwnable`); policy changes versioned with auditable on-chain events; `policyHash` binds the full configuration |

### Out of scope (MVP)

- Real-world asset backing: requires external oracles or data availability not addressed here
- Witness privacy: SP1 proofs are publicly verifiable; the witness is held by the worker
- Privacy modes beyond the four implemented: transparent, destination-private, amount-private, full-private

---

## Getting started

### One command

```bash
make start-everything
```

Spins up dual Anvil forks, deploys all contracts, assigns demo participants, syncs addresses into env files, and starts the full Docker Compose stack (Postgres, Redis, Hasura, indexer, worker, UI).

```bash
make stop-everything
```

### Prerequisites

- Rust 1.92.0 (the `rust-toolchain` file pins this; install via [rustup](https://rustup.rs/))
- [Foundry](https://getfoundry.sh/) (`forge`, `cast`, `anvil`)
- Node.js >= 18
- Docker and Docker Compose
- [Succinct CLI](https://docs.succinct.xyz/) for real proofs; set `SP1_MOCK_MODE=true` to skip during development

### Configuration

Each sub-project reads its own `.env`:

```bash
cp contracts/.env.example contracts/.env
cp indexer/.env.example  indexer/.env
cp ui/.env.example       ui/.env
```

The Makefile pre-populates deterministic test accounts for local development.

### Step by step

```bash
# start local Anvil forks
make anvil-adi-up

# deploy all contracts to the local fork
make deploy-all-contracts

# sync deployment addresses into indexer/.env and ui/.env
make sync-local-addresses

# start backing infrastructure (Postgres, Redis, Hasura GraphQL), indexer, worker, and UI
make start-components
```

Or run each service separately in its own terminal:

```bash
# Envio indexer
cd indexer && npm install && npm run dev

# proof worker
cd indexer && npm run worker:dev

# dashboard
cd ui && npm install && npm run dev
```

### Demo flow

Seven-step demo using Anvil test accounts (7 employees, 2 auditors). `SP1_MOCK_MODE=true` skips real proving.

```bash
# register participants and create issuance policy
make demo-setup

# issuer submits an issuance request
make demo-request

# attestors sign approval (k-of-n quorum)
make demo-attest

# poll until worker produces proof and submits execution
make demo-status

# inspect IssuanceAuditReceipt event
make demo-audit

# or all at once
make demo-flow
```

### Tests

```bash
# Solidity: unit, integration, fuzz, invariant
make contracts-test

# Rust: SDK validation and prover CLI integration
make rust-test

# TypeScript: worker retry logic
cd indexer && npm test
```
