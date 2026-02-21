-include .env
-include contracts/.env

RUST_TOOLCHAIN ?= 1.92.0
RUST_EDITION ?= 2021
CHAIN_ID ?= 99999
PROVER_TYPE ?= cpu
TARGET_DIR ?= target
TAPLO_DOCKER_IMAGE ?= tamasfe/taplo:latest

CRATES_MANIFEST ?= crates/Cargo.toml
PROVER_MANIFEST ?= crates/prover/Cargo.toml
PROGRAM_CRATE ?= issuance-claim
PROVER_CRATE ?= eudemonia_sp1_prover
PROGRAM_NAME ?= $(PROGRAM_CRATE)

WITNESS ?= witness.json
PROOF_OUT ?= proof.hex
PUBLIC_VALUES_OUT ?= public_values.hex
CALLDATA_OUT ?= calldata.json
SP1_PROGRAM_ID ?= payroll_checker
SP1_PROVE_COMMAND ?= succinct prove {program_id} {witness} {proof}
SP1_VERSION ?=
ANVIL_IMAGE ?= ghcr.io/foundry-rs/foundry:stable
ADI_RPC_URL ?= https://rpc.ab.testnet.adifoundation.ai/
MAINNET_RPC_URL ?= https://ethereum-rpc.publicnode.com
ANVIL_ADI_CONTAINER_NAME ?= eudemonia-anvil-adi
LEGACY_ANVIL_ADI_CONTAINER_NAME ?= adi-sp1-anvil-adi
ANVIL_ADI_PORT ?= 8545
ANVIL_ADI_CHAIN_ID ?= 99999
ANVIL_ADI_RPC_URL ?= http://127.0.0.1:$(ANVIL_ADI_PORT)
ANVIL_ADI_DOCKER_RPC_URL ?= http://host.docker.internal:$(ANVIL_ADI_PORT)
ANVIL_MAINNET_CONTAINER_NAME ?= eudemonia-anvil-mainnet
LEGACY_ANVIL_MAINNET_CONTAINER_NAME ?= adi-sp1-anvil-mainnet
ANVIL_MAINNET_PORT ?= 8546
ANVIL_MAINNET_CHAIN_ID ?= 1
ANVIL_MAINNET_RPC_URL ?= http://127.0.0.1:$(ANVIL_MAINNET_PORT)
ANVIL_MAINNET_DOCKER_RPC_URL ?= http://host.docker.internal:$(ANVIL_MAINNET_PORT)
ANVIL_CONTAINER_NAME ?= $(ANVIL_ADI_CONTAINER_NAME)
ANVIL_PORT ?= $(ANVIL_ADI_PORT)
ANVIL_CHAIN_ID ?= $(ANVIL_ADI_CHAIN_ID)
ANVIL_RPC_URL ?= $(ANVIL_ADI_RPC_URL)
ANVIL_DOCKER_RPC_URL ?= $(ANVIL_ADI_DOCKER_RPC_URL)
ANVIL_FORK_URL ?= $(ADI_RPC_URL)
ANVIL_ADMIN_PRIVATE_KEY ?= 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
ANVIL_DEPLOYER_PRIVATE_KEY ?= $(ANVIL_ADMIN_PRIVATE_KEY)
ANVIL_ISSUER_ADDRESS ?= 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
SP1_VERIFIER_ADDRESS ?= 0x397A5f7f3dBd538f23DE225B51f532c34448dA9B
SP1_ARTIFACTS_DIR ?= artifacts/sp1
SP1_ELF_PATH ?= $(SP1_ARTIFACTS_DIR)/$(PROGRAM_NAME)
ELF_PATH ?= $(SP1_ELF_PATH)
SP1_VKEY_FILE ?= $(SP1_ARTIFACTS_DIR)/$(PROGRAM_NAME).vkey.txt
CORE_DEPLOYMENT_FILE ?= contracts/deployments/core-$(ANVIL_CHAIN_ID).json
FORK_MAINNET_DEPLOYMENT_FILE ?= contracts/deployments/fork-mainnet-$(ANVIL_MAINNET_CHAIN_ID).json
LOCAL_DEPLOYMENT_FILE ?= $(CORE_DEPLOYMENT_FILE)
INDEXER_RPC_URL ?= http://host.docker.internal:$(ANVIL_PORT)
UI_RPC_URL ?= http://127.0.0.1:$(ANVIL_PORT)
DEMO_RPC_URL ?= http://127.0.0.1:8545
DEMO_ADMIN_ADDRESS ?= 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
DEMO_ADMIN_KEY ?= 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
DEMO_ISSUER_ADDRESS ?= 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
DEMO_ISSUER_KEY ?= 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
DEMO_EMPLOYEE_2_ADDRESS ?= 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
DEMO_EMPLOYEE_2_KEY ?= 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
DEMO_EMPLOYEE_3_ADDRESS ?= 0x90F79bf6EB2c4f870365E785982E1f101E93b906
DEMO_EMPLOYEE_3_KEY ?= 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
DEMO_EMPLOYEE_4_ADDRESS ?= 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
DEMO_EMPLOYEE_4_KEY ?= 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
DEMO_EMPLOYEE_5_ADDRESS ?= 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
DEMO_EMPLOYEE_5_KEY ?= 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba
DEMO_EMPLOYEE_6_ADDRESS ?= 0x976EA74026E726554dB657fA54763abd0C3a0aa9
DEMO_EMPLOYEE_6_KEY ?= 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e
DEMO_EMPLOYEE_7_ADDRESS ?= 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955
DEMO_EMPLOYEE_7_KEY ?= 0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356
DEMO_AUDITOR_8_ADDRESS ?= 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f
DEMO_AUDITOR_8_KEY ?= 0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97
DEMO_AUDITOR_9_ADDRESS ?= 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720
DEMO_AUDITOR_9_KEY ?= 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6
DEMO_EMPLOYEE_ADDRESSES ?= $(DEMO_EMPLOYEE_2_ADDRESS) $(DEMO_EMPLOYEE_3_ADDRESS) $(DEMO_EMPLOYEE_4_ADDRESS) $(DEMO_EMPLOYEE_5_ADDRESS) $(DEMO_EMPLOYEE_6_ADDRESS) $(DEMO_EMPLOYEE_7_ADDRESS)
DEMO_AUDITOR_ADDRESSES ?= $(DEMO_AUDITOR_8_ADDRESS) $(DEMO_AUDITOR_9_ADDRESS)
DEMO_EMPLOYEE_ADDRESS ?= $(DEMO_EMPLOYEE_2_ADDRESS)
DEMO_EMPLOYEE_KEY ?= $(DEMO_EMPLOYEE_2_KEY)
DEMO_ATTESTOR_ADDRESS ?= $(DEMO_AUDITOR_8_ADDRESS)
DEMO_ATTESTOR_KEY ?= $(DEMO_AUDITOR_8_KEY)
DEMO_BENEFICIARY ?= $(DEMO_EMPLOYEE_ADDRESS)
DEMO_THRESHOLD ?= 1
DEMO_CHECKS ?= KYC_PASS,AML_PASS
DEMO_FRESHNESS ?= 31536000
DEMO_AMOUNT ?= 5000
DEMO_ASSET ?= 1
DEMO_PRIVACY ?= none
DEMO_EXPIRY ?= 0
DEMO_DOC_REF ?= DEMO:COMPLIANCE:PAYMENT
DEMO_POLL ?= 5
DEMO_TIMEOUT ?= 300
DEMO_REQUEST_ID ?=

GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m

.PHONY: demo-accounts demo-env demo-last-request-id \
	demo-setup demo-setup-e2 demo-setup-e3 demo-setup-e4 demo-setup-e5 demo-setup-e6 demo-setup-e7 demo-setup-all \
	demo-request demo-request-none demo-request-destination-private demo-request-amount-private demo-request-full-private \
	demo-attest demo-status demo-audit \
	demo-flow demo-flow-all-employees demo-flow-all-employees-all-modes \
	help check-tools \
	check-local-deploy-tools check-sp1-tools \
	anvil-up anvil-down anvil-adi-up anvil-mainnet-up anvil-dual-up anvil-adi-down anvil-mainnet-down anvil-dual-down \
	pin-sp1-toolchain program-vkey generate-program-key deploy-core-contracts deploy-fork-mainnet-contracts assign-demo-participants deploy-all-contracts deploy-local-contracts sync-local-addresses \
	start-components stop-components start-everything stop-everything \
	local-deploy-stack \
	init validate-env install-rust install-taplo install-sp1 setup-submodules install-dependencies \
	fmt lint clippy update check-sp1 \
	sp1-test-sdk sp1-test-program sp1-test sp1-check \
	build-program create-elf create-program-key execute-program generate-groth16-proof generate-proof-gpu generate-proof-mock \
	rust-fmt rust-fmt-check rust-clippy rust-test rust-build \
	contracts-build contracts-test \
	indexer-install indexer-codegen indexer-build indexer-dev worker-dev worker-test \
	ui-install ui-build ui-dev \
	program-build program-execute prover-build prove verify-local emit-calldata \
	build test test-all ci clean show-structure

.DEFAULT_GOAL := help

