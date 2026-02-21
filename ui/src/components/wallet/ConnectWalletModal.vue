<template>
  <div
    v-if="wallet.providerModalOpen"
    class="wallet-modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-label="Connect wallet"
    @click.self="close"
  >
    <section class="wallet-modal-card">
      <header class="wallet-modal-header">
        <h3>Connect Wallet</h3>
        <p>Select a provider to start your session.</p>
      </header>

      <div
        v-if="wallet.availableProviders.length === 0"
        class="empty-state"
      >
        No injected wallet detected. Install MetaMask or another EIP-1193 wallet.
      </div>

      <div
        v-else
        class="wallet-provider-list"
      >
        <button
          v-for="(provider, index) in wallet.availableProviders"
          :key="`${provider.key}-${index}`"
          type="button"
          class="wallet-provider-item"
          :class="wallet.selectedProviderKey === provider.key ? 'active' : ''"
          @click="selectProvider(provider.key)"
        >
          <span>{{ provider.name }}</span>
          <span class="wallet-provider-id">{{ provider.rdns }}</span>
        </button>
      </div>

      <p
        v-if="isPendingForSelection"
        class="message"
      >
        A wallet request is pending in MetaMask. Complete it in the extension, then
        retry.
      </p>

      <p
        v-if="wallet.error"
        class="message fail"
      >
        {{ wallet.error }}
      </p>

      <footer class="wallet-modal-actions">
        <button
          type="button"
          class="btn-outline"
          @click="close"
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn-primary"
          :disabled="
            wallet.connecting ||
            wallet.availableProviders.length === 0 ||
            isPendingForSelection
          "
          @click="connect"
        >
          {{ wallet.connecting ? 'Connecting...' : 'Connect' }}
        </button>
        <button
          v-if="isPendingForSelection"
          type="button"
          class="btn-subtle"
          :disabled="wallet.connecting"
          @click="retryConnect"
        >
          Retry
        </button>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { WalletProviderKey } from '../../types/wallet';
import { useWalletStore } from '../../stores/useWalletStore';

const wallet = useWalletStore();
const isPendingForSelection = computed(
  () =>
    wallet.pendingRequestProviderKey !== null &&
    wallet.pendingRequestProviderKey === wallet.selectedProviderKey,
);

function close(): void {
  wallet.closeWalletProviderModal();
}

function selectProvider(providerKey: WalletProviderKey): void {
  wallet.selectProviderByKey(providerKey);
}

async function connect(): Promise<void> {
  try {
    await wallet.connectSelectedProvider();
  } catch {
    return;
  }
}

async function retryConnect(): Promise<void> {
  try {
    await wallet.connectSelectedProvider();
  } catch {
    return;
  }
}
</script>
