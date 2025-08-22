import { ethers } from "hardhat";

async function main() {
    console.log("🔗 Registering with Chainlink Automation");
    console.log("========================================");

    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();

    // Sepolia Chainlink Automation addresses
    const AUTOMATION_REGISTRAR = "0x9a811502d843E5a03913d5A2cfb646c11463467A";
    const AUTOMATION_REGISTRY = "0xE16Df59B087e3B4f8C0A2C4C4C4C4C4C4C4C4C4C4"; // Sepolia registry

    // Get deployed contract addresses
    const timeTrigger = process.env.TIME_TRIGGER_ADDRESS;
    if (!timeTrigger) {
        throw new Error("TIME_TRIGGER_ADDRESS environment variable not set");
    }

    console.log(`👤 Deployer: ${deployerAddress}`);
    console.log(`⏰ Time Trigger: ${timeTrigger}`);

    // Chainlink Automation Registrar ABI (simplified)
    const registrarAbi = [
        "function register(string memory name, bytes calldata encryptedEmail, address upkeepContract, uint32 gasLimit, address adminAddress, bytes calldata checkData, bytes calldata offChainConfig, uint96 amount) external returns (uint256)",
        "function registerUpkeep(string memory name, bytes calldata encryptedEmail, address upkeepContract, uint32 gasLimit, address adminAddress, bytes calldata checkData, bytes calldata offChainConfig, uint96 amount) external returns (uint256)"
    ];

    const registrar = new ethers.Contract(AUTOMATION_REGISTRAR, registrarAbi, deployer);

    // Registration parameters
    const name = "FHEVM DCA Time-Based Batch Trigger";
    const encryptedEmail = "0x"; // No email encryption for now
    const upkeepContract = timeTrigger;
    const gasLimit = 500000; // Gas limit for upkeep execution
    const adminAddress = deployerAddress;
    const checkData = "0x"; // No check data needed
    const offChainConfig = "0x"; // No off-chain config
    const amount = ethers.parseEther("0.1"); // 0.1 LINK for funding

    console.log("\n📋 Registration Parameters:");
    console.log(`📝 Name: ${name}`);
    console.log(`⛽ Gas Limit: ${gasLimit}`);
    console.log(`💰 Funding Amount: ${ethers.formatEther(amount)} LINK`);
    console.log(`👑 Admin: ${adminAddress}`);

    try {
        console.log("\n🔐 Registering upkeep...");
        
        const tx = await registrar.register(
            name,
            encryptedEmail,
            upkeepContract,
            gasLimit,
            adminAddress,
            checkData,
            offChainConfig,
            amount,
            { value: amount }
        );

        console.log(`📝 Transaction hash: ${tx.hash}`);
        console.log("⏳ Waiting for confirmation...");
        
        const receipt = await tx.wait();
        console.log(`✅ Registration successful!`);
        console.log(`📦 Block: ${receipt?.blockNumber}`);
        
        // Parse registration event to get upkeep ID
        const iface = new ethers.Interface([
            "event UpkeepRegistered(uint256 indexed id, string name, bytes encryptedEmail, address indexed upkeepContract, uint32 gasLimit, address indexed adminAddress, bytes checkData, bytes offChainConfig, uint96 amount)"
        ]);
        
        for (const log of receipt?.logs || []) {
            try {
                const parsed = iface.parseLog(log as any);
                if (parsed?.name === "UpkeepRegistered") {
                    const upkeepId = parsed.args[0];
                    console.log(`🆔 Upkeep ID: ${upkeepId}`);
                    console.log(`\n🎉 Successfully registered with Chainlink Automation!`);
                    console.log(`\n📝 Next Steps:`);
                    console.log(`1. Monitor upkeep at: https://automation.chain.link/sepolia/${upkeepId}`);
                    console.log(`2. Fund upkeep with LINK tokens`);
                    console.log(`3. Test time-based execution`);
                    break;
                }
            } catch {
                // Ignore non-matching logs
            }
        }
        
    } catch (error) {
        console.error(`❌ Registration failed: ${(error as Error).message}`);
        console.log("\n💡 Troubleshooting:");
        console.log("1. Ensure you have enough LINK tokens");
        console.log("2. Check that the TimeBasedBatchTrigger is deployed");
        console.log("3. Verify you're on Sepolia testnet");
        console.log("4. Check gas prices and limits");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
