import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { type Address } from 'viem';
import { useWalletChain } from '../composables/wallet/useWalletChain';
import { useWalletConnection } from '../composables/wallet/useWalletConnection';
import { useInjectedProviders } from '../composables/wallet/useInjectedProviders';
import { useWalletListeners } from '../composables/wallet/useWalletListeners';
import type { Eip1193Provider } from '../ethereum';
import { getWalletClient } from '../lib/adi';
import { appConfig } from '../lib/config';
import type { WalletProviderKey, WalletProviderOption } from '../types/wallet';
import { useProcessStore } from './useProcessStore';

export const useWalletStore = defineStore(
  'wallet',
  () => {
    const processStore = useProcessStore();
    const { listProviders, getProviderByKey } = useInjectedProviders();
    const { addRequiredChain, switchToRequiredChain, ensureRequiredChain } =
      useWalletChain();

    const account = ref<Address | null>(null);
    const chainId = ref<number | null>(null);
    const connecting = ref(false);
    const error = ref<string | null>(null);
    const providerReady = ref(false);
    const selectedProviderKey = ref<WalletProviderKey | null>(null);
    const pendingRequestProviderKey = ref<WalletProviderKey | null>(null);
    const availableProviders = ref<WalletProviderOption[]>([]);
    const providerModalOpen = ref(false);

    // Tracks whether listeners are currently bound to a provider, preventing
    // double-binding which would cause duplicate accountsChanged / chainChanged
    // events and cascade into repeated connection requests.
    let boundProvider: Eip1193Provider | null = null;

    const listeners = useWalletListeners({
      onAccountChanged(nextAccount) {
        account.value = nextAccount;
      },
      onChainChanged(nextChainId) {
        chainId.value = nextChainId;
      },
    });

    // Safely bind listeners to a provider. Always unbinds from any previously
    // bound provider first so handlers are never registered more than once.
    function safeBindListeners(provider: Eip1193Provider): void {
      if (boundProvider) {
        listeners.unbind();
        boundProvider = null;
      }
      listeners.bind(provider);
      boundProvider = provider;
    }

    function safeUnbindListeners(): void {
      listeners.unbind();
      boundProvider = null;
    }

    async function refreshSession(provider?: Eip1193Provider): Promise<void> {
      // Use the explicitly passed provider or fall back to the currently
      // selected one. Avoid calling resolveSelectedProvider here because that
      // can trigger reactive side effects during an in-flight refresh.
      const activeProvider =
        provider ??
        (() => {
          const selected = getProviderByKey(
            availableProviders.value,
            selectedProviderKey.value,
          );
          return selected?.provider ?? null;
        })();

      if (!activeProvider) {
        account.value = null;
        chainId.value = null;
        providerReady.value = false;
        return;
      }

      providerReady.value = true;
      const [accounts, chain] = await Promise.all([
        activeProvider.request({ method: 'eth_accounts' }) as Promise<unknown>,
        activeProvider.request({ method: 'eth_chainId' }) as Promise<unknown>,
      ]);

      const values = Array.isArray(accounts) ? accounts : [];
      account.value = (values[0] as Address | undefined) ?? null;
      chainId.value = listeners.parseChainId(chain);
    }

    // Pure read/write against availableProviders. Does not touch
    // selectedProviderKey or pendingRequestProviderKey while a connection
    // request is in flight (connecting.value === true).
    function refreshProviders(): WalletProviderOption[] {
      const providers = listProviders();
      availableProviders.value = providers;
      providerReady.value = providers.length > 0;

      // Only mutate key refs when no request is pending to avoid
      // clearing pendingRequestProviderKey mid-flight.
      if (!connecting.value) {
        if (!selectedProviderKey.value && providers.length > 0) {
          selectedProviderKey.value = providers[0].key;
        }

        if (
          selectedProviderKey.value &&
          !getProviderByKey(providers, selectedProviderKey.value)
        ) {
          selectedProviderKey.value = providers[0]?.key ?? null;
        }

        if (
          pendingRequestProviderKey.value &&
          !getProviderByKey(providers, pendingRequestProviderKey.value)
        ) {
          pendingRequestProviderKey.value = null;
        }
      }

      return providers;
    }

    // Pure resolution from the already-loaded availableProviders list.
    // Does not call refreshProviders() as a side effect; callers are
    // responsible for refreshing before resolving when needed.
    function resolveSelectedProvider(): WalletProviderOption | null {
      const providers = availableProviders.value;

      const selected = getProviderByKey(providers, selectedProviderKey.value);
      if (selected) {
        return selected;
      }

      if (providers.length > 0) {
        selectedProviderKey.value = providers[0].key;
        return providers[0];
      }

      return null;
    }

    function resolveProviderOrThrow(): WalletProviderOption {
      const provider = resolveSelectedProvider();
      if (provider) {
        return provider;
      }
      throw new Error('Select a wallet provider first.');
    }

    const connection = useWalletConnection(
      {
        account,
        chainId,
        connecting,
        error,
        pendingRequestProviderKey,
      },
      {
        runQuickTask: processStore.runQuickTask,
        refreshSession,
        ensureRequiredChain,
        bindListeners: safeBindListeners,
      },
    );

    const connected = computed(() => Boolean(account.value));
    const chainMatches = computed(() => chainId.value === appConfig.chainId);
    const networkLabel = computed(() =>
      chainId.value ? `Chain ${chainId.value}` : 'No network',
    );
    const selectedProviderLabel = computed(
      () => resolveSelectedProvider()?.name ?? 'No provider',
    );

    function openWalletProviderModal(): void {
      refreshProviders();
      providerModalOpen.value = true;
      error.value = null;
    }

    function closeWalletProviderModal(): void {
      providerModalOpen.value = false;
    }

    function selectProviderByKey(key: WalletProviderKey): void {
      selectedProviderKey.value = key;
      error.value = null;
    }

    async function connect(): Promise<void> {
      // Guard against concurrent requests. Without this, rapid clicks or
      // reactive re-triggers fire multiple eth_requestAccounts calls.
      if (connecting.value) return;

      const provider = resolveProviderOrThrow();
      await connection.connect(provider.key, provider.provider);
    }

    async function connectSelectedProvider(): Promise<void> {
      await connect();
      providerModalOpen.value = false;
    }

    async function ensureExpectedChain(): Promise<void> {
      const provider = resolveProviderOrThrow();
      await processStore.runQuickTask(async () => {
        await ensureRequiredChain(provider.provider, chainId.value);
        await refreshSession(provider.provider);
      });
    }

    async function switchToRequiredNetwork(): Promise<void> {
      let provider: WalletProviderOption;
      try {
        provider = resolveProviderOrThrow();
      } catch {
        openWalletProviderModal();
        throw new Error('Select a wallet provider first.');
      }

      await processStore.runQuickTask(async () => {
        await switchToRequiredChain(provider.provider);
        await refreshSession(provider.provider);
      });
    }

    async function addAdiChain(): Promise<void> {
      let provider: WalletProviderOption;
      try {
        provider = resolveProviderOrThrow();
      } catch {
        openWalletProviderModal();
        throw new Error('Select a wallet provider first.');
      }

      await processStore.runQuickTask(async () => {
        await addRequiredChain(provider.provider);
      });
    }

    function disconnect(): void {
      account.value = null;
      error.value = null;
      pendingRequestProviderKey.value = null;
      safeUnbindListeners();
      resetTransaction();
    }

    function startTransaction(): void {
      error.value = null;
      processStore.beginQuickTask();
    }

    function markBroadcasting(): void {}

    function markIncluded(): void {}

    function markFinalized(): void {
      processStore.endQuickTask();
    }

    function markFailed(message: string): void {
      error.value = message;
      processStore.endQuickTask();
    }

    function resetTransaction(): void {
      processStore.endQuickTask();
    }

    function walletClient() {
      const provider = resolveProviderOrThrow();
      return getWalletClient(provider.provider);
    }

    function requireAccount(): Address {
      if (!account.value) {
        throw new Error('Connect wallet first.');
      }
      return account.value;
    }

    async function initialize(): Promise<void> {
      try {
        await processStore.runQuickTask(async () => {
          error.value = null;

          // Explicit refresh before resolution so resolveSelectedProvider
          // never has to call refreshProviders() as a reactive side effect.
          refreshProviders();

          const selected = resolveSelectedProvider();
          if (!selected) {
            safeUnbindListeners();
            account.value = null;
            chainId.value = null;
            return;
          }

          // Unbind before refreshSession to ensure the session query runs
          // cleanly before new event listeners are attached.
          safeUnbindListeners();
          await refreshSession(selected.provider);
          safeBindListeners(selected.provider);
        });
      } catch (cause) {
        error.value =
          cause instanceof Error ? cause.message : 'Failed to restore wallet session.';
        safeUnbindListeners();
        account.value = null;
      }
    }

    function unbindListeners(): void {
      safeUnbindListeners();
    }

    return {
      account,
      chainId,
      connecting,
      error,
      providerReady,
      selectedProviderKey,
      pendingRequestProviderKey,
      availableProviders,
      providerModalOpen,
      selectedProviderLabel,
      isLoading: computed(() => processStore.quickTaskCount > 0),
      connected,
      chainMatches,
      networkLabel,
      initialize,
      openWalletProviderModal,
      closeWalletProviderModal,
      refreshProviders,
      selectProviderByKey,
      connectSelectedProvider,
      ensureExpectedChain,
      switchToRequiredNetwork,
      addAdiChain,
      disconnect,
      startTransaction,
      markBroadcasting,
      markIncluded,
      markFinalized,
      markFailed,
      resetTransaction,
      walletClient,
      requireAccount,
      unbindListeners,
    };
  },
  {
    persist: {
      pick: ['selectedProviderKey'],
    },
  },
);
