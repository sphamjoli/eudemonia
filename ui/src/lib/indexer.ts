import { appConfig } from './config';

/** Indexed issuance request row from Envio/Hasura. */
export interface IndexedIssuanceRequest {
  id: string;
  requestIdentifier: string;
  parametersHash: string;
  issuer: string;
  subject: string;
  beneficiary: string;
  assetIdentifier: string;
  amount: string;
  amountCommitment: string;
  destinationCommitment: string;
  payloadHash: string;
  expiryTimestamp: string;
  documentationHash: string;
  privacyMode: 'NONE' | 'DESTINATION_PRIVATE' | 'AMOUNT_PRIVATE' | 'FULL_PRIVATE';
  privacyContextHash: string;
  status: 'NONE' | 'REQUESTED' | 'CONSUMED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  createdBlockNumber: string;
  updatedBlockNumber: string;
  createdTxHash: string;
  updatedTxHash: string;
}

/** Indexed policy row from Envio/Hasura. */
export interface IndexedPolicy {
  id: string;
  policyIdentifier: string;
  policyHash: string;
  attestorSetRoot: string;
  attestorThreshold: string;
  validFromTimestamp: string;
  validUntilTimestamp: string;
  allowNone: boolean;
  allowDestinationPrivate: boolean;
  allowAmountPrivate: boolean;
  allowFullPrivate: boolean;
  allowPerIssuanceOverride: boolean;
  allowConfigurationUpdates: boolean;
  privacySchemaVersion: number;
  status: 'NONE' | 'ACTIVE' | 'DEPRECATED';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Indexed issuance execution row from engine events. */
export interface IndexedIssuanceExecution {
  id: string;
  requestIdentifier: string;
  policyIdentifier: string;
  parametersHash: string;
  policyHash: string;
  privacyMode: 'NONE' | 'DESTINATION_PRIVATE' | 'AMOUNT_PRIVATE' | 'FULL_PRIVATE';
  beneficiary: string;
  assetIdentifier: string;
  amount: string;
  amountCommitment: string;
  destinationCommitment: string;
  payloadHash: string;
  txHash: string;
  blockNumber: string;
  blockTimestamp: string;
}

/** Indexed audit receipt row from engine events. */
export interface IndexedIssuanceReceipt {
  id: string;
  requestIdentifier: string;
  policyIdentifier: string;
  privacyMode: 'NONE' | 'DESTINATION_PRIVATE' | 'AMOUNT_PRIVATE' | 'FULL_PRIVATE';
  privacyContextHash: string;
  parametersHash: string;
  policyHash: string;
  txHash: string;
  blockNumber: string;
  blockTimestamp: string;
}

/** Indexed settlement note row from confidential settlement events. */
export interface IndexedSettlementNote {
  id: string;
  noteIdentifier: string;
  requestIdentifier: string;
  policyIdentifier: string;
  privacyMode: 'NONE' | 'DESTINATION_PRIVATE' | 'AMOUNT_PRIVATE' | 'FULL_PRIVATE';
  beneficiary: string;
  amount: string;
  amountCommitment: string;
  destinationCommitment: string;
  payloadHash: string;
  txHash: string;
  blockNumber: string;
  blockTimestamp: string;
}

/** Indexed proof-job row used by issuer/operator monitoring. */
export interface IndexedProofJob {
  id: string;
  requestIdentifier: string;
  policyIdentifier: string;
  status: 'PENDING' | 'RUNNING' | 'RETRY' | 'COMPLETED' | 'DEAD_LETTER';
  attemptCount: number;
  nextAttemptAt: string;
  lastError?: string | null;
  lastTxHash?: string | null;
  updatedAt: string;
}

/** Indexed payment participant state sourced from PaymentRegistry events. */
export interface IndexedPaymentParticipant {
  id: string;
  participant: string;
  roleMask: string;
  active: boolean;
  profileHash: string;
  createdAt: string;
  updatedAt: string;
  updatedBlockNumber: string;
  updatedTxHash: string;
}

/** Generic append-only event row for replay/audit view. */
export interface IndexedRawEvent {
  id: string;
  contractName: string;
  contractAddress: string;
  eventName: string;
  txHash: string;
  blockNumber: string;
  blockTimestamp: string;
  logIndex: string;
  payloadJson: string;
}

/** Combined audit query payload for the audit role dashboard. */
export interface AuditBundle {
  requests: IndexedIssuanceRequest[];
  executions: IndexedIssuanceExecution[];
  receipts: IndexedIssuanceReceipt[];
  settlements: IndexedSettlementNote[];
  proofJobs: IndexedProofJob[];
  rawEvents: IndexedRawEvent[];
}

/** Internal GraphQL response envelope. */
interface GraphqlResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

/** Executes a GraphQL query against the indexer endpoint. */
async function queryIndexer<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (appConfig.hasuraAdminSecret) {
    headers['x-hasura-admin-secret'] = appConfig.hasuraAdminSecret;
  }

