<template>
  <section class="page-wrap">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Role · Governance</p>
        <h2 class="page-title">Admin Console</h2>
        <p class="page-subtitle">
          Govern policies, manage participants, and monitor proof operations.
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
      aria-label="Admin workspace tabs"
      @update:model-value="activeTab = $event as AdminTab"
    />

    <section
      v-if="activeTab === 'overview'"
      class="tab-panel"
    >
      <section class="kpi-grid">
        <article class="kpi-card">
          <p>Onchain Active Policy</p>
          <strong>{{ onchainActivePolicyIdentifier || '—' }}</strong>
        </article>
        <article class="kpi-card">
          <p>Indexed Active Policy</p>
          <strong>{{ activePolicy?.policyIdentifier ?? '—' }}</strong>
        </article>
        <article class="kpi-card">
          <p>Total Policies</p>
          <strong>{{ policies.length }}</strong>
        </article>
        <article class="kpi-card">
          <p>Indexed Requests</p>
          <strong>{{ requestCount }}</strong>
        </article>
      </section>

      <section class="panel-grid">
        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Active Policy Snapshot</h3>
            <p class="panel-note">Current policy state and validity checks.</p>
          </header>

          <div
            v-if="activePolicy"
            class="form-grid"
          >
            <div class="field">
              <label>Policy Identifier</label
              ><input
                :value="activePolicy.policyIdentifier"
                readonly
              />
            </div>
            <div class="field">
              <label>Status</label
              ><input
                :value="activePolicy.status"
                readonly
              />
            </div>
            <div class="field full">
              <label>Policy Hash</label
              ><input
                :value="activePolicy.policyHash"
                readonly
                class="inline-mono"
              />
            </div>
            <div class="field full">
              <label>Attestor Root</label
              ><input
                :value="activePolicy.attestorSetRoot"
                readonly
                class="inline-mono"
              />
            </div>
            <div class="field full">
              <label>Onchain Policy Hash</label
              ><input
                :value="onchainPolicyHash"
                readonly
                class="inline-mono"
              />
            </div>
            <div class="field">
              <label>Onchain Valid Now</label
              ><input
                :value="onchainPolicyValidAtNow ? 'Yes' : 'No'"
                readonly
              />
            </div>
          </div>

          <p
            v-else
            class="empty-state"
          >
            No active policy found yet.
          </p>
        </article>

        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Operational Health</h3>
            <p class="panel-note">Indexer and worker proof pipeline snapshot.</p>
          </header>

          <div class="form-grid">
            <div class="field">
              <label>Worker Status</label>
              <input
                :value="workerStatus ? 'Online' : 'Offline'"
                readonly
              />
            </div>
            <div class="field">
              <label>Last Heartbeat</label>
              <input
                :value="formatTimestamp(workerStatus?.lastLoopCompletedAtMs ?? 0)"
                readonly
              />
            </div>
            <div class="field full">
              <label>Last Completed Proof Job</label>
              <input
                :value="lastCompletedSummary"
                readonly
              />
            </div>
            <div class="field full">
              <label>Last Failure</label>
              <input
                :value="lastFailureSummary"
                readonly
              />
            </div>
          </div>
        </article>
      </section>
    </section>

    <section
      v-if="activeTab === 'governance'"
      class="tab-panel"
    >
      <section class="panel-grid">
        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Create Policy</h3>
            <p class="panel-note">Writes to PolicyRegistry.createPolicy.</p>
          </header>

          <div class="form-grid">
            <div class="field full">
              <label>Policy Preimage</label>
              <textarea
                v-model="createPolicyForm.policyPreimage"
                placeholder="institution-v1|required-checks|freshness-windows"
              />
            </div>

            <div class="field">
              <label>Policy Hash (derived)</label>
              <input
                :value="derivedPolicyHash"
                readonly
                class="inline-mono"
              />
            </div>

            <div class="field">
              <label>Attestor Set Root (bytes32)</label>
              <input
                v-model="createPolicyForm.attestorSetRoot"
                class="inline-mono"
                placeholder="0x..."
              />
              <p class="field-note">
                Merkle root of authorized attestors. Must be non-zero.
              </p>
            </div>

            <div class="field">
              <label>Attestor Threshold</label>
              <input
                v-model="createPolicyForm.attestorThreshold"
                type="number"
                min="1"
              />
            </div>

            <div class="field">
              <label>Valid From</label>
              <VueDatePicker
                v-model="policyDates.validFrom"
                :enable-time-picker="true"
                :format="'yyyy-MM-dd HH:mm'"
                :minutes-increment="5"
                :teleport="true"
              />
            </div>

            <div class="field">
              <label>Valid Until</label>
              <VueDatePicker
                v-model="policyDates.validUntil"
                :enable-time-picker="true"
                :format="'yyyy-MM-dd HH:mm'"
                :minutes-increment="5"
                :teleport="true"
                :clearable="true"
                :disabled="createPolicyForm.openEnded"
              />
              <label class="badge warn">
                <input
                  v-model="createPolicyForm.openEnded"
                  type="checkbox"
                />
                Open-ended policy window
              </label>
            </div>
          </div>

          <div class="form-actions">
            <label class="badge warn">
              <input
                v-model="createPolicyForm.autoActivate"
                type="checkbox"
              />
              Auto-activate policy
            </label>
            <button
              class="btn-primary"
              type="button"
              :disabled="submitting"
              @click="createPolicy"
            >
              Create Policy
            </button>
          </div>
        </article>

        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Policy Privacy Constraints</h3>
            <p class="panel-note">
              Writes to PolicyRegistry.setPolicyPrivacyConstraints.
            </p>
          </header>

          <div class="form-grid">
            <div class="field">
              <label>Current Active Policy</label>
              <input
                :value="onchainActivePolicyIdentifier || '0'"
                readonly
              />
            </div>
            <div class="field">
              <label>Set Active Policy</label>
              <input
                v-model="activePolicyForm.policyIdentifier"
                type="number"
                min="1"
              />
            </div>
            <div class="field">
              <label>Policy Identifier (Active)</label>
              <input
                v-model="constraintsForm.policyIdentifier"
                type="number"
                min="1"
                readonly
              />
            </div>
            <div class="field">
              <label>Schema Version</label>
              <input
                v-model="constraintsForm.schemaVersion"
                type="number"
                min="1"
              />
            </div>
          </div>

          <div
            class="badge-row"
            style="margin-top: 0.75rem"
          >
            <label class="badge warn"
              ><input
                v-model="constraintsForm.allowNone"
                type="checkbox"
              />
              No Privacy</label
            >
            <label class="badge warn">
              <input
                v-model="constraintsForm.allowDestinationPrivate"
                type="checkbox"
              />
              Destination Private
            </label>
            <label class="badge warn">
              <input
                v-model="constraintsForm.allowAmountPrivate"
                type="checkbox"
              />
              Amount Private
            </label>
            <label class="badge warn"
              ><input
                v-model="constraintsForm.allowFullPrivate"
                type="checkbox"
              />
              Full Private</label
            >
            <label class="badge warn">
              <input
                v-model="constraintsForm.allowPerIssuanceOverride"
                type="checkbox"
              />
              Per-issuance override
            </label>
            <label class="badge warn">
              <input
                v-model="constraintsForm.allowConfigurationUpdates"
                type="checkbox"
              />
              Worker updates
            </label>
          </div>

          <div class="form-actions">
            <button
              class="btn-subtle"
              type="button"
              :disabled="submitting"
              @click="setActivePolicy"
            >
              Set Active Policy
            </button>
            <button
              class="btn-primary"
              type="button"
              :disabled="submitting"
              @click="updateConstraints"
            >
              Update Constraints
            </button>
          </div>
        </article>
      </section>
    </section>

    <section
      v-if="activeTab === 'users'"
      class="tab-panel"
    >
      <section class="panel-grid">
        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Participant Permissions</h3>
            <p class="panel-note">
              Writes to PaymentRegistry role and participant controls.
            </p>
          </header>

          <div class="form-grid">
            <div class="field full">
              <label>Participant Address</label>
              <input
                v-model="userForm.participant"
                class="inline-mono"
                placeholder="0x..."
              />
            </div>
            <div class="field">
              <label>Role</label>
              <select v-model="userForm.role">
                <option value="ADMIN">ADMIN</option>
                <option value="ISSUER">ISSUER</option>
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="ATTESTOR">ATTESTOR</option>
                <option value="AUDITOR">AUDITOR</option>
              </select>
            </div>
            <div class="field">
              <label>Profile Hash (bytes32)</label>
              <input
                v-model="userForm.profileHash"
                class="inline-mono"
                placeholder="0x..."
              />
            </div>
          </div>

          <div class="form-actions">
            <button
              class="btn-subtle"
              type="button"
              :disabled="submitting"
              @click="setUserRole(true)"
            >
              Enable Role
            </button>
            <button
              class="btn-subtle"
              type="button"
              :disabled="submitting"
              @click="setUserRole(false)"
            >
              Disable Role
            </button>
            <button
              class="btn-subtle"
              type="button"
              :disabled="submitting"
              @click="setUserStatus(true)"
            >
              Set Active
            </button>
            <button
              class="btn-subtle"
              type="button"
              :disabled="submitting"
              @click="setUserStatus(false)"
            >
              Set Inactive
            </button>
            <button
              class="btn-primary"
              type="button"
              :disabled="submitting"
              @click="setUserProfile"
            >
              Save Profile Hash
            </button>
          </div>
        </article>

        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Participants</h3>
            <p class="panel-note">
              Indexed participant state from PaymentRegistry events.
            </p>
          </header>

          <div
            v-if="participants.length === 0"
            class="empty-state"
          >
            No participants indexed yet.
          </div>

          <div
            v-else
            class="table-wrap"
          >
            <table class="data-table">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Role Mask</th>
                  <th>Active</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in participants"
                  :key="row.id"
                >
                  <td class="inline-mono">{{ shortHex(row.participant) }}</td>
                  <td class="inline-mono">{{ row.roleMask }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="row.active ? 'ok' : 'warn'"
                      >{{ row.active ? 'Yes' : 'No' }}</span
                    >
                  </td>
                  <td>{{ formatTimestamp(row.updatedAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </section>

    <section
      v-if="activeTab === 'proofOps'"
      class="tab-panel"
    >
      <section class="kpi-grid">
        <article class="kpi-card">
          <p>Pending</p>
          <strong>{{ proofCounts.pending }}</strong>
        </article>
        <article class="kpi-card">
          <p>Running</p>
          <strong>{{ proofCounts.running }}</strong>
        </article>
        <article class="kpi-card">
          <p>Retry</p>
          <strong>{{ proofCounts.retry }}</strong>
        </article>
        <article class="kpi-card">
          <p>Dead Letter</p>
          <strong>{{ proofCounts.deadLetter }}</strong>
        </article>
        <article class="kpi-card">
          <p>Completed</p>
          <strong>{{ proofCounts.completed }}</strong>
        </article>
      </section>

      <section class="panel-grid">
        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Worker Runtime</h3>
            <p class="panel-note">Live poller heartbeat from worker admin API.</p>
          </header>

          <div class="form-grid">
            <div class="field full">
              <label>Last Successful Execution</label>
              <input
                :value="lastCompletedSummary"
                readonly
              />
            </div>
            <div class="field full">
              <label>Latest Failure Signal</label>
              <input
                :value="lastFailureSummary"
                readonly
              />
            </div>
          </div>

          <div
            v-if="workerStatus"
            class="form-grid"
          >
            <div class="field">
              <label>Instance</label>
              <input
                :value="workerStatus.instanceId"
                readonly
              />
            </div>
            <div class="field">
              <label>Poll Interval (ms)</label>
              <input
                :value="workerStatus.pollIntervalMs"
                readonly
              />
            </div>
            <div class="field">
              <label>Last Poll</label>
              <input
                :value="formatTimestamp(workerStatus.lastPolledAtMs)"
                readonly
              />
            </div>
            <div class="field">
              <label>Jobs Last Poll</label>
              <input
                :value="workerStatus.lastPolledJobCount"
                readonly
              />
            </div>
            <div class="field full">
              <label>Last Processed Request</label>
              <input
                :value="workerStatus.lastProcessedRequestId ?? 'n/a'"
                readonly
                class="inline-mono"
              />
            </div>
            <div class="field full">
              <label>Last Error</label>
              <input
                :value="workerStatus.lastError ?? 'none'"
                readonly
              />
            </div>
          </div>
          <div
            v-else
            class="empty-state"
          >
            Worker status unavailable.
          </div>
        </article>

        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Proof Queue</h3>
            <p class="panel-note">Indexed `ProofJob` state by request.</p>
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
                  <th>Last Error</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="job in proofJobs"
                  :key="job.id"
                >
                  <td>{{ job.requestIdentifier }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="proofBadgeClass(job.status)"
                      >{{ job.status }}</span
                    >
                  </td>
                  <td>{{ job.attemptCount }}</td>
                  <td>{{ job.lastError ?? 'n/a' }}</td>
                  <td>{{ formatTimestamp(job.updatedAt) }}</td>
                </tr>
              </tbody>
            </table>
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
  isAddress,
  keccak256,
  toHex,
  type Abi,
  type Address,
  type Hex,
  zeroAddress,
} from 'viem';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import AppTabs from '../components/AppTabs.vue';
import { useNotice } from '../composables/useNotice';
import { useTxLifecycle } from '../composables/useTxLifecycle';
import { appConfig } from '../lib/config';
import {
  ZERO_HASH,
  adiChain,
  paymentRegistryAbi,
  policyRegistryAbi,
  publicClient,
} from '../lib/adi';
import {
  fetchIssuanceRequests,
  fetchPaymentParticipants,
  fetchPolicies,
  fetchProofJobs,
  type IndexedPaymentParticipant,
  type IndexedPolicy,
  type IndexedProofJob,
} from '../lib/indexer';
import { fetchWorkerStatus, type WorkerStatusSnapshot } from '../lib/workerApi';
import { isBytes32, shortHex } from '../lib/format';
import { useProcessStore } from '../stores/useProcessStore';
import { useWalletStore } from '../stores/useWalletStore';

type AdminTab = 'overview' | 'governance' | 'users' | 'proofOps';

type RegistryRole = 'ADMIN' | 'ISSUER' | 'EMPLOYEE' | 'ATTESTOR' | 'AUDITOR';

const tabs: Array<{ key: AdminTab; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'governance', label: 'Governance' },
  { key: 'users', label: 'Users' },
  { key: 'proofOps', label: 'Proof Ops' },
];

const activeTab = ref<AdminTab>('overview');

const wallet = useWalletStore();
const processStore = useProcessStore();

const policies = ref<IndexedPolicy[]>([]);
const participants = ref<IndexedPaymentParticipant[]>([]);
const proofJobs = ref<IndexedProofJob[]>([]);
const workerStatus = ref<WorkerStatusSnapshot | null>(null);

const requestCount = ref(0);
const submitting = ref(false);
const { message, messageKind, clearNotice, setNotice, setFailure } = useNotice();
const { runWrite, toErrorMessage } = useTxLifecycle();

const onchainActivePolicyIdentifier = ref('');
const onchainPolicyHash = ref<Hex>(ZERO_HASH);
const onchainPolicyValidAtNow = ref(false);

const createPolicyForm = reactive({
  policyPreimage: 'institution-v1|required-checks|freshness-windows',
  attestorSetRoot: keccak256(toHex('eudemonia-attestors-v1')),
  attestorThreshold: '2',
  openEnded: true,
  autoActivate: true,
});

const policyDates = reactive({
  validFrom: new Date(),
  validUntil: null as Date | null,
});

const constraintsForm = reactive({
  policyIdentifier: '',
  allowNone: true,
  allowDestinationPrivate: true,
  allowAmountPrivate: true,
  allowFullPrivate: true,
  allowPerIssuanceOverride: true,
  allowConfigurationUpdates: true,
  schemaVersion: '1',
});

const activePolicyForm = reactive({
  policyIdentifier: '',
});

const userForm = reactive({
  participant: '',
  role: 'EMPLOYEE' as RegistryRole,
  profileHash: ZERO_HASH,
});

const activePolicy = computed(
  () => policies.value.find((policy) => policy.isActive) ?? null,
);

const derivedPolicyHash = computed<Hex>(() =>
  keccak256(toHex(createPolicyForm.policyPreimage)),
);

const proofCounts = computed(() => {
  const counts = {
    pending: 0,
    running: 0,
    retry: 0,
    completed: 0,
    deadLetter: 0,
  };

  for (const job of proofJobs.value) {
    if (job.status === 'PENDING') counts.pending += 1;
    if (job.status === 'RUNNING') counts.running += 1;
    if (job.status === 'RETRY') counts.retry += 1;
    if (job.status === 'COMPLETED') counts.completed += 1;
    if (job.status === 'DEAD_LETTER') counts.deadLetter += 1;
  }

  return counts;
});

const lastCompletedJob = computed(
  () => proofJobs.value.find((job) => job.status === 'COMPLETED') ?? null,
);
const lastFailureJob = computed(
  () =>
    proofJobs.value.find(
      (job) => job.status === 'DEAD_LETTER' || job.status === 'RETRY',
    ) ?? null,
);
const lastCompletedSummary = computed(() => {
  const job = lastCompletedJob.value;
  if (!job) return 'No completed jobs yet.';
  const tx = job.lastTxHash ? shortHex(job.lastTxHash) : 'n/a';
  return `Request ${job.requestIdentifier} · policy ${job.policyIdentifier} · tx ${tx} · ${formatTimestamp(job.updatedAt)}`;
});
const lastFailureSummary = computed(() => {
  const job = lastFailureJob.value;
  if (!job) return 'No active failures.';
  const reason = job.lastError ?? 'unknown failure';
  return `Request ${job.requestIdentifier} · ${job.status} · ${reason}`;
});

function setMessage(kind: 'ok' | 'fail', text: string): void {
  setNotice(kind, text);
}

function roleIndex(role: RegistryRole): number {
  if (role === 'ADMIN') return 0;
  if (role === 'ISSUER') return 1;
  if (role === 'EMPLOYEE') return 2;
  if (role === 'ATTESTOR') return 3;
  return 4;
}

function proofBadgeClass(status: IndexedProofJob['status']): string {
  if (status === 'COMPLETED') return 'ok';
  if (status === 'DEAD_LETTER') return 'fail';
  return 'warn';
}

function formatTimestamp(value: string | number): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 'n/a';

  const millis = numeric > 9999999999 ? numeric : numeric * 1000;
  return new Date(millis).toLocaleString();
}

function toUnixSeconds(value: Date | null): bigint {
  if (!value) return 0n;
  return BigInt(Math.floor(value.getTime() / 1000));
}

async function refresh(): Promise<void> {
  await processStore.runQuickTask(async () => {
    const [policyRows, requests, participantRows, jobRows] = await Promise.all([
      fetchPolicies(40),
      fetchIssuanceRequests(200),
      fetchPaymentParticipants(200),
      fetchProofJobs(120),
    ]);

    policies.value = policyRows;
    requestCount.value = requests.length;
    participants.value = participantRows;
    proofJobs.value = jobRows;

    try {
      workerStatus.value = await fetchWorkerStatus();
    } catch {
      workerStatus.value = null;
    }

    if (appConfig.policyRegistry !== zeroAddress) {
      const activePolicyIdentifier = await publicClient.readContract({
        address: appConfig.policyRegistry,
        abi: policyRegistryAbi,
        functionName: 'activePolicyIdentifier',
      });

      onchainActivePolicyIdentifier.value = activePolicyIdentifier.toString();
      constraintsForm.policyIdentifier =
        activePolicyIdentifier > 0n ? activePolicyIdentifier.toString() : '';
      activePolicyForm.policyIdentifier =
        activePolicyForm.policyIdentifier || activePolicyIdentifier.toString();

      if (activePolicyIdentifier > 0n) {
        const [policy, validNow, constraints] = await Promise.all([
          publicClient.readContract({
            address: appConfig.policyRegistry,
            abi: policyRegistryAbi,
            functionName: 'getPolicy',
            args: [activePolicyIdentifier],
          }),
          publicClient.readContract({
            address: appConfig.policyRegistry,
            abi: policyRegistryAbi,
            functionName: 'isPolicyValidAt',
            args: [activePolicyIdentifier, BigInt(Math.floor(Date.now() / 1000))],
          }),
          publicClient.readContract({
            address: appConfig.policyRegistry,
            abi: policyRegistryAbi,
            functionName: 'getPolicyPrivacyConstraints',
            args: [activePolicyIdentifier],
          }),
        ]);

        onchainPolicyHash.value = policy.policyHash;
        onchainPolicyValidAtNow.value = validNow;
        constraintsForm.allowNone = constraints.allowNone;
        constraintsForm.allowDestinationPrivate = constraints.allowDestinationPrivate;
        constraintsForm.allowAmountPrivate = constraints.allowAmountPrivate;
        constraintsForm.allowFullPrivate = constraints.allowFullPrivate;
        constraintsForm.allowPerIssuanceOverride = constraints.allowPerIssuanceOverride;
        constraintsForm.allowConfigurationUpdates =
          constraints.allowConfigurationUpdates;
        constraintsForm.schemaVersion = String(constraints.schemaVersion);
      } else {
        onchainPolicyHash.value = ZERO_HASH;
        onchainPolicyValidAtNow.value = false;
      }
    } else {
      onchainActivePolicyIdentifier.value = '';
      onchainPolicyHash.value = ZERO_HASH;
      onchainPolicyValidAtNow.value = false;
      constraintsForm.policyIdentifier = '';
    }
  });
}

async function submitTx(
  factory: () => Promise<`0x${string}`>,
  successMessage: string,
  options?: { abi?: Abi },
): Promise<void> {
  submitting.value = true;
  clearNotice();

  try {
    const txHash = await runWrite(factory, options);
    setMessage('ok', `${successMessage} Tx: ${txHash}`);
    await refresh();
  } catch (cause) {
    setFailure(toErrorMessage(cause));
  } finally {
    submitting.value = false;
  }
}

async function createPolicy(): Promise<void> {
  if (!isBytes32(createPolicyForm.attestorSetRoot)) {
    setMessage('fail', 'Attestor set root must be bytes32.');
    return;
  }
  if (createPolicyForm.attestorSetRoot.toLowerCase() === ZERO_HASH.toLowerCase()) {
    setMessage(
      'fail',
      'Attestor set root cannot be zero. Generate a non-zero Merkle root for your attestor set.',
    );
    return;
  }
  if (!policyDates.validFrom) {
    setMessage('fail', 'Valid from date is required.');
    return;
  }
  if (!createPolicyForm.openEnded && !policyDates.validUntil) {
    setMessage('fail', 'Valid until date is required when policy is not open-ended.');
    return;
  }

  submitting.value = true;
  clearNotice();

  try {
    const walletClient = wallet.walletClient();
    const [account] = await walletClient.getAddresses();
    const validFromTimestamp = toUnixSeconds(policyDates.validFrom);
    const validUntilTimestamp = createPolicyForm.openEnded
      ? 0n
      : toUnixSeconds(policyDates.validUntil);
    const createHash = await runWrite(
      () =>
        walletClient.writeContract({
          chain: adiChain,
          account,
          address: appConfig.policyRegistry,
          abi: policyRegistryAbi,
          functionName: 'createPolicy',
          args: [
            {
              policyHash: derivedPolicyHash.value,
              attestorSetRoot: createPolicyForm.attestorSetRoot as Hex,
              attestorThreshold: BigInt(createPolicyForm.attestorThreshold),
              validFromTimestamp,
              validUntilTimestamp,
            },
          ],
        }),
      { abi: policyRegistryAbi as Abi },
    );

    let activationHash: Hex | null = null;
    if (createPolicyForm.autoActivate) {
      const activeId = await publicClient.readContract({
        address: appConfig.policyRegistry,
        abi: policyRegistryAbi,
        functionName: 'nextPolicyIdentifier',
      });

      if (activeId > 1n) {
        activationHash = await runWrite(
          () =>
            walletClient.writeContract({
              chain: adiChain,
              account,
              address: appConfig.policyRegistry,
              abi: policyRegistryAbi,
              functionName: 'setActivePolicyIdentifier',
              args: [activeId - 1n],
            }),
          { abi: policyRegistryAbi as Abi },
        );
      }
    }

    if (activationHash) {
      setMessage(
        'ok',
        `Policy created and activated. Create tx: ${createHash} · Activate tx: ${activationHash}`,
      );
    } else {
      setMessage('ok', `Policy created. Tx: ${createHash}`);
    }
    await refresh();
  } catch (cause) {
    setFailure(toErrorMessage(cause));
  } finally {
    submitting.value = false;
  }
}

async function updateConstraints(): Promise<void> {
  await submitTx(
    async () => {
      const walletClient = wallet.walletClient();
      const [account] = await walletClient.getAddresses();
      return walletClient.writeContract({
        chain: adiChain,
        account,
        address: appConfig.policyRegistry,
        abi: policyRegistryAbi,
        functionName: 'setPolicyPrivacyConstraints',
        args: [
          BigInt(constraintsForm.policyIdentifier),
          {
            allowNone: constraintsForm.allowNone,
            allowDestinationPrivate: constraintsForm.allowDestinationPrivate,
            allowAmountPrivate: constraintsForm.allowAmountPrivate,
            allowFullPrivate: constraintsForm.allowFullPrivate,
            allowPerIssuanceOverride: constraintsForm.allowPerIssuanceOverride,
            allowConfigurationUpdates: constraintsForm.allowConfigurationUpdates,
            schemaVersion: Number(constraintsForm.schemaVersion),
          },
        ],
      });
    },
    'Policy constraints updated.',
    { abi: policyRegistryAbi as Abi },
  );
}

async function setActivePolicy(): Promise<void> {
  if (!activePolicyForm.policyIdentifier.trim()) {
    setMessage('fail', 'Set active policy requires a policy identifier.');
    return;
  }

  await submitTx(
    async () => {
      const walletClient = wallet.walletClient();
      const [account] = await walletClient.getAddresses();
      return walletClient.writeContract({
        chain: adiChain,
        account,
        address: appConfig.policyRegistry,
        abi: policyRegistryAbi,
        functionName: 'setActivePolicyIdentifier',
        args: [BigInt(activePolicyForm.policyIdentifier)],
      });
    },
    `Active policy set to ${activePolicyForm.policyIdentifier}.`,
    { abi: policyRegistryAbi as Abi },
  );
}

async function setUserRole(enabled: boolean): Promise<void> {
  if (!isAddress(userForm.participant)) {
    setMessage('fail', 'Participant address is invalid.');
    return;
  }

  await submitTx(
    async () => {
      const walletClient = wallet.walletClient();
      const [account] = await walletClient.getAddresses();
      return walletClient.writeContract({
        chain: adiChain,
        account,
        address: appConfig.paymentRegistry,
        abi: paymentRegistryAbi,
        functionName: 'setParticipantRole',
        args: [userForm.participant as Address, roleIndex(userForm.role), enabled],
      });
    },
    enabled ? 'Role enabled.' : 'Role disabled.',
    { abi: paymentRegistryAbi as Abi },
  );
}

async function setUserStatus(active: boolean): Promise<void> {
  if (!isAddress(userForm.participant)) {
    setMessage('fail', 'Participant address is invalid.');
    return;
  }

  await submitTx(
    async () => {
      const walletClient = wallet.walletClient();
      const [account] = await walletClient.getAddresses();
      return walletClient.writeContract({
        chain: adiChain,
        account,
        address: appConfig.paymentRegistry,
        abi: paymentRegistryAbi,
        functionName: 'setParticipantStatus',
        args: [userForm.participant as Address, active],
      });
    },
    active ? 'Participant activated.' : 'Participant deactivated.',
    { abi: paymentRegistryAbi as Abi },
  );
}

async function setUserProfile(): Promise<void> {
  if (!isAddress(userForm.participant)) {
    setMessage('fail', 'Participant address is invalid.');
    return;
  }
  if (!isBytes32(userForm.profileHash)) {
    setMessage('fail', 'Profile hash must be bytes32.');
    return;
  }

  await submitTx(
    async () => {
      const walletClient = wallet.walletClient();
      const [account] = await walletClient.getAddresses();
      return walletClient.writeContract({
        chain: adiChain,
        account,
        address: appConfig.paymentRegistry,
        abi: paymentRegistryAbi,
        functionName: 'setParticipantProfile',
        args: [userForm.participant as Address, userForm.profileHash as Hex],
      });
    },
    'Participant profile updated.',
    { abi: paymentRegistryAbi as Abi },
  );
}

onMounted(async () => {
  await refresh();
});
</script>