help:
	@echo "Targets:"
	@echo "  check-tools        Check required CLI tools"
	@echo "  init               Install Rust/SP1 quality tooling and dependencies"
	@echo "  install-rust       Install rustup + $(RUST_TOOLCHAIN)"
	@echo "  install-taplo      Install taplo formatter"
	@echo "  install-sp1        Install SP1 toolchain (cargo-prove)"
	@echo "  fmt                Format Rust and TOML"
	@echo "  lint               Check Rust and TOML formatting"
	@echo "  clippy             Run Rust clippy with -D warnings"
	@echo "  test               Run contracts + Rust + worker tests"
	@echo "  test-all           Alias of test"
	@echo "  ci                 Run lint + clippy + test"
	@echo ""
	@echo "  rust-fmt           Format Rust code"
	@echo "  rust-fmt-check     Check Rust formatting"
	@echo "  rust-clippy        Run Clippy on crates workspace"
	@echo "  rust-test          Run Rust tests"
	@echo "  rust-build         Build Rust workspace"
	@echo ""
	@echo "  contracts-build    Build Solidity contracts"
	@echo "  contracts-test     Run Foundry tests"
	@echo "  anvil-adi-up       Start ADI fork Anvil (chain $(ANVIL_ADI_CHAIN_ID), port $(ANVIL_ADI_PORT))"
	@echo "  anvil-mainnet-up   Start mainnet fork Anvil (chain $(ANVIL_MAINNET_CHAIN_ID), port $(ANVIL_MAINNET_PORT))"
	@echo "  anvil-dual-up      Start both ADI and mainnet fork Anvil instances"
	@echo "  anvil-down         Stop both Anvil containers"
	@echo "  pin-sp1-toolchain  Run sp1up --version <SP1_VERSION> (per SP1 docs)"
	@echo "  sp1-test-sdk       Run SP1 SDK crate tests"
	@echo "  sp1-test-program   Run SP1 guest program crate tests"
	@echo "  sp1-test           Run SP1 SDK + guest unit tests"
	@echo "  sp1-check          Run sp1-test + build-program + create-program-key"
	@echo "  program-vkey       Generate SP1 program vkey from ELF (cargo prove vkey --elf ...)"
	@echo "  build-program      Build SP1 program ELF"
	@echo "  create-program-key Generate SP1 program verification key"
	@echo "  generate-program-key    Build SP1 guest and extract program verification key"
	@echo "  deploy-core-contracts   Deploy core stack using configured SP1 verifier address"
	@echo "  deploy-fork-mainnet-contracts Deploy SP1 verifier + core stack on mainnet-fork Anvil"
	@echo "  assign-demo-participants Assign default EMPLOYEE/AUDITOR roles in PaymentRegistry"
	@echo "  deploy-local-contracts  Alias of deploy-fork-mainnet-contracts"
	@echo "  sync-local-addresses   Update indexer/ui env files from deployment JSON"
	@echo "  start-components       Start indexer/worker/ui/postgres/redis via docker compose"
	@echo "  stop-components        Stop docker compose stack"
	@echo "  deploy-all-contracts   Deploy both stacks (Eudemonia core + mainnet fork verifier/core)"
	@echo "  local-deploy-stack     anvil-dual-up + deploy-all-contracts + sync + start-components"
	@echo "  start-everything       Alias of local-deploy-stack"
	@echo "  stop-everything        Stop components + both Anvil containers"
	@echo ""
	@echo "  demo-accounts          Print default demo account/key mapping"
	@echo "  demo-env               Validate indexer demo environment variables"
	@echo "  demo-setup             Run demo setup (role grant + policy + redis seed)"
	@echo "  demo-setup-all         Run demo-setup for employees 2..7"
	@echo "  demo-request           Create issuance request with current DEMO_* vars"
	@echo "  demo-request-none      Shortcut: DEMO_PRIVACY=none"
	@echo "  demo-request-destination-private Shortcut: DEMO_PRIVACY=dest-private"
	@echo "  demo-request-amount-private      Shortcut: DEMO_PRIVACY=amount-private"
	@echo "  demo-request-full-private        Shortcut: DEMO_PRIVACY=full-private"
	@echo "  demo-last-request-id   Read latest request id from IssuanceRegistry"
	@echo "  demo-attest            Store attestor signature in Redis (requires DEMO_REQUEST_ID)"
	@echo "  demo-status            Poll worker/indexer status (requires DEMO_REQUEST_ID)"
	@echo "  demo-audit             Print full audit view (requires DEMO_REQUEST_ID)"
	@echo "  demo-flow              setup + request + attest + status + audit"
	@echo "  demo-flow-all-employees Run demo-flow for employees 2..7"
	@echo "  demo-flow-all-employees-all-modes Run all employees x all privacy modes"
	@echo ""
	@echo "  indexer-install    Install indexer dependencies"
	@echo "  indexer-codegen    Run Envio codegen"
	@echo "  indexer-build      Build indexer TypeScript"
	@echo "  indexer-dev        Run Envio dev indexer"
	@echo "  worker-dev         Run SP1 worker in watch mode"
	@echo "  worker-test        Run worker tests"
	@echo ""
	@echo "  ui-install         Install UI dependencies"
	@echo "  ui-build           Build UI"
	@echo "  ui-dev             Run UI dev server"
	@echo ""
	@echo "  program-build      Build SP1 guest crate ($(PROGRAM_CRATE))"
	@echo "  program-execute    Execute guest crate with WITNESS JSON from stdin"
	@echo "  prover-build       Build prover crate ($(PROVER_CRATE))"
	@echo "  prove              Generate proof via prover CLI"
	@echo "  verify-local       Verify witness/public values locally"
	@echo "  emit-calldata      Emit calldata JSON from proof/public values"
	@echo ""
	@echo "  build              Build contracts + Rust + indexer + UI"
	@echo "  test               Run contracts + Rust + worker tests"
	@echo "  test-all           Alias of test"
	@echo "  ci                 Run lint + clippy + test"
	@echo "  clean              Clean Rust artifacts"
	@echo "  show-structure     Show top-level project structure"
	@echo ""
	@echo "Variables:"
	@echo "  RUST_TOOLCHAIN=$(RUST_TOOLCHAIN)"
	@echo "  RUST_EDITION=$(RUST_EDITION)"
	@echo "  CHAIN_ID=$(CHAIN_ID)"
	@echo "  PROVER_TYPE=$(PROVER_TYPE)"
	@echo "  PROGRAM_NAME=$(PROGRAM_NAME)"
	@echo "  PROGRAM_CRATE=$(PROGRAM_CRATE)"
	@echo "  WITNESS=$(WITNESS)"
	@echo "  PROOF_OUT=$(PROOF_OUT)"
	@echo "  PUBLIC_VALUES_OUT=$(PUBLIC_VALUES_OUT)"
	@echo "  ADI_RPC_URL=$(ADI_RPC_URL)"
	@echo "  MAINNET_RPC_URL=$(MAINNET_RPC_URL)"
	@echo "  ANVIL_ADI_RPC_URL=$(ANVIL_ADI_RPC_URL)"
	@echo "  ANVIL_MAINNET_RPC_URL=$(ANVIL_MAINNET_RPC_URL)"
	@echo "  SP1_VERSION=$(SP1_VERSION)"
	@echo "  SP1_VERIFIER_ADDRESS=$(SP1_VERIFIER_ADDRESS)"
	@echo "  ANVIL_ADMIN_PRIVATE_KEY=$(ANVIL_ADMIN_PRIVATE_KEY)"
	@echo "  SP1_VKEY_FILE=$(SP1_VKEY_FILE)"

check-tools:
	@echo "$(YELLOW)Checking required tools...$(NC)"
	@command -v rustup >/dev/null 2>&1 || { echo "$(RED)Error: rustup not found. Run 'make install-rust'$(NC)"; exit 1; }
	@command -v taplo >/dev/null 2>&1 || { echo "$(RED)Error: taplo not found. Run 'make install-taplo'$(NC)"; exit 1; }
	@command -v cargo >/dev/null 2>&1 || { echo "$(RED)Error: cargo not found$(NC)"; exit 1; }
	@command -v forge >/dev/null 2>&1 || { echo "$(RED)Error: forge not found$(NC)"; exit 1; }
	@echo "$(GREEN)All tools available$(NC)"

validate-env:
	@echo "$(YELLOW)Validating environment...$(NC)"
	@command -v git >/dev/null 2>&1 || { echo "$(RED)Error: git is required$(NC)"; exit 1; }
	@command -v curl >/dev/null 2>&1 || { echo "$(RED)Error: curl is required$(NC)"; exit 1; }
	@echo "$(GREEN)Environment validated$(NC)"

install-rust:
	@echo "$(YELLOW)Installing Rust toolchain...$(NC)"
	@if ! command -v rustup >/dev/null 2>&1; then \
		echo "Installing rustup..."; \
		curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y; \
		. $$HOME/.cargo/env; \
	fi
	@rustup install $(RUST_TOOLCHAIN)
	@rustup component add rustfmt --toolchain $(RUST_TOOLCHAIN)
	@rustup component add clippy --toolchain $(RUST_TOOLCHAIN)
	@echo "$(GREEN)Rust toolchain installed$(NC)"

install-sp1:
	@echo "$(YELLOW)Installing SP1 toolchain...$(NC)"
	@if ! command -v cargo-prove >/dev/null 2>&1; then \
		echo "Installing SP1 via sp1up..."; \
		curl -L https://sp1.succinct.xyz | bash; \
		. $$HOME/.bashrc || . $$HOME/.zshrc || true; \
		sp1up; \
	fi
	@echo "$(GREEN)SP1 toolchain installed$(NC)"

