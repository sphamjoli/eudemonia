import test from 'node:test';
import assert from 'node:assert/strict';
import { nextRetryTimestampMs } from './retry.js';

test('nextRetryTimestampMs uses exponential backoff with cap', () => {
  const now = 1_000_000;
  const first = nextRetryTimestampMs({
    nowMs: now,
    attemptCount: 1,
    backoffBaseMs: 1_000,
    backoffMaxMs: 60_000,
  });
  const fourth = nextRetryTimestampMs({
    nowMs: now,
    attemptCount: 4,
    backoffBaseMs: 1_000,
    backoffMaxMs: 60_000,
  });
  const capped = nextRetryTimestampMs({
    nowMs: now,
    attemptCount: 20,
    backoffBaseMs: 1_000,
    backoffMaxMs: 60_000,
  });

  assert.equal(first, now + 1_000);
  assert.equal(fourth, now + 8_000);
  assert.equal(capped, now + 60_000);
});
