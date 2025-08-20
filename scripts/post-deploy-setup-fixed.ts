import { ethers } from "hardhat";

// Hardcoded from last deployment (Sepolia)
const ADDRS = {
    registry: "0x220f3B089026EE38Ee45540f1862d5bcA441B877",
    executor: "0x67fd860CBa86839Df2540442755fEaB73cecaCB3",
    usdcVault: "0x1D9Ea1016eF5BF0fE22A7c93b0694d65743c0Ff6",
    rewardVault: "0xb7F90eFA12d95aE14653D70421bAc879b996b9AE",
    dexAdapter: "0xc39d98f5d59b7f4443B17E47566AaAEF24E2F355",
};

async function main() {
    const [admin] = await ethers.getSigners();
    const reg = await ethers.getContractAt("DCAIntentRegistry", ADDRS.registry, admin);
    const uv = await ethers.getContractAt("TokenVault", ADDRS.usdcVault, admin);
    const rv = await ethers.getContractAt("RewardVault", ADDRS.rewardVault, admin);
    const be = await ethers.getContractAt("BatchExecutor", ADDRS.executor, admin);

    await (await reg.setAuthorizedExecutor(ADDRS.executor)).wait();
    await (await uv.setAuthorizedExecutor(ADDRS.executor)).wait();
    await (await rv.setAuthorizedExecutor(ADDRS.executor)).wait();
    await (await be.setDexAdapter(ADDRS.dexAdapter)).wait();
    await (await be.setUsdcVault(ADDRS.usdcVault)).wait();
    await (await be.setRewardVault(ADDRS.rewardVault)).wait();

    console.log("Wiring complete.");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});


