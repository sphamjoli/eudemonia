open Table
open Enums.EntityType
type id = string

type internalEntity = Internal.entity
module type Entity = {
  type t
  let index: int
  let name: string
  let schema: S.t<t>
  let rowsSchema: S.t<array<t>>
  let table: Table.table
  let entityHistory: EntityHistory.t<t>
}
external entityModToInternal: module(Entity with type t = 'a) => Internal.entityConfig = "%identity"
external entityModsToInternal: array<module(Entity)> => array<Internal.entityConfig> = "%identity"
external entitiesToInternal: array<'a> => array<Internal.entity> = "%identity"

@get
external getEntityId: internalEntity => string = "id"

// Use InMemoryTable.Entity.getEntityIdUnsafe instead of duplicating the logic
let getEntityIdUnsafe = InMemoryTable.Entity.getEntityIdUnsafe

//shorthand for punning
let isPrimaryKey = true
let isNullable = true
let isArray = true
let isIndex = true

@genType
type whereOperations<'entity, 'fieldType> = {
  eq: 'fieldType => promise<array<'entity>>,
  gt: 'fieldType => promise<array<'entity>>,
  lt: 'fieldType => promise<array<'entity>>
}

module IssuanceAuditReceipt = {
  let name = (IssuanceAuditReceipt :> string)
  let index = 0
  @genType
  type t = {
    blockNumber: bigint,
    blockTimestamp: bigint,
    id: id,
    parametersHash: string,
    policyHash: string,
    policyIdentifier: bigint,
    privacyContextHash: string,
    privacyMode: Enums.PrivacyMode.t,
    requestIdentifier: bigint,
    txHash: string,
  }

  let schema = S.object((s): t => {
    blockNumber: s.field("blockNumber", BigInt.schema),
    blockTimestamp: s.field("blockTimestamp", BigInt.schema),
    id: s.field("id", S.string),
    parametersHash: s.field("parametersHash", S.string),
    policyHash: s.field("policyHash", S.string),
    policyIdentifier: s.field("policyIdentifier", BigInt.schema),
    privacyContextHash: s.field("privacyContextHash", S.string),
    privacyMode: s.field("privacyMode", Enums.PrivacyMode.config.schema),
    requestIdentifier: s.field("requestIdentifier", BigInt.schema),
    txHash: s.field("txHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "parametersHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "policyHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "policyIdentifier", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "privacyContextHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "privacyMode", 
      Custom(Enums.PrivacyMode.config.name),
      ~fieldSchema=Enums.PrivacyMode.config.schema,
      
      
      
      
      
      ),
      mkField(
      "requestIdentifier", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "txHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema, ~entityIndex=index)

  external castToInternal: t => Internal.entity = "%identity"
}

module IssuanceExecution = {
  let name = (IssuanceExecution :> string)
  let index = 1
  @genType
  type t = {
    amount: bigint,
    amountCommitment: string,
    assetIdentifier: bigint,
    beneficiary: string,
    blockNumber: bigint,
    blockTimestamp: bigint,
    destinationCommitment: string,
    id: id,
    parametersHash: string,
    payloadHash: string,
    policyHash: string,
    policyIdentifier: bigint,
    privacyMode: Enums.PrivacyMode.t,
    requestIdentifier: bigint,
    txHash: string,
  }

  let schema = S.object((s): t => {
    amount: s.field("amount", BigInt.schema),
    amountCommitment: s.field("amountCommitment", S.string),
    assetIdentifier: s.field("assetIdentifier", BigInt.schema),
    beneficiary: s.field("beneficiary", S.string),
    blockNumber: s.field("blockNumber", BigInt.schema),
    blockTimestamp: s.field("blockTimestamp", BigInt.schema),
    destinationCommitment: s.field("destinationCommitment", S.string),
    id: s.field("id", S.string),
    parametersHash: s.field("parametersHash", S.string),
    payloadHash: s.field("payloadHash", S.string),
    policyHash: s.field("policyHash", S.string),
    policyIdentifier: s.field("policyIdentifier", BigInt.schema),
    privacyMode: s.field("privacyMode", Enums.PrivacyMode.config.schema),
    requestIdentifier: s.field("requestIdentifier", BigInt.schema),
    txHash: s.field("txHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "amount", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "amountCommitment", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "assetIdentifier", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "beneficiary", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "destinationCommitment", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "parametersHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "payloadHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "policyHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "policyIdentifier", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "privacyMode", 
      Custom(Enums.PrivacyMode.config.name),
      ~fieldSchema=Enums.PrivacyMode.config.schema,
      
      
      
      
      
      ),
      mkField(
      "requestIdentifier", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "txHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema, ~entityIndex=index)

  external castToInternal: t => Internal.entity = "%identity"
}

module IssuanceRequest = {
  let name = (IssuanceRequest :> string)
  let index = 2
  @genType
  type t = {
    amount: bigint,
    amountCommitment: string,
    assetIdentifier: bigint,
    beneficiary: string,
    createdAt: bigint,
    createdBlockNumber: bigint,
    createdTxHash: string,
    destinationCommitment: string,
    documentationHash: string,
    expiryTimestamp: bigint,
    id: id,
    issuer: string,
    parametersHash: string,
    payloadHash: string,
    privacyContextHash: string,
    privacyMode: Enums.PrivacyMode.t,
    requestIdentifier: bigint,
    status: Enums.IssuanceRequestStatus.t,
    subject: string,
    updatedAt: bigint,
    updatedBlockNumber: bigint,
    updatedTxHash: string,
  }

  let schema = S.object((s): t => {
    amount: s.field("amount", BigInt.schema),
    amountCommitment: s.field("amountCommitment", S.string),
    assetIdentifier: s.field("assetIdentifier", BigInt.schema),
    beneficiary: s.field("beneficiary", S.string),
    createdAt: s.field("createdAt", BigInt.schema),
    createdBlockNumber: s.field("createdBlockNumber", BigInt.schema),
    createdTxHash: s.field("createdTxHash", S.string),
    destinationCommitment: s.field("destinationCommitment", S.string),
    documentationHash: s.field("documentationHash", S.string),
    expiryTimestamp: s.field("expiryTimestamp", BigInt.schema),
    id: s.field("id", S.string),
    issuer: s.field("issuer", S.string),
    parametersHash: s.field("parametersHash", S.string),
    payloadHash: s.field("payloadHash", S.string),
    privacyContextHash: s.field("privacyContextHash", S.string),
    privacyMode: s.field("privacyMode", Enums.PrivacyMode.config.schema),
    requestIdentifier: s.field("requestIdentifier", BigInt.schema),
    status: s.field("status", Enums.IssuanceRequestStatus.config.schema),
    subject: s.field("subject", S.string),
    updatedAt: s.field("updatedAt", BigInt.schema),
    updatedBlockNumber: s.field("updatedBlockNumber", BigInt.schema),
    updatedTxHash: s.field("updatedTxHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "amount", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "amountCommitment", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "assetIdentifier", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "beneficiary", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "createdAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "createdBlockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "createdTxHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "destinationCommitment", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "documentationHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "expiryTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "issuer", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "parametersHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "payloadHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "privacyContextHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "privacyMode", 
      Custom(Enums.PrivacyMode.config.name),
      ~fieldSchema=Enums.PrivacyMode.config.schema,
      
      
      
      
      
      ),
      mkField(
      "requestIdentifier", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "status", 
      Custom(Enums.IssuanceRequestStatus.config.name),
      ~fieldSchema=Enums.IssuanceRequestStatus.config.schema,
      
      
      
      
      
      ),
      mkField(
      "subject", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "updatedAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "updatedBlockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "updatedTxHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema, ~entityIndex=index)

  external castToInternal: t => Internal.entity = "%identity"
}

module PaymentParticipant = {
  let name = (PaymentParticipant :> string)
  let index = 3
  @genType
  type t = {
    active: bool,
    createdAt: bigint,
    id: id,
    participant: string,
    profileHash: string,
    roleMask: bigint,
    updatedAt: bigint,
    updatedBlockNumber: bigint,
    updatedTxHash: string,
  }

  let schema = S.object((s): t => {
    active: s.field("active", S.bool),
    createdAt: s.field("createdAt", BigInt.schema),
    id: s.field("id", S.string),
    participant: s.field("participant", S.string),
    profileHash: s.field("profileHash", S.string),
    roleMask: s.field("roleMask", BigInt.schema),
    updatedAt: s.field("updatedAt", BigInt.schema),
    updatedBlockNumber: s.field("updatedBlockNumber", BigInt.schema),
    updatedTxHash: s.field("updatedTxHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "active", 
      Boolean,
      ~fieldSchema=S.bool,
      
      
      
      
      
      ),
      mkField(
      "createdAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "participant", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "profileHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "roleMask", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "updatedAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "updatedBlockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "updatedTxHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema, ~entityIndex=index)

  external castToInternal: t => Internal.entity = "%identity"
}

module Policy = {
  let name = (Policy :> string)
  let index = 4
  @genType
  type t = {
    allowAmountPrivate: bool,
    allowConfigurationUpdates: bool,
    allowDestinationPrivate: bool,
    allowFullPrivate: bool,
    allowNone: bool,
    allowPerIssuanceOverride: bool,
    attestorSetRoot: string,
    attestorThreshold: bigint,
    createdAt: bigint,
    createdBlockNumber: bigint,
    createdTxHash: string,
    id: id,
    isActive: bool,
    policyHash: string,
    policyIdentifier: bigint,
    privacySchemaVersion: int,
    status: Enums.PolicyLifecycleStatus.t,
    updatedAt: bigint,
    updatedBlockNumber: bigint,
    updatedTxHash: string,
    validFromTimestamp: bigint,
    validUntilTimestamp: bigint,
  }

  let schema = S.object((s): t => {
    allowAmountPrivate: s.field("allowAmountPrivate", S.bool),
    allowConfigurationUpdates: s.field("allowConfigurationUpdates", S.bool),
    allowDestinationPrivate: s.field("allowDestinationPrivate", S.bool),
    allowFullPrivate: s.field("allowFullPrivate", S.bool),
    allowNone: s.field("allowNone", S.bool),
    allowPerIssuanceOverride: s.field("allowPerIssuanceOverride", S.bool),
    attestorSetRoot: s.field("attestorSetRoot", S.string),
    attestorThreshold: s.field("attestorThreshold", BigInt.schema),
    createdAt: s.field("createdAt", BigInt.schema),
    createdBlockNumber: s.field("createdBlockNumber", BigInt.schema),
    createdTxHash: s.field("createdTxHash", S.string),
    id: s.field("id", S.string),
    isActive: s.field("isActive", S.bool),
    policyHash: s.field("policyHash", S.string),
    policyIdentifier: s.field("policyIdentifier", BigInt.schema),
    privacySchemaVersion: s.field("privacySchemaVersion", S.int),
    status: s.field("status", Enums.PolicyLifecycleStatus.config.schema),
    updatedAt: s.field("updatedAt", BigInt.schema),
    updatedBlockNumber: s.field("updatedBlockNumber", BigInt.schema),
    updatedTxHash: s.field("updatedTxHash", S.string),
    validFromTimestamp: s.field("validFromTimestamp", BigInt.schema),
    validUntilTimestamp: s.field("validUntilTimestamp", BigInt.schema),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "allowAmountPrivate", 
      Boolean,
      ~fieldSchema=S.bool,
      
      
      
      
      
      ),
      mkField(
      "allowConfigurationUpdates", 
      Boolean,
      ~fieldSchema=S.bool,
      
      
      
      
      
      ),
      mkField(
      "allowDestinationPrivate", 
      Boolean,
      ~fieldSchema=S.bool,
      
      
      
      
      
      ),
      mkField(
      "allowFullPrivate", 
      Boolean,
      ~fieldSchema=S.bool,
      
      
      
      
      
      ),
      mkField(
      "allowNone", 
      Boolean,
      ~fieldSchema=S.bool,
      
      
      
      
      
      ),
      mkField(
      "allowPerIssuanceOverride", 
      Boolean,
      ~fieldSchema=S.bool,
      
      
      
      
      
      ),
      mkField(
      "attestorSetRoot", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "attestorThreshold", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "createdAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "createdBlockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "createdTxHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "isActive", 
      Boolean,
      ~fieldSchema=S.bool,
      
      
      
      
      
      ),
      mkField(
      "policyHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "policyIdentifier", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "privacySchemaVersion", 
      Integer,
      ~fieldSchema=S.int,
      
      
      
      
      
      ),
      mkField(
      "status", 
      Custom(Enums.PolicyLifecycleStatus.config.name),
      ~fieldSchema=Enums.PolicyLifecycleStatus.config.schema,
      
      
      
      
      
      ),
      mkField(
      "updatedAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "updatedBlockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "updatedTxHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "validFromTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "validUntilTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema, ~entityIndex=index)

  external castToInternal: t => Internal.entity = "%identity"
}

module ProofJob = {
  let name = (ProofJob :> string)
  let index = 5
  @genType
  type t = {
    attemptCount: int,
    createdAt: bigint,
    id: id,
    lastError: option<string>,
    lastTxHash: option<string>,
    lockOwner: option<string>,
    lockedAt: option<bigint>,
    nextAttemptAt: bigint,
    policyIdentifier: bigint,
    requestIdentifier: bigint,
    status: Enums.ProofJobStatus.t,
    updatedAt: bigint,
  }

  let schema = S.object((s): t => {
    attemptCount: s.field("attemptCount", S.int),
    createdAt: s.field("createdAt", BigInt.schema),
    id: s.field("id", S.string),
    lastError: s.field("lastError", S.null(S.string)),
    lastTxHash: s.field("lastTxHash", S.null(S.string)),
    lockOwner: s.field("lockOwner", S.null(S.string)),
    lockedAt: s.field("lockedAt", S.null(BigInt.schema)),
    nextAttemptAt: s.field("nextAttemptAt", BigInt.schema),
    policyIdentifier: s.field("policyIdentifier", BigInt.schema),
    requestIdentifier: s.field("requestIdentifier", BigInt.schema),
    status: s.field("status", Enums.ProofJobStatus.config.schema),
    updatedAt: s.field("updatedAt", BigInt.schema),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "attemptCount", 
      Integer,
      ~fieldSchema=S.int,
      
      
      
      
      
      ),
      mkField(
      "createdAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "lastError", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "lastTxHash", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "lockOwner", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "lockedAt", 
      Numeric,
      ~fieldSchema=S.null(BigInt.schema),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "nextAttemptAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "policyIdentifier", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "requestIdentifier", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "status", 
      Custom(Enums.ProofJobStatus.config.name),
      ~fieldSchema=Enums.ProofJobStatus.config.schema,
      
      
      
      
      
      ),
      mkField(
      "updatedAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema, ~entityIndex=index)

  external castToInternal: t => Internal.entity = "%identity"
}

module RawEvent = {
  let name = (RawEvent :> string)
  let index = 6
  @genType
  type t = {
    blockNumber: bigint,
    blockTimestamp: bigint,
    contractAddress: string,
    contractName: string,
    eventName: string,
    id: id,
    logIndex: bigint,
    payloadJson: string,
    topic0: option<string>,
    topic1: option<string>,
    topic2: option<string>,
    topic3: option<string>,
    txHash: string,
  }

  let schema = S.object((s): t => {
    blockNumber: s.field("blockNumber", BigInt.schema),
    blockTimestamp: s.field("blockTimestamp", BigInt.schema),
    contractAddress: s.field("contractAddress", S.string),
    contractName: s.field("contractName", S.string),
    eventName: s.field("eventName", S.string),
    id: s.field("id", S.string),
    logIndex: s.field("logIndex", BigInt.schema),
    payloadJson: s.field("payloadJson", S.string),
    topic0: s.field("topic0", S.null(S.string)),
    topic1: s.field("topic1", S.null(S.string)),
    topic2: s.field("topic2", S.null(S.string)),
    topic3: s.field("topic3", S.null(S.string)),
    txHash: s.field("txHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "contractAddress", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "contractName", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "eventName", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "logIndex", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "payloadJson", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "topic0", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "topic1", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "topic2", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "topic3", 
      Text,
      ~fieldSchema=S.null(S.string),
      
      ~isNullable,
      
      
      
      ),
      mkField(
      "txHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema, ~entityIndex=index)

  external castToInternal: t => Internal.entity = "%identity"
}

module SettlementNote = {
  let name = (SettlementNote :> string)
  let index = 7
  @genType
  type t = {
    amount: bigint,
    amountCommitment: string,
    beneficiary: string,
    blockNumber: bigint,
    blockTimestamp: bigint,
    destinationCommitment: string,
    id: id,
    noteIdentifier: bigint,
    payloadHash: string,
    policyIdentifier: bigint,
    privacyMode: Enums.PrivacyMode.t,
    requestIdentifier: bigint,
    txHash: string,
  }

  let schema = S.object((s): t => {
    amount: s.field("amount", BigInt.schema),
    amountCommitment: s.field("amountCommitment", S.string),
    beneficiary: s.field("beneficiary", S.string),
    blockNumber: s.field("blockNumber", BigInt.schema),
    blockTimestamp: s.field("blockTimestamp", BigInt.schema),
    destinationCommitment: s.field("destinationCommitment", S.string),
    id: s.field("id", S.string),
    noteIdentifier: s.field("noteIdentifier", BigInt.schema),
    payloadHash: s.field("payloadHash", S.string),
    policyIdentifier: s.field("policyIdentifier", BigInt.schema),
    privacyMode: s.field("privacyMode", Enums.PrivacyMode.config.schema),
    requestIdentifier: s.field("requestIdentifier", BigInt.schema),
    txHash: s.field("txHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "amount", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "amountCommitment", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "beneficiary", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "destinationCommitment", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "noteIdentifier", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "payloadHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "policyIdentifier", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "privacyMode", 
      Custom(Enums.PrivacyMode.config.name),
      ~fieldSchema=Enums.PrivacyMode.config.schema,
      
      
      
      
      
      ),
      mkField(
      "requestIdentifier", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "txHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema, ~entityIndex=index)

  external castToInternal: t => Internal.entity = "%identity"
}

module TokenTransfer = {
  let name = (TokenTransfer :> string)
  let index = 8
  @genType
  type t = {
    amount: bigint,
    blockNumber: bigint,
    blockTimestamp: bigint,
    from: string,
    id: id,
    operator: string,
    to: string,
    tokenIdentifier: bigint,
    txHash: string,
  }

  let schema = S.object((s): t => {
    amount: s.field("amount", BigInt.schema),
    blockNumber: s.field("blockNumber", BigInt.schema),
    blockTimestamp: s.field("blockTimestamp", BigInt.schema),
    from: s.field("from", S.string),
    id: s.field("id", S.string),
    operator: s.field("operator", S.string),
    to: s.field("to", S.string),
    tokenIdentifier: s.field("tokenIdentifier", BigInt.schema),
    txHash: s.field("txHash", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "amount", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "blockTimestamp", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "from", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "operator", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "to", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "tokenIdentifier", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "txHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema, ~entityIndex=index)

  external castToInternal: t => Internal.entity = "%identity"
}

module WorkerPrivacyConfiguration = {
  let name = (WorkerPrivacyConfiguration :> string)
  let index = 9
  @genType
  type t = {
    id: id,
    metadataHash: string,
    mode: Enums.PrivacyMode.t,
    schemaVersion: int,
    spendingPublicKey: string,
    updatedAt: bigint,
    updatedBlockNumber: bigint,
    updatedTxHash: string,
    viewingPublicKey: string,
    worker: string,
  }

  let schema = S.object((s): t => {
    id: s.field("id", S.string),
    metadataHash: s.field("metadataHash", S.string),
    mode: s.field("mode", Enums.PrivacyMode.config.schema),
    schemaVersion: s.field("schemaVersion", S.int),
    spendingPublicKey: s.field("spendingPublicKey", S.string),
    updatedAt: s.field("updatedAt", BigInt.schema),
    updatedBlockNumber: s.field("updatedBlockNumber", BigInt.schema),
    updatedTxHash: s.field("updatedTxHash", S.string),
    viewingPublicKey: s.field("viewingPublicKey", S.string),
    worker: s.field("worker", S.string),
  })

  let rowsSchema = S.array(schema)

  @genType
  type indexedFieldOperations = {
    
  }

  let table = mkTable(
    (name :> string),
    ~fields=[
      mkField(
      "id", 
      Text,
      ~fieldSchema=S.string,
      ~isPrimaryKey,
      
      
      
      
      ),
      mkField(
      "metadataHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "mode", 
      Custom(Enums.PrivacyMode.config.name),
      ~fieldSchema=Enums.PrivacyMode.config.schema,
      
      
      
      
      
      ),
      mkField(
      "schemaVersion", 
      Integer,
      ~fieldSchema=S.int,
      
      
      
      
      
      ),
      mkField(
      "spendingPublicKey", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "updatedAt", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "updatedBlockNumber", 
      Numeric,
      ~fieldSchema=BigInt.schema,
      
      
      
      
      
      ),
      mkField(
      "updatedTxHash", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "viewingPublicKey", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
      mkField(
      "worker", 
      Text,
      ~fieldSchema=S.string,
      
      
      
      
      
      ),
    ],
  )

  let entityHistory = table->EntityHistory.fromTable(~schema, ~entityIndex=index)

  external castToInternal: t => Internal.entity = "%identity"
}

let userEntities = [
  module(IssuanceAuditReceipt),
  module(IssuanceExecution),
  module(IssuanceRequest),
  module(PaymentParticipant),
  module(Policy),
  module(ProofJob),
  module(RawEvent),
  module(SettlementNote),
  module(TokenTransfer),
  module(WorkerPrivacyConfiguration),
]->entityModsToInternal

let allEntities =
  userEntities->Js.Array2.concat(
    [module(InternalTable.DynamicContractRegistry)]->entityModsToInternal,
  )

let byName =
  allEntities
  ->Js.Array2.map(entityConfig => {
    (entityConfig.name, entityConfig)
  })
  ->Js.Dict.fromArray