  const response = await fetch(appConfig.indexerGraphqlUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(
      `Indexer request failed (${response.status} ${response.statusText})`,
    );
  }

  const payload = (await response.json()) as GraphqlResponse<T>;
  if (payload.errors && payload.errors.length > 0) {
    throw new Error(payload.errors.map((error) => error.message).join('; '));
  }

  if (!payload.data) {
    throw new Error('Indexer response missing data');
  }

  return payload.data;
}

/** Verifies indexer endpoint reachability. */
export async function pingIndexer(): Promise<boolean> {
  try {
    await queryIndexer<{ __typename: string }>('{ __typename }');
    return true;
  } catch {
    return false;
  }
}

/** Fetches indexed issuance requests ordered by most recently updated. */
export async function fetchIssuanceRequests(
  limit = 50,
): Promise<IndexedIssuanceRequest[]> {
  const query = `
    query IssuanceRequests($limit: Int!) {
      requests: IssuanceRequest(order_by: [{ updatedAt: desc }], limit: $limit) {
        id
        requestIdentifier
        parametersHash
        issuer
        subject
        beneficiary
        assetIdentifier
        amount
        amountCommitment
        destinationCommitment
        payloadHash
        expiryTimestamp
        documentationHash
        privacyMode
        privacyContextHash
        status
        createdAt
        updatedAt
        createdBlockNumber
        updatedBlockNumber
        createdTxHash
        updatedTxHash
      }
    }
  `;
  const data = await queryIndexer<{ requests: IndexedIssuanceRequest[] }>(query, {
    limit,
  });
  return data.requests ?? [];
}

/** Fetches indexed policies ordered by most recently updated. */
export async function fetchPolicies(limit = 20): Promise<IndexedPolicy[]> {
  const query = `
    query Policies($limit: Int!) {
      policies: Policy(order_by: [{ updatedAt: desc }], limit: $limit) {
        id
        policyIdentifier
        policyHash
        attestorSetRoot
        attestorThreshold
        validFromTimestamp
        validUntilTimestamp
        allowNone
        allowDestinationPrivate
        allowAmountPrivate
        allowFullPrivate
        allowPerIssuanceOverride
        allowConfigurationUpdates
        privacySchemaVersion
        status
        isActive
        createdAt
        updatedAt
      }
    }
  `;
  const data = await queryIndexer<{ policies: IndexedPolicy[] }>(query, { limit });
  return data.policies ?? [];
}

/** Fetches currently active policy row if available. */
export async function fetchActivePolicy(): Promise<IndexedPolicy | null> {
  const query = `
    query ActivePolicy {
      policies: Policy(where: { isActive: { _eq: true } }, limit: 1) {
        id
        policyIdentifier
        policyHash
        attestorSetRoot
        attestorThreshold
        validFromTimestamp
        validUntilTimestamp
        allowNone
        allowDestinationPrivate
        allowAmountPrivate
        allowFullPrivate
        allowPerIssuanceOverride
        allowConfigurationUpdates
        privacySchemaVersion
        status
        isActive
        createdAt
        updatedAt
      }
    }
  `;
  const data = await queryIndexer<{ policies: IndexedPolicy[] }>(query);
  return data.policies?.[0] ?? null;
}

