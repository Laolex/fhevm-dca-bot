import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { FhevmType } from "@fhevm/hardhat-plugin";

describe("Donation", function () {
    async function deployFixture() {
        const [owner, alice, bob] = await ethers.getSigners();
        const Donation = await ethers.getContractFactory("Donation");
        const donation = await Donation.deploy();
        return { donation, owner, alice, bob };
    }

    before(function () {
        if (!fhevm.isMock) {
            console.warn("Donation tests are designed for the mock environment only");
            this.skip();
        }
    });

    it("initial total is zero", async function () {
        const { donation, owner } = await loadFixture(deployFixture);
        const encryptedTotal = await donation.getTotalDonations();
        expect(encryptedTotal).to.eq(ethers.ZeroHash);
    });

    it("single donation updates user and total", async function () {
        const { donation, owner, alice } = await loadFixture(deployFixture);
        const donationAddr = await donation.getAddress();

        const enc = await fhevm.createEncryptedInput(donationAddr, alice.address).add32(100).encrypt();
        await (
            await donation
                .connect(alice)
                .donate(enc.handles[0] /* externalEuint32 */, enc.inputProof /* bytes */)
        ).wait();

        const encMine = await donation.connect(alice).getMyDonation();
        const clearMine = await fhevm.userDecryptEuint(FhevmType.euint32, encMine, donationAddr, alice);
        expect(clearMine).to.eq(100);

        const encTotal = await donation.getTotalDonations();
        const clearTotal = await fhevm.userDecryptEuint(FhevmType.euint32, encTotal, donationAddr, owner);
        expect(clearTotal).to.eq(100);
    });
});