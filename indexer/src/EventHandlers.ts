// @ts-nocheck
import {
  PaymentRegistry,
  IssuanceRegistry,
  PolicyRegistry,
  TokenisationEngine,
  RwaToken1155,
  ConfidentialSettlement,
} from '../generated';

type EventWithMeta = {
  chainId?: bigint | number | string;
  srcAddress?: string;
  block: { number: bigint | number | string; timestamp: bigint | number | string };
  transaction?: { hash?: string };
  logIndex: bigint | number | string;
  topics?: string[];
  params: Record<string, unknown>;
};

const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

function toBigInt(value: bigint | number | string | undefined): bigint {
  if (value === undefined) return 0n;
  if (typeof value === 'bigint') return value;
  return BigInt(value);
}

function getParam<T = unknown>(params: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (params[key] !== undefined) {
      return params[key] as T;
    }
  }

  return undefined;
}

function asAddress(value: unknown): string {
  return String(value ?? ZERO_ADDRESS).toLowerCase();
}

function stringifyPayload(payload: unknown): string {
  return JSON.stringify(payload, (_key, value) =>
    typeof value === 'bigint' ? value.toString() : value,
  );
}

function toPrivacyMode(
  value: unknown,
): 'NONE' | 'DESTINATION_PRIVATE' | 'AMOUNT_PRIVATE' | 'FULL_PRIVATE' {
  const numeric = toBigInt(value as bigint | number | string);
  if (numeric === 1n) return 'DESTINATION_PRIVATE';
  if (numeric === 2n) return 'AMOUNT_PRIVATE';
  if (numeric === 3n) return 'FULL_PRIVATE';
  return 'NONE';
}

function eventTxHash(event: EventWithMeta): string {
  const hash = event.transaction?.hash;
  return (hash ?? ZERO_BYTES32).toLowerCase();
}

function eventId(event: EventWithMeta): string {
  const txHash = eventTxHash(event);
  const logIndex = toBigInt(event.logIndex).toString();
  if (txHash !== ZERO_BYTES32) {
    return `${txHash}-${logIndex}`;
  }

  const blockNumber = toBigInt(event.block.number).toString();
  const contractAddress = (event.srcAddress ?? ZERO_ADDRESS).toLowerCase();
  const topic0 = (event.topics?.[0] ?? ZERO_BYTES32).toLowerCase();
  return `${blockNumber}-${logIndex}-${contractAddress}-${topic0}`;
}

async function appendRawEvent(
  context: any,
  contractName: string,
  eventName: string,
  event: EventWithMeta,
): Promise<void> {
  const topics = event.topics ?? [];
  await context.RawEvent.set({
    id: eventId(event),
    contractName,
    contractAddress: (event.srcAddress ?? ZERO_ADDRESS).toLowerCase(),
    eventName,
    txHash: eventTxHash(event),
    blockNumber: toBigInt(event.block.number),
    blockTimestamp: toBigInt(event.block.timestamp),
    logIndex: toBigInt(event.logIndex),
    topic0: topics[0] ?? null,
    topic1: topics[1] ?? null,
    topic2: topics[2] ?? null,
    topic3: topics[3] ?? null,
    payloadJson: stringifyPayload(event.params),
  });
}

async function upsertProofJob(
  context: any,
  requestIdentifier: bigint,
  updates: Partial<Record<string, unknown>>,
): Promise<void> {
  const id = requestIdentifier.toString();
  const ts = (updates.updatedAt as bigint | undefined) ?? 0n;
  const existing = await context.ProofJob.get(id);

  if (!existing) {
    await context.ProofJob.set({
      id,
      requestIdentifier,
      policyIdentifier: 0n,
      status: 'PENDING',
      attemptCount: 0,
      nextAttemptAt: ts,
      createdAt: ts,
      updatedAt: ts,
      lastError: undefined,
      lockOwner: undefined,
      lockedAt: undefined,
      lastTxHash: undefined,
      ...updates,
    });
    return;
  }

  const normalizedExisting = {
    ...existing,
    lastError: existing.lastError ?? undefined,
    lockOwner: existing.lockOwner ?? undefined,
    lockedAt: existing.lockedAt ?? undefined,
    lastTxHash: existing.lastTxHash ?? undefined,
  };
  await context.ProofJob.set({
    ...normalizedExisting,
    ...updates,
  });
}

