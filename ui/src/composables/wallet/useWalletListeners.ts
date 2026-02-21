import type { Address } from 'viem';
import type { Eip1193Provider } from '../../ethereum';

function parseAccount(accounts: unknown): Address | null {
  const values = Array.isArray(accounts) ? accounts : [];
  return (values[0] as Address | undefined) ?? null;
}

function parseChainId(value: unknown): number | null {
  try {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'bigint') {
      return Number(value);
    }
    if (typeof value !== 'string') {
      return null;
    }
    return Number(BigInt(value));
  } catch {
    return null;
  }
}

export function useWalletListeners(parameters: {
  onAccountChanged: (account: Address | null) => void;
  onChainChanged: (chainId: number | null) => void;
}) {
  let boundProvider: Eip1193Provider | null = null;
  let accountListener: ((accounts: unknown) => void) | null = null;
  let chainListener: ((chainId: unknown) => void) | null = null;

  function bind(provider: Eip1193Provider): void {
    if (boundProvider === provider) {
      return;
    }

    unbind();

    accountListener = (accounts: unknown) => {
      parameters.onAccountChanged(parseAccount(accounts));
    };

    chainListener = (chainId: unknown) => {
      parameters.onChainChanged(parseChainId(chainId));
    };

    provider.on?.('accountsChanged', accountListener);
    provider.on?.('chainChanged', chainListener);
    boundProvider = provider;
  }

  function unbind(): void {
    if (!boundProvider) {
      return;
    }

    if (accountListener) {
      boundProvider.removeListener?.('accountsChanged', accountListener);
      accountListener = null;
    }

    if (chainListener) {
      boundProvider.removeListener?.('chainChanged', chainListener);
      chainListener = null;
    }

    boundProvider = null;
  }

  return {
    bind,
    unbind,
    parseChainId,
  };
}
