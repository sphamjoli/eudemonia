import {
  createPublicClient,
  createWalletClient,
  custom,
  encodeAbiParameters,
  http,
  keccak256,
  parseAbi,
  toHex,
  type Address,
  type Hex,
  type WalletClient,
} from 'viem';
import type { Eip1193Provider } from '../ethereum';
import { appConfig } from './config';

/** Canonical zero bytes32 value. */
export const ZERO_HASH = `0x${'00'.repeat(32)}` as Hex;

/** Privacy mode enum labels mirrored from the contracts. */
export const PRIVACY_MODES = [
  { value: 0, label: 'No Privacy', key: 'NONE' },
  { value: 1, label: 'Destination Private', key: 'DESTINATION_PRIVATE' },
  { value: 2, label: 'Amount Private', key: 'AMOUNT_PRIVATE' },
  { value: 3, label: 'Full Private', key: 'FULL_PRIVATE' },
] as const;

/** Numeric privacy mode used by contract calls. */
export type PrivacyModeValue = (typeof PRIVACY_MODES)[number]['value'];

/** Named privacy mode used by indexed state and UX labels. */
export type PrivacyModeKey = (typeof PRIVACY_MODES)[number]['key'];

/** Application chain configuration for viem clients. */
export const adiChain = {
  id: appConfig.chainId,
  name: appConfig.chainName,
  nativeCurrency: {
    name: appConfig.chainName,
    symbol: appConfig.chainSymbol,
    decimals: appConfig.chainDecimals,
  },
  rpcUrls: { default: { http: [appConfig.rpcUrl] } },
} as const;

/** Public read-only EVM client. */
export const publicClient = createPublicClient({
  chain: adiChain,
  transport: http(appConfig.rpcUrl),
});

/** Issuance registry ABI subset used by frontend workflows. */
export const issuanceRegistryAbi = parseAbi([
  'function createIssuanceRequest((address subject,uint256 assetIdentifier,uint256 amount,address beneficiary,bytes32 amountCommitment,bytes32 destinationCommitment,bytes32 payloadHash,uint64 expiryTimestamp,bytes32 documentationHash,uint8 privacyMode) parameters) returns (uint256 requestIdentifier)',
  'function cancelIssuanceRequest(uint256 requestIdentifier)',
  'function setMyPrivacyConfiguration((uint8 mode,bytes32 spendingPublicKey,bytes32 viewingPublicKey,bytes32 metadataHash,uint32 schemaVersion) parameters)',
  'function getPrivacyConfiguration(address worker) view returns ((uint8 mode,bytes32 spendingPublicKey,bytes32 viewingPublicKey,bytes32 metadataHash,uint32 schemaVersion,uint64 updatedAt,bool isConfigured) configuration)',
  'function getRequest(uint256 requestIdentifier) view returns ((bytes32 parametersHash,address issuer,address subject,address beneficiary,uint256 assetIdentifier,uint256 amount,bytes32 amountCommitment,bytes32 destinationCommitment,bytes32 payloadHash,uint64 expiryTimestamp,bytes32 documentationHash,uint8 privacyMode,bytes32 privacyContextHash,uint8 status) request)',
  'function paymentRegistry() view returns (address)',
  'function nextRequestIdentifier() view returns (uint256)',
]);

/** Payment registry ABI subset used for role-based routing and participant management. */
export const paymentRegistryAbi = parseAbi([
  'function owner() view returns (address)',
  'function getParticipant(address participant) view returns ((uint256 roleMask,bool active,bytes32 profileHash,uint64 createdAt,uint64 updatedAt,bool exists) participantState)',
  'function hasRole(address participant,uint8 role) view returns (bool allowed)',
  'function isActive(address participant) view returns (bool participantActive)',
  'function setParticipantRole(address participant,uint8 role,bool enabled)',
  'function batchSetParticipantRole(address[] participants,uint8 role,bool enabled)',
  'function setParticipantStatus(address participant,bool active)',
  'function setParticipantProfile(address participant,bytes32 profileHash)',
]);

