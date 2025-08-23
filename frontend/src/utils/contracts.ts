// Contract ABIs and addresses for FHEVM DCA System
import { ethers } from "ethers";

// Contract addresses (update these with your deployed contract addresses)
export const CONTRACT_ADDRESSES = {
  DCA_INTENT_REGISTRY: "0x3F9D1D64CbbD69aBcB79faBD156817655b48050c", // Update with actual address
  BATCH_EXECUTOR: "0x8D91b58336bc43222D55bC2C5aB3DEF468A54050", // Update with actual address
  TOKEN_VAULT: "0x8D91b58336bc43222D55bC2C5aB3DEF468A54050", // USDC Vault
  REWARD_VAULT: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // WETH Vault
  DEX_ADAPTER: "0x742D35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Uniswap V3 Adapter
  TIME_BASED_TRIGGER: "0x742D35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Automation trigger
  USDC_TOKEN: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia USDC
  WETH_TOKEN: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9", // Sepolia WETH
  UNISWAP_V3_ROUTER: "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E", // Uniswap V3 Router
} as const;

// DCA Intent Registry ABI
export const DCA_INTENT_REGISTRY_ABI = [
  // Events
  "event IntentSubmitted(address indexed user)",
  "event IntentUpdated(address indexed user)",
  "event IntentDeactivated(address indexed user)",
  "event TestIntentSubmitted(address indexed user, uint64 budget, uint64 perInterval, uint32 interval, uint32 periods)",
  
  // Functions
  "function submitIntent(externalEuint64 budgetExt, bytes calldata budgetProof, externalEuint64 amountPerIntervalExt, bytes calldata amountPerIntervalProof, externalEuint32 intervalSecondsExt, bytes calldata intervalSecondsProof, externalEuint32 totalIntervalsExt, bytes calldata totalIntervalsProof) external",
  "function submitTestIntent(uint64 budget, uint64 amountPerInterval, uint32 intervalSeconds, uint32 totalIntervals) external",
  "function updateIntent(bool updateBudget, externalEuint64 budgetExt, bytes calldata budgetProof, bool updateAmountPerInterval, externalEuint64 amountPerIntervalExt, bytes calldata amountPerIntervalProof, bool updateIntervalSeconds, externalEuint32 intervalSecondsExt, bytes calldata intervalSecondsProof, bool updateTotalIntervals, externalEuint32 totalIntervalsExt, bytes calldata totalIntervalsProof) external",
  "function deactivateIntent() external",
  "function getMyParams() external view returns (euint64 budget, euint64 amountPerInterval, euint32 intervalSeconds, euint32 totalIntervals, euint64 spent, bool active)",
  "function getParamsFor(address user) external view returns (euint64 budget, euint64 amountPerInterval, euint32 intervalSeconds, euint32 totalIntervals, euint64 spent, bool active)",
  "function getActiveUsers() external view returns (address[] memory)",
  "function getActiveUserCount() external view returns (uint256)",
  "function setAuthorizedExecutor(address executor) external",
  "function getAuthorizedExecutor() external view returns (address)",
  "function getOwner() external view returns (address)",
  "function incrementSpentForUsers(address[] calldata users) external",
  "function grantExecutorOnUsers(address[] calldata users) external",
] as const;

// Batch Executor ABI
export const BATCH_EXECUTOR_ABI = [
  // Events
  "event BatchPrepared(uint256 indexed batchId, uint256 userCount)",
  "event BatchDecryptionRequested(uint256 indexed batchId, uint256 requestId)",
  "event BatchDecryptionFulfilled(uint256 indexed batchId, uint64 decryptedTotal)",
  
  // Functions
  "function registry() external view returns (address)",
  "function dexAdapter() external view returns (address)",
  "function usdcVault() external view returns (address)",
  "function rewardVault() external view returns (address)",
  "function minBatchUsers() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function setOwner(address newOwner) external",
  "function setDexAdapter(address newDex) external",
  "function setUsdcVault(address newVault) external",
  "function setRewardVault(address newVault) external",
  "function setMinBatchUsers(uint256 k) external",
  "function executeBatch(address[] calldata users) external returns (uint256 batchId, euint64 encryptedTotal)",
  "function finalizeBatchWithOracle(uint256 batchId, address[] calldata users, uint256 minEthOut, uint24 poolFee, address rewardVaultAddress, address usdcVaultAddress, address dexAdapterAddress) external",
  "function finalizeBatch(uint256 batchId, address[] calldata users, uint256 usdcToSwap, uint256 minEthOut, uint24 poolFee, address rewardVaultAddress, address usdcVaultAddress, address dexAdapterAddress) external",
  "function onDecryptionFulfilled(uint256 requestId, bytes[] calldata signatures, uint64[] calldata plaintexts) external",
  "function creditAllocations(address rewardVaultAddress, address[] calldata users, externalEuint64[] calldata encAmounts, bytes[] calldata proofs) external",
] as const;

