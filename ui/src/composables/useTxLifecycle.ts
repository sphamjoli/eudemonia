import type { Abi, Hex } from 'viem';
import { publicClient } from '../lib/adi';
import { decodeFailedTransaction } from '../lib/tx';
import { useWalletStore } from '../stores/useWalletStore';

export function useTxLifecycle() {
  const wallet = useWalletStore();

  function toErrorMessage(cause: unknown, fallback = 'Transaction failed.'): string {
    const text = cause instanceof Error ? cause.message : String(cause);
    return text || fallback;
  }

  async function runWrite(
    action: () => Promise<Hex>,
    options?: { abi?: Abi },
  ): Promise<Hex> {
    try {
      if (!wallet.connected) {
        throw new Error('Connect wallet first.');
      }

      wallet.startTransaction();
      const txHash = await action();
      wallet.markBroadcasting();
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      if (receipt.status !== 'success') {
        const decoded = await decodeFailedTransaction(txHash, options?.abi);
        throw new Error(`Transaction reverted (${txHash}): ${decoded}`);
      }
      wallet.markIncluded();
      wallet.markFinalized();
      return txHash;
    } catch (cause) {
      wallet.markFailed(toErrorMessage(cause));
      throw cause;
    }
  }

  return {
    runWrite,
    toErrorMessage,
  };
}