/** Policy registry ABI subset used by frontend workflows. */
export const policyRegistryAbi = parseAbi([
  'error PolicyDoesNotExist(uint256 policyIdentifier)',
  'error InvalidPolicyStatus(uint256 policyIdentifier,uint8 expectedStatus,uint8 actualStatus)',
  'error InvalidPolicyHash()',
  'error InvalidAttestorSetRoot()',
  'error InvalidAttestorThreshold()',
  'error InvalidValidityWindow(uint64 validFromTimestamp,uint64 validUntilTimestamp)',
  'error InvalidPrivacyConstraintSchemaVersion()',
  'error OwnableUnauthorizedAccount(address account)',
  'function createPolicy((bytes32 policyHash,bytes32 attestorSetRoot,uint256 attestorThreshold,uint64 validFromTimestamp,uint64 validUntilTimestamp) parameters) returns (uint256 policyIdentifier)',
  'function setActivePolicyIdentifier(uint256 policyIdentifier)',
  'function nextPolicyIdentifier() view returns (uint256)',
  'function getPolicy(uint256 policyIdentifier) view returns ((bytes32 policyHash,bytes32 attestorSetRoot,uint256 attestorThreshold,uint64 validFromTimestamp,uint64 validUntilTimestamp,uint8 status) policy)',
  'function isPolicyValidAt(uint256 policyIdentifier,uint64 timestamp) view returns (bool valid)',
  'function setPolicyPrivacyConstraints(uint256 policyIdentifier,(bool allowNone,bool allowDestinationPrivate,bool allowAmountPrivate,bool allowFullPrivate,bool allowPerIssuanceOverride,bool allowConfigurationUpdates,uint32 schemaVersion) constraints)',
  'function activePolicyIdentifier() view returns (uint256)',
  'function getPolicyPrivacyConstraints(uint256 policyIdentifier) view returns ((bool allowNone,bool allowDestinationPrivate,bool allowAmountPrivate,bool allowFullPrivate,bool allowPerIssuanceOverride,bool allowConfigurationUpdates,uint32 schemaVersion) constraints)',
]);

/** Tokenisation engine ABI subset used by frontend workflows. */
export const tokenisationEngineAbi = parseAbi([
  'function verifyAndExecuteIssuance((uint256 requestIdentifier,uint256 policyIdentifier,bytes publicValues,bytes proofBytes) parameters)',
  'function sp1Verifier() view returns (address)',
  'function programVerificationKey() view returns (bytes32)',
  'function issuanceRegistry() view returns (address)',
  'function policyRegistry() view returns (address)',
  'function rwaToken() view returns (address)',
  'function confidentialSettlement() view returns (address)',
  'function umbraCore() view returns (address)',
  'function umbraBatchSend() view returns (address)',
]);

/** RWA token ABI subset used by dashboard system reads. */
export const rwaTokenAbi = parseAbi([
  'function engineAddress() view returns (address)',
  'function contractURI() view returns (string)',
  'function balanceOf(address account,uint256 id) view returns (uint256)',
]);

/** Confidential settlement ABI subset used by audit/system reads. */
export const confidentialSettlementAbi = parseAbi([
  'function nextNoteIdentifier() view returns (uint256)',
  'function getNote(uint256 noteIdentifier) view returns ((uint256 requestIdentifier,uint256 policyIdentifier,address issuer,address subject,address beneficiary,uint256 assetIdentifier,uint256 amount,bytes32 amountCommitment,bytes32 destinationCommitment,bytes32 payloadHash,uint8 privacyMode,uint64 committedAt,bool claimed,uint64 claimedAt) note)',
  'function isNullifierUsed(bytes32 nullifier) view returns (bool)',
]);

/** Returns current wallet client bound to the selected browser provider. */
export function getWalletClient(provider: Eip1193Provider): WalletClient {
  return createWalletClient({
    chain: adiChain,
    transport: custom(provider),
  });
}

