/* TypeScript file generated from Types.res by genType. */

/* eslint-disable */
/* tslint:disable */

import type {HandlerContext as $$handlerContext} from './Types.ts';

import type {HandlerWithOptions as $$fnWithEventConfig} from './bindings/OpaqueTypes.ts';

import type {IssuanceAuditReceipt_t as Entities_IssuanceAuditReceipt_t} from '../src/db/Entities.gen';

import type {IssuanceExecution_t as Entities_IssuanceExecution_t} from '../src/db/Entities.gen';

import type {IssuanceRequest_t as Entities_IssuanceRequest_t} from '../src/db/Entities.gen';

import type {LoaderContext as $$loaderContext} from './Types.ts';

import type {PaymentParticipant_t as Entities_PaymentParticipant_t} from '../src/db/Entities.gen';

import type {Policy_t as Entities_Policy_t} from '../src/db/Entities.gen';

import type {ProofJob_t as Entities_ProofJob_t} from '../src/db/Entities.gen';

import type {RawEvent_t as Entities_RawEvent_t} from '../src/db/Entities.gen';

import type {SettlementNote_t as Entities_SettlementNote_t} from '../src/db/Entities.gen';

import type {SingleOrMultiple as $$SingleOrMultiple_t} from './bindings/OpaqueTypes';

import type {TokenTransfer_t as Entities_TokenTransfer_t} from '../src/db/Entities.gen';

import type {WorkerPrivacyConfiguration_t as Entities_WorkerPrivacyConfiguration_t} from '../src/db/Entities.gen';

import type {entityHandlerContext as Internal_entityHandlerContext} from 'envio/src/Internal.gen';

import type {eventOptions as Internal_eventOptions} from 'envio/src/Internal.gen';

import type {genericContractRegisterArgs as Internal_genericContractRegisterArgs} from 'envio/src/Internal.gen';

import type {genericContractRegister as Internal_genericContractRegister} from 'envio/src/Internal.gen';

import type {genericEvent as Internal_genericEvent} from 'envio/src/Internal.gen';

import type {genericHandlerArgs as Internal_genericHandlerArgs} from 'envio/src/Internal.gen';

import type {genericHandlerWithLoader as Internal_genericHandlerWithLoader} from 'envio/src/Internal.gen';

import type {genericHandler as Internal_genericHandler} from 'envio/src/Internal.gen';

import type {genericLoaderArgs as Internal_genericLoaderArgs} from 'envio/src/Internal.gen';

import type {genericLoader as Internal_genericLoader} from 'envio/src/Internal.gen';

import type {logger as Envio_logger} from 'envio/src/Envio.gen';

import type {noEventFilters as Internal_noEventFilters} from 'envio/src/Internal.gen';

import type {t as Address_t} from 'envio/src/Address.gen';

export type id = string;
export type Id = id;

export type contractRegistrations = {
  readonly log: Envio_logger; 
  readonly addConfidentialSettlement: (_1:Address_t) => void; 
  readonly addIssuanceRegistry: (_1:Address_t) => void; 
  readonly addPaymentRegistry: (_1:Address_t) => void; 
  readonly addPolicyRegistry: (_1:Address_t) => void; 
  readonly addRwaToken1155: (_1:Address_t) => void; 
  readonly addTokenisationEngine: (_1:Address_t) => void
};

export type entityLoaderContext<entity,indexedFieldOperations> = {
  readonly get: (_1:id) => Promise<(undefined | entity)>; 
  readonly getOrThrow: (_1:id, message:(undefined | string)) => Promise<entity>; 
  readonly getWhere: indexedFieldOperations; 
  readonly getOrCreate: (_1:entity) => Promise<entity>; 
  readonly set: (_1:entity) => void; 
  readonly deleteUnsafe: (_1:id) => void
};

export type loaderContext = $$loaderContext;

export type entityHandlerContext<entity> = Internal_entityHandlerContext<entity>;

export type handlerContext = $$handlerContext;

export type issuanceAuditReceipt = Entities_IssuanceAuditReceipt_t;
export type IssuanceAuditReceipt = issuanceAuditReceipt;

export type issuanceExecution = Entities_IssuanceExecution_t;
export type IssuanceExecution = issuanceExecution;

export type issuanceRequest = Entities_IssuanceRequest_t;
export type IssuanceRequest = issuanceRequest;

export type paymentParticipant = Entities_PaymentParticipant_t;
export type PaymentParticipant = paymentParticipant;

export type policy = Entities_Policy_t;
export type Policy = policy;

export type proofJob = Entities_ProofJob_t;
export type ProofJob = proofJob;

export type rawEvent = Entities_RawEvent_t;
export type RawEvent = rawEvent;

export type settlementNote = Entities_SettlementNote_t;
export type SettlementNote = settlementNote;

export type tokenTransfer = Entities_TokenTransfer_t;
export type TokenTransfer = tokenTransfer;

export type workerPrivacyConfiguration = Entities_WorkerPrivacyConfiguration_t;
export type WorkerPrivacyConfiguration = workerPrivacyConfiguration;

export type Transaction_t = {};

export type Block_t = {
  readonly number: number; 
  readonly timestamp: number; 
  readonly hash: string
};

export type AggregatedBlock_t = {
  readonly hash: string; 
  readonly number: number; 
  readonly timestamp: number
};

export type AggregatedTransaction_t = {};

export type eventLog<params> = Internal_genericEvent<params,Block_t,Transaction_t>;
export type EventLog<params> = eventLog<params>;

export type SingleOrMultiple_t<a> = $$SingleOrMultiple_t<a>;

export type HandlerTypes_args<eventArgs,context> = { readonly event: eventLog<eventArgs>; readonly context: context };

export type HandlerTypes_contractRegisterArgs<eventArgs> = Internal_genericContractRegisterArgs<eventLog<eventArgs>,contractRegistrations>;

export type HandlerTypes_contractRegister<eventArgs> = Internal_genericContractRegister<HandlerTypes_contractRegisterArgs<eventArgs>>;

export type HandlerTypes_loaderArgs<eventArgs> = Internal_genericLoaderArgs<eventLog<eventArgs>,loaderContext>;

export type HandlerTypes_loader<eventArgs,loaderReturn> = Internal_genericLoader<HandlerTypes_loaderArgs<eventArgs>,loaderReturn>;

export type HandlerTypes_handlerArgs<eventArgs,loaderReturn> = Internal_genericHandlerArgs<eventLog<eventArgs>,handlerContext,loaderReturn>;

export type HandlerTypes_handler<eventArgs,loaderReturn> = Internal_genericHandler<HandlerTypes_handlerArgs<eventArgs,loaderReturn>>;

export type HandlerTypes_loaderHandler<eventArgs,loaderReturn,eventFilters> = Internal_genericHandlerWithLoader<HandlerTypes_loader<eventArgs,loaderReturn>,HandlerTypes_handler<eventArgs,loaderReturn>,eventFilters>;

export type HandlerTypes_eventConfig<eventFilters> = Internal_eventOptions<eventFilters>;

export type fnWithEventConfig<fn,eventConfig> = $$fnWithEventConfig<fn,eventConfig>;

export type handlerWithOptions<eventArgs,loaderReturn,eventFilters> = fnWithEventConfig<HandlerTypes_handler<eventArgs,loaderReturn>,HandlerTypes_eventConfig<eventFilters>>;

export type contractRegisterWithOptions<eventArgs,eventFilters> = fnWithEventConfig<HandlerTypes_contractRegister<eventArgs>,HandlerTypes_eventConfig<eventFilters>>;

export type ConfidentialSettlement_chainId = 99999;

export type ConfidentialSettlement_EngineAddressUpdated_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type ConfidentialSettlement_EngineAddressUpdated_block = Block_t;

export type ConfidentialSettlement_EngineAddressUpdated_transaction = Transaction_t;

export type ConfidentialSettlement_EngineAddressUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: ConfidentialSettlement_EngineAddressUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: ConfidentialSettlement_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: ConfidentialSettlement_EngineAddressUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: ConfidentialSettlement_EngineAddressUpdated_block
};

export type ConfidentialSettlement_EngineAddressUpdated_loaderArgs = Internal_genericLoaderArgs<ConfidentialSettlement_EngineAddressUpdated_event,loaderContext>;

export type ConfidentialSettlement_EngineAddressUpdated_loader<loaderReturn> = Internal_genericLoader<ConfidentialSettlement_EngineAddressUpdated_loaderArgs,loaderReturn>;

export type ConfidentialSettlement_EngineAddressUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<ConfidentialSettlement_EngineAddressUpdated_event,handlerContext,loaderReturn>;

export type ConfidentialSettlement_EngineAddressUpdated_handler<loaderReturn> = Internal_genericHandler<ConfidentialSettlement_EngineAddressUpdated_handlerArgs<loaderReturn>>;

export type ConfidentialSettlement_EngineAddressUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<ConfidentialSettlement_EngineAddressUpdated_event,contractRegistrations>>;

export type ConfidentialSettlement_EngineAddressUpdated_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type ConfidentialSettlement_EngineAddressUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: ConfidentialSettlement_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type ConfidentialSettlement_EngineAddressUpdated_eventFiltersDefinition = 
    ConfidentialSettlement_EngineAddressUpdated_eventFilter
  | ConfidentialSettlement_EngineAddressUpdated_eventFilter[];

export type ConfidentialSettlement_EngineAddressUpdated_eventFilters = 
    ConfidentialSettlement_EngineAddressUpdated_eventFilter
  | ConfidentialSettlement_EngineAddressUpdated_eventFilter[]
  | ((_1:ConfidentialSettlement_EngineAddressUpdated_eventFiltersArgs) => ConfidentialSettlement_EngineAddressUpdated_eventFiltersDefinition);

export type ConfidentialSettlement_Initialized_eventArgs = { readonly _0: bigint };

export type ConfidentialSettlement_Initialized_block = Block_t;

export type ConfidentialSettlement_Initialized_transaction = Transaction_t;

export type ConfidentialSettlement_Initialized_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: ConfidentialSettlement_Initialized_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: ConfidentialSettlement_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: ConfidentialSettlement_Initialized_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: ConfidentialSettlement_Initialized_block
};

export type ConfidentialSettlement_Initialized_loaderArgs = Internal_genericLoaderArgs<ConfidentialSettlement_Initialized_event,loaderContext>;

export type ConfidentialSettlement_Initialized_loader<loaderReturn> = Internal_genericLoader<ConfidentialSettlement_Initialized_loaderArgs,loaderReturn>;

export type ConfidentialSettlement_Initialized_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<ConfidentialSettlement_Initialized_event,handlerContext,loaderReturn>;

export type ConfidentialSettlement_Initialized_handler<loaderReturn> = Internal_genericHandler<ConfidentialSettlement_Initialized_handlerArgs<loaderReturn>>;

export type ConfidentialSettlement_Initialized_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<ConfidentialSettlement_Initialized_event,contractRegistrations>>;

export type ConfidentialSettlement_Initialized_eventFilter = {};

export type ConfidentialSettlement_Initialized_eventFilters = Internal_noEventFilters;

export type ConfidentialSettlement_NoteClaimed_eventArgs = { readonly _0: bigint; readonly _1: string };

export type ConfidentialSettlement_NoteClaimed_block = Block_t;

export type ConfidentialSettlement_NoteClaimed_transaction = Transaction_t;

export type ConfidentialSettlement_NoteClaimed_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: ConfidentialSettlement_NoteClaimed_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: ConfidentialSettlement_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: ConfidentialSettlement_NoteClaimed_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: ConfidentialSettlement_NoteClaimed_block
};

export type ConfidentialSettlement_NoteClaimed_loaderArgs = Internal_genericLoaderArgs<ConfidentialSettlement_NoteClaimed_event,loaderContext>;

export type ConfidentialSettlement_NoteClaimed_loader<loaderReturn> = Internal_genericLoader<ConfidentialSettlement_NoteClaimed_loaderArgs,loaderReturn>;

export type ConfidentialSettlement_NoteClaimed_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<ConfidentialSettlement_NoteClaimed_event,handlerContext,loaderReturn>;

export type ConfidentialSettlement_NoteClaimed_handler<loaderReturn> = Internal_genericHandler<ConfidentialSettlement_NoteClaimed_handlerArgs<loaderReturn>>;

export type ConfidentialSettlement_NoteClaimed_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<ConfidentialSettlement_NoteClaimed_event,contractRegistrations>>;

export type ConfidentialSettlement_NoteClaimed_eventFilter = { readonly _0?: SingleOrMultiple_t<bigint>; readonly _1?: SingleOrMultiple_t<string> };

export type ConfidentialSettlement_NoteClaimed_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: ConfidentialSettlement_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type ConfidentialSettlement_NoteClaimed_eventFiltersDefinition = 
    ConfidentialSettlement_NoteClaimed_eventFilter
  | ConfidentialSettlement_NoteClaimed_eventFilter[];

export type ConfidentialSettlement_NoteClaimed_eventFilters = 
    ConfidentialSettlement_NoteClaimed_eventFilter
  | ConfidentialSettlement_NoteClaimed_eventFilter[]
  | ((_1:ConfidentialSettlement_NoteClaimed_eventFiltersArgs) => ConfidentialSettlement_NoteClaimed_eventFiltersDefinition);

export type ConfidentialSettlement_NoteCommitted_eventArgs = {
  readonly _0: bigint; 
  readonly _1: bigint; 
  readonly _2: bigint; 
  readonly _3: bigint; 
  readonly _4: Address_t; 
  readonly _5: bigint; 
  readonly _6: string; 
  readonly _7: string; 
  readonly _8: string
};

export type ConfidentialSettlement_NoteCommitted_block = Block_t;

export type ConfidentialSettlement_NoteCommitted_transaction = Transaction_t;

export type ConfidentialSettlement_NoteCommitted_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: ConfidentialSettlement_NoteCommitted_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: ConfidentialSettlement_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: ConfidentialSettlement_NoteCommitted_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: ConfidentialSettlement_NoteCommitted_block
};

export type ConfidentialSettlement_NoteCommitted_loaderArgs = Internal_genericLoaderArgs<ConfidentialSettlement_NoteCommitted_event,loaderContext>;

export type ConfidentialSettlement_NoteCommitted_loader<loaderReturn> = Internal_genericLoader<ConfidentialSettlement_NoteCommitted_loaderArgs,loaderReturn>;

export type ConfidentialSettlement_NoteCommitted_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<ConfidentialSettlement_NoteCommitted_event,handlerContext,loaderReturn>;

export type ConfidentialSettlement_NoteCommitted_handler<loaderReturn> = Internal_genericHandler<ConfidentialSettlement_NoteCommitted_handlerArgs<loaderReturn>>;

export type ConfidentialSettlement_NoteCommitted_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<ConfidentialSettlement_NoteCommitted_event,contractRegistrations>>;

export type ConfidentialSettlement_NoteCommitted_eventFilter = {
  readonly _0?: SingleOrMultiple_t<bigint>; 
  readonly _1?: SingleOrMultiple_t<bigint>; 
  readonly _2?: SingleOrMultiple_t<bigint>
};

export type ConfidentialSettlement_NoteCommitted_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: ConfidentialSettlement_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type ConfidentialSettlement_NoteCommitted_eventFiltersDefinition = 
    ConfidentialSettlement_NoteCommitted_eventFilter
  | ConfidentialSettlement_NoteCommitted_eventFilter[];

export type ConfidentialSettlement_NoteCommitted_eventFilters = 
    ConfidentialSettlement_NoteCommitted_eventFilter
  | ConfidentialSettlement_NoteCommitted_eventFilter[]
  | ((_1:ConfidentialSettlement_NoteCommitted_eventFiltersArgs) => ConfidentialSettlement_NoteCommitted_eventFiltersDefinition);

export type ConfidentialSettlement_OwnershipTransferStarted_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type ConfidentialSettlement_OwnershipTransferStarted_block = Block_t;

