// Contract ABIs and addresses for FHEVM DCA System
import { ethers } from "ethers";

// Contract addresses with environment variable support
export const CONTRACT_ADDRESSES = {
  DCA_INTENT_REGISTRY: import.meta.env.VITE_DCA_INTENT_REGISTRY || "0x3F9D1D64CbbD69aBcB79faBD156817655b48050c",
  BATCH_EXECUTOR: import.meta.env.VITE_BATCH_EXECUTOR || "0x7dc70ce7f2a6Ad3895Ce84c7cd0CeC3Eec4b8C70",
  TOKEN_VAULT: import.meta.env.VITE_TOKEN_VAULT || "0x8D91b58336bc43222D55bC2C5aB3DEF468A54050",
  REWARD_VAULT: import.meta.env.VITE_REWARD_VAULT || "0x98Eec4C5bA3DF65be22106E0E5E872454e8834db",
  DEX_ADAPTER: import.meta.env.VITE_DEX_ADAPTER || "0xAF65e8895ba60db17486E69B052EA39D52717d2f",
  TIME_BASED_TRIGGER: import.meta.env.VITE_TIME_BASED_TRIGGER || "0x9ca1815693fB7D887A146D574F3a13033b4E1976",
  USDC_TOKEN: import.meta.env.VITE_USDC_TOKEN || "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  WETH_TOKEN: import.meta.env.VITE_WETH_TOKEN || "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
  UNISWAP_V3_ROUTER: import.meta.env.VITE_UNISWAP_V3_ROUTER || "0x3bFA4769F5b852341A2e45B545b6b8CE4A7572C8"
} as const;

// Network configuration
export const NETWORK_CONFIG = {
  CHAIN_ID: import.meta.env.VITE_CHAIN_ID || "11155111", // Sepolia
  RPC_URL: import.meta.env.VITE_RPC_URL || "https://sepolia.infura.io/v3/your-project-id",
  EXPLORER_URL: import.meta.env.VITE_EXPLORER_URL || "https://sepolia.etherscan.io"
} as const;

// FHEVM Configuration
export const FHEVM_CONFIG = {
  NETWORK_URL: import.meta.env.VITE_FHE_NETWORK_URL || "https://api.fhenix.io",
  CHAIN_ID: import.meta.env.VITE_FHE_CHAIN_ID || "42069"
} as const;

// DCA Intent Registry ABI
export const DCA_INTENT_REGISTRY_ABI = [
  // Events
  "event IntentSubmitted(address indexed user)",
  "event IntentUpdated(address indexed user)",
  "event IntentDeactivated(address indexed user)",
  "event BatchExecuted(uint256 indexed batchId, uint32 participantCount, uint256 totalAmount)",
  "event BatchTimeout(uint256 indexed batchId)",
  "event DynamicConditionTriggered(address indexed user, uint256 priceDrop, uint256 multiplier)",
  "event PriceUpdated(uint256 newPrice, uint256 timestamp)",

  // Core functions
  "function submitTestIntent(uint64 totalBudget, uint64 amountPerInterval, uint32 intervalSeconds, uint32 totalPeriods) external",
  "function submitDCAIntent(euint256 totalBudget, euint256 amountPerInterval, uint64 intervalSeconds, uint32 totalPeriods, euint256 dipThreshold, euint256 dipMultiplier, uint32 dipRemainingBuys) external",
  "function deactivateIntent() external",
  "function executeBatch() external",
  "function forceBatchExecution() external",
  "function updatePriceAndCheckConditions(uint256 newPrice) external",

  // View functions
  "function getMyParams() external view returns (euint64 budget, euint64 amountPerInterval, euint32 intervalSeconds, euint32 totalPeriods, euint64 spent, bool active)",
  "function getActiveUserCount() external view returns (uint256)",
  "function getActiveUsers() external view returns (address[] memory)",
  "function getCurrentBatchInfo() external view returns (uint32 participantCount, uint64 batchDeadline, bool isExecuted, address[] memory participants, uint256 batchId)",
  "function getUserIntentInfo(address user) external view returns (bool isActive, uint256 createdAt, uint32 executedPeriods, uint64 nextExecutionTime, bool hasDynamicConditions)",
  "function getBatchConfig() external pure returns (uint32 targetSize, uint64 timeout, uint32 minSize, uint32 maxSize)",

  // Admin functions
  "function setDexAdapter(address dexAdapter) external",
  "function setTokenVault(address tokenVault) external",
  "function setPriceOracle(address priceOracle) external",
  "function getOwner() external view returns (address)"
] as const;

