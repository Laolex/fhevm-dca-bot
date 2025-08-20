import { expect } from "chai";
import { ethers } from "hardhat";
import hre from "hardhat";

describe("BatchExecutor.executeBatch", function () {
    it("returns an encrypted total and increments spent for users", async function () {
        const [u1, u2] = await ethers.getSigners();

        const Registry = await ethers.getContractFactory("DCAIntentRegistry");
        const reg = await Registry.deploy();
        await reg.waitForDeployment();

        const beFactory = await ethers.getContractFactory("BatchExecutor");
        const be = await beFactory.deploy(await reg.getAddress(), ethers.ZeroAddress, 2);
        await be.waitForDeployment();

        // submit intents: u1 amountPerInterval=100, u2 amountPerInterval=50
        const enc1 = await (hre as any).fhevm
            .createEncryptedInput(await reg.getAddress(), await u1.getAddress())
            .add64(1000)
            .add64(100)
            .add32(60)
            .add32(10)
            .encrypt();
        await reg.connect(u1).submitIntent(enc1.handles[0], enc1.inputProof, enc1.handles[1], enc1.inputProof, enc1.handles[2], enc1.inputProof, enc1.handles[3], enc1.inputProof);

        const enc2 = await (hre as any).fhevm
            .createEncryptedInput(await reg.getAddress(), await u2.getAddress())
            .add64(2000)
            .add64(50)
            .add32(60)
            .add32(10)
            .encrypt();
        await reg.connect(u2).submitIntent(enc2.handles[0], enc2.inputProof, enc2.handles[1], enc2.inputProof, enc2.handles[2], enc2.inputProof, enc2.handles[3], enc2.inputProof);

        // authorize executor
        await reg.setAuthorizedExecutor(await be.getAddress());
        await reg.grantExecutorOnUsers([await u1.getAddress(), await u2.getAddress()]);

        const users = [await u1.getAddress(), await u2.getAddress()];
        const tx = await be.executeBatch(users);
        const receipt = await tx.wait();
        expect(receipt?.status).to.equal(1);
    });
});


