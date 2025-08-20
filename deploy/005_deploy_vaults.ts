import type { DeployFunction } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const USDC_ADDRESS = process.env.USDC_ADDRESS ?? "0x0000000000000000000000000000000000000000";
    await deploy("TokenVault", {
        from: deployer,
        log: true,
        args: [USDC_ADDRESS],
        waitConfirmations: 1,
    });
};

export default func;
func.tags = ["Vaults"];

