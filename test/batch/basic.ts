import { expect } from "chai";
import { ethers } from "hardhat";

describe("Batch + Vault flow (basic)", function () {
    it("transfers USDC out of vault and deposits rewards", async function () {
        const [deployer, user, executor] = await ethers.getSigners();

        // Deploy mocks
        const Mock = await ethers.getContractFactory("MockERC20");
        const usdc = await Mock.deploy("Mock USDC", "USDC", 6);
        const weth = await Mock.deploy("Mock WETH", "WETH", 18);

        // Deploy vaults linked to mocks
        const TokenVault = await ethers.getContractFactory("TokenVault");
        const usdcVault = await TokenVault.deploy(await usdc.getAddress());
        await usdcVault.waitForDeployment();
        await usdcVault.connect(deployer).setAuthorizedExecutor(await deployer.getAddress());

        const RewardVault = await ethers.getContractFactory("RewardVault");
        const rewardVault = await RewardVault.deploy(await weth.getAddress());
        await rewardVault.waitForDeployment();
        await rewardVault.connect(deployer).setAuthorizedExecutor(await deployer.getAddress());

        // Fund user with USDC and deposit
        await usdc.mint(await user.getAddress(), 1_000_000);
        await usdc.connect(user).approve(await usdcVault.getAddress(), 1_000_000);
        await usdcVault.connect(user).deposit(500_000);

        // Simulate finalizeBatch moving USDC from vault to adapter and depositing WETH to reward vault
        const BatchExecutor = await ethers.getContractFactory("BatchExecutor");
        const registryAddr = ethers.ZeroAddress;
        const dexAdapterAddr = ethers.ZeroAddress;
        const be = await BatchExecutor.deploy(registryAddr, dexAdapterAddr, 1);
        await be.waitForDeployment();

        // Move USDC out (to adapter address which we fake as deployer), then deposit WETH to reward vault from executor
        await usdcVault.transferOut(await deployer.getAddress(), 100_000);
        await weth.mint(await executor.getAddress(), 50_000);
        await weth.connect(executor).approve(await rewardVault.getAddress(), 50_000);
        await rewardVault.depositFrom(await executor.getAddress(), 50_000);

        // Basic assertions
        expect(await usdc.balanceOf(await deployer.getAddress())).to.equal(100_000);
        expect(await weth.balanceOf(await rewardVault.getAddress())).to.equal(50_000);
    });
});