install-taplo:
	@echo "$(YELLOW)Installing Taplo...$(NC)"
	@if ! command -v taplo >/dev/null 2>&1; then \
		cargo install taplo-cli --locked; \
	fi
	@echo "$(GREEN)Taplo installed$(NC)"

setup-submodules:
	@echo "$(YELLOW)Setting up submodules...$(NC)"
	@if [ -d "contracts" ]; then \
		cd contracts && git submodule update --init --recursive; \
	else \
		git submodule update --init --recursive; \
	fi
	@echo "$(GREEN)Submodules initialized$(NC)"

install-dependencies:
	@echo "$(YELLOW)Fetching Rust dependencies...$(NC)"
	@cargo +$(RUST_TOOLCHAIN) fetch --manifest-path $(CRATES_MANIFEST)
	@echo "$(GREEN)Dependencies fetched$(NC)"

init: validate-env install-rust install-taplo install-sp1 setup-submodules install-dependencies
	@echo "$(GREEN)Project initialization complete$(NC)"

check-local-deploy-tools:
	@command -v docker >/dev/null 2>&1 || { echo "docker not found"; exit 1; }
	@docker compose version >/dev/null 2>&1 || { echo "docker compose not found"; exit 1; }
	@command -v cast >/dev/null 2>&1 || { echo "cast not found"; exit 1; }
	@command -v node >/dev/null 2>&1 || { echo "node not found"; exit 1; }

check-sp1-tools:
	@command -v cargo >/dev/null 2>&1 || { echo "cargo not found"; exit 1; }
	@cargo prove --help >/dev/null 2>&1 || { echo "cargo-prove not found; install SP1 toolchain first"; exit 1; }

check-sp1: check-sp1-tools
	@echo "$(GREEN)SP1 tools available$(NC)"

fmt: check-tools
	@echo "$(YELLOW)Formatting code...$(NC)"
	@cargo +$(RUST_TOOLCHAIN) fmt --manifest-path $(CRATES_MANIFEST) --all
	@taplo fmt || docker run --rm -u $$(id -u):$$(id -g) -v "$$(pwd):/work" -w /work $(TAPLO_DOCKER_IMAGE) fmt
	@echo "$(GREEN)Code formatted$(NC)"

lint: check-tools
	@echo "$(YELLOW)Checking code formatting...$(NC)"
	@cargo +$(RUST_TOOLCHAIN) fmt --manifest-path $(CRATES_MANIFEST) --all -- --check
	@taplo fmt --check || docker run --rm -u $$(id -u):$$(id -g) -v "$$(pwd):/work" -w /work $(TAPLO_DOCKER_IMAGE) fmt --check
	@echo "$(GREEN)Code formatting OK$(NC)"

clippy: check-tools
	@echo "$(YELLOW)Running clippy...$(NC)"
	@cargo +$(RUST_TOOLCHAIN) clippy --manifest-path $(CRATES_MANIFEST) --workspace --all-targets --all-features -- -D warnings
	@echo "$(GREEN)Clippy checks passed$(NC)"

test: contracts-test rust-test worker-test
	@echo "$(GREEN)All tests passed$(NC)"

update:
	@echo "$(YELLOW)Updating dependencies...$(NC)"
	@cargo +$(RUST_TOOLCHAIN) update --manifest-path $(CRATES_MANIFEST)
	@git submodule update --remote
	@echo "$(GREEN)Update complete$(NC)"

anvil-adi-up: check-local-deploy-tools
	@test -n "$(ADI_RPC_URL)" || { echo "ADI_RPC_URL is required"; exit 1; }
	@case "$(ADI_RPC_URL)" in \
		http://127.0.0.1:$(ANVIL_ADI_PORT)|http://localhost:$(ANVIL_ADI_PORT)|ws://127.0.0.1:$(ANVIL_ADI_PORT)|ws://localhost:$(ANVIL_ADI_PORT)) \
			echo "ADI_RPC_URL points to local Anvil ($(ADI_RPC_URL)); set ADI_RPC_URL to a real ADI RPC endpoint"; \
			exit 1 ;; \
	esac
	@docker rm -f $(ANVIL_ADI_CONTAINER_NAME) >/dev/null 2>&1 || true
	@docker rm -f $(LEGACY_ANVIL_ADI_CONTAINER_NAME) >/dev/null 2>&1 || true
	@docker run -d --rm \
		--name $(ANVIL_ADI_CONTAINER_NAME) \
		-p $(ANVIL_ADI_PORT):8545 \
		--entrypoint anvil \
		$(ANVIL_IMAGE) \
		--host 0.0.0.0 --port 8545 --chain-id $(ANVIL_ADI_CHAIN_ID) --fork-url $(ADI_RPC_URL) >/dev/null
	@for i in $$(seq 1 30); do \
		actual_chain_id=$$(cast chain-id --rpc-url $(ANVIL_ADI_RPC_URL) 2>/dev/null || true); \
		if [ "$$actual_chain_id" = "$(ANVIL_ADI_CHAIN_ID)" ]; then \
			break; \
		fi; \
		if [ $$i -eq 30 ]; then \
			echo "adi anvil did not become ready with chain id $(ANVIL_ADI_CHAIN_ID) at $(ANVIL_ADI_RPC_URL)"; \
			docker logs --tail 80 $(ANVIL_ADI_CONTAINER_NAME) || true; \
			exit 1; \
		fi; \
		sleep 1; \
	done
	@echo "adi anvil is ready on $(ANVIL_ADI_RPC_URL) (chain id $(ANVIL_ADI_CHAIN_ID))"

