  @genType
module ConfidentialSettlement = {
  module EngineAddressUpdated = Types.MakeRegister(Types.ConfidentialSettlement.EngineAddressUpdated)
  module Initialized = Types.MakeRegister(Types.ConfidentialSettlement.Initialized)
  module NoteClaimed = Types.MakeRegister(Types.ConfidentialSettlement.NoteClaimed)
  module NoteCommitted = Types.MakeRegister(Types.ConfidentialSettlement.NoteCommitted)
  module OwnershipTransferStarted = Types.MakeRegister(Types.ConfidentialSettlement.OwnershipTransferStarted)
  module OwnershipTransferred = Types.MakeRegister(Types.ConfidentialSettlement.OwnershipTransferred)
  module Upgraded = Types.MakeRegister(Types.ConfidentialSettlement.Upgraded)
}

  @genType
module IssuanceRegistry = {
  module EngineAddressUpdated = Types.MakeRegister(Types.IssuanceRegistry.EngineAddressUpdated)
  module Initialized = Types.MakeRegister(Types.IssuanceRegistry.Initialized)
  module IssuanceRequestCancelled = Types.MakeRegister(Types.IssuanceRegistry.IssuanceRequestCancelled)
  module IssuanceRequestConsumed = Types.MakeRegister(Types.IssuanceRegistry.IssuanceRequestConsumed)
  module IssuanceRequestCreated = Types.MakeRegister(Types.IssuanceRegistry.IssuanceRequestCreated)
  module IssuanceRequestPrivacyBound = Types.MakeRegister(Types.IssuanceRegistry.IssuanceRequestPrivacyBound)
  module PaymentRegistryUpdated = Types.MakeRegister(Types.IssuanceRegistry.PaymentRegistryUpdated)
  module WorkerPrivacyConfigurationUpdated = Types.MakeRegister(Types.IssuanceRegistry.WorkerPrivacyConfigurationUpdated)
  module OwnershipTransferStarted = Types.MakeRegister(Types.IssuanceRegistry.OwnershipTransferStarted)
  module OwnershipTransferred = Types.MakeRegister(Types.IssuanceRegistry.OwnershipTransferred)
  module Upgraded = Types.MakeRegister(Types.IssuanceRegistry.Upgraded)
}

  @genType
module PaymentRegistry = {
  module Initialized = Types.MakeRegister(Types.PaymentRegistry.Initialized)
  module OwnershipTransferStarted = Types.MakeRegister(Types.PaymentRegistry.OwnershipTransferStarted)
  module OwnershipTransferred = Types.MakeRegister(Types.PaymentRegistry.OwnershipTransferred)
  module ParticipantProfileUpdated = Types.MakeRegister(Types.PaymentRegistry.ParticipantProfileUpdated)
  module ParticipantRoleUpdated = Types.MakeRegister(Types.PaymentRegistry.ParticipantRoleUpdated)
  module ParticipantStatusUpdated = Types.MakeRegister(Types.PaymentRegistry.ParticipantStatusUpdated)
  module Upgraded = Types.MakeRegister(Types.PaymentRegistry.Upgraded)
}

  @genType
module PolicyRegistry = {
  module ActivePolicyIdentifierUpdated = Types.MakeRegister(Types.PolicyRegistry.ActivePolicyIdentifierUpdated)
  module Initialized = Types.MakeRegister(Types.PolicyRegistry.Initialized)
  module OwnershipTransferStarted = Types.MakeRegister(Types.PolicyRegistry.OwnershipTransferStarted)
  module OwnershipTransferred = Types.MakeRegister(Types.PolicyRegistry.OwnershipTransferred)
  module PolicyCreated = Types.MakeRegister(Types.PolicyRegistry.PolicyCreated)
  module PolicyDeprecated = Types.MakeRegister(Types.PolicyRegistry.PolicyDeprecated)
  module PolicyPrivacyConstraintsUpdated = Types.MakeRegister(Types.PolicyRegistry.PolicyPrivacyConstraintsUpdated)
  module Upgraded = Types.MakeRegister(Types.PolicyRegistry.Upgraded)
}

  @genType
module RwaToken1155 = {
  module ApprovalForAll = Types.MakeRegister(Types.RwaToken1155.ApprovalForAll)
  module ContractURIUpdated = Types.MakeRegister(Types.RwaToken1155.ContractURIUpdated)
  module EngineAddressUpdated = Types.MakeRegister(Types.RwaToken1155.EngineAddressUpdated)
  module Initialized = Types.MakeRegister(Types.RwaToken1155.Initialized)
  module OwnershipTransferStarted = Types.MakeRegister(Types.RwaToken1155.OwnershipTransferStarted)
  module OwnershipTransferred = Types.MakeRegister(Types.RwaToken1155.OwnershipTransferred)
  module TransferBatch = Types.MakeRegister(Types.RwaToken1155.TransferBatch)
  module TransferSingle = Types.MakeRegister(Types.RwaToken1155.TransferSingle)
  module URI = Types.MakeRegister(Types.RwaToken1155.URI)
  module Upgraded = Types.MakeRegister(Types.RwaToken1155.Upgraded)
}

  @genType
module TokenisationEngine = {
  module Initialized = Types.MakeRegister(Types.TokenisationEngine.Initialized)
  module IssuanceAuditReceipt = Types.MakeRegister(Types.TokenisationEngine.IssuanceAuditReceipt)
  module IssuanceExecuted = Types.MakeRegister(Types.TokenisationEngine.IssuanceExecuted)
  module IssuanceRegistryUpdated = Types.MakeRegister(Types.TokenisationEngine.IssuanceRegistryUpdated)
  module OwnershipTransferStarted = Types.MakeRegister(Types.TokenisationEngine.OwnershipTransferStarted)
  module OwnershipTransferred = Types.MakeRegister(Types.TokenisationEngine.OwnershipTransferred)
  module PolicyRegistryUpdated = Types.MakeRegister(Types.TokenisationEngine.PolicyRegistryUpdated)
  module ProgramVerificationKeyUpdated = Types.MakeRegister(Types.TokenisationEngine.ProgramVerificationKeyUpdated)
  module RwaTokenUpdated = Types.MakeRegister(Types.TokenisationEngine.RwaTokenUpdated)
  module ConfidentialSettlementUpdated = Types.MakeRegister(Types.TokenisationEngine.ConfidentialSettlementUpdated)
  module Sp1VerifierUpdated = Types.MakeRegister(Types.TokenisationEngine.Sp1VerifierUpdated)
  module UmbraBatchSendUpdated = Types.MakeRegister(Types.TokenisationEngine.UmbraBatchSendUpdated)
  module UmbraCoreUpdated = Types.MakeRegister(Types.TokenisationEngine.UmbraCoreUpdated)
  module Upgraded = Types.MakeRegister(Types.TokenisationEngine.Upgraded)
}

@genType /** Register a Block Handler. It'll be called for every block by default. */
let onBlock: (
  Envio.onBlockOptions<Types.chain>,
  Envio.onBlockArgs<Types.handlerContext> => promise<unit>,
) => unit = (
  EventRegister.onBlock: (unknown, Internal.onBlockArgs => promise<unit>) => unit
)->Utils.magic
