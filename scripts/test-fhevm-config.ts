import { ethers } from "hardhat";
import { createInstance } from "fhevmjs";

async function main() {
    console.log("🔍 Testing FHEVM Configuration\n");

    // Set FHEVM environment variables
    process.env.FHEVM_EXECUTOR_CONTRACT = "0x848B0066793BcC60346Da1F49049357399B8D595";
    process.env.FHEVM_KMS_VERIFIER_CONTRACT = "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC";
    process.env.FHEVM_RELAYER_URL = "https://relayer.testnet.zama.cloud";

    try {
        // Test FHEVM instance creation
        const [deployer] = await ethers.getSigners();
        const provider = deployer.provider;
        
        if (!provider) {
            throw new Error("No provider available");
        }

        console.log("✅ Provider connected");
        console.log(`📡 Network: ${(await provider.getNetwork()).name}`);
        console.log(`🔐 KMS Address: ${process.env.FHEVM_KMS_VERIFIER_CONTRACT}`);

        // Test FHEVM instance creation
        console.log("\n🔐 Testing FHEVM Instance Creation...");
        const relayer = await createInstance(provider);
        console.log("✅ FHEVM instance created successfully");

        // Test encrypted input creation
        console.log("\n🔒 Testing Encrypted Input Creation...");
        const testAddress = "0x220f3B089026EE38Ee45540f1862d5bcA441B877"; // Registry address
        const userAddr = await deployer.getAddress();
        
        const ci = await relayer
            .createEncryptedInput(testAddress, userAddr)
            .add64(1000000n) // 1 USDC
            .add64(100000n)  // 0.1 USDC per interval
            .add32(86400)    // Daily interval
            .add32(10)       // 10 periods
            .encrypt();

        console.log("✅ Encrypted input created successfully");
        console.log(`📊 Handles created: ${ci.handles.length}`);
        console.log(`🔐 Proof generated: ${ci.inputProof ? 'Yes' : 'No'}`);

        console.log("\n🎉 FHEVM Configuration Test PASSED!");
        console.log("\n📝 Next Steps:");
        console.log("1. Frontend should now work without KMS errors");
        console.log("2. Try submitting a DCA intent via the frontend");
        console.log("3. Check that encryption/decryption works properly");

    } catch (error) {
        console.error("❌ FHEVM Configuration Test FAILED:");
        console.error(error);
        
        console.log("\n🔧 Troubleshooting:");
        console.log("1. Check if Sepolia network is accessible");
        console.log("2. Verify FHEVM addresses are correct");
        console.log("3. Ensure relayer URL is accessible");
        
        process.exit(1);
    }
}

main().catch(console.error);
