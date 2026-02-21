<template>
  <section class="page-wrap">
    <header class="page-header">
      <div>
        <p class="page-eyebrow">Role · Issuer</p>
        <h2 class="page-title">Issuer Console</h2>
        <p class="page-subtitle">
          Create requests, execute proof-backed issuance, and run Redis tamper
          scenarios.
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
      aria-label="Issuer workspace tabs"
      @update:model-value="activeTab = $event as IssuerTab"
    />

    <div
      v-if="!wallet.connected"
      class="empty-state"
    >
      Read-only mode is active. Connect a wallet to submit requests and execute
      issuance.
    </div>

    <section class="kpi-grid">
      <article class="kpi-card">
        <p>Requests</p>
        <strong>{{ requests.length }}</strong>
      </article>
      <article class="kpi-card">
        <p>Pending</p>
        <strong>{{ pendingCount }}</strong>
      </article>
      <article class="kpi-card">
        <p>Executed</p>
        <strong>{{ consumedCount }}</strong>
      </article>
      <article class="kpi-card">
        <p>Issuer Role</p>
        <strong>{{ auth.canAccess('issuer') ? 'Granted' : 'Missing' }}</strong>
      </article>
    </section>

    <section
      v-if="activeTab === 'create'"
      class="tab-panel"
    >
      <section class="panel-grid">
        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Demo Steps</h3>
            <p class="panel-note">Institution-first source-data walkthrough.</p>
          </header>
          <ol class="flow-list">
            <li>Load source instructions from Redis (institution source-of-truth).</li>
            <li>Select recipient + privacy mode and submit issuance request.</li>
            <li>Execute with proof to bind compliance and policy on-chain.</li>
            <li>Review request → proof → execution trace in Audit.</li>
          </ol>
        </article>

        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Create Issuance Request</h3>
            <p class="panel-note">Submit a policy-bound payment request.</p>
          </header>

          <div class="form-grid">
            <div class="field">
              <label>Source Batch (Redis)</label>
              <select
                v-model="payrollForm.runId"
                :disabled="submitting || sourceRuns.length === 0"
                @change="loadPayrollSource"
              >
                <option value="">Select source batch</option>
                <option
                  v-for="run in sourceRuns"
                  :key="run.runId"
                  :value="run.runId"
                >
                  {{ run.runId }} · {{ run.participantCount }} recipients
                </option>
              </select>
              <p class="field-note">
                Institution source is the connected Redis namespace.
              </p>
            </div>
            <div class="field">
              <label>Search Recipient (Redis)</label>
              <input
                v-model="payrollForm.employeeSearch"
                placeholder="Name, address, or payment id"
                :readonly="submitting"
              />
            </div>
            <div class="field">
              <label>Recipient</label>
              <select
                v-model="payrollForm.subjectId"
                :disabled="submitting || searchableEmployees.length === 0"
                @change="onPayrollFilterChange"
              >
                <option value="">All recipients</option>
                <option
                  v-for="employee in searchableEmployees"
                  :key="employee.subjectId"
                  :value="employee.subjectId"
                >
                  {{ employee.fullName }} · {{ employee.subjectId }}
                </option>
              </select>
            </div>
            <div class="field">
              <label>Privacy Mode</label>
              <select
                v-model.number="requestForm.privacyMode"
                :disabled="submitting || payrollIntents.length === 0"
                @change="onPrivacyModeChange"
              >
                <option
                  v-for="mode in privacyModeOptions"
                  :key="mode.key"
                  :value="mode.value"
                  :disabled="!mode.allowed"
                >
                  {{ mode.label }}{{ mode.allowed ? '' : ' (disabled by policy)' }}
                </option>
              </select>
              <p class="field-note">
                Active policy #{{ effectivePolicyIdentifier }} allows:
                {{ allowedPrivacyModeSummary }}.
              </p>
            </div>
            <div class="field">
              <label>Payment Instruction</label>
              <select
                v-model="payrollForm.paymentId"
                :disabled="submitting || payrollIntents.length === 0"
                @change="selectPayrollIntent"
              >
                <option value="">Select instruction</option>
                <option
                  v-for="intent in selectablePayrollIntents"
                  :key="intent.paymentId"
                  :value="intent.paymentId"
                >
                  {{ intent.paymentId }} · {{ intent.fullName }} ·
                  {{ intent.netAmount }} {{ intent.currency }}
                </option>
              </select>
            </div>
            <div class="field full">
              <p class="panel-note">
                Salary and destination are sourced from the selected payment
                instruction. Privacy mode is selected here and enforced by policy.
              </p>
            </div>
          </div>

          <div class="form-actions">
            <button
              class="btn-subtle"
              type="button"
              :disabled="submitting"
              @click="() => loadSourceRuns()"
            >
              Reload Batches
            </button>
            <button
              class="btn-subtle"
              type="button"
              :disabled="submitting || !payrollForm.runId.trim()"
              @click="loadPayrollSource"
            >
              Load Source Data
            </button>
            <span class="badge warn">
              Loaded Instructions: {{ filteredPayrollIntents.length }} /
              {{ payrollIntents.length }}
            </span>
          </div>

          <div
            v-if="selectedPayrollIntent"
            class="form-grid"
          >
            <div class="field">
              <label>Selected Recipient</label>
              <input
                :value="selectedPayrollIntent.fullName"
                readonly
              />
            </div>
            <div class="field">
              <label>Selected Recipient Wallet</label>
              <input
                :value="selectedPayrollIntent.subjectId"
                readonly
                class="inline-mono"
              />
            </div>
            <div class="field">
              <label>Applied Privacy Mode (Preview)</label>
              <input
                :value="privacyModeLabel(requestForm.privacyMode)"
                readonly
              />
            </div>
            <div class="field">
              <label>Net Amount</label>
              <input
                :value="`${selectedPayrollIntent.netAmount} ${selectedPayrollIntent.currency}`"
                readonly
              />
            </div>
            <div class="field">
              <label>Destination</label>
              <input
                :value="selectedPayrollIntent.intendedBeneficiary"
                readonly
                class="inline-mono"
              />
            </div>
          </div>

          <div class="form-grid">
            <div class="field">
              <label>Recipient Wallet</label>
              <input
                v-model="requestForm.subject"
                class="inline-mono"
                placeholder="0x..."
                :readonly="!payrollForm.debugManualOverride"
              />
            </div>

            <div class="field">
              <label>Asset Identifier</label>
              <input
                v-model="requestForm.assetIdentifier"
                type="number"
                min="0"
                :readonly="!payrollForm.debugManualOverride"
              />
            </div>

            <div class="field">
              <label>Expiry Date</label>
              <VueDatePicker
                v-model="requestDates.expiryAt"
                :enable-time-picker="true"
                :format="'yyyy-MM-dd HH:mm'"
                :minutes-increment="5"
                :clearable="true"
                :teleport="true"
                :disabled="!payrollForm.debugManualOverride"
              />
            </div>

            <div class="field">
              <label>Amount (public)</label>
              <input
                v-model="requestForm.amount"
                type="number"
                min="0"
                :disabled="
                  !payrollForm.debugManualOverride ||
                  requestForm.privacyMode === 2 ||
                  requestForm.privacyMode === 3
                "
              />
            </div>

            <div class="field">
              <label>Beneficiary (public)</label>
              <input
                v-model="requestForm.beneficiary"
                class="inline-mono"
                placeholder="0x..."
                :disabled="
                  !payrollForm.debugManualOverride ||
                  requestForm.privacyMode === 1 ||
                  requestForm.privacyMode === 3
                "
              />
            </div>

            <div class="field full">
              <label>Documentation Reference</label>
              <input
                v-model="requestForm.documentationRef"
                placeholder="Internal source-system reference"
                :readonly="!payrollForm.debugManualOverride"
              />
            </div>
          </div>

          <details class="advanced-panel">
            <summary>Advanced Request Fields</summary>
            <div class="advanced-content">
              <div class="form-grid">
                <div class="field">
                  <label>Amount Commitment (bytes32)</label>
                  <input
                    v-model="requestForm.amountCommitment"
                    class="inline-mono"
                    placeholder="0x..."
                    :disabled="
                      !payrollForm.debugManualOverride ||
                      requestForm.privacyMode === 0 ||
                      requestForm.privacyMode === 1
                    "
                  />
                </div>
                <div class="field">
                  <label>Amount Commitment Seed</label>
                  <input
                    v-model="requestForm.amountCommitmentSeed"
                    placeholder="Fallback text hashed with keccak256"
                    :disabled="
                      !payrollForm.debugManualOverride ||
                      requestForm.privacyMode === 0 ||
                      requestForm.privacyMode === 1
                    "
                  />
                </div>

                <div class="field">
                  <label>Destination Commitment (bytes32)</label>
                  <input
                    v-model="requestForm.destinationCommitment"
                    class="inline-mono"
                    placeholder="0x..."
                    :disabled="
                      !payrollForm.debugManualOverride ||
                      requestForm.privacyMode === 0 ||
                      requestForm.privacyMode === 2
                    "
                  />
                </div>
                <div class="field">
                  <label>Destination Commitment Seed</label>
                  <input
                    v-model="requestForm.destinationCommitmentSeed"
                    placeholder="Fallback text hashed with keccak256"
                    :disabled="
                      !payrollForm.debugManualOverride ||
                      requestForm.privacyMode === 0 ||
                      requestForm.privacyMode === 2
                    "
                  />
                </div>

                <div class="field">
                  <label>Payload Hash (bytes32)</label>
                  <input
                    v-model="requestForm.payloadHash"
                    class="inline-mono"
                    placeholder="0x..."
                    :disabled="
                      !payrollForm.debugManualOverride || requestForm.privacyMode === 0
                    "
                  />
                </div>
                <div class="field">
                  <label>Payload Seed</label>
                  <input
                    v-model="requestForm.payloadSeed"
                    placeholder="Fallback text hashed with keccak256"
                    :disabled="
                      !payrollForm.debugManualOverride || requestForm.privacyMode === 0
                    "
                  />
                </div>

                <div class="field full">
                  <label>Documentation Hash (bytes32)</label>
                  <input
                    v-model="requestForm.documentationHash"
                    class="inline-mono"
                    placeholder="0x..."
                    :readonly="!payrollForm.debugManualOverride"
                  />
                </div>

                <div class="field full">
                  <label class="badge warn">
                    <input
                      v-model="payrollForm.debugManualOverride"
                      type="checkbox"
                    />
                    Enable Manual Override (Debug)
                  </label>
                </div>
              </div>
            </div>
          </details>

          <div class="form-actions">
            <span class="badge warn"
              >Next Request: {{ nextRequestIdentifier || 'n/a' }}</span
            >
            <span class="badge warn"
              >parametersHash: {{ derivedParametersHashPreview }}</span
            >
            <button
              class="btn-primary"
              type="button"
              :disabled="submitting || !wallet.connected"
              @click="createRequest"
            >
              Create Request
            </button>
          </div>
        </article>

        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Request Queue</h3>
            <p class="panel-note">Indexed requests and proof-job state.</p>
          </header>

          <div
            v-if="requests.length === 0"
            class="empty-state"
          >
            No indexed requests yet.
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
                  <th>Proof</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="request in requests"
                  :key="request.id"
                >
                  <td class="inline-mono">{{ request.requestIdentifier }}</td>
                  <td>{{ privacyModeLabelFromKey(request.privacyMode) }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="request.status === 'REQUESTED' ? 'warn' : 'ok'"
                    >
                      {{ request.status }}
                    </span>
                  </td>
                  <td>
                    <span
                      class="badge"
                      :class="proofBadgeClass(request.requestIdentifier)"
                    >
                      {{ proofStatus(request.requestIdentifier) }}
                    </span>
                  </td>
                  <td>{{ formatTime(request.updatedAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </section>

    <section
      v-if="activeTab === 'execute'"
      class="tab-panel"
    >
      <section class="panel-grid">
        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Execute Issuance</h3>
            <p class="panel-note">
              Writes to TokenisationEngine.verifyAndExecuteIssuance.
            </p>
          </header>

          <div class="form-grid">
            <div class="field">
              <label>Request Identifier</label>
              <input
                v-model="executionForm.requestIdentifier"
                type="number"
                min="1"
              />
            </div>
            <div class="field">
              <label>Policy Identifier</label>
              <input
                v-model="executionForm.policyIdentifier"
                type="number"
                min="1"
              />
            </div>
          </div>

          <details class="advanced-panel">
            <summary>Advanced Execution Inputs</summary>
            <div class="advanced-content">
              <div class="form-grid">
                <div class="field full">
                  <label>Public Values (bytes)</label>
                  <textarea
                    v-model="executionForm.publicValues"
                    class="inline-mono"
                  />
                </div>
                <div class="field full">
                  <label>SP1 Proof Bytes (bytes)</label>
                  <textarea
                    v-model="executionForm.proofBytes"
                    class="inline-mono"
                  />
                </div>
              </div>
            </div>
          </details>

          <div class="form-actions">
            <span
              v-if="selectedOnchainStatus"
              class="badge warn"
            >
              Selected Onchain Status: {{ selectedOnchainStatus }}
            </span>
            <button
              class="btn-subtle"
              type="button"
              @click="prefillExecution"
            >
              Use Selected Request Hashes
            </button>
            <button
              class="btn-primary"
              type="button"
              :disabled="submitting || !wallet.connected"
              @click="executeRequest"
            >
              Submit Execution
            </button>
          </div>
        </article>

        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Select Request</h3>
            <p class="panel-note">
              Choose request to prefill execution and scenario tools.
            </p>
          </header>

          <div
            v-if="requests.length === 0"
            class="empty-state"
          >
            No indexed requests yet.
          </div>

          <div
            v-else
            class="table-wrap"
          >
            <table class="data-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Issuer</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="request in requests"
                  :key="request.id"
                >
                  <td class="inline-mono">{{ request.requestIdentifier }}</td>
                  <td class="inline-mono">{{ shortHex(request.issuer) }}</td>
                  <td class="inline-mono">{{ shortHex(request.subject) }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="request.status === 'REQUESTED' ? 'warn' : 'ok'"
                    >
                      {{ request.status }}
                    </span>
                  </td>
                  <td>
                    <div class="row-actions">
                      <button
                        class="btn-subtle"
                        type="button"
                        @click="selectRequest(request)"
                      >
                        Use
                      </button>
                      <button
                        class="btn-danger"
                        type="button"
                        :disabled="submitting || !canCancel(request)"
                        @click="cancelRequest(request.requestIdentifier)"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </section>

    <section
      v-if="activeTab === 'scenario'"
      class="tab-panel"
    >
      <section class="panel-grid">
        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Scenario Lab</h3>
            <p class="panel-note">
              Seed, tamper, and requeue worker data to demonstrate proof failure
              handling.
            </p>
          </header>

          <div class="form-grid">
            <div class="field">
              <label>Subject ID</label>
              <input
                v-model="scenarioForm.subjectId"
                class="inline-mono"
                placeholder="0x..."
              />
            </div>
            <div class="field">
              <label>Request Identifier</label>
              <input
                v-model="scenarioForm.requestId"
                type="number"
                min="1"
              />
            </div>
            <div class="field">
              <label>Tamper Check ID</label>
              <input
                v-model="scenarioForm.checkId"
                placeholder="KYC_PASS"
              />
            </div>
            <div class="field">
              <label>Tamper Pass Flag</label>
              <select v-model="scenarioForm.passedValue">
                <option value="false">false</option>
                <option value="true">true</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <span
              class="badge"
              :class="workerApiOnline ? 'ok' : 'warn'"
            >
              Worker API: {{ workerApiOnline ? 'Online' : 'Offline' }}
            </span>
            <button
              class="btn-subtle"
              type="button"
              :disabled="!scenarioForm.subjectId"
              @click="seedScenario"
            >
              Seed Employee Data
            </button>
            <button
              class="btn-subtle"
              type="button"
              :disabled="!scenarioForm.subjectId"
              @click="loadScenario"
            >
              Load Scenario
            </button>
            <button
              class="btn-danger"
              type="button"
              :disabled="!scenarioForm.subjectId || !scenarioForm.checkId"
              @click="tamperScenarioCheck"
            >
              Tamper Check
            </button>
            <button
              class="btn-primary"
              type="button"
              :disabled="!scenarioForm.requestId"
              @click="requeueScenarioRequest"
            >
              Requeue Request
            </button>
          </div>
        </article>

        <article class="panel">
          <header class="panel-head">
            <h3 class="panel-title">Redis Snapshot</h3>
            <p class="panel-note">
              Live employee/compliance state from worker admin API.
            </p>
          </header>

          <div
            v-if="!scenarioSnapshot"
            class="empty-state"
          >
            Load a scenario to inspect Redis-backed records.
          </div>

          <template v-else>
            <div class="form-grid">
              <div class="field full">
                <label>Master Key</label>
                <input
                  :value="scenarioSnapshot.masterKey"
                  readonly
                  class="inline-mono"
                />
              </div>
            </div>

            <details class="advanced-panel">
              <summary>Advanced Redis Editor</summary>
              <div class="advanced-content">
                <div class="form-grid">
                  <div class="field">
                    <label>Editable Redis Key</label>
                    <select
                      v-model="scenarioEditor.selectedKey"
                      @change="loadSelectedRedisKey"
                    >
                      <option value="">Select key</option>
                      <option
                        v-for="key in scenarioKeys"
                        :key="key"
                        :value="key"
                      >
                        {{ key }}
                      </option>
                    </select>
                  </div>

                  <div class="field full">
                    <label>Redis JSON Value</label>
                    <textarea
                      v-model="scenarioEditor.value"
                      class="inline-mono"
                    />
                  </div>
                </div>

                <div
                  v-if="scenarioEditor.selectedKey"
                  class="form-actions"
                >
                  <button
                    class="btn-subtle"
                    type="button"
                    @click="loadSelectedRedisKey"
                  >
                    Reload Key
                  </button>
                  <button
                    class="btn-primary"
                    type="button"
                    @click="saveSelectedRedisKey"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </details>
          </template>
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
import { isAddress, isHex, zeroAddress, type Address, type Hex } from 'viem';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import AppTabs from '../components/AppTabs.vue';
import { useNotice } from '../composables/useNotice';
import { useTxLifecycle } from '../composables/useTxLifecycle';
import {
  adiChain,
  computePrivacyContextHash,
  computeRequestParametersHash,
  encodePublicValues,
  hashText,
  issuanceRegistryAbi,
  policyRegistryAbi,
  privacyModeLabel,
  privacyModeLabelFromKey,
  PRIVACY_MODES,
  publicClient,
  tokenisationEngineAbi,
  ZERO_HASH,
} from '../lib/adi';
import { appConfig } from '../lib/config';
import {
  fetchActivePolicy,
  fetchIssuanceRequests,
  fetchProofJobs,
  type IndexedIssuanceRequest,
  type IndexedPolicy,
  type IndexedProofJob,
} from '../lib/indexer';
import { isBytes32, parseBigIntInput, shortHex } from '../lib/format';
import {
  fetchEmployeeScenario,
  fetchPayrollRun,
  fetchSourceRuns,
  getRedisValue,
  type PayrollIntentRecord,
  type PayrollRunSnapshot,
  type SourceRunSummary,
  pingWorkerApi,
  requeueProofRequest,
  seedEmployeeScenario,
  setRedisValue,
  tamperComplianceCheck,
  type EmployeeScenarioSnapshot,
} from '../lib/workerApi';
import { useProcessStore } from '../stores/useProcessStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useWalletStore } from '../stores/useWalletStore';

type IssuerTab = 'create' | 'execute' | 'scenario';

const tabs: Array<{ key: IssuerTab; label: string }> = [
  { key: 'create', label: 'Create' },
  { key: 'execute', label: 'Execute' },
  { key: 'scenario', label: 'Scenario Lab' },
];

const activeTab = ref<IssuerTab>('create');

const wallet = useWalletStore();
const auth = useAuthStore();
const processStore = useProcessStore();
const { message, messageKind, clearNotice, setNotice, setFailure } = useNotice();
const { runWrite, toErrorMessage } = useTxLifecycle();

const requests = ref<IndexedIssuanceRequest[]>([]);
const proofJobs = ref<IndexedProofJob[]>([]);
const activePolicy = ref<IndexedPolicy | null>(null);
const selectedRequest = ref<IndexedIssuanceRequest | null>(null);
const onchainActivePolicyIdentifier = ref('');
const onchainPolicyHash = ref<Hex>(ZERO_HASH);
const onchainPolicyConstraints = ref<{
  allowNone: boolean;
  allowDestinationPrivate: boolean;
  allowAmountPrivate: boolean;
  allowFullPrivate: boolean;
  allowPerIssuanceOverride: boolean;
  allowConfigurationUpdates: boolean;
  schemaVersion: number;
} | null>(null);

const workerApiOnline = ref(false);
const scenarioSnapshot = ref<EmployeeScenarioSnapshot | null>(null);
const nextRequestIdentifier = ref('');
const selectedOnchainStatus = ref('');
const payrollRun = ref<PayrollRunSnapshot | null>(null);
const sourceRuns = ref<SourceRunSummary[]>([]);

const submitting = ref(false);

const requestForm = reactive({
  subject: '',
  privacyMode: 0,
  assetIdentifier: '1',
  amount: '0',
  beneficiary: '',
  amountCommitment: '',
  amountCommitmentSeed: '',
  destinationCommitment: '',
  destinationCommitmentSeed: '',
  payloadHash: '',
  payloadSeed: '',
  documentationHash: '',
  documentationRef: '',
});

const requestDates = reactive({
  expiryAt: null as Date | null,
});

const payrollForm = reactive({
  runId: '',
  employeeSearch: '',
  subjectId: '',
  paymentId: '',
  debugManualOverride: false,
});

const executionForm = reactive({
  requestIdentifier: '',
  policyIdentifier: '',
  publicValues: '0x',
  proofBytes: '0x',
});

const scenarioForm = reactive({
  subjectId: '',
  requestId: '',
  checkId: 'KYC_PASS',
  passedValue: 'false',
});

const scenarioEditor = reactive({
  selectedKey: '',
  value: '',
});

const pendingCount = computed(
  () => requests.value.filter((request) => request.status === 'REQUESTED').length,
);
const consumedCount = computed(
  () => requests.value.filter((request) => request.status === 'CONSUMED').length,
);

function isModeAllowedByPolicy(mode: number, policy: IndexedPolicy | null): boolean {
  const constraints = onchainPolicyConstraints.value;
  if (constraints) {
    if (mode === 1) return constraints.allowDestinationPrivate;
    if (mode === 2) return constraints.allowAmountPrivate;
    if (mode === 3) return constraints.allowFullPrivate;
    return constraints.allowNone;
  }

  if (!policy) return true;
  if (mode === 1) return policy.allowDestinationPrivate;
  if (mode === 2) return policy.allowAmountPrivate;
  if (mode === 3) return policy.allowFullPrivate;
  return policy.allowNone;
}

const privacyModeOptions = computed(() =>
  PRIVACY_MODES.map((mode) => ({
    ...mode,
    allowed: isModeAllowedByPolicy(mode.value, activePolicy.value),
  })),
);

const availablePrivacyModes = computed(() =>
  privacyModeOptions.value.filter((mode) => mode.allowed),
);

const allowedPrivacyModeSummary = computed(() => {
  const labels = availablePrivacyModes.value.map((mode) => mode.label);
  return labels.length > 0 ? labels.join(', ') : 'None';
});

const effectivePolicyIdentifier = computed(
  () =>
    onchainActivePolicyIdentifier.value ||
    activePolicy.value?.policyIdentifier ||
    'n/a',
);

const proofByRequest = computed(() => {
  const map = new Map<string, IndexedProofJob>();
  for (const job of proofJobs.value) {
    map.set(job.requestIdentifier, job);
  }
  return map;
});

const payrollIntents = computed<PayrollIntentRecord[]>(() => {
  if (!payrollRun.value) return [];
  return payrollRun.value.intents.map((row) => row.value);
});

const searchableEmployees = computed<Array<{ subjectId: string; fullName: string }>>(
  () => {
    const term = payrollForm.employeeSearch.trim().toLowerCase();
    const bySubject = new Map<string, string>();
    for (const intent of payrollIntents.value) {
      if (term.length > 0) {
        const searchHaystack =
          `${intent.fullName} ${intent.subjectId} ${intent.paymentId}`.toLowerCase();
        if (!searchHaystack.includes(term)) {
          continue;
        }
      }
      if (!bySubject.has(intent.subjectId)) {
        bySubject.set(intent.subjectId, intent.fullName);
      }
    }

    return Array.from(bySubject, ([subjectId, fullName]) => ({ subjectId, fullName }));
  },
);

const filteredPayrollIntents = computed<PayrollIntentRecord[]>(() =>
  payrollIntents.value.filter((intent) => {
    const term = payrollForm.employeeSearch.trim().toLowerCase();
    const searchMatches =
      term.length === 0 ||
      `${intent.fullName} ${intent.subjectId} ${intent.paymentId}`
        .toLowerCase()
        .includes(term);
    const subjectMatches =
      payrollForm.subjectId.length === 0 ||
      intent.subjectId.toLowerCase() === payrollForm.subjectId.toLowerCase();
    return searchMatches && subjectMatches;
  }),
);

const selectablePayrollIntents = computed<PayrollIntentRecord[]>(() =>
  filteredPayrollIntents.value.length > 0
    ? filteredPayrollIntents.value
    : payrollIntents.value,
);

const selectedPayrollIntent = computed<PayrollIntentRecord | null>(() => {
  if (!payrollForm.paymentId) return null;
  return (
    payrollIntents.value.find((intent) => intent.paymentId === payrollForm.paymentId) ??
    null
  );
});

const scenarioKeys = computed(() => {
  if (!scenarioSnapshot.value) return [] as string[];
  return [
    scenarioSnapshot.value.masterKey,
    ...scenarioSnapshot.value.checks.map((row) => row.key),
  ];
});

const derivedParametersHashPreview = computed(() => {
  try {
    if (!isAddress(requestForm.subject)) return 'subject required';

    const mode = requestForm.privacyMode;
    const amount = mode === 2 || mode === 3 ? 0n : parseBigIntInput(requestForm.amount);
    const beneficiary =
      mode === 1 || mode === 3
        ? zeroAddress
        : isAddress(requestForm.beneficiary)
          ? requestForm.beneficiary
          : zeroAddress;

    const amountCommitment =
      mode === 2 || mode === 3
        ? deriveBytes32(
            requestForm.amountCommitment,
            requestForm.amountCommitmentSeed,
            true,
          )
        : ZERO_HASH;
    const destinationCommitment =
      mode === 1 || mode === 3
        ? deriveBytes32(
            requestForm.destinationCommitment,
            requestForm.destinationCommitmentSeed,
            true,
          )
        : ZERO_HASH;
    const payloadHash =
      mode === 0
        ? ZERO_HASH
        : deriveBytes32(requestForm.payloadHash, requestForm.payloadSeed, true);
    const documentationHash = deriveBytes32(
      requestForm.documentationHash,
      requestForm.documentationRef,
      false,
    );

    return computeRequestParametersHash({
      assetIdentifier: parseBigIntInput(requestForm.assetIdentifier),
      amount,
      beneficiary,
      amountCommitment,
      destinationCommitment,
      payloadHash,
      expiryTimestamp: resolveExpiryTimestamp(),
      documentationHash,
      issuer: wallet.account ?? zeroAddress,
      subject: requestForm.subject,
      privacyMode: mode,
      privacyContextHash: ZERO_HASH,
    });
  } catch {
    return 'invalid input';
  }
});

function setMessage(kind: 'ok' | 'fail', text: string): void {
  setNotice(kind, text);
}

function captureError(cause: unknown): void {
  setFailure(toErrorMessage(cause, 'Request failed.'));
}

function deriveBytes32(raw: string, seed: string, required: boolean): Hex {
  const candidate = raw.trim();
  if (candidate.length > 0) {
    if (!isBytes32(candidate)) {
      throw new Error('Expected valid bytes32 hex value.');
    }
    return candidate as Hex;
  }

  if (seed.trim().length > 0) {
    return hashText(seed.trim());
  }

  if (required) {
    throw new Error('Missing required commitment/hash for selected mode.');
  }

  return ZERO_HASH;
}

function resolveExpiryTimestamp(): bigint {
  if (!requestDates.expiryAt) return 0n;
  return BigInt(Math.floor(requestDates.expiryAt.getTime() / 1000));
}

function applyPrivacyProjection(intent: PayrollIntentRecord): void {
  const mode = requestForm.privacyMode;
  const destination =
    intent.intendedBeneficiary || intent.beneficiary || intent.subjectId;
  const amountSeed = `${intent.paymentId}:amount:${intent.netAmount}`;
  const destinationSeed = `${intent.paymentId}:destination:${destination}`;
  const payloadSeed = `${intent.paymentId}:payload:${mode}`;

  requestForm.amount = mode === 2 || mode === 3 ? '0' : intent.netAmount;
  requestForm.beneficiary = mode === 1 || mode === 3 ? zeroAddress : destination;
  requestForm.amountCommitment =
    mode === 2 || mode === 3 ? hashText(amountSeed) : ZERO_HASH;
  requestForm.destinationCommitment =
    mode === 1 || mode === 3 ? hashText(destinationSeed) : ZERO_HASH;
  requestForm.payloadHash = mode === 0 ? ZERO_HASH : hashText(payloadSeed);
  requestForm.amountCommitmentSeed = mode === 2 || mode === 3 ? amountSeed : '';
  requestForm.destinationCommitmentSeed =
    mode === 1 || mode === 3 ? destinationSeed : '';
  requestForm.payloadSeed = mode === 0 ? '' : payloadSeed;
}

function applyPayrollIntent(intent: PayrollIntentRecord): void {
  requestForm.subject = intent.subjectId;
  requestForm.assetIdentifier = intent.assetIdentifier;
  applyPrivacyProjection(intent);
  requestForm.documentationHash = intent.documentationHash;
  requestForm.documentationRef = intent.documentationRef;
  requestDates.expiryAt =
    intent.expiryTimestamp && intent.expiryTimestamp !== '0'
      ? new Date(Number(intent.expiryTimestamp) * 1000)
      : null;
}

function onPrivacyModeChange(): void {
  if (!isModeAllowedByPolicy(requestForm.privacyMode, activePolicy.value)) {
    const fallback = availablePrivacyModes.value[0]?.value ?? 0;
    requestForm.privacyMode = fallback;
    setMessage('fail', 'Selected privacy mode is not allowed by the active policy.');
    return;
  }
  if (payrollForm.debugManualOverride) return;
  if (!selectedPayrollIntent.value) return;
  applyPrivacyProjection(selectedPayrollIntent.value);
}

function selectPayrollIntent(): void {
  const intent = selectedPayrollIntent.value;
  if (!intent) return;
  payrollForm.subjectId = intent.subjectId;
  applyPayrollIntent(intent);
}

function onPayrollFilterChange(): void {
  const stillValid = filteredPayrollIntents.value.some(
    (intent) => intent.paymentId === payrollForm.paymentId,
  );
  if (!stillValid) {
    if (filteredPayrollIntents.value.length > 0) {
      payrollForm.paymentId = filteredPayrollIntents.value[0].paymentId;
    } else {
      payrollForm.paymentId = '';
    }
  }
  if (!payrollForm.paymentId) {
    if (payrollForm.subjectId) {
      requestForm.subject = payrollForm.subjectId;
    }
    if (filteredPayrollIntents.value.length === 0 && payrollIntents.value.length > 0) {
      setMessage(
        'ok',
        'No exact match for this recipient. Select a payment instruction manually.',
      );
    }
    return;
  }
  selectPayrollIntent();
}

async function loadSourceRuns(autoLoad = false): Promise<void> {
  try {
    sourceRuns.value = await processStore.runQuickTask(async () => fetchSourceRuns());
  } catch (cause) {
    captureError(cause);
    return;
  }

  if (sourceRuns.value.length === 0) {
    payrollForm.runId = '';
    payrollForm.paymentId = '';
    payrollForm.subjectId = '';
    payrollRun.value = null;
    setMessage(
      'fail',
      'No source batches found in Redis. Seed source data, then reload batches.',
    );
    return;
  }

  const hasSelectedRun = sourceRuns.value.some(
    (run) => run.runId === payrollForm.runId,
  );
  if (!hasSelectedRun) {
    payrollForm.runId = sourceRuns.value[0].runId;
  }

  if (autoLoad && payrollForm.runId.trim()) {
    await loadPayrollSource();
  }
}

async function loadPayrollSource(): Promise<void> {
  if (!payrollForm.runId.trim()) {
    setMessage('fail', 'Select source batch first.');
    return;
  }

  try {
    await processStore.runQuickTask(async () => {
      payrollRun.value = await fetchPayrollRun(payrollForm.runId.trim());
    });
  } catch (cause) {
    captureError(cause);
    return;
  }

  if (payrollIntents.value.length > 0) {
    payrollForm.subjectId = payrollIntents.value[0].subjectId;
    onPayrollFilterChange();
  } else {
    payrollForm.paymentId = '';
    payrollForm.subjectId = '';
  }

  setMessage('ok', `Loaded source batch ${payrollForm.runId.trim()} from Redis.`);
}

function proofStatus(requestIdentifier: string): string {
  return proofByRequest.value.get(requestIdentifier)?.status ?? 'N/A';
}

function proofBadgeClass(requestIdentifier: string): 'ok' | 'warn' | 'fail' {
  const status = proofStatus(requestIdentifier);
  if (status === 'COMPLETED') return 'ok';
  if (status === 'DEAD_LETTER') return 'fail';
  return 'warn';
}

function canCancel(request: IndexedIssuanceRequest): boolean {
  if (!wallet.account) return false;
  return (
    request.status === 'REQUESTED' &&
    request.issuer.toLowerCase() === wallet.account.toLowerCase()
  );
}

function mapRequestStatus(status: number): string {
  if (status === 1) return 'REQUESTED';
  if (status === 2) return 'CONSUMED';
  if (status === 3) return 'CANCELLED';
  return 'NONE';
}

function formatTime(value: string | number): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 'n/a';
  const millis = numeric > 9999999999 ? numeric : numeric * 1000;
  return new Date(millis).toLocaleString();
}

async function refresh(): Promise<void> {
  await processStore.runQuickTask(async () => {
    const [requestRows, policy, jobs, workerUp] = await Promise.all([
      fetchIssuanceRequests(120),
      fetchActivePolicy(),
      fetchProofJobs(120),
      pingWorkerApi(),
    ]);

    requests.value = requestRows;
    activePolicy.value = policy;
    proofJobs.value = jobs;
    workerApiOnline.value = workerUp;

    if (appConfig.issuanceRegistry !== zeroAddress) {
      const nextIdentifier = await publicClient.readContract({
        address: appConfig.issuanceRegistry,
        abi: issuanceRegistryAbi,
        functionName: 'nextRequestIdentifier',
      });
      nextRequestIdentifier.value = String(nextIdentifier);
    } else {
      nextRequestIdentifier.value = '';
    }

    if (appConfig.policyRegistry !== zeroAddress) {
      const activeIdentifier = await publicClient.readContract({
        address: appConfig.policyRegistry,
        abi: policyRegistryAbi,
        functionName: 'activePolicyIdentifier',
      });

      onchainActivePolicyIdentifier.value = activeIdentifier.toString();
      executionForm.policyIdentifier = activeIdentifier.toString();

      if (activeIdentifier > 0n) {
        const [onchainPolicy, constraints] = await Promise.all([
          publicClient.readContract({
            address: appConfig.policyRegistry,
            abi: policyRegistryAbi,
            functionName: 'getPolicy',
            args: [activeIdentifier],
          }),
          publicClient.readContract({
            address: appConfig.policyRegistry,
            abi: policyRegistryAbi,
            functionName: 'getPolicyPrivacyConstraints',
            args: [activeIdentifier],
          }),
        ]);

        onchainPolicyHash.value = onchainPolicy.policyHash;
        onchainPolicyConstraints.value = {
          allowNone: constraints.allowNone,
          allowDestinationPrivate: constraints.allowDestinationPrivate,
          allowAmountPrivate: constraints.allowAmountPrivate,
          allowFullPrivate: constraints.allowFullPrivate,
          allowPerIssuanceOverride: constraints.allowPerIssuanceOverride,
          allowConfigurationUpdates: constraints.allowConfigurationUpdates,
          schemaVersion: Number(constraints.schemaVersion),
        };
      } else {
        onchainPolicyHash.value = ZERO_HASH;
        onchainPolicyConstraints.value = null;
      }
    } else {
      onchainActivePolicyIdentifier.value = '';
      onchainPolicyHash.value = ZERO_HASH;
      onchainPolicyConstraints.value = null;
    }

    if (!isModeAllowedByPolicy(requestForm.privacyMode, activePolicy.value)) {
      requestForm.privacyMode = availablePrivacyModes.value[0]?.value ?? 0;
      if (selectedPayrollIntent.value && !payrollForm.debugManualOverride) {
        applyPrivacyProjection(selectedPayrollIntent.value);
      }
    }
  });
}

function selectRequest(request: IndexedIssuanceRequest): void {
  selectedRequest.value = request;
  executionForm.requestIdentifier = request.requestIdentifier;
  executionForm.policyIdentifier =
    onchainActivePolicyIdentifier.value ||
    activePolicy.value?.policyIdentifier ||
    executionForm.policyIdentifier;
  scenarioForm.subjectId = request.subject;
  scenarioForm.requestId = request.requestIdentifier;
  prefillExecution();

  if (appConfig.issuanceRegistry !== zeroAddress) {
    void processStore.runQuickTask(async () => {
      const onchainRequest = await publicClient.readContract({
        address: appConfig.issuanceRegistry,
        abi: issuanceRegistryAbi,
        functionName: 'getRequest',
        args: [BigInt(request.requestIdentifier)],
      });
      selectedOnchainStatus.value = mapRequestStatus(Number(onchainRequest.status));
    });
  }
}

async function createRequest(): Promise<void> {
  if (appConfig.issuanceRegistry === zeroAddress) {
    setMessage('fail', 'Issuance registry address is not configured.');
    return;
  }

  if (!payrollForm.debugManualOverride) {
    if (!selectedPayrollIntent.value) {
      setMessage('fail', 'Select a payment instruction from Redis first.');
      return;
    }
    applyPayrollIntent(selectedPayrollIntent.value);
  }

  if (!isAddress(requestForm.subject)) {
    setMessage('fail', 'Subject address is invalid.');
    return;
  }

  const mode = requestForm.privacyMode;
  if (!isModeAllowedByPolicy(mode, activePolicy.value)) {
    setMessage('fail', 'Selected privacy mode is not allowed by the active policy.');
    return;
  }
  if ((mode === 0 || mode === 2) && !isAddress(requestForm.beneficiary)) {
    setMessage('fail', 'Beneficiary address is required for this privacy mode.');
    return;
  }

  submitting.value = true;
  clearNotice();

  try {
    const walletClient = wallet.walletClient();
    const [account] = await walletClient.getAddresses();

    const config = await publicClient.readContract({
      address: appConfig.issuanceRegistry,
      abi: issuanceRegistryAbi,
      functionName: 'getPrivacyConfiguration',
      args: [requestForm.subject as Address],
    });

    const privacyContextHash = config.isConfigured
      ? computePrivacyContextHash({
          worker: requestForm.subject as Address,
          mode: Number(config.mode),
          spendingPublicKey: config.spendingPublicKey,
          viewingPublicKey: config.viewingPublicKey,
          metadataHash: config.metadataHash,
          schemaVersion: Number(config.schemaVersion),
        })
      : ZERO_HASH;

    const amount = mode === 2 || mode === 3 ? 0n : parseBigIntInput(requestForm.amount);
    const beneficiary =
      mode === 1 || mode === 3 ? zeroAddress : (requestForm.beneficiary as Address);
    const expiryTimestamp = resolveExpiryTimestamp();

    const amountCommitment =
      mode === 2 || mode === 3
        ? deriveBytes32(
            requestForm.amountCommitment,
            requestForm.amountCommitmentSeed,
            true,
          )
        : ZERO_HASH;
    const destinationCommitment =
      mode === 1 || mode === 3
        ? deriveBytes32(
            requestForm.destinationCommitment,
            requestForm.destinationCommitmentSeed,
            true,
          )
        : ZERO_HASH;
    const payloadHash =
      mode === 0
        ? ZERO_HASH
        : deriveBytes32(requestForm.payloadHash, requestForm.payloadSeed, true);
    const documentationHash = deriveBytes32(
      requestForm.documentationHash,
      requestForm.documentationRef,
      false,
    );

    const expectedHash = computeRequestParametersHash({
      assetIdentifier: parseBigIntInput(requestForm.assetIdentifier),
      amount,
      beneficiary,
      amountCommitment,
      destinationCommitment,
      payloadHash,
      expiryTimestamp,
      documentationHash,
      issuer: account,
      subject: requestForm.subject as Address,
      privacyMode: mode,
      privacyContextHash,
    });

    const txHash = await runWrite(
      () =>
        walletClient.writeContract({
          account,
          chain: adiChain,
          address: appConfig.issuanceRegistry,
          abi: issuanceRegistryAbi,
          functionName: 'createIssuanceRequest',
          args: [
            {
              subject: requestForm.subject as Address,
              assetIdentifier: parseBigIntInput(requestForm.assetIdentifier),
              amount,
              beneficiary,
              amountCommitment,
              destinationCommitment,
              payloadHash,
              expiryTimestamp,
              documentationHash,
              privacyMode: mode,
            },
          ],
        }),
      { abi: issuanceRegistryAbi },
    );

    setMessage(
      'ok',
      `Request created. Tx: ${txHash} · parametersHash: ${expectedHash}`,
    );
    await refresh();
    activeTab.value = 'execute';
  } catch (cause) {
    captureError(cause);
  } finally {
    submitting.value = false;
  }
}

async function cancelRequest(requestIdentifier: string): Promise<void> {
  if (appConfig.issuanceRegistry === zeroAddress) {
    setMessage('fail', 'Issuance registry address is not configured.');
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
          account,
          chain: adiChain,
          address: appConfig.issuanceRegistry,
          abi: issuanceRegistryAbi,
          functionName: 'cancelIssuanceRequest',
          args: [BigInt(requestIdentifier)],
        }),
      { abi: issuanceRegistryAbi },
    );

    setMessage('ok', `Request ${requestIdentifier} cancelled. Tx: ${txHash}`);
    await refresh();
  } catch (cause) {
    captureError(cause);
  } finally {
    submitting.value = false;
  }
}

function prefillExecution(): void {
  if (!selectedRequest.value) return;
  const policyHash =
    onchainPolicyHash.value !== ZERO_HASH
      ? onchainPolicyHash.value
      : (activePolicy.value?.policyHash as Hex | undefined);
  if (!policyHash) {
    setMessage('fail', 'Unable to resolve active policy hash.');
    return;
  }
  executionForm.requestIdentifier = selectedRequest.value.requestIdentifier;
  executionForm.policyIdentifier =
    onchainActivePolicyIdentifier.value ||
    activePolicy.value?.policyIdentifier ||
    executionForm.policyIdentifier;
  executionForm.publicValues = encodePublicValues(
    selectedRequest.value.parametersHash as Hex,
    policyHash,
  );
}

async function executeRequest(): Promise<void> {
  if (appConfig.tokenisationEngine === zeroAddress) {
    setMessage('fail', 'Tokenisation engine address is not configured.');
    return;
  }

  if (!isHex(executionForm.publicValues, { strict: false })) {
    setMessage('fail', 'Public values must be hex bytes.');
    return;
  }
  if (!isHex(executionForm.proofBytes, { strict: false })) {
    setMessage('fail', 'Proof bytes must be hex bytes.');
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
          account,
          chain: adiChain,
          address: appConfig.tokenisationEngine,
          abi: tokenisationEngineAbi,
          functionName: 'verifyAndExecuteIssuance',
          args: [
            {
              requestIdentifier: BigInt(executionForm.requestIdentifier),
              policyIdentifier: BigInt(executionForm.policyIdentifier),
              publicValues: executionForm.publicValues as Hex,
              proofBytes: executionForm.proofBytes as Hex,
            },
          ],
        }),
      { abi: tokenisationEngineAbi },
    );

    setMessage('ok', `Execution submitted. Tx: ${txHash}`);
    await refresh();
  } catch (cause) {
    captureError(cause);
  } finally {
    submitting.value = false;
  }
}

