import { createStore, type EIP6963ProviderDetail } from 'mipd';
import type { Eip1193Provider } from '../../ethereum';
import type { WalletProviderKey, WalletProviderOption } from '../../types/wallet';

const META_MASK_RDNS = 'io.metamask';
const LEGACY_PROVIDER_KEY = 'legacy:window.ethereum';
const eip6963Store = createStore();

function isMetaMaskProvider(detail: EIP6963ProviderDetail): boolean {
  return (
    detail.info.rdns === META_MASK_RDNS ||
    detail.info.name.toLowerCase().includes('metamask') ||
    (detail.provider as Eip1193Provider).isMetaMask === true
  );
}

function toWalletProviderOption(detail: EIP6963ProviderDetail): WalletProviderOption {
  return {
    key: detail.info.uuid,
    name: detail.info.name,
    rdns: detail.info.rdns,
    icon: detail.info.icon,
    isMetaMask: isMetaMaskProvider(detail),
    provider: detail.provider as Eip1193Provider,
  };
}

function sortProviders(
  left: WalletProviderOption,
  right: WalletProviderOption,
): number {
  if (left.isMetaMask !== right.isMetaMask) {
    return left.isMetaMask ? -1 : 1;
  }
  return left.name.localeCompare(right.name);
}

export function useInjectedProviders() {
  function fallbackProviderOption(): WalletProviderOption | null {
    if (!window.ethereum) {
      return null;
    }

    const isMetaMask = window.ethereum.isMetaMask === true;
    return {
      key: LEGACY_PROVIDER_KEY,
      name: isMetaMask ? 'MetaMask' : 'Injected Wallet',
      rdns: isMetaMask ? META_MASK_RDNS : 'injected.legacy',
      isMetaMask,
      provider: window.ethereum,
    };
  }

  function listProviders(): WalletProviderOption[] {
    const providers = eip6963Store
      .getProviders()
      .map(toWalletProviderOption)
      .sort(sortProviders);
    if (providers.length > 0) {
      return providers;
    }

    const fallback = fallbackProviderOption();
    return fallback ? [fallback] : [];
  }

  function getProviderByKey(
    providers: WalletProviderOption[],
    key: WalletProviderKey | null,
  ): WalletProviderOption | null {
    if (!key) {
      return null;
    }
    return providers.find((provider) => provider.key === key) ?? null;
  }

  return {
    listProviders,
    getProviderByKey,
  };
}
