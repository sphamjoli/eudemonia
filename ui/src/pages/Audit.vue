<template>
  <section class="page-wrap">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Role · Audit</p>
        <h2 class="page-title">Audit Dashboard</h2>
        <p class="page-subtitle">
          Request-to-proof-to-settlement traceability with selective evidence review.
        </p>
      </div>
      <button
        class="btn-subtle"
        type="button"
        :disabled="loading"
        @click="refresh"
      >
        Refresh
      </button>
    </header>

    <AppTabs
      :model-value="activeTab"
      :tabs="tabs"
      aria-label="Audit workspace tabs"
      @update:model-value="activeTab = $event as AuditTab"
    />

    <section class="kpi-grid">
      <article class="kpi-card">
        <p>Total Requests</p>
        <strong>{{ filteredRequests.length }}</strong>
      </article>
      <article class="kpi-card">
        <p>Executed</p>
        <strong>{{ executedCount }}</strong>
      </article>
      <article class="kpi-card">
        <p>Cancelled</p>
        <strong>{{ cancelledCount }}</strong>
      </article>
      <article class="kpi-card">
        <p>Next Settlement Note</p>
        <strong>{{ nextNoteIdentifier }}</strong>
      </article>
    </section>

    <section class="panel">
      <header class="panel-head">
        <h3 class="panel-title">Demo Steps</h3>
        <p class="panel-note">Quick audit walkthrough for live demos.</p>
      </header>
      <ol class="flow-list">
        <li>Issuer selects a Redis source instruction and submits request.</li>
        <li>Attestors sign and worker executes proof pipeline.</li>
        <li>Trace tab confirms request, proof, execution, and receipt linkage.</li>
        <li>Settlement tab verifies mode-aware note data.</li>
      </ol>
    </section>

    <section
      v-if="activeTab === 'trace'"
      class="tab-panel"
    >
      <section class="panel-grid">
        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Trace Filters</h3>
            <p class="panel-note">Narrow by request identifier and privacy mode.</p>
          </header>

          <div class="form-grid">
            <div class="field">
              <label>Request Identifier</label>
              <input
                v-model="filters.requestIdentifier"
                type="number"
                min="1"
                placeholder="All"
              />
            </div>
            <div class="field">
              <label>Privacy Mode</label>
              <select v-model="filters.privacyMode">
                <option value="ALL">All</option>
                <option
                  v-for="mode in privacyFilterModes"
                  :key="mode.value"
                  :value="mode.value"
                >
                  {{ mode.label }}
                </option>
              </select>
            </div>
          </div>
        </article>

        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Trace Summary</h3>
            <p class="panel-note">
              Indexed proof/execution coverage for current filter.
            </p>
          </header>

          <div class="form-grid">
            <div class="field">
              <label>Proof Jobs</label>
              <input
                :value="proofJobs.length"
                readonly
              />
            </div>
            <div class="field">
              <label>Executions</label>
              <input
                :value="executions.length"
                readonly
              />
            </div>
            <div class="field">
              <label>Receipts</label>
              <input
                :value="receipts.length"
                readonly
              />
            </div>
            <div class="field">
              <label>Settlements</label>
              <input
                :value="settlements.length"
                readonly
              />
            </div>
          </div>
        </article>
      </section>

      <section class="panel">
        <header class="panel-head">
          <h3 class="panel-title">Request Trace Matrix</h3>
          <p class="panel-note">
            Request, proof job, execution, receipt, and settlement binding by request
            id.
          </p>
        </header>

        <div
          v-if="filteredRequests.length === 0"
          class="empty-state"
        >
          No rows match current filters.
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
                <th>Status</th>
                <th>Proof Job</th>
                <th>Execution</th>
                <th>Audit Receipt</th>
                <th>Settlement</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="request in filteredRequests"
                :key="request.id"
              >
                <td>
                  <div class="inline-mono">{{ request.requestIdentifier }}</div>
                  <div class="inline-mono">{{ shortHex(request.parametersHash) }}</div>
                </td>
                <td>{{ privacyModeLabelFromKey(request.privacyMode) }}</td>
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
                <td>
                  <span
                    class="badge"
                    :class="proofBadgeClass(request.requestIdentifier)"
                  >
                    {{ proofByRequest.get(request.requestIdentifier)?.status ?? 'N/A' }}
                  </span>
                </td>
                <td>
                  <div v-if="executionByRequest.get(request.requestIdentifier)">
                    <a
                      v-if="
                        txLink(
                          executionByRequest.get(request.requestIdentifier)?.txHash,
                        )
                      "
                      :href="
                        txLink(
                          executionByRequest.get(request.requestIdentifier)?.txHash,
                        )
                      "
                      target="_blank"
                      rel="noreferrer"
                      class="link-action"
                    >
                      Tx
                    </a>
                    <span class="inline-mono">{{
                      shortHex(
                        executionByRequest.get(request.requestIdentifier)?.txHash ?? '',
                      )
                    }}</span>
                  </div>
                  <span
                    v-else
                    class="badge warn"
                    >Pending</span
                  >
                </td>
                <td>
                  <div v-if="receiptByRequest.get(request.requestIdentifier)">
                    <span class="inline-mono">{{
                      shortHex(
                        receiptByRequest.get(request.requestIdentifier)?.txHash ?? '',
                      )
                    }}</span>
                  </div>
                  <span
                    v-else
                    class="badge warn"
                    >Pending</span
                  >
                </td>
                <td>
                  <div v-if="settlementByRequest.get(request.requestIdentifier)">
                    <span class="inline-mono">{{
                      shortHex(
                        settlementByRequest.get(request.requestIdentifier)?.txHash ??
                          '',
                      )
                    }}</span>
                  </div>
                  <span
                    v-else
                    class="badge"
                    >n/a</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>

    <section
      v-if="activeTab === 'settlement'"
      class="tab-panel"
    >
      <section class="panel-grid">
        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Settlement Verifier</h3>
            <p class="panel-note">Direct reads from ConfidentialSettlement.</p>
          </header>

          <div class="form-grid">
            <div class="field">
              <label>Note Identifier</label>
              <input
                v-model="settlementForm.noteIdentifier"
                type="number"
                min="1"
              />
            </div>
            <div class="field">
              <label>Nullifier (bytes32)</label>
              <input
                v-model="settlementForm.nullifier"
                class="inline-mono"
                placeholder="0x..."
              />
            </div>
          </div>

          <div class="form-actions">
            <button
              class="btn-subtle"
              type="button"
              @click="checkNote"
            >
              Load Note
            </button>
            <button
              class="btn-subtle"
              type="button"
              @click="checkNullifier"
            >
              Check Nullifier
            </button>
            <span
              v-if="nullifierUsed !== null"
              class="badge warn"
            >
              Nullifier Used: {{ nullifierUsed ? 'Yes' : 'No' }}
            </span>
          </div>

          <details
            v-if="selectedNoteRaw"
            class="advanced-panel"
          >
            <summary>Selected Note Details</summary>
            <div class="advanced-content">
              <div class="form-grid">
                <div class="field">
                  <label>Request</label>
                  <input
                    :value="selectedNoteRaw.requestIdentifier"
                    readonly
                  />
                </div>
                <div class="field">
                  <label>Policy</label>
                  <input
                    :value="selectedNoteRaw.policyIdentifier"
                    readonly
                  />
                </div>
                <div class="field full">
                  <label>Issuer</label>
                  <input
                    :value="selectedNoteRaw.issuer"
                    readonly
                    class="inline-mono"
                  />
                </div>
                <div class="field full">
                  <label>Subject</label>
                  <input
                    :value="selectedNoteRaw.subject"
                    readonly
                    class="inline-mono"
                  />
                </div>
                <div class="field full">
                  <label>Beneficiary</label>
                  <input
                    :value="selectedNoteRaw.beneficiary"
                    readonly
                    class="inline-mono"
                  />
                </div>
                <div class="field">
                  <label>Amount</label>
                  <input
                    :value="selectedNoteRaw.amount"
                    readonly
                  />
                </div>
                <div class="field">
                  <label>Privacy Mode</label>
                  <input
                    :value="selectedNoteRaw.privacyMode"
                    readonly
                  />
                </div>
              </div>
            </div>
          </details>
        </article>

        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Settlement Timeline</h3>
            <p class="panel-note">Indexed settlement notes and execution linkage.</p>
          </header>

          <div
            v-if="settlements.length === 0"
            class="empty-state"
          >
            No settlement notes indexed yet.
          </div>

          <div
            v-else
            class="table-wrap"
          >
            <table class="data-table">
              <thead>
                <tr>
                  <th>Note</th>
                  <th>Request</th>
                  <th>Mode</th>
                  <th>Beneficiary</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in settlements"
                  :key="row.id"
                >
                  <td class="inline-mono">{{ row.noteIdentifier }}</td>
                  <td class="inline-mono">{{ row.requestIdentifier }}</td>
                  <td>{{ privacyModeLabelFromKey(row.privacyMode) }}</td>
                  <td class="inline-mono">{{ shortHex(row.beneficiary) }}</td>
                  <td>{{ row.amount }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </section>

    <section
      v-if="activeTab === 'evidence'"
      class="tab-panel"
    >
      <section class="panel-grid">
        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Raw Event Timeline</h3>
            <p class="panel-note">Append-only event trail from indexed contracts.</p>
          </header>

          <div
            v-if="events.length === 0"
            class="empty-state"
          >
            No events indexed yet.
          </div>

          <div
            v-else
            class="table-wrap"
          >
            <table class="data-table">
              <thead>
                <tr>
                  <th>Block</th>
                  <th>Contract</th>
                  <th>Event</th>
                  <th>Tx</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="event in events"
                  :key="event.id"
                >
                  <td>{{ event.blockNumber }}</td>
                  <td>{{ event.contractName }}</td>
                  <td>{{ event.eventName }}</td>
                  <td>
                    <a
                      v-if="txLink(event.txHash)"
                      :href="txLink(event.txHash)"
                      target="_blank"
                      rel="noreferrer"
                      class="link-action"
                    >
                      Explorer
                    </a>
                    <span class="inline-mono">{{ shortHex(event.txHash) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="panel-stack">
          <article class="panel">
            <header class="panel-head">
              <h3 class="panel-title">Proof Jobs</h3>
              <p class="panel-note">
                Operational evidence for prover state transitions.
              </p>
            </header>

            <div
              v-if="proofJobs.length === 0"
              class="empty-state"
            >
              No proof jobs indexed yet.
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
                    <th>Attempts</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="job in proofJobs"
                    :key="job.id"
                  >
                    <td class="inline-mono">{{ job.requestIdentifier }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="proofStatusBadge(job.status)"
                        >{{ job.status }}</span
                      >
                    </td>
                    <td>{{ job.attemptCount }}</td>
                    <td>{{ job.lastError || 'n/a' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <article class="panel">
            <header class="panel-head">
              <h3 class="panel-title">Receipts</h3>
              <p class="panel-note">
                Onchain audit receipts linked to request and policy.
              </p>
            </header>

            <div
              v-if="receipts.length === 0"
              class="empty-state"
            >
              No receipts indexed yet.
            </div>
            <div
              v-else
              class="table-wrap"
            >
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Request</th>
                    <th>Policy</th>
                    <th>Mode</th>
                    <th>Tx</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in receipts"
                    :key="row.id"
                  >
                    <td class="inline-mono">{{ row.requestIdentifier }}</td>
                    <td class="inline-mono">{{ row.policyIdentifier }}</td>
                    <td>{{ privacyModeLabelFromKey(row.privacyMode) }}</td>
                    <td class="inline-mono">{{ shortHex(row.txHash) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </article>
      </section>
    </section>

    <p
      v-if="error"
      class="message fail"
    >
      {{ error }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { isHex, zeroAddress, type Hex } from 'viem';
import AppTabs from '../components/AppTabs.vue';
import {
  confidentialSettlementAbi,
  PRIVACY_MODES,
  privacyModeLabel,
  privacyModeLabelFromKey,
  publicClient,
} from '../lib/adi';
import { appConfig } from '../lib/config';
import {
  fetchAuditBundle,
  type IndexedIssuanceExecution,
  type IndexedIssuanceReceipt,
  type IndexedIssuanceRequest,
  type IndexedProofJob,
  type IndexedRawEvent,
  type IndexedSettlementNote,
} from '../lib/indexer';
import { shortHex } from '../lib/format';
import { useProcessStore } from '../stores/useProcessStore';

type AuditTab = 'trace' | 'settlement' | 'evidence';

const tabs: Array<{ key: AuditTab; label: string }> = [
  { key: 'trace', label: 'Trace' },
  { key: 'settlement', label: 'Settlement' },
  { key: 'evidence', label: 'Evidence' },
];

const activeTab = ref<AuditTab>('trace');

const processStore = useProcessStore();

const loading = ref(false);
const error = ref('');
const nextNoteIdentifier = ref('n/a');
const nullifierUsed = ref<boolean | null>(null);
const selectedNoteRaw = ref<{
  requestIdentifier: string;
  policyIdentifier: string;
  issuer: string;
  subject: string;
  beneficiary: string;
  amount: string;
  privacyMode: string;
} | null>(null);

const requests = ref<IndexedIssuanceRequest[]>([]);
const executions = ref<IndexedIssuanceExecution[]>([]);
const receipts = ref<IndexedIssuanceReceipt[]>([]);
const settlements = ref<IndexedSettlementNote[]>([]);
const proofJobs = ref<IndexedProofJob[]>([]);
const events = ref<IndexedRawEvent[]>([]);

const filters = reactive({
  requestIdentifier: '',
  privacyMode: 'ALL',
});

const settlementForm = reactive({
  noteIdentifier: '',
  nullifier: '',
});

const privacyFilterModes = PRIVACY_MODES.map((mode) => ({
  value: mode.key,
  label: mode.label,
}));

const executionByRequest = computed(() => {
  const map = new Map<string, IndexedIssuanceExecution>();
  for (const row of executions.value) map.set(row.requestIdentifier, row);
  return map;
});

const receiptByRequest = computed(() => {
  const map = new Map<string, IndexedIssuanceReceipt>();
  for (const row of receipts.value) map.set(row.requestIdentifier, row);
  return map;
});

const settlementByRequest = computed(() => {
  const map = new Map<string, IndexedSettlementNote>();
  for (const row of settlements.value) map.set(row.requestIdentifier, row);
  return map;
});

const proofByRequest = computed(() => {
  const map = new Map<string, IndexedProofJob>();
  for (const row of proofJobs.value) map.set(row.requestIdentifier, row);
  return map;
});

const filteredRequests = computed(() => {
  return requests.value.filter((request) => {
    if (
      filters.requestIdentifier &&
      request.requestIdentifier !== filters.requestIdentifier
    ) {
      return false;
    }

    if (filters.privacyMode !== 'ALL' && request.privacyMode !== filters.privacyMode) {
      return false;
    }

    return true;
  });
});

const executedCount = computed(
  () =>
    filteredRequests.value.filter((request) => request.status === 'CONSUMED').length,
);
const cancelledCount = computed(
  () =>
    filteredRequests.value.filter((request) => request.status === 'CANCELLED').length,
);

function txLink(hash?: string): string | undefined {
  if (!hash || !appConfig.explorerBaseUrl) return undefined;
  return `${appConfig.explorerBaseUrl.replace(/\/$/, '')}/tx/${hash}`;
}

function proofBadgeClass(requestIdentifier: string): 'ok' | 'warn' | 'fail' {
  const status = proofByRequest.value.get(requestIdentifier)?.status;
  if (status === 'COMPLETED') return 'ok';
  if (status === 'DEAD_LETTER') return 'fail';
  return 'warn';
}

function proofStatusBadge(status: IndexedProofJob['status']): 'ok' | 'warn' | 'fail' {
  if (status === 'COMPLETED') return 'ok';
  if (status === 'DEAD_LETTER') return 'fail';
  return 'warn';
}

async function refresh(): Promise<void> {
  loading.value = true;
  error.value = '';

  try {
    await processStore.runQuickTask(async () => {
      const bundle = await fetchAuditBundle(200);
      requests.value = bundle.requests;
      executions.value = bundle.executions;
      receipts.value = bundle.receipts;
      settlements.value = bundle.settlements;
      proofJobs.value = bundle.proofJobs;
      events.value = bundle.rawEvents;

      if (appConfig.confidentialSettlement !== zeroAddress) {
        const nextIdentifier = await publicClient.readContract({
          address: appConfig.confidentialSettlement,
          abi: confidentialSettlementAbi,
          functionName: 'nextNoteIdentifier',
        });
        nextNoteIdentifier.value = String(nextIdentifier);
      }
    });
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}

async function checkNote(): Promise<void> {
  if (appConfig.confidentialSettlement === zeroAddress) {
    error.value = 'Confidential settlement address is not configured.';
    return;
  }

  if (!settlementForm.noteIdentifier) {
    error.value = 'Provide note identifier first.';
    return;
  }

  try {
    await processStore.runQuickTask(async () => {
      const note = await publicClient.readContract({
        address: appConfig.confidentialSettlement,
        abi: confidentialSettlementAbi,
        functionName: 'getNote',
        args: [BigInt(settlementForm.noteIdentifier)],
      });

      selectedNoteRaw.value = {
        requestIdentifier: note.requestIdentifier.toString(),
        policyIdentifier: note.policyIdentifier.toString(),
        issuer: note.issuer,
        subject: note.subject,
        beneficiary: note.beneficiary,
        amount: note.amount.toString(),
        privacyMode: privacyModeLabel(Number(note.privacyMode)),
      };
    });
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  }
}

async function checkNullifier(): Promise<void> {
  if (appConfig.confidentialSettlement === zeroAddress) {
    error.value = 'Confidential settlement address is not configured.';
    return;
  }

  if (!isHex(settlementForm.nullifier) || settlementForm.nullifier.length !== 66) {
    error.value = 'Nullifier must be bytes32 hex.';
    return;
  }

  try {
    nullifierUsed.value = await processStore.runQuickTask(async () =>
      publicClient.readContract({
        address: appConfig.confidentialSettlement,
        abi: confidentialSettlementAbi,
        functionName: 'isNullifierUsed',
        args: [settlementForm.nullifier as Hex],
      }),
    );
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  }
}

onMounted(async () => {
  await refresh();
});
</script>
