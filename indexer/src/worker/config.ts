import 'dotenv/config';

/**
 * Runtime configuration for the SP1 worker pipeline.
 * Values are loaded from environment variables with strict validation.
 */
export interface WorkerConfig {
  /** ADI RPC endpoint used for onchain reads and submissions. */
  adiRpcUrl: string;
  /** Chain id expected by both worker logic and witness generation. */
  chainId: number;
  /** IssuanceRegistry contract address. */
  issuanceRegistry: `0x${string}`;
  /** PolicyRegistry contract address. */
  policyRegistry: `0x${string}`;
  /** TokenisationEngine contract address. */
  tokenisationEngine: `0x${string}`;
  /** Redis connection URL used for compliance/attestation/job state. */
  redisUrl: string;
  /** GraphQL endpoint exposed by Envio HyperIndex. */
  graphQlUrl: string;
  /** Optional Hasura admin secret for authenticated GraphQL queries. */
  graphQlAdminSecret?: string;
  /** Operator private key used to submit execution transactions. */
  privateKey: `0x${string}`;
  /** Poll interval in milliseconds between worker scheduling cycles. */
  pollIntervalMs: number;
  /** Distributed lock TTL for one proof job attempt in milliseconds. */
  proofLockTtlMs: number;
  /** Maximum number of retries before dead-lettering a proof job. */
  proofMaxRetries: number;
  /** Base retry delay in milliseconds for exponential backoff. */
  proofBackoffBaseMs: number;
  /** Maximum retry delay in milliseconds for exponential backoff. */
  proofBackoffMaxMs: number;
  /** Maximum number of jobs to fetch per scheduling cycle. */
  jobBatchSize: number;
  /** Stable worker instance identifier for lock ownership. */
  workerInstanceId: string;
  /** Shell prefix used to invoke the Rust prover CLI. */
  sp1ProverCmd: string;
  /** SP1 program id used by external prover commands. */
  sp1ProgramId: string;
  /** External command template used for proof generation. */
  sp1ProveCommand: string;
  /** External command template used for optional proof verification. */
  sp1VerifyCommand: string;
  /** Enables mock proof output for local demo flows (no prover dependency). */
  sp1MockMode: boolean;
  /** Enables local worker admin API used by demo UI for Redis scenario inspection. */
  workerApiEnabled: boolean;
  /** Local worker admin API port. */
  workerApiPort: number;
}

/**
 * Reads a required environment variable.
 *
 * @param name Environment variable name.
 * @returns Non-empty variable value.
 * @throws Error when the variable is missing or empty.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

/**
 * Reads an environment variable with fallback.
 *
 * @param name Environment variable name.
 * @param defaultValue Value used when the variable is missing or empty.
 * @returns Resolved configuration string value.
 */
function withDefault(name: string, defaultValue: string): string {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : defaultValue;
}

/**
 * Reads a boolean environment variable with fallback.
 *
 * Accepted truthy values: `1`, `true`, `yes`.
 *
 * @param name Environment variable name.
 * @param defaultValue Fallback value when missing.
 * @returns Parsed boolean flag.
 */
function withDefaultBool(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];
  if (!value || value.trim().length === 0) return defaultValue;
  return ['1', 'true', 'yes'].includes(value.trim().toLowerCase());
}

/**
 * Loads and validates worker runtime configuration.
 *
 * @returns Fully-resolved `WorkerConfig` object.
 */
export function loadWorkerConfig(): WorkerConfig {
  const graphQlAdminSecret = withDefault('HASURA_GRAPHQL_ADMIN_SECRET', '').trim();
  return {
    adiRpcUrl: withDefault('ADI_RPC_URL', 'https://rpc.ab.testnet.adifoundation.ai/'),
    chainId: Number(withDefault('CHAIN_ID', '99999')),
    issuanceRegistry: required('ISSUANCE_REGISTRY') as `0x${string}`,
    policyRegistry: required('POLICY_REGISTRY') as `0x${string}`,
    tokenisationEngine: required('TOKENISATION_ENGINE') as `0x${string}`,
    redisUrl: withDefault('REDIS_URL', 'redis://127.0.0.1:6379'),
    graphQlUrl: withDefault('INDEXER_GRAPHQL_URL', 'http://127.0.0.1:8081/v1/graphql'),
    graphQlAdminSecret: graphQlAdminSecret.length > 0 ? graphQlAdminSecret : undefined,
    privateKey: required('PRIVATE_KEY') as `0x${string}`,
    pollIntervalMs: Number(withDefault('WORKER_POLL_INTERVAL_MS', '5000')),
    proofLockTtlMs: Number(withDefault('PROOF_LOCK_TTL_MS', '120000')),
    proofMaxRetries: Number(withDefault('PROOF_MAX_RETRIES', '5')),
    proofBackoffBaseMs: Number(withDefault('PROOF_BACKOFF_BASE_MS', '5000')),
    proofBackoffMaxMs: Number(withDefault('PROOF_BACKOFF_MAX_MS', '300000')),
    jobBatchSize: Number(withDefault('INDEXER_JOB_BATCH_SIZE', '10')),
    workerInstanceId: withDefault('WORKER_INSTANCE_ID', 'worker-1'),
    sp1ProverCmd: withDefault(
      'SP1_PROVER_CMD',
      'cargo run --manifest-path ../crates/prover/Cargo.toml --',
    ),
    sp1ProgramId: withDefault('SP1_PROGRAM_ID', 'payroll_checker'),
    sp1ProveCommand: required('SP1_PROVE_COMMAND'),
    sp1VerifyCommand: withDefault('SP1_VERIFY_COMMAND', 'succinct verify {program_id} {proof}'),
    sp1MockMode: withDefaultBool('SP1_MOCK_MODE', false),
    workerApiEnabled: withDefaultBool('WORKER_API_ENABLED', true),
    workerApiPort: Number(withDefault('WORKER_API_PORT', '8787')),
  };
}
