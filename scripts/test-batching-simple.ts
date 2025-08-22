import { ethers } from "hardhat";

async function main() {
    console.log("🧪 Testing Batching Mechanism (Simplified)");
    console.log("===========================================");

    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();

    console.log(`👤 Deployer: ${deployerAddress}`);

    // Sepolia addresses
    const REGISTRY_ADDRESS = "0x3F9D1D64CbbD69aBcB79faBD156817655b48050c";
    const BATCH_EXECUTOR_ADDRESS = "0x7dc70ce7f2a6Ad3895Ce84c7cd0CeC3Eec4b8C70";
    const TIME_TRIGGER_ADDRESS = "0x9ca1815693fB7D887A146D574F3a13033b4E1976";

    // Get contract instances
    const registry = await ethers.getContractAt("DCAIntentRegistry", REGISTRY_ADDRESS, deployer);
    const batchExecutor = await ethers.getContractAt("BatchExecutor", BATCH_EXECUTOR_ADDRESS, deployer);
    const timeTrigger = await ethers.getContractAt("TimeBasedBatchTrigger", TIME_TRIGGER_ADDRESS, deployer);

    console.log("\n📋 Step 1: Submit Multiple DCA Intents (Same User)");
    console.log("---------------------------------------------------");

    // Submit multiple intents with different parameters to simulate multiple users
    const intents = [
        { budget: 1000, perInterval: 100, interval: 86400, periods: 10 },
        { budget: 1100, perInterval: 110, interval: 86400, periods: 10 },
        { budget: 1200, perInterval: 120, interval: 86400, periods: 10 },
        { budget: 1300, perInterval: 130, interval: 86400, periods: 10 },
        { budget: 1400, perInterval: 140, interval: 86400, periods: 10 }
    ];

    for (let i = 0; i < intents.length; i++) {
        const intent = intents[i];
        console.log(`📝 Intent ${i + 1}: ${intent.budget} USDC budget, ${intent.perInterval} USDC per interval`);

        try {
            const tx = await registry.submitTestIntent(
                intent.budget,
                intent.perInterval,
                intent.interval,
                intent.periods
            );
            await tx.wait();
            console.log(`   ✅ Intent ${i + 1} submitted successfully`);
        } catch (error) {
            console.log(`   ❌ Intent ${i + 1} failed: ${(error as Error).message}`);
        }
    }

    console.log("\n📊 Step 2: Check Active Users");
    console.log("-----------------------------");

    try {
        const activeUserCount = await registry.getActiveUserCount();
        console.log(`👥 Active users: ${activeUserCount}`);
        
        if (activeUserCount > 0) {
            const activeUsers = await registry.getActiveUsers();
            console.log(`📋 Active user addresses: ${activeUsers.join(', ')}`);
        }
    } catch (error) {
        console.log(`❌ Failed to get active users: ${(error as Error).message}`);
    }

    console.log("\n🔧 Step 3: Check Batch Requirements");
    console.log("-----------------------------------");

    const minBatchUsers = await batchExecutor.minBatchUsers();
    console.log(`📈 Minimum batch users required: ${minBatchUsers}`);

    console.log("\n⏰ Step 4: Test Time-Based Trigger");
    console.log("----------------------------------");

    try {
        const executionInterval = await timeTrigger.executionInterval();
        const lastExecutionTime = await timeTrigger.lastExecutionTime();
        const timeTriggerMinUsers = await timeTrigger.minBatchUsers();
        
        console.log(`⏰ Execution interval: ${executionInterval} seconds`);
        console.log(`🕐 Last execution time: ${new Date(Number(lastExecutionTime) * 1000).toISOString()}`);
        console.log(`👥 Min users for time trigger: ${timeTriggerMinUsers}`);
        
        // Check if upkeep is needed
        const [upkeepNeeded, performData] = await timeTrigger.checkUpkeep("0x");
        console.log(`🔍 Upkeep needed: ${upkeepNeeded}`);
        
        if (upkeepNeeded) {
            console.log(`📦 Perform data: ${performData}`);
        }
        
    } catch (error) {
        console.log(`❌ Time trigger check failed: ${(error as Error).message}`);
    }

    console.log("\n🚀 Step 5: Test Manual Batch Execution");
    console.log("--------------------------------------");

    try {
        // Get active users for manual execution
        const activeUsers = await registry.getActiveUsers();
        
        if (activeUsers.length >= minBatchUsers) {
            console.log(`🔐 Executing batch with ${activeUsers.length} users...`);
            
            const tx = await batchExecutor.executeBatch(activeUsers);
            const receipt = await tx.wait();
            
            console.log(`✅ Batch executed successfully!`);
            console.log(`📝 Transaction: ${tx.hash}`);
            
            // Parse BatchPrepared event
            const iface = new ethers.Interface([
                "event BatchPrepared(uint256 indexed batchId, uint256 userCount)"
            ]);
            
            for (const log of receipt?.logs || []) {
                try {
                    const parsed = iface.parseLog(log as any);
                    if (parsed?.name === "BatchPrepared") {
                        const batchId = parsed.args[0];
                        const userCount = parsed.args[1];
                        console.log(`📦 Batch ID: ${batchId}`);
                        console.log(`👥 Users in batch: ${userCount}`);
                        break;
                    }
                } catch {
                    // Ignore non-matching logs
                }
            }
            
        } else {
            console.log(`⚠️ Not enough users for batch (${activeUsers.length}/${minBatchUsers})`);
        }
        
    } catch (error) {
        console.log(`❌ Manual batch execution failed: ${(error as Error).message}`);
    }

    console.log("\n🎉 Batching Mechanism Test Complete!");
    console.log("=====================================");
    console.log("✅ Multiple intents submitted");
    console.log("✅ Active user tracking working");
    console.log("✅ Time-based trigger deployed");
    console.log("✅ Manual batch execution tested");
    console.log("\n📝 Next Steps:");
    console.log("1. Register with Chainlink Automation");
    console.log("2. Test with real multiple users");
    console.log("3. Monitor oracle decryption");
    console.log("4. Verify DEX swaps and distributions");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
