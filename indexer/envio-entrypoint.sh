#!/usr/bin/env sh
set -eu

HASURA_ENDPOINT="${HASURA_GRAPHQL_ENDPOINT:-http://graphql-engine:8080/v1/metadata}"
HASURA_BASE="${HASURA_ENDPOINT%/v1/metadata}"
HASURA_BASE="${HASURA_BASE%/v1/graphql}"

echo "[indexer] waiting for hasura at ${HASURA_BASE}/healthz"
until node -e "fetch(process.argv[1]).then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" "${HASURA_BASE}/healthz"; do
  sleep 2
done

export TUI_OFF="${TUI_OFF:-true}"

echo "[indexer] running codegen"
npm run codegen

echo "[indexer] running db migrations/setup"
npx envio local db-migrate setup

echo "[indexer] starting indexer"
npm run start
