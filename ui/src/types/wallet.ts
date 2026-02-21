import type { Address } from 'viem';
import type { Eip1193Provider } from '../ethereum';

export type WalletProviderKey = string;

export interface WalletProviderOption {
  key: WalletProviderKey;
  name: string;
  rdns: string;
  icon?: string;
  isMetaMask: boolean;
  provider: Eip1193Provider;
}

export type WalletConnectErrorCode =
  | 'user_rejected'
  | 'request_pending'
  | 'provider_missing'
  | 'unknown';

export interface WalletState {
  account: Address | null;
  chainId: number | null;
  connecting: boolean;
  providerReady: boolean;
  selectedProviderKey: WalletProviderKey | null;
  pendingRequestProviderKey: WalletProviderKey | null;
  providerModalOpen: boolean;
}
