import 'dotenv/config';
import { existsSync } from 'node:fs';
import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  encodeAbiParameters,
  parseAbiParameters,
  type Hex,
  type Address,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import Redis from 'ioredis';
export function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === '') throw new Error(`Missing required env var: ${name}`);
  return v.trim();
}

export function optionalEnv(name: string, fallback: string): string {
  const v = process.env[name];
  return v && v.trim() !== '' ? v.trim() : fallback;
}

function resolveEndpoint(value: string): string {
  if (existsSync('/.dockerenv')) return value;
  if (value.includes('host.docker.internal')) {
    return value.replaceAll('host.docker.internal', '127.0.0.1');
  }
  if (value.includes('redis://redis:')) {
    return value.replace('redis://redis:', 'redis://127.0.0.1:');
  }
  if (value.includes('http://graphql-engine:')) {
    return value.replace('http://graphql-engine:', 'http://127.0.0.1:');
  }
  return value;
}

const rpcUrl = resolveEndpoint(optionalEnv('ADI_RPC_URL', 'http://127.0.0.1:8545'));
const redisUrl = resolveEndpoint(optionalEnv('REDIS_URL', 'redis://127.0.0.1:6379'));
const graphQlUrl = resolveEndpoint(
  optionalEnv('INDEXER_GRAPHQL_URL', 'http://127.0.0.1:8081/v1/graphql'),
);

export const ADI_CHAIN = {
  id: Number(process.env.CHAIN_ID ?? '99999'),
  name: 'ADI',
  nativeCurrency: { name: 'ADI', symbol: 'ADI', decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl] },
  },
} as const;

export function contractAddresses() {
  return {
    paymentRegistry: requiredEnv('PAYMENT_REGISTRY') as Address,
    policyRegistry: requiredEnv('POLICY_REGISTRY') as Address,
    issuanceRegistry: requiredEnv('ISSUANCE_REGISTRY') as Address,
    tokenisationEngine: requiredEnv('TOKENISATION_ENGINE') as Address,
    rwaToken: requiredEnv('RWA_TOKEN') as Address,
  };
}

export function makePublicClient() {
  return createPublicClient({
    chain: ADI_CHAIN,
    transport: http(rpcUrl),
  });
}

export function makeWalletClient(privateKey: Hex) {
  const account = privateKeyToAccount(privateKey);
  const client = createWalletClient({
    account,
    chain: ADI_CHAIN,
    transport: http(rpcUrl),
  });
  return { client, account };
}

export function makeRedis(): Redis {
  return new Redis(redisUrl);
}

export async function gqlQuery<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(graphQlUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL HTTP error ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '));
  if (!json.data) throw new Error('Empty GraphQL response');
  return json.data;
}
export function attestorLeaf(attestor: Address): Hex {
  return keccak256(encodeAbiParameters(parseAbiParameters('address'), [attestor]));
}

export function singleAttestorRoot(attestor: Address): Hex {
  return attestorLeaf(attestor);
}