async function upsertPaymentParticipant(
  context: any,
  participant: string,
  updates: Partial<Record<string, unknown>>,
): Promise<void> {
  const id = participant.toLowerCase();
  const existing = await context.PaymentParticipant.get(id);
  const ts = (updates.updatedAt as bigint | undefined) ?? 0n;

  if (!existing) {
    await context.PaymentParticipant.set({
      id,
      participant: id,
      roleMask: 0n,
      active: false,
      profileHash: ZERO_BYTES32,
      createdAt: ts,
      updatedAt: ts,
      updatedBlockNumber: 0n,
      updatedTxHash: ZERO_BYTES32,
      ...updates,
    });
    return;
  }

  await context.PaymentParticipant.set({
    ...existing,
    ...updates,
  });
}

PaymentRegistry.ParticipantRoleUpdated.handler(async ({ event, context }) => {
  const participant = asAddress(getParam(event.params, 'participant', '_0'));
  const ts = toBigInt(getParam(event.params, 'updatedAt', '_4') as bigint | number | string);

  await upsertPaymentParticipant(context, participant, {
    roleMask: toBigInt(getParam(event.params, 'roleMask', '_3') as bigint | number | string),
    updatedAt: ts,
    updatedBlockNumber: toBigInt(event.block.number),
    updatedTxHash: eventTxHash(event),
  });

  await appendRawEvent(context, 'PaymentRegistry', 'ParticipantRoleUpdated', event);
});

PaymentRegistry.ParticipantStatusUpdated.handler(async ({ event, context }) => {
  const participant = asAddress(getParam(event.params, 'participant', '_0'));
  const ts = toBigInt(getParam(event.params, 'updatedAt', '_2') as bigint | number | string);

  await upsertPaymentParticipant(context, participant, {
    active: Boolean(getParam(event.params, 'active', '_1')),
    updatedAt: ts,
    updatedBlockNumber: toBigInt(event.block.number),
    updatedTxHash: eventTxHash(event),
  });

  await appendRawEvent(context, 'PaymentRegistry', 'ParticipantStatusUpdated', event);
});

PaymentRegistry.ParticipantProfileUpdated.handler(async ({ event, context }) => {
  const participant = asAddress(getParam(event.params, 'participant', '_0'));
  const ts = toBigInt(getParam(event.params, 'updatedAt', '_2') as bigint | number | string);

  await upsertPaymentParticipant(context, participant, {
    profileHash: String(getParam(event.params, 'profileHash', '_1') ?? ZERO_BYTES32),
    updatedAt: ts,
    updatedBlockNumber: toBigInt(event.block.number),
    updatedTxHash: eventTxHash(event),
  });

  await appendRawEvent(context, 'PaymentRegistry', 'ParticipantProfileUpdated', event);
});

