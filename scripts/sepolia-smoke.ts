import hre, { ethers } from "hardhat";

// Hardcoded deployed addresses on Sepolia
const ADDRS = {
    registry: "0x220f3B089026EE38Ee45540f1862d5bcA441B877",
    executor: "0x67fd860CBa86839Df2540442755fEaB73cecaCB3",
    usdcVault: "0x1D9Ea1016eF5BF0fE22A7c93b0694d65743c0Ff6",
    rewardVault: "0xb7F90eFA12d95aE14653D70421bAc879b996b9AE",
    dexAdapter: "0xc39d98f5d59b7f4443B17E47566AaAEF24E2F355",
};

async function main() {
    const [signer] = await ethers.getSigners();
    const user = await signer.getAddress();

    // 1) Submit encrypted intent
    const registry = await ethers.getContractAt("DCAIntentRegistry", ADDRS.registry, signer);
    const enc = await (hre as any).fhevm
        .createEncryptedInput(ADDRS.registry, user)
        .add64(1_000_000n) // budget
        .add64(100_000n) // per interval
        .add32(60) // interval secs
        .add32(5) // periods
        .encrypt();
    const tx1 = await registry.submitIntent(
        enc.handles[0], enc.inputProof,
        enc.handles[1], enc.inputProof,
        enc.handles[2], enc.inputProof,
        enc.handles[3], enc.inputProof
    );
    const rcpt1 = await tx1.wait();

    // 2) Set min batch users to 1 for smoke
    const be = await ethers.getContractAt("BatchExecutor", ADDRS.executor, signer);
    await (await be.setMinBatchUsers(1)).wait();

    // 3) Execute batch with only this user
    const execTx = await be.executeBatch([user]);
    const execRcpt = await execTx.wait();

    // 4) Wait for oracle decryption fulfilled event
    const iface = new ethers.Interface([
        "event BatchDecryptionFulfilled(uint256 indexed batchId, uint64 decryptedTotal)",
        "event BatchPrepared(uint256 indexed batchId, uint256 userCount)",
    ]);
    let batchId: bigint | undefined;
    for (const log of execRcpt?.logs || []) {
        try {
            const p = iface.parseLog(log as any);
            if (p?.name === "BatchPrepared") {
                batchId = p.args[0] as bigint;
            }
        } catch { }
    }
    if (!batchId) batchId = 1n; // fallback for first batch

    const startBlock = execRcpt?.blockNumber ?? (await ethers.provider.getBlockNumber());
    const until = Date.now() + 90_000; // 90s
    let fulfilled = false;
    while (Date.now() < until && !fulfilled) {
        // @ts-ignore
        const events = await (be as any).queryFilter((be as any).filters.BatchDecryptionFulfilled(batchId), startBlock);
        if (events && events.length > 0) {
            fulfilled = true;
            break;
        }
        await new Promise((r) => setTimeout(r, 3000));
    }
    if (!fulfilled) throw new Error("Timed out waiting for BatchDecryptionFulfilled");

    // 5) Finalize with oracle
    const finTx = await be.finalizeBatchWithOracle(
        batchId,
        [user],
        0, // minEthOut
        3000, // pool fee
        ADDRS.rewardVault,
        ADDRS.usdcVault,
        ADDRS.dexAdapter
    );
    const finRcpt = await finTx.wait();

    console.log(JSON.stringify({
        user,
        submitTx: tx1.hash,
        executeTx: execTx.hash,
        finalizeTx: finTx.hash,
        statuses: { submit: rcpt1?.status, execute: execRcpt?.status, finalize: finRcpt?.status }
    }, null, 2));
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});