export type ConfidentialSettlement_OwnershipTransferStarted_transaction = Transaction_t;

export type ConfidentialSettlement_OwnershipTransferStarted_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: ConfidentialSettlement_OwnershipTransferStarted_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: ConfidentialSettlement_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: ConfidentialSettlement_OwnershipTransferStarted_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: ConfidentialSettlement_OwnershipTransferStarted_block
};

export type ConfidentialSettlement_OwnershipTransferStarted_loaderArgs = Internal_genericLoaderArgs<ConfidentialSettlement_OwnershipTransferStarted_event,loaderContext>;

export type ConfidentialSettlement_OwnershipTransferStarted_loader<loaderReturn> = Internal_genericLoader<ConfidentialSettlement_OwnershipTransferStarted_loaderArgs,loaderReturn>;

export type ConfidentialSettlement_OwnershipTransferStarted_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<ConfidentialSettlement_OwnershipTransferStarted_event,handlerContext,loaderReturn>;

export type ConfidentialSettlement_OwnershipTransferStarted_handler<loaderReturn> = Internal_genericHandler<ConfidentialSettlement_OwnershipTransferStarted_handlerArgs<loaderReturn>>;

export type ConfidentialSettlement_OwnershipTransferStarted_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<ConfidentialSettlement_OwnershipTransferStarted_event,contractRegistrations>>;

export type ConfidentialSettlement_OwnershipTransferStarted_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type ConfidentialSettlement_OwnershipTransferStarted_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: ConfidentialSettlement_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type ConfidentialSettlement_OwnershipTransferStarted_eventFiltersDefinition = 
    ConfidentialSettlement_OwnershipTransferStarted_eventFilter
  | ConfidentialSettlement_OwnershipTransferStarted_eventFilter[];

export type ConfidentialSettlement_OwnershipTransferStarted_eventFilters = 
    ConfidentialSettlement_OwnershipTransferStarted_eventFilter
  | ConfidentialSettlement_OwnershipTransferStarted_eventFilter[]
  | ((_1:ConfidentialSettlement_OwnershipTransferStarted_eventFiltersArgs) => ConfidentialSettlement_OwnershipTransferStarted_eventFiltersDefinition);

export type ConfidentialSettlement_OwnershipTransferred_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type ConfidentialSettlement_OwnershipTransferred_block = Block_t;

export type ConfidentialSettlement_OwnershipTransferred_transaction = Transaction_t;

export type ConfidentialSettlement_OwnershipTransferred_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: ConfidentialSettlement_OwnershipTransferred_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: ConfidentialSettlement_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: ConfidentialSettlement_OwnershipTransferred_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: ConfidentialSettlement_OwnershipTransferred_block
};

export type ConfidentialSettlement_OwnershipTransferred_loaderArgs = Internal_genericLoaderArgs<ConfidentialSettlement_OwnershipTransferred_event,loaderContext>;

export type ConfidentialSettlement_OwnershipTransferred_loader<loaderReturn> = Internal_genericLoader<ConfidentialSettlement_OwnershipTransferred_loaderArgs,loaderReturn>;

export type ConfidentialSettlement_OwnershipTransferred_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<ConfidentialSettlement_OwnershipTransferred_event,handlerContext,loaderReturn>;

export type ConfidentialSettlement_OwnershipTransferred_handler<loaderReturn> = Internal_genericHandler<ConfidentialSettlement_OwnershipTransferred_handlerArgs<loaderReturn>>;

export type ConfidentialSettlement_OwnershipTransferred_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<ConfidentialSettlement_OwnershipTransferred_event,contractRegistrations>>;

export type ConfidentialSettlement_OwnershipTransferred_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type ConfidentialSettlement_OwnershipTransferred_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: ConfidentialSettlement_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type ConfidentialSettlement_OwnershipTransferred_eventFiltersDefinition = 
    ConfidentialSettlement_OwnershipTransferred_eventFilter
  | ConfidentialSettlement_OwnershipTransferred_eventFilter[];

export type ConfidentialSettlement_OwnershipTransferred_eventFilters = 
    ConfidentialSettlement_OwnershipTransferred_eventFilter
  | ConfidentialSettlement_OwnershipTransferred_eventFilter[]
  | ((_1:ConfidentialSettlement_OwnershipTransferred_eventFiltersArgs) => ConfidentialSettlement_OwnershipTransferred_eventFiltersDefinition);

export type ConfidentialSettlement_Upgraded_eventArgs = { readonly _0: Address_t };

export type ConfidentialSettlement_Upgraded_block = Block_t;

export type ConfidentialSettlement_Upgraded_transaction = Transaction_t;

export type ConfidentialSettlement_Upgraded_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: ConfidentialSettlement_Upgraded_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: ConfidentialSettlement_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: ConfidentialSettlement_Upgraded_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: ConfidentialSettlement_Upgraded_block
};

export type ConfidentialSettlement_Upgraded_loaderArgs = Internal_genericLoaderArgs<ConfidentialSettlement_Upgraded_event,loaderContext>;

export type ConfidentialSettlement_Upgraded_loader<loaderReturn> = Internal_genericLoader<ConfidentialSettlement_Upgraded_loaderArgs,loaderReturn>;

export type ConfidentialSettlement_Upgraded_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<ConfidentialSettlement_Upgraded_event,handlerContext,loaderReturn>;

export type ConfidentialSettlement_Upgraded_handler<loaderReturn> = Internal_genericHandler<ConfidentialSettlement_Upgraded_handlerArgs<loaderReturn>>;

export type ConfidentialSettlement_Upgraded_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<ConfidentialSettlement_Upgraded_event,contractRegistrations>>;

export type ConfidentialSettlement_Upgraded_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t> };

export type ConfidentialSettlement_Upgraded_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: ConfidentialSettlement_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type ConfidentialSettlement_Upgraded_eventFiltersDefinition = 
    ConfidentialSettlement_Upgraded_eventFilter
  | ConfidentialSettlement_Upgraded_eventFilter[];

export type ConfidentialSettlement_Upgraded_eventFilters = 
    ConfidentialSettlement_Upgraded_eventFilter
  | ConfidentialSettlement_Upgraded_eventFilter[]
  | ((_1:ConfidentialSettlement_Upgraded_eventFiltersArgs) => ConfidentialSettlement_Upgraded_eventFiltersDefinition);

export type IssuanceRegistry_chainId = 99999;

export type IssuanceRegistry_EngineAddressUpdated_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type IssuanceRegistry_EngineAddressUpdated_block = Block_t;

export type IssuanceRegistry_EngineAddressUpdated_transaction = Transaction_t;

export type IssuanceRegistry_EngineAddressUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: IssuanceRegistry_EngineAddressUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: IssuanceRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: IssuanceRegistry_EngineAddressUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: IssuanceRegistry_EngineAddressUpdated_block
};

export type IssuanceRegistry_EngineAddressUpdated_loaderArgs = Internal_genericLoaderArgs<IssuanceRegistry_EngineAddressUpdated_event,loaderContext>;

export type IssuanceRegistry_EngineAddressUpdated_loader<loaderReturn> = Internal_genericLoader<IssuanceRegistry_EngineAddressUpdated_loaderArgs,loaderReturn>;

export type IssuanceRegistry_EngineAddressUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<IssuanceRegistry_EngineAddressUpdated_event,handlerContext,loaderReturn>;

export type IssuanceRegistry_EngineAddressUpdated_handler<loaderReturn> = Internal_genericHandler<IssuanceRegistry_EngineAddressUpdated_handlerArgs<loaderReturn>>;

export type IssuanceRegistry_EngineAddressUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<IssuanceRegistry_EngineAddressUpdated_event,contractRegistrations>>;

export type IssuanceRegistry_EngineAddressUpdated_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type IssuanceRegistry_EngineAddressUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: IssuanceRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type IssuanceRegistry_EngineAddressUpdated_eventFiltersDefinition = 
    IssuanceRegistry_EngineAddressUpdated_eventFilter
  | IssuanceRegistry_EngineAddressUpdated_eventFilter[];

export type IssuanceRegistry_EngineAddressUpdated_eventFilters = 
    IssuanceRegistry_EngineAddressUpdated_eventFilter
  | IssuanceRegistry_EngineAddressUpdated_eventFilter[]
  | ((_1:IssuanceRegistry_EngineAddressUpdated_eventFiltersArgs) => IssuanceRegistry_EngineAddressUpdated_eventFiltersDefinition);

export type IssuanceRegistry_Initialized_eventArgs = { readonly _0: bigint };

export type IssuanceRegistry_Initialized_block = Block_t;

export type IssuanceRegistry_Initialized_transaction = Transaction_t;

export type IssuanceRegistry_Initialized_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: IssuanceRegistry_Initialized_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: IssuanceRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: IssuanceRegistry_Initialized_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: IssuanceRegistry_Initialized_block
};

export type IssuanceRegistry_Initialized_loaderArgs = Internal_genericLoaderArgs<IssuanceRegistry_Initialized_event,loaderContext>;

export type IssuanceRegistry_Initialized_loader<loaderReturn> = Internal_genericLoader<IssuanceRegistry_Initialized_loaderArgs,loaderReturn>;

export type IssuanceRegistry_Initialized_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<IssuanceRegistry_Initialized_event,handlerContext,loaderReturn>;

export type IssuanceRegistry_Initialized_handler<loaderReturn> = Internal_genericHandler<IssuanceRegistry_Initialized_handlerArgs<loaderReturn>>;

export type IssuanceRegistry_Initialized_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<IssuanceRegistry_Initialized_event,contractRegistrations>>;

export type IssuanceRegistry_Initialized_eventFilter = {};

export type IssuanceRegistry_Initialized_eventFilters = Internal_noEventFilters;

export type IssuanceRegistry_IssuanceRequestCancelled_eventArgs = { readonly _0: bigint; readonly _1: Address_t };

export type IssuanceRegistry_IssuanceRequestCancelled_block = Block_t;

export type IssuanceRegistry_IssuanceRequestCancelled_transaction = Transaction_t;

export type IssuanceRegistry_IssuanceRequestCancelled_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: IssuanceRegistry_IssuanceRequestCancelled_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: IssuanceRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: IssuanceRegistry_IssuanceRequestCancelled_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: IssuanceRegistry_IssuanceRequestCancelled_block
};

export type IssuanceRegistry_IssuanceRequestCancelled_loaderArgs = Internal_genericLoaderArgs<IssuanceRegistry_IssuanceRequestCancelled_event,loaderContext>;

export type IssuanceRegistry_IssuanceRequestCancelled_loader<loaderReturn> = Internal_genericLoader<IssuanceRegistry_IssuanceRequestCancelled_loaderArgs,loaderReturn>;

export type IssuanceRegistry_IssuanceRequestCancelled_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<IssuanceRegistry_IssuanceRequestCancelled_event,handlerContext,loaderReturn>;

export type IssuanceRegistry_IssuanceRequestCancelled_handler<loaderReturn> = Internal_genericHandler<IssuanceRegistry_IssuanceRequestCancelled_handlerArgs<loaderReturn>>;

export type IssuanceRegistry_IssuanceRequestCancelled_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<IssuanceRegistry_IssuanceRequestCancelled_event,contractRegistrations>>;

export type IssuanceRegistry_IssuanceRequestCancelled_eventFilter = { readonly _0?: SingleOrMultiple_t<bigint>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type IssuanceRegistry_IssuanceRequestCancelled_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: IssuanceRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type IssuanceRegistry_IssuanceRequestCancelled_eventFiltersDefinition = 
    IssuanceRegistry_IssuanceRequestCancelled_eventFilter
  | IssuanceRegistry_IssuanceRequestCancelled_eventFilter[];

export type IssuanceRegistry_IssuanceRequestCancelled_eventFilters = 
    IssuanceRegistry_IssuanceRequestCancelled_eventFilter
  | IssuanceRegistry_IssuanceRequestCancelled_eventFilter[]
  | ((_1:IssuanceRegistry_IssuanceRequestCancelled_eventFiltersArgs) => IssuanceRegistry_IssuanceRequestCancelled_eventFiltersDefinition);

export type IssuanceRegistry_IssuanceRequestConsumed_eventArgs = { readonly _0: bigint; readonly _1: Address_t };

export type IssuanceRegistry_IssuanceRequestConsumed_block = Block_t;

export type IssuanceRegistry_IssuanceRequestConsumed_transaction = Transaction_t;

export type IssuanceRegistry_IssuanceRequestConsumed_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: IssuanceRegistry_IssuanceRequestConsumed_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: IssuanceRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: IssuanceRegistry_IssuanceRequestConsumed_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: IssuanceRegistry_IssuanceRequestConsumed_block
};

export type IssuanceRegistry_IssuanceRequestConsumed_loaderArgs = Internal_genericLoaderArgs<IssuanceRegistry_IssuanceRequestConsumed_event,loaderContext>;

export type IssuanceRegistry_IssuanceRequestConsumed_loader<loaderReturn> = Internal_genericLoader<IssuanceRegistry_IssuanceRequestConsumed_loaderArgs,loaderReturn>;

export type IssuanceRegistry_IssuanceRequestConsumed_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<IssuanceRegistry_IssuanceRequestConsumed_event,handlerContext,loaderReturn>;

export type IssuanceRegistry_IssuanceRequestConsumed_handler<loaderReturn> = Internal_genericHandler<IssuanceRegistry_IssuanceRequestConsumed_handlerArgs<loaderReturn>>;

export type IssuanceRegistry_IssuanceRequestConsumed_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<IssuanceRegistry_IssuanceRequestConsumed_event,contractRegistrations>>;

export type IssuanceRegistry_IssuanceRequestConsumed_eventFilter = { readonly _0?: SingleOrMultiple_t<bigint>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type IssuanceRegistry_IssuanceRequestConsumed_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: IssuanceRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type IssuanceRegistry_IssuanceRequestConsumed_eventFiltersDefinition = 
    IssuanceRegistry_IssuanceRequestConsumed_eventFilter
  | IssuanceRegistry_IssuanceRequestConsumed_eventFilter[];

export type IssuanceRegistry_IssuanceRequestConsumed_eventFilters = 
    IssuanceRegistry_IssuanceRequestConsumed_eventFilter
  | IssuanceRegistry_IssuanceRequestConsumed_eventFilter[]
  | ((_1:IssuanceRegistry_IssuanceRequestConsumed_eventFiltersArgs) => IssuanceRegistry_IssuanceRequestConsumed_eventFiltersDefinition);

export type IssuanceRegistry_IssuanceRequestCreated_eventArgs = {
  readonly _0: bigint; 
  readonly _1: string; 
  readonly _2: Address_t; 
  readonly _3: Address_t; 
  readonly _4: bigint; 
  readonly _5: Address_t; 
  readonly _6: bigint; 
  readonly _7: bigint; 
  readonly _8: string; 
  readonly _9: string; 
  readonly _10: string; 
  readonly _11: bigint; 
  readonly _12: string
};

export type IssuanceRegistry_IssuanceRequestCreated_block = Block_t;

export type IssuanceRegistry_IssuanceRequestCreated_transaction = Transaction_t;

export type IssuanceRegistry_IssuanceRequestCreated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: IssuanceRegistry_IssuanceRequestCreated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: IssuanceRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: IssuanceRegistry_IssuanceRequestCreated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: IssuanceRegistry_IssuanceRequestCreated_block
};

export type IssuanceRegistry_IssuanceRequestCreated_loaderArgs = Internal_genericLoaderArgs<IssuanceRegistry_IssuanceRequestCreated_event,loaderContext>;

export type IssuanceRegistry_IssuanceRequestCreated_loader<loaderReturn> = Internal_genericLoader<IssuanceRegistry_IssuanceRequestCreated_loaderArgs,loaderReturn>;

export type IssuanceRegistry_IssuanceRequestCreated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<IssuanceRegistry_IssuanceRequestCreated_event,handlerContext,loaderReturn>;

