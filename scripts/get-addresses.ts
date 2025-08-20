import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  console.log("=== Deployed Contract Addresses (Sepolia) ===\n");
  
  const registry = await hre.deployments.get("DCAIntentRegistry");
  const batchExecutor = await hre.deployments.get("BatchExecutor");
  const tokenVault = await hre.deployments.get("TokenVault");
  const rewardVault = await hre.deployments.get("RewardVault");
  const dexAdapter = await hre.deployments.get("DexAdapter");
  const automationForwarder = await hre.deployments.get("AutomationForwarder");
  
  console.log(`DCAIntentRegistry: ${registry.address}`);
  console.log(`BatchExecutor: ${batchExecutor.address}`);
  console.log(`TokenVault: ${tokenVault.address}`);
  console.log(`RewardVault: ${rewardVault.address}`);
  console.log(`DexAdapter: ${dexAdapter.address}`);
  console.log(`AutomationForwarder: ${automationForwarder.address}`);
  
  console.log("\n=== External Addresses ===");
  console.log("USDC: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238");
  console.log("WETH: 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14");
  console.log("Uniswap V3 Router: 0x3bFA4769F5b852341A2e45B545b6b8CE4A7572C8");
  console.log("Pool Fee: 3000 (0.3%)");
}

main().catch(console.error);
