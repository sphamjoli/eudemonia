#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

/**
 * Parses CLI options for env sync execution.
 *
 * @param {string[]} argv - Raw CLI arguments excluding `node` and script path.
 * @returns {{
 *   deployment: string;
 *   indexerRpcUrl: string;
 *   uiRpcUrl: string;
 *   deploymentPrivateKey?: string;
 * }} Parsed options for deployment/env sync.
 */
function parseArgs(argv) {
  /** @type {{
   *   deployment?: string;
   *   indexerRpcUrl: string;
   *   uiRpcUrl: string;
   *   deploymentPrivateKey?: string;
   * }} */
  const options = {
    indexerRpcUrl: "http://host.docker.internal:8545",
    uiRpcUrl: "http://127.0.0.1:8545",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];

    if (current === "--deployment" && next) {
      options.deployment = next;
      i += 1;
      continue;
    }

    if (current === "--indexer-rpc-url" && next) {
      options.indexerRpcUrl = next;
      i += 1;
      continue;
    }

    if (current === "--ui-rpc-url" && next) {
      options.uiRpcUrl = next;
      i += 1;
      continue;
    }

    if (current === "--deployment-private-key" && next) {
      options.deploymentPrivateKey = next;
      i += 1;
      continue;
    }
  }

  if (!options.deployment) {
    throw new Error(
      "missing --deployment <path>, e.g. --deployment contracts/deployments/anvil-99999.json",
    );
  }

  return {
    deployment: options.deployment,
    indexerRpcUrl: options.indexerRpcUrl,
    uiRpcUrl: options.uiRpcUrl,
    deploymentPrivateKey: options.deploymentPrivateKey,
  };
}

/**
 * Reads JSON data from disk.
 *
 * @param {string} filePath - Path to the JSON file.
 * @returns {Record<string, unknown>} Parsed JSON object.
 */
function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

/**
 * Replaces or appends `KEY=value` lines while preserving comments and ordering.
 *
 * @param {string} content - Existing env file content.
 * @param {Record<string, string>} updates - Key/value pairs to upsert.
 * @returns {string} Updated env file content with trailing newline.
 */
function upsertEnvValues(content, updates) {
  const lines = content.split(/\r?\n/u);
  const seen = new Set();

  const rewritten = lines.map((line) => {
    const match = line.match(/^([A-Z0-9_]+)=/u);
    if (!match) return line;

    const key = match[1];
    if (!(key in updates)) return line;

    seen.add(key);
    return `${key}=${updates[key]}`;
  });

  for (const [key, value] of Object.entries(updates)) {
    if (!seen.has(key)) {
      rewritten.push(`${key}=${value}`);
    }
  }

  return `${rewritten.join("\n").replace(/\n*$/u, "")}\n`;
}

/**
 * Loads an env file template for update.
 *
 * @param {string} envPath - Target env file path.
 * @param {string} examplePath - Fallback example env file path.
 * @returns {string} Source env content to mutate.
 */
function loadEnvTemplate(envPath, examplePath) {
  if (fs.existsSync(envPath)) {
    return fs.readFileSync(envPath, "utf8");
  }

  if (fs.existsSync(examplePath)) {
    return fs.readFileSync(examplePath, "utf8");
  }

  return "";
}

/**
 * Validates required deployment address keys.
 *
 * @param {Record<string, unknown>} deployment - Parsed deployment metadata.
 */
function validateDeploymentShape(deployment) {
  const contracts =
    deployment.contracts && typeof deployment.contracts === "object"
      ? deployment.contracts
      : deployment;

  const hasChainId = deployment.chainId !== undefined && deployment.chainId !== null;
  if (!hasChainId) {
    throw new Error("deployment JSON is missing required key: chainId");
  }

  const requiredAddressKeys = [
    ["issuanceRegistry", "IssuanceRegistry"],
    ["paymentRegistry", "PaymentRegistry"],
    ["policyRegistry", "PolicyRegistry"],
    ["tokenisationEngine", "TokenisationEngine"],
    ["rwaToken", "RwaToken1155"],
    ["confidentialSettlement", "ConfidentialSettlement"],
  ];

  for (const [primaryKey, fallbackKey] of requiredAddressKeys) {
    if (!contracts[primaryKey] && !contracts[fallbackKey] && !deployment[primaryKey]) {
      throw new Error(`deployment JSON is missing required contract address: ${primaryKey}`);
    }
  }
}

