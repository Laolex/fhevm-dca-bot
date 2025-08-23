import type { DeployFunction } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, get } = deployments;
    const { deployer } = await getNamedAccounts();

    console.log("🚀 Starting FHEVM DCA Bot deployment...");
    console.log("Deployer:", deployer);

    // Environment variables
    const USDC_ADDRESS = process.env.USDC_ADDRESS ?? "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // Sepolia USDC
    const WETH_ADDRESS = process.env.WETH_ADDRESS ?? "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9"; // Sepolia WETH
    const UNISWAP_V3_ROUTER = process.env.UNISWAP_V3_ROUTER ?? "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E"; // Sepolia Uniswap V3
    const PRICE_ORACLE = process.env.PRICE_ORACLE ?? "0x0000000000000000000000000000000000000000"; // Mock oracle for now

    console.log("📋 Configuration:");
    console.log("- USDC:", USDC_ADDRESS);
    console.log("- WETH:", WETH_ADDRESS);
    console.log("- Uniswap Router:", UNISWAP_V3_ROUTER);
    console.log("- Price Oracle:", PRICE_ORACLE);

    // 1. Deploy TokenVault first
    console.log("\n1️⃣ Deploying TokenVault...");
    const tokenVault = await deploy("TokenVault", {
        from: deployer,
        log: true,
        args: [USDC_ADDRESS],
        waitConfirmations: 1,
    });
    console.log("✅ TokenVault deployed at:", tokenVault.address);

    // 2. Deploy DexAdapter
    console.log("\n2️⃣ Deploying DexAdapter...");
    const dexAdapter = await deploy("DexAdapter", {
        from: deployer,
        log: true,
        args: [USDC_ADDRESS, WETH_ADDRESS, UNISWAP_V3_ROUTER],
        waitConfirmations: 1,
    });
    console.log("✅ DexAdapter deployed at:", dexAdapter.address);

    // 3. Deploy DCAIntentRegistry
    console.log("\n3️⃣ Deploying DCAIntentRegistry...");
    const dcaRegistry = await deploy("DCAIntentRegistry", {
        from: deployer,
        log: true,
        args: [dexAdapter.address, tokenVault.address, PRICE_ORACLE],
        waitConfirmations: 1,
    });
    console.log("✅ DCAIntentRegistry deployed at:", dcaRegistry.address);

    // 4. Deploy BatchExecutor
    console.log("\n4️⃣ Deploying BatchExecutor...");
    const batchExecutor = await deploy("BatchExecutor", {
        from: deployer,
        log: true,
        args: [dcaRegistry.address, dexAdapter.address, 10], // minBatchUsers = 10
        waitConfirmations: 1,
    });
    console.log("✅ BatchExecutor deployed at:", batchExecutor.address);

    // 5. Deploy RewardVault
    console.log("\n5️⃣ Deploying RewardVault...");
    const rewardVault = await deploy("RewardVault", {
        from: deployer,
        log: true,
        args: [USDC_ADDRESS],
        waitConfirmations: 1,
    });
    console.log("✅ RewardVault deployed at:", rewardVault.address);

    // 6. Deploy TimeBasedBatchTrigger
    console.log("\n6️⃣ Deploying TimeBasedBatchTrigger...");
    const timeTrigger = await deploy("TimeBasedBatchTrigger", {
        from: deployer,
        log: true,
        args: [dcaRegistry.address, batchExecutor.address],
        waitConfirmations: 1,
    });
    console.log("✅ TimeBasedBatchTrigger deployed at:", timeTrigger.address);

    // 7. Deploy AutomationForwarder (if needed)
    console.log("\n7️⃣ Deploying AutomationForwarder...");
    const automationForwarder = await deploy("AutomationForwarder", {
        from: deployer,
        log: true,
        args: [],
        waitConfirmations: 1,
    });
    console.log("✅ AutomationForwarder deployed at:", automationForwarder.address);

    // Summary
    console.log("\n🎉 Deployment Complete!");
    console.log("📋 Contract Addresses:");
    console.log("- TokenVault:", tokenVault.address);
    console.log("- DexAdapter:", dexAdapter.address);
    console.log("- DCAIntentRegistry:", dcaRegistry.address);
    console.log("- BatchExecutor:", batchExecutor.address);
    console.log("- RewardVault:", rewardVault.address);
    console.log("- TimeBasedBatchTrigger:", timeTrigger.address);
    console.log("- AutomationForwarder:", automationForwarder.address);

    // Save addresses to a file for frontend integration
    const addresses = {
        TOKEN_VAULT: tokenVault.address,
        DEX_ADAPTER: dexAdapter.address,
        DCA_INTENT_REGISTRY: dcaRegistry.address,
        BATCH_EXECUTOR: batchExecutor.address,
        REWARD_VAULT: rewardVault.address,
        TIME_BASED_TRIGGER: timeTrigger.address,
        AUTOMATION_FORWARDER: automationForwarder.address,
        USDC: USDC_ADDRESS,
        WETH: WETH_ADDRESS,
        UNISWAP_V3_ROUTER: UNISWAP_V3_ROUTER
    };

    console.log("\n📄 Contract addresses saved for frontend integration");
    console.log("💡 Update your frontend with these addresses!");
};

export default func;
func.tags = ["All"];
