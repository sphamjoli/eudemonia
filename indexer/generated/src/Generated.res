@val external require: string => unit = "require"

let registerContractHandlers = (
  ~contractName,
  ~handlerPathRelativeToRoot,
  ~handlerPathRelativeToConfig,
) => {
  try {
    require(`../${Path.relativePathToRootFromGenerated}/${handlerPathRelativeToRoot}`)
  } catch {
  | exn =>
    let params = {
      "Contract Name": contractName,
      "Expected Handler Path": handlerPathRelativeToConfig,
      "Code": "EE500",
    }
    let logger = Logging.createChild(~params)

    let errHandler = exn->ErrorHandling.make(~msg="Failed to import handler file", ~logger)
    errHandler->ErrorHandling.log
    errHandler->ErrorHandling.raiseExn
  }
}

let makeGeneratedConfig = () => {
  let chains = [
    {
      let contracts = [
        {
          Config.name: "PaymentRegistry",
          abi: Types.PaymentRegistry.abi,
          addresses: [
            "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"->Address.Evm.fromStringOrThrow
,
          ],
          events: [
            (Types.PaymentRegistry.Initialized.register() :> Internal.eventConfig),
            (Types.PaymentRegistry.OwnershipTransferStarted.register() :> Internal.eventConfig),
            (Types.PaymentRegistry.OwnershipTransferred.register() :> Internal.eventConfig),
            (Types.PaymentRegistry.ParticipantProfileUpdated.register() :> Internal.eventConfig),
            (Types.PaymentRegistry.ParticipantRoleUpdated.register() :> Internal.eventConfig),
            (Types.PaymentRegistry.ParticipantStatusUpdated.register() :> Internal.eventConfig),
            (Types.PaymentRegistry.Upgraded.register() :> Internal.eventConfig),
          ],
          startBlock: None,
        },
        {
          Config.name: "IssuanceRegistry",
          abi: Types.IssuanceRegistry.abi,
          addresses: [
            "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6"->Address.Evm.fromStringOrThrow
,
          ],
          events: [
            (Types.IssuanceRegistry.EngineAddressUpdated.register() :> Internal.eventConfig),
            (Types.IssuanceRegistry.Initialized.register() :> Internal.eventConfig),
            (Types.IssuanceRegistry.IssuanceRequestCancelled.register() :> Internal.eventConfig),
            (Types.IssuanceRegistry.IssuanceRequestConsumed.register() :> Internal.eventConfig),
            (Types.IssuanceRegistry.IssuanceRequestCreated.register() :> Internal.eventConfig),
            (Types.IssuanceRegistry.IssuanceRequestPrivacyBound.register() :> Internal.eventConfig),
            (Types.IssuanceRegistry.PaymentRegistryUpdated.register() :> Internal.eventConfig),
            (Types.IssuanceRegistry.WorkerPrivacyConfigurationUpdated.register() :> Internal.eventConfig),
            (Types.IssuanceRegistry.OwnershipTransferStarted.register() :> Internal.eventConfig),
            (Types.IssuanceRegistry.OwnershipTransferred.register() :> Internal.eventConfig),
            (Types.IssuanceRegistry.Upgraded.register() :> Internal.eventConfig),
          ],
          startBlock: None,
        },
        {
          Config.name: "PolicyRegistry",
          abi: Types.PolicyRegistry.abi,
          addresses: [
            "0x610178dA211FEF7D417bC0e6FeD39F05609AD788"->Address.Evm.fromStringOrThrow
,
          ],
          events: [
            (Types.PolicyRegistry.ActivePolicyIdentifierUpdated.register() :> Internal.eventConfig),
            (Types.PolicyRegistry.Initialized.register() :> Internal.eventConfig),
            (Types.PolicyRegistry.OwnershipTransferStarted.register() :> Internal.eventConfig),
            (Types.PolicyRegistry.OwnershipTransferred.register() :> Internal.eventConfig),
            (Types.PolicyRegistry.PolicyCreated.register() :> Internal.eventConfig),
            (Types.PolicyRegistry.PolicyDeprecated.register() :> Internal.eventConfig),
            (Types.PolicyRegistry.PolicyPrivacyConstraintsUpdated.register() :> Internal.eventConfig),
            (Types.PolicyRegistry.Upgraded.register() :> Internal.eventConfig),
          ],
          startBlock: None,
        },
        {
          Config.name: "TokenisationEngine",
          abi: Types.TokenisationEngine.abi,
          addresses: [
            "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1"->Address.Evm.fromStringOrThrow
,
          ],
          events: [
            (Types.TokenisationEngine.Initialized.register() :> Internal.eventConfig),
            (Types.TokenisationEngine.IssuanceAuditReceipt.register() :> Internal.eventConfig),
            (Types.TokenisationEngine.IssuanceExecuted.register() :> Internal.eventConfig),
            (Types.TokenisationEngine.IssuanceRegistryUpdated.register() :> Internal.eventConfig),
            (Types.TokenisationEngine.OwnershipTransferStarted.register() :> Internal.eventConfig),
            (Types.TokenisationEngine.OwnershipTransferred.register() :> Internal.eventConfig),
            (Types.TokenisationEngine.PolicyRegistryUpdated.register() :> Internal.eventConfig),
            (Types.TokenisationEngine.ProgramVerificationKeyUpdated.register() :> Internal.eventConfig),
            (Types.TokenisationEngine.RwaTokenUpdated.register() :> Internal.eventConfig),
            (Types.TokenisationEngine.ConfidentialSettlementUpdated.register() :> Internal.eventConfig),
            (Types.TokenisationEngine.Sp1VerifierUpdated.register() :> Internal.eventConfig),
            (Types.TokenisationEngine.UmbraBatchSendUpdated.register() :> Internal.eventConfig),
            (Types.TokenisationEngine.UmbraCoreUpdated.register() :> Internal.eventConfig),
            (Types.TokenisationEngine.Upgraded.register() :> Internal.eventConfig),
          ],
          startBlock: None,
        },
        {
          Config.name: "RwaToken1155",
          abi: Types.RwaToken1155.abi,
          addresses: [
            "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0"->Address.Evm.fromStringOrThrow
,
          ],
          events: [
            (Types.RwaToken1155.ApprovalForAll.register() :> Internal.eventConfig),
            (Types.RwaToken1155.ContractURIUpdated.register() :> Internal.eventConfig),
            (Types.RwaToken1155.EngineAddressUpdated.register() :> Internal.eventConfig),
            (Types.RwaToken1155.Initialized.register() :> Internal.eventConfig),
            (Types.RwaToken1155.OwnershipTransferStarted.register() :> Internal.eventConfig),
            (Types.RwaToken1155.OwnershipTransferred.register() :> Internal.eventConfig),
            (Types.RwaToken1155.TransferBatch.register() :> Internal.eventConfig),
            (Types.RwaToken1155.TransferSingle.register() :> Internal.eventConfig),
            (Types.RwaToken1155.URI.register() :> Internal.eventConfig),
            (Types.RwaToken1155.Upgraded.register() :> Internal.eventConfig),
          ],
          startBlock: None,
        },
        {
          Config.name: "ConfidentialSettlement",
          abi: Types.ConfidentialSettlement.abi,
          addresses: [
            "0x9A676e781A523b5d0C0e43731313A708CB607508"->Address.Evm.fromStringOrThrow
,
          ],
          events: [
            (Types.ConfidentialSettlement.EngineAddressUpdated.register() :> Internal.eventConfig),
            (Types.ConfidentialSettlement.Initialized.register() :> Internal.eventConfig),
            (Types.ConfidentialSettlement.NoteClaimed.register() :> Internal.eventConfig),
            (Types.ConfidentialSettlement.NoteCommitted.register() :> Internal.eventConfig),
            (Types.ConfidentialSettlement.OwnershipTransferStarted.register() :> Internal.eventConfig),
            (Types.ConfidentialSettlement.OwnershipTransferred.register() :> Internal.eventConfig),
            (Types.ConfidentialSettlement.Upgraded.register() :> Internal.eventConfig),
          ],
          startBlock: None,
        },
      ]
      let chain = ChainMap.Chain.makeUnsafe(~chainId=99999)
      {
        Config.maxReorgDepth: 200,
        startBlock: 0,
        id: 99999,
        contracts,
        sources: NetworkSources.evm(~chain, ~contracts=[{name: "PaymentRegistry",events: [Types.PaymentRegistry.Initialized.register(), Types.PaymentRegistry.OwnershipTransferStarted.register(), Types.PaymentRegistry.OwnershipTransferred.register(), Types.PaymentRegistry.ParticipantProfileUpdated.register(), Types.PaymentRegistry.ParticipantRoleUpdated.register(), Types.PaymentRegistry.ParticipantStatusUpdated.register(), Types.PaymentRegistry.Upgraded.register()],abi: Types.PaymentRegistry.abi}, {name: "IssuanceRegistry",events: [Types.IssuanceRegistry.EngineAddressUpdated.register(), Types.IssuanceRegistry.Initialized.register(), Types.IssuanceRegistry.IssuanceRequestCancelled.register(), Types.IssuanceRegistry.IssuanceRequestConsumed.register(), Types.IssuanceRegistry.IssuanceRequestCreated.register(), Types.IssuanceRegistry.IssuanceRequestPrivacyBound.register(), Types.IssuanceRegistry.PaymentRegistryUpdated.register(), Types.IssuanceRegistry.WorkerPrivacyConfigurationUpdated.register(), Types.IssuanceRegistry.OwnershipTransferStarted.register(), Types.IssuanceRegistry.OwnershipTransferred.register(), Types.IssuanceRegistry.Upgraded.register()],abi: Types.IssuanceRegistry.abi}, {name: "PolicyRegistry",events: [Types.PolicyRegistry.ActivePolicyIdentifierUpdated.register(), Types.PolicyRegistry.Initialized.register(), Types.PolicyRegistry.OwnershipTransferStarted.register(), Types.PolicyRegistry.OwnershipTransferred.register(), Types.PolicyRegistry.PolicyCreated.register(), Types.PolicyRegistry.PolicyDeprecated.register(), Types.PolicyRegistry.PolicyPrivacyConstraintsUpdated.register(), Types.PolicyRegistry.Upgraded.register()],abi: Types.PolicyRegistry.abi}, {name: "TokenisationEngine",events: [Types.TokenisationEngine.Initialized.register(), Types.TokenisationEngine.IssuanceAuditReceipt.register(), Types.TokenisationEngine.IssuanceExecuted.register(), Types.TokenisationEngine.IssuanceRegistryUpdated.register(), Types.TokenisationEngine.OwnershipTransferStarted.register(), Types.TokenisationEngine.OwnershipTransferred.register(), Types.TokenisationEngine.PolicyRegistryUpdated.register(), Types.TokenisationEngine.ProgramVerificationKeyUpdated.register(), Types.TokenisationEngine.RwaTokenUpdated.register(), Types.TokenisationEngine.ConfidentialSettlementUpdated.register(), Types.TokenisationEngine.Sp1VerifierUpdated.register(), Types.TokenisationEngine.UmbraBatchSendUpdated.register(), Types.TokenisationEngine.UmbraCoreUpdated.register(), Types.TokenisationEngine.Upgraded.register()],abi: Types.TokenisationEngine.abi}, {name: "RwaToken1155",events: [Types.RwaToken1155.ApprovalForAll.register(), Types.RwaToken1155.ContractURIUpdated.register(), Types.RwaToken1155.EngineAddressUpdated.register(), Types.RwaToken1155.Initialized.register(), Types.RwaToken1155.OwnershipTransferStarted.register(), Types.RwaToken1155.OwnershipTransferred.register(), Types.RwaToken1155.TransferBatch.register(), Types.RwaToken1155.TransferSingle.register(), Types.RwaToken1155.URI.register(), Types.RwaToken1155.Upgraded.register()],abi: Types.RwaToken1155.abi}, {name: "ConfidentialSettlement",events: [Types.ConfidentialSettlement.EngineAddressUpdated.register(), Types.ConfidentialSettlement.Initialized.register(), Types.ConfidentialSettlement.NoteClaimed.register(), Types.ConfidentialSettlement.NoteCommitted.register(), Types.ConfidentialSettlement.OwnershipTransferStarted.register(), Types.ConfidentialSettlement.OwnershipTransferred.register(), Types.ConfidentialSettlement.Upgraded.register()],abi: Types.ConfidentialSettlement.abi}], ~hyperSync=None, ~allEventSignatures=[Types.PaymentRegistry.eventSignatures, Types.IssuanceRegistry.eventSignatures, Types.PolicyRegistry.eventSignatures, Types.TokenisationEngine.eventSignatures, Types.RwaToken1155.eventSignatures, Types.ConfidentialSettlement.eventSignatures]->Belt.Array.concatMany, ~shouldUseHypersyncClientDecoder=true, ~rpcs=[{url: "http://host.docker.internal:8545", sourceFor: Sync, syncConfig: {}}], ~lowercaseAddresses=false)
      }
    },
  ]

  Config.make(
    ~shouldRollbackOnReorg=true,
    ~shouldSaveFullHistory=false,
    ~multichain=if (
      Env.Configurable.isUnorderedMultichainMode->Belt.Option.getWithDefault(
        Env.Configurable.unstable__temp_unordered_head_mode->Belt.Option.getWithDefault(
          false,
        ),
      )
    ) {
      Unordered
    } else {
      Ordered
    },
    ~chains,
    ~enableRawEvents=false,
    ~batchSize=?Env.batchSize,
    ~preloadHandlers=false,
    ~lowercaseAddresses=false,
    ~shouldUseHypersyncClientDecoder=true,
  )
}

