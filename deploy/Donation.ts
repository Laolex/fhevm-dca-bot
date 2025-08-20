import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy, log } = hre.deployments;

    const deployed = await deploy("Donation", {
        from: deployer,
        log: true,
    });

    log(`Donation contract: ${deployed.address}`);
};

export default func;
func.id = "deploy_donation"; // id required to prevent reexecution
func.tags = ["Donation"];