async function loadScenario(): Promise<void> {
  if (!scenarioForm.subjectId) {
    setMessage('fail', 'Provide subject ID first.');
    return;
  }

  await processStore.runQuickTask(async () => {
    scenarioSnapshot.value = await fetchEmployeeScenario(
      scenarioForm.subjectId.toLowerCase(),
      scenarioForm.requestId || undefined,
    );
  });

  scenarioEditor.selectedKey = '';
  scenarioEditor.value = '';
  setMessage('ok', 'Scenario snapshot loaded.');
}

async function seedScenario(): Promise<void> {
  if (!scenarioForm.subjectId) {
    setMessage('fail', 'Provide subject ID first.');
    return;
  }

  await processStore.runQuickTask(async () => {
    await seedEmployeeScenario({
      subjectId: scenarioForm.subjectId.toLowerCase(),
      checkIds: ['KYC_PASS', 'AML_PASS'],
    });
  });

  await loadScenario();
  setMessage('ok', 'Employee scenario seeded in Redis.');
}

async function tamperScenarioCheck(): Promise<void> {
  if (!scenarioForm.subjectId || !scenarioForm.checkId) {
    setMessage('fail', 'Provide subject ID and check ID first.');
    return;
  }

  await processStore.runQuickTask(async () => {
    await tamperComplianceCheck({
      subjectId: scenarioForm.subjectId.toLowerCase(),
      checkId: scenarioForm.checkId,
      passed: scenarioForm.passedValue === 'true',
    });
  });

  await loadScenario();
  setMessage(
    'ok',
    'Compliance check mutated. Requeue to observe worker failure behavior.',
  );
}

