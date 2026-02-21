/* TypeScript file generated from TestHelpers_MockDb.res by genType. */

/* eslint-disable */
/* tslint:disable */

const TestHelpers_MockDbJS = require('./TestHelpers_MockDb.res.js');

import type {DynamicContractRegistry_t as InternalTable_DynamicContractRegistry_t} from 'envio/src/db/InternalTable.gen';

import type {IssuanceAuditReceipt_t as Entities_IssuanceAuditReceipt_t} from '../src/db/Entities.gen';

import type {IssuanceExecution_t as Entities_IssuanceExecution_t} from '../src/db/Entities.gen';

import type {IssuanceRequest_t as Entities_IssuanceRequest_t} from '../src/db/Entities.gen';

import type {PaymentParticipant_t as Entities_PaymentParticipant_t} from '../src/db/Entities.gen';

import type {Policy_t as Entities_Policy_t} from '../src/db/Entities.gen';

import type {ProofJob_t as Entities_ProofJob_t} from '../src/db/Entities.gen';

import type {RawEvent_t as Entities_RawEvent_t} from '../src/db/Entities.gen';

import type {RawEvents_t as InternalTable_RawEvents_t} from 'envio/src/db/InternalTable.gen';

import type {SettlementNote_t as Entities_SettlementNote_t} from '../src/db/Entities.gen';

import type {TokenTransfer_t as Entities_TokenTransfer_t} from '../src/db/Entities.gen';

import type {WorkerPrivacyConfiguration_t as Entities_WorkerPrivacyConfiguration_t} from '../src/db/Entities.gen';

import type {eventLog as Types_eventLog} from './Types.gen';

import type {rawEventsKey as InMemoryStore_rawEventsKey} from 'envio/src/InMemoryStore.gen';

/** The mockDb type is simply an InMemoryStore internally. __dbInternal__ holds a reference
to an inMemoryStore and all the the accessor methods point to the reference of that inMemory
store */
export abstract class inMemoryStore { protected opaque!: any }; /* simulate opaque types */

export type t = {
  readonly __dbInternal__: inMemoryStore; 
  readonly entities: entities; 
  readonly rawEvents: storeOperations<InMemoryStore_rawEventsKey,InternalTable_RawEvents_t>; 
  readonly dynamicContractRegistry: entityStoreOperations<InternalTable_DynamicContractRegistry_t>; 
  readonly processEvents: (_1:Types_eventLog<unknown>[]) => Promise<t>
};

export type entities = {
  readonly IssuanceAuditReceipt: entityStoreOperations<Entities_IssuanceAuditReceipt_t>; 
  readonly IssuanceExecution: entityStoreOperations<Entities_IssuanceExecution_t>; 
  readonly IssuanceRequest: entityStoreOperations<Entities_IssuanceRequest_t>; 
  readonly PaymentParticipant: entityStoreOperations<Entities_PaymentParticipant_t>; 
  readonly Policy: entityStoreOperations<Entities_Policy_t>; 
  readonly ProofJob: entityStoreOperations<Entities_ProofJob_t>; 
  readonly RawEvent: entityStoreOperations<Entities_RawEvent_t>; 
  readonly SettlementNote: entityStoreOperations<Entities_SettlementNote_t>; 
  readonly TokenTransfer: entityStoreOperations<Entities_TokenTransfer_t>; 
  readonly WorkerPrivacyConfiguration: entityStoreOperations<Entities_WorkerPrivacyConfiguration_t>
};

export type entityStoreOperations<entity> = storeOperations<string,entity>;

export type storeOperations<entityKey,entity> = {
  readonly getAll: () => entity[]; 
  readonly get: (_1:entityKey) => (undefined | entity); 
  readonly set: (_1:entity) => t; 
  readonly delete: (_1:entityKey) => t
};

/** The constructor function for a mockDb. Call it and then set up the inital state by calling
any of the set functions it provides access to. A mockDb will be passed into a processEvent 
helper. Note, process event helpers will not mutate the mockDb but return a new mockDb with
new state so you can compare states before and after. */
export const createMockDb: () => t = TestHelpers_MockDbJS.createMockDb as any;
