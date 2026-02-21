import {
  BaseError,
  createPublicClient,
  createWalletClient,
  decodeErrorResult,
  encodeFunctionData,
  http,
  type Abi,
  type Hex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import type { WorkerConfig } from './config.js';
import type { PrivacyMode } from './types.js';

/** Minimal ABI subset required by the worker for request reads. */
const issuanceRegistryAbi = [
  {
    type: 'function',
    stateMutability: 'view',
    name: 'getRequest',
    inputs: [{ name: 'requestIdentifier', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'parametersHash', type: 'bytes32' },
          { name: 'issuer', type: 'address' },
          { name: 'subject', type: 'address' },
          { name: 'beneficiary', type: 'address' },
          { name: 'assetIdentifier', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'amountCommitment', type: 'bytes32' },
          { name: 'destinationCommitment', type: 'bytes32' },
          { name: 'payloadHash', type: 'bytes32' },
          { name: 'expiryTimestamp', type: 'uint64' },
          { name: 'documentationHash', type: 'bytes32' },
          { name: 'privacyMode', type: 'uint8' },
          { name: 'privacyContextHash', type: 'bytes32' },
          { name: 'status', type: 'uint8' },
        ],
      },
    ],
  },
] as const;

/** Minimal ABI subset required by the worker for policy reads. */
const policyRegistryAbi = [
  {
    type: 'function',
    stateMutability: 'view',
    name: 'getPolicy',
    inputs: [{ name: 'policyIdentifier', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'policyHash', type: 'bytes32' },
          { name: 'attestorSetRoot', type: 'bytes32' },
          { name: 'attestorThreshold', type: 'uint256' },
          { name: 'validFromTimestamp', type: 'uint64' },
          { name: 'validUntilTimestamp', type: 'uint64' },
          { name: 'status', type: 'uint8' },
        ],
      },
    ],
  },
  {
    type: 'function',
    stateMutability: 'view',
    name: 'isPolicyValidAt',
    inputs: [
      { name: 'policyIdentifier', type: 'uint256' },
      { name: 'timestamp', type: 'uint64' },
    ],
    outputs: [{ name: 'valid', type: 'bool' }],
  },
] as const;

/** Minimal ABI subset required by the worker for issuance submission. */
const tokenisationEngineAbi = [
  {
    type: 'function',
    stateMutability: 'nonpayable',
    name: 'verifyAndExecuteIssuance',
    inputs: [
      {
        name: 'parameters',
        type: 'tuple',
        components: [
          { name: 'requestIdentifier', type: 'uint256' },
          { name: 'policyIdentifier', type: 'uint256' },
          { name: 'publicValues', type: 'bytes' },
          { name: 'proofBytes', type: 'bytes' },
        ],
      },
    ],
    outputs: [],
  },
] as const;

/**
 * Converts a solidity enum value to the worker privacy mode label.
 *
 * @param value Enum value returned by contract reads.
 * @returns Label aligned with GraphQL enum values.
 */
function decodePrivacyMode(value: number): PrivacyMode {
  if (value === 1) return 'DESTINATION_PRIVATE';
  if (value === 2) return 'AMOUNT_PRIVATE';
  if (value === 3) return 'FULL_PRIVATE';
  return 'NONE';
}

/** Walks nested error causes and returns first hex revert data payload. */
function extractRevertData(cause: unknown): Hex | null {
  const visited = new Set<unknown>();
  let current: unknown = cause;

  while (current && typeof current === 'object' && !visited.has(current)) {
    visited.add(current);
    const maybeData = (current as { data?: unknown }).data;
    if (typeof maybeData === 'string' && maybeData.startsWith('0x')) {
      return maybeData as Hex;
    }
    current = (current as { cause?: unknown }).cause;
  }

  return null;
}

/** Formats decoded error arguments for readable logs. */
function formatDecodedValue(value: unknown): string {
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) return `[${value.map(formatDecodedValue).join(', ')}]`;
  if (value && typeof value === 'object') {
    return JSON.stringify(value, (_, nested) =>
      typeof nested === 'bigint' ? nested.toString() : nested,
    );
  }
  return String(value);
}

