import type { IndexedIssuanceRequest, IndexedPolicy, IndexedProofJob } from './types.js';

/** Generic GraphQL response envelope. */
interface GraphQlResponse<T> {
  /** Successful response payload. */
  data?: T;
  /** GraphQL-level errors returned by the API. */
  errors?: Array<{ message: string }>;
}

function isSchemaBootstrappingError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("field 'proofjob' not found in type: 'query_root'") ||
    lower.includes('field "proofjob" not found in type: "query_root"') ||
    lower.includes('no_queries_available') ||
    lower.includes("field 'query_root' not found") ||
    lower.includes('field "query_root" not found') ||
    lower.includes('indexer graphql request failed (500')
  );
}

/**
 * Executes a GraphQL request against the Envio API.
 *
 * @param endpoint GraphQL endpoint URL.
 * @param query GraphQL document.
 * @param variables Query variables object.
 * @returns Typed `data` payload from the GraphQL response.
 * @throws Error when HTTP or GraphQL execution fails.
 */
async function postGraphql<T>(
  endpoint: string,
  query: string,
  variables: Record<string, unknown>,
  adminSecret?: string,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (adminSecret) headers['x-hasura-admin-secret'] = adminSecret;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Indexer GraphQL request failed (${response.status} ${response.statusText})`);
  }

  const payload = (await response.json()) as GraphQlResponse<T>;
  if (payload.errors && payload.errors.length > 0) {
    throw new Error(
      `Indexer GraphQL errors: ${payload.errors.map((error) => error.message).join('; ')}`,
    );
  }

  if (!payload.data) {
    throw new Error('Indexer GraphQL response missing data');
  }

  return payload.data;
}

/**
 * Read-only client for worker queries against indexed state.
 */
export class IndexerClient {
  /**
   * @param endpoint GraphQL endpoint exposed by Envio.
   */
  constructor(
    private readonly endpoint: string,
    private readonly adminSecret?: string,
  ) {}

  /**
   * Fetches due proof jobs in `PENDING` or `RETRY` status.
   *
   * @param limit Maximum number of jobs to fetch.
   * @param now Current timestamp as bigint for due filtering.
   * @returns Sorted list of due jobs.
   */
  async fetchPendingProofJobs(limit: number, now: bigint): Promise<IndexedProofJob[]> {
    const query = `
      query PendingProofJobs($limit: Int!, $now: numeric!) {
        proofJobs: ProofJob(
          where: { status: { _in: [PENDING, RETRY] }, nextAttemptAt: { _lte: $now } }
          order_by: [{ requestIdentifier: desc }]
          limit: $limit
        ) {
          id
          requestIdentifier
          policyIdentifier
          status
          attemptCount
          nextAttemptAt
          updatedAt
        }
      }
    `;
    try {
      const data = await postGraphql<{ proofJobs: IndexedProofJob[] }>(
        this.endpoint,
        query,
        {
          limit,
          now: now.toString(),
        },
        this.adminSecret,
      );
      return data.proofJobs ?? [];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (isSchemaBootstrappingError(message)) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Fetches one indexed issuance request by id.
   *
   * @param requestIdentifier Request identifier as string.
   * @returns Matching request row or `null` when absent.
   */
  async fetchIssuanceRequest(requestIdentifier: string): Promise<IndexedIssuanceRequest | null> {
    const query = `
      query IssuanceRequestByIdentifier($requestIdentifier: numeric!) {
        issuanceRequests: IssuanceRequest(
          where: { requestIdentifier: { _eq: $requestIdentifier } }
          limit: 1
        ) {
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
        }
      }
    `;

    const data = await postGraphql<{ issuanceRequests: IndexedIssuanceRequest[] }>(
      this.endpoint,
      query,
      { requestIdentifier },
      this.adminSecret,
    );
    return data.issuanceRequests?.[0] ?? null;
  }

  /**
   * Fetches the currently active policy row.
   *
   * @returns Active policy or `null` when none is active.
   */
  async fetchActivePolicy(): Promise<IndexedPolicy | null> {
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
        }
      }
    `;
    const data = await postGraphql<{ policies: IndexedPolicy[] }>(
      this.endpoint,
      query,
      {},
      this.adminSecret,
    );
    return data.policies?.[0] ?? null;
  }

  /**
   * Fetches a policy by identifier.
   *
   * @param policyIdentifier Policy identifier represented as string.
   * @returns Matching policy row or `null` when absent.
   */
  async fetchPolicyById(policyIdentifier: string): Promise<IndexedPolicy | null> {
    const query = `
      query PolicyById($policyIdentifier: numeric!) {
        policies: Policy(where: { policyIdentifier: { _eq: $policyIdentifier } }, limit: 1) {
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
        }
      }
    `;
    const data = await postGraphql<{ policies: IndexedPolicy[] }>(this.endpoint, query, {
      policyIdentifier,
    }, this.adminSecret);
    return data.policies?.[0] ?? null;
  }
}
