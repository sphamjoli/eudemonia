<template>
  <section class="page-wrap">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Role · Employee</p>
        <h2 class="page-title">Employee Portal</h2>
        <p class="page-subtitle">
          Review compensation, manage privacy profile, and track payment history.
        </p>
      </div>
      <button
        class="btn-subtle"
        type="button"
        @click="refresh"
      >
        Refresh
      </button>
    </header>

    <div
      v-if="!wallet.connected"
      class="empty-state"
    >
      Connect wallet to load your profile and payment history.
    </div>

    <AppTabs
      :model-value="activeTab"
      :tabs="tabs"
      aria-label="Employee workspace tabs"
      @update:model-value="activeTab = $event as EmployeeTab"
    />

    <section
      v-if="activeTab === 'compensation'"
      class="tab-panel"
    >
      <section class="kpi-grid">
        <article class="kpi-card">
          <p>Executed Payments</p>
          <strong>{{ executedRequests.length }}</strong>
        </article>
        <article class="kpi-card">
          <p>Public Amount Paid</p>
          <strong>{{ publicPaidTotal }}</strong>
        </article>
        <article class="kpi-card">
          <p>Private Payments</p>
          <strong>{{ privatePaymentsCount }}</strong>
        </article>
        <article class="kpi-card">
          <p>Active Roles</p>
          <strong>{{ participantRolesLabel }}</strong>
        </article>
      </section>

      <section class="panel-grid">
        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Token Balances</h3>
            <p class="panel-note">
              Onchain balances from RwaToken1155 by issued asset IDs.
            </p>
          </header>

          <div class="form-grid">
            <div class="field full">
              <label>Token Contract URI</label>
              <input
                :value="tokenContractUri"
                readonly
              />
            </div>
          </div>

          <div
            v-if="assetBalances.length === 0"
            class="empty-state"
          >
            No token balances found.
          </div>
          <div
            v-else
            class="table-wrap"
          >
            <table class="data-table">
              <thead>
                <tr>
                  <th>Asset ID</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in assetBalances"
                  :key="row.assetId"
                >
                  <td>{{ row.assetId }}</td>
                  <td>{{ row.balance }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Compensation Summary</h3>
            <p class="panel-note">
              Derived from indexed issuance requests bound to your subject address.
            </p>
          </header>

          <div class="form-grid">
            <div class="field">
              <label>Total Requests</label>
              <input
                :value="myRequests.length"
                readonly
              />
            </div>
            <div class="field">
              <label>Consumed</label>
              <input
                :value="executedRequests.length"
                readonly
              />
            </div>
            <div class="field">
              <label>Latest Execution</label>
              <input
                :value="latestExecutionTime"
                readonly
              />
            </div>
            <div class="field">
              <label>Private Mode Count</label>
              <input
                :value="privatePaymentsCount"
                readonly
              />
            </div>
          </div>
        </article>
      </section>
    </section>

    <section
      v-if="activeTab === 'profile'"
      class="tab-panel"
    >
      <section class="panel-grid">
        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Current Privacy Profile</h3>
            <p class="panel-note">
              Reads from IssuanceRegistry.getPrivacyConfiguration.
            </p>
          </header>

          <div class="form-grid">
            <div class="field">
              <label>Mode</label>
              <input
                :value="currentProfile.modeLabel"
                readonly
              />
            </div>
            <div class="field">
              <label>Configured</label>
              <input
                :value="currentProfile.isConfigured ? 'Yes' : 'No'"
                readonly
              />
            </div>
            <div class="field full">
              <label>Spending Public Key</label>
              <input
                :value="currentProfile.spendingPublicKey"
                readonly
                class="inline-mono"
              />
            </div>
            <div class="field full">
              <label>Viewing Public Key</label>
              <input
                :value="currentProfile.viewingPublicKey"
                readonly
                class="inline-mono"
              />
            </div>
          </div>

          <details class="advanced-panel">
            <summary>Participant Registry Snapshot</summary>
            <div class="advanced-content">
              <div class="form-grid">
                <div class="field">
                  <label>Active</label>
                  <input
                    :value="participant.active ? 'Yes' : 'No'"
                    readonly
                  />
                </div>
                <div class="field">
                  <label>Role Mask</label>
                  <input
                    :value="participant.roleMask"
                    readonly
                    class="inline-mono"
                  />
                </div>
                <div class="field full">
                  <label>Profile Hash</label>
                  <input
                    :value="participant.profileHash"
                    readonly
                    class="inline-mono"
                  />
                </div>
              </div>
            </div>
          </details>
        </article>

        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Update Privacy Profile</h3>
            <p class="panel-note">
              Writes to IssuanceRegistry.setMyPrivacyConfiguration.
            </p>
          </header>

          <div class="form-grid">
            <div class="field">
              <label>Mode</label>
              <select v-model.number="form.mode">
                <option
                  v-for="mode in PRIVACY_MODES"
                  :key="mode.value"
                  :value="mode.value"
                >
                  {{ mode.label }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Schema Version</label>
              <input
                v-model="form.schemaVersion"
                type="number"
                min="1"
              />
            </div>

            <div class="field full">
              <label>Spending Public Key (bytes32)</label>
              <input
                v-model="form.spendingPublicKey"
                class="inline-mono"
                placeholder="0x..."
              />
            </div>

            <div class="field full">
              <label>Viewing Public Key (bytes32)</label>
              <input
                v-model="form.viewingPublicKey"
                class="inline-mono"
                placeholder="0x..."
              />
            </div>
          </div>

          <details class="advanced-panel">
            <summary>Advanced Profile Fields</summary>
            <div class="advanced-content">
              <div class="form-grid">
                <div class="field full">
                  <label>Metadata Hash (bytes32)</label>
                  <input
                    v-model="form.metadataHash"
                    class="inline-mono"
                    placeholder="0x..."
                  />
                </div>
              </div>
            </div>
          </details>

          <div class="form-actions">
            <button
              class="btn-primary"
              type="button"
              :disabled="submitting || !wallet.connected"
              @click="saveProfile"
            >
              Save Profile
            </button>
          </div>
        </article>
      </section>
    </section>

    <section
      v-if="activeTab === 'history'"
      class="tab-panel"
    >
      <article class="panel">
        <header class="panel-head">
          <h3 class="panel-title">My Requests</h3>
          <p class="panel-note">Full request history for your wallet as subject.</p>
        </header>

        <div
          v-if="myRequests.length === 0"
          class="empty-state"
        >
          No requests found for this wallet.
        </div>

        <div
          v-else
          class="table-wrap"
        >
          <table class="data-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Status</th>
                <th>Mode</th>
                <th>Amount</th>
                <th>Asset ID</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="request in myRequests"
                :key="request.id"
              >
                <td>{{ request.requestIdentifier }}</td>
                <td>
                  <span
                    class="badge"
                    :class="
                      request.status === 'CONSUMED'
                        ? 'ok'
                        : request.status === 'CANCELLED'
                          ? 'fail'
                          : 'warn'
                    "
                  >
                    {{ request.status }}
                  </span>
                </td>
                <td>{{ privacyModeLabelFromKey(request.privacyMode) }}</td>
                <td>{{ request.amount === '0' ? 'Private' : request.amount }}</td>
                <td>{{ request.assetIdentifier }}</td>
                <td>{{ formatTimestamp(request.updatedAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>

    <p
      v-if="message"
      class="message"
      :class="messageKind === 'ok' ? 'ok' : 'fail'"
    >
      {{ message }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { type Hex, zeroAddress } from 'viem';
import AppTabs from '../components/AppTabs.vue';
import { useNotice } from '../composables/useNotice';
import { useTxLifecycle } from '../composables/useTxLifecycle';
import {
  adiChain,
  issuanceRegistryAbi,
  paymentRegistryAbi,
  PRIVACY_MODES,
  privacyModeLabel,
  privacyModeLabelFromKey,
  publicClient,
  rwaTokenAbi,
  ZERO_HASH,
} from '../lib/adi';
import { appConfig } from '../lib/config';
import { fetchIssuanceRequests, type IndexedIssuanceRequest } from '../lib/indexer';
import { isBytes32 } from '../lib/format';
import { useProcessStore } from '../stores/useProcessStore';
import { useWalletStore } from '../stores/useWalletStore';

type EmployeeTab = 'compensation' | 'profile' | 'history';

const tabs: Array<{ key: EmployeeTab; label: string }> = [
  { key: 'compensation', label: 'Compensation' },
  { key: 'profile', label: 'Profile' },
  { key: 'history', label: 'History' },
];

const activeTab = ref<EmployeeTab>('compensation');

const wallet = useWalletStore();
const processStore = useProcessStore();
const { message, messageKind, clearNotice, setNotice, setFailure } = useNotice();
const { runWrite, toErrorMessage } = useTxLifecycle();

const requests = ref<IndexedIssuanceRequest[]>([]);
const submitting = ref(false);

const tokenContractUri = ref('n/a');
const participant = reactive({
  roleMask: '0',
  active: false,
  profileHash: ZERO_HASH,
});

const assetBalances = ref<Array<{ assetId: string; balance: string }>>([]);

const currentProfile = reactive({
  isConfigured: false,
  modeLabel: 'No Privacy',
  spendingPublicKey: ZERO_HASH,
  viewingPublicKey: ZERO_HASH,
});

const form = reactive({
  mode: 0,
  spendingPublicKey: '',
  viewingPublicKey: '',
  metadataHash: '',
  schemaVersion: '1',
});

const myRequests = computed(() => {
  if (!wallet.account) return [];
  const me = wallet.account.toLowerCase();
  return requests.value.filter((request) => request.subject.toLowerCase() === me);
});

const executedRequests = computed(() =>
  myRequests.value.filter((request) => request.status === 'CONSUMED'),
);

const publicPaidTotal = computed(() => {
  return executedRequests.value
    .reduce((acc, request) => acc + BigInt(request.amount), 0n)
    .toString();
});

const privatePaymentsCount = computed(() => {
  return executedRequests.value.filter(
    (request) =>
      request.privacyMode === 'AMOUNT_PRIVATE' ||
      request.privacyMode === 'FULL_PRIVATE',
  ).length;
});

const latestExecutionTime = computed(() => {
  const latest = executedRequests.value[0];
  if (!latest) return 'n/a';
  return formatTimestamp(latest.updatedAt);
});

const participantRolesLabel = computed(() => {
  const mask = BigInt(participant.roleMask);
  const labels: string[] = [];
  if ((mask & (1n << 0n)) !== 0n) labels.push('ADMIN');
  if ((mask & (1n << 1n)) !== 0n) labels.push('ISSUER');
  if ((mask & (1n << 2n)) !== 0n) labels.push('EMPLOYEE');
  if ((mask & (1n << 3n)) !== 0n) labels.push('ATTESTOR');
  if ((mask & (1n << 4n)) !== 0n) labels.push('AUDITOR');
  return labels.length > 0 ? labels.join(', ') : 'None';
});

function setMessage(kind: 'ok' | 'fail', text: string): void {
  setNotice(kind, text);
}

function captureError(cause: unknown): void {
  setFailure(toErrorMessage(cause, 'Operation failed.'));
}

function formatTimestamp(value: string | number): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 'n/a';
  const millis = numeric > 9999999999 ? numeric : numeric * 1000;
  return new Date(millis).toLocaleString();
}

async function refresh(): Promise<void> {
  await processStore.runQuickTask(async () => {
    requests.value = await fetchIssuanceRequests(220);

    if (!wallet.connected || !wallet.account) {
      return;
    }

    if (appConfig.rwaToken !== zeroAddress) {
      tokenContractUri.value = await publicClient.readContract({
        address: appConfig.rwaToken,
        abi: rwaTokenAbi,
        functionName: 'contractURI',
      });
    }

    if (appConfig.paymentRegistry !== zeroAddress) {
      const participantState = await publicClient.readContract({
        address: appConfig.paymentRegistry,
        abi: paymentRegistryAbi,
        functionName: 'getParticipant',
        args: [wallet.account],
      });

      participant.roleMask = participantState.roleMask.toString();
      participant.active = participantState.active;
      participant.profileHash = participantState.profileHash;
    }

    if (appConfig.issuanceRegistry !== zeroAddress) {
      const privacy = await publicClient.readContract({
        address: appConfig.issuanceRegistry,
        abi: issuanceRegistryAbi,
        functionName: 'getPrivacyConfiguration',
        args: [wallet.account],
      });

      currentProfile.isConfigured = privacy.isConfigured;
      currentProfile.modeLabel = privacyModeLabel(Number(privacy.mode));
      currentProfile.spendingPublicKey = privacy.spendingPublicKey;
      currentProfile.viewingPublicKey = privacy.viewingPublicKey;

      if (currentProfile.isConfigured) {
        form.mode = privacy.mode;
        form.schemaVersion = privacy.schemaVersion.toString();
        form.spendingPublicKey =
          privacy.spendingPublicKey === ZERO_HASH ? '' : privacy.spendingPublicKey;
        form.viewingPublicKey =
          privacy.viewingPublicKey === ZERO_HASH ? '' : privacy.viewingPublicKey;
        form.metadataHash =
          privacy.metadataHash === ZERO_HASH ? '' : privacy.metadataHash;
      }
    }

    const uniqueAssets = [
      ...new Set(myRequests.value.map((request) => request.assetIdentifier)),
    ].slice(0, 20);
    const balances = await Promise.all(
      uniqueAssets.map(async (assetId) => {
        if (appConfig.rwaToken === zeroAddress || !wallet.account) {
          return { assetId, balance: '0' };
        }
        const balance = await publicClient.readContract({
          address: appConfig.rwaToken,
          abi: rwaTokenAbi,
          functionName: 'balanceOf',
          args: [wallet.account, BigInt(assetId)],
        });
        return { assetId, balance: balance.toString() };
      }),
    );
    assetBalances.value = balances.filter((row) => row.balance !== '0');
  });
}

async function saveProfile(): Promise<void> {
  if (!wallet.connected) {
    setMessage('fail', 'Connect wallet first.');
    return;
  }

  if (form.mode === 0 || form.mode === 2) {
    form.spendingPublicKey = '';
    form.viewingPublicKey = '';
  }

  const spendingPublicKey = form.spendingPublicKey || ZERO_HASH;
  const viewingPublicKey = form.viewingPublicKey || ZERO_HASH;
  const metadataHash = form.metadataHash || ZERO_HASH;

  if (
    !isBytes32(spendingPublicKey) ||
    !isBytes32(viewingPublicKey) ||
    !isBytes32(metadataHash)
  ) {
    setMessage('fail', 'Keys and metadata hash must be bytes32 values.');
    return;
  }

  submitting.value = true;
  clearNotice();

  try {
    const walletClient = wallet.walletClient();
    const [account] = await walletClient.getAddresses();

    const txHash = await runWrite(
      () =>
        walletClient.writeContract({
          chain: adiChain,
          account,
          address: appConfig.issuanceRegistry,
          abi: issuanceRegistryAbi,
          functionName: 'setMyPrivacyConfiguration',
          args: [
            {
              mode: form.mode,
              spendingPublicKey: spendingPublicKey as Hex,
              viewingPublicKey: viewingPublicKey as Hex,
              metadataHash: metadataHash as Hex,
              schemaVersion: Number(form.schemaVersion),
            },
          ],
        }),
      { abi: issuanceRegistryAbi },
    );

    setMessage('ok', `Profile updated in tx ${txHash}.`);
    await refresh();
  } catch (cause) {
    captureError(cause);
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  await refresh();
});
</script>