/** Decodes ABI error name/args from revert bytes. */
function tryDecodeAbiError(abi: Abi | undefined, data: Hex): string | null {
  if (!abi) return null;
  try {
    const decoded = decodeErrorResult({ abi, data });
    const args =
      decoded.args && decoded.args.length > 0
        ? `(${decoded.args.map(formatDecodedValue).join(', ')})`
        : '';
    return `${decoded.errorName}${args}`;
  } catch {
    return null;
  }
}

/** Normalized request data read directly from chain. */
export interface OnchainRequest {
  /** Commitment used to bind proof to request fields. */
  parametersHash: Hex;
  /** Issuer address that created the request. */
  issuer: Hex;
  /** Subject address bound to worker identity context. */
  subject: Hex;
  /** Public beneficiary address. */
  beneficiary: Hex;
  /** Asset identifier requested for settlement. */
  assetIdentifier: bigint;
  /** Public amount requested for settlement. */
  amount: bigint;
  /** Amount commitment for private amount modes. */
  amountCommitment: Hex;
  /** Destination commitment for private destination modes. */
  destinationCommitment: Hex;
  /** Payload commitment used for private settlement context. */
  payloadHash: Hex;
  /** Request expiry timestamp (0 means no expiry). */
  expiryTimestamp: bigint;
  /** Documentation commitment associated with the request. */
  documentationHash: Hex;
  /** Privacy mode enum label. */
  privacyMode: PrivacyMode;
  /** Privacy profile snapshot commitment. */
  privacyContextHash: Hex;
  /** Registry status enum value. */
  status: number;
}

/** Normalized policy data read directly from chain. */
export interface OnchainPolicy {
  /** Policy commitment hash. */
  policyHash: Hex;
  /** Merkle root of authorized attestors. */
  attestorSetRoot: Hex;
  /** Required attestation threshold. */
  attestorThreshold: bigint;
  /** Policy validity start timestamp. */
  validFromTimestamp: bigint;
  /** Policy validity end timestamp (0 means no expiry). */
  validUntilTimestamp: bigint;
  /** Policy status enum value. */
  status: number;
}

/**
 * Onchain adapter for read validation and transaction submission.
 */
export class ChainClient {
  private readonly publicClient;
  private readonly walletClient;
  private readonly account;

  /**
   * @param cfg Worker runtime configuration.
   */
  constructor(private readonly cfg: WorkerConfig) {
    const chain = {
      id: cfg.chainId,
      name: 'ADI',
      nativeCurrency: { name: 'ADI', symbol: 'ADI', decimals: 18 },
      rpcUrls: { default: { http: [cfg.adiRpcUrl] } },
    } as const;

    this.publicClient = createPublicClient({
      chain,
      transport: http(cfg.adiRpcUrl),
    });
    this.account = privateKeyToAccount(cfg.privateKey);
    this.walletClient = createWalletClient({
      account: this.account,
      chain,
      transport: http(cfg.adiRpcUrl),
    });
  }

  /**
   * Loads an issuance request from chain.
   *
   * @param requestIdentifier Request identifier.
   * @returns Normalized request payload.
   */
  async getRequest(requestIdentifier: bigint): Promise<OnchainRequest> {
    const request = await this.publicClient.readContract({
      address: this.cfg.issuanceRegistry,
      abi: issuanceRegistryAbi,
      functionName: 'getRequest',
      args: [requestIdentifier],
    });

    return {
      parametersHash: request.parametersHash,
      issuer: request.issuer.toLowerCase() as Hex,
      subject: request.subject.toLowerCase() as Hex,
      beneficiary: request.beneficiary.toLowerCase() as Hex,
      assetIdentifier: request.assetIdentifier,
      amount: request.amount,
      amountCommitment: request.amountCommitment,
      destinationCommitment: request.destinationCommitment,
      payloadHash: request.payloadHash,
      expiryTimestamp: BigInt(request.expiryTimestamp),
      documentationHash: request.documentationHash,
      privacyMode: decodePrivacyMode(Number(request.privacyMode)),
      privacyContextHash: request.privacyContextHash,
      status: Number(request.status),
    };
  }

