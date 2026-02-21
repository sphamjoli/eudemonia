import { BaseError, decodeErrorResult, type Abi, type Hex } from 'viem';
import { publicClient } from './adi';

function extractRevertData(cause: unknown): Hex | null {
  const visited = new Set<unknown>();
  let current: unknown = cause;

  while (current && typeof current === 'object' && !visited.has(current)) {
    visited.add(current);
    const maybeData = (current as { data?: unknown }).data;
    if (typeof maybeData === 'string' && maybeData.startsWith('0x')) {
      return maybeData as Hex;
    }
    current = (current as { cause?: unknown }).cause;
  }

  return null;
}

function formatDecodedValue(value: unknown): string {
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) return `[${value.map(formatDecodedValue).join(', ')}]`;
  if (value && typeof value === 'object') {
    return JSON.stringify(value, (_, nested) =>
      typeof nested === 'bigint' ? nested.toString() : nested,
    );
  }
  return String(value);
}

function tryDecodeAbiError(abi: Abi | undefined, data: Hex): string | null {
  if (!abi) return null;
  try {
    const decoded = decodeErrorResult({ abi, data });
    const args =
      decoded.args && decoded.args.length > 0
        ? `(${decoded.args.map(formatDecodedValue).join(', ')})`
        : '';
    return `${decoded.errorName}${args}`;
  } catch {
    return null;
  }
}

/**
 * Replays a reverted transaction as eth_call and returns the best decoded reason.
 */
export async function decodeFailedTransaction(hash: Hex, abi?: Abi): Promise<string> {
  try {
    const tx = await publicClient.getTransaction({ hash });
    if (!tx.to) return 'Transaction reverted';

    try {
      await publicClient.call({
        account: tx.from,
        to: tx.to,
        data: tx.input,
        value: tx.value,
        blockNumber:
          tx.blockNumber && tx.blockNumber > 0n ? tx.blockNumber - 1n : undefined,
      });
      return 'Transaction reverted';
    } catch (cause) {
      const revertData = extractRevertData(cause);
      const decoded = revertData ? tryDecodeAbiError(abi, revertData) : null;
      if (decoded) return decoded;
      if (cause instanceof BaseError) return cause.shortMessage || cause.message;
      return String(cause);
    }
  } catch (cause) {
    if (cause instanceof BaseError) return cause.shortMessage || cause.message;
    return String(cause);
  }
}
