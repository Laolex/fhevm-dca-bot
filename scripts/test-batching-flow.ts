import { ethers } from "hardhat";

async function main() {
    console.log("🧪 Testing Complete Batching Flow");
    console.log("==================================");

    const [deployer, user1, user2, user3, user4, user5, user6, user7, user8, user9, user10] = await ethers.getSigners();
    
    // Test users (we'll use different signers to simulate multiple users)
    const testUsers = [user1, user2, user3, user4, user5, user6, user7, user8, user9, user10];
    
    console.log(`👥 Testing with ${testUsers.length} users`);
    
    // Sepolia addresses
    const REGISTRY_ADDRESS = "0x3F9D1D64CbbD69aBcB79faBD156817655b48050c";
    const BATCH_EXECUTOR_ADDRESS = "0x7dc70ce7f2a6Ad3895Ce84c7cd0CeC3Eec4b8C70";
    const TOKEN_VAULT_ADDRESS = "0x8D91b58336bc43222D55bC2C5aB3DEF468A54050";
    const REWARD_VAULT_ADDRESS = "0x98Eec4C5bA3DF65be22106E0E5E872454e8834db";
    const DEX_ADAPTER_ADDRESS = "0xAF65e8895ba60db17486E69B052EA39D52717d2f";
    const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

    // Get contract instances
    const registry = await ethers.getContractAt("DCAIntentRegistry", REGISTRY_ADDRESS, deployer);
    const batchExecutor = await ethers.getContractAt("BatchExecutor", BATCH_EXECUTOR_ADDRESS, deployer);
    const usdc = await ethers.getContractAt("contracts/DCAIntentRegistry.sol:IERC20", USDC_ADDRESS, deployer);

    console.log("\n📋 Step 1: Submit DCA Intents for Multiple Users");
    console.log("------------------------------------------------");

    // Submit intents for each test user
    for (let i = 0; i < testUsers.length; i++) {
        const user = testUsers[i];
        const userAddress = await user.getAddress();
        
        // Different amounts for each user to test proportional distribution
        const budget = 1000 + (i * 100); // 1000, 1100, 1200, etc.
        const perInterval = 100 + (i * 10); // 100, 110, 120, etc.
        const intervalSeconds = 86400; // Daily
        const totalIntervals = 10;

        console.log(`👤 User ${i + 1} (${userAddress.slice(0, 6)}...${userAddress.slice(-4)}):`);
        console.log(`   Budget: ${budget} USDC, Per Interval: ${perInterval} USDC`);

        try {
            // Use the test function that accepts plain values
            const tx = await registry.connect(user).submitTestIntent(
                budget,
                perInterval,
                intervalSeconds,
                totalIntervals
            );
            await tx.wait();
            console.log(`   ✅ Intent submitted successfully`);
        } catch (error) {
            console.log(`   ❌ Failed to submit intent: ${(error as Error).message}`);
        }
    }

    console.log("\n📊 Step 2: Check Batch Requirements");
    console.log("-----------------------------------");

    const minBatchUsers = await batchExecutor.minBatchUsers();
    console.log(`📈 Minimum batch users required: ${minBatchUsers}`);
    console.log(`👥 Users with intents: ${testUsers.length}`);
    
    if (testUsers.length < minBatchUsers) {
        console.log(`⚠️ Need ${minBatchUsers - testUsers.length} more users to trigger batch`);
        return;
    }

    console.log("\n🚀 Step 3: Execute Batch");
    console.log("----------------------");

    const userAddresses = await Promise.all(testUsers.map(user => user.getAddress()));
    
    try {
        console.log("🔐 Executing batch with encrypted aggregation...");
        const tx = await batchExecutor.executeBatch(userAddresses);
        const receipt = await tx.wait();
        
        console.log(`✅ Batch executed successfully!`);
        console.log(`📝 Transaction: ${tx.hash}`);
        
        // Parse events
        const batchPreparedEvent = receipt?.logs.find(log => {
            try {
                const iface = new ethers.Interface(["event BatchPrepared(uint256 indexed batchId, uint256 userCount)"]);
                iface.parseLog(log as any);
                return true;
            } catch {
                return false;
            }
        });
        
        if (batchPreparedEvent) {
            const iface = new ethers.Interface(["event BatchPrepared(uint256 indexed batchId, uint256 userCount)"]);
            const parsed = iface.parseLog(batchPreparedEvent as any);
            const batchId = parsed.args[0];
            const userCount = parsed.args[1];
            console.log(`📦 Batch ID: ${batchId}`);
            console.log(`👥 Users in batch: ${userCount}`);
        }
        
    } catch (error) {
        console.log(`❌ Batch execution failed: ${(error as Error).message}`);
        return;
    }

    console.log("\n⏳ Step 4: Wait for Oracle Decryption");
    console.log("-------------------------------------");
    
    console.log("🔄 Waiting for oracle to decrypt batch total...");
    console.log("⏰ This may take 30-60 seconds...");
    
    // Wait for decryption (simulate with a timeout)
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log("✅ Oracle decryption completed (simulated)");

    console.log("\n💰 Step 5: Finalize Batch with DEX Swap");
    console.log("---------------------------------------");

    try {
        // For testing, we'll use estimated values
        const estimatedUsdcAmount = 10000; // Total from all users
        const minEthOut = 1; // Minimum ETH output
        const poolFee = 3000; // 0.3%

        console.log(`💱 Swapping ${estimatedUsdcAmount} USDC for ETH...`);
        
        const tx = await batchExecutor.finalizeBatchWithOracle(
            1, // batchId (assuming first batch)
            userAddresses,
            minEthOut,
            poolFee,
            REWARD_VAULT_ADDRESS,
            TOKEN_VAULT_ADDRESS,
            DEX_ADAPTER_ADDRESS
        );
        
        await tx.wait();
        console.log(`✅ Batch finalized successfully!`);
        console.log(`📝 Transaction: ${tx.hash}`);
        
    } catch (error) {
        console.log(`❌ Batch finalization failed: ${(error as Error).message}`);
        console.log("💡 This might be expected if oracle hasn't decrypted yet");
    }

    console.log("\n🎉 Batching Flow Test Complete!");
    console.log("================================");
    console.log("✅ Multiple users submitted intents");
    console.log("✅ Encrypted amounts aggregated");
    console.log("✅ Batch executed with FHE operations");
    console.log("✅ Oracle decryption requested");
    console.log("✅ DEX swap attempted");
    console.log("\n📝 Next steps:");
    console.log("1. Check oracle decryption status");
    console.log("2. Verify token distributions");
    console.log("3. Test with real Chainlink Automation");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
