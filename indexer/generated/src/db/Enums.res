module ContractType = {
  @genType
  type t = 
    | @as("ConfidentialSettlement") ConfidentialSettlement
    | @as("IssuanceRegistry") IssuanceRegistry
    | @as("PaymentRegistry") PaymentRegistry
    | @as("PolicyRegistry") PolicyRegistry
    | @as("RwaToken1155") RwaToken1155
    | @as("TokenisationEngine") TokenisationEngine

  let name = "CONTRACT_TYPE"
  let variants = [
    ConfidentialSettlement,
    IssuanceRegistry,
    PaymentRegistry,
    PolicyRegistry,
    RwaToken1155,
    TokenisationEngine,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

module EntityType = {
  @genType
  type t = 
    | @as("IssuanceAuditReceipt") IssuanceAuditReceipt
    | @as("IssuanceExecution") IssuanceExecution
    | @as("IssuanceRequest") IssuanceRequest
    | @as("PaymentParticipant") PaymentParticipant
    | @as("Policy") Policy
    | @as("ProofJob") ProofJob
    | @as("RawEvent") RawEvent
    | @as("SettlementNote") SettlementNote
    | @as("TokenTransfer") TokenTransfer
    | @as("WorkerPrivacyConfiguration") WorkerPrivacyConfiguration
    | @as("dynamic_contract_registry") DynamicContractRegistry

  let name = "ENTITY_TYPE"
  let variants = [
    IssuanceAuditReceipt,
    IssuanceExecution,
    IssuanceRequest,
    PaymentParticipant,
    Policy,
    ProofJob,
    RawEvent,
    SettlementNote,
    TokenTransfer,
    WorkerPrivacyConfiguration,
    DynamicContractRegistry,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

module IssuanceRequestStatus = {
  @genType
  type t = 
    | @as("NONE") NONE
    | @as("REQUESTED") REQUESTED
    | @as("CONSUMED") CONSUMED
    | @as("CANCELLED") CANCELLED

  let name = "IssuanceRequestStatus"
  let variants = [
    NONE,
    REQUESTED,
    CONSUMED,
    CANCELLED,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

module PolicyLifecycleStatus = {
  @genType
  type t = 
    | @as("NONE") NONE
    | @as("ACTIVE") ACTIVE
    | @as("DEPRECATED") DEPRECATED

  let name = "PolicyLifecycleStatus"
  let variants = [
    NONE,
    ACTIVE,
    DEPRECATED,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

module PrivacyMode = {
  @genType
  type t = 
    | @as("NONE") NONE
    | @as("DESTINATION_PRIVATE") DESTINATION_PRIVATE
    | @as("AMOUNT_PRIVATE") AMOUNT_PRIVATE
    | @as("FULL_PRIVATE") FULL_PRIVATE

  let name = "PrivacyMode"
  let variants = [
    NONE,
    DESTINATION_PRIVATE,
    AMOUNT_PRIVATE,
    FULL_PRIVATE,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

module ProofJobStatus = {
  @genType
  type t = 
    | @as("PENDING") PENDING
    | @as("RUNNING") RUNNING
    | @as("RETRY") RETRY
    | @as("COMPLETED") COMPLETED
    | @as("DEAD_LETTER") DEAD_LETTER

  let name = "ProofJobStatus"
  let variants = [
    PENDING,
    RUNNING,
    RETRY,
    COMPLETED,
    DEAD_LETTER,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

let allEnums = ([
  ContractType.config->Internal.fromGenericEnumConfig,
  EntityType.config->Internal.fromGenericEnumConfig,
  IssuanceRequestStatus.config->Internal.fromGenericEnumConfig,
  PolicyLifecycleStatus.config->Internal.fromGenericEnumConfig,
  PrivacyMode.config->Internal.fromGenericEnumConfig,
  ProofJobStatus.config->Internal.fromGenericEnumConfig,
])
