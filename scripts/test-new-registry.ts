import { ethers } from "hardhat";

async function main() {
    console.log("🧪 Testing New DCAIntentRegistry with Test Function\n");

    try {
        const [deployer] = await ethers.getSigners();
        const provider = deployer.provider;
        
        if (!provider) {
            throw new Error("No provider available");
        }

        console.log("✅ Provider connected");
        console.log(`📡 Network: ${(await provider.getNetwork()).name}`);
        console.log(`👤 Deployer: ${deployer.address}`);

        // New contract address
        const registryAddress = "0x3F9D1D64CbbD69aBcB79faBD156817655b48050c";
        
        // Contract ABI with test function
        const dcaAbi = [
            'function submitTestIntent(uint64 budget, uint64 amountPerInterval, uint32 intervalSeconds, uint32 totalIntervals) external',
            'function getMyParams() view returns (bytes budget, bytes per, bytes interval, bytes periods, bytes spent, bool active)',
            'function setAuthorizedExecutor(address executor) external',
            'function grantExecutorOnUsers(address[] calldata users) external',
            'function deactivateIntent() external'
        ];

        console.log("\n📋 Contract Details:");
        console.log(`📍 Registry Address: ${registryAddress}`);
        console.log(`🔗 ABI Functions:`, dcaAbi);

        // Check if contract is deployed
        console.log("\n🔍 Checking contract deployment...");
        const code = await provider.getCode(registryAddress);
        console.log(`📦 Contract code length: ${code.length}`);
        
        if (code === "0x") {
            throw new Error("Contract not deployed at this address");
        }
        console.log("✅ Contract is deployed");

        // Create contract instance
        console.log("\n🔗 Creating contract instance...");
        const contract = new ethers.Contract(registryAddress, dcaAbi, deployer);
        console.log("✅ Contract instantiated");

        // Test the submitTestIntent function
        console.log("\n🧪 Testing submitTestIntent function...");
        
        // Test parameters (in wei - USDC has 6 decimals)
        const budget = 1000000n; // 1 USDC
        const amountPerInterval = 100000n; // 0.1 USDC
        const intervalSeconds = 86400; // Daily
        const totalIntervals = 10; // 10 periods

        console.log("📊 Test Parameters:");
        console.log(`💰 Budget: ${budget} wei (${Number(budget) / 1000000} USDC)`);
        console.log(`📈 Per Interval: ${amountPerInterval} wei (${Number(amountPerInterval) / 1000000} USDC)`);
        console.log(`⏰ Interval: ${intervalSeconds} seconds (${intervalSeconds / 86400} days)`);
        console.log(`🔄 Total Intervals: ${totalIntervals}`);

        // Submit test intent
        console.log("\n🚀 Submitting test intent...");
        const tx = await contract.submitTestIntent(
            Number(budget),
            Number(amountPerInterval),
            intervalSeconds,
            totalIntervals
        );
        
        console.log(`📝 Transaction hash: ${tx.hash}`);
        console.log("⏳ Waiting for confirmation...");
        
        const receipt = await tx.wait();
        console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
        
        // Check for events
        const events = receipt.logs.map(log => {
            try {
                return contract.interface.parseLog(log as any);
            } catch {
                return null;
            }
        }).filter(Boolean);
        
        console.log("\n📋 Events emitted:");
        events.forEach((event, index) => {
            console.log(`${index + 1}. ${event?.name}:`, event?.args);
        });

        // Test getMyParams function
        console.log("\n🔍 Testing getMyParams function...");
        try {
            const params = await contract.getMyParams();
            console.log("✅ getMyParams() call successful");
            console.log("📊 Params:", params);
        } catch (error) {
            console.log("⚠️ getMyParams() call failed:", (error as Error).message);
        }

        console.log("\n🎉 New Registry Test PASSED!");
        console.log("\n📝 Next Steps:");
        console.log("1. Frontend should now work with the test function");
        console.log("2. Try submitting a DCA intent via the frontend");
        console.log("3. Check that the transaction succeeds");

    } catch (error) {
        console.error("❌ New Registry Test FAILED:");
        console.error(error);
        
        console.log("\n🔧 Troubleshooting:");
        console.log("1. Check if contract is deployed at the correct address");
        console.log("2. Verify the test function exists");
        console.log("3. Ensure network connection is working");
        
        process.exit(1);
    }
}

main().catch(console.error);