export type IssuanceRegistry_IssuanceRequestCreated_handler<loaderReturn> = Internal_genericHandler<IssuanceRegistry_IssuanceRequestCreated_handlerArgs<loaderReturn>>;

export type IssuanceRegistry_IssuanceRequestCreated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<IssuanceRegistry_IssuanceRequestCreated_event,contractRegistrations>>;

export type IssuanceRegistry_IssuanceRequestCreated_eventFilter = {
  readonly _0?: SingleOrMultiple_t<bigint>; 
  readonly _1?: SingleOrMultiple_t<string>; 
  readonly _2?: SingleOrMultiple_t<Address_t>
};

export type IssuanceRegistry_IssuanceRequestCreated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: IssuanceRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type IssuanceRegistry_IssuanceRequestCreated_eventFiltersDefinition = 
    IssuanceRegistry_IssuanceRequestCreated_eventFilter
  | IssuanceRegistry_IssuanceRequestCreated_eventFilter[];

export type IssuanceRegistry_IssuanceRequestCreated_eventFilters = 
    IssuanceRegistry_IssuanceRequestCreated_eventFilter
  | IssuanceRegistry_IssuanceRequestCreated_eventFilter[]
  | ((_1:IssuanceRegistry_IssuanceRequestCreated_eventFiltersArgs) => IssuanceRegistry_IssuanceRequestCreated_eventFiltersDefinition);

export type IssuanceRegistry_IssuanceRequestPrivacyBound_eventArgs = {
  readonly _0: bigint; 
  readonly _1: bigint; 
  readonly _2: string
};

export type IssuanceRegistry_IssuanceRequestPrivacyBound_block = Block_t;

export type IssuanceRegistry_IssuanceRequestPrivacyBound_transaction = Transaction_t;

export type IssuanceRegistry_IssuanceRequestPrivacyBound_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: IssuanceRegistry_IssuanceRequestPrivacyBound_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: IssuanceRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: IssuanceRegistry_IssuanceRequestPrivacyBound_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: IssuanceRegistry_IssuanceRequestPrivacyBound_block
};

export type IssuanceRegistry_IssuanceRequestPrivacyBound_loaderArgs = Internal_genericLoaderArgs<IssuanceRegistry_IssuanceRequestPrivacyBound_event,loaderContext>;

export type IssuanceRegistry_IssuanceRequestPrivacyBound_loader<loaderReturn> = Internal_genericLoader<IssuanceRegistry_IssuanceRequestPrivacyBound_loaderArgs,loaderReturn>;

export type IssuanceRegistry_IssuanceRequestPrivacyBound_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<IssuanceRegistry_IssuanceRequestPrivacyBound_event,handlerContext,loaderReturn>;

export type IssuanceRegistry_IssuanceRequestPrivacyBound_handler<loaderReturn> = Internal_genericHandler<IssuanceRegistry_IssuanceRequestPrivacyBound_handlerArgs<loaderReturn>>;

export type IssuanceRegistry_IssuanceRequestPrivacyBound_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<IssuanceRegistry_IssuanceRequestPrivacyBound_event,contractRegistrations>>;

export type IssuanceRegistry_IssuanceRequestPrivacyBound_eventFilter = { readonly _0?: SingleOrMultiple_t<bigint> };

export type IssuanceRegistry_IssuanceRequestPrivacyBound_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: IssuanceRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type IssuanceRegistry_IssuanceRequestPrivacyBound_eventFiltersDefinition = 
    IssuanceRegistry_IssuanceRequestPrivacyBound_eventFilter
  | IssuanceRegistry_IssuanceRequestPrivacyBound_eventFilter[];

export type IssuanceRegistry_IssuanceRequestPrivacyBound_eventFilters = 
    IssuanceRegistry_IssuanceRequestPrivacyBound_eventFilter
  | IssuanceRegistry_IssuanceRequestPrivacyBound_eventFilter[]
  | ((_1:IssuanceRegistry_IssuanceRequestPrivacyBound_eventFiltersArgs) => IssuanceRegistry_IssuanceRequestPrivacyBound_eventFiltersDefinition);

export type IssuanceRegistry_PaymentRegistryUpdated_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type IssuanceRegistry_PaymentRegistryUpdated_block = Block_t;

export type IssuanceRegistry_PaymentRegistryUpdated_transaction = Transaction_t;

export type IssuanceRegistry_PaymentRegistryUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: IssuanceRegistry_PaymentRegistryUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: IssuanceRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: IssuanceRegistry_PaymentRegistryUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: IssuanceRegistry_PaymentRegistryUpdated_block
};

export type IssuanceRegistry_PaymentRegistryUpdated_loaderArgs = Internal_genericLoaderArgs<IssuanceRegistry_PaymentRegistryUpdated_event,loaderContext>;

export type IssuanceRegistry_PaymentRegistryUpdated_loader<loaderReturn> = Internal_genericLoader<IssuanceRegistry_PaymentRegistryUpdated_loaderArgs,loaderReturn>;

export type IssuanceRegistry_PaymentRegistryUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<IssuanceRegistry_PaymentRegistryUpdated_event,handlerContext,loaderReturn>;

export type IssuanceRegistry_PaymentRegistryUpdated_handler<loaderReturn> = Internal_genericHandler<IssuanceRegistry_PaymentRegistryUpdated_handlerArgs<loaderReturn>>;

export type IssuanceRegistry_PaymentRegistryUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<IssuanceRegistry_PaymentRegistryUpdated_event,contractRegistrations>>;

export type IssuanceRegistry_PaymentRegistryUpdated_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type IssuanceRegistry_PaymentRegistryUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: IssuanceRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type IssuanceRegistry_PaymentRegistryUpdated_eventFiltersDefinition = 
    IssuanceRegistry_PaymentRegistryUpdated_eventFilter
  | IssuanceRegistry_PaymentRegistryUpdated_eventFilter[];

export type IssuanceRegistry_PaymentRegistryUpdated_eventFilters = 
    IssuanceRegistry_PaymentRegistryUpdated_eventFilter
  | IssuanceRegistry_PaymentRegistryUpdated_eventFilter[]
  | ((_1:IssuanceRegistry_PaymentRegistryUpdated_eventFiltersArgs) => IssuanceRegistry_PaymentRegistryUpdated_eventFiltersDefinition);

export type IssuanceRegistry_WorkerPrivacyConfigurationUpdated_eventArgs = {
  readonly _0: Address_t; 
  readonly _1: bigint; 
  readonly _2: string; 
  readonly _3: string; 
  readonly _4: string; 
  readonly _5: bigint; 
  readonly _6: bigint
};

export type IssuanceRegistry_WorkerPrivacyConfigurationUpdated_block = Block_t;

export type IssuanceRegistry_WorkerPrivacyConfigurationUpdated_transaction = Transaction_t;

export type IssuanceRegistry_WorkerPrivacyConfigurationUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: IssuanceRegistry_WorkerPrivacyConfigurationUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: IssuanceRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: IssuanceRegistry_WorkerPrivacyConfigurationUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: IssuanceRegistry_WorkerPrivacyConfigurationUpdated_block
};

export type IssuanceRegistry_WorkerPrivacyConfigurationUpdated_loaderArgs = Internal_genericLoaderArgs<IssuanceRegistry_WorkerPrivacyConfigurationUpdated_event,loaderContext>;

export type IssuanceRegistry_WorkerPrivacyConfigurationUpdated_loader<loaderReturn> = Internal_genericLoader<IssuanceRegistry_WorkerPrivacyConfigurationUpdated_loaderArgs,loaderReturn>;

export type IssuanceRegistry_WorkerPrivacyConfigurationUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<IssuanceRegistry_WorkerPrivacyConfigurationUpdated_event,handlerContext,loaderReturn>;

export type IssuanceRegistry_WorkerPrivacyConfigurationUpdated_handler<loaderReturn> = Internal_genericHandler<IssuanceRegistry_WorkerPrivacyConfigurationUpdated_handlerArgs<loaderReturn>>;

export type IssuanceRegistry_WorkerPrivacyConfigurationUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<IssuanceRegistry_WorkerPrivacyConfigurationUpdated_event,contractRegistrations>>;

export type IssuanceRegistry_WorkerPrivacyConfigurationUpdated_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t> };

export type IssuanceRegistry_WorkerPrivacyConfigurationUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: IssuanceRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type IssuanceRegistry_WorkerPrivacyConfigurationUpdated_eventFiltersDefinition = 
    IssuanceRegistry_WorkerPrivacyConfigurationUpdated_eventFilter
  | IssuanceRegistry_WorkerPrivacyConfigurationUpdated_eventFilter[];

export type IssuanceRegistry_WorkerPrivacyConfigurationUpdated_eventFilters = 
    IssuanceRegistry_WorkerPrivacyConfigurationUpdated_eventFilter
  | IssuanceRegistry_WorkerPrivacyConfigurationUpdated_eventFilter[]
  | ((_1:IssuanceRegistry_WorkerPrivacyConfigurationUpdated_eventFiltersArgs) => IssuanceRegistry_WorkerPrivacyConfigurationUpdated_eventFiltersDefinition);

export type IssuanceRegistry_OwnershipTransferStarted_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type IssuanceRegistry_OwnershipTransferStarted_block = Block_t;

export type IssuanceRegistry_OwnershipTransferStarted_transaction = Transaction_t;

export type IssuanceRegistry_OwnershipTransferStarted_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: IssuanceRegistry_OwnershipTransferStarted_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: IssuanceRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: IssuanceRegistry_OwnershipTransferStarted_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: IssuanceRegistry_OwnershipTransferStarted_block
};

export type IssuanceRegistry_OwnershipTransferStarted_loaderArgs = Internal_genericLoaderArgs<IssuanceRegistry_OwnershipTransferStarted_event,loaderContext>;

export type IssuanceRegistry_OwnershipTransferStarted_loader<loaderReturn> = Internal_genericLoader<IssuanceRegistry_OwnershipTransferStarted_loaderArgs,loaderReturn>;

export type IssuanceRegistry_OwnershipTransferStarted_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<IssuanceRegistry_OwnershipTransferStarted_event,handlerContext,loaderReturn>;

export type IssuanceRegistry_OwnershipTransferStarted_handler<loaderReturn> = Internal_genericHandler<IssuanceRegistry_OwnershipTransferStarted_handlerArgs<loaderReturn>>;

export type IssuanceRegistry_OwnershipTransferStarted_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<IssuanceRegistry_OwnershipTransferStarted_event,contractRegistrations>>;

export type IssuanceRegistry_OwnershipTransferStarted_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type IssuanceRegistry_OwnershipTransferStarted_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: IssuanceRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type IssuanceRegistry_OwnershipTransferStarted_eventFiltersDefinition = 
    IssuanceRegistry_OwnershipTransferStarted_eventFilter
  | IssuanceRegistry_OwnershipTransferStarted_eventFilter[];

export type IssuanceRegistry_OwnershipTransferStarted_eventFilters = 
    IssuanceRegistry_OwnershipTransferStarted_eventFilter
  | IssuanceRegistry_OwnershipTransferStarted_eventFilter[]
  | ((_1:IssuanceRegistry_OwnershipTransferStarted_eventFiltersArgs) => IssuanceRegistry_OwnershipTransferStarted_eventFiltersDefinition);

export type IssuanceRegistry_OwnershipTransferred_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type IssuanceRegistry_OwnershipTransferred_block = Block_t;

export type IssuanceRegistry_OwnershipTransferred_transaction = Transaction_t;

export type IssuanceRegistry_OwnershipTransferred_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: IssuanceRegistry_OwnershipTransferred_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: IssuanceRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: IssuanceRegistry_OwnershipTransferred_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: IssuanceRegistry_OwnershipTransferred_block
};

export type IssuanceRegistry_OwnershipTransferred_loaderArgs = Internal_genericLoaderArgs<IssuanceRegistry_OwnershipTransferred_event,loaderContext>;

export type IssuanceRegistry_OwnershipTransferred_loader<loaderReturn> = Internal_genericLoader<IssuanceRegistry_OwnershipTransferred_loaderArgs,loaderReturn>;

export type IssuanceRegistry_OwnershipTransferred_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<IssuanceRegistry_OwnershipTransferred_event,handlerContext,loaderReturn>;

export type IssuanceRegistry_OwnershipTransferred_handler<loaderReturn> = Internal_genericHandler<IssuanceRegistry_OwnershipTransferred_handlerArgs<loaderReturn>>;

export type IssuanceRegistry_OwnershipTransferred_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<IssuanceRegistry_OwnershipTransferred_event,contractRegistrations>>;

export type IssuanceRegistry_OwnershipTransferred_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type IssuanceRegistry_OwnershipTransferred_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: IssuanceRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type IssuanceRegistry_OwnershipTransferred_eventFiltersDefinition = 
    IssuanceRegistry_OwnershipTransferred_eventFilter
  | IssuanceRegistry_OwnershipTransferred_eventFilter[];

export type IssuanceRegistry_OwnershipTransferred_eventFilters = 
    IssuanceRegistry_OwnershipTransferred_eventFilter
  | IssuanceRegistry_OwnershipTransferred_eventFilter[]
  | ((_1:IssuanceRegistry_OwnershipTransferred_eventFiltersArgs) => IssuanceRegistry_OwnershipTransferred_eventFiltersDefinition);

export type IssuanceRegistry_Upgraded_eventArgs = { readonly _0: Address_t };

export type IssuanceRegistry_Upgraded_block = Block_t;

export type IssuanceRegistry_Upgraded_transaction = Transaction_t;

export type IssuanceRegistry_Upgraded_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: IssuanceRegistry_Upgraded_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: IssuanceRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: IssuanceRegistry_Upgraded_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: IssuanceRegistry_Upgraded_block
};

export type IssuanceRegistry_Upgraded_loaderArgs = Internal_genericLoaderArgs<IssuanceRegistry_Upgraded_event,loaderContext>;

export type IssuanceRegistry_Upgraded_loader<loaderReturn> = Internal_genericLoader<IssuanceRegistry_Upgraded_loaderArgs,loaderReturn>;

export type IssuanceRegistry_Upgraded_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<IssuanceRegistry_Upgraded_event,handlerContext,loaderReturn>;

export type IssuanceRegistry_Upgraded_handler<loaderReturn> = Internal_genericHandler<IssuanceRegistry_Upgraded_handlerArgs<loaderReturn>>;

export type IssuanceRegistry_Upgraded_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<IssuanceRegistry_Upgraded_event,contractRegistrations>>;

export type IssuanceRegistry_Upgraded_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t> };

export type IssuanceRegistry_Upgraded_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: IssuanceRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type IssuanceRegistry_Upgraded_eventFiltersDefinition = 
    IssuanceRegistry_Upgraded_eventFilter
  | IssuanceRegistry_Upgraded_eventFilter[];

export type IssuanceRegistry_Upgraded_eventFilters = 
    IssuanceRegistry_Upgraded_eventFilter
  | IssuanceRegistry_Upgraded_eventFilter[]
  | ((_1:IssuanceRegistry_Upgraded_eventFiltersArgs) => IssuanceRegistry_Upgraded_eventFiltersDefinition);

export type PaymentRegistry_chainId = 99999;

export type PaymentRegistry_Initialized_eventArgs = { readonly _0: bigint };

export type PaymentRegistry_Initialized_block = Block_t;

export type PaymentRegistry_Initialized_transaction = Transaction_t;

export type PaymentRegistry_Initialized_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: PaymentRegistry_Initialized_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: PaymentRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: PaymentRegistry_Initialized_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: PaymentRegistry_Initialized_block
};

export type PaymentRegistry_Initialized_loaderArgs = Internal_genericLoaderArgs<PaymentRegistry_Initialized_event,loaderContext>;

export type PaymentRegistry_Initialized_loader<loaderReturn> = Internal_genericLoader<PaymentRegistry_Initialized_loaderArgs,loaderReturn>;

