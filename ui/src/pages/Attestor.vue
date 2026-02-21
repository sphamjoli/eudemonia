<template>
  <section class="page-wrap">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Role · Attestor</p>
        <h2 class="page-title">Attestor Console</h2>
        <p class="page-subtitle">
          Review pending requests and sign EIP-712 attestations for proof generation.
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

    <AppTabs
      :model-value="activeTab"
      :tabs="tabs"
      aria-label="Attestor workspace tabs"
      @update:model-value="activeTab = $event as AttestorTab"
    />

    <section class="kpi-grid">
      <article class="kpi-card">
        <p>Pending Requests</p>
        <strong>{{ pendingRequests.length }}</strong>
      </article>
      <article class="kpi-card">
        <p>Signed This Session</p>
        <strong>{{ signedHistory.length }}</strong>
      </article>
      <article class="kpi-card">
        <p>Policy Valid Now</p>
        <strong>{{ policyValidNow ? 'Yes' : 'No' }}</strong>
      </article>
      <article class="kpi-card">
        <p>Worker API</p>
        <strong>{{ workerApiOnline ? 'Online' : 'Offline' }}</strong>
      </article>
    </section>

    <section
      v-if="activeTab === 'queue'"
      class="tab-panel"
    >
      <section class="panel-grid">
        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Pending Requests</h3>
            <p class="panel-note">Indexed requests with status REQUESTED.</p>
          </header>

          <div
            v-if="pendingRequests.length === 0"
            class="empty-state"
          >
            No pending requests available.
          </div>

          <div
            v-else
            class="table-wrap"
          >
            <table class="data-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Mode</th>
                  <th>Subject</th>
                  <th>Parameters Hash</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="request in pendingRequests"
                  :key="request.id"
                >
                  <td class="inline-mono">{{ request.requestIdentifier }}</td>
                  <td>{{ request.privacyMode }}</td>
                  <td class="inline-mono">{{ shortHex(request.subject) }}</td>
                  <td class="inline-mono">{{ shortHex(request.parametersHash) }}</td>
                  <td>
                    <button
                      class="btn-subtle"
                      type="button"
                      @click="selectRequest(request)"
                    >
                      Select
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Sign Attestation</h3>
            <p class="panel-note">
              Local wallet signing with optional Redis persistence.
            </p>
          </header>

          <div class="form-grid">
            <div class="field">
              <label>Request Identifier</label>
              <input
                v-model="signForm.requestIdentifier"
                type="number"
                min="1"
              />
            </div>

            <div class="field">
              <label>Policy Identifier</label>
              <input
                v-model="signForm.policyIdentifier"
                type="number"
                min="1"
              />
            </div>

            <div class="field full">
              <label>Parameters Hash</label>
              <input
                v-model="signForm.parametersHash"
                class="inline-mono"
              />
            </div>

            <div class="field">
              <label>Privacy Mode</label>
              <select v-model.number="signForm.privacyMode">
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
              <label>Issued At (unix)</label>
              <input
                v-model="signForm.issuedAt"
                type="number"
                min="0"
              />
            </div>

            <div class="field full">
              <label>Digest (derived)</label>
              <input
                :value="typedDigestPreview"
                class="inline-mono"
                readonly
              />
            </div>
          </div>

          <details class="advanced-panel">
            <summary>Advanced Payload</summary>
            <div class="advanced-content">
              <div class="form-grid">
                <div class="field full">
                  <label>Attestation JSON</label>
                  <textarea
                    v-model="signedPayload"
                    class="inline-mono"
                  />
                </div>
              </div>
            </div>
          </details>

          <div class="form-actions">
            <label class="badge warn">
              <input
                v-model="persistToRedis"
                type="checkbox"
              />
              Persist to Redis
            </label>
            <button
              class="btn-primary"
              type="button"
              :disabled="submitting || !wallet.connected"
              @click="signAttestation"
            >
              Sign EIP-712
            </button>
            <button
              class="btn-subtle"
              type="button"
              :disabled="!signedPayload"
              @click="copyPayload"
            >
              Copy JSON
            </button>
          </div>
        </article>
      </section>
    </section>

    <section
      v-if="activeTab === 'signed'"
      class="tab-panel"
    >
      <section class="panel-grid">
        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Signed Attestations</h3>
            <p class="panel-note">Session history for generated EIP-712 signatures.</p>
          </header>

          <div
            v-if="signedHistory.length === 0"
            class="empty-state"
          >
            No signatures generated yet in this session.
          </div>

          <div
            v-else
            class="table-wrap"
          >
            <table class="data-table">
              <thead>
                <tr>
                  <th>Signed At</th>
                  <th>Request</th>
                  <th>Policy</th>
                  <th>Attestor</th>
                  <th>Digest</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="entry in signedHistory"
                  :key="entry.id"
                >
                  <td>{{ entry.signedAt }}</td>
                  <td class="inline-mono">{{ entry.requestIdentifier }}</td>
                  <td class="inline-mono">{{ entry.policyIdentifier }}</td>
                  <td class="inline-mono">{{ shortHex(entry.attestor) }}</td>
                  <td class="inline-mono">{{ shortHex(entry.digest) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Latest Payload</h3>
            <p class="panel-note">
              Use this JSON for debugging or manual worker replay.
            </p>
          </header>

          <div class="form-grid">
            <div class="field full">
              <label>Attestation JSON</label>
              <textarea
                :value="signedPayload"
                class="inline-mono"
                readonly
              />
            </div>
          </div>

          <div class="form-actions">
            <button
              class="btn-subtle"
              type="button"
              :disabled="!signedPayload"
              @click="copyPayload"
            >
              Copy Latest JSON
            </button>
          </div>
        </article>
      </section>
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
import {
  encodeAbiParameters,
  hashTypedData,
  keccak256,
  type Address,
  type Hex,
  zeroAddress,
} from 'viem';
import AppTabs from '../components/AppTabs.vue';
import { appConfig } from '../lib/config';
import { policyRegistryAbi, PRIVACY_MODES, publicClient } from '../lib/adi';
import {
  fetchActivePolicy,
  fetchIssuanceRequests,
  type IndexedIssuanceRequest,
  type IndexedPolicy,
} from '../lib/indexer';
import { pingWorkerApi, setRedisValue } from '../lib/workerApi';
import { isBytes32, shortHex } from '../lib/format';
import { useProcessStore } from '../stores/useProcessStore';
import { useWalletStore } from '../stores/useWalletStore';

type AttestorTab = 'queue' | 'signed';

interface SignedHistoryRow {
  id: string;
  requestIdentifier: string;
  policyIdentifier: string;
  digest: string;
  attestor: string;
  signedAt: string;
}

const tabs: Array<{ key: AttestorTab; label: string }> = [
  { key: 'queue', label: 'Queue' },
  { key: 'signed', label: 'Signed' },
];

const activeTab = ref<AttestorTab>('queue');

const wallet = useWalletStore();
const processStore = useProcessStore();

const activePolicy = ref<IndexedPolicy | null>(null);
const pendingRequests = ref<IndexedIssuanceRequest[]>([]);
const workerApiOnline = ref(false);
const policyValidNow = ref(false);
const signedHistory = ref<SignedHistoryRow[]>([]);

const submitting = ref(false);
const message = ref('');
const messageKind = ref<'ok' | 'fail'>('ok');
const signedPayload = ref('');
const persistToRedis = ref(true);

const signForm = reactive({
  requestIdentifier: '',
  policyIdentifier: '',
  parametersHash: '',
  privacyMode: 0,
  issuedAt: `${Math.floor(Date.now() / 1000)}`,
});

const typedDigestPreview = computed(() => {
  if (!isBytes32(signForm.parametersHash)) {
    return 'invalid parametersHash';
  }

  return hashTypedData({
    domain: {
      name: 'EudemoniaAttestation',
      version: '1',
      chainId: appConfig.chainId,
      verifyingContract: appConfig.issuanceRegistry,
    },
    primaryType: 'IssuanceAttestation',
    types: {
      IssuanceAttestation: [
        { name: 'requestIdentifier', type: 'uint256' },
        { name: 'policyIdentifier', type: 'uint256' },
        { name: 'parametersHash', type: 'bytes32' },
        { name: 'privacyMode', type: 'uint8' },
        { name: 'issuedAt', type: 'uint64' },
      ],
    },
    message: {
      requestIdentifier: BigInt(signForm.requestIdentifier || '0'),
      policyIdentifier: BigInt(signForm.policyIdentifier || '0'),
      parametersHash: signForm.parametersHash as Hex,
      privacyMode: signForm.privacyMode,
      issuedAt: BigInt(signForm.issuedAt || '0'),
    },
  });
});

function setMessage(kind: 'ok' | 'fail', text: string): void {
  messageKind.value = kind;
  message.value = text;
}

function captureError(cause: unknown): void {
  const text = cause instanceof Error ? cause.message : String(cause);
  setMessage('fail', text || 'Attestation signing failed.');
}

async function refresh(): Promise<void> {
  await processStore.runQuickTask(async () => {
    const [rows, policy, workerUp] = await Promise.all([
      fetchIssuanceRequests(120),
      fetchActivePolicy(),
      pingWorkerApi(),
    ]);

    pendingRequests.value = rows.filter((request) => request.status === 'REQUESTED');
    activePolicy.value = policy;
    workerApiOnline.value = workerUp;

    if (policy?.policyIdentifier && appConfig.policyRegistry !== zeroAddress) {
      signForm.policyIdentifier = policy.policyIdentifier;

      policyValidNow.value = await publicClient.readContract({
        address: appConfig.policyRegistry,
        abi: policyRegistryAbi,
        functionName: 'isPolicyValidAt',
        args: [BigInt(policy.policyIdentifier), BigInt(Math.floor(Date.now() / 1000))],
      });
    } else {
      policyValidNow.value = false;
    }
  });
}

function selectRequest(request: IndexedIssuanceRequest): void {
  signForm.requestIdentifier = request.requestIdentifier;
  signForm.parametersHash = request.parametersHash;
  signForm.privacyMode =
    PRIVACY_MODES.find((mode) => mode.key === request.privacyMode)?.value ?? 0;
  if (activePolicy.value) {
    signForm.policyIdentifier = activePolicy.value.policyIdentifier;
  }
}

async function signAttestation(): Promise<void> {
  if (appConfig.issuanceRegistry === zeroAddress) {
    setMessage('fail', 'Issuance registry address is not configured.');
    return;
  }

  if (
    !signForm.requestIdentifier ||
    !signForm.policyIdentifier ||
    !isBytes32(signForm.parametersHash)
  ) {
    setMessage('fail', 'Request ID, policy ID, and parametersHash are required.');
    return;
  }

  submitting.value = true;
  message.value = '';

  try {
    if (!wallet.connected) {
      throw new Error('Connect wallet first.');
    }

    const walletClient = wallet.walletClient();
    const [account] = await walletClient.getAddresses();

    const signature = await processStore.runQuickTask(async () =>
      walletClient.signTypedData({
        account,
        domain: {
          name: 'EudemoniaAttestation',
          version: '1',
          chainId: appConfig.chainId,
          verifyingContract: appConfig.issuanceRegistry,
        },
        primaryType: 'IssuanceAttestation',
        types: {
          IssuanceAttestation: [
            { name: 'requestIdentifier', type: 'uint256' },
            { name: 'policyIdentifier', type: 'uint256' },
            { name: 'parametersHash', type: 'bytes32' },
            { name: 'privacyMode', type: 'uint8' },
            { name: 'issuedAt', type: 'uint64' },
          ],
        },
        message: {
          requestIdentifier: BigInt(signForm.requestIdentifier),
          policyIdentifier: BigInt(signForm.policyIdentifier),
          parametersHash: signForm.parametersHash as Hex,
          privacyMode: signForm.privacyMode,
          issuedAt: BigInt(signForm.issuedAt),
        },
      }),
    );

    const digest = typedDigestPreview.value;
    const leaf = keccak256(
      encodeAbiParameters([{ type: 'address' }], [account as Address]),
    );

    const record = {
      schemaVersion: 1,
      source: 'ui-attestor',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      requestId: signForm.requestIdentifier,
      attestor: account,
      signature,
      signedDigest: digest,
      merkleProof: [] as string[],
      leaf,
    };

    signedPayload.value = JSON.stringify(record, null, 2);

    if (persistToRedis.value) {
      const key = `attestation:request:${signForm.requestIdentifier}:attestor:${account.toLowerCase()}`;
      await processStore.runQuickTask(async () => {
        await setRedisValue(key, record);
      });
    }

    signedHistory.value = [
      {
        id: `${signForm.requestIdentifier}-${Date.now()}`,
        requestIdentifier: signForm.requestIdentifier,
        policyIdentifier: signForm.policyIdentifier,
        digest,
        attestor: account,
        signedAt: new Date().toLocaleString(),
      },
      ...signedHistory.value,
    ].slice(0, 100);

    activeTab.value = 'signed';
    setMessage('ok', 'Attestation signed successfully.');
  } catch (cause) {
    captureError(cause);
  } finally {
    submitting.value = false;
  }
}

async function copyPayload(): Promise<void> {
  if (!signedPayload.value) return;
  await navigator.clipboard.writeText(signedPayload.value);
  setMessage('ok', 'Attestation JSON copied.');
}

onMounted(async () => {
  await refresh();
});
</script>
