import { expect } from "chai";
import { ethers } from "hardhat";
import hre from "hardhat";

describe("DCAIntentRegistry", function () {
    it("stores and returns encrypted params", async function () {
        const [user] = await ethers.getSigners();
        const Registry = await ethers.getContractFactory("DCAIntentRegistry");
        const reg = await Registry.deploy();
        await reg.waitForDeployment();

        // Use fhevmjs via hardhat runtime (fhevm plugin) to encrypt inputs
        // Encrypt: budget=1000, amountPerInterval=100, intervalSeconds=60, totalIntervals=10
        const enc = await (hre as any).fhevm
            .createEncryptedInput(await reg.getAddress(), await user.getAddress())
            .add64(1000)
            .add64(100)
            .add32(60)
            .add32(10)
            .encrypt();

        await reg
            .connect(user)
            .submitIntent(enc.handles[0], enc.inputProof, enc.handles[1], enc.inputProof, enc.handles[2], enc.inputProof, enc.handles[3], enc.inputProof);

        const res = await reg.connect(user).getMyParams();
        // We can at least assert the boolean is true without decrypting
        expect(res[5]).to.equal(true);
    });
});