let configWithoutRegistrations = makeGeneratedConfig()

let registerAllHandlers = () => {
  EventRegister.startRegistration(
    ~ecosystem=configWithoutRegistrations.ecosystem,
    ~multichain=configWithoutRegistrations.multichain,
    ~preloadHandlers=configWithoutRegistrations.preloadHandlers,
  )

  registerContractHandlers(
    ~contractName="ConfidentialSettlement",
    ~handlerPathRelativeToRoot="src/EventHandlers.ts",
    ~handlerPathRelativeToConfig="src/EventHandlers.ts",
  )
  registerContractHandlers(
    ~contractName="IssuanceRegistry",
    ~handlerPathRelativeToRoot="src/EventHandlers.ts",
    ~handlerPathRelativeToConfig="src/EventHandlers.ts",
  )
  registerContractHandlers(
    ~contractName="PaymentRegistry",
    ~handlerPathRelativeToRoot="src/EventHandlers.ts",
    ~handlerPathRelativeToConfig="src/EventHandlers.ts",
  )
  registerContractHandlers(
    ~contractName="PolicyRegistry",
    ~handlerPathRelativeToRoot="src/EventHandlers.ts",
    ~handlerPathRelativeToConfig="src/EventHandlers.ts",
  )
  registerContractHandlers(
    ~contractName="RwaToken1155",
    ~handlerPathRelativeToRoot="src/EventHandlers.ts",
    ~handlerPathRelativeToConfig="src/EventHandlers.ts",
  )
  registerContractHandlers(
    ~contractName="TokenisationEngine",
    ~handlerPathRelativeToRoot="src/EventHandlers.ts",
    ~handlerPathRelativeToConfig="src/EventHandlers.ts",
  )

  EventRegister.finishRegistration()
}