async function requeueScenarioRequest(): Promise<void> {
  if (!scenarioForm.requestId) {
    setMessage('fail', 'Provide request ID first.');
    return;
  }

  await processStore.runQuickTask(async () => {
    await requeueProofRequest({
      requestId: scenarioForm.requestId,
      policyId: activePolicy.value?.policyIdentifier,
    });
  });

  await loadScenario();
  setMessage(
    'ok',
    'Proof request requeued. Worker will retry with current Redis data.',
  );
}

async function loadSelectedRedisKey(): Promise<void> {
  if (!scenarioEditor.selectedKey) {
    scenarioEditor.value = '';
    return;
  }

  const value = await processStore.runQuickTask(async () =>
    getRedisValue(scenarioEditor.selectedKey),
  );
  scenarioEditor.value = JSON.stringify(value, null, 2);
}

async function saveSelectedRedisKey(): Promise<void> {
  if (!scenarioEditor.selectedKey) {
    setMessage('fail', 'Select a Redis key first.');
    return;
  }

  try {
    const parsed = JSON.parse(scenarioEditor.value);
    await processStore.runQuickTask(async () => {
      await setRedisValue(scenarioEditor.selectedKey, parsed);
    });
    await loadScenario();
    setMessage('ok', `Saved ${scenarioEditor.selectedKey}.`);
  } catch {
    setMessage('fail', 'Redis JSON editor content is invalid JSON.');
  }
}

onMounted(async () => {
  await refresh();
  await loadSourceRuns(true);
});
</script>