export type PaymentRegistry_Initialized_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<PaymentRegistry_Initialized_event,handlerContext,loaderReturn>;

export type PaymentRegistry_Initialized_handler<loaderReturn> = Internal_genericHandler<PaymentRegistry_Initialized_handlerArgs<loaderReturn>>;

export type PaymentRegistry_Initialized_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<PaymentRegistry_Initialized_event,contractRegistrations>>;

export type PaymentRegistry_Initialized_eventFilter = {};

export type PaymentRegistry_Initialized_eventFilters = Internal_noEventFilters;

export type PaymentRegistry_OwnershipTransferStarted_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type PaymentRegistry_OwnershipTransferStarted_block = Block_t;

export type PaymentRegistry_OwnershipTransferStarted_transaction = Transaction_t;

export type PaymentRegistry_OwnershipTransferStarted_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: PaymentRegistry_OwnershipTransferStarted_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: PaymentRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: PaymentRegistry_OwnershipTransferStarted_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: PaymentRegistry_OwnershipTransferStarted_block
};

export type PaymentRegistry_OwnershipTransferStarted_loaderArgs = Internal_genericLoaderArgs<PaymentRegistry_OwnershipTransferStarted_event,loaderContext>;

export type PaymentRegistry_OwnershipTransferStarted_loader<loaderReturn> = Internal_genericLoader<PaymentRegistry_OwnershipTransferStarted_loaderArgs,loaderReturn>;

export type PaymentRegistry_OwnershipTransferStarted_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<PaymentRegistry_OwnershipTransferStarted_event,handlerContext,loaderReturn>;

export type PaymentRegistry_OwnershipTransferStarted_handler<loaderReturn> = Internal_genericHandler<PaymentRegistry_OwnershipTransferStarted_handlerArgs<loaderReturn>>;

export type PaymentRegistry_OwnershipTransferStarted_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<PaymentRegistry_OwnershipTransferStarted_event,contractRegistrations>>;

export type PaymentRegistry_OwnershipTransferStarted_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type PaymentRegistry_OwnershipTransferStarted_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: PaymentRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type PaymentRegistry_OwnershipTransferStarted_eventFiltersDefinition = 
    PaymentRegistry_OwnershipTransferStarted_eventFilter
  | PaymentRegistry_OwnershipTransferStarted_eventFilter[];

export type PaymentRegistry_OwnershipTransferStarted_eventFilters = 
    PaymentRegistry_OwnershipTransferStarted_eventFilter
  | PaymentRegistry_OwnershipTransferStarted_eventFilter[]
  | ((_1:PaymentRegistry_OwnershipTransferStarted_eventFiltersArgs) => PaymentRegistry_OwnershipTransferStarted_eventFiltersDefinition);

export type PaymentRegistry_OwnershipTransferred_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type PaymentRegistry_OwnershipTransferred_block = Block_t;

export type PaymentRegistry_OwnershipTransferred_transaction = Transaction_t;

export type PaymentRegistry_OwnershipTransferred_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: PaymentRegistry_OwnershipTransferred_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: PaymentRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: PaymentRegistry_OwnershipTransferred_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: PaymentRegistry_OwnershipTransferred_block
};

export type PaymentRegistry_OwnershipTransferred_loaderArgs = Internal_genericLoaderArgs<PaymentRegistry_OwnershipTransferred_event,loaderContext>;

export type PaymentRegistry_OwnershipTransferred_loader<loaderReturn> = Internal_genericLoader<PaymentRegistry_OwnershipTransferred_loaderArgs,loaderReturn>;

export type PaymentRegistry_OwnershipTransferred_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<PaymentRegistry_OwnershipTransferred_event,handlerContext,loaderReturn>;

export type PaymentRegistry_OwnershipTransferred_handler<loaderReturn> = Internal_genericHandler<PaymentRegistry_OwnershipTransferred_handlerArgs<loaderReturn>>;

export type PaymentRegistry_OwnershipTransferred_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<PaymentRegistry_OwnershipTransferred_event,contractRegistrations>>;

export type PaymentRegistry_OwnershipTransferred_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type PaymentRegistry_OwnershipTransferred_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: PaymentRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type PaymentRegistry_OwnershipTransferred_eventFiltersDefinition = 
    PaymentRegistry_OwnershipTransferred_eventFilter
  | PaymentRegistry_OwnershipTransferred_eventFilter[];

export type PaymentRegistry_OwnershipTransferred_eventFilters = 
    PaymentRegistry_OwnershipTransferred_eventFilter
  | PaymentRegistry_OwnershipTransferred_eventFilter[]
  | ((_1:PaymentRegistry_OwnershipTransferred_eventFiltersArgs) => PaymentRegistry_OwnershipTransferred_eventFiltersDefinition);

export type PaymentRegistry_ParticipantProfileUpdated_eventArgs = {
  readonly _0: Address_t; 
  readonly _1: string; 
  readonly _2: bigint
};

export type PaymentRegistry_ParticipantProfileUpdated_block = Block_t;

export type PaymentRegistry_ParticipantProfileUpdated_transaction = Transaction_t;

export type PaymentRegistry_ParticipantProfileUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: PaymentRegistry_ParticipantProfileUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: PaymentRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: PaymentRegistry_ParticipantProfileUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: PaymentRegistry_ParticipantProfileUpdated_block
};

export type PaymentRegistry_ParticipantProfileUpdated_loaderArgs = Internal_genericLoaderArgs<PaymentRegistry_ParticipantProfileUpdated_event,loaderContext>;

export type PaymentRegistry_ParticipantProfileUpdated_loader<loaderReturn> = Internal_genericLoader<PaymentRegistry_ParticipantProfileUpdated_loaderArgs,loaderReturn>;

export type PaymentRegistry_ParticipantProfileUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<PaymentRegistry_ParticipantProfileUpdated_event,handlerContext,loaderReturn>;

export type PaymentRegistry_ParticipantProfileUpdated_handler<loaderReturn> = Internal_genericHandler<PaymentRegistry_ParticipantProfileUpdated_handlerArgs<loaderReturn>>;

export type PaymentRegistry_ParticipantProfileUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<PaymentRegistry_ParticipantProfileUpdated_event,contractRegistrations>>;

export type PaymentRegistry_ParticipantProfileUpdated_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t> };

export type PaymentRegistry_ParticipantProfileUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: PaymentRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type PaymentRegistry_ParticipantProfileUpdated_eventFiltersDefinition = 
    PaymentRegistry_ParticipantProfileUpdated_eventFilter
  | PaymentRegistry_ParticipantProfileUpdated_eventFilter[];

export type PaymentRegistry_ParticipantProfileUpdated_eventFilters = 
    PaymentRegistry_ParticipantProfileUpdated_eventFilter
  | PaymentRegistry_ParticipantProfileUpdated_eventFilter[]
  | ((_1:PaymentRegistry_ParticipantProfileUpdated_eventFiltersArgs) => PaymentRegistry_ParticipantProfileUpdated_eventFiltersDefinition);

export type PaymentRegistry_ParticipantRoleUpdated_eventArgs = {
  readonly _0: Address_t; 
  readonly _1: bigint; 
  readonly _2: boolean; 
  readonly _3: bigint; 
  readonly _4: bigint
};

export type PaymentRegistry_ParticipantRoleUpdated_block = Block_t;

export type PaymentRegistry_ParticipantRoleUpdated_transaction = Transaction_t;

export type PaymentRegistry_ParticipantRoleUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: PaymentRegistry_ParticipantRoleUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: PaymentRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: PaymentRegistry_ParticipantRoleUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: PaymentRegistry_ParticipantRoleUpdated_block
};

export type PaymentRegistry_ParticipantRoleUpdated_loaderArgs = Internal_genericLoaderArgs<PaymentRegistry_ParticipantRoleUpdated_event,loaderContext>;

export type PaymentRegistry_ParticipantRoleUpdated_loader<loaderReturn> = Internal_genericLoader<PaymentRegistry_ParticipantRoleUpdated_loaderArgs,loaderReturn>;

export type PaymentRegistry_ParticipantRoleUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<PaymentRegistry_ParticipantRoleUpdated_event,handlerContext,loaderReturn>;

export type PaymentRegistry_ParticipantRoleUpdated_handler<loaderReturn> = Internal_genericHandler<PaymentRegistry_ParticipantRoleUpdated_handlerArgs<loaderReturn>>;

export type PaymentRegistry_ParticipantRoleUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<PaymentRegistry_ParticipantRoleUpdated_event,contractRegistrations>>;

export type PaymentRegistry_ParticipantRoleUpdated_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<bigint> };

export type PaymentRegistry_ParticipantRoleUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: PaymentRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type PaymentRegistry_ParticipantRoleUpdated_eventFiltersDefinition = 
    PaymentRegistry_ParticipantRoleUpdated_eventFilter
  | PaymentRegistry_ParticipantRoleUpdated_eventFilter[];

export type PaymentRegistry_ParticipantRoleUpdated_eventFilters = 
    PaymentRegistry_ParticipantRoleUpdated_eventFilter
  | PaymentRegistry_ParticipantRoleUpdated_eventFilter[]
  | ((_1:PaymentRegistry_ParticipantRoleUpdated_eventFiltersArgs) => PaymentRegistry_ParticipantRoleUpdated_eventFiltersDefinition);

export type PaymentRegistry_ParticipantStatusUpdated_eventArgs = {
  readonly _0: Address_t; 
  readonly _1: boolean; 
  readonly _2: bigint
};

export type PaymentRegistry_ParticipantStatusUpdated_block = Block_t;

export type PaymentRegistry_ParticipantStatusUpdated_transaction = Transaction_t;

export type PaymentRegistry_ParticipantStatusUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: PaymentRegistry_ParticipantStatusUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: PaymentRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: PaymentRegistry_ParticipantStatusUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: PaymentRegistry_ParticipantStatusUpdated_block
};

export type PaymentRegistry_ParticipantStatusUpdated_loaderArgs = Internal_genericLoaderArgs<PaymentRegistry_ParticipantStatusUpdated_event,loaderContext>;

export type PaymentRegistry_ParticipantStatusUpdated_loader<loaderReturn> = Internal_genericLoader<PaymentRegistry_ParticipantStatusUpdated_loaderArgs,loaderReturn>;

export type PaymentRegistry_ParticipantStatusUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<PaymentRegistry_ParticipantStatusUpdated_event,handlerContext,loaderReturn>;

export type PaymentRegistry_ParticipantStatusUpdated_handler<loaderReturn> = Internal_genericHandler<PaymentRegistry_ParticipantStatusUpdated_handlerArgs<loaderReturn>>;

export type PaymentRegistry_ParticipantStatusUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<PaymentRegistry_ParticipantStatusUpdated_event,contractRegistrations>>;

export type PaymentRegistry_ParticipantStatusUpdated_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t> };

export type PaymentRegistry_ParticipantStatusUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: PaymentRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type PaymentRegistry_ParticipantStatusUpdated_eventFiltersDefinition = 
    PaymentRegistry_ParticipantStatusUpdated_eventFilter
  | PaymentRegistry_ParticipantStatusUpdated_eventFilter[];

export type PaymentRegistry_ParticipantStatusUpdated_eventFilters = 
    PaymentRegistry_ParticipantStatusUpdated_eventFilter
  | PaymentRegistry_ParticipantStatusUpdated_eventFilter[]
  | ((_1:PaymentRegistry_ParticipantStatusUpdated_eventFiltersArgs) => PaymentRegistry_ParticipantStatusUpdated_eventFiltersDefinition);

export type PaymentRegistry_Upgraded_eventArgs = { readonly _0: Address_t };

export type PaymentRegistry_Upgraded_block = Block_t;

export type PaymentRegistry_Upgraded_transaction = Transaction_t;

export type PaymentRegistry_Upgraded_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: PaymentRegistry_Upgraded_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: PaymentRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: PaymentRegistry_Upgraded_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: PaymentRegistry_Upgraded_block
};

export type PaymentRegistry_Upgraded_loaderArgs = Internal_genericLoaderArgs<PaymentRegistry_Upgraded_event,loaderContext>;

export type PaymentRegistry_Upgraded_loader<loaderReturn> = Internal_genericLoader<PaymentRegistry_Upgraded_loaderArgs,loaderReturn>;

export type PaymentRegistry_Upgraded_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<PaymentRegistry_Upgraded_event,handlerContext,loaderReturn>;

export type PaymentRegistry_Upgraded_handler<loaderReturn> = Internal_genericHandler<PaymentRegistry_Upgraded_handlerArgs<loaderReturn>>;

export type PaymentRegistry_Upgraded_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<PaymentRegistry_Upgraded_event,contractRegistrations>>;

export type PaymentRegistry_Upgraded_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t> };

export type PaymentRegistry_Upgraded_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: PaymentRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type PaymentRegistry_Upgraded_eventFiltersDefinition = 
    PaymentRegistry_Upgraded_eventFilter
  | PaymentRegistry_Upgraded_eventFilter[];

export type PaymentRegistry_Upgraded_eventFilters = 
    PaymentRegistry_Upgraded_eventFilter
  | PaymentRegistry_Upgraded_eventFilter[]
  | ((_1:PaymentRegistry_Upgraded_eventFiltersArgs) => PaymentRegistry_Upgraded_eventFiltersDefinition);

export type PolicyRegistry_chainId = 99999;

export type PolicyRegistry_ActivePolicyIdentifierUpdated_eventArgs = { readonly _0: bigint; readonly _1: bigint };

export type PolicyRegistry_ActivePolicyIdentifierUpdated_block = Block_t;

export type PolicyRegistry_ActivePolicyIdentifierUpdated_transaction = Transaction_t;

export type PolicyRegistry_ActivePolicyIdentifierUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: PolicyRegistry_ActivePolicyIdentifierUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: PolicyRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: PolicyRegistry_ActivePolicyIdentifierUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: PolicyRegistry_ActivePolicyIdentifierUpdated_block
};

export type PolicyRegistry_ActivePolicyIdentifierUpdated_loaderArgs = Internal_genericLoaderArgs<PolicyRegistry_ActivePolicyIdentifierUpdated_event,loaderContext>;

export type PolicyRegistry_ActivePolicyIdentifierUpdated_loader<loaderReturn> = Internal_genericLoader<PolicyRegistry_ActivePolicyIdentifierUpdated_loaderArgs,loaderReturn>;

export type PolicyRegistry_ActivePolicyIdentifierUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<PolicyRegistry_ActivePolicyIdentifierUpdated_event,handlerContext,loaderReturn>;

export type PolicyRegistry_ActivePolicyIdentifierUpdated_handler<loaderReturn> = Internal_genericHandler<PolicyRegistry_ActivePolicyIdentifierUpdated_handlerArgs<loaderReturn>>;

export type PolicyRegistry_ActivePolicyIdentifierUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<PolicyRegistry_ActivePolicyIdentifierUpdated_event,contractRegistrations>>;

export type PolicyRegistry_ActivePolicyIdentifierUpdated_eventFilter = { readonly _0?: SingleOrMultiple_t<bigint>; readonly _1?: SingleOrMultiple_t<bigint> };

export type PolicyRegistry_ActivePolicyIdentifierUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: PolicyRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type PolicyRegistry_ActivePolicyIdentifierUpdated_eventFiltersDefinition = 
    PolicyRegistry_ActivePolicyIdentifierUpdated_eventFilter
  | PolicyRegistry_ActivePolicyIdentifierUpdated_eventFilter[];

export type PolicyRegistry_ActivePolicyIdentifierUpdated_eventFilters = 
    PolicyRegistry_ActivePolicyIdentifierUpdated_eventFilter
  | PolicyRegistry_ActivePolicyIdentifierUpdated_eventFilter[]
  | ((_1:PolicyRegistry_ActivePolicyIdentifierUpdated_eventFiltersArgs) => PolicyRegistry_ActivePolicyIdentifierUpdated_eventFiltersDefinition);

