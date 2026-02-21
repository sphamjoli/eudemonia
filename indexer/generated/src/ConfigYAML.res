
type hyperSyncConfig = {endpointUrl: string}
type hyperFuelConfig = {endpointUrl: string}

@genType.opaque
type rpcConfig = {
  syncConfig: Config.sourceSync,
}

@genType
type syncSource = HyperSync(hyperSyncConfig) | HyperFuel(hyperFuelConfig) | Rpc(rpcConfig)

@genType.opaque
type aliasAbi = Ethers.abi

type eventName = string

type contract = {
  name: string,
  abi: aliasAbi,
  addresses: array<string>,
  events: array<eventName>,
}

type configYaml = {
  syncSource,
  startBlock: int,
  confirmedBlockThreshold: int,
  contracts: dict<contract>,
  lowercaseAddresses: bool,
}

let publicConfig = ChainMap.fromArrayUnsafe([
  {
    let contracts = Js.Dict.fromArray([
      (
        "PaymentRegistry",
        {
          name: "PaymentRegistry",
          abi: Types.PaymentRegistry.abi,
          addresses: [
            "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
          ],
          events: [
            Types.PaymentRegistry.Initialized.name,
            Types.PaymentRegistry.OwnershipTransferStarted.name,
            Types.PaymentRegistry.OwnershipTransferred.name,
            Types.PaymentRegistry.ParticipantProfileUpdated.name,
            Types.PaymentRegistry.ParticipantRoleUpdated.name,
            Types.PaymentRegistry.ParticipantStatusUpdated.name,
            Types.PaymentRegistry.Upgraded.name,
          ],
        }
      ),
      (
        "IssuanceRegistry",
        {
          name: "IssuanceRegistry",
          abi: Types.IssuanceRegistry.abi,
          addresses: [
            "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
          ],
          events: [
            Types.IssuanceRegistry.EngineAddressUpdated.name,
            Types.IssuanceRegistry.Initialized.name,
            Types.IssuanceRegistry.IssuanceRequestCancelled.name,
            Types.IssuanceRegistry.IssuanceRequestConsumed.name,
            Types.IssuanceRegistry.IssuanceRequestCreated.name,
            Types.IssuanceRegistry.IssuanceRequestPrivacyBound.name,
            Types.IssuanceRegistry.PaymentRegistryUpdated.name,
            Types.IssuanceRegistry.WorkerPrivacyConfigurationUpdated.name,
            Types.IssuanceRegistry.OwnershipTransferStarted.name,
            Types.IssuanceRegistry.OwnershipTransferred.name,
            Types.IssuanceRegistry.Upgraded.name,
          ],
        }
      ),
      (
        "PolicyRegistry",
        {
          name: "PolicyRegistry",
          abi: Types.PolicyRegistry.abi,
          addresses: [
            "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
          ],
          events: [
            Types.PolicyRegistry.ActivePolicyIdentifierUpdated.name,
            Types.PolicyRegistry.Initialized.name,
            Types.PolicyRegistry.OwnershipTransferStarted.name,
            Types.PolicyRegistry.OwnershipTransferred.name,
            Types.PolicyRegistry.PolicyCreated.name,
            Types.PolicyRegistry.PolicyDeprecated.name,
            Types.PolicyRegistry.PolicyPrivacyConstraintsUpdated.name,
            Types.PolicyRegistry.Upgraded.name,
          ],
        }
      ),
      (
        "TokenisationEngine",
        {
          name: "TokenisationEngine",
          abi: Types.TokenisationEngine.abi,
          addresses: [
            "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1",
          ],
          events: [
            Types.TokenisationEngine.Initialized.name,
            Types.TokenisationEngine.IssuanceAuditReceipt.name,
            Types.TokenisationEngine.IssuanceExecuted.name,
            Types.TokenisationEngine.IssuanceRegistryUpdated.name,
            Types.TokenisationEngine.OwnershipTransferStarted.name,
            Types.TokenisationEngine.OwnershipTransferred.name,
            Types.TokenisationEngine.PolicyRegistryUpdated.name,
            Types.TokenisationEngine.ProgramVerificationKeyUpdated.name,
            Types.TokenisationEngine.RwaTokenUpdated.name,
            Types.TokenisationEngine.ConfidentialSettlementUpdated.name,
            Types.TokenisationEngine.Sp1VerifierUpdated.name,
            Types.TokenisationEngine.UmbraBatchSendUpdated.name,
            Types.TokenisationEngine.UmbraCoreUpdated.name,
            Types.TokenisationEngine.Upgraded.name,
          ],
        }
      ),
      (
        "RwaToken1155",
        {
          name: "RwaToken1155",
          abi: Types.RwaToken1155.abi,
          addresses: [
            "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
          ],
          events: [
            Types.RwaToken1155.ApprovalForAll.name,
            Types.RwaToken1155.ContractURIUpdated.name,
            Types.RwaToken1155.EngineAddressUpdated.name,
            Types.RwaToken1155.Initialized.name,
            Types.RwaToken1155.OwnershipTransferStarted.name,
            Types.RwaToken1155.OwnershipTransferred.name,
            Types.RwaToken1155.TransferBatch.name,
            Types.RwaToken1155.TransferSingle.name,
            Types.RwaToken1155.URI.name,
            Types.RwaToken1155.Upgraded.name,
          ],
        }
      ),
      (
        "ConfidentialSettlement",
        {
          name: "ConfidentialSettlement",
          abi: Types.ConfidentialSettlement.abi,
          addresses: [
            "0x9A676e781A523b5d0C0e43731313A708CB607508",
          ],
          events: [
            Types.ConfidentialSettlement.EngineAddressUpdated.name,
            Types.ConfidentialSettlement.Initialized.name,
            Types.ConfidentialSettlement.NoteClaimed.name,
            Types.ConfidentialSettlement.NoteCommitted.name,
            Types.ConfidentialSettlement.OwnershipTransferStarted.name,
            Types.ConfidentialSettlement.OwnershipTransferred.name,
            Types.ConfidentialSettlement.Upgraded.name,
          ],
        }
      ),
    ])
    let chain = ChainMap.Chain.makeUnsafe(~chainId=99999)
    (
      chain,
      {
        confirmedBlockThreshold: 200,
        syncSource: Rpc({syncConfig: NetworkSources.getSyncConfig({})}),
        startBlock: 0,
        contracts,
        lowercaseAddresses: false
      }
    )
  },
])

@genType
let getGeneratedByChainId: int => configYaml = chainId => {
  let chain = ChainMap.Chain.makeUnsafe(~chainId)
  if !(publicConfig->ChainMap.has(chain)) {
    Js.Exn.raiseError(
      "No chain with id " ++ chain->ChainMap.Chain.toString ++ " found in config.yaml",
    )
  }
  publicConfig->ChainMap.get(chain)
}
