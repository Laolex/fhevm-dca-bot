import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { FhevmType } from "@fhevm/hardhat-plugin";

/**
 * Example:
 *   - npx hardhat --network localhost donation:address
 *   - npx hardhat --network sepolia donation:address
 */
task("donation:address", "Prints the Donation address").setAction(async function (_taskArguments: TaskArguments, hre) {
    const { deployments } = hre;

    const donation = await deployments.get("Donation");

    console.log("Donation address is " + donation.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost donation:donate --value 100
 *   - npx hardhat --network sepolia donation:donate --value 100 --address 0x...
 */
task("donation:donate", "Encrypts a value and calls donate() on Donation")
    .addParam("value", "Donation amount (integer)")
    .addOptionalParam("address", "Optionally specify the Donation contract address")
    .setAction(async function (args: TaskArguments, hre) {
        const { ethers, deployments, fhevm } = hre;

        const value = parseInt(args.value);
        if (!Number.isInteger(value)) {
            throw new Error(`Argument --value is not an integer`);
        }

        const DonationDeployment = args.address ? { address: args.address } : await deployments.get("Donation");
        const contractAddress: string = DonationDeployment.address;
        const [signer] = await ethers.getSigners();

        await fhevm.initializeCLIApi();

        const encrypted = await fhevm.createEncryptedInput(contractAddress, signer.address).add32(value).encrypt();

        const donation = await ethers.getContractAt("Donation", contractAddress, signer);
        const tx = await donation.donate(encrypted.handles[0], encrypted.inputProof);
        console.log(`Wait for tx:${tx.hash}...`);
        const receipt = await tx.wait();
        console.log(`tx:${tx.hash} status=${receipt?.status}`);
    });

/**
 * Example:
 *   - npx hardhat --network localhost donation:mine
 *   - npx hardhat --network sepolia donation:mine --address 0x...
 */
task("donation:mine", "Fetches and decrypts your donation amount")
    .addOptionalParam("address", "Optionally specify the Donation contract address")
    .setAction(async function (args: TaskArguments, hre) {
        const { ethers, deployments, fhevm } = hre;

        const DonationDeployment = args.address ? { address: args.address } : await deployments.get("Donation");
        const contractAddress: string = DonationDeployment.address;
        const [signer] = await ethers.getSigners();

        await fhevm.initializeCLIApi();

        const donation = await ethers.getContractAt("Donation", contractAddress, signer);
        const encMine = await donation.getMyDonation();
        const clearMine = await fhevm.userDecryptEuint(FhevmType.euint32, encMine, contractAddress, signer);
        console.log(`Your donation: ${clearMine}`);
    });