export type PolicyRegistry_Initialized_eventArgs = { readonly _0: bigint };

export type PolicyRegistry_Initialized_block = Block_t;

export type PolicyRegistry_Initialized_transaction = Transaction_t;

export type PolicyRegistry_Initialized_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: PolicyRegistry_Initialized_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: PolicyRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: PolicyRegistry_Initialized_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: PolicyRegistry_Initialized_block
};

export type PolicyRegistry_Initialized_loaderArgs = Internal_genericLoaderArgs<PolicyRegistry_Initialized_event,loaderContext>;

export type PolicyRegistry_Initialized_loader<loaderReturn> = Internal_genericLoader<PolicyRegistry_Initialized_loaderArgs,loaderReturn>;

export type PolicyRegistry_Initialized_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<PolicyRegistry_Initialized_event,handlerContext,loaderReturn>;

export type PolicyRegistry_Initialized_handler<loaderReturn> = Internal_genericHandler<PolicyRegistry_Initialized_handlerArgs<loaderReturn>>;

export type PolicyRegistry_Initialized_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<PolicyRegistry_Initialized_event,contractRegistrations>>;

export type PolicyRegistry_Initialized_eventFilter = {};

export type PolicyRegistry_Initialized_eventFilters = Internal_noEventFilters;

export type PolicyRegistry_OwnershipTransferStarted_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type PolicyRegistry_OwnershipTransferStarted_block = Block_t;

export type PolicyRegistry_OwnershipTransferStarted_transaction = Transaction_t;

export type PolicyRegistry_OwnershipTransferStarted_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: PolicyRegistry_OwnershipTransferStarted_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: PolicyRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: PolicyRegistry_OwnershipTransferStarted_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: PolicyRegistry_OwnershipTransferStarted_block
};

export type PolicyRegistry_OwnershipTransferStarted_loaderArgs = Internal_genericLoaderArgs<PolicyRegistry_OwnershipTransferStarted_event,loaderContext>;

export type PolicyRegistry_OwnershipTransferStarted_loader<loaderReturn> = Internal_genericLoader<PolicyRegistry_OwnershipTransferStarted_loaderArgs,loaderReturn>;

export type PolicyRegistry_OwnershipTransferStarted_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<PolicyRegistry_OwnershipTransferStarted_event,handlerContext,loaderReturn>;

export type PolicyRegistry_OwnershipTransferStarted_handler<loaderReturn> = Internal_genericHandler<PolicyRegistry_OwnershipTransferStarted_handlerArgs<loaderReturn>>;

export type PolicyRegistry_OwnershipTransferStarted_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<PolicyRegistry_OwnershipTransferStarted_event,contractRegistrations>>;

export type PolicyRegistry_OwnershipTransferStarted_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type PolicyRegistry_OwnershipTransferStarted_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: PolicyRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type PolicyRegistry_OwnershipTransferStarted_eventFiltersDefinition = 
    PolicyRegistry_OwnershipTransferStarted_eventFilter
  | PolicyRegistry_OwnershipTransferStarted_eventFilter[];

export type PolicyRegistry_OwnershipTransferStarted_eventFilters = 
    PolicyRegistry_OwnershipTransferStarted_eventFilter
  | PolicyRegistry_OwnershipTransferStarted_eventFilter[]
  | ((_1:PolicyRegistry_OwnershipTransferStarted_eventFiltersArgs) => PolicyRegistry_OwnershipTransferStarted_eventFiltersDefinition);

export type PolicyRegistry_OwnershipTransferred_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type PolicyRegistry_OwnershipTransferred_block = Block_t;

export type PolicyRegistry_OwnershipTransferred_transaction = Transaction_t;

export type PolicyRegistry_OwnershipTransferred_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: PolicyRegistry_OwnershipTransferred_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: PolicyRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: PolicyRegistry_OwnershipTransferred_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: PolicyRegistry_OwnershipTransferred_block
};

export type PolicyRegistry_OwnershipTransferred_loaderArgs = Internal_genericLoaderArgs<PolicyRegistry_OwnershipTransferred_event,loaderContext>;

export type PolicyRegistry_OwnershipTransferred_loader<loaderReturn> = Internal_genericLoader<PolicyRegistry_OwnershipTransferred_loaderArgs,loaderReturn>;

export type PolicyRegistry_OwnershipTransferred_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<PolicyRegistry_OwnershipTransferred_event,handlerContext,loaderReturn>;

export type PolicyRegistry_OwnershipTransferred_handler<loaderReturn> = Internal_genericHandler<PolicyRegistry_OwnershipTransferred_handlerArgs<loaderReturn>>;

export type PolicyRegistry_OwnershipTransferred_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<PolicyRegistry_OwnershipTransferred_event,contractRegistrations>>;

export type PolicyRegistry_OwnershipTransferred_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type PolicyRegistry_OwnershipTransferred_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: PolicyRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type PolicyRegistry_OwnershipTransferred_eventFiltersDefinition = 
    PolicyRegistry_OwnershipTransferred_eventFilter
  | PolicyRegistry_OwnershipTransferred_eventFilter[];

export type PolicyRegistry_OwnershipTransferred_eventFilters = 
    PolicyRegistry_OwnershipTransferred_eventFilter
  | PolicyRegistry_OwnershipTransferred_eventFilter[]
  | ((_1:PolicyRegistry_OwnershipTransferred_eventFiltersArgs) => PolicyRegistry_OwnershipTransferred_eventFiltersDefinition);

export type PolicyRegistry_PolicyCreated_eventArgs = {
  readonly _0: bigint; 
  readonly _1: string; 
  readonly _2: string; 
  readonly _3: bigint; 
  readonly _4: bigint; 
  readonly _5: bigint
};

export type PolicyRegistry_PolicyCreated_block = Block_t;

export type PolicyRegistry_PolicyCreated_transaction = Transaction_t;

export type PolicyRegistry_PolicyCreated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: PolicyRegistry_PolicyCreated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: PolicyRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: PolicyRegistry_PolicyCreated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: PolicyRegistry_PolicyCreated_block
};

export type PolicyRegistry_PolicyCreated_loaderArgs = Internal_genericLoaderArgs<PolicyRegistry_PolicyCreated_event,loaderContext>;

export type PolicyRegistry_PolicyCreated_loader<loaderReturn> = Internal_genericLoader<PolicyRegistry_PolicyCreated_loaderArgs,loaderReturn>;

export type PolicyRegistry_PolicyCreated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<PolicyRegistry_PolicyCreated_event,handlerContext,loaderReturn>;

export type PolicyRegistry_PolicyCreated_handler<loaderReturn> = Internal_genericHandler<PolicyRegistry_PolicyCreated_handlerArgs<loaderReturn>>;

export type PolicyRegistry_PolicyCreated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<PolicyRegistry_PolicyCreated_event,contractRegistrations>>;

export type PolicyRegistry_PolicyCreated_eventFilter = { readonly _0?: SingleOrMultiple_t<bigint>; readonly _1?: SingleOrMultiple_t<string> };

export type PolicyRegistry_PolicyCreated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: PolicyRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type PolicyRegistry_PolicyCreated_eventFiltersDefinition = 
    PolicyRegistry_PolicyCreated_eventFilter
  | PolicyRegistry_PolicyCreated_eventFilter[];

export type PolicyRegistry_PolicyCreated_eventFilters = 
    PolicyRegistry_PolicyCreated_eventFilter
  | PolicyRegistry_PolicyCreated_eventFilter[]
  | ((_1:PolicyRegistry_PolicyCreated_eventFiltersArgs) => PolicyRegistry_PolicyCreated_eventFiltersDefinition);

export type PolicyRegistry_PolicyDeprecated_eventArgs = { readonly _0: bigint };

export type PolicyRegistry_PolicyDeprecated_block = Block_t;

export type PolicyRegistry_PolicyDeprecated_transaction = Transaction_t;

export type PolicyRegistry_PolicyDeprecated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: PolicyRegistry_PolicyDeprecated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: PolicyRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: PolicyRegistry_PolicyDeprecated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: PolicyRegistry_PolicyDeprecated_block
};

export type PolicyRegistry_PolicyDeprecated_loaderArgs = Internal_genericLoaderArgs<PolicyRegistry_PolicyDeprecated_event,loaderContext>;

export type PolicyRegistry_PolicyDeprecated_loader<loaderReturn> = Internal_genericLoader<PolicyRegistry_PolicyDeprecated_loaderArgs,loaderReturn>;

export type PolicyRegistry_PolicyDeprecated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<PolicyRegistry_PolicyDeprecated_event,handlerContext,loaderReturn>;

export type PolicyRegistry_PolicyDeprecated_handler<loaderReturn> = Internal_genericHandler<PolicyRegistry_PolicyDeprecated_handlerArgs<loaderReturn>>;

export type PolicyRegistry_PolicyDeprecated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<PolicyRegistry_PolicyDeprecated_event,contractRegistrations>>;

export type PolicyRegistry_PolicyDeprecated_eventFilter = { readonly _0?: SingleOrMultiple_t<bigint> };

export type PolicyRegistry_PolicyDeprecated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: PolicyRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type PolicyRegistry_PolicyDeprecated_eventFiltersDefinition = 
    PolicyRegistry_PolicyDeprecated_eventFilter
  | PolicyRegistry_PolicyDeprecated_eventFilter[];

export type PolicyRegistry_PolicyDeprecated_eventFilters = 
    PolicyRegistry_PolicyDeprecated_eventFilter
  | PolicyRegistry_PolicyDeprecated_eventFilter[]
  | ((_1:PolicyRegistry_PolicyDeprecated_eventFiltersArgs) => PolicyRegistry_PolicyDeprecated_eventFiltersDefinition);

export type PolicyRegistry_PolicyPrivacyConstraintsUpdated_eventArgs = {
  readonly _0: bigint; 
  readonly _1: boolean; 
  readonly _2: boolean; 
  readonly _3: boolean; 
  readonly _4: boolean; 
  readonly _5: boolean; 
  readonly _6: boolean; 
  readonly _7: bigint
};

export type PolicyRegistry_PolicyPrivacyConstraintsUpdated_block = Block_t;

export type PolicyRegistry_PolicyPrivacyConstraintsUpdated_transaction = Transaction_t;

export type PolicyRegistry_PolicyPrivacyConstraintsUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: PolicyRegistry_PolicyPrivacyConstraintsUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: PolicyRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: PolicyRegistry_PolicyPrivacyConstraintsUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: PolicyRegistry_PolicyPrivacyConstraintsUpdated_block
};

export type PolicyRegistry_PolicyPrivacyConstraintsUpdated_loaderArgs = Internal_genericLoaderArgs<PolicyRegistry_PolicyPrivacyConstraintsUpdated_event,loaderContext>;

export type PolicyRegistry_PolicyPrivacyConstraintsUpdated_loader<loaderReturn> = Internal_genericLoader<PolicyRegistry_PolicyPrivacyConstraintsUpdated_loaderArgs,loaderReturn>;

export type PolicyRegistry_PolicyPrivacyConstraintsUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<PolicyRegistry_PolicyPrivacyConstraintsUpdated_event,handlerContext,loaderReturn>;

export type PolicyRegistry_PolicyPrivacyConstraintsUpdated_handler<loaderReturn> = Internal_genericHandler<PolicyRegistry_PolicyPrivacyConstraintsUpdated_handlerArgs<loaderReturn>>;

export type PolicyRegistry_PolicyPrivacyConstraintsUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<PolicyRegistry_PolicyPrivacyConstraintsUpdated_event,contractRegistrations>>;

export type PolicyRegistry_PolicyPrivacyConstraintsUpdated_eventFilter = { readonly _0?: SingleOrMultiple_t<bigint> };

export type PolicyRegistry_PolicyPrivacyConstraintsUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: PolicyRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type PolicyRegistry_PolicyPrivacyConstraintsUpdated_eventFiltersDefinition = 
    PolicyRegistry_PolicyPrivacyConstraintsUpdated_eventFilter
  | PolicyRegistry_PolicyPrivacyConstraintsUpdated_eventFilter[];

export type PolicyRegistry_PolicyPrivacyConstraintsUpdated_eventFilters = 
    PolicyRegistry_PolicyPrivacyConstraintsUpdated_eventFilter
  | PolicyRegistry_PolicyPrivacyConstraintsUpdated_eventFilter[]
  | ((_1:PolicyRegistry_PolicyPrivacyConstraintsUpdated_eventFiltersArgs) => PolicyRegistry_PolicyPrivacyConstraintsUpdated_eventFiltersDefinition);

export type PolicyRegistry_Upgraded_eventArgs = { readonly _0: Address_t };

export type PolicyRegistry_Upgraded_block = Block_t;

export type PolicyRegistry_Upgraded_transaction = Transaction_t;

export type PolicyRegistry_Upgraded_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: PolicyRegistry_Upgraded_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: PolicyRegistry_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: PolicyRegistry_Upgraded_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: PolicyRegistry_Upgraded_block
};

export type PolicyRegistry_Upgraded_loaderArgs = Internal_genericLoaderArgs<PolicyRegistry_Upgraded_event,loaderContext>;

export type PolicyRegistry_Upgraded_loader<loaderReturn> = Internal_genericLoader<PolicyRegistry_Upgraded_loaderArgs,loaderReturn>;

export type PolicyRegistry_Upgraded_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<PolicyRegistry_Upgraded_event,handlerContext,loaderReturn>;

export type PolicyRegistry_Upgraded_handler<loaderReturn> = Internal_genericHandler<PolicyRegistry_Upgraded_handlerArgs<loaderReturn>>;

export type PolicyRegistry_Upgraded_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<PolicyRegistry_Upgraded_event,contractRegistrations>>;

export type PolicyRegistry_Upgraded_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t> };

export type PolicyRegistry_Upgraded_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: PolicyRegistry_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type PolicyRegistry_Upgraded_eventFiltersDefinition = 
    PolicyRegistry_Upgraded_eventFilter
  | PolicyRegistry_Upgraded_eventFilter[];

export type PolicyRegistry_Upgraded_eventFilters = 
    PolicyRegistry_Upgraded_eventFilter
  | PolicyRegistry_Upgraded_eventFilter[]
  | ((_1:PolicyRegistry_Upgraded_eventFiltersArgs) => PolicyRegistry_Upgraded_eventFiltersDefinition);

export type RwaToken1155_chainId = 99999;

export type RwaToken1155_ApprovalForAll_eventArgs = {
  readonly _0: Address_t; 
  readonly _1: Address_t; 
  readonly _2: boolean
};

export type RwaToken1155_ApprovalForAll_block = Block_t;

export type RwaToken1155_ApprovalForAll_transaction = Transaction_t;

export type RwaToken1155_ApprovalForAll_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: RwaToken1155_ApprovalForAll_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: RwaToken1155_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: RwaToken1155_ApprovalForAll_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: RwaToken1155_ApprovalForAll_block
};

export type RwaToken1155_ApprovalForAll_loaderArgs = Internal_genericLoaderArgs<RwaToken1155_ApprovalForAll_event,loaderContext>;

export type RwaToken1155_ApprovalForAll_loader<loaderReturn> = Internal_genericLoader<RwaToken1155_ApprovalForAll_loaderArgs,loaderReturn>;

export type RwaToken1155_ApprovalForAll_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<RwaToken1155_ApprovalForAll_event,handlerContext,loaderReturn>;

export type RwaToken1155_ApprovalForAll_handler<loaderReturn> = Internal_genericHandler<RwaToken1155_ApprovalForAll_handlerArgs<loaderReturn>>;

export type RwaToken1155_ApprovalForAll_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<RwaToken1155_ApprovalForAll_event,contractRegistrations>>;

export type RwaToken1155_ApprovalForAll_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type RwaToken1155_ApprovalForAll_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: RwaToken1155_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type RwaToken1155_ApprovalForAll_eventFiltersDefinition = 
    RwaToken1155_ApprovalForAll_eventFilter
  | RwaToken1155_ApprovalForAll_eventFilter[];