  /**
   * Loads a policy from chain.
   *
   * @param policyIdentifier Policy identifier.
   * @returns Normalized policy payload.
   */
  async getPolicy(policyIdentifier: bigint): Promise<OnchainPolicy> {
    const policy = await this.publicClient.readContract({
      address: this.cfg.policyRegistry,
      abi: policyRegistryAbi,
      functionName: 'getPolicy',
      args: [policyIdentifier],
    });

    return {
      policyHash: policy.policyHash,
      attestorSetRoot: policy.attestorSetRoot,
      attestorThreshold: policy.attestorThreshold,
      validFromTimestamp: BigInt(policy.validFromTimestamp),
      validUntilTimestamp: BigInt(policy.validUntilTimestamp),
      status: Number(policy.status),
    };
  }

  /**
   * Checks policy validity window onchain.
   *
   * @param policyIdentifier Policy identifier.
   * @param timestamp Timestamp to evaluate.
   * @returns `true` when policy is valid at the timestamp.
   */
  async isPolicyValidAt(policyIdentifier: bigint, timestamp: bigint): Promise<boolean> {
    return this.publicClient.readContract({
      address: this.cfg.policyRegistry,
      abi: policyRegistryAbi,
      functionName: 'isPolicyValidAt',
      args: [policyIdentifier, timestamp],
    });
  }

  /**
   * Submits `verifyAndExecuteIssuance` to the tokenisation engine.
   *
   * @param parameters Execution payload expected by engine.
   * @returns Confirmed transaction hash after successful receipt.
   */
  async submitExecution(parameters: {
    requestIdentifier: bigint;
    policyIdentifier: bigint;
    publicValues: Hex;
    proofBytes: Hex;
  }): Promise<Hex> {
    const data = encodeFunctionData({
      abi: tokenisationEngineAbi,
      functionName: 'verifyAndExecuteIssuance',
      args: [
        {
          requestIdentifier: parameters.requestIdentifier,
          policyIdentifier: parameters.policyIdentifier,
          publicValues: parameters.publicValues,
          proofBytes: parameters.proofBytes,
        },
      ],
    });

    const txHash = await this.walletClient.sendTransaction({
      account: this.account,
      to: this.cfg.tokenisationEngine,
      data,
    });

    const receipt = await this.publicClient.waitForTransactionReceipt({ hash: txHash });
    if (receipt.status !== 'success') {
      const reason = await this.decodeFailedTransaction(
        txHash,
        tokenisationEngineAbi as unknown as Abi,
      );
      throw new Error(`Execution transaction reverted (${txHash}): ${reason}`);
    }

    return txHash;
  }

  /** Replays a reverted transaction as a call and returns decoded reason. */
  private async decodeFailedTransaction(hash: Hex, abi?: Abi): Promise<string> {
    try {
      const tx = await this.publicClient.getTransaction({ hash });
      if (!tx.to) return 'Execution reverted';

      try {
        await this.publicClient.call({
          account: tx.from,
          to: tx.to,
          data: tx.input,
          value: tx.value,
          blockNumber: tx.blockNumber && tx.blockNumber > 0n ? tx.blockNumber - 1n : undefined,
        });
        return 'Execution reverted';
      } catch (cause) {
        const revertData = extractRevertData(cause);
        const decoded = revertData ? tryDecodeAbiError(abi, revertData) : null;
        if (decoded) return decoded;
        if (cause instanceof BaseError) return cause.shortMessage || cause.message;
        return String(cause);
      }
    } catch (cause) {
      if (cause instanceof BaseError) return cause.shortMessage || cause.message;
      return String(cause);
    }
  }
}