/** Fetches proof job rows for operational monitoring. */
export async function fetchProofJobs(limit = 50): Promise<IndexedProofJob[]> {
  const query = `
    query ProofJobs($limit: Int!) {
      proofJobs: ProofJob(order_by: [{ updatedAt: desc }], limit: $limit) {
        id
        requestIdentifier
        policyIdentifier
        status
        attemptCount
        nextAttemptAt
        lastError
        lastTxHash
        updatedAt
      }
    }
  `;
  const data = await queryIndexer<{ proofJobs: IndexedProofJob[] }>(query, { limit });
  return data.proofJobs ?? [];
}

/** Fetches payment participants for admin user-management surfaces. */
export async function fetchPaymentParticipants(
  limit = 200,
): Promise<IndexedPaymentParticipant[]> {
  const query = `
    query PaymentParticipants($limit: Int!) {
      participants: PaymentParticipant(order_by: [{ updatedAt: desc }], limit: $limit) {
        id
        participant
        roleMask
        active
        profileHash
        createdAt
        updatedAt
        updatedBlockNumber
        updatedTxHash
      }
    }
  `;
  const data = await queryIndexer<{ participants: IndexedPaymentParticipant[] }>(
    query,
    { limit },
  );
  return data.participants ?? [];
}

/** Fetches full audit bundle spanning requests, executions, receipts, and raw events. */
export async function fetchAuditBundle(limit = 120): Promise<AuditBundle> {
  const query = `
    query AuditBundle($limit: Int!) {
      requests: IssuanceRequest(order_by: [{ updatedAt: desc }], limit: $limit) {
        id
        requestIdentifier
        parametersHash
        issuer
        subject
        beneficiary
        assetIdentifier
        amount
        amountCommitment
        destinationCommitment
        payloadHash
        expiryTimestamp
        documentationHash
        privacyMode
        privacyContextHash
        status
        createdAt
        updatedAt
        createdBlockNumber
        updatedBlockNumber
        createdTxHash
        updatedTxHash
      }
      executions: IssuanceExecution(order_by: [{ blockNumber: desc }], limit: $limit) {
        id
        requestIdentifier
        policyIdentifier
        parametersHash
        policyHash
        privacyMode
        beneficiary
        assetIdentifier
        amount
        amountCommitment
        destinationCommitment
        payloadHash
        txHash
        blockNumber
        blockTimestamp
      }
      receipts: IssuanceAuditReceipt(order_by: [{ blockNumber: desc }], limit: $limit) {
        id
        requestIdentifier
        policyIdentifier
        privacyMode
        privacyContextHash
        parametersHash
        policyHash
        txHash
        blockNumber
        blockTimestamp
      }
      settlements: SettlementNote(order_by: [{ blockNumber: desc }], limit: $limit) {
        id
        noteIdentifier
        requestIdentifier
        policyIdentifier
        privacyMode
        beneficiary
        amount
        amountCommitment
        destinationCommitment
        payloadHash
        txHash
        blockNumber
        blockTimestamp
      }
      proofJobs: ProofJob(order_by: [{ updatedAt: desc }], limit: $limit) {
        id
        requestIdentifier
        policyIdentifier
        status
        attemptCount
        nextAttemptAt
        lastError
        lastTxHash
        updatedAt
      }
      rawEvents: RawEvent(order_by: [{ blockNumber: desc }, { logIndex: desc }], limit: $limit) {
        id
        contractName
        contractAddress
        eventName
        txHash
        blockNumber
        blockTimestamp
        logIndex
        payloadJson
      }
    }
  `;

  const data = await queryIndexer<AuditBundle>(query, { limit });
  return {
    requests: data.requests ?? [],
    executions: data.executions ?? [],
    receipts: data.receipts ?? [],
    settlements: data.settlements ?? [],
    proofJobs: data.proofJobs ?? [],
    rawEvents: data.rawEvents ?? [],
  };
}