IssuanceRegistry.IssuanceRequestCreated.handler(async ({ event, context }) => {
  const requestIdentifier = toBigInt(
    getParam(event.params, 'requestIdentifier', '_0') as bigint | number | string,
  );
  const id = requestIdentifier.toString();
  const ts = toBigInt(event.block.timestamp);
  const blockNumber = toBigInt(event.block.number);
  const txHash = eventTxHash(event);

  await context.IssuanceRequest.set({
    id,
    requestIdentifier,
    parametersHash: String(getParam(event.params, 'parametersHash', '_1') ?? ZERO_BYTES32),
    issuer: asAddress(getParam(event.params, 'issuer', '_2')),
    subject: asAddress(getParam(event.params, 'subject', '_3')),
    beneficiary: asAddress(getParam(event.params, 'beneficiary', '_5')),
    assetIdentifier: toBigInt(
      getParam(event.params, 'assetIdentifier', '_6') as bigint | number | string,
    ),
    amount: toBigInt(getParam(event.params, 'amount', '_7') as bigint | number | string),
    amountCommitment: String(getParam(event.params, 'amountCommitment', '_8') ?? ZERO_BYTES32),
    destinationCommitment: String(
      getParam(event.params, 'destinationCommitment', '_9') ?? ZERO_BYTES32,
    ),
    payloadHash: String(getParam(event.params, 'payloadHash', '_10') ?? ZERO_BYTES32),
    expiryTimestamp: toBigInt(
      getParam(event.params, 'expiryTimestamp', '_11') as bigint | number | string,
    ),
    documentationHash: String(getParam(event.params, 'documentationHash', '_12') ?? ZERO_BYTES32),
    privacyMode: toPrivacyMode(getParam(event.params, 'privacyMode', '_4')),
    privacyContextHash: ZERO_BYTES32,
    status: 'REQUESTED',
    createdAt: ts,
    updatedAt: ts,
    createdBlockNumber: blockNumber,
    updatedBlockNumber: blockNumber,
    createdTxHash: txHash,
    updatedTxHash: txHash,
  });

  await upsertProofJob(context, requestIdentifier, {
    status: 'PENDING',
    nextAttemptAt: ts,
    updatedAt: ts,
  });

  await appendRawEvent(context, 'IssuanceRegistry', 'IssuanceRequestCreated', event);
});

IssuanceRegistry.IssuanceRequestPrivacyBound.handler(async ({ event, context }) => {
  const requestIdentifier = toBigInt(
    getParam(event.params, 'requestIdentifier', '_0') as bigint | number | string,
  );
  const id = requestIdentifier.toString();
  const ts = toBigInt(event.block.timestamp);
  const blockNumber = toBigInt(event.block.number);
  const txHash = eventTxHash(event);
  const existing = await context.IssuanceRequest.get(id);

  if (existing) {
    await context.IssuanceRequest.set({
      ...existing,
      privacyMode: toPrivacyMode(getParam(event.params, 'privacyMode', '_1')),
      privacyContextHash: String(
        getParam(event.params, 'privacyContextHash', '_2') ?? ZERO_BYTES32,
      ),
      updatedAt: ts,
      updatedBlockNumber: blockNumber,
      updatedTxHash: txHash,
    });
  }

  await appendRawEvent(context, 'IssuanceRegistry', 'IssuanceRequestPrivacyBound', event);
});

IssuanceRegistry.WorkerPrivacyConfigurationUpdated.handler(async ({ event, context }) => {
  const worker = asAddress(getParam(event.params, 'worker', '_0'));
  const ts = toBigInt(event.block.timestamp);

  await context.WorkerPrivacyConfiguration.set({
    id: worker,
    worker,
    mode: toPrivacyMode(getParam(event.params, 'mode', '_1')),
    spendingPublicKey: String(getParam(event.params, 'spendingPublicKey', '_2') ?? ZERO_BYTES32),
    viewingPublicKey: String(getParam(event.params, 'viewingPublicKey', '_3') ?? ZERO_BYTES32),
    metadataHash: String(getParam(event.params, 'metadataHash', '_4') ?? ZERO_BYTES32),
    schemaVersion: Number(getParam(event.params, 'schemaVersion', '_5') ?? 1),
    updatedAt: ts,
    updatedBlockNumber: toBigInt(event.block.number),
    updatedTxHash: eventTxHash(event),
  });

  await appendRawEvent(context, 'IssuanceRegistry', 'WorkerPrivacyConfigurationUpdated', event);
});

IssuanceRegistry.IssuanceRequestCancelled.handler(async ({ event, context }) => {
  const requestIdentifier = toBigInt(
    getParam(event.params, 'requestIdentifier', '_0') as bigint | number | string,
  );
  const id = requestIdentifier.toString();
  const ts = toBigInt(event.block.timestamp);
  const blockNumber = toBigInt(event.block.number);
  const txHash = eventTxHash(event);

  const existing = await context.IssuanceRequest.get(id);
  if (existing) {
    await context.IssuanceRequest.set({
      ...existing,
      status: 'CANCELLED',
      updatedAt: ts,
      updatedBlockNumber: blockNumber,
      updatedTxHash: txHash,
    });
  }

  await upsertProofJob(context, requestIdentifier, {
    status: 'DEAD_LETTER',
    lastError: 'Request cancelled onchain',
    updatedAt: ts,
    nextAttemptAt: ts,
  });

  await appendRawEvent(context, 'IssuanceRegistry', 'IssuanceRequestCancelled', event);
});

IssuanceRegistry.IssuanceRequestConsumed.handler(async ({ event, context }) => {
  const requestIdentifier = toBigInt(
    getParam(event.params, 'requestIdentifier', '_0') as bigint | number | string,
  );
  const id = requestIdentifier.toString();
  const ts = toBigInt(event.block.timestamp);
  const blockNumber = toBigInt(event.block.number);
  const txHash = eventTxHash(event);

  const existing = await context.IssuanceRequest.get(id);
  if (existing) {
    await context.IssuanceRequest.set({
      ...existing,
      status: 'CONSUMED',
      updatedAt: ts,
      updatedBlockNumber: blockNumber,
      updatedTxHash: txHash,
    });
  }

  await upsertProofJob(context, requestIdentifier, {
    status: 'COMPLETED',
    updatedAt: ts,
    nextAttemptAt: ts,
  });

  await appendRawEvent(context, 'IssuanceRegistry', 'IssuanceRequestConsumed', event);
});

PolicyRegistry.PolicyCreated.handler(async ({ event, context }) => {
  const policyIdentifier = toBigInt(
    getParam(event.params, 'policyIdentifier', '_0') as bigint | number | string,
  );
  const id = policyIdentifier.toString();
  const ts = toBigInt(event.block.timestamp);
  const blockNumber = toBigInt(event.block.number);
  const txHash = eventTxHash(event);

  const existing = await context.Policy.get(id);
  await context.Policy.set({
    ...(existing ?? {}),
    id,
    policyIdentifier,
    policyHash: String(getParam(event.params, 'policyHash', '_1') ?? ZERO_BYTES32),
    attestorSetRoot: String(getParam(event.params, 'attestorSetRoot', '_2') ?? ZERO_BYTES32),
    attestorThreshold: toBigInt(
      getParam(event.params, 'attestorThreshold', '_3') as bigint | number | string,
    ),
    validFromTimestamp: toBigInt(
      getParam(event.params, 'validFromTimestamp', '_4') as bigint | number | string,
    ),
    validUntilTimestamp: toBigInt(
      getParam(event.params, 'validUntilTimestamp', '_5') as bigint | number | string,
    ),
    allowNone: existing?.allowNone ?? true,
    allowDestinationPrivate: existing?.allowDestinationPrivate ?? false,
    allowAmountPrivate: existing?.allowAmountPrivate ?? false,
    allowFullPrivate: existing?.allowFullPrivate ?? false,
    allowPerIssuanceOverride: existing?.allowPerIssuanceOverride ?? true,
    allowConfigurationUpdates: existing?.allowConfigurationUpdates ?? true,
    privacySchemaVersion: existing?.privacySchemaVersion ?? 1,
    status: 'ACTIVE',
    isActive: existing?.isActive ?? false,
    createdAt: existing?.createdAt ?? ts,
    updatedAt: ts,
    createdBlockNumber: existing?.createdBlockNumber ?? blockNumber,
    updatedBlockNumber: blockNumber,
    createdTxHash: existing?.createdTxHash ?? txHash,
    updatedTxHash: txHash,
  });

  await appendRawEvent(context, 'PolicyRegistry', 'PolicyCreated', event);
});