// Batch Executor ABI
export const BATCH_EXECUTOR_ABI = [
  // Events
  "event BatchPrepared(uint256 indexed batchId, uint256 userCount, uint256 totalAmount)",
  "event BatchDecryptionRequested(uint256 indexed batchId, uint256 requestId)",
  "event BatchDecryptionFulfilled(uint256 indexed batchId, uint64 decryptedTotal)",
  "event BatchExecuted(uint256 indexed batchId, uint256 ethReceived, uint256 userCount)",
  "event BatchTimeout(uint256 indexed batchId)",

  // Core functions
  "function executeBatch(address[] calldata users) external returns (uint256 batchId, euint64 encryptedTotal)",
  "function finalizeBatchExecution(uint256 batchId, uint256 minEthOut, uint24 poolFee) external",
  "function forceBatchExecution(uint256 batchId) external",
  "function creditAllocations(address rewardVaultAddress, address[] calldata users, externalEuint64[] calldata encAmounts, bytes[] calldata proofs) external",

  // View functions
  "function getBatchInfo(uint256 batchId) external view returns (bool finalized, uint64 decryptedTotal, uint256 createdAt, uint256 deadline, uint256 participantCount)",
  "function getBatchConfig() external view returns (uint256 minUsers, uint256 maxUsers, uint256 timeout)",

  // Admin functions
  "function setOwner(address newOwner) external",
  "function setDexAdapter(address newDex) external",
  "function setUsdcVault(address newVault) external",
  "function setRewardVault(address newVault) external",
  "function setBatchConfig(uint256 minUsers, uint256 maxUsers, uint256 timeout) external"
] as const;

// Token Vault ABI
export const TOKEN_VAULT_ABI = [
  // Events
  "event Deposited(address indexed user, uint256 amount)",
  "event Withdrawn(address indexed user, uint256 amount)",
  "event ExecutorUpdated(address indexed newExecutor)",

  // Core functions
  "function deposit(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function batchDebitFromRegistry(address registry, address[] calldata users) external",
  "function transferOut(address to, uint256 amount) external",

  // View functions
  "function getMyEncryptedBalance() external view returns (euint64)",

  // Admin functions
  "function setOwner(address newOwner) external",
  "function setAuthorizedExecutor(address exec) external"
] as const;

// Reward Vault ABI
export const REWARD_VAULT_ABI = [
  // Events
  "event Credited(address indexed user)",
  "event Withdrawn(address indexed user, uint256 amount)",
  "event ExecutorUpdated(address indexed newExecutor)",

  // Core functions
  "function creditBatch(address[] calldata users, externalEuint64[] calldata encAmounts, bytes[] calldata proofs) external",
  "function depositFrom(address from, uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function creditEncrypted(address user, euint64 delta) external",

  // View functions
  "function getMyEncryptedBalance() external view returns (euint64)",

  // Admin functions
  "function setOwner(address newOwner) external",
  "function setAuthorizedExecutor(address exec) external"
] as const;

// Dex Adapter ABI
export const DEX_ADAPTER_ABI = [
  // Events
  "event Swapped(address indexed recipient, uint256 amountIn, uint256 amountOut)",
  "event BatchSwapExecuted(uint256 totalUsdcAmount, uint256 totalEthReceived, uint256 participantCount)",

  // Core functions
  "function swapUsdcForEth(uint256 amountIn, uint256 minAmountOut, address recipient, uint24 poolFee) external returns (uint256 amountOut)",
  "function executeBatchSwap(uint256 totalAmount, address[] calldata participants) external returns (uint256 totalEthReceived)",

  // Admin functions
  "function setOwner(address newOwner) external"
] as const;

// ERC20 ABI (for USDC, WETH)
export const ERC20_ABI = [
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
] as const;

// Contract factory functions
export function getDCAIntentRegistryContract(signer?: ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESSES.DCA_INTENT_REGISTRY, DCA_INTENT_REGISTRY_ABI, signer);
}

export function getBatchExecutorContract(signer?: ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESSES.BATCH_EXECUTOR, BATCH_EXECUTOR_ABI, signer);
}

export function getTokenVaultContract(signer?: ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_VAULT, TOKEN_VAULT_ABI, signer);
}

export function getRewardVaultContract(signer?: ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESSES.REWARD_VAULT, REWARD_VAULT_ABI, signer);
}

export function getDexAdapterContract(signer?: ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESSES.DEX_ADAPTER, DEX_ADAPTER_ABI, signer);
}

export function getTimeBasedTriggerContract(signer?: ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESSES.TIME_BASED_TRIGGER, [], signer);
}

export function getERC20Contract(address: string, signer?: ethers.Signer) {
  return new ethers.Contract(address, ERC20_ABI, signer);
}
