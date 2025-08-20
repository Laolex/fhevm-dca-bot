import { ethers } from "hardhat";
import { createInstance } from "fhevmjs";

async function main() {
    const networkName = (await ethers.provider.getNetwork()).name || "sepolia";
    const fhevm = await createInstance({ network: networkName, provider: ethers.provider });

    const signer = (await ethers.getSigners())[0];

    const contractAddress = process.env.DONATION_ADDRESS ?? "0x_deployed_address";
    const donation = await ethers.getContractAt("Donation", contractAddress, signer);

    // Encrypt and donate
    const amount = 100;
    const encryptedAmount = await fhevm.encrypt32(amount, signer.address);
    const tx = await donation.donate(encryptedAmount);
    await tx.wait();
    console.log("Donation submitted");

    // Get and decrypt donation
    const encryptedDonation = await donation.getMyDonation();
    const decrypted = await fhevm.decrypt32(encryptedDonation, signer.address);
    console.log(`My donation: ${decrypted}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});