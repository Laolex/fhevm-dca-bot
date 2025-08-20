import hre, { ethers } from "hardhat";

function parseArgs() {
    return Object.fromEntries(
        process.argv.slice(2).map((a) => {
            const [k, v] = a.split("=");
            return [k.replace(/^--/, ""), v ?? ""];
        })
    ) as Record<string, string>;
}

async function main() {
    const args = parseArgs();
    let registry = args.registry;
    let executor = args.executor;
    let usdcVault = args.usdcVault;
    let rewardVault = args.rewardVault;
    if (!registry) registry = (await hre.deployments.get("DCAIntentRegistry")).address;
    if (!executor) executor = (await hre.deployments.get("BatchExecutor")).address;
    if (!usdcVault) usdcVault = (await hre.deployments.get("TokenVault")).address;
    if (!rewardVault) rewardVault = (await hre.deployments.get("RewardVault")).address;

    const signerIndex = Number(args.signer ?? "0");
    const signers = await ethers.getSigners();
    const admin = signers[signerIndex] ?? signers[0];

    const reg = await ethers.getContractAt("DCAIntentRegistry", registry, admin);
    const uv = await ethers.getContractAt("TokenVault", usdcVault, admin);
    const rv = await ethers.getContractAt("RewardVault", rewardVault, admin);
    const be = await ethers.getContractAt("BatchExecutor", executor, admin);

    // Wire authorizations
    await (await reg.setAuthorizedExecutor(executor)).wait();
    await (await uv.setAuthorizedExecutor(executor)).wait();
    await (await rv.setAuthorizedExecutor(executor)).wait();

    // Optional: set vaults/dex on executor if provided
    if (args.setOnExecutor === "true") {
        if (args.dexAdapter) {
            await (await be.setDexAdapter(args.dexAdapter)).wait();
        }
        await (await be.setUsdcVault(usdcVault)).wait();
        await (await be.setRewardVault(rewardVault)).wait();
    }

    console.log("Post-deploy wiring completed.");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});


