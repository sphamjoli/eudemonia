import { isAddress, zeroAddress, type Address } from 'viem';

/** Application runtime configuration sourced from Vite env variables. */
export interface AppConfig {
  /** Chain id targeted by wallet and contract interactions. */
  chainId: number;
  /** Chain display name used for wallet add/switch flows. */
  chainName: string;
  /** Native currency symbol for wallet add/switch flows. */
  chainSymbol: string;
  /** Native currency decimals for wallet add/switch flows. */
  chainDecimals: number;
  /** RPC endpoint used by public reads. */
  rpcUrl: string;
  /** Hasura/Envio GraphQL endpoint used for indexed state and audit views. */
  indexerGraphqlUrl: string;
  /** Optional Hasura admin secret when required by deployment. */
  hasuraAdminSecret?: string;
  /** Optional explorer base URL used to build tx links in audit views. */
  explorerBaseUrl?: string;
  /** Issuance registry contract address. */
  issuanceRegistry: Address;
  /** Payment registry contract address. */
  paymentRegistry: Address;
  /** Policy registry contract address. */
  policyRegistry: Address;
  /** Tokenisation engine contract address. */
  tokenisationEngine: Address;
  /** RWA token contract address. */
  rwaToken: Address;
  /** Confidential settlement contract address. */
  confidentialSettlement: Address;
  /** Optional SP1 verifier address hint for system panel display. */
  sp1VerifierAddress?: Address;
}

/** Converts an env value to an address, returning zero address when invalid/missing. */
function envAddress(value: string | undefined): Address {
  if (value && isAddress(value)) {
    return value;
  }
  return zeroAddress;
}

/** Global frontend configuration. */
export const appConfig: AppConfig = {
  chainId: Number(import.meta.env.VITE_CHAIN_ID || 99999),
  chainName: String(import.meta.env.VITE_CHAIN_NAME || 'ADI Testnet'),
  chainSymbol: String(import.meta.env.VITE_CHAIN_SYMBOL || 'ADI'),
  chainDecimals: Number(import.meta.env.VITE_CHAIN_DECIMALS || 18),
  rpcUrl: String(import.meta.env.VITE_ADI_RPC_URL || 'http://127.0.0.1:8545'),
  indexerGraphqlUrl: String(
    import.meta.env.VITE_INDEXER_GRAPHQL_URL || 'http://127.0.0.1:8081/v1/graphql',
  ),
  hasuraAdminSecret: import.meta.env.VITE_HASURA_ADMIN_SECRET || undefined,
  explorerBaseUrl: import.meta.env.VITE_EXPLORER_BASE_URL || undefined,
  issuanceRegistry: envAddress(import.meta.env.VITE_ISSUANCE_REGISTRY),
  paymentRegistry: envAddress(import.meta.env.VITE_PAYMENT_REGISTRY),
  policyRegistry: envAddress(import.meta.env.VITE_POLICY_REGISTRY),
  tokenisationEngine: envAddress(import.meta.env.VITE_ENGINE),
  rwaToken: envAddress(import.meta.env.VITE_RWA_TOKEN),
  confidentialSettlement: envAddress(import.meta.env.VITE_CONFIDENTIAL_SETTLEMENT),
  sp1VerifierAddress: import.meta.env.VITE_SP1_VERIFIER
    ? envAddress(import.meta.env.VITE_SP1_VERIFIER)
    : undefined,
};

/** Contract address collection for compact rendering in UI. */
export const appContracts = {
  issuanceRegistry: appConfig.issuanceRegistry,
  paymentRegistry: appConfig.paymentRegistry,
  policyRegistry: appConfig.policyRegistry,
  tokenisationEngine: appConfig.tokenisationEngine,
  rwaToken: appConfig.rwaToken,
  confidentialSettlement: appConfig.confidentialSettlement,
};
