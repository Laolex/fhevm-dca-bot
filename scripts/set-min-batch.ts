import { ethers } from "hardhat";

async function main() {
    const beAddr = process.env.BATCH_EXECUTOR || (await (await import("hardhat")).deployments.get("BatchExecutor")).address;
    const be = await ethers.getContractAt("BatchExecutor", beAddr);
    const tx = await be.setMinBatchUsers(1);
    const rcpt = await tx.wait();
    console.log(JSON.stringify({ batchExecutor: beAddr, txHash: tx.hash, status: rcpt?.status }, null, 2));
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});


