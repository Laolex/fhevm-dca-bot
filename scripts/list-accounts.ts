import { ethers } from "hardhat";

async function main() {
    const signers = await ethers.getSigners();
    for (let i = 0; i < Math.min(signers.length, 5); i++) {
        console.log(await signers[i].getAddress());
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