export type RwaToken1155_ApprovalForAll_eventFilters = 
    RwaToken1155_ApprovalForAll_eventFilter
  | RwaToken1155_ApprovalForAll_eventFilter[]
  | ((_1:RwaToken1155_ApprovalForAll_eventFiltersArgs) => RwaToken1155_ApprovalForAll_eventFiltersDefinition);

export type RwaToken1155_ContractURIUpdated_eventArgs = { readonly _0: string; readonly _1: string };

export type RwaToken1155_ContractURIUpdated_block = Block_t;

export type RwaToken1155_ContractURIUpdated_transaction = Transaction_t;

export type RwaToken1155_ContractURIUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: RwaToken1155_ContractURIUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: RwaToken1155_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: RwaToken1155_ContractURIUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: RwaToken1155_ContractURIUpdated_block
};

export type RwaToken1155_ContractURIUpdated_loaderArgs = Internal_genericLoaderArgs<RwaToken1155_ContractURIUpdated_event,loaderContext>;

export type RwaToken1155_ContractURIUpdated_loader<loaderReturn> = Internal_genericLoader<RwaToken1155_ContractURIUpdated_loaderArgs,loaderReturn>;

export type RwaToken1155_ContractURIUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<RwaToken1155_ContractURIUpdated_event,handlerContext,loaderReturn>;

export type RwaToken1155_ContractURIUpdated_handler<loaderReturn> = Internal_genericHandler<RwaToken1155_ContractURIUpdated_handlerArgs<loaderReturn>>;

export type RwaToken1155_ContractURIUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<RwaToken1155_ContractURIUpdated_event,contractRegistrations>>;

export type RwaToken1155_ContractURIUpdated_eventFilter = {};

export type RwaToken1155_ContractURIUpdated_eventFilters = Internal_noEventFilters;

export type RwaToken1155_EngineAddressUpdated_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type RwaToken1155_EngineAddressUpdated_block = Block_t;

export type RwaToken1155_EngineAddressUpdated_transaction = Transaction_t;

export type RwaToken1155_EngineAddressUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: RwaToken1155_EngineAddressUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: RwaToken1155_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: RwaToken1155_EngineAddressUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: RwaToken1155_EngineAddressUpdated_block
};

export type RwaToken1155_EngineAddressUpdated_loaderArgs = Internal_genericLoaderArgs<RwaToken1155_EngineAddressUpdated_event,loaderContext>;

export type RwaToken1155_EngineAddressUpdated_loader<loaderReturn> = Internal_genericLoader<RwaToken1155_EngineAddressUpdated_loaderArgs,loaderReturn>;

export type RwaToken1155_EngineAddressUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<RwaToken1155_EngineAddressUpdated_event,handlerContext,loaderReturn>;

export type RwaToken1155_EngineAddressUpdated_handler<loaderReturn> = Internal_genericHandler<RwaToken1155_EngineAddressUpdated_handlerArgs<loaderReturn>>;

export type RwaToken1155_EngineAddressUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<RwaToken1155_EngineAddressUpdated_event,contractRegistrations>>;

export type RwaToken1155_EngineAddressUpdated_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type RwaToken1155_EngineAddressUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: RwaToken1155_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type RwaToken1155_EngineAddressUpdated_eventFiltersDefinition = 
    RwaToken1155_EngineAddressUpdated_eventFilter
  | RwaToken1155_EngineAddressUpdated_eventFilter[];

export type RwaToken1155_EngineAddressUpdated_eventFilters = 
    RwaToken1155_EngineAddressUpdated_eventFilter
  | RwaToken1155_EngineAddressUpdated_eventFilter[]
  | ((_1:RwaToken1155_EngineAddressUpdated_eventFiltersArgs) => RwaToken1155_EngineAddressUpdated_eventFiltersDefinition);

export type RwaToken1155_Initialized_eventArgs = { readonly _0: bigint };

export type RwaToken1155_Initialized_block = Block_t;

export type RwaToken1155_Initialized_transaction = Transaction_t;

export type RwaToken1155_Initialized_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: RwaToken1155_Initialized_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: RwaToken1155_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: RwaToken1155_Initialized_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: RwaToken1155_Initialized_block
};

export type RwaToken1155_Initialized_loaderArgs = Internal_genericLoaderArgs<RwaToken1155_Initialized_event,loaderContext>;

export type RwaToken1155_Initialized_loader<loaderReturn> = Internal_genericLoader<RwaToken1155_Initialized_loaderArgs,loaderReturn>;

export type RwaToken1155_Initialized_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<RwaToken1155_Initialized_event,handlerContext,loaderReturn>;

export type RwaToken1155_Initialized_handler<loaderReturn> = Internal_genericHandler<RwaToken1155_Initialized_handlerArgs<loaderReturn>>;

export type RwaToken1155_Initialized_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<RwaToken1155_Initialized_event,contractRegistrations>>;

export type RwaToken1155_Initialized_eventFilter = {};

export type RwaToken1155_Initialized_eventFilters = Internal_noEventFilters;

export type RwaToken1155_OwnershipTransferStarted_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type RwaToken1155_OwnershipTransferStarted_block = Block_t;

export type RwaToken1155_OwnershipTransferStarted_transaction = Transaction_t;

export type RwaToken1155_OwnershipTransferStarted_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: RwaToken1155_OwnershipTransferStarted_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: RwaToken1155_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: RwaToken1155_OwnershipTransferStarted_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: RwaToken1155_OwnershipTransferStarted_block
};

export type RwaToken1155_OwnershipTransferStarted_loaderArgs = Internal_genericLoaderArgs<RwaToken1155_OwnershipTransferStarted_event,loaderContext>;

export type RwaToken1155_OwnershipTransferStarted_loader<loaderReturn> = Internal_genericLoader<RwaToken1155_OwnershipTransferStarted_loaderArgs,loaderReturn>;

export type RwaToken1155_OwnershipTransferStarted_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<RwaToken1155_OwnershipTransferStarted_event,handlerContext,loaderReturn>;

export type RwaToken1155_OwnershipTransferStarted_handler<loaderReturn> = Internal_genericHandler<RwaToken1155_OwnershipTransferStarted_handlerArgs<loaderReturn>>;

export type RwaToken1155_OwnershipTransferStarted_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<RwaToken1155_OwnershipTransferStarted_event,contractRegistrations>>;

export type RwaToken1155_OwnershipTransferStarted_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type RwaToken1155_OwnershipTransferStarted_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: RwaToken1155_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type RwaToken1155_OwnershipTransferStarted_eventFiltersDefinition = 
    RwaToken1155_OwnershipTransferStarted_eventFilter
  | RwaToken1155_OwnershipTransferStarted_eventFilter[];

export type RwaToken1155_OwnershipTransferStarted_eventFilters = 
    RwaToken1155_OwnershipTransferStarted_eventFilter
  | RwaToken1155_OwnershipTransferStarted_eventFilter[]
  | ((_1:RwaToken1155_OwnershipTransferStarted_eventFiltersArgs) => RwaToken1155_OwnershipTransferStarted_eventFiltersDefinition);

export type RwaToken1155_OwnershipTransferred_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type RwaToken1155_OwnershipTransferred_block = Block_t;

export type RwaToken1155_OwnershipTransferred_transaction = Transaction_t;

export type RwaToken1155_OwnershipTransferred_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: RwaToken1155_OwnershipTransferred_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: RwaToken1155_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: RwaToken1155_OwnershipTransferred_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: RwaToken1155_OwnershipTransferred_block
};

export type RwaToken1155_OwnershipTransferred_loaderArgs = Internal_genericLoaderArgs<RwaToken1155_OwnershipTransferred_event,loaderContext>;

export type RwaToken1155_OwnershipTransferred_loader<loaderReturn> = Internal_genericLoader<RwaToken1155_OwnershipTransferred_loaderArgs,loaderReturn>;

export type RwaToken1155_OwnershipTransferred_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<RwaToken1155_OwnershipTransferred_event,handlerContext,loaderReturn>;

export type RwaToken1155_OwnershipTransferred_handler<loaderReturn> = Internal_genericHandler<RwaToken1155_OwnershipTransferred_handlerArgs<loaderReturn>>;

export type RwaToken1155_OwnershipTransferred_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<RwaToken1155_OwnershipTransferred_event,contractRegistrations>>;

export type RwaToken1155_OwnershipTransferred_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type RwaToken1155_OwnershipTransferred_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: RwaToken1155_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type RwaToken1155_OwnershipTransferred_eventFiltersDefinition = 
    RwaToken1155_OwnershipTransferred_eventFilter
  | RwaToken1155_OwnershipTransferred_eventFilter[];

export type RwaToken1155_OwnershipTransferred_eventFilters = 
    RwaToken1155_OwnershipTransferred_eventFilter
  | RwaToken1155_OwnershipTransferred_eventFilter[]
  | ((_1:RwaToken1155_OwnershipTransferred_eventFiltersArgs) => RwaToken1155_OwnershipTransferred_eventFiltersDefinition);

export type RwaToken1155_TransferBatch_eventArgs = {
  readonly _0: Address_t; 
  readonly _1: Address_t; 
  readonly _2: Address_t; 
  readonly _3: bigint[]; 
  readonly _4: bigint[]
};

export type RwaToken1155_TransferBatch_block = Block_t;

export type RwaToken1155_TransferBatch_transaction = Transaction_t;

export type RwaToken1155_TransferBatch_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: RwaToken1155_TransferBatch_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: RwaToken1155_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: RwaToken1155_TransferBatch_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: RwaToken1155_TransferBatch_block
};

export type RwaToken1155_TransferBatch_loaderArgs = Internal_genericLoaderArgs<RwaToken1155_TransferBatch_event,loaderContext>;

export type RwaToken1155_TransferBatch_loader<loaderReturn> = Internal_genericLoader<RwaToken1155_TransferBatch_loaderArgs,loaderReturn>;

export type RwaToken1155_TransferBatch_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<RwaToken1155_TransferBatch_event,handlerContext,loaderReturn>;

export type RwaToken1155_TransferBatch_handler<loaderReturn> = Internal_genericHandler<RwaToken1155_TransferBatch_handlerArgs<loaderReturn>>;

export type RwaToken1155_TransferBatch_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<RwaToken1155_TransferBatch_event,contractRegistrations>>;

export type RwaToken1155_TransferBatch_eventFilter = {
  readonly _0?: SingleOrMultiple_t<Address_t>; 
  readonly _1?: SingleOrMultiple_t<Address_t>; 
  readonly _2?: SingleOrMultiple_t<Address_t>
};

export type RwaToken1155_TransferBatch_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: RwaToken1155_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type RwaToken1155_TransferBatch_eventFiltersDefinition = 
    RwaToken1155_TransferBatch_eventFilter
  | RwaToken1155_TransferBatch_eventFilter[];

export type RwaToken1155_TransferBatch_eventFilters = 
    RwaToken1155_TransferBatch_eventFilter
  | RwaToken1155_TransferBatch_eventFilter[]
  | ((_1:RwaToken1155_TransferBatch_eventFiltersArgs) => RwaToken1155_TransferBatch_eventFiltersDefinition);

export type RwaToken1155_TransferSingle_eventArgs = {
  readonly _0: Address_t; 
  readonly _1: Address_t; 
  readonly _2: Address_t; 
  readonly _3: bigint; 
  readonly _4: bigint
};

export type RwaToken1155_TransferSingle_block = Block_t;

export type RwaToken1155_TransferSingle_transaction = Transaction_t;

export type RwaToken1155_TransferSingle_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: RwaToken1155_TransferSingle_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: RwaToken1155_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: RwaToken1155_TransferSingle_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: RwaToken1155_TransferSingle_block
};

export type RwaToken1155_TransferSingle_loaderArgs = Internal_genericLoaderArgs<RwaToken1155_TransferSingle_event,loaderContext>;

export type RwaToken1155_TransferSingle_loader<loaderReturn> = Internal_genericLoader<RwaToken1155_TransferSingle_loaderArgs,loaderReturn>;

export type RwaToken1155_TransferSingle_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<RwaToken1155_TransferSingle_event,handlerContext,loaderReturn>;

export type RwaToken1155_TransferSingle_handler<loaderReturn> = Internal_genericHandler<RwaToken1155_TransferSingle_handlerArgs<loaderReturn>>;

export type RwaToken1155_TransferSingle_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<RwaToken1155_TransferSingle_event,contractRegistrations>>;

export type RwaToken1155_TransferSingle_eventFilter = {
  readonly _0?: SingleOrMultiple_t<Address_t>; 
  readonly _1?: SingleOrMultiple_t<Address_t>; 
  readonly _2?: SingleOrMultiple_t<Address_t>
};

export type RwaToken1155_TransferSingle_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: RwaToken1155_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type RwaToken1155_TransferSingle_eventFiltersDefinition = 
    RwaToken1155_TransferSingle_eventFilter
  | RwaToken1155_TransferSingle_eventFilter[];

export type RwaToken1155_TransferSingle_eventFilters = 
    RwaToken1155_TransferSingle_eventFilter
  | RwaToken1155_TransferSingle_eventFilter[]
  | ((_1:RwaToken1155_TransferSingle_eventFiltersArgs) => RwaToken1155_TransferSingle_eventFiltersDefinition);

export type RwaToken1155_URI_eventArgs = { readonly _0: string; readonly _1: bigint };

export type RwaToken1155_URI_block = Block_t;

export type RwaToken1155_URI_transaction = Transaction_t;

export type RwaToken1155_URI_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: RwaToken1155_URI_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: RwaToken1155_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: RwaToken1155_URI_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: RwaToken1155_URI_block
};

export type RwaToken1155_URI_loaderArgs = Internal_genericLoaderArgs<RwaToken1155_URI_event,loaderContext>;

export type RwaToken1155_URI_loader<loaderReturn> = Internal_genericLoader<RwaToken1155_URI_loaderArgs,loaderReturn>;

export type RwaToken1155_URI_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<RwaToken1155_URI_event,handlerContext,loaderReturn>;

export type RwaToken1155_URI_handler<loaderReturn> = Internal_genericHandler<RwaToken1155_URI_handlerArgs<loaderReturn>>;

export type RwaToken1155_URI_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<RwaToken1155_URI_event,contractRegistrations>>;

export type RwaToken1155_URI_eventFilter = { readonly _1?: SingleOrMultiple_t<bigint> };

export type RwaToken1155_URI_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: RwaToken1155_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type RwaToken1155_URI_eventFiltersDefinition = 
    RwaToken1155_URI_eventFilter
  | RwaToken1155_URI_eventFilter[];

export type RwaToken1155_URI_eventFilters = 
    RwaToken1155_URI_eventFilter
  | RwaToken1155_URI_eventFilter[]
  | ((_1:RwaToken1155_URI_eventFiltersArgs) => RwaToken1155_URI_eventFiltersDefinition);

export type RwaToken1155_Upgraded_eventArgs = { readonly _0: Address_t };

export type RwaToken1155_Upgraded_block = Block_t;

export type RwaToken1155_Upgraded_transaction = Transaction_t;

export type RwaToken1155_Upgraded_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: RwaToken1155_Upgraded_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: RwaToken1155_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: RwaToken1155_Upgraded_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: RwaToken1155_Upgraded_block
};

export type RwaToken1155_Upgraded_loaderArgs = Internal_genericLoaderArgs<RwaToken1155_Upgraded_event,loaderContext>;

export type RwaToken1155_Upgraded_loader<loaderReturn> = Internal_genericLoader<RwaToken1155_Upgraded_loaderArgs,loaderReturn>;

export type RwaToken1155_Upgraded_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<RwaToken1155_Upgraded_event,handlerContext,loaderReturn>;