PolicyRegistry.PolicyPrivacyConstraintsUpdated.handler(async ({ event, context }) => {
  const policyIdentifier = toBigInt(
    getParam(event.params, 'policyIdentifier', '_0') as bigint | number | string,
  );
  const id = policyIdentifier.toString();
  const existing = await context.Policy.get(id);
  const ts = toBigInt(event.block.timestamp);
  const blockNumber = toBigInt(event.block.number);
  const txHash = eventTxHash(event);

  if (existing) {
    await context.Policy.set({
      ...existing,
      allowNone: Boolean(getParam(event.params, 'allowNone', '_1')),
      allowDestinationPrivate: Boolean(getParam(event.params, 'allowDestinationPrivate', '_2')),
      allowAmountPrivate: Boolean(getParam(event.params, 'allowAmountPrivate', '_3')),
      allowFullPrivate: Boolean(getParam(event.params, 'allowFullPrivate', '_4')),
      allowPerIssuanceOverride: Boolean(getParam(event.params, 'allowPerIssuanceOverride', '_5')),
      allowConfigurationUpdates: Boolean(getParam(event.params, 'allowConfigurationUpdates', '_6')),
      privacySchemaVersion: Number(getParam(event.params, 'schemaVersion', '_7') ?? 1),
      updatedAt: ts,
      updatedBlockNumber: blockNumber,
      updatedTxHash: txHash,
    });
  }

  await appendRawEvent(context, 'PolicyRegistry', 'PolicyPrivacyConstraintsUpdated', event);
});

PolicyRegistry.PolicyDeprecated.handler(async ({ event, context }) => {
  const policyIdentifier = toBigInt(
    getParam(event.params, 'policyIdentifier', '_0') as bigint | number | string,
  );
  const id = policyIdentifier.toString();
  const ts = toBigInt(event.block.timestamp);
  const blockNumber = toBigInt(event.block.number);
  const txHash = eventTxHash(event);
  const existing = await context.Policy.get(id);

  if (existing) {
    await context.Policy.set({
      ...existing,
      status: 'DEPRECATED',
      isActive: false,
      updatedAt: ts,
      updatedBlockNumber: blockNumber,
      updatedTxHash: txHash,
    });
  }

  await appendRawEvent(context, 'PolicyRegistry', 'PolicyDeprecated', event);
});

PolicyRegistry.ActivePolicyIdentifierUpdated.handler(async ({ event, context }) => {
  const previousPolicyIdentifier = toBigInt(
    getParam(event.params, 'previousPolicyIdentifier', '_0') as bigint | number | string,
  );
  const newPolicyIdentifier = toBigInt(
    getParam(event.params, 'newPolicyIdentifier', '_1') as bigint | number | string,
  );
  const ts = toBigInt(event.block.timestamp);
  const blockNumber = toBigInt(event.block.number);
  const txHash = eventTxHash(event);

  if (previousPolicyIdentifier !== 0n) {
    const previous = await context.Policy.get(previousPolicyIdentifier.toString());
    if (previous) {
      await context.Policy.set({
        ...previous,
        isActive: false,
        updatedAt: ts,
        updatedBlockNumber: blockNumber,
        updatedTxHash: txHash,
      });
    }
  }

  if (newPolicyIdentifier !== 0n) {
    const current = await context.Policy.get(newPolicyIdentifier.toString());
    if (current) {
      await context.Policy.set({
        ...current,
        isActive: true,
        status: 'ACTIVE',
        updatedAt: ts,
        updatedBlockNumber: blockNumber,
        updatedTxHash: txHash,
      });
    }
  }

  await appendRawEvent(context, 'PolicyRegistry', 'ActivePolicyIdentifierUpdated', event);
});

