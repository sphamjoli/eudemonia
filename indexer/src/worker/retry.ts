/**
 * Computes the next retry timestamp using capped exponential backoff.
 *
 * @param args Retry calculation inputs.
 * `args.nowMs`: Current timestamp in milliseconds.
 * `args.attemptCount`: Attempt number (1-based).
 * `args.backoffBaseMs`: Base delay in milliseconds.
 * `args.backoffMaxMs`: Maximum delay in milliseconds.
 * @returns Absolute timestamp (ms) when next retry is allowed.
 */
export function nextRetryTimestampMs(args: {
  nowMs: number;
  attemptCount: number;
  backoffBaseMs: number;
  backoffMaxMs: number;
}): number {
  const exp = 2 ** Math.max(0, args.attemptCount - 1);
  const delay = Math.min(args.backoffMaxMs, args.backoffBaseMs * exp);
  return args.nowMs + delay;
}
