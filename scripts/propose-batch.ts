import { ethers } from "hardhat";

function parseArgs() {
    return Object.fromEntries(
        process.argv.slice(2).map((a) => {
            const [k, v] = a.split("=");
            return [k.replace(/^--/, ""), v ?? ""];
        })
    ) as Record<string, string>;
}

async function main() {
    const args = parseArgs();
    const forwarder = args.forwarder;
    if (!forwarder) throw new Error("Missing --forwarder=<AutomationForwarder>");

    const usersPath = args.users;
    if (!usersPath) throw new Error("Missing --users=<path to json array of addresses>");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const users: string[] = require(require("path").resolve(process.cwd(), usersPath));

    const signerIndex = Number(args.signer ?? "0");
    const signers = await ethers.getSigners();
    const proposer = signers[signerIndex] ?? signers[0];

    const abi = new ethers.Interface([
        "function propose(bytes performData)"
    ]);
    const fwd = new ethers.Contract(forwarder, abi, proposer);

    const performData = ethers.AbiCoder.defaultAbiCoder().encode(["address[]"], [users]);
    const tx = await fwd.propose(performData);
    const rcpt = await tx.wait();
    console.log(JSON.stringify({ txHash: tx.hash, status: rcpt?.status }, null, 2));
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});