TokenisationEngine.IssuanceExecuted.handler(async ({ event, context }) => {
  const requestIdentifier = toBigInt(
    getParam(event.params, 'requestIdentifier', '_0') as bigint | number | string,
  );
  const policyIdentifier = toBigInt(
    getParam(event.params, 'policyIdentifier', '_1') as bigint | number | string,
  );
  const id = `${requestIdentifier.toString()}-${policyIdentifier.toString()}-${eventId(event)}`;
  const ts = toBigInt(event.block.timestamp);

  await context.IssuanceExecution.set({
    id,
    requestIdentifier,
    policyIdentifier,
    parametersHash: String(getParam(event.params, 'parametersHash', '_2') ?? ZERO_BYTES32),
    policyHash: String(getParam(event.params, 'policyHash', '_3') ?? ZERO_BYTES32),
    privacyMode: toPrivacyMode(getParam(event.params, 'privacyMode', '_4')),
    beneficiary: asAddress(getParam(event.params, 'beneficiary', '_5')),
    assetIdentifier: toBigInt(
      getParam(event.params, 'assetIdentifier', '_6') as bigint | number | string,
    ),
    amount: toBigInt(getParam(event.params, 'amount', '_7') as bigint | number | string),
    amountCommitment: String(getParam(event.params, 'amountCommitment', '_8') ?? ZERO_BYTES32),
    destinationCommitment: String(
      getParam(event.params, 'destinationCommitment', '_9') ?? ZERO_BYTES32,
    ),
    payloadHash: String(getParam(event.params, 'payloadHash', '_10') ?? ZERO_BYTES32),
    txHash: eventTxHash(event),
    blockNumber: toBigInt(event.block.number),
    blockTimestamp: ts,
  });

  const request = await context.IssuanceRequest.get(requestIdentifier.toString());
  if (request) {
    await context.IssuanceRequest.set({
      ...request,
      status: 'CONSUMED',
      updatedAt: ts,
      updatedBlockNumber: toBigInt(event.block.number),
      updatedTxHash: eventTxHash(event),
    });
  }

  await upsertProofJob(context, requestIdentifier, {
    policyIdentifier,
    status: 'COMPLETED',
    updatedAt: ts,
    nextAttemptAt: ts,
    lastTxHash: eventTxHash(event),
  });

  await appendRawEvent(context, 'TokenisationEngine', 'IssuanceExecuted', event);
});

TokenisationEngine.IssuanceAuditReceipt.handler(async ({ event, context }) => {
  const requestIdentifier = toBigInt(
    getParam(event.params, 'requestIdentifier', '_0') as bigint | number | string,
  );
  const policyIdentifier = toBigInt(
    getParam(event.params, 'policyIdentifier', '_1') as bigint | number | string,
  );
  const id = `${requestIdentifier.toString()}-${policyIdentifier.toString()}-${eventId(event)}`;

  await context.IssuanceAuditReceipt.set({
    id,
    requestIdentifier,
    policyIdentifier,
    privacyMode: toPrivacyMode(getParam(event.params, 'privacyMode', '_2')),
    privacyContextHash: String(getParam(event.params, 'privacyContextHash', '_3') ?? ZERO_BYTES32),
    parametersHash: String(getParam(event.params, 'parametersHash', '_4') ?? ZERO_BYTES32),
    policyHash: String(getParam(event.params, 'policyHash', '_5') ?? ZERO_BYTES32),
    txHash: eventTxHash(event),
    blockNumber: toBigInt(event.block.number),
    blockTimestamp: toBigInt(event.block.timestamp),
  });

  await appendRawEvent(context, 'TokenisationEngine', 'IssuanceAuditReceipt', event);
});

RwaToken1155.TransferSingle.handler(async ({ event, context }) => {
  const tokenId = toBigInt(getParam(event.params, 'id', '_3') as bigint | number | string);
  const id = `${eventId(event)}-single-${tokenId.toString()}`;
  await context.TokenTransfer.set({
    id,
    txHash: eventTxHash(event),
    blockNumber: toBigInt(event.block.number),
    blockTimestamp: toBigInt(event.block.timestamp),
    tokenIdentifier: tokenId,
    operator: asAddress(getParam(event.params, 'operator', '_0')),
    from: asAddress(getParam(event.params, 'from', '_1')),
    to: asAddress(getParam(event.params, 'to', '_2')),
    amount: toBigInt(getParam(event.params, 'value', '_4') as bigint | number | string),
  });

  await appendRawEvent(context, 'RwaToken1155', 'TransferSingle', event);
});

