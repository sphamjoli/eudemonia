/* TypeScript file generated from Entities.res by genType. */

/* eslint-disable */
/* tslint:disable */

import type {IssuanceRequestStatus_t as Enums_IssuanceRequestStatus_t} from './Enums.gen';

import type {PolicyLifecycleStatus_t as Enums_PolicyLifecycleStatus_t} from './Enums.gen';

import type {PrivacyMode_t as Enums_PrivacyMode_t} from './Enums.gen';

import type {ProofJobStatus_t as Enums_ProofJobStatus_t} from './Enums.gen';

export type id = string;

export type whereOperations<entity,fieldType> = {
  readonly eq: (_1:fieldType) => Promise<entity[]>; 
  readonly gt: (_1:fieldType) => Promise<entity[]>; 
  readonly lt: (_1:fieldType) => Promise<entity[]>
};

export type IssuanceAuditReceipt_t = {
  readonly blockNumber: bigint; 
  readonly blockTimestamp: bigint; 
  readonly id: id; 
  readonly parametersHash: string; 
  readonly policyHash: string; 
  readonly policyIdentifier: bigint; 
  readonly privacyContextHash: string; 
  readonly privacyMode: Enums_PrivacyMode_t; 
  readonly requestIdentifier: bigint; 
  readonly txHash: string
};

export type IssuanceAuditReceipt_indexedFieldOperations = {};

export type IssuanceExecution_t = {
  readonly amount: bigint; 
  readonly amountCommitment: string; 
  readonly assetIdentifier: bigint; 
  readonly beneficiary: string; 
  readonly blockNumber: bigint; 
  readonly blockTimestamp: bigint; 
  readonly destinationCommitment: string; 
  readonly id: id; 
  readonly parametersHash: string; 
  readonly payloadHash: string; 
  readonly policyHash: string; 
  readonly policyIdentifier: bigint; 
  readonly privacyMode: Enums_PrivacyMode_t; 
  readonly requestIdentifier: bigint; 
  readonly txHash: string
};

export type IssuanceExecution_indexedFieldOperations = {};

export type IssuanceRequest_t = {
  readonly amount: bigint; 
  readonly amountCommitment: string; 
  readonly assetIdentifier: bigint; 
  readonly beneficiary: string; 
  readonly createdAt: bigint; 
  readonly createdBlockNumber: bigint; 
  readonly createdTxHash: string; 
  readonly destinationCommitment: string; 
  readonly documentationHash: string; 
  readonly expiryTimestamp: bigint; 
  readonly id: id; 
  readonly issuer: string; 
  readonly parametersHash: string; 
  readonly payloadHash: string; 
  readonly privacyContextHash: string; 
  readonly privacyMode: Enums_PrivacyMode_t; 
  readonly requestIdentifier: bigint; 
  readonly status: Enums_IssuanceRequestStatus_t; 
  readonly subject: string; 
  readonly updatedAt: bigint; 
  readonly updatedBlockNumber: bigint; 
  readonly updatedTxHash: string
};

export type IssuanceRequest_indexedFieldOperations = {};

export type PaymentParticipant_t = {
  readonly active: boolean; 
  readonly createdAt: bigint; 
  readonly id: id; 
  readonly participant: string; 
  readonly profileHash: string; 
  readonly roleMask: bigint; 
  readonly updatedAt: bigint; 
  readonly updatedBlockNumber: bigint; 
  readonly updatedTxHash: string
};

export type PaymentParticipant_indexedFieldOperations = {};

export type Policy_t = {
  readonly allowAmountPrivate: boolean; 
  readonly allowConfigurationUpdates: boolean; 
  readonly allowDestinationPrivate: boolean; 
  readonly allowFullPrivate: boolean; 
  readonly allowNone: boolean; 
  readonly allowPerIssuanceOverride: boolean; 
  readonly attestorSetRoot: string; 
  readonly attestorThreshold: bigint; 
  readonly createdAt: bigint; 
  readonly createdBlockNumber: bigint; 
  readonly createdTxHash: string; 
  readonly id: id; 
  readonly isActive: boolean; 
  readonly policyHash: string; 
  readonly policyIdentifier: bigint; 
  readonly privacySchemaVersion: number; 
  readonly status: Enums_PolicyLifecycleStatus_t; 
  readonly updatedAt: bigint; 
  readonly updatedBlockNumber: bigint; 
  readonly updatedTxHash: string; 
  readonly validFromTimestamp: bigint; 
  readonly validUntilTimestamp: bigint
};

export type Policy_indexedFieldOperations = {};

export type ProofJob_t = {
  readonly attemptCount: number; 
  readonly createdAt: bigint; 
  readonly id: id; 
  readonly lastError: (undefined | string); 
  readonly lastTxHash: (undefined | string); 
  readonly lockOwner: (undefined | string); 
  readonly lockedAt: (undefined | bigint); 
  readonly nextAttemptAt: bigint; 
  readonly policyIdentifier: bigint; 
  readonly requestIdentifier: bigint; 
  readonly status: Enums_ProofJobStatus_t; 
  readonly updatedAt: bigint
};

export type ProofJob_indexedFieldOperations = {};

export type RawEvent_t = {
  readonly blockNumber: bigint; 
  readonly blockTimestamp: bigint; 
  readonly contractAddress: string; 
  readonly contractName: string; 
  readonly eventName: string; 
  readonly id: id; 
  readonly logIndex: bigint; 
  readonly payloadJson: string; 
  readonly topic0: (undefined | string); 
  readonly topic1: (undefined | string); 
  readonly topic2: (undefined | string); 
  readonly topic3: (undefined | string); 
  readonly txHash: string
};

export type RawEvent_indexedFieldOperations = {};

export type SettlementNote_t = {
  readonly amount: bigint; 
  readonly amountCommitment: string; 
  readonly beneficiary: string; 
  readonly blockNumber: bigint; 
  readonly blockTimestamp: bigint; 
  readonly destinationCommitment: string; 
  readonly id: id; 
  readonly noteIdentifier: bigint; 
  readonly payloadHash: string; 
  readonly policyIdentifier: bigint; 
  readonly privacyMode: Enums_PrivacyMode_t; 
  readonly requestIdentifier: bigint; 
  readonly txHash: string
};

export type SettlementNote_indexedFieldOperations = {};

export type TokenTransfer_t = {
  readonly amount: bigint; 
  readonly blockNumber: bigint; 
  readonly blockTimestamp: bigint; 
  readonly from: string; 
  readonly id: id; 
  readonly operator: string; 
  readonly to: string; 
  readonly tokenIdentifier: bigint; 
  readonly txHash: string
};

export type TokenTransfer_indexedFieldOperations = {};

export type WorkerPrivacyConfiguration_t = {
  readonly id: id; 
  readonly metadataHash: string; 
  readonly mode: Enums_PrivacyMode_t; 
  readonly schemaVersion: number; 
  readonly spendingPublicKey: string; 
  readonly updatedAt: bigint; 
  readonly updatedBlockNumber: bigint; 
  readonly updatedTxHash: string; 
  readonly viewingPublicKey: string; 
  readonly worker: string
};

export type WorkerPrivacyConfiguration_indexedFieldOperations = {};
