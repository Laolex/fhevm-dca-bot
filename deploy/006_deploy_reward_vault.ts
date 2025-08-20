import type { DeployFunction } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const WETH_ADDRESS = process.env.WETH_ADDRESS ?? "0x0000000000000000000000000000000000000000";
    await deploy("RewardVault", {
        from: deployer,
        log: true,
        args: [WETH_ADDRESS],
        waitConfirmations: 1,
    });
};

export default func;
func.tags = ["RewardVault"];