/**
 * Main entrypoint that syncs local deployment addresses into indexer/ui env files.
 */
function main() {
  const args = parseArgs(process.argv.slice(2));
  const scriptPath = fileURLToPath(import.meta.url);
  const repoRoot = path.resolve(path.dirname(scriptPath), "..");
  const deploymentPath = path.resolve(repoRoot, args.deployment);
  const deployment = readJson(deploymentPath);

  validateDeploymentShape(deployment);

  const contracts =
    deployment.contracts && typeof deployment.contracts === "object"
      ? deployment.contracts
      : deployment;

  const chainId = String(deployment.chainId);
  const issuanceRegistry = String(
    contracts.issuanceRegistry ?? contracts.IssuanceRegistry ?? deployment.issuanceRegistry,
  );
  const paymentRegistry = String(
    contracts.paymentRegistry ?? contracts.PaymentRegistry ?? deployment.paymentRegistry,
  );
  const policyRegistry = String(
    contracts.policyRegistry ?? contracts.PolicyRegistry ?? deployment.policyRegistry,
  );
  const tokenisationEngine = String(
    contracts.tokenisationEngine ??
      contracts.TokenisationEngine ??
      deployment.tokenisationEngine,
  );
  const rwaToken = String(contracts.rwaToken ?? contracts.RwaToken1155 ?? deployment.rwaToken);
  const confidentialSettlement = String(
    contracts.confidentialSettlement ??
      contracts.ConfidentialSettlement ??
      deployment.confidentialSettlement,
  );
  const programVerificationKey =
    typeof deployment.programVerificationKey === "string"
      ? deployment.programVerificationKey
      : undefined;

  const indexerEnvPath = path.resolve(repoRoot, "indexer/.env");
  const indexerExamplePath = path.resolve(repoRoot, "indexer/.env.example");
  const uiEnvPath = path.resolve(repoRoot, "ui/.env");
  const uiExamplePath = path.resolve(repoRoot, "ui/.env.example");

  const indexerContent = loadEnvTemplate(indexerEnvPath, indexerExamplePath);
  const uiContent = loadEnvTemplate(uiEnvPath, uiExamplePath);

  /** @type {Record<string, string>} */
  const indexerUpdates = {
    ADI_RPC_URL: args.indexerRpcUrl,
    CHAIN_ID: chainId,
    ISSUANCE_REGISTRY: issuanceRegistry,
    PAYMENT_REGISTRY: paymentRegistry,
    POLICY_REGISTRY: policyRegistry,
    TOKENISATION_ENGINE: tokenisationEngine,
    RWA_TOKEN: rwaToken,
    CONFIDENTIAL_SETTLEMENT: confidentialSettlement,
  };
  if (programVerificationKey) {
    indexerUpdates.SP1_PROGRAM_VKEY = programVerificationKey;
  }
  if (args.deploymentPrivateKey) {
    indexerUpdates.PRIVATE_KEY = args.deploymentPrivateKey;
  }
  const indexerUpdated = upsertEnvValues(indexerContent, indexerUpdates);

  const uiUpdated = upsertEnvValues(uiContent, {
    VITE_ADI_RPC_URL: args.uiRpcUrl,
    VITE_CHAIN_ID: chainId,
    VITE_ISSUANCE_REGISTRY: issuanceRegistry,
    VITE_PAYMENT_REGISTRY: paymentRegistry,
    VITE_POLICY_REGISTRY: policyRegistry,
    VITE_ENGINE: tokenisationEngine,
    VITE_RWA_TOKEN: rwaToken,
    VITE_CONFIDENTIAL_SETTLEMENT: confidentialSettlement,
  });

  fs.writeFileSync(indexerEnvPath, indexerUpdated, "utf8");
  fs.writeFileSync(uiEnvPath, uiUpdated, "utf8");

  process.stdout.write(`Updated ${path.relative(repoRoot, indexerEnvPath)}\n`);
  process.stdout.write(`Updated ${path.relative(repoRoot, uiEnvPath)}\n`);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
