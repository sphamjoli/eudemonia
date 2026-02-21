// This file is to dynamically generate TS types
// which we can't get using GenType
// Use @genType.import to link the types back to ReScript code

import type { Logger, EffectCaller } from "envio";
import type * as Entities from "./db/Entities.gen.ts";

export type LoaderContext = {
  /**
   * Access the logger instance with event as a context. The logs will be displayed in the console and Envio Hosted Service.
   */
  readonly log: Logger;
  /**
   * Call the provided Effect with the given input.
   * Effects are the best for external calls with automatic deduplication, error handling and caching.
   * Define a new Effect using createEffect outside of the handler.
   */
  readonly effect: EffectCaller;
  /**
   * True when the handlers run in preload mode - in parallel for the whole batch.
   * Handlers run twice per batch of events, and the first time is the "preload" run
   * During preload entities aren't set, logs are ignored and exceptions are silently swallowed.
   * Preload mode is the best time to populate data to in-memory cache.
   * After preload the handler will run for the second time in sequential order of events.
   */
  readonly isPreload: boolean;
  /**
   * Per-chain state information accessible in event handlers and block handlers.
   * Each chain ID maps to an object containing chain-specific state:
   * - isReady: true when the chain has completed initial sync and is processing live events,
   *            false during historical synchronization
   */
  readonly chains: {
    [chainId: string]: {
      readonly isReady: boolean;
    };
  };
  readonly IssuanceAuditReceipt: {
    /**
     * Load the entity IssuanceAuditReceipt from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.IssuanceAuditReceipt_t | undefined>,
    /**
     * Load the entity IssuanceAuditReceipt from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.IssuanceAuditReceipt_t>,
    readonly getWhere: Entities.IssuanceAuditReceipt_indexedFieldOperations,
    /**
     * Returns the entity IssuanceAuditReceipt from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.IssuanceAuditReceipt_t) => Promise<Entities.IssuanceAuditReceipt_t>,
    /**
     * Set the entity IssuanceAuditReceipt in the storage.
     */
    readonly set: (entity: Entities.IssuanceAuditReceipt_t) => void,
    /**
     * Delete the entity IssuanceAuditReceipt from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly IssuanceExecution: {
    /**
     * Load the entity IssuanceExecution from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.IssuanceExecution_t | undefined>,
    /**
     * Load the entity IssuanceExecution from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.IssuanceExecution_t>,
    readonly getWhere: Entities.IssuanceExecution_indexedFieldOperations,
    /**
     * Returns the entity IssuanceExecution from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.IssuanceExecution_t) => Promise<Entities.IssuanceExecution_t>,
    /**
     * Set the entity IssuanceExecution in the storage.
     */
    readonly set: (entity: Entities.IssuanceExecution_t) => void,
    /**
     * Delete the entity IssuanceExecution from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly IssuanceRequest: {
    /**
     * Load the entity IssuanceRequest from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.IssuanceRequest_t | undefined>,
    /**
     * Load the entity IssuanceRequest from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.IssuanceRequest_t>,
    readonly getWhere: Entities.IssuanceRequest_indexedFieldOperations,
    /**
     * Returns the entity IssuanceRequest from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.IssuanceRequest_t) => Promise<Entities.IssuanceRequest_t>,
    /**
     * Set the entity IssuanceRequest in the storage.
     */
    readonly set: (entity: Entities.IssuanceRequest_t) => void,
    /**
     * Delete the entity IssuanceRequest from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly PaymentParticipant: {
    /**
     * Load the entity PaymentParticipant from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.PaymentParticipant_t | undefined>,
    /**
     * Load the entity PaymentParticipant from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.PaymentParticipant_t>,
    readonly getWhere: Entities.PaymentParticipant_indexedFieldOperations,
    /**
     * Returns the entity PaymentParticipant from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.PaymentParticipant_t) => Promise<Entities.PaymentParticipant_t>,
    /**
     * Set the entity PaymentParticipant in the storage.
     */
    readonly set: (entity: Entities.PaymentParticipant_t) => void,
    /**
     * Delete the entity PaymentParticipant from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly Policy: {
    /**
     * Load the entity Policy from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.Policy_t | undefined>,
    /**
     * Load the entity Policy from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.Policy_t>,
    readonly getWhere: Entities.Policy_indexedFieldOperations,
    /**
     * Returns the entity Policy from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.Policy_t) => Promise<Entities.Policy_t>,
    /**
     * Set the entity Policy in the storage.
     */
    readonly set: (entity: Entities.Policy_t) => void,
    /**
     * Delete the entity Policy from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly ProofJob: {
    /**
     * Load the entity ProofJob from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.ProofJob_t | undefined>,
    /**
     * Load the entity ProofJob from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.ProofJob_t>,
    readonly getWhere: Entities.ProofJob_indexedFieldOperations,
    /**
     * Returns the entity ProofJob from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.ProofJob_t) => Promise<Entities.ProofJob_t>,
    /**
     * Set the entity ProofJob in the storage.
     */
    readonly set: (entity: Entities.ProofJob_t) => void,
    /**
     * Delete the entity ProofJob from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly RawEvent: {
    /**
     * Load the entity RawEvent from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.RawEvent_t | undefined>,
    /**
     * Load the entity RawEvent from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.RawEvent_t>,
    readonly getWhere: Entities.RawEvent_indexedFieldOperations,
    /**
     * Returns the entity RawEvent from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.RawEvent_t) => Promise<Entities.RawEvent_t>,
    /**
     * Set the entity RawEvent in the storage.
     */
    readonly set: (entity: Entities.RawEvent_t) => void,
    /**
     * Delete the entity RawEvent from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly SettlementNote: {
    /**
     * Load the entity SettlementNote from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.SettlementNote_t | undefined>,
    /**
     * Load the entity SettlementNote from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.SettlementNote_t>,
    readonly getWhere: Entities.SettlementNote_indexedFieldOperations,
    /**
     * Returns the entity SettlementNote from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.SettlementNote_t) => Promise<Entities.SettlementNote_t>,
    /**
     * Set the entity SettlementNote in the storage.
     */
    readonly set: (entity: Entities.SettlementNote_t) => void,
    /**
     * Delete the entity SettlementNote from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly TokenTransfer: {
    /**
     * Load the entity TokenTransfer from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.TokenTransfer_t | undefined>,
    /**
     * Load the entity TokenTransfer from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.TokenTransfer_t>,
    readonly getWhere: Entities.TokenTransfer_indexedFieldOperations,
    /**
     * Returns the entity TokenTransfer from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.TokenTransfer_t) => Promise<Entities.TokenTransfer_t>,
    /**
     * Set the entity TokenTransfer in the storage.
     */
    readonly set: (entity: Entities.TokenTransfer_t) => void,
    /**
     * Delete the entity TokenTransfer from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly WorkerPrivacyConfiguration: {
    /**
     * Load the entity WorkerPrivacyConfiguration from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.WorkerPrivacyConfiguration_t | undefined>,
    /**
     * Load the entity WorkerPrivacyConfiguration from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.WorkerPrivacyConfiguration_t>,
    readonly getWhere: Entities.WorkerPrivacyConfiguration_indexedFieldOperations,
    /**
     * Returns the entity WorkerPrivacyConfiguration from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.WorkerPrivacyConfiguration_t) => Promise<Entities.WorkerPrivacyConfiguration_t>,
    /**
     * Set the entity WorkerPrivacyConfiguration in the storage.
     */
    readonly set: (entity: Entities.WorkerPrivacyConfiguration_t) => void,
    /**
     * Delete the entity WorkerPrivacyConfiguration from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
};

export type HandlerContext = {
  /**
   * Access the logger instance with event as a context. The logs will be displayed in the console and Envio Hosted Service.
   */
  readonly log: Logger;
  /**
   * Call the provided Effect with the given input.
   * Effects are the best for external calls with automatic deduplication, error handling and caching.
   * Define a new Effect using createEffect outside of the handler.
   */
  readonly effect: EffectCaller;
  /**
   * Per-chain state information accessible in event handlers and block handlers.
   * Each chain ID maps to an object containing chain-specific state:
   * - isReady: true when the chain has completed initial sync and is processing live events,
   *            false during historical synchronization
   */
  readonly chains: {
    [chainId: string]: {
      readonly isReady: boolean;
    };
  };
  readonly IssuanceAuditReceipt: {
    /**
     * Load the entity IssuanceAuditReceipt from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.IssuanceAuditReceipt_t | undefined>,
    /**
     * Load the entity IssuanceAuditReceipt from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.IssuanceAuditReceipt_t>,
    /**
     * Returns the entity IssuanceAuditReceipt from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.IssuanceAuditReceipt_t) => Promise<Entities.IssuanceAuditReceipt_t>,
    /**
     * Set the entity IssuanceAuditReceipt in the storage.
     */
    readonly set: (entity: Entities.IssuanceAuditReceipt_t) => void,
    /**
     * Delete the entity IssuanceAuditReceipt from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly IssuanceExecution: {
    /**
     * Load the entity IssuanceExecution from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.IssuanceExecution_t | undefined>,
    /**
     * Load the entity IssuanceExecution from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.IssuanceExecution_t>,
    /**
     * Returns the entity IssuanceExecution from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.IssuanceExecution_t) => Promise<Entities.IssuanceExecution_t>,
    /**
     * Set the entity IssuanceExecution in the storage.
     */
    readonly set: (entity: Entities.IssuanceExecution_t) => void,
    /**
     * Delete the entity IssuanceExecution from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly IssuanceRequest: {
    /**
     * Load the entity IssuanceRequest from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.IssuanceRequest_t | undefined>,
    /**
     * Load the entity IssuanceRequest from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.IssuanceRequest_t>,
    /**
     * Returns the entity IssuanceRequest from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.IssuanceRequest_t) => Promise<Entities.IssuanceRequest_t>,
    /**
     * Set the entity IssuanceRequest in the storage.
     */
    readonly set: (entity: Entities.IssuanceRequest_t) => void,
    /**
     * Delete the entity IssuanceRequest from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly PaymentParticipant: {
    /**
     * Load the entity PaymentParticipant from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.PaymentParticipant_t | undefined>,
    /**
     * Load the entity PaymentParticipant from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.PaymentParticipant_t>,
    /**
     * Returns the entity PaymentParticipant from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.PaymentParticipant_t) => Promise<Entities.PaymentParticipant_t>,
    /**
     * Set the entity PaymentParticipant in the storage.
     */
    readonly set: (entity: Entities.PaymentParticipant_t) => void,
    /**
     * Delete the entity PaymentParticipant from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly Policy: {
    /**
     * Load the entity Policy from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.Policy_t | undefined>,
    /**
     * Load the entity Policy from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.Policy_t>,
    /**
     * Returns the entity Policy from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.Policy_t) => Promise<Entities.Policy_t>,
    /**
     * Set the entity Policy in the storage.
     */
    readonly set: (entity: Entities.Policy_t) => void,
    /**
     * Delete the entity Policy from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly ProofJob: {
    /**
     * Load the entity ProofJob from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.ProofJob_t | undefined>,
    /**
     * Load the entity ProofJob from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.ProofJob_t>,
    /**
     * Returns the entity ProofJob from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.ProofJob_t) => Promise<Entities.ProofJob_t>,
    /**
     * Set the entity ProofJob in the storage.
     */
    readonly set: (entity: Entities.ProofJob_t) => void,
    /**
     * Delete the entity ProofJob from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly RawEvent: {
    /**
     * Load the entity RawEvent from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.RawEvent_t | undefined>,
    /**
     * Load the entity RawEvent from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.RawEvent_t>,
    /**
     * Returns the entity RawEvent from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.RawEvent_t) => Promise<Entities.RawEvent_t>,
    /**
     * Set the entity RawEvent in the storage.
     */
    readonly set: (entity: Entities.RawEvent_t) => void,
    /**
     * Delete the entity RawEvent from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly SettlementNote: {
    /**
     * Load the entity SettlementNote from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.SettlementNote_t | undefined>,
    /**
     * Load the entity SettlementNote from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.SettlementNote_t>,
    /**
     * Returns the entity SettlementNote from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.SettlementNote_t) => Promise<Entities.SettlementNote_t>,
    /**
     * Set the entity SettlementNote in the storage.
     */
    readonly set: (entity: Entities.SettlementNote_t) => void,
    /**
     * Delete the entity SettlementNote from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly TokenTransfer: {
    /**
     * Load the entity TokenTransfer from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.TokenTransfer_t | undefined>,
    /**
     * Load the entity TokenTransfer from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.TokenTransfer_t>,
    /**
     * Returns the entity TokenTransfer from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.TokenTransfer_t) => Promise<Entities.TokenTransfer_t>,
    /**
     * Set the entity TokenTransfer in the storage.
     */
    readonly set: (entity: Entities.TokenTransfer_t) => void,
    /**
     * Delete the entity TokenTransfer from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
  readonly WorkerPrivacyConfiguration: {
    /**
     * Load the entity WorkerPrivacyConfiguration from the storage by ID.
     * If the entity is not found, returns undefined.
     */
    readonly get: (id: string) => Promise<Entities.WorkerPrivacyConfiguration_t | undefined>,
    /**
     * Load the entity WorkerPrivacyConfiguration from the storage by ID.
     * If the entity is not found, throws an error.
     */
    readonly getOrThrow: (id: string, message?: string) => Promise<Entities.WorkerPrivacyConfiguration_t>,
    /**
     * Returns the entity WorkerPrivacyConfiguration from the storage by ID.
     * If the entity is not found, creates it using provided parameters and returns it.
     */
    readonly getOrCreate: (entity: Entities.WorkerPrivacyConfiguration_t) => Promise<Entities.WorkerPrivacyConfiguration_t>,
    /**
     * Set the entity WorkerPrivacyConfiguration in the storage.
     */
    readonly set: (entity: Entities.WorkerPrivacyConfiguration_t) => void,
    /**
     * Delete the entity WorkerPrivacyConfiguration from the storage.
     *
     * The 'deleteUnsafe' method is experimental and unsafe. You should manually handle all entity references after deletion to maintain database consistency.
     */
    readonly deleteUnsafe: (id: string) => void,
  }
};
