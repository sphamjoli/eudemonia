import { loadWorkerConfig } from './worker/config.js';
import { RedisStore } from './worker/redisStore.js';

/**
 * Loads all attestation records for a request from Redis.
 *
 * @param requestId Issuance request identifier.
 * @returns Attestation records available under the request namespace.
 */
export async function collectApprovals(requestId: bigint) {
  const cfg = loadWorkerConfig();
  const redis = RedisStore.connect(cfg.redisUrl);
  try {
    return redis.getAttestations(requestId.toString());
  } finally {
    await redis.close();
  }
}
