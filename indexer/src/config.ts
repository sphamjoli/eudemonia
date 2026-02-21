/** Legacy runtime config shim retained for compatibility with existing callsites. */
export const config = {
  /** ADI RPC endpoint URL. */
  ADI_RPC_URL: process.env.ADI_RPC_URL || 'https://rpc.ab.testnet.adifoundation.ai/',
  /** ADI chain id. */
  CHAIN_ID: process.env.CHAIN_ID || '99999',
  /** IssuanceRegistry contract address. */
  ISSUANCE_REGISTRY: process.env.ISSUANCE_REGISTRY || '',
  /** PolicyRegistry contract address. */
  POLICY_REGISTRY: process.env.POLICY_REGISTRY || '',
  /** TokenisationEngine contract address. */
  TOKENISATION_ENGINE: process.env.TOKENISATION_ENGINE || '',
  /** RwaToken1155 contract address. */
  RWA_TOKEN: process.env.RWA_TOKEN || '',
  /** Redis connection URL. */
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  /** Envio GraphQL endpoint. */
  INDEXER_GRAPHQL_URL: process.env.INDEXER_GRAPHQL_URL || 'http://127.0.0.1:8081/v1/graphql',
  /** Rust prover command prefix. */
  SP1_PROVER_CMD:
    process.env.SP1_PROVER_CMD || 'cargo run --manifest-path ../crates/prover/Cargo.toml --',
  /** SP1 program id string. */
  SP1_PROGRAM_ID: process.env.SP1_PROGRAM_ID || 'payroll_checker',
};
