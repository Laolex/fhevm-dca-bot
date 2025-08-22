import { ethers } from "hardhat";

async function main() {
    const [signer] = await ethers.getSigners();
    const userAddress = await signer.getAddress();
    
    console.log("🔐 USDC Approval Helper");
    console.log(`👤 User: ${userAddress}`);
    
    // Sepolia addresses
    const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
    const VAULT_ADDRESS = "0x8D91b58336bc43222D55bC2C5aB3DEF468A54050";
    
    const usdc = await ethers.getContractAt("contracts/DCAIntentRegistry.sol:IERC20", USDC_ADDRESS, signer);
    
    // Check current balance
    const balance = await usdc.balanceOf(userAddress);
    console.log(`💰 USDC Balance: ${ethers.formatUnits(balance, 6)} USDC`);
    
    // Check current allowance
    const allowance = await usdc.allowance(userAddress, VAULT_ADDRESS);
    console.log(`✅ Current Allowance: ${ethers.formatUnits(allowance, 6)} USDC`);
    
    if (allowance > 0n) {
        console.log("✅ Already approved! No action needed.");
        return;
    }
    
    // Approve USDC to vault
    console.log("🔐 Approving USDC to vault...");
    const approveAmount = ethers.parseUnits("10000", 6); // Approve 10,000 USDC
    
    const tx = await usdc.approve(VAULT_ADDRESS, approveAmount);
    console.log(`📝 Transaction hash: ${tx.hash}`);
    
    await tx.wait();
    console.log("✅ USDC approved successfully!");
    
    // Verify approval
    const newAllowance = await usdc.allowance(userAddress, VAULT_ADDRESS);
    console.log(`✅ New Allowance: ${ethers.formatUnits(newAllowance, 6)} USDC`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
