import { expect } from "chai";
import { ethers } from "hardhat";

describe("BatchExecutor.finalizeBatch (wire check)", function () {
    it("calls token vault transferOut and dex swap to reward vault", async function () {
        const [deployer] = await ethers.getSigners();

        const Mock = await ethers.getContractFactory("MockERC20");
        const usdc = await Mock.deploy("Mock USDC", "USDC", 6);
        const weth = await Mock.deploy("Mock WETH", "WETH", 18);

        const TokenVault = await ethers.getContractFactory("TokenVault");
        const usdcVault = await TokenVault.deploy(await usdc.getAddress());
        await usdcVault.waitForDeployment();
        await usdcVault.setAuthorizedExecutor(await deployer.getAddress());

        const RewardVault = await ethers.getContractFactory("RewardVault");
        const rewardVault = await RewardVault.deploy(await weth.getAddress());
        await rewardVault.waitForDeployment();

        // Use mock router so DexAdapter call succeeds
        const MockRouter = await ethers.getContractFactory("MockSwapRouterV3");
        const router = await MockRouter.deploy();
        const DexAdapter = await ethers.getContractFactory("DexAdapter");
        const dex = await DexAdapter.deploy(await usdc.getAddress(), await weth.getAddress(), await router.getAddress());
        await dex.waitForDeployment();

        const MockRegistry = await ethers.getContractFactory("MockRegistry");
        const reg = await MockRegistry.deploy();
        const BatchExecutor = await ethers.getContractFactory("BatchExecutor");
        const be = await BatchExecutor.deploy(await reg.getAddress(), await dex.getAddress(), 0);
        await be.waitForDeployment();

        // Fund vault and run finalize
        await usdc.mint(await deployer.getAddress(), 1_000_000);
        await usdc.approve(await usdcVault.getAddress(), 1_000_000);
        await usdcVault.deposit(250_000);

        // authorize executor as batch executor calls into vault
        await usdcVault.setAuthorizedExecutor(await be.getAddress());
        const users: string[] = [];
        const execRes = await be.executeBatch(users);
        await execRes.wait();
        const batchId = 1;
        await be.finalizeBatch(batchId, users, 100_000, 0, 3000, await rewardVault.getAddress(), await usdcVault.getAddress(), await dex.getAddress());

        expect(await usdc.balanceOf(await dex.getAddress())).to.equal(100_000);
    });
});


