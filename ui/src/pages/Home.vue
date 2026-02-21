<template>
  <section class="page-wrap">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Workspace</p>
        <h2 class="page-title">Eudemonia Policy Engine</h2>
        <p class="page-subtitle">
          Configurable compliance, proof-backed execution, and role-scoped operations.
        </p>
      </div>
      <div class="form-actions">
        <button
          class="btn-outline"
          type="button"
          :disabled="wallet.connecting"
          @click="openConnectModal"
        >
          {{ wallet.connected ? 'Wallet Connected' : 'Connect Wallet' }}
        </button>
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
      </div>
    </header>

    <section class="kpi-grid">
      <article class="kpi-card">
        <p>Session</p>
        <strong>{{ wallet.connected ? 'Connected' : 'Disconnected' }}</strong>
      </article>
      <article class="kpi-card">
        <p>Network</p>
        <strong>{{ wallet.networkLabel }}</strong>
      </article>
      <article class="kpi-card">
        <p>Required Chain</p>
        <strong>{{ requiredChainLabel }}</strong>
      </article>
      <article class="kpi-card">
        <p>Granted Roles</p>
        <strong>{{ roleCount }}</strong>
      </article>
      <article class="kpi-card">
        <p>Registry Admin</p>
        <strong>{{ ownerLabel }}</strong>
      </article>
    </section>

    <section class="panel-grid">
      <article class="panel">
        <header class="panel-head">
          <h3 class="panel-title">Available Workspaces</h3>
          <p class="panel-note">Shown from onchain roles in PaymentRegistry.</p>
        </header>

        <p class="panel-note">
          Connected wallet is
          <strong>{{ ownerMatchLabel }}</strong>
          PaymentRegistry owner.
        </p>

        <div
          v-if="entries.length === 0"
          class="empty-state"
        >
          Connect a wallet and request role assignment from an admin to access role
          workspaces.
        </div>

        <div
          v-else
          class="role-grid"
        >
          <RouterLink
            v-for="entry in entries"
            :key="entry.to"
            :to="entry.to"
            class="role-card"
          >
            <span class="role-short">{{ entry.short }}</span>
            <div>
              <p class="role-name">{{ entry.label }}</p>
              <p class="role-note">Open {{ entry.label.toLowerCase() }} workspace</p>
            </div>
          </RouterLink>
        </div>
      </article>

      <article class="panel">
        <header class="panel-head">
          <h3 class="panel-title">Operator Flow</h3>
          <p class="panel-note">Institution-first path for auditable issuance.</p>
        </header>

        <ol class="flow-list">
          <li>Admin assigns roles and policy constraints.</li>
          <li>Issuer creates request and submits execution.</li>
          <li>Attestors sign approvals for worker checks.</li>
          <li>Worker proves and submits issuance.</li>
          <li>Audit reviews request-to-proof-to-settlement trace.</li>
        </ol>
      </article>
    </section>

    <p
      v-if="message"
      class="message"
      :class="messageKind"
    >
      {{ message }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { zeroAddress, type Address } from 'viem';
import { paymentRegistryAbi, publicClient } from '../lib/adi';
import { appConfig } from '../lib/config';
import { shortHex } from '../lib/format';
import { useAuthStore } from '../stores/useAuthStore';
import { useWalletStore } from '../stores/useWalletStore';

const wallet = useWalletStore();
const auth = useAuthStore();

const message = ref('');
const messageKind = ref<'ok' | 'fail'>('ok');
const paymentRegistryOwner = ref<Address | null>(null);

const entries = computed(() => auth.allowedNavEntries);
const roleCount = computed(() => entries.value.length);
const requiredChainLabel = computed(
  () => `${appConfig.chainName} (${appConfig.chainId})`,
);
const ownerLabel = computed(() =>
  paymentRegistryOwner.value ? shortHex(paymentRegistryOwner.value) : 'Unavailable',
);
const ownerMatchLabel = computed(() => {
  if (!wallet.account || !paymentRegistryOwner.value) {
    return 'not the';
  }
  return wallet.account.toLowerCase() === paymentRegistryOwner.value.toLowerCase()
    ? 'the'
    : 'not the';
});

function setMessage(kind: 'ok' | 'fail', text: string): void {
  messageKind.value = kind;
  message.value = text;
}

function openConnectModal(): void {
  wallet.openWalletProviderModal();
  setMessage('ok', 'Select a wallet provider to continue.');
}

async function switchNetwork(): Promise<void> {
  try {
    await wallet.switchToRequiredNetwork();
    setMessage('ok', 'Network switched.');
  } catch (cause) {
    const text = cause instanceof Error ? cause.message : String(cause);
    setMessage('fail', text || 'Network switch failed.');
  }
}

async function addAdiChain(): Promise<void> {
  try {
    await wallet.addAdiChain();
    setMessage('ok', 'ADI chain added to wallet.');
  } catch (cause) {
    const text = cause instanceof Error ? cause.message : String(cause);
    setMessage('fail', text || 'Failed to add ADI chain.');
  }
}

async function refreshOwner(): Promise<void> {
  if (appConfig.paymentRegistry === zeroAddress) {
    paymentRegistryOwner.value = null;
    return;
  }

  try {
    const owner = await publicClient.readContract({
      address: appConfig.paymentRegistry,
      abi: paymentRegistryAbi,
      functionName: 'owner',
    });
    paymentRegistryOwner.value = owner as Address;
  } catch {
    paymentRegistryOwner.value = null;
  }
}

onMounted(() => {
  void refreshOwner();
});

watch(
  () => wallet.chainId,
  () => {
    void refreshOwner();
  },
);
</script>
