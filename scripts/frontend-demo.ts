import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
    console.log("🎬 FHEVM DCA Bot - Frontend Demo Guide\n");

    console.log("🚀 Frontend is running at: http://localhost:5174/");
    console.log("📱 Open your browser and navigate to the URL above\n");

    console.log("📋 Demo Steps:");
    console.log("1. 🔗 Connect Wallet");
    console.log("   - Click 'Connect Wallet' button");
    console.log("   - Approve MetaMask connection");
    console.log("   - Ensure you're on Sepolia testnet\n");

    console.log("2. 📊 Submit DCA Intent");
    console.log("   - Contract addresses are pre-filled");
    console.log("   - Example values:");
    console.log("     • Budget: $1000 USDC");
    console.log("     • Per Interval: $100 USDC");
    console.log("     • Interval: 86400 seconds (daily)");
    console.log("     • Total Periods: 10\n");

    console.log("3. 🔐 Encryption Process");
    console.log("   - Parameters are encrypted client-side");
    console.log("   - Only encrypted data sent to blockchain");
    console.log("   - Your strategy remains completely private\n");

    console.log("4. 📈 Monitor Batch Status");
    console.log("   - Switch to 'Batch Status' tab");
    console.log("   - Click 'Load Recent Batch Events'");
    console.log("   - View batch preparation and execution\n");

    console.log("5. 💰 Check Encrypted Balance");
    console.log("   - Switch to 'My Balance' tab");
    console.log("   - Click 'Load Encrypted Balance'");
    console.log("   - View your encrypted WETH rewards\n");

    console.log("🔗 Contract Addresses (Sepolia):");
    const registry = await hre.deployments.get("DCAIntentRegistry");
    const batchExecutor = await hre.deployments.get("BatchExecutor");
    const rewardVault = await hre.deployments.get("RewardVault");
    
    console.log(`   Registry: ${registry.address}`);
    console.log(`   BatchExecutor: ${batchExecutor.address}`);
    console.log(`   RewardVault: ${rewardVault.address}\n`);

    console.log("🔐 Privacy Features:");
    console.log("✅ Individual DCA parameters encrypted");
    console.log("✅ User balances encrypted");
    console.log("✅ Batch composition hidden");
    console.log("✅ Only aggregated totals revealed via oracle");
    console.log("✅ Zero strategy information leakage\n");

    console.log("🎯 Key Benefits:");
    console.log("• Complete privacy for your DCA strategy");
    console.log("• Automated execution via Chainlink Keepers");
    console.log("• Decentralized on Uniswap V3");
    console.log("• Built on FHEVM for maximum security\n");

    console.log("✅ Demo ready! The frontend provides a complete user experience for privacy-preserving DCA.");
    console.log("📝 All contract addresses are pre-filled for easy testing.");
}

main().catch(console.error);