RwaToken1155.TransferBatch.handler(async ({ event, context }) => {
  const ids: Array<bigint | string | number> =
    (getParam(event.params, 'ids', '_3') as Array<bigint | string | number>) ?? [];
  const values: Array<bigint | string | number> =
    (getParam(event.params, 'values', '_4') as Array<bigint | string | number>) ?? [];

  for (let i = 0; i < ids.length; i += 1) {
    const tokenIdentifier = toBigInt(ids[i]);
    const amount = toBigInt(values[i] ?? 0n);
    await context.TokenTransfer.set({
      id: `${eventId(event)}-batch-${i.toString()}`,
      txHash: eventTxHash(event),
      blockNumber: toBigInt(event.block.number),
      blockTimestamp: toBigInt(event.block.timestamp),
      tokenIdentifier,
      operator: asAddress(getParam(event.params, 'operator', '_0')),
      from: asAddress(getParam(event.params, 'from', '_1')),
      to: asAddress(getParam(event.params, 'to', '_2')),
      amount,
    });
  }

  await appendRawEvent(context, 'RwaToken1155', 'TransferBatch', event);
});

ConfidentialSettlement.NoteCommitted.handler(async ({ event, context }) => {
  const noteIdentifier = toBigInt(
    getParam(event.params, 'noteIdentifier', '_0') as bigint | number | string,
  );
  await context.SettlementNote.set({
    id: noteIdentifier.toString(),
    noteIdentifier,
    requestIdentifier: toBigInt(
      getParam(event.params, 'requestIdentifier', '_1') as bigint | number | string,
    ),
    policyIdentifier: toBigInt(
      getParam(event.params, 'policyIdentifier', '_2') as bigint | number | string,
    ),
    privacyMode: toPrivacyMode(getParam(event.params, 'privacyMode', '_3')),
    beneficiary: asAddress(getParam(event.params, 'beneficiary', '_4')),
    amount: toBigInt(getParam(event.params, 'amount', '_5') as bigint | number | string),
    amountCommitment: String(getParam(event.params, 'amountCommitment', '_6') ?? ZERO_BYTES32),
    destinationCommitment: String(
      getParam(event.params, 'destinationCommitment', '_7') ?? ZERO_BYTES32,
    ),
    payloadHash: String(getParam(event.params, 'payloadHash', '_8') ?? ZERO_BYTES32),
    txHash: eventTxHash(event),
    blockNumber: toBigInt(event.block.number),
    blockTimestamp: toBigInt(event.block.timestamp),
  });

  await appendRawEvent(context, 'ConfidentialSettlement', 'NoteCommitted', event);
});

function registerRawOnly(
  contractName: string,
  eventName: string,
  binding: { handler: (h: any) => void },
): void {
  binding.handler(async ({ event, context }: { event: EventWithMeta; context: any }) => {
    await appendRawEvent(context, contractName, eventName, event);
  });
}

registerRawOnly('IssuanceRegistry', 'EngineAddressUpdated', IssuanceRegistry.EngineAddressUpdated);
registerRawOnly('IssuanceRegistry', 'Initialized', IssuanceRegistry.Initialized);
registerRawOnly(
  'IssuanceRegistry',
  'PaymentRegistryUpdated',
  IssuanceRegistry.PaymentRegistryUpdated,
);
registerRawOnly(
  'IssuanceRegistry',
  'OwnershipTransferStarted',
  IssuanceRegistry.OwnershipTransferStarted,
);
registerRawOnly('IssuanceRegistry', 'OwnershipTransferred', IssuanceRegistry.OwnershipTransferred);
registerRawOnly('IssuanceRegistry', 'Upgraded', IssuanceRegistry.Upgraded);

registerRawOnly('PolicyRegistry', 'Initialized', PolicyRegistry.Initialized);
registerRawOnly(
  'PolicyRegistry',
  'OwnershipTransferStarted',
  PolicyRegistry.OwnershipTransferStarted,
);
registerRawOnly('PolicyRegistry', 'OwnershipTransferred', PolicyRegistry.OwnershipTransferred);
registerRawOnly('PolicyRegistry', 'Upgraded', PolicyRegistry.Upgraded);

