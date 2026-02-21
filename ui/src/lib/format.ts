import { isHex, type Hex } from 'viem';

/** Shortens an address/hash for compact UI labels. */
export function shortHex(value: string, left = 6, right = 4): string {
  if (!value || value.length <= left + right + 2) {
    return value;
  }
  return `${value.slice(0, left + 2)}…${value.slice(-right)}`;
}

/** Converts unix timestamp seconds to a stable local datetime string. */
export function formatTimestamp(seconds: string | number | bigint): string {
  const numeric = Number(seconds);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return '—';
  }
  return new Date(numeric * 1000).toLocaleString();
}

/** Parses numeric form input to bigint. */
export function parseBigIntInput(value: string, fallback = 0n): bigint {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return fallback;
  }
  return BigInt(trimmed);
}

/** Returns true when value is exactly bytes32-encoded hex. */
export function isBytes32(value: string): value is Hex {
  return isHex(value, { strict: true }) && value.length === 66;
}

/** Renders a signed/unsigned integer with grouping separators. */
export function formatInt(value: string | number | bigint): string {
  return BigInt(value).toLocaleString();
}

/** Safe lower-casing helper for case-insensitive address/hex comparisons. */
export function normalizeCase(value: string): string {
  return value.toLowerCase();
}
