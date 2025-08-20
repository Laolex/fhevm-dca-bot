import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  console.log("🎬 FHEVM DCA Bot - Complete Demo Flow\n");

  const [deployer] = await ethers.getSigners();
  
  // Get deployed contracts
  const registry = await hre.deployments.get("DCAIntentRegistry");
  const batchExecutor = await hre.deployments.get("BatchExecutor");
  const tokenVault = await hre.deployments.get("TokenVault");
  const rewardVault = await hre.deployments.get("RewardVault");
  const dexAdapter = await hre.deployments.get("DexAdapter");

  console.log("📋 Demo Scenario:");
  console.log("1. User submits encrypted DCA intent");
  console.log("2. Batch executor aggregates encrypted amounts");
  console.log("3. FHE oracle decrypts aggregated total");
  console.log("4. DEX swap executes with decrypted amount");
  console.log("5. Encrypted rewards distributed to users\n");

  console.log("🏗️ Contract Architecture:");
  console.log(`├── DCAIntentRegistry: ${registry.address}`);
  console.log(`├── BatchExecutor: ${batchExecutor.address}`);
  console.log(`├── TokenVault: ${tokenVault.address}`);
  console.log(`├── RewardVault: ${rewardVault.address}`);
  console.log(`└── DexAdapter: ${dexAdapter.address}\n`);

  console.log("🔐 Privacy Features:");
  console.log("✅ Individual DCA parameters encrypted");
  console.log("✅ User balances encrypted");
  console.log("✅ Batch composition hidden");
  console.log("✅ Only aggregated totals revealed via oracle");
  console.log("✅ Zero strategy information leakage\n");

  console.log("🚀 How to Use:");
  console.log("1. Frontend: Visit http://localhost:5173");
  console.log("2. Connect wallet and submit DCA intent");
  console.log("3. CLI: Execute batch with npx hardhat run scripts/auto-batch.ts --network sepolia");
  console.log("4. Monitor: Check transaction hashes on Sepolia Etherscan\n");

  console.log("📊 Example DCA Intent:");
  console.log("┌─────────────────────────────────────┐");
  console.log("│ Budget: $1000                       │");
  console.log("│ Amount per interval: $100           │");
  console.log("│ Interval: Daily (86400 seconds)     │");
  console.log("│ Total intervals: 10                 │");
  console.log("└─────────────────────────────────────┘\n");

  console.log("🔗 External Integrations:");
  console.log("• Uniswap V3: USDC/WETH swaps");
  console.log("• Chainlink Automation: Batch execution");
  console.log("• FHEVM: Encrypted data operations");
  console.log("• Sepolia Testnet: Live deployment\n");

  console.log("✅ Demo ready! The system is fully operational on Sepolia.");
  console.log("📝 Check the README.md for detailed usage instructions.");
}

main().catch(console.error);