/** Returns privacy mode key from a numeric enum value. */
export function privacyModeKey(value: number): PrivacyModeKey {
  if (value === 1) return 'DESTINATION_PRIVATE';
  if (value === 2) return 'AMOUNT_PRIVATE';
  if (value === 3) return 'FULL_PRIVATE';
  return 'NONE';
}

/** Returns readable privacy mode label from enum value. */
export function privacyModeLabel(value: number): string {
  return PRIVACY_MODES.find((mode) => mode.value === value)?.label ?? 'Unknown';
}

/** Returns readable privacy mode label from enum key value. */
export function privacyModeLabelFromKey(value: string): string {
  return PRIVACY_MODES.find((mode) => mode.key === value)?.label ?? value;
}

/** Converts plain text into deterministic bytes32 commitment. */
export function hashText(value: string): Hex {
  return keccak256(toHex(value));
}

/** Calculates privacy context hash exactly as IssuanceRegistry. */
export function computePrivacyContextHash(parameters: {
  worker: Address;
  mode: number;
  spendingPublicKey: Hex;
  viewingPublicKey: Hex;
  metadataHash: Hex;
  schemaVersion: number;
}): Hex {
  return keccak256(
    encodeAbiParameters(
      [
        { type: 'address' },
        { type: 'uint8' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'uint32' },
      ],
      [
        parameters.worker,
        parameters.mode,
        parameters.spendingPublicKey,
        parameters.viewingPublicKey,
        parameters.metadataHash,
        parameters.schemaVersion,
      ],
    ),
  );
}

/** Request hash input used for canonical `parametersHash` preview. */
export interface RequestHashInput {
  /** Asset identifier issued by the institution. */
  assetIdentifier: bigint;
  /** Public amount (or 0 in amount-private/full-private modes). */
  amount: bigint;
  /** Beneficiary address (or zero address in destination-private/full-private modes). */
  beneficiary: Address;
  /** Amount commitment for private amount modes. */
  amountCommitment: Hex;
  /** Destination commitment for private destination modes. */
  destinationCommitment: Hex;
  /** Payload hash bound to private settlement context. */
  payloadHash: Hex;
  /** Request expiration timestamp. */
  expiryTimestamp: bigint;
  /** Hash of compliance documentation bundle. */
  documentationHash: Hex;
  /** Issuer wallet address. */
  issuer: Address;
  /** Subject/worker address. */
  subject: Address;
  /** Privacy mode enum value. */
  privacyMode: number;
  /** Privacy profile snapshot hash. */
  privacyContextHash: Hex;
}

/** Calculates request `parametersHash` exactly as IssuanceRegistry. */
export function computeRequestParametersHash(input: RequestHashInput): Hex {
  return keccak256(
    encodeAbiParameters(
      [
        { type: 'uint256' },
        { type: 'uint256' },
        { type: 'address' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'uint64' },
        { type: 'bytes32' },
        { type: 'address' },
        { type: 'address' },
        { type: 'uint8' },
        { type: 'bytes32' },
        { type: 'uint256' },
        { type: 'address' },
      ],
      [
        input.assetIdentifier,
        input.amount,
        input.beneficiary,
        input.amountCommitment,
        input.destinationCommitment,
        input.payloadHash,
        input.expiryTimestamp,
        input.documentationHash,
        input.issuer,
        input.subject,
        input.privacyMode,
        input.privacyContextHash,
        BigInt(appConfig.chainId),
        appConfig.issuanceRegistry,
      ],
    ),
  );
}

/** Encodes `(parametersHash, policyHash)` as engine-compatible public values bytes. */
export function encodePublicValues(parametersHash: Hex, policyHash: Hex): Hex {
  return encodeAbiParameters(
    [{ type: 'bytes32' }, { type: 'bytes32' }],
    [parametersHash, policyHash],
  );
}
