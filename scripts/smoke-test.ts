import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  console.log("🚀 FHEVM DCA Bot - Sepolia Smoke Test\n");

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer: ${deployer.address}`);
  
  // Get deployed contracts
  const registry = await hre.deployments.get("DCAIntentRegistry");
  const batchExecutor = await hre.deployments.get("BatchExecutor");
  const tokenVault = await hre.deployments.get("TokenVault");
  const rewardVault = await hre.deployments.get("RewardVault");
  const dexAdapter = await hre.deployments.get("DexAdapter");
  
  console.log("\n📋 Contract Addresses:");
  console.log(`Registry: ${registry.address}`);
  console.log(`BatchExecutor: ${batchExecutor.address}`);
  console.log(`TokenVault: ${tokenVault.address}`);
  console.log(`RewardVault: ${rewardVault.address}`);
  console.log(`DexAdapter: ${dexAdapter.address}`);

  // Check balances
  const balance = await deployer.provider?.getBalance(deployer.address);
  console.log(`\n💰 Deployer ETH Balance: ${ethers.formatEther(balance || 0)} ETH`);

  // Test USDC balance (if any)
  const usdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const usdc = await ethers.getContractAt("IERC20", usdcAddress);
  try {
    const usdcBalance = await usdc.balanceOf(deployer.address);
    console.log(`💵 Deployer USDC Balance: ${ethers.formatUnits(usdcBalance, 6)} USDC`);
  } catch (error) {
    console.log("💵 USDC balance check failed (contract may not exist)");
  }

  console.log("\n✅ Smoke test completed successfully!");
  console.log("\n📝 Next Steps:");
  console.log("1. Visit http://localhost:5173 to submit DCA intents");
  console.log("2. Run: npx hardhat run scripts/auto-batch.ts --network sepolia");
  console.log("3. Check transaction hashes on Sepolia Etherscan");
  console.log("4. Monitor batch execution events");
}

main().catch(console.error);
