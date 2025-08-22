import { ethers } from "hardhat";

async function main() {
    console.log("🔧 Deploying TimeBasedBatchTrigger");
    console.log("==================================");

    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();

    console.log(`👤 Deployer: ${deployerAddress}`);

    // Sepolia addresses
    const BATCH_EXECUTOR_ADDRESS = "0x7dc70ce7f2a6Ad3895Ce84c7cd0CeC3Eec4b8C70";
    const REGISTRY_ADDRESS = "0x3F9D1D64CbbD69aBcB79faBD156817655b48050c";

    // Configuration
    const EXECUTION_INTERVAL = 300; // 5 minutes
    const MIN_BATCH_USERS = 5; // Lower threshold for time-based

    console.log(`⏰ Execution Interval: ${EXECUTION_INTERVAL} seconds`);
    console.log(`👥 Min Batch Users: ${MIN_BATCH_USERS}`);
    console.log(`🔗 Batch Executor: ${BATCH_EXECUTOR_ADDRESS}`);
    console.log(`📋 Registry: ${REGISTRY_ADDRESS}`);

    try {
        const TimeBasedBatchTrigger = await ethers.getContractFactory("TimeBasedBatchTrigger");
        
        console.log("\n🚀 Deploying contract...");
        const timeTrigger = await TimeBasedBatchTrigger.deploy(
            BATCH_EXECUTOR_ADDRESS,
            REGISTRY_ADDRESS,
            EXECUTION_INTERVAL,
            MIN_BATCH_USERS
        );

        console.log(`📝 Transaction hash: ${timeTrigger.deploymentTransaction()?.hash}`);
        console.log("⏳ Waiting for deployment...");
        
        await timeTrigger.waitForDeployment();
        const address = await timeTrigger.getAddress();
        
        console.log(`✅ TimeBasedBatchTrigger deployed successfully!`);
        console.log(`📍 Address: ${address}`);
        
        console.log("\n📝 Next Steps:");
        console.log("1. Set environment variable: export TIME_TRIGGER_ADDRESS=" + address);
        console.log("2. Register with Chainlink Automation");
        console.log("3. Test manual triggering");
        
    } catch (error) {
        console.error(`❌ Deployment failed: ${(error as Error).message}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
