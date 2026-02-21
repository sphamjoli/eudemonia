# Overview

This project implements an institutional tokenisation workflow on **ADI Chain** with an **SP1** proving layer.

## High level
- ADI executes: roles, policy registry, issuance registry, mint/burn, audit events.
- SP1 proves: issuance policy claims (quorum approval) bound to an on-chain request.

## MVP statement (example)
Prove that a request `(requestId, paramsHash, policyId)` is approved by a quorum of authorized attestors and is eligible for execution.

See `ThreatModel.md` and `DemoRunbook.md`.
