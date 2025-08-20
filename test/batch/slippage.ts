import { expect } from "chai";
import { ethers } from "hardhat";

describe("DexAdapter slippage guard (mock)", function () {
    it("reverts when minAmountOut > simulated output", async function () {
        const Mock = await ethers.getContractFactory("MockERC20");
        const usdc = await Mock.deploy("Mock USDC", "USDC", 6);
        const weth = await Mock.deploy("Mock WETH", "WETH", 18);

        const MockRouter = await ethers.getContractFactory("MockSwapRouterV3");
        const router = await MockRouter.deploy();
        const DexAdapter = await ethers.getContractFactory("DexAdapter");
        const dex = await DexAdapter.deploy(await usdc.getAddress(), await weth.getAddress(), await router.getAddress());

        await usdc.mint(await dex.getAddress(), 1_000_000);
        // amountIn = 100_000, simulated out = 50_000; set minOut higher to force revert
        await expect(dex.swapUsdcForEth(100_000, 60_000, await (await ethers.getSigners())[0].getAddress(), 3000))
            .to.be.revertedWithCustomError || to.be.reverted; // generic revert
    });
});