anvil-mainnet-up: check-local-deploy-tools
	@test -n "$(MAINNET_RPC_URL)" || { echo "MAINNET_RPC_URL is required"; exit 1; }
	@case "$(MAINNET_RPC_URL)" in \
		http://127.0.0.1:$(ANVIL_ADI_PORT)|http://localhost:$(ANVIL_ADI_PORT)|ws://127.0.0.1:$(ANVIL_ADI_PORT)|ws://localhost:$(ANVIL_ADI_PORT)|http://127.0.0.1:$(ANVIL_MAINNET_PORT)|http://localhost:$(ANVIL_MAINNET_PORT)|ws://127.0.0.1:$(ANVIL_MAINNET_PORT)|ws://localhost:$(ANVIL_MAINNET_PORT)) \
			echo "MAINNET_RPC_URL points to local Anvil ($(MAINNET_RPC_URL)); set MAINNET_RPC_URL to a real mainnet RPC endpoint"; \
			exit 1 ;; \
	esac
	@docker rm -f $(ANVIL_MAINNET_CONTAINER_NAME) >/dev/null 2>&1 || true
	@docker rm -f $(LEGACY_ANVIL_MAINNET_CONTAINER_NAME) >/dev/null 2>&1 || true
	@docker run -d --rm \
		--name $(ANVIL_MAINNET_CONTAINER_NAME) \
		-p $(ANVIL_MAINNET_PORT):8545 \
		--entrypoint anvil \
		$(ANVIL_IMAGE) \
		--host 0.0.0.0 --port 8545 --chain-id $(ANVIL_MAINNET_CHAIN_ID) --fork-url $(MAINNET_RPC_URL) >/dev/null
	@for i in $$(seq 1 30); do \
		actual_chain_id=$$(cast chain-id --rpc-url $(ANVIL_MAINNET_RPC_URL) 2>/dev/null || true); \
		if [ "$$actual_chain_id" = "$(ANVIL_MAINNET_CHAIN_ID)" ]; then \
			break; \
		fi; \
		if [ $$i -eq 30 ]; then \
			echo "mainnet anvil did not become ready with chain id $(ANVIL_MAINNET_CHAIN_ID) at $(ANVIL_MAINNET_RPC_URL)"; \
			docker logs --tail 80 $(ANVIL_MAINNET_CONTAINER_NAME) || true; \
			exit 1; \
		fi; \
		sleep 1; \
	done
	@echo "mainnet anvil is ready on $(ANVIL_MAINNET_RPC_URL) (chain id $(ANVIL_MAINNET_CHAIN_ID))"

anvil-dual-up: anvil-adi-up anvil-mainnet-up
	@echo "dual anvil instances are ready"

anvil-up: anvil-adi-up
	@echo "anvil-up completed via anvil-adi-up"

anvil-adi-down:
	@docker rm -f $(ANVIL_ADI_CONTAINER_NAME) >/dev/null 2>&1 || true
	@docker rm -f $(LEGACY_ANVIL_ADI_CONTAINER_NAME) >/dev/null 2>&1 || true
	@echo "adi anvil container stopped"

anvil-mainnet-down:
	@docker rm -f $(ANVIL_MAINNET_CONTAINER_NAME) >/dev/null 2>&1 || true
	@docker rm -f $(LEGACY_ANVIL_MAINNET_CONTAINER_NAME) >/dev/null 2>&1 || true
	@echo "mainnet anvil container stopped"

anvil-dual-down: anvil-mainnet-down anvil-adi-down
	@echo "dual anvil containers stopped"

anvil-down: anvil-dual-down
	@echo "anvil-down completed via anvil-dual-down"

pin-sp1-toolchain:
	@test -n "$(SP1_VERSION)" || { echo "SP1_VERSION is required, e.g. make pin-sp1-toolchain SP1_VERSION=v5.0.8"; exit 1; }
	@command -v sp1up >/dev/null 2>&1 || { echo "sp1up not found; install via curl -L https://sp1.succinct.xyz | bash"; exit 1; }
	@sp1up --version "$(SP1_VERSION)"

build-program: check-sp1
	@echo "$(YELLOW)Building SP1 program ($(PROGRAM_NAME))...$(NC)"
	@mkdir -p "$(SP1_ARTIFACTS_DIR)"
	@cargo prove build --docker --packages $(PROGRAM_NAME) --elf-name $(PROGRAM_NAME) --output-directory "$(SP1_ARTIFACTS_DIR)"
	@echo "$(GREEN)SP1 program built to $(SP1_ELF_PATH)$(NC)"

create-elf: build-program

program-vkey: check-sp1-tools
	@test -f "$(SP1_ELF_PATH)" || { echo "ELF not found at $(SP1_ELF_PATH)"; echo "run: make generate-program-key"; exit 1; }
	@if [ -n "$(SP1_VERSION)" ]; then \
		command -v sp1up >/dev/null 2>&1 || { echo "sp1up not found; install via curl -L https://sp1.succinct.xyz | bash"; exit 1; }; \
		sp1up --version "$(SP1_VERSION)"; \
	fi
	@cargo prove vkey --elf "$(SP1_ELF_PATH)" | tee "$(SP1_VKEY_FILE).raw" >/dev/null
	@grep -Eo '0x[0-9a-fA-F]{64}' "$(SP1_VKEY_FILE).raw" | tail -n 1 > "$(SP1_VKEY_FILE)"
	@test -s "$(SP1_VKEY_FILE)" || { echo "failed to parse program verification key"; cat "$(SP1_VKEY_FILE).raw"; exit 1; }
	@rm -f "$(SP1_VKEY_FILE).raw"
	@echo "program verification key generated: $$(cat $(SP1_VKEY_FILE))"

create-program-key: build-program
	@$(MAKE) --no-print-directory program-vkey SP1_VERSION="$(SP1_VERSION)"

generate-program-key: create-program-key
	@echo "$(GREEN)Program key ready at $(SP1_VKEY_FILE)$(NC)"

execute-program: program-execute

generate-groth16-proof: prove

generate-proof-gpu: PROVER_TYPE=gpu
generate-proof-gpu: generate-groth16-proof

generate-proof-mock: PROVER_TYPE=local
generate-proof-mock: generate-groth16-proof

deploy-core-contracts: check-local-deploy-tools generate-program-key
	@test -f "$(SP1_VKEY_FILE)" || { echo "program key file not found: $(SP1_VKEY_FILE)"; exit 1; }
	@mkdir -p contracts/deployments
	@PROGRAM_VKEY=$$(cat "$(SP1_VKEY_FILE)"); \
		cd contracts && \
			docker run --rm \
				--add-host=host.docker.internal:host-gateway \
				-v "$$(pwd):/workspace" \
				-w /workspace \
				-e PRIVATE_KEY=$(ANVIL_DEPLOYER_PRIVATE_KEY) \
				-e ISSUER_ADDRESS=$(ANVIL_ISSUER_ADDRESS) \
				-e DEPLOY_SP1_VERIFIER=false \
				-e SP1_VERIFIER_ADDRESS=$(SP1_VERIFIER_ADDRESS) \
				-e PROGRAM_VERIFICATION_KEY=$$PROGRAM_VKEY \
				--entrypoint forge \
			$(ANVIL_IMAGE) \
			script script/EudemoniaDeployer.sol:EudemoniaDeployer \
			--rpc-url $(ANVIL_DOCKER_RPC_URL) \
			--private-key $(ANVIL_DEPLOYER_PRIVATE_KEY) \
			--broadcast
	@test -f "$(CORE_DEPLOYMENT_FILE)" || { echo "deployment file not found: $(CORE_DEPLOYMENT_FILE)"; exit 1; }
	@echo "deployed core stack metadata: $(CORE_DEPLOYMENT_FILE)"

