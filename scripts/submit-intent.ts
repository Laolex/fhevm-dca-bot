import hre, { ethers } from "hardhat";

async function main() {
    const args = Object.fromEntries(
        process.argv.slice(2).map((a) => {
            const [k, v] = a.split("=");
            return [k.replace(/^--/, ""), v ?? ""];
        })
    ) as Record<string, string>;

    const registryAddress = args.address;
    if (!registryAddress) {
        throw new Error("Missing --address=<DCAIntentRegistry>");
    }

    const budget = BigInt(args.budget ?? "0");
    const per = BigInt(args.per ?? "0");
    const interval = Number(args.interval ?? "0");
    const periods = Number(args.periods ?? "0");
    const signerIndex = Number(args.signer ?? "0");

    const signers = await ethers.getSigners();
    const signer = signers[signerIndex] ?? signers[0];

    const registry = await ethers.getContractAt("DCAIntentRegistry", registryAddress, signer);

    const encrypted = await (hre as any).fhevm
        .createEncryptedInput(registryAddress, await signer.getAddress())
        .add64(budget)
        .add64(per)
        .add32(interval)
        .add32(periods)
        .encrypt();

    const tx = await registry.submitIntent(
        encrypted.handles[0],
        encrypted.inputProof,
        encrypted.handles[1],
        encrypted.inputProof,
        encrypted.handles[2],
        encrypted.inputProof,
        encrypted.handles[3],
        encrypted.inputProof
    );
    const rcpt = await tx.wait();
    console.log(JSON.stringify({ txHash: tx.hash, status: rcpt?.status }, null, 2));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});


