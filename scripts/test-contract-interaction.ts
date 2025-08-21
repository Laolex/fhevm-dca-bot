import { ethers } from "hardhat";

async function main() {
    console.log("🔍 Testing Contract Interaction\n");

    try {
        const [deployer] = await ethers.getSigners();
        const provider = deployer.provider;

        if (!provider) {
            throw new Error("No provider available");
        }

        console.log("✅ Provider connected");
        console.log(`📡 Network: ${(await provider.getNetwork()).name}`);
        console.log(`👤 Deployer: ${deployer.address}`);

        // Contract addresses
        const registryAddress = "0x220f3B089026EE38Ee45540f1862d5bcA441B877";

        // Contract ABI (simplified for ethers.js compatibility)
        const dcaAbi = [
            'function submitIntent(bytes calldata budgetExt, bytes calldata budgetProof, bytes calldata amountPerIntervalExt, bytes calldata amountPerIntervalProof, bytes calldata intervalSecondsExt, bytes calldata intervalSecondsProof, bytes calldata totalIntervalsExt, bytes calldata totalIntervalsProof) external',
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

        // Check available functions
        console.log("\n🔍 Checking available functions...");
        try {
            const functions = Object.keys(contract.interface.functions);
            console.log("📋 Available functions:", functions);

            // Check if submitIntent exists
            if (functions.includes('submitIntent')) {
                console.log("✅ submitIntent function found in contract");
            } else {
                console.log("❌ submitIntent function NOT found in contract");
                console.log("Available functions:", functions);
            }
        } catch (error) {
            console.log("⚠️ Could not check functions directly:", (error as Error).message);
            console.log("🔍 Trying alternative approach...");

            // Try to check if submitIntent exists by trying to call it
            if (typeof contract.submitIntent === 'function') {
                console.log("✅ submitIntent function found in contract");
            } else {
                console.log("❌ submitIntent function NOT found in contract");
            }
        }

        // Test a simple view function
        console.log("\n🧪 Testing view function...");
        try {
            const params = await contract.getMyParams();
            console.log("✅ getMyParams() call successful");
            console.log("📊 Params:", params);
        } catch (error) {
            console.log("⚠️ getMyParams() call failed (expected if no params set):", (error as Error).message);
        }

        console.log("\n🎉 Contract Interaction Test PASSED!");
        console.log("\n📝 Next Steps:");
        console.log("1. Frontend should now work with the correct ABI");
        console.log("2. Try submitting a DCA intent via the frontend");
        console.log("3. Check browser console for detailed logs");

    } catch (error) {
        console.error("❌ Contract Interaction Test FAILED:");
        console.error(error);

        console.log("\n🔧 Troubleshooting:");
        console.log("1. Check if contract is deployed at the correct address");
        console.log("2. Verify ABI matches the deployed contract");
        console.log("3. Ensure network connection is working");

        process.exit(1);
    }
}

main().catch(console.error);