deploy-fork-mainnet-contracts: check-local-deploy-tools generate-program-key
	@test -f "$(SP1_VKEY_FILE)" || { echo "program key file not found: $(SP1_VKEY_FILE)"; exit 1; }
	@mkdir -p contracts/deployments
	@PROGRAM_VKEY=$$(cat "$(SP1_VKEY_FILE)"); \
		cd contracts && \
			docker run --rm \
				--add-host=host.docker.internal:host-gateway \
				-v "$$(pwd):/workspace" \
				-w /workspace \
				-e PRIVATE_KEY=$(ANVIL_DEPLOYER_PRIVATE_KEY) \
				-e ISSUER_ADDRESS=$(ANVIL_ISSUER_ADDRESS) \
				-e DEPLOY_SP1_VERIFIER=true \
				-e PROGRAM_VERIFICATION_KEY=$$PROGRAM_VKEY \
				--entrypoint forge \
			$(ANVIL_IMAGE) \
			script script/EudemoniaDeployer.sol:EudemoniaDeployer \
			--rpc-url $(ANVIL_MAINNET_DOCKER_RPC_URL) \
			--private-key $(ANVIL_DEPLOYER_PRIVATE_KEY) \
			--broadcast
	@test -f "$(FORK_MAINNET_DEPLOYMENT_FILE)" || { echo "deployment file not found: $(FORK_MAINNET_DEPLOYMENT_FILE)"; exit 1; }
	@echo "deployed fork-mainnet stack metadata: $(FORK_MAINNET_DEPLOYMENT_FILE)"

assign-demo-participants: check-local-deploy-tools
	@test -f "$(CORE_DEPLOYMENT_FILE)" || { echo "core deployment file not found: $(CORE_DEPLOYMENT_FILE)"; exit 1; }
	@PAYMENT_REGISTRY=$$(node -e "const fs=require('fs');const data=JSON.parse(fs.readFileSync('$(CORE_DEPLOYMENT_FILE)','utf8'));process.stdout.write(data?.contracts?.paymentRegistry ?? '')"); \
		test -n "$$PAYMENT_REGISTRY" || { echo "paymentRegistry address not found in $(CORE_DEPLOYMENT_FILE)"; exit 1; }; \
			cd contracts && \
			docker run --rm \
				--add-host=host.docker.internal:host-gateway \
				-v "$$(pwd):/workspace" \
				-w /workspace \
				-e PRIVATE_KEY=$(ANVIL_ADMIN_PRIVATE_KEY) \
				-e PAYMENT_REGISTRY_ADDRESS=$$PAYMENT_REGISTRY \
				--entrypoint forge \
			$(ANVIL_IMAGE) \
			script script/AssignDemoParticipants.s.sol:AssignDemoParticipants \
			--rpc-url $(ANVIL_DOCKER_RPC_URL) \
			--private-key $(ANVIL_ADMIN_PRIVATE_KEY) \
			--broadcast
	@rm -rf contracts/broadcast/AssignDemoParticipants.s.sol contracts/cache/AssignDemoParticipants.s.sol
	@echo "assigned default employee/auditor roles in PaymentRegistry"

deploy-all-contracts: deploy-fork-mainnet-contracts deploy-core-contracts
	@echo "deployed both core and fork-mainnet stacks"

deploy-local-contracts: deploy-all-contracts
	@echo "deploy-local-contracts completed via deploy-all-contracts"

sync-local-addresses:
	@test -f "$(LOCAL_DEPLOYMENT_FILE)" || { echo "deployment file not found: $(LOCAL_DEPLOYMENT_FILE)"; exit 1; }
	@node scripts/sync-local-deployment-envs.mjs \
		--deployment "$(LOCAL_DEPLOYMENT_FILE)" \
		--indexer-rpc-url "$(INDEXER_RPC_URL)" \
		--ui-rpc-url "$(UI_RPC_URL)" \
		--deployment-private-key "$(ANVIL_DEPLOYER_PRIVATE_KEY)"
	@echo "indexer/config.yaml reads ISSUANCE_REGISTRY, POLICY_REGISTRY, TOKENISATION_ENGINE, RWA_TOKEN, CONFIDENTIAL_SETTLEMENT from indexer/.env"
	@echo "indexer/.env also updated with PRIVATE_KEY and SP1_PROGRAM_VKEY"

start-components:
	@INDEXER_ENV_FILE=./indexer/.env UI_ENV_FILE=./ui/.env docker compose -f docker-compose.yaml up -d --build

stop-components:
	@INDEXER_ENV_FILE=./indexer/.env UI_ENV_FILE=./ui/.env docker compose -f docker-compose.yaml down

local-deploy-stack: anvil-dual-up deploy-all-contracts assign-demo-participants sync-local-addresses start-components
	@echo "local stack ready"

start-everything: local-deploy-stack
	@echo "start-everything completed"

stop-everything: stop-components anvil-dual-down
	@echo "stop-everything completed"

rust-fmt: fmt

rust-fmt-check: lint

rust-clippy: clippy

sp1-test-sdk: check-tools
	@echo "$(YELLOW)Running SP1 SDK tests...$(NC)"
	@cargo +$(RUST_TOOLCHAIN) test --manifest-path $(CRATES_MANIFEST) -p eudemonia_sp1_sdk
	@echo "$(GREEN)SP1 SDK tests passed$(NC)"

sp1-test-program: check-tools
	@echo "$(YELLOW)Running SP1 guest tests ($(PROGRAM_CRATE))...$(NC)"
	@cargo +$(RUST_TOOLCHAIN) test --manifest-path $(CRATES_MANIFEST) -p $(PROGRAM_CRATE)
	@echo "$(GREEN)SP1 guest tests passed$(NC)"

sp1-test: sp1-test-sdk sp1-test-program
	@echo "$(GREEN)SP1 unit tests passed$(NC)"

