import Redis from 'ioredis';
import type {
  AttestationRecord,
  CheckRecord,
  PolicyDefinitionRecord,
  ProofJobState,
} from './types.js';

/**
 * Decodes JSON payloads from Redis.
 *
 * @param raw Raw Redis string payload.
 * @returns Parsed object or `null` when input is missing.
 */
function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

/**
 * Iterates Redis keyspace using SCAN for a given pattern.
 *
 * @param client Redis client instance.
 * @param pattern Match pattern passed to `SCAN MATCH`.
 * @returns Complete key list for the pattern.
 */
async function scanKeys(client: Redis, pattern: string): Promise<string[]> {
  const keys: string[] = [];
  let cursor = '0';

  do {
    const [next, page] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', '100');
    cursor = next;
    keys.push(...page);
  } while (cursor !== '0');

  return keys;
}

/**
 * Thin repository layer over Redis for worker inputs and durable job state.
 */
export class RedisStore {
  /**
   * Creates a repository instance from an existing Redis client.
   *
   * @param client Connected Redis client.
   */
  constructor(private readonly client: Redis) {}

  /**
   * Connects to Redis and returns a store wrapper.
   *
   * @param url Redis connection URL.
   * @returns Ready-to-use `RedisStore`.
   */
  static connect(url: string): RedisStore {
    return new RedisStore(new Redis(url));
  }

  /** Closes the underlying Redis connection. */
  close(): Promise<unknown> {
    return this.client.quit();
  }

  /** Builds key for policy definition record. */
  policyKey(policyId: string | bigint): string {
    return `policy:def:${policyId.toString()}`;
  }

  /** Builds key for one subject compliance check. */
  checkKey(subjectId: string, checkId: string): string {
    return `compliance:subject:${subjectId}:check:${checkId}`;
  }

  /** Builds key for one request/attestor attestation payload. */
  attestationKey(requestId: string | bigint, attestor: string): string {
    return `attestation:request:${requestId.toString()}:attestor:${attestor.toLowerCase()}`;
  }

  /** Builds key for worker proof job state record. */
  proofJobKey(requestId: string | bigint): string {
    return `proofjob:request:${requestId.toString()}`;
  }

  /** Builds key for distributed lock associated with a proof job. */
  lockKey(requestId: string | bigint): string {
    return `${this.proofJobKey(requestId)}:lock`;
  }

  /**
   * Loads policy definition used by witness construction.
   *
   * @param policyId Policy identifier.
   * @returns Policy definition or `null` when missing.
   */
  async getPolicyDefinition(policyId: string | bigint): Promise<PolicyDefinitionRecord | null> {
    return parseJson<PolicyDefinitionRecord>(await this.client.get(this.policyKey(policyId)));
  }

  /**
   * Loads a single compliance check record.
   *
   * @param subjectId Logical subject id.
   * @param checkId Compliance check id.
   * @returns Check record or `null` when missing.
   */
  async getCheck(subjectId: string, checkId: string): Promise<CheckRecord | null> {
    return parseJson<CheckRecord>(await this.client.get(this.checkKey(subjectId, checkId)));
  }

  /**
   * Loads multiple checks for one subject.
   *
   * @param subjectId Logical subject id.
   * @param checkIds Required check identifiers.
   * @returns Existing records for requested checks.
   */
  async getChecks(subjectId: string, checkIds: string[]): Promise<CheckRecord[]> {
    const rows = await Promise.all(checkIds.map((checkId) => this.getCheck(subjectId, checkId)));
    return rows.filter((row): row is CheckRecord => row !== null);
  }

  /**
   * Loads all attestations for a request.
   *
   * @param requestId Request identifier.
   * @returns Attestation records keyed under the request namespace.
   */
  async getAttestations(requestId: string | bigint): Promise<AttestationRecord[]> {
    const keys = await scanKeys(
      this.client,
      `attestation:request:${requestId.toString()}:attestor:*`,
    );
    if (keys.length === 0) return [];
    const values = await this.client.mget(keys);
    return values
      .map((value) => parseJson<AttestationRecord>(value))
      .filter((row): row is AttestationRecord => row !== null);
  }

  /**
   * Loads durable proof job state for a request.
   *
   * @param requestId Request identifier.
   * @returns Proof job state or `null` when not yet persisted.
   */
  async getProofJobState(requestId: string | bigint): Promise<ProofJobState | null> {
    return parseJson<ProofJobState>(await this.client.get(this.proofJobKey(requestId)));
  }

  /**
   * Persists proof job state.
   *
   * @param state Full proof job state payload.
   */
  async setProofJobState(state: ProofJobState): Promise<void> {
    await this.client.set(this.proofJobKey(state.requestId), JSON.stringify(state));
  }

  /**
   * Lists keys matching a Redis pattern.
   *
   * @param pattern Redis `SCAN MATCH` pattern.
   * @returns Matching key list.
   */
  async listKeys(pattern: string): Promise<string[]> {
    return scanKeys(this.client, pattern);
  }

  /**
   * Reads an arbitrary JSON record by key.
   *
   * @param key Redis key.
   * @returns Parsed JSON payload or `null` when missing.
   */
  async getJson<T>(key: string): Promise<T | null> {
    return parseJson<T>(await this.client.get(key));
  }

  /**
   * Writes an arbitrary JSON record by key.
   *
   * @param key Redis key.
   * @param value JSON-serializable payload.
   */
  async setJson(key: string, value: unknown): Promise<void> {
    await this.client.set(key, JSON.stringify(value));
  }

  /**
   * Deletes a Redis key.
   *
   * @param key Redis key to remove.
   */
  async deleteKey(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Reads many JSON records in one round-trip.
   *
   * @param keys Redis keys to fetch.
   * @returns Key/value tuples for keys that have a JSON payload.
   */
  async mgetJson<T>(keys: string[]): Promise<Array<{ key: string; value: T }>> {
    if (keys.length === 0) return [];
    const values = await this.client.mget(keys);
    const rows: Array<{ key: string; value: T }> = [];

    for (let index = 0; index < keys.length; index += 1) {
      const parsed = parseJson<T>(values[index]);
      if (parsed !== null) {
        rows.push({ key: keys[index], value: parsed });
      }
    }

    return rows;
  }

  /**
   * Attempts to acquire a distributed lock for one request.
   *
   * @param requestId Request identifier.
   * @param owner Worker instance id.
   * @param ttlMs Lock time-to-live in milliseconds.
   * @returns `true` when lock was acquired.
   */
  async acquireLock(requestId: string | bigint, owner: string, ttlMs: number): Promise<boolean> {
    const result = await this.client.set(this.lockKey(requestId), owner, 'PX', ttlMs, 'NX');
    return result === 'OK';
  }

  /**
   * Releases a distributed lock when currently owned by `owner`.
   *
   * @param requestId Request identifier.
   * @param owner Worker instance id expected to own the lock.
   */
  async releaseLock(requestId: string | bigint, owner: string): Promise<void> {
    const key = this.lockKey(requestId);
    const current = await this.client.get(key);
    if (current === owner) {
      await this.client.del(key);
    }
  }
}
