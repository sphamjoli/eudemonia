import type { Ref } from 'vue';
import type { Address } from 'viem';
import type { Eip1193Provider } from '../../ethereum';
import type { WalletConnectErrorCode, WalletProviderKey } from '../../types/wallet';

interface WalletConnectionState {
  account: Ref<Address | null>;
  chainId: Ref<number | null>;
  connecting: Ref<boolean>;
  error: Ref<string | null>;
  pendingRequestProviderKey: Ref<WalletProviderKey | null>;
}

interface WalletConnectionDependencies {
  runQuickTask: <T>(task: () => Promise<T>) => Promise<T>;
  refreshSession: (provider: Eip1193Provider) => Promise<void>;
  ensureRequiredChain: (
    provider: Eip1193Provider,
    chainId: number | null,
  ) => Promise<void>;
  bindListeners: (provider: Eip1193Provider) => void;
}

function mapErrorCode(cause: unknown): WalletConnectErrorCode {
  const code = (cause as { code?: number } | undefined)?.code;
  const message = cause instanceof Error ? cause.message.toLowerCase() : '';
  if (code === 4001) {
    return 'user_rejected';
  }
  if (code === -32002) {
    return 'request_pending';
  }
  if (code === 4900 || code === 4901 || message.includes('extension not found')) {
    return 'provider_missing';
  }
  return 'unknown';
}

function mapErrorMessage(code: WalletConnectErrorCode, cause: unknown): string {
  if (code === 'user_rejected') {
    return 'Wallet connection was rejected.';
  }
  if (code === 'request_pending') {
    return 'A wallet request is already pending. Complete it in your wallet extension.';
  }
  if (code === 'provider_missing') {
    return 'Unable to reach the selected wallet provider.';
  }
  return cause instanceof Error ? cause.message : 'Wallet connection failed.';
}

export function useWalletConnection(
  state: WalletConnectionState,
  dependencies: WalletConnectionDependencies,
) {
  const connectInFlight = new Map<WalletProviderKey, Promise<void>>();

  async function connect(
    providerKey: WalletProviderKey,
    provider: Eip1193Provider,
  ): Promise<void> {
    const pending = connectInFlight.get(providerKey);
    if (pending) {
      await pending;
      return;
    }

    const request = dependencies.runQuickTask(async () => {
      state.connecting.value = true;
      state.error.value = null;
      if (state.pendingRequestProviderKey.value === providerKey) {
        state.pendingRequestProviderKey.value = null;
      }

      try {
        if (!state.account.value) {
          await provider.request({ method: 'eth_requestAccounts' });
        }

        await dependencies.refreshSession(provider);
        await dependencies.ensureRequiredChain(provider, state.chainId.value);
        await dependencies.refreshSession(provider);
        dependencies.bindListeners(provider);
      } catch (cause) {
        const code = mapErrorCode(cause);
        if (code === 'request_pending') {
          state.pendingRequestProviderKey.value = providerKey;
        }
        state.error.value = mapErrorMessage(code, cause);
        throw cause;
      } finally {
        state.connecting.value = false;
      }
    });

    connectInFlight.set(providerKey, request);
    try {
      await request;
    } finally {
      connectInFlight.delete(providerKey);
    }
  }

  return {
    connect,
  };
}