sp1-check: sp1-test build-program create-program-key
	@echo "$(GREEN)SP1 correctness checks passed$(NC)"

rust-test: check-tools
	@echo "$(YELLOW)Running Rust tests...$(NC)"
	@cargo +$(RUST_TOOLCHAIN) test --manifest-path $(CRATES_MANIFEST) --workspace
	@echo "$(GREEN)Rust tests passed$(NC)"

rust-build:
	cargo +$(RUST_TOOLCHAIN) build --manifest-path $(CRATES_MANIFEST) --workspace

contracts-build:
	cd contracts && forge build

contracts-test:
	cd contracts && forge test -vvv

indexer-install:
	cd indexer && npm install

indexer-codegen: indexer-install
	cd indexer && npm run codegen

indexer-build: indexer-install
	cd indexer && npm run build

indexer-dev: indexer-install
	cd indexer && npm run dev

worker-dev: indexer-install
	cd indexer && npm run worker:dev

worker-test: indexer-install
	cd indexer && npm run test:worker

ui-install:
	cd ui && npm install

ui-build: ui-install
	cd ui && npm run build

ui-dev: ui-install
	cd ui && npm run dev

program-build:
	cargo +$(RUST_TOOLCHAIN) build --manifest-path $(CRATES_MANIFEST) -p $(PROGRAM_CRATE)

program-execute:
	@test -f "$(WITNESS)" || { echo "witness file not found: $(WITNESS)"; exit 1; }
	cat "$(WITNESS)" | cargo +$(RUST_TOOLCHAIN) run --manifest-path $(CRATES_MANIFEST) -p $(PROGRAM_CRATE) > "$(PUBLIC_VALUES_OUT)"

prover-build:
	cargo +$(RUST_TOOLCHAIN) build --manifest-path $(CRATES_MANIFEST) -p $(PROVER_CRATE)

prove: prover-build
	@test -f "$(WITNESS)" || { echo "witness file not found: $(WITNESS)"; exit 1; }
	cargo +$(RUST_TOOLCHAIN) run --manifest-path $(PROVER_MANIFEST) -- \
		prove \
		--witness "$(WITNESS)" \
		--proof-out "$(PROOF_OUT)" \
		--public-values-out "$(PUBLIC_VALUES_OUT)" \
		--sp1-command "$(SP1_PROVE_COMMAND)" \
		--program-id "$(SP1_PROGRAM_ID)"

verify-local: prover-build
	@test -f "$(WITNESS)" || { echo "witness file not found: $(WITNESS)"; exit 1; }
	@test -f "$(PUBLIC_VALUES_OUT)" || { echo "public values file not found: $(PUBLIC_VALUES_OUT)"; exit 1; }
	cargo +$(RUST_TOOLCHAIN) run --manifest-path $(PROVER_MANIFEST) -- \
		verify-local \
		--witness "$(WITNESS)" \
		--public-values "$(PUBLIC_VALUES_OUT)" \
		--program-id "$(SP1_PROGRAM_ID)"

emit-calldata: prover-build
	@test -f "$(PROOF_OUT)" || { echo "proof file not found: $(PROOF_OUT)"; exit 1; }
	@test -f "$(PUBLIC_VALUES_OUT)" || { echo "public values file not found: $(PUBLIC_VALUES_OUT)"; exit 1; }
	cargo +$(RUST_TOOLCHAIN) run --manifest-path $(PROVER_MANIFEST) -- \
		emit-calldata \
		--proof "$(PROOF_OUT)" \
		--public-values "$(PUBLIC_VALUES_OUT)" \
		--out "$(CALLDATA_OUT)"

build: contracts-build rust-build indexer-build ui-build

test-all: test

ci: lint clippy test

clean:
	cargo +$(RUST_TOOLCHAIN) clean --manifest-path $(CRATES_MANIFEST)
	rm -rf $(TARGET_DIR)/

show-structure:
	@echo "Top-level:"
	@find . -maxdepth 2 -mindepth 1 -type d \
		-not -path "./.git*" \
		-not -path "./contracts/lib*" \
		| sort

demo-accounts:
	@echo "Admin   (0): $(DEMO_ADMIN_ADDRESS)  $(DEMO_ADMIN_KEY)"
	@echo "Issuer  (1): $(DEMO_ISSUER_ADDRESS)  $(DEMO_ISSUER_KEY)"
	@echo "Employee(2): $(DEMO_EMPLOYEE_2_ADDRESS)  $(DEMO_EMPLOYEE_2_KEY)"
	@echo "Employee(3): $(DEMO_EMPLOYEE_3_ADDRESS)  $(DEMO_EMPLOYEE_3_KEY)"
	@echo "Employee(4): $(DEMO_EMPLOYEE_4_ADDRESS)  $(DEMO_EMPLOYEE_4_KEY)"
	@echo "Employee(5): $(DEMO_EMPLOYEE_5_ADDRESS)  $(DEMO_EMPLOYEE_5_KEY)"
	@echo "Employee(6): $(DEMO_EMPLOYEE_6_ADDRESS)  $(DEMO_EMPLOYEE_6_KEY)"
	@echo "Employee(7): $(DEMO_EMPLOYEE_7_ADDRESS)  $(DEMO_EMPLOYEE_7_KEY)"
	@echo "Auditor (8): $(DEMO_AUDITOR_8_ADDRESS)  $(DEMO_AUDITOR_8_KEY)"
	@echo "Auditor (9): $(DEMO_AUDITOR_9_ADDRESS)  $(DEMO_AUDITOR_9_KEY)"

demo-env:
	@test -f indexer/.env || { echo "indexer/.env not found"; exit 1; }
	@for var in PAYMENT_REGISTRY POLICY_REGISTRY ISSUANCE_REGISTRY TOKENISATION_ENGINE RWA_TOKEN; do \
		grep -q "^$$var=" indexer/.env || { echo "$$var missing in indexer/.env"; exit 1; }; \
	done
	@echo "demo env ready"

