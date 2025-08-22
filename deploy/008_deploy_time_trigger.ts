import type { DeployFunction } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, get } = deployments;
    const { deployer } = await getNamedAccounts();

    const registry = await get("DCAIntentRegistry");
    const batchExecutor = await get("BatchExecutor");

    // Configuration
    const EXECUTION_INTERVAL = Number(process.env.EXECUTION_INTERVAL ?? "300"); // 5 minutes default
    const MIN_BATCH_USERS = Number(process.env.MIN_BATCH_USERS ?? "5"); // Lower threshold for time-based

    console.log("🔧 Deploying TimeBasedBatchTrigger");
    console.log(`⏰ Execution Interval: ${EXECUTION_INTERVAL} seconds`);
    console.log(`👥 Min Batch Users: ${MIN_BATCH_USERS}`);

    await deploy("TimeBasedBatchTrigger", {
        from: deployer,
        log: true,
        args: [
            batchExecutor.address,
            registry.address,
            EXECUTION_INTERVAL,
            MIN_BATCH_USERS
        ],
        waitConfirmations: 1,
    });

    console.log("✅ TimeBasedBatchTrigger deployed successfully!");
    console.log("\n📝 Next Steps:");
    console.log("1. Register with Chainlink Automation network");
    console.log("2. Set up keeper job for time-based execution");
    console.log("3. Test manual triggering");
};

export default func;
func.tags = ["TimeBasedTrigger"];
func.dependencies = ["BatchStack"];