let initialSql = Db.makeClient()
let storagePgSchema = Env.Db.publicSchema
let makeStorage = (~sql, ~pgSchema=storagePgSchema, ~isHasuraEnabled=Env.Hasura.enabled) => {
  PgStorage.make(
    ~sql,
    ~pgSchema,
    ~pgHost=Env.Db.host,
    ~pgUser=Env.Db.user,
    ~pgPort=Env.Db.port,
    ~pgDatabase=Env.Db.database,
    ~pgPassword=Env.Db.password,
    ~onInitialize=?{
      if isHasuraEnabled {
        Some(
          () => {
            Hasura.trackDatabase(
              ~endpoint=Env.Hasura.graphqlEndpoint,
              ~auth={
                role: Env.Hasura.role,
                secret: Env.Hasura.secret,
              },
              ~pgSchema=storagePgSchema,
              ~userEntities=Entities.userEntities,
              ~responseLimit=Env.Hasura.responseLimit,
              ~schema=Db.schema,
              ~aggregateEntities=Env.Hasura.aggregateEntities,
            )->Promise.catch(err => {
              Logging.errorWithExn(
                err->Utils.prettifyExn,
                `EE803: Error tracking tables`,
              )->Promise.resolve
            })
          },
        )
      } else {
        None
      }
    },
    ~onNewTables=?{
      if isHasuraEnabled {
        Some(
          (~tableNames) => {
            Hasura.trackTables(
              ~endpoint=Env.Hasura.graphqlEndpoint,
              ~auth={
                role: Env.Hasura.role,
                secret: Env.Hasura.secret,
              },
              ~pgSchema=storagePgSchema,
              ~tableNames,
            )->Promise.catch(err => {
              Logging.errorWithExn(
                err->Utils.prettifyExn,
                `EE804: Error tracking new tables`,
              )->Promise.resolve
            })
          },
        )
      } else {
        None
      }
    },
    ~isHasuraEnabled,
  )
}

let codegenPersistence = Persistence.make(
  ~userEntities=Entities.userEntities,
  ~allEnums=Enums.allEnums,
  ~storage=makeStorage(~sql=initialSql),
  ~sql=initialSql,
)

%%private(let indexer: ref<option<Indexer.t>> = ref(None))
let getIndexer = () => {
  switch indexer.contents {
  | Some(indexer) => indexer
  | None =>
    let i = {
      Indexer.registrations: registerAllHandlers(),
      // Need to recreate initial config one more time,
      // since configWithoutRegistrations called register for event
      // before they were ready
      config: makeGeneratedConfig(),
      persistence: codegenPersistence,
    }
    indexer := Some(i)
    i
  }
}