export const paymentRegistryAbi = [
  {
    type: 'function',
    stateMutability: 'nonpayable',
    name: 'setParticipantRole',
    inputs: [
      { name: 'participant', type: 'address' },
      { name: 'role', type: 'uint8' },
      { name: 'enabled', type: 'bool' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    name: 'setParticipantStatus',
    inputs: [
      { name: 'participant', type: 'address' },
      { name: 'active', type: 'bool' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    stateMutability: 'view',
    name: 'hasRole',
    inputs: [
      { name: 'participant', type: 'address' },
      { name: 'role', type: 'uint8' },
    ],
    outputs: [{ name: 'allowed', type: 'bool' }],
  },
] as const;

export const policyRegistryAbi = [
  {
    type: 'function',
    stateMutability: 'nonpayable',
    name: 'createPolicy',
    inputs: [
      {
        name: 'parameters',
        type: 'tuple',
        components: [
          { name: 'policyHash', type: 'bytes32' },
          { name: 'attestorSetRoot', type: 'bytes32' },
          { name: 'attestorThreshold', type: 'uint256' },
          { name: 'validFromTimestamp', type: 'uint64' },
          { name: 'validUntilTimestamp', type: 'uint64' },
        ],
      },
    ],
    outputs: [{ name: 'policyIdentifier', type: 'uint256' }],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    name: 'setActivePolicyIdentifier',
    inputs: [{ name: 'policyIdentifier', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    name: 'setPolicyPrivacyConstraints',
    inputs: [
      { name: 'policyIdentifier', type: 'uint256' },
      {
        name: 'constraints',
        type: 'tuple',
        components: [
          { name: 'allowNone', type: 'bool' },
          { name: 'allowDestinationPrivate', type: 'bool' },
          { name: 'allowAmountPrivate', type: 'bool' },
          { name: 'allowFullPrivate', type: 'bool' },
          { name: 'allowPerIssuanceOverride', type: 'bool' },
          { name: 'allowConfigurationUpdates', type: 'bool' },
          { name: 'schemaVersion', type: 'uint32' },
        ],
      },
    ],
    outputs: [],
  },
  {
    type: 'function',
    stateMutability: 'view',
    name: 'nextPolicyIdentifier',
    inputs: [],
    outputs: [{ name: 'nextIdentifier', type: 'uint256' }],
  },
  {
    type: 'function',
    stateMutability: 'view',
    name: 'activePolicyIdentifier',
    inputs: [],
    outputs: [{ name: 'policyIdentifier', type: 'uint256' }],
  },
] as const;

export const issuanceRegistryAbi = [
  { type: 'error', name: 'Unauthorized', inputs: [{ name: 'caller', type: 'address' }] },
  { type: 'error', name: 'InvalidSubject', inputs: [] },
  { type: 'error', name: 'SubjectNotAuthorized', inputs: [{ name: 'subject', type: 'address' }] },
  { type: 'error', name: 'InvalidBeneficiary', inputs: [] },
  { type: 'error', name: 'InvalidAmount', inputs: [] },
  { type: 'error', name: 'InvalidAmountCommitment', inputs: [] },
  { type: 'error', name: 'InvalidDestinationCommitment', inputs: [] },
  { type: 'error', name: 'InvalidPayloadHash', inputs: [] },
  { type: 'error', name: 'InvalidPrivacyConfiguration', inputs: [] },
  {
    type: 'error',
    name: 'RequestExpired',
    inputs: [
      { name: 'requestIdentifier', type: 'uint256' },
      { name: 'expiryTimestamp', type: 'uint64' },
      { name: 'currentTimestamp', type: 'uint64' },
    ],
  },
  {
    type: 'function',
    stateMutability: 'nonpayable',
    name: 'createIssuanceRequest',
    inputs: [
      {
        name: 'parameters',
        type: 'tuple',
        components: [
          { name: 'subject', type: 'address' },
          { name: 'assetIdentifier', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'beneficiary', type: 'address' },
          { name: 'amountCommitment', type: 'bytes32' },
          { name: 'destinationCommitment', type: 'bytes32' },
          { name: 'payloadHash', type: 'bytes32' },
          { name: 'expiryTimestamp', type: 'uint64' },
          { name: 'documentationHash', type: 'bytes32' },
          { name: 'privacyMode', type: 'uint8' },
        ],
      },
    ],
    outputs: [{ name: 'requestIdentifier', type: 'uint256' }],
  },
  {
    type: 'function',
    stateMutability: 'view',
    name: 'getRequest',
    inputs: [{ name: 'requestIdentifier', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'parametersHash', type: 'bytes32' },
          { name: 'issuer', type: 'address' },
          { name: 'subject', type: 'address' },
          { name: 'beneficiary', type: 'address' },
          { name: 'assetIdentifier', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'amountCommitment', type: 'bytes32' },
          { name: 'destinationCommitment', type: 'bytes32' },
          { name: 'payloadHash', type: 'bytes32' },
          { name: 'expiryTimestamp', type: 'uint64' },
          { name: 'documentationHash', type: 'bytes32' },
          { name: 'privacyMode', type: 'uint8' },
          { name: 'privacyContextHash', type: 'bytes32' },
          { name: 'status', type: 'uint8' },
        ],
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'view',
    name: 'nextRequestIdentifier',
    inputs: [],
    outputs: [{ name: 'nextIdentifier', type: 'uint256' }],
  },
] as const;

export const rwaToken1155Abi = [
  {
    type: 'function',
    stateMutability: 'view',
    name: 'balanceOf',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export const PRIVACY_MODE: Record<string, number> = {
  none: 0,
  'dest-private': 1,
  'amount-private': 2,
  'full-private': 3,
};

export const PRIVACY_LABEL: Record<number, string> = {
  0: 'NONE',
  1: 'DESTINATION_PRIVATE',
  2: 'AMOUNT_PRIVATE',
  3: 'FULL_PRIVATE',
};

export const REQUEST_STATUS_LABEL: Record<number, string> = {
  0: 'NONE',
  1: 'REQUESTED',
  2: 'CONSUMED',
  3: 'CANCELLED',
};

export const PAYMENT_ROLE = {
  ADMIN: 0,
  ISSUER: 1,
  EMPLOYEE: 2,
  ATTESTOR: 3,
  AUDITOR: 4,
} as const;