// Token Vault ABI
export const TOKEN_VAULT_ABI = [
  // Events
  "event Deposited(address indexed user, uint256 amount)",
  "event Withdrawn(address indexed user, uint256 amount)",
  "event ExecutorUpdated(address indexed newExecutor)",
  
  // Functions
  "function token() external view returns (address)",
  "function owner() external view returns (address)",
  "function authorizedExecutor() external view returns (address)",
  "function setOwner(address newOwner) external",
  "function setAuthorizedExecutor(address exec) external",
  "function deposit(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function getMyEncryptedBalance() external view returns (euint64)",
  "function batchDebitFromRegistry(address registry, address[] calldata users) external",
  "function transferOut(address to, uint256 amount) external",
] as const;

// Reward Vault ABI
export const REWARD_VAULT_ABI = [
  // Events
  "event Credited(address indexed user)",
  "event Withdrawn(address indexed user, uint256 amount)",
  "event ExecutorUpdated(address indexed newExecutor)",
  
  // Functions
  "function token() external view returns (address)",
  "function owner() external view returns (address)",
  "function authorizedExecutor() external view returns (address)",
  "function setOwner(address newOwner) external",
  "function setAuthorizedExecutor(address exec) external",
  "function creditBatch(address[] calldata users, externalEuint64[] calldata encAmounts, bytes[] calldata proofs) external",
  "function depositFrom(address from, uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function getMyEncryptedBalance() external view returns (euint64)",
  "function creditEncrypted(address user, euint64 delta) external",
] as const;

// DEX Adapter ABI
export const DEX_ADAPTER_ABI = [
  // Events
  "event Swapped(address indexed recipient, uint256 amountIn, uint256 amountOut)",
  
  // Functions
  "function usdc() external view returns (address)",
  "function weth() external view returns (address)",
  "function router() external view returns (address)",
  "function owner() external view returns (address)",
  "function setOwner(address newOwner) external",
  "function swapUsdcForEth(uint256 amountIn, uint256 minAmountOut, address recipient, uint24 poolFee) external returns (uint256 amountOut)",
] as const;

// Time Based Batch Trigger ABI
export const TIME_BASED_TRIGGER_ABI = [
  // Events
  "event BatchTriggered(uint256 timestamp, uint256 userCount)",
  "event ExecutionIntervalUpdated(uint256 newInterval)",
  
  // Functions
  "function batchExecutor() external view returns (address)",
  "function registry() external view returns (address)",
  "function lastExecutionTime() external view returns (uint256)",
  "function executionInterval() external view returns (uint256)",
  "function minBatchUsers() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function checkUpkeep(bytes calldata) external view returns (bool upkeepNeeded, bytes memory performData)",
  "function performUpkeep(bytes calldata performData) external",
  "function getActiveUsers() external view returns (address[] memory)",
  "function setExecutionInterval(uint256 _interval) external",
  "function setMinBatchUsers(uint256 _minUsers) external",
] as const;

// ERC20 Token ABI
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
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
] as const;

// Contract factory functions
export function getDCAIntentRegistryContract(signer?: ethers.Signer) {
  const provider = signer?.provider || new ethers.JsonRpcProvider(process.env.VITE_RPC_URL || "https://sepolia.infura.io/v3/your-key");
  return new ethers.Contract(CONTRACT_ADDRESSES.DCA_INTENT_REGISTRY, DCA_INTENT_REGISTRY_ABI, signer || provider);
}

export function getBatchExecutorContract(signer?: ethers.Signer) {
  const provider = signer?.provider || new ethers.JsonRpcProvider(process.env.VITE_RPC_URL || "https://sepolia.infura.io/v3/your-key");
  return new ethers.Contract(CONTRACT_ADDRESSES.BATCH_EXECUTOR, BATCH_EXECUTOR_ABI, signer || provider);
}

export function getTokenVaultContract(signer?: ethers.Signer) {
  const provider = signer?.provider || new ethers.JsonRpcProvider(process.env.VITE_RPC_URL || "https://sepolia.infura.io/v3/your-key");
  return new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_VAULT, TOKEN_VAULT_ABI, signer || provider);
}

export function getRewardVaultContract(signer?: ethers.Signer) {
  const provider = signer?.provider || new ethers.JsonRpcProvider(process.env.VITE_RPC_URL || "https://sepolia.infura.io/v3/your-key");
  return new ethers.Contract(CONTRACT_ADDRESSES.REWARD_VAULT, REWARD_VAULT_ABI, signer || provider);
}

export function getDexAdapterContract(signer?: ethers.Signer) {
  const provider = signer?.provider || new ethers.JsonRpcProvider(process.env.VITE_RPC_URL || "https://sepolia.infura.io/v3/your-key");
  return new ethers.Contract(CONTRACT_ADDRESSES.DEX_ADAPTER, DEX_ADAPTER_ABI, signer || provider);
}

export function getTimeBasedTriggerContract(signer?: ethers.Signer) {
  const provider = signer?.provider || new ethers.JsonRpcProvider(process.env.VITE_RPC_URL || "https://sepolia.infura.io/v3/your-key");
  return new ethers.Contract(CONTRACT_ADDRESSES.TIME_BASED_TRIGGER, TIME_BASED_TRIGGER_ABI, signer || provider);
}

export function getERC20Contract(address: string, signer?: ethers.Signer) {
  const provider = signer?.provider || new ethers.JsonRpcProvider(process.env.VITE_RPC_URL || "https://sepolia.infura.io/v3/your-key");
  return new ethers.Contract(address, ERC20_ABI, signer || provider);
}
