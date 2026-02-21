import { adiChain } from '../../lib/adi';
import { appConfig } from '../../lib/config';
import type { Eip1193Provider } from '../../ethereum';

function expectedChainHex(): `0x${string}` {
  return `0x${adiChain.id.toString(16)}`;
}

export function useWalletChain() {
  async function addRequiredChain(provider: Eip1193Provider): Promise<void> {
    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: expectedChainHex(),
          chainName: adiChain.name,
          nativeCurrency: adiChain.nativeCurrency,
          rpcUrls: adiChain.rpcUrls.default.http,
          blockExplorerUrls: appConfig.explorerBaseUrl
            ? [appConfig.explorerBaseUrl]
            : undefined,
        },
      ],
    });
  }

  async function switchToRequiredChain(provider: Eip1193Provider): Promise<void> {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: expectedChainHex() }],
    });
  }

  async function ensureRequiredChain(
    provider: Eip1193Provider,
    currentChainId: number | null,
  ): Promise<void> {
    if (currentChainId === adiChain.id) {
      return;
    }

    try {
      await switchToRequiredChain(provider);
      return;
    } catch (cause) {
      const code = (cause as { code?: number } | undefined)?.code;
      if (code !== 4902) {
        throw cause;
      }
    }

    await addRequiredChain(provider);
    await switchToRequiredChain(provider);
  }

  return {
    addRequiredChain,
    switchToRequiredChain,
    ensureRequiredChain,
  };
}
