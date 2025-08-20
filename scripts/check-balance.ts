import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.provider?.getBalance(deployer.address);
  console.log(`Address: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(balance || 0)} ETH`);
}

main().catch(console.error);