export type RwaToken1155_Upgraded_handler<loaderReturn> = Internal_genericHandler<RwaToken1155_Upgraded_handlerArgs<loaderReturn>>;

export type RwaToken1155_Upgraded_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<RwaToken1155_Upgraded_event,contractRegistrations>>;

export type RwaToken1155_Upgraded_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t> };

export type RwaToken1155_Upgraded_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: RwaToken1155_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type RwaToken1155_Upgraded_eventFiltersDefinition = 
    RwaToken1155_Upgraded_eventFilter
  | RwaToken1155_Upgraded_eventFilter[];

export type RwaToken1155_Upgraded_eventFilters = 
    RwaToken1155_Upgraded_eventFilter
  | RwaToken1155_Upgraded_eventFilter[]
  | ((_1:RwaToken1155_Upgraded_eventFiltersArgs) => RwaToken1155_Upgraded_eventFiltersDefinition);

export type TokenisationEngine_chainId = 99999;

export type TokenisationEngine_Initialized_eventArgs = { readonly _0: bigint };

export type TokenisationEngine_Initialized_block = Block_t;

export type TokenisationEngine_Initialized_transaction = Transaction_t;

export type TokenisationEngine_Initialized_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TokenisationEngine_Initialized_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TokenisationEngine_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TokenisationEngine_Initialized_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TokenisationEngine_Initialized_block
};

export type TokenisationEngine_Initialized_loaderArgs = Internal_genericLoaderArgs<TokenisationEngine_Initialized_event,loaderContext>;

export type TokenisationEngine_Initialized_loader<loaderReturn> = Internal_genericLoader<TokenisationEngine_Initialized_loaderArgs,loaderReturn>;

export type TokenisationEngine_Initialized_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TokenisationEngine_Initialized_event,handlerContext,loaderReturn>;

export type TokenisationEngine_Initialized_handler<loaderReturn> = Internal_genericHandler<TokenisationEngine_Initialized_handlerArgs<loaderReturn>>;

export type TokenisationEngine_Initialized_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TokenisationEngine_Initialized_event,contractRegistrations>>;

export type TokenisationEngine_Initialized_eventFilter = {};

export type TokenisationEngine_Initialized_eventFilters = Internal_noEventFilters;

export type TokenisationEngine_IssuanceAuditReceipt_eventArgs = {
  readonly _0: bigint; 
  readonly _1: bigint; 
  readonly _2: bigint; 
  readonly _3: string; 
  readonly _4: string; 
  readonly _5: string
};

export type TokenisationEngine_IssuanceAuditReceipt_block = Block_t;

export type TokenisationEngine_IssuanceAuditReceipt_transaction = Transaction_t;

export type TokenisationEngine_IssuanceAuditReceipt_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TokenisationEngine_IssuanceAuditReceipt_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TokenisationEngine_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TokenisationEngine_IssuanceAuditReceipt_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TokenisationEngine_IssuanceAuditReceipt_block
};

export type TokenisationEngine_IssuanceAuditReceipt_loaderArgs = Internal_genericLoaderArgs<TokenisationEngine_IssuanceAuditReceipt_event,loaderContext>;

export type TokenisationEngine_IssuanceAuditReceipt_loader<loaderReturn> = Internal_genericLoader<TokenisationEngine_IssuanceAuditReceipt_loaderArgs,loaderReturn>;

export type TokenisationEngine_IssuanceAuditReceipt_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TokenisationEngine_IssuanceAuditReceipt_event,handlerContext,loaderReturn>;

export type TokenisationEngine_IssuanceAuditReceipt_handler<loaderReturn> = Internal_genericHandler<TokenisationEngine_IssuanceAuditReceipt_handlerArgs<loaderReturn>>;

export type TokenisationEngine_IssuanceAuditReceipt_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TokenisationEngine_IssuanceAuditReceipt_event,contractRegistrations>>;

export type TokenisationEngine_IssuanceAuditReceipt_eventFilter = { readonly _0?: SingleOrMultiple_t<bigint>; readonly _1?: SingleOrMultiple_t<bigint> };

export type TokenisationEngine_IssuanceAuditReceipt_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TokenisationEngine_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TokenisationEngine_IssuanceAuditReceipt_eventFiltersDefinition = 
    TokenisationEngine_IssuanceAuditReceipt_eventFilter
  | TokenisationEngine_IssuanceAuditReceipt_eventFilter[];

export type TokenisationEngine_IssuanceAuditReceipt_eventFilters = 
    TokenisationEngine_IssuanceAuditReceipt_eventFilter
  | TokenisationEngine_IssuanceAuditReceipt_eventFilter[]
  | ((_1:TokenisationEngine_IssuanceAuditReceipt_eventFiltersArgs) => TokenisationEngine_IssuanceAuditReceipt_eventFiltersDefinition);

export type TokenisationEngine_IssuanceExecuted_eventArgs = {
  readonly _0: bigint; 
  readonly _1: bigint; 
  readonly _2: string; 
  readonly _3: string; 
  readonly _4: bigint; 
  readonly _5: Address_t; 
  readonly _6: bigint; 
  readonly _7: bigint; 
  readonly _8: string; 
  readonly _9: string; 
  readonly _10: string
};

export type TokenisationEngine_IssuanceExecuted_block = Block_t;

export type TokenisationEngine_IssuanceExecuted_transaction = Transaction_t;

export type TokenisationEngine_IssuanceExecuted_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TokenisationEngine_IssuanceExecuted_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TokenisationEngine_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TokenisationEngine_IssuanceExecuted_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TokenisationEngine_IssuanceExecuted_block
};

export type TokenisationEngine_IssuanceExecuted_loaderArgs = Internal_genericLoaderArgs<TokenisationEngine_IssuanceExecuted_event,loaderContext>;

export type TokenisationEngine_IssuanceExecuted_loader<loaderReturn> = Internal_genericLoader<TokenisationEngine_IssuanceExecuted_loaderArgs,loaderReturn>;

export type TokenisationEngine_IssuanceExecuted_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TokenisationEngine_IssuanceExecuted_event,handlerContext,loaderReturn>;

export type TokenisationEngine_IssuanceExecuted_handler<loaderReturn> = Internal_genericHandler<TokenisationEngine_IssuanceExecuted_handlerArgs<loaderReturn>>;

export type TokenisationEngine_IssuanceExecuted_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TokenisationEngine_IssuanceExecuted_event,contractRegistrations>>;

export type TokenisationEngine_IssuanceExecuted_eventFilter = {
  readonly _0?: SingleOrMultiple_t<bigint>; 
  readonly _1?: SingleOrMultiple_t<bigint>; 
  readonly _2?: SingleOrMultiple_t<string>
};

export type TokenisationEngine_IssuanceExecuted_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TokenisationEngine_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TokenisationEngine_IssuanceExecuted_eventFiltersDefinition = 
    TokenisationEngine_IssuanceExecuted_eventFilter
  | TokenisationEngine_IssuanceExecuted_eventFilter[];

export type TokenisationEngine_IssuanceExecuted_eventFilters = 
    TokenisationEngine_IssuanceExecuted_eventFilter
  | TokenisationEngine_IssuanceExecuted_eventFilter[]
  | ((_1:TokenisationEngine_IssuanceExecuted_eventFiltersArgs) => TokenisationEngine_IssuanceExecuted_eventFiltersDefinition);

export type TokenisationEngine_IssuanceRegistryUpdated_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type TokenisationEngine_IssuanceRegistryUpdated_block = Block_t;

export type TokenisationEngine_IssuanceRegistryUpdated_transaction = Transaction_t;

export type TokenisationEngine_IssuanceRegistryUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TokenisationEngine_IssuanceRegistryUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TokenisationEngine_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TokenisationEngine_IssuanceRegistryUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TokenisationEngine_IssuanceRegistryUpdated_block
};

export type TokenisationEngine_IssuanceRegistryUpdated_loaderArgs = Internal_genericLoaderArgs<TokenisationEngine_IssuanceRegistryUpdated_event,loaderContext>;

export type TokenisationEngine_IssuanceRegistryUpdated_loader<loaderReturn> = Internal_genericLoader<TokenisationEngine_IssuanceRegistryUpdated_loaderArgs,loaderReturn>;

export type TokenisationEngine_IssuanceRegistryUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TokenisationEngine_IssuanceRegistryUpdated_event,handlerContext,loaderReturn>;

export type TokenisationEngine_IssuanceRegistryUpdated_handler<loaderReturn> = Internal_genericHandler<TokenisationEngine_IssuanceRegistryUpdated_handlerArgs<loaderReturn>>;

export type TokenisationEngine_IssuanceRegistryUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TokenisationEngine_IssuanceRegistryUpdated_event,contractRegistrations>>;

export type TokenisationEngine_IssuanceRegistryUpdated_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type TokenisationEngine_IssuanceRegistryUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TokenisationEngine_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TokenisationEngine_IssuanceRegistryUpdated_eventFiltersDefinition = 
    TokenisationEngine_IssuanceRegistryUpdated_eventFilter
  | TokenisationEngine_IssuanceRegistryUpdated_eventFilter[];

export type TokenisationEngine_IssuanceRegistryUpdated_eventFilters = 
    TokenisationEngine_IssuanceRegistryUpdated_eventFilter
  | TokenisationEngine_IssuanceRegistryUpdated_eventFilter[]
  | ((_1:TokenisationEngine_IssuanceRegistryUpdated_eventFiltersArgs) => TokenisationEngine_IssuanceRegistryUpdated_eventFiltersDefinition);

export type TokenisationEngine_OwnershipTransferStarted_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type TokenisationEngine_OwnershipTransferStarted_block = Block_t;

export type TokenisationEngine_OwnershipTransferStarted_transaction = Transaction_t;

export type TokenisationEngine_OwnershipTransferStarted_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TokenisationEngine_OwnershipTransferStarted_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TokenisationEngine_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TokenisationEngine_OwnershipTransferStarted_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TokenisationEngine_OwnershipTransferStarted_block
};

export type TokenisationEngine_OwnershipTransferStarted_loaderArgs = Internal_genericLoaderArgs<TokenisationEngine_OwnershipTransferStarted_event,loaderContext>;

export type TokenisationEngine_OwnershipTransferStarted_loader<loaderReturn> = Internal_genericLoader<TokenisationEngine_OwnershipTransferStarted_loaderArgs,loaderReturn>;

export type TokenisationEngine_OwnershipTransferStarted_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TokenisationEngine_OwnershipTransferStarted_event,handlerContext,loaderReturn>;

export type TokenisationEngine_OwnershipTransferStarted_handler<loaderReturn> = Internal_genericHandler<TokenisationEngine_OwnershipTransferStarted_handlerArgs<loaderReturn>>;

export type TokenisationEngine_OwnershipTransferStarted_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TokenisationEngine_OwnershipTransferStarted_event,contractRegistrations>>;

export type TokenisationEngine_OwnershipTransferStarted_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type TokenisationEngine_OwnershipTransferStarted_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TokenisationEngine_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TokenisationEngine_OwnershipTransferStarted_eventFiltersDefinition = 
    TokenisationEngine_OwnershipTransferStarted_eventFilter
  | TokenisationEngine_OwnershipTransferStarted_eventFilter[];

export type TokenisationEngine_OwnershipTransferStarted_eventFilters = 
    TokenisationEngine_OwnershipTransferStarted_eventFilter
  | TokenisationEngine_OwnershipTransferStarted_eventFilter[]
  | ((_1:TokenisationEngine_OwnershipTransferStarted_eventFiltersArgs) => TokenisationEngine_OwnershipTransferStarted_eventFiltersDefinition);

export type TokenisationEngine_OwnershipTransferred_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type TokenisationEngine_OwnershipTransferred_block = Block_t;

export type TokenisationEngine_OwnershipTransferred_transaction = Transaction_t;

export type TokenisationEngine_OwnershipTransferred_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TokenisationEngine_OwnershipTransferred_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TokenisationEngine_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TokenisationEngine_OwnershipTransferred_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TokenisationEngine_OwnershipTransferred_block
};

export type TokenisationEngine_OwnershipTransferred_loaderArgs = Internal_genericLoaderArgs<TokenisationEngine_OwnershipTransferred_event,loaderContext>;

export type TokenisationEngine_OwnershipTransferred_loader<loaderReturn> = Internal_genericLoader<TokenisationEngine_OwnershipTransferred_loaderArgs,loaderReturn>;

export type TokenisationEngine_OwnershipTransferred_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TokenisationEngine_OwnershipTransferred_event,handlerContext,loaderReturn>;

export type TokenisationEngine_OwnershipTransferred_handler<loaderReturn> = Internal_genericHandler<TokenisationEngine_OwnershipTransferred_handlerArgs<loaderReturn>>;

export type TokenisationEngine_OwnershipTransferred_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TokenisationEngine_OwnershipTransferred_event,contractRegistrations>>;

export type TokenisationEngine_OwnershipTransferred_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type TokenisationEngine_OwnershipTransferred_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TokenisationEngine_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TokenisationEngine_OwnershipTransferred_eventFiltersDefinition = 
    TokenisationEngine_OwnershipTransferred_eventFilter
  | TokenisationEngine_OwnershipTransferred_eventFilter[];

export type TokenisationEngine_OwnershipTransferred_eventFilters = 
    TokenisationEngine_OwnershipTransferred_eventFilter
  | TokenisationEngine_OwnershipTransferred_eventFilter[]
  | ((_1:TokenisationEngine_OwnershipTransferred_eventFiltersArgs) => TokenisationEngine_OwnershipTransferred_eventFiltersDefinition);

export type TokenisationEngine_PolicyRegistryUpdated_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type TokenisationEngine_PolicyRegistryUpdated_block = Block_t;

export type TokenisationEngine_PolicyRegistryUpdated_transaction = Transaction_t;

export type TokenisationEngine_PolicyRegistryUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TokenisationEngine_PolicyRegistryUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TokenisationEngine_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TokenisationEngine_PolicyRegistryUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TokenisationEngine_PolicyRegistryUpdated_block
};

export type TokenisationEngine_PolicyRegistryUpdated_loaderArgs = Internal_genericLoaderArgs<TokenisationEngine_PolicyRegistryUpdated_event,loaderContext>;

export type TokenisationEngine_PolicyRegistryUpdated_loader<loaderReturn> = Internal_genericLoader<TokenisationEngine_PolicyRegistryUpdated_loaderArgs,loaderReturn>;

export type TokenisationEngine_PolicyRegistryUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TokenisationEngine_PolicyRegistryUpdated_event,handlerContext,loaderReturn>;

export type TokenisationEngine_PolicyRegistryUpdated_handler<loaderReturn> = Internal_genericHandler<TokenisationEngine_PolicyRegistryUpdated_handlerArgs<loaderReturn>>;

export type TokenisationEngine_PolicyRegistryUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TokenisationEngine_PolicyRegistryUpdated_event,contractRegistrations>>;

export type TokenisationEngine_PolicyRegistryUpdated_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type TokenisationEngine_PolicyRegistryUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TokenisationEngine_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TokenisationEngine_PolicyRegistryUpdated_eventFiltersDefinition = 
    TokenisationEngine_PolicyRegistryUpdated_eventFilter
  | TokenisationEngine_PolicyRegistryUpdated_eventFilter[];

export type TokenisationEngine_PolicyRegistryUpdated_eventFilters = 
    TokenisationEngine_PolicyRegistryUpdated_eventFilter
  | TokenisationEngine_PolicyRegistryUpdated_eventFilter[]
  | ((_1:TokenisationEngine_PolicyRegistryUpdated_eventFiltersArgs) => TokenisationEngine_PolicyRegistryUpdated_eventFiltersDefinition);

export type TokenisationEngine_ProgramVerificationKeyUpdated_eventArgs = { readonly _0: string; readonly _1: string };

export type TokenisationEngine_ProgramVerificationKeyUpdated_block = Block_t;

export type TokenisationEngine_ProgramVerificationKeyUpdated_transaction = Transaction_t;

