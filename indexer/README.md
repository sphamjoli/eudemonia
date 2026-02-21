# Envio Indexer + SP1 Worker

This directory now contains two runtime components:

1. `npm run dev`: Envio HyperIndex event ingestion and GraphQL serving.
2. `npm run worker:dev`: Redis-backed proof worker (`src/worker/index.ts`) that:
   - reads pending `ProofJob` + indexed request/policy state,
   - fetches compliance + attestation records from Redis,
   - validates fresh onchain state,
   - calls the Rust prover CLI,
   - submits `verifyAndExecuteIssuance`.

## Redis key schema

- `policy:def:{policyId}`
- `compliance:subject:{subjectId}:check:{checkId}`
- `attestation:request:{requestId}:attestor:{address}`
- `proofjob:request:{requestId}`

All record payloads must include:

- `schemaVersion`
- `source`
- `createdAt`
- `updatedAt`

See `src/worker/types.ts` for exact TypeScript interfaces.