registerRawOnly('TokenisationEngine', 'Initialized', TokenisationEngine.Initialized);
registerRawOnly(
  'TokenisationEngine',
  'IssuanceRegistryUpdated',
  TokenisationEngine.IssuanceRegistryUpdated,
);
registerRawOnly(
  'TokenisationEngine',
  'OwnershipTransferStarted',
  TokenisationEngine.OwnershipTransferStarted,
);
registerRawOnly(
  'TokenisationEngine',
  'OwnershipTransferred',
  TokenisationEngine.OwnershipTransferred,
);
registerRawOnly(
  'TokenisationEngine',
  'PolicyRegistryUpdated',
  TokenisationEngine.PolicyRegistryUpdated,
);
registerRawOnly(
  'TokenisationEngine',
  'ProgramVerificationKeyUpdated',
  TokenisationEngine.ProgramVerificationKeyUpdated,
);
registerRawOnly('TokenisationEngine', 'RwaTokenUpdated', TokenisationEngine.RwaTokenUpdated);
registerRawOnly(
  'TokenisationEngine',
  'ConfidentialSettlementUpdated',
  TokenisationEngine.ConfidentialSettlementUpdated,
);
registerRawOnly('TokenisationEngine', 'Sp1VerifierUpdated', TokenisationEngine.Sp1VerifierUpdated);
registerRawOnly('TokenisationEngine', 'UmbraCoreUpdated', TokenisationEngine.UmbraCoreUpdated);
registerRawOnly(
  'TokenisationEngine',
  'UmbraBatchSendUpdated',
  TokenisationEngine.UmbraBatchSendUpdated,
);
registerRawOnly('TokenisationEngine', 'Upgraded', TokenisationEngine.Upgraded);

registerRawOnly('RwaToken1155', 'ApprovalForAll', RwaToken1155.ApprovalForAll);
registerRawOnly('RwaToken1155', 'ContractURIUpdated', RwaToken1155.ContractURIUpdated);
registerRawOnly('RwaToken1155', 'EngineAddressUpdated', RwaToken1155.EngineAddressUpdated);
registerRawOnly('RwaToken1155', 'Initialized', RwaToken1155.Initialized);
registerRawOnly('RwaToken1155', 'OwnershipTransferStarted', RwaToken1155.OwnershipTransferStarted);
registerRawOnly('RwaToken1155', 'OwnershipTransferred', RwaToken1155.OwnershipTransferred);
registerRawOnly('RwaToken1155', 'URI', RwaToken1155.URI);
registerRawOnly('RwaToken1155', 'Upgraded', RwaToken1155.Upgraded);

registerRawOnly(
  'ConfidentialSettlement',
  'EngineAddressUpdated',
  ConfidentialSettlement.EngineAddressUpdated,
);
registerRawOnly('ConfidentialSettlement', 'Initialized', ConfidentialSettlement.Initialized);
registerRawOnly('ConfidentialSettlement', 'NoteClaimed', ConfidentialSettlement.NoteClaimed);
registerRawOnly(
  'ConfidentialSettlement',
  'OwnershipTransferStarted',
  ConfidentialSettlement.OwnershipTransferStarted,
);
registerRawOnly(
  'ConfidentialSettlement',
  'OwnershipTransferred',
  ConfidentialSettlement.OwnershipTransferred,
);
registerRawOnly('ConfidentialSettlement', 'Upgraded', ConfidentialSettlement.Upgraded);

registerRawOnly('PaymentRegistry', 'Initialized', PaymentRegistry.Initialized);
registerRawOnly(
  'PaymentRegistry',
  'OwnershipTransferStarted',
  PaymentRegistry.OwnershipTransferStarted,
);
registerRawOnly('PaymentRegistry', 'OwnershipTransferred', PaymentRegistry.OwnershipTransferred);
registerRawOnly('PaymentRegistry', 'Upgraded', PaymentRegistry.Upgraded);
