import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    const userAddress = await signer.getAddress();
    
    console.log("🔐 Manual USDC Approval");
    console.log(`👤 User: ${userAddress}`);
    
    // Sepolia addresses
    const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
    const VAULT_ADDRESS = "0x8D91b58336bc43222D55bC2C5aB3DEF468A54050";
    
    // Get approval amount from command line or use default
    const approvalAmount = process.env.APPROVAL_AMOUNT || "10000"; // Default 10,000 USDC
    const amountWei = ethers.parseUnits(approvalAmount, 6);
    
    console.log(`💰 Approval Amount: ${approvalAmount} USDC (${amountWei} wei)`);
    
    const usdc = await ethers.getContractAt("contracts/DCAIntentRegistry.sol:IERC20", USDC_ADDRESS, signer);
    
    // Check current balance
    const balance = await usdc.balanceOf(userAddress);
    console.log(`💰 USDC Balance: ${ethers.formatUnits(balance, 6)} USDC`);
    
    if (balance < amountWei) {
        console.log(`⚠️ Warning: You're approving more than your balance!`);
        console.log(`   Balance: ${ethers.formatUnits(balance, 6)} USDC`);
        console.log(`   Approving: ${approvalAmount} USDC`);
    }
    
    // Check current allowance
    const allowance = await usdc.allowance(userAddress, VAULT_ADDRESS);
    console.log(`✅ Current Allowance: ${ethers.formatUnits(allowance, 6)} USDC`);
    
    if (allowance >= amountWei) {
        console.log("✅ Already approved! No action needed.");
        return;
    }
    
    // Approve USDC to vault
    console.log("🔐 Approving USDC to vault...");
    console.log(`📝 Transaction details:`);
    console.log(`   From: ${userAddress}`);
    console.log(`   To: ${USDC_ADDRESS}`);
    console.log(`   Spender: ${VAULT_ADDRESS}`);
    console.log(`   Amount: ${approvalAmount} USDC`);
    
    const tx = await usdc.approve(VAULT_ADDRESS, amountWei);
    console.log(`📝 Transaction hash: ${tx.hash}`);
    console.log(`⏳ Waiting for confirmation...`);
    
    await tx.wait();
    console.log("✅ USDC approved successfully!");
    
    // Verify approval
    const newAllowance = await usdc.allowance(userAddress, VAULT_ADDRESS);
    console.log(`✅ New Allowance: ${ethers.formatUnits(newAllowance, 6)} USDC`);
    
    console.log("\n🎉 You can now submit DCA intents!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
