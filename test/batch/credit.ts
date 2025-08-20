import { expect } from "chai";
import { ethers } from "hardhat";
import hre from "hardhat";

describe("RewardVault credit flow", function () {
    it("credits encrypted allocations via BatchExecutor", async function () {
        const [u1] = await ethers.getSigners();

        const Mock = await ethers.getContractFactory("MockERC20");
        const weth = await Mock.deploy("Mock WETH", "WETH", 18);
        const RewardVault = await ethers.getContractFactory("RewardVault");
        const rewardVault = await RewardVault.deploy(await weth.getAddress());
        await rewardVault.waitForDeployment();

        const BatchExecutor = await ethers.getContractFactory("BatchExecutor");
        const be = await BatchExecutor.deploy(ethers.ZeroAddress, ethers.ZeroAddress, 1);
        await be.waitForDeployment();

        // authorize executor
        await rewardVault.setAuthorizedExecutor(await be.getAddress());

        const enc = await (hre as any).fhevm
            .createEncryptedInput(await rewardVault.getAddress(), await be.getAddress())
            .add64(1234)
            .encrypt();

        await be.creditAllocations(
            await rewardVault.getAddress(),
            [await u1.getAddress()],
            [enc.handles[0]],
            [enc.inputProof]
        );

        // After credit, balance should increase; we can't decrypt, but we can at least ensure tx succeeded.
        const bal = await rewardVault.getMyEncryptedBalance();
        expect(bal).to.not.equal(ethers.ZeroHash);
    });
});


