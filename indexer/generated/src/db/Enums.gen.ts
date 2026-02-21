/* TypeScript file generated from Enums.res by genType. */

/* eslint-disable */
/* tslint:disable */

export type ContractType_t = 
    "ConfidentialSettlement"
  | "IssuanceRegistry"
  | "PaymentRegistry"
  | "PolicyRegistry"
  | "RwaToken1155"
  | "TokenisationEngine";

export type EntityType_t = 
    "IssuanceAuditReceipt"
  | "IssuanceExecution"
  | "IssuanceRequest"
  | "PaymentParticipant"
  | "Policy"
  | "ProofJob"
  | "RawEvent"
  | "SettlementNote"
  | "TokenTransfer"
  | "WorkerPrivacyConfiguration"
  | "dynamic_contract_registry";

export type IssuanceRequestStatus_t = 
    "NONE"
  | "REQUESTED"
  | "CONSUMED"
  | "CANCELLED";

export type PolicyLifecycleStatus_t = "NONE" | "ACTIVE" | "DEPRECATED";

export type PrivacyMode_t = 
    "NONE"
  | "DESTINATION_PRIVATE"
  | "AMOUNT_PRIVATE"
  | "FULL_PRIVATE";

export type ProofJobStatus_t = 
    "PENDING"
  | "RUNNING"
  | "RETRY"
  | "COMPLETED"
  | "DEAD_LETTER";