demo-last-request-id:
	@$(MAKE) --no-print-directory demo-env >/dev/null
	@(cd indexer && ADI_RPC_URL=$(DEMO_RPC_URL) bun -e "import 'dotenv/config'; import { createPublicClient, http, parseAbi } from 'viem'; const address = process.env.ISSUANCE_REGISTRY; if (!address) { console.error('ISSUANCE_REGISTRY missing in indexer/.env'); process.exit(1); } const client = createPublicClient({ transport: http(process.env.ADI_RPC_URL ?? 'http://127.0.0.1:8545') }); const abi = parseAbi(['function nextRequestIdentifier() view returns (uint256)']); const next = await client.readContract({ address, abi, functionName: 'nextRequestIdentifier' }); if (next === 0n) { console.error('No requests exist yet'); process.exit(1); } process.stdout.write((next - 1n).toString());")

demo-setup: demo-env
	@(cd indexer && ADI_RPC_URL=$(DEMO_RPC_URL) bun run src/demo/01-setup.ts \
		--admin-key $(DEMO_ADMIN_KEY) \
		--issuer $(DEMO_ISSUER_ADDRESS) \
		--employee $(DEMO_EMPLOYEE_ADDRESS) \
		--attestor $(DEMO_ATTESTOR_ADDRESS) \
		--threshold $(DEMO_THRESHOLD) \
		--checks $(DEMO_CHECKS) \
		--freshness $(DEMO_FRESHNESS))

demo-setup-e2:
	@$(MAKE) --no-print-directory demo-setup DEMO_EMPLOYEE_ADDRESS=$(DEMO_EMPLOYEE_2_ADDRESS)

demo-setup-e3:
	@$(MAKE) --no-print-directory demo-setup DEMO_EMPLOYEE_ADDRESS=$(DEMO_EMPLOYEE_3_ADDRESS)

demo-setup-e4:
	@$(MAKE) --no-print-directory demo-setup DEMO_EMPLOYEE_ADDRESS=$(DEMO_EMPLOYEE_4_ADDRESS)

demo-setup-e5:
	@$(MAKE) --no-print-directory demo-setup DEMO_EMPLOYEE_ADDRESS=$(DEMO_EMPLOYEE_5_ADDRESS)

demo-setup-e6:
	@$(MAKE) --no-print-directory demo-setup DEMO_EMPLOYEE_ADDRESS=$(DEMO_EMPLOYEE_6_ADDRESS)

demo-setup-e7:
	@$(MAKE) --no-print-directory demo-setup DEMO_EMPLOYEE_ADDRESS=$(DEMO_EMPLOYEE_7_ADDRESS)

demo-setup-all:
	@for employee in $(DEMO_EMPLOYEE_ADDRESSES); do \
		$(MAKE) --no-print-directory demo-setup DEMO_EMPLOYEE_ADDRESS=$$employee; \
	done

demo-request: demo-env
	@(cd indexer && ADI_RPC_URL=$(DEMO_RPC_URL) bun run src/demo/02-request.ts \
		--issuer-key $(DEMO_ISSUER_KEY) \
		--subject $(DEMO_EMPLOYEE_ADDRESS) \
		--beneficiary $(DEMO_BENEFICIARY) \
		--amount $(DEMO_AMOUNT) \
		--asset $(DEMO_ASSET) \
		--privacy $(DEMO_PRIVACY) \
		--expiry $(DEMO_EXPIRY) \
		--doc-ref "$(DEMO_DOC_REF)")

demo-request-none:
	@$(MAKE) --no-print-directory demo-request DEMO_PRIVACY=none

demo-request-destination-private:
	@$(MAKE) --no-print-directory demo-request DEMO_PRIVACY=dest-private

demo-request-amount-private:
	@$(MAKE) --no-print-directory demo-request DEMO_PRIVACY=amount-private

demo-request-full-private:
	@$(MAKE) --no-print-directory demo-request DEMO_PRIVACY=full-private

demo-attest: demo-env
	@test -n "$(DEMO_REQUEST_ID)" || { echo "DEMO_REQUEST_ID is required"; exit 1; }
	@(cd indexer && ADI_RPC_URL=$(DEMO_RPC_URL) bun run src/demo/03-attest.ts \
		--attestor-key $(DEMO_ATTESTOR_KEY) \
		--request-id $(DEMO_REQUEST_ID))

demo-status: demo-env
	@test -n "$(DEMO_REQUEST_ID)" || { echo "DEMO_REQUEST_ID is required"; exit 1; }
	@(cd indexer && ADI_RPC_URL=$(DEMO_RPC_URL) bun run src/demo/04-status.ts \
		--request-id $(DEMO_REQUEST_ID) \
		--poll $(DEMO_POLL) \
		--timeout $(DEMO_TIMEOUT))

demo-audit: demo-env
	@test -n "$(DEMO_REQUEST_ID)" || { echo "DEMO_REQUEST_ID is required"; exit 1; }
	@(cd indexer && ADI_RPC_URL=$(DEMO_RPC_URL) bun run src/demo/05-audit.ts \
		--request-id $(DEMO_REQUEST_ID))

demo-flow:
	@$(MAKE) --no-print-directory demo-setup
	@$(MAKE) --no-print-directory demo-request
	@REQUEST_ID=$$($(MAKE) --no-print-directory demo-last-request-id | tail -n1); \
	case "$$REQUEST_ID" in ''|*[!0-9]*) echo "Failed to resolve DEMO_REQUEST_ID: $$REQUEST_ID"; exit 1;; esac; \
	$(MAKE) --no-print-directory demo-attest DEMO_REQUEST_ID=$$REQUEST_ID; \
	$(MAKE) --no-print-directory demo-status DEMO_REQUEST_ID=$$REQUEST_ID; \
	$(MAKE) --no-print-directory demo-audit DEMO_REQUEST_ID=$$REQUEST_ID

demo-flow-all-employees:
	@for employee in $(DEMO_EMPLOYEE_ADDRESSES); do \
		$(MAKE) --no-print-directory demo-flow \
			DEMO_EMPLOYEE_ADDRESS=$$employee \
			DEMO_BENEFICIARY=$$employee \
			DEMO_DOC_REF="DEMO:$$employee:$$(date +%s)"; \
	done

demo-flow-all-employees-all-modes:
	@for employee in $(DEMO_EMPLOYEE_ADDRESSES); do \
		for mode in none dest-private amount-private full-private; do \
			$(MAKE) --no-print-directory demo-flow \
				DEMO_EMPLOYEE_ADDRESS=$$employee \
				DEMO_BENEFICIARY=$$employee \
				DEMO_PRIVACY=$$mode \
				DEMO_DOC_REF="DEMO:$$employee:$$mode:$$(date +%s)"; \
		done; \
	done
