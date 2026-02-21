<template>
  <div class="workspace-shell">
    <LoadingBar />
    <ConnectWalletModal />

    <NavigationRail />

    <div class="workspace-main">
      <header class="workspace-header">
        <div class="brand-block">
          <p class="brand-kicker">Policy Orchestration</p>
          <h1>Eudemonia</h1>
        </div>

        <div class="header-actions">
          <div class="status-chip ok">
            <span>Role</span>
            <strong>{{ auth.primaryRoleLabel.toUpperCase() }}</strong>
          </div>

          <div
            class="status-chip"
            :class="wallet.connected ? 'ok' : 'warn'"
          >
            <span>Wallet</span>
            <strong>{{
              wallet.connected ? shortHex(wallet.account ?? '') : 'Disconnected'
            }}</strong>
          </div>

          <div
            class="status-chip"
            :class="wallet.chainMatches ? 'ok' : 'warn'"
          >
            <span>Network</span>
            <strong>{{ wallet.networkLabel }}</strong>
          </div>

          <div
            class="status-chip"
            :class="indexerOnline ? 'ok' : 'warn'"
          >
            <span>Indexer</span>
            <strong>{{ indexerOnline ? 'Online' : 'Offline' }}</strong>
          </div>

          <button
            class="btn-subtle"
            type="button"
            :disabled="wallet.connecting"
            @click="addAdiChain"
          >
            Add ADI Chain
          </button>

          <button
            v-if="wallet.connected && !wallet.chainMatches"
            class="btn-subtle"
            type="button"
            :disabled="wallet.connecting"
            @click="switchNetwork"
          >
            Switch Network
          </button>

          <button
            class="btn-outline"
            type="button"
            :disabled="wallet.connecting"
            @click="handlePrimaryAction"
          >
            {{ wallet.connected ? 'Disconnect' : 'Connect Wallet' }}
          </button>
        </div>
      </header>

      <main class="workspace-content">
        <RouterView />
      </main>
    </div>

    <MobileTabs />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch, watchEffect } from 'vue';
import ConnectWalletModal from './components/wallet/ConnectWalletModal.vue';
import LoadingBar from './components/LoadingBar.vue';
import MobileTabs from './components/MobileTabs.vue';
import NavigationRail from './components/NavigationRail.vue';
import { shortHex } from './lib/format';
import { pingIndexer } from './lib/indexer';
import { useProcessStore } from './stores/useProcessStore';
import { useAuthStore } from './stores/useAuthStore';
import { useThemeStore } from './stores/useThemeStore';
import { useWalletStore } from './stores/useWalletStore';

const theme = useThemeStore();
const wallet = useWalletStore();
const auth = useAuthStore();
const processStore = useProcessStore();

const indexerOnline = computed(() => theme.indexerOnline);

let healthTimer: ReturnType<typeof setInterval> | null = null;
let permissionsTimer: ReturnType<typeof setInterval> | null = null;

async function refreshIndexerStatus(): Promise<void> {
  const online = await pingIndexer();
  theme.setIndexerOnline(online);
}

async function handlePrimaryAction(): Promise<void> {
  if (wallet.connected) {
    wallet.disconnect();
    await auth.refreshPermissions();
    return;
  }

  wallet.openWalletProviderModal();
}

async function switchNetwork(): Promise<void> {
  try {
    await wallet.switchToRequiredNetwork();
  } catch (cause) {
    wallet.markFailed(
      cause instanceof Error ? cause.message : 'Network switch failed.',
    );
  }
}

async function addAdiChain(): Promise<void> {
  try {
    await wallet.addAdiChain();
  } catch (cause) {
    wallet.markFailed(
      cause instanceof Error ? cause.message : 'Failed to add ADI chain.',
    );
  }
}

function onPrimaryFromHex(hex: string): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return '#1f2633';
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  return luminance > 0.62 ? '#1f2633' : '#fff9ea';
}

onMounted(async () => {
  await wallet.initialize();

  await processStore.runQuickTask(async () => {
    await Promise.all([refreshIndexerStatus(), auth.refreshPermissions()]);
  });

  healthTimer = setInterval(refreshIndexerStatus, 12_000);
  permissionsTimer = setInterval(() => {
    void auth.refreshPermissions();
  }, 12_000);
});

onUnmounted(() => {
  if (healthTimer) {
    clearInterval(healthTimer);
  }
  if (permissionsTimer) {
    clearInterval(permissionsTimer);
  }
  wallet.unbindListeners();
});

watch(
  () => [wallet.account, wallet.chainId] as const,
  () => {
    void auth.refreshPermissions();
  },
);

watchEffect(() => {
  document.documentElement.style.setProperty('--md-sys-color-primary', theme.accent);
  document.documentElement.style.setProperty(
    '--md-sys-color-on-primary',
    onPrimaryFromHex(theme.accent),
  );
  document.documentElement.style.setProperty(
    '--md-sys-color-primary-container',
    `color-mix(in srgb, ${theme.accent} 26%, #fff4d2 74%)`,
  );
  document.documentElement.style.setProperty(
    '--md-sys-color-outline',
    `color-mix(in srgb, ${theme.accent} 24%, #cfc4aa 76%)`,
  );
});
</script>
