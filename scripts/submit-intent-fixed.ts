import hre, { ethers } from "hardhat";
import { createInstance } from "@zama-fhe/relayer-sdk";

// Hardcoded Sepolia addresses
const REGISTRY = "0x220f3B089026EE38Ee45540f1862d5bcA441B877";

async function main() {
    const [signer] = await ethers.getSigners();
    const user = await signer.getAddress();
    const provider: any = (ethers as any).provider; // EIP-1193 compat via hardhat

    const relayer = await createInstance(provider);
    const ci = await relayer
        .createEncryptedInput(REGISTRY, user)
        .add64(1_000_000n) // budget
        .add64(100_000n)   // per interval
        .add32(60)         // interval seconds
        .add32(5)          // periods
        .encrypt();

    const registry = await ethers.getContractAt("DCAIntentRegistry", REGISTRY, signer);
    const tx = await registry.submitIntent(
        ci.handles[0], ci.inputProof,
        ci.handles[1], ci.inputProof,
        ci.handles[2], ci.inputProof,
        ci.handles[3], ci.inputProof
    );
    const rcpt = await tx.wait();
    console.log(JSON.stringify({ user, submitTx: tx.hash, status: rcpt?.status }, null, 2));
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});


