import type { DeployFunction } from "hardhat-deploy/types";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, get } = deployments;
    const { deployer } = await getNamedAccounts();

    const registry = await get("DCAIntentRegistry");

    const USDC_ADDRESS = (process.env.USDC_ADDRESS ?? "0x0000000000000000000000000000000000000000").toLowerCase();
    const WETH_ADDRESS = (process.env.WETH_ADDRESS ?? "0x0000000000000000000000000000000000000000").toLowerCase();
    const UNISWAP_V3_ROUTER = (process.env.UNISWAP_V3_ROUTER ?? "0x0000000000000000000000000000000000000000").toLowerCase();
    const MIN_BATCH_USERS = Number(process.env.MIN_BATCH_USERS ?? "10");

    const dex = await deploy("DexAdapter", {
        from: deployer,
        log: true,
        args: [USDC_ADDRESS, WETH_ADDRESS, UNISWAP_V3_ROUTER],
        waitConfirmations: 1,
    });

    await deploy("BatchExecutor", {
        from: deployer,
        log: true,
        args: [registry.address, dex.address, MIN_BATCH_USERS],
        waitConfirmations: 1,
    });
};

export default func;
func.tags = ["BatchStack"];
func.dependencies = ["DCAIntentRegistry"];