export type TokenisationEngine_ProgramVerificationKeyUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TokenisationEngine_ProgramVerificationKeyUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TokenisationEngine_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TokenisationEngine_ProgramVerificationKeyUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TokenisationEngine_ProgramVerificationKeyUpdated_block
};

export type TokenisationEngine_ProgramVerificationKeyUpdated_loaderArgs = Internal_genericLoaderArgs<TokenisationEngine_ProgramVerificationKeyUpdated_event,loaderContext>;

export type TokenisationEngine_ProgramVerificationKeyUpdated_loader<loaderReturn> = Internal_genericLoader<TokenisationEngine_ProgramVerificationKeyUpdated_loaderArgs,loaderReturn>;

export type TokenisationEngine_ProgramVerificationKeyUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TokenisationEngine_ProgramVerificationKeyUpdated_event,handlerContext,loaderReturn>;

export type TokenisationEngine_ProgramVerificationKeyUpdated_handler<loaderReturn> = Internal_genericHandler<TokenisationEngine_ProgramVerificationKeyUpdated_handlerArgs<loaderReturn>>;

export type TokenisationEngine_ProgramVerificationKeyUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TokenisationEngine_ProgramVerificationKeyUpdated_event,contractRegistrations>>;

export type TokenisationEngine_ProgramVerificationKeyUpdated_eventFilter = { readonly _0?: SingleOrMultiple_t<string>; readonly _1?: SingleOrMultiple_t<string> };

export type TokenisationEngine_ProgramVerificationKeyUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TokenisationEngine_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TokenisationEngine_ProgramVerificationKeyUpdated_eventFiltersDefinition = 
    TokenisationEngine_ProgramVerificationKeyUpdated_eventFilter
  | TokenisationEngine_ProgramVerificationKeyUpdated_eventFilter[];

export type TokenisationEngine_ProgramVerificationKeyUpdated_eventFilters = 
    TokenisationEngine_ProgramVerificationKeyUpdated_eventFilter
  | TokenisationEngine_ProgramVerificationKeyUpdated_eventFilter[]
  | ((_1:TokenisationEngine_ProgramVerificationKeyUpdated_eventFiltersArgs) => TokenisationEngine_ProgramVerificationKeyUpdated_eventFiltersDefinition);

export type TokenisationEngine_RwaTokenUpdated_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type TokenisationEngine_RwaTokenUpdated_block = Block_t;

export type TokenisationEngine_RwaTokenUpdated_transaction = Transaction_t;

export type TokenisationEngine_RwaTokenUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TokenisationEngine_RwaTokenUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TokenisationEngine_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TokenisationEngine_RwaTokenUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TokenisationEngine_RwaTokenUpdated_block
};

export type TokenisationEngine_RwaTokenUpdated_loaderArgs = Internal_genericLoaderArgs<TokenisationEngine_RwaTokenUpdated_event,loaderContext>;

export type TokenisationEngine_RwaTokenUpdated_loader<loaderReturn> = Internal_genericLoader<TokenisationEngine_RwaTokenUpdated_loaderArgs,loaderReturn>;

export type TokenisationEngine_RwaTokenUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TokenisationEngine_RwaTokenUpdated_event,handlerContext,loaderReturn>;

export type TokenisationEngine_RwaTokenUpdated_handler<loaderReturn> = Internal_genericHandler<TokenisationEngine_RwaTokenUpdated_handlerArgs<loaderReturn>>;

export type TokenisationEngine_RwaTokenUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TokenisationEngine_RwaTokenUpdated_event,contractRegistrations>>;

export type TokenisationEngine_RwaTokenUpdated_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type TokenisationEngine_RwaTokenUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TokenisationEngine_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TokenisationEngine_RwaTokenUpdated_eventFiltersDefinition = 
    TokenisationEngine_RwaTokenUpdated_eventFilter
  | TokenisationEngine_RwaTokenUpdated_eventFilter[];

export type TokenisationEngine_RwaTokenUpdated_eventFilters = 
    TokenisationEngine_RwaTokenUpdated_eventFilter
  | TokenisationEngine_RwaTokenUpdated_eventFilter[]
  | ((_1:TokenisationEngine_RwaTokenUpdated_eventFiltersArgs) => TokenisationEngine_RwaTokenUpdated_eventFiltersDefinition);

export type TokenisationEngine_ConfidentialSettlementUpdated_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type TokenisationEngine_ConfidentialSettlementUpdated_block = Block_t;

export type TokenisationEngine_ConfidentialSettlementUpdated_transaction = Transaction_t;

export type TokenisationEngine_ConfidentialSettlementUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TokenisationEngine_ConfidentialSettlementUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TokenisationEngine_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TokenisationEngine_ConfidentialSettlementUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TokenisationEngine_ConfidentialSettlementUpdated_block
};

export type TokenisationEngine_ConfidentialSettlementUpdated_loaderArgs = Internal_genericLoaderArgs<TokenisationEngine_ConfidentialSettlementUpdated_event,loaderContext>;

export type TokenisationEngine_ConfidentialSettlementUpdated_loader<loaderReturn> = Internal_genericLoader<TokenisationEngine_ConfidentialSettlementUpdated_loaderArgs,loaderReturn>;

export type TokenisationEngine_ConfidentialSettlementUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TokenisationEngine_ConfidentialSettlementUpdated_event,handlerContext,loaderReturn>;

export type TokenisationEngine_ConfidentialSettlementUpdated_handler<loaderReturn> = Internal_genericHandler<TokenisationEngine_ConfidentialSettlementUpdated_handlerArgs<loaderReturn>>;

export type TokenisationEngine_ConfidentialSettlementUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TokenisationEngine_ConfidentialSettlementUpdated_event,contractRegistrations>>;

export type TokenisationEngine_ConfidentialSettlementUpdated_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type TokenisationEngine_ConfidentialSettlementUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TokenisationEngine_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TokenisationEngine_ConfidentialSettlementUpdated_eventFiltersDefinition = 
    TokenisationEngine_ConfidentialSettlementUpdated_eventFilter
  | TokenisationEngine_ConfidentialSettlementUpdated_eventFilter[];

export type TokenisationEngine_ConfidentialSettlementUpdated_eventFilters = 
    TokenisationEngine_ConfidentialSettlementUpdated_eventFilter
  | TokenisationEngine_ConfidentialSettlementUpdated_eventFilter[]
  | ((_1:TokenisationEngine_ConfidentialSettlementUpdated_eventFiltersArgs) => TokenisationEngine_ConfidentialSettlementUpdated_eventFiltersDefinition);

export type TokenisationEngine_Sp1VerifierUpdated_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type TokenisationEngine_Sp1VerifierUpdated_block = Block_t;

export type TokenisationEngine_Sp1VerifierUpdated_transaction = Transaction_t;

export type TokenisationEngine_Sp1VerifierUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TokenisationEngine_Sp1VerifierUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TokenisationEngine_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TokenisationEngine_Sp1VerifierUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TokenisationEngine_Sp1VerifierUpdated_block
};

export type TokenisationEngine_Sp1VerifierUpdated_loaderArgs = Internal_genericLoaderArgs<TokenisationEngine_Sp1VerifierUpdated_event,loaderContext>;

export type TokenisationEngine_Sp1VerifierUpdated_loader<loaderReturn> = Internal_genericLoader<TokenisationEngine_Sp1VerifierUpdated_loaderArgs,loaderReturn>;

export type TokenisationEngine_Sp1VerifierUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TokenisationEngine_Sp1VerifierUpdated_event,handlerContext,loaderReturn>;

export type TokenisationEngine_Sp1VerifierUpdated_handler<loaderReturn> = Internal_genericHandler<TokenisationEngine_Sp1VerifierUpdated_handlerArgs<loaderReturn>>;

export type TokenisationEngine_Sp1VerifierUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TokenisationEngine_Sp1VerifierUpdated_event,contractRegistrations>>;

export type TokenisationEngine_Sp1VerifierUpdated_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type TokenisationEngine_Sp1VerifierUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TokenisationEngine_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TokenisationEngine_Sp1VerifierUpdated_eventFiltersDefinition = 
    TokenisationEngine_Sp1VerifierUpdated_eventFilter
  | TokenisationEngine_Sp1VerifierUpdated_eventFilter[];

export type TokenisationEngine_Sp1VerifierUpdated_eventFilters = 
    TokenisationEngine_Sp1VerifierUpdated_eventFilter
  | TokenisationEngine_Sp1VerifierUpdated_eventFilter[]
  | ((_1:TokenisationEngine_Sp1VerifierUpdated_eventFiltersArgs) => TokenisationEngine_Sp1VerifierUpdated_eventFiltersDefinition);

export type TokenisationEngine_UmbraBatchSendUpdated_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type TokenisationEngine_UmbraBatchSendUpdated_block = Block_t;

export type TokenisationEngine_UmbraBatchSendUpdated_transaction = Transaction_t;

export type TokenisationEngine_UmbraBatchSendUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TokenisationEngine_UmbraBatchSendUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TokenisationEngine_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TokenisationEngine_UmbraBatchSendUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TokenisationEngine_UmbraBatchSendUpdated_block
};

export type TokenisationEngine_UmbraBatchSendUpdated_loaderArgs = Internal_genericLoaderArgs<TokenisationEngine_UmbraBatchSendUpdated_event,loaderContext>;

export type TokenisationEngine_UmbraBatchSendUpdated_loader<loaderReturn> = Internal_genericLoader<TokenisationEngine_UmbraBatchSendUpdated_loaderArgs,loaderReturn>;

export type TokenisationEngine_UmbraBatchSendUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TokenisationEngine_UmbraBatchSendUpdated_event,handlerContext,loaderReturn>;

export type TokenisationEngine_UmbraBatchSendUpdated_handler<loaderReturn> = Internal_genericHandler<TokenisationEngine_UmbraBatchSendUpdated_handlerArgs<loaderReturn>>;

export type TokenisationEngine_UmbraBatchSendUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TokenisationEngine_UmbraBatchSendUpdated_event,contractRegistrations>>;

export type TokenisationEngine_UmbraBatchSendUpdated_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type TokenisationEngine_UmbraBatchSendUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TokenisationEngine_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TokenisationEngine_UmbraBatchSendUpdated_eventFiltersDefinition = 
    TokenisationEngine_UmbraBatchSendUpdated_eventFilter
  | TokenisationEngine_UmbraBatchSendUpdated_eventFilter[];

export type TokenisationEngine_UmbraBatchSendUpdated_eventFilters = 
    TokenisationEngine_UmbraBatchSendUpdated_eventFilter
  | TokenisationEngine_UmbraBatchSendUpdated_eventFilter[]
  | ((_1:TokenisationEngine_UmbraBatchSendUpdated_eventFiltersArgs) => TokenisationEngine_UmbraBatchSendUpdated_eventFiltersDefinition);

export type TokenisationEngine_UmbraCoreUpdated_eventArgs = { readonly _0: Address_t; readonly _1: Address_t };

export type TokenisationEngine_UmbraCoreUpdated_block = Block_t;

export type TokenisationEngine_UmbraCoreUpdated_transaction = Transaction_t;

export type TokenisationEngine_UmbraCoreUpdated_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TokenisationEngine_UmbraCoreUpdated_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TokenisationEngine_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TokenisationEngine_UmbraCoreUpdated_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TokenisationEngine_UmbraCoreUpdated_block
};

export type TokenisationEngine_UmbraCoreUpdated_loaderArgs = Internal_genericLoaderArgs<TokenisationEngine_UmbraCoreUpdated_event,loaderContext>;

export type TokenisationEngine_UmbraCoreUpdated_loader<loaderReturn> = Internal_genericLoader<TokenisationEngine_UmbraCoreUpdated_loaderArgs,loaderReturn>;

export type TokenisationEngine_UmbraCoreUpdated_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TokenisationEngine_UmbraCoreUpdated_event,handlerContext,loaderReturn>;

export type TokenisationEngine_UmbraCoreUpdated_handler<loaderReturn> = Internal_genericHandler<TokenisationEngine_UmbraCoreUpdated_handlerArgs<loaderReturn>>;

export type TokenisationEngine_UmbraCoreUpdated_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TokenisationEngine_UmbraCoreUpdated_event,contractRegistrations>>;

export type TokenisationEngine_UmbraCoreUpdated_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t>; readonly _1?: SingleOrMultiple_t<Address_t> };

export type TokenisationEngine_UmbraCoreUpdated_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TokenisationEngine_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TokenisationEngine_UmbraCoreUpdated_eventFiltersDefinition = 
    TokenisationEngine_UmbraCoreUpdated_eventFilter
  | TokenisationEngine_UmbraCoreUpdated_eventFilter[];

export type TokenisationEngine_UmbraCoreUpdated_eventFilters = 
    TokenisationEngine_UmbraCoreUpdated_eventFilter
  | TokenisationEngine_UmbraCoreUpdated_eventFilter[]
  | ((_1:TokenisationEngine_UmbraCoreUpdated_eventFiltersArgs) => TokenisationEngine_UmbraCoreUpdated_eventFiltersDefinition);

export type TokenisationEngine_Upgraded_eventArgs = { readonly _0: Address_t };

export type TokenisationEngine_Upgraded_block = Block_t;

export type TokenisationEngine_Upgraded_transaction = Transaction_t;

export type TokenisationEngine_Upgraded_event = {
  /** The parameters or arguments associated with this event. */
  readonly params: TokenisationEngine_Upgraded_eventArgs; 
  /** The unique identifier of the blockchain network where this event occurred. */
  readonly chainId: TokenisationEngine_chainId; 
  /** The address of the contract that emitted this event. */
  readonly srcAddress: Address_t; 
  /** The index of this event's log within the block. */
  readonly logIndex: number; 
  /** The transaction that triggered this event. Configurable in `config.yaml` via the `field_selection` option. */
  readonly transaction: TokenisationEngine_Upgraded_transaction; 
  /** The block in which this event was recorded. Configurable in `config.yaml` via the `field_selection` option. */
  readonly block: TokenisationEngine_Upgraded_block
};

export type TokenisationEngine_Upgraded_loaderArgs = Internal_genericLoaderArgs<TokenisationEngine_Upgraded_event,loaderContext>;

export type TokenisationEngine_Upgraded_loader<loaderReturn> = Internal_genericLoader<TokenisationEngine_Upgraded_loaderArgs,loaderReturn>;

export type TokenisationEngine_Upgraded_handlerArgs<loaderReturn> = Internal_genericHandlerArgs<TokenisationEngine_Upgraded_event,handlerContext,loaderReturn>;

export type TokenisationEngine_Upgraded_handler<loaderReturn> = Internal_genericHandler<TokenisationEngine_Upgraded_handlerArgs<loaderReturn>>;

export type TokenisationEngine_Upgraded_contractRegister = Internal_genericContractRegister<Internal_genericContractRegisterArgs<TokenisationEngine_Upgraded_event,contractRegistrations>>;

export type TokenisationEngine_Upgraded_eventFilter = { readonly _0?: SingleOrMultiple_t<Address_t> };

export type TokenisationEngine_Upgraded_eventFiltersArgs = { 
/** The unique identifier of the blockchain network where this event occurred. */
readonly chainId: TokenisationEngine_chainId; 
/** Addresses of the contracts indexing the event. */
readonly addresses: Address_t[] };

export type TokenisationEngine_Upgraded_eventFiltersDefinition = 
    TokenisationEngine_Upgraded_eventFilter
  | TokenisationEngine_Upgraded_eventFilter[];

export type TokenisationEngine_Upgraded_eventFilters = 
    TokenisationEngine_Upgraded_eventFilter
  | TokenisationEngine_Upgraded_eventFilter[]
  | ((_1:TokenisationEngine_Upgraded_eventFiltersArgs) => TokenisationEngine_Upgraded_eventFiltersDefinition);

export type chainId = number;

export type chain = 99999;
