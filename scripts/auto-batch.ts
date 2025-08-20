import { ethers } from "hardhat";

function parseArgs() {
    const args = Object.fromEntries(
        process.argv.slice(2).map((a) => {
            const [k, v] = a.split("=");
            return [k.replace(/^--/, ""), v ?? ""];
        })
    ) as Record<string, string>;
    return args;
}

async function main() {
    const args = parseArgs();
    const batchExecutor = args.executor;
    if (!batchExecutor) throw new Error("Missing --executor=<BatchExecutor>");

    const usersPath = args.users;
    if (!usersPath) throw new Error("Missing --users=<path to json array of addresses>");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const users: string[] = require(require("path").resolve(process.cwd(), usersPath));

    const usdcToSwap = BigInt(args.usdc ?? "0");
    const minEthOut = BigInt(args.minEthOut ?? "0");
    const poolFee = Number(args.poolFee ?? "3000");
    const useOracle = (args.useOracle ?? "true").toLowerCase() === "true";
    const oracleTimeoutSec = Number(args.oracleTimeoutSec ?? "30");
    const rewardVault = args.rewardVault;
    const usdcVault = args.usdcVault;
    const dexAdapter = args.dexAdapter;
    if (!rewardVault || !usdcVault || !dexAdapter) {
        throw new Error("Missing one of --rewardVault --usdcVault --dexAdapter");
    }

    const signerIndex = Number(args.signer ?? "0");
    const signers = await ethers.getSigners();
    const signer = signers[signerIndex] ?? signers[0];

    const be = await ethers.getContractAt("BatchExecutor", batchExecutor, signer);

    // Execute batch
    const txExec = await be.executeBatch(users);
    const rcptExec = await txExec.wait();

    // Parse BatchPrepared to get batchId
    const iface = new ethers.Interface([
        "event BatchPrepared(uint256 indexed batchId, uint256 userCount)",
    ]);
    let batchId: bigint | undefined;
    for (const log of rcptExec?.logs || []) {
        try {
            const parsed = iface.parseLog(log as any);
            if (parsed?.name === "BatchPrepared") {
                batchId = parsed.args[0] as bigint;
                break;
            }
        } catch (_) {
            // ignore non-matching logs
        }
    }
    if (batchId === undefined) throw new Error("BatchPrepared event not found");

    let finalizeHash = "";
    let finalizeStatus: number | undefined = undefined;
    if (useOracle) {
        // wait for BatchDecryptionFulfilled
        const startBlock = rcptExec?.blockNumber ?? (await ethers.provider.getBlockNumber());
        const until = Date.now() + oracleTimeoutSec * 1000;
        let fulfilled = false;
        while (Date.now() < until && !fulfilled) {
            // @ts-ignore
            const events = await (be as any).queryFilter((be as any).filters.BatchDecryptionFulfilled(batchId), startBlock);
            if (events && events.length > 0) {
                fulfilled = true;
                break;
            }
            await new Promise((r) => setTimeout(r, 2000));
        }
        if (!fulfilled) throw new Error("Timed out waiting for BatchDecryptionFulfilled");
        const txFin = await be.finalizeBatchWithOracle(
            batchId,
            users,
            minEthOut,
            poolFee,
            rewardVault,
            usdcVault,
            dexAdapter
        );
        const rcptFin = await txFin.wait();
        finalizeHash = txFin.hash;
        finalizeStatus = rcptFin?.status;
    } else {
        const txFin = await be.finalizeBatch(
            batchId,
            users,
            usdcToSwap,
            minEthOut,
            poolFee,
            rewardVault,
            usdcVault,
            dexAdapter
        );
        const rcptFin = await txFin.wait();
        finalizeHash = txFin.hash;
        finalizeStatus = rcptFin?.status;
    }
    console.log(
        JSON.stringify(
            {
                execute: { txHash: txExec.hash, status: rcptExec?.status, batchId: batchId.toString() },
                finalize: { txHash: finalizeHash, status: finalizeStatus },
            },
            null,
            2
        )
    );
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});


