import type { DeployFunction } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, get } = deployments;
    const { deployer } = await getNamedAccounts();

    const be = await get("BatchExecutor");
    await deploy("AutomationForwarder", {
        from: deployer,
        log: true,
        args: [be.address],
        waitConfirmations: 1,
    });
};

export default func;
func.tags = ["AutomationForwarder"];
func.dependencies = ["BatchExecutor"];

