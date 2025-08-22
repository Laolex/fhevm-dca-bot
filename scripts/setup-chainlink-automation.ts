import { ethers } from "hardhat";

async function main() {
    console.log("🔗 Setting up Chainlink Automation for FHEVM DCA Bot");
    console.log("===================================================");

    const [deployer] = await ethers.getSigners();
    const deployerAddress = await deployer.getAddress();

    console.log(`👤 Deployer: ${deployerAddress}`);

    // Sepolia Chainlink Automation addresses
    const AUTOMATION_REGISTRAR = "0x9a811502d843E5a03913d5A2cfb646c11463467A";
    const LINK_TOKEN = "0x779877A7B0D9E8603169DdbD7836e478b4624789"; // Sepolia LINK

    // Our deployed contract
    const TIME_TRIGGER_ADDRESS = "0x9ca1815693fB7D887A146D574F3a13033b4E1976";

    console.log(`⏰ Time Trigger: ${TIME_TRIGGER_ADDRESS}`);
    console.log(`🔗 Registrar: ${AUTOMATION_REGISTRAR}`);
    console.log(`💰 LINK Token: ${LINK_TOKEN}`);

    // Chainlink Automation Registrar ABI
    const registrarAbi = [
        "function register(string memory name, bytes calldata encryptedEmail, address upkeepContract, uint32 gasLimit, address adminAddress, bytes calldata checkData, bytes calldata offChainConfig, uint96 amount) external returns (uint256)",
        "event UpkeepRegistered(uint256 indexed id, string name, bytes encryptedEmail, address indexed upkeepContract, uint32 gasLimit, address indexed adminAddress, bytes checkData, bytes offChainConfig, uint96 amount)"
    ];

    const registrar = new ethers.Contract(AUTOMATION_REGISTRAR, registrarAbi, deployer);

    // Registration parameters
    const name = "FHEVM DCA Time-Based Batch Trigger";
    const encryptedEmail = "0x"; // No email encryption for now
    const upkeepContract = TIME_TRIGGER_ADDRESS;
    const gasLimit = 500000; // Gas limit for upkeep execution
    const adminAddress = deployerAddress;
    const checkData = "0x"; // No check data needed
    const offChainConfig = "0x"; // No off-chain config
    const amount = ethers.parseEther("0.1"); // 0.1 LINK for funding

    console.log("\n📋 Registration Parameters:");
    console.log(`📝 Name: ${name}`);
    console.log(`⛽ Gas Limit: ${gasLimit.toLocaleString()}`);
    console.log(`💰 Funding Amount: ${ethers.formatEther(amount)} LINK`);
    console.log(`👑 Admin: ${adminAddress}`);

    // Check LINK balance
    const linkToken = new ethers.Contract(LINK_TOKEN, [
        "function balanceOf(address owner) view returns (uint256)"
    ], deployer);

    const linkBalance = await linkToken.balanceOf(deployerAddress);
    console.log(`\n💰 LINK Balance: ${ethers.formatEther(linkBalance)} LINK`);

    if (linkBalance < amount) {
        console.log(`❌ Insufficient LINK balance. Need ${ethers.formatEther(amount)} LINK but have ${ethers.formatEther(linkBalance)} LINK`);
        console.log(`💡 Get Sepolia LINK from: https://sepoliafaucet.com/`);
        return;
    }

    try {
        console.log("\n🔐 Registering upkeep with Chainlink Automation...");
        
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
        for (const log of receipt?.logs || []) {
            try {
                const iface = new ethers.Interface([
                    "event UpkeepRegistered(uint256 indexed id, string name, bytes encryptedEmail, address indexed upkeepContract, uint32 gasLimit, address indexed adminAddress, bytes checkData, bytes offChainConfig, uint96 amount)"
                ]);
                const parsed = iface.parseLog(log as any);
                if (parsed?.name === "UpkeepRegistered") {
                    const upkeepId = parsed.args[0];
                    console.log(`🆔 Upkeep ID: ${upkeepId}`);
                    console.log(`\n🎉 Successfully registered with Chainlink Automation!`);
                    console.log(`\n📝 Next Steps:`);
                    console.log(`1. Monitor upkeep at: https://automation.chain.link/sepolia/${upkeepId}`);
                    console.log(`2. Fund upkeep with additional LINK tokens if needed`);
                    console.log(`3. Test time-based execution`);
                    console.log(`4. Monitor automation performance`);
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
        console.log("5. Ensure the contract implements IAutomationCompatible");
    }

    console.log("\n🔧 Manual Testing Commands:");
    console.log("===========================");
    console.log("# Test time trigger manually:");
    console.log(`npx hardhat run scripts/test-time-trigger.ts --network sepolia`);
    console.log("");
    console.log("# Check upkeep status:");
    console.log(`npx hardhat run scripts/check-upkeep-status.ts --network sepolia`);
    console.log("");
    console.log("# Monitor automation events:");
    console.log(`npx hardhat run scripts/monitor-automation.ts --network sepolia`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
