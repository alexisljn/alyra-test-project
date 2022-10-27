import {ethers} from "hardhat";
import {Voting} from "../typechain-types";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";

describe("Voting smart contract test", () => {

    async function deployVotingFixture() {
        const votingFactory = await ethers.getContractFactory("Voting");

        const voting: Voting = await votingFactory.deploy();

        await voting.deployed();

        return voting;
    }

    it('should deny if user is not owner', async () => {
        const voting = await loadFixture(deployVotingFixture);

        const [owner, nonOwner] = await ethers.getSigners()

        await expect(voting.connect(nonOwner).addVoter(nonOwner.address))
            .to
            .be
            .revertedWith("Ownable: caller is not the owner");
    });

    it('should deny if user is not voter', async () => {
        const voting = await loadFixture(deployVotingFixture);

        const [owner] = await ethers.getSigners();

        await expect(voting.getVoter(owner.address)).to.be.revertedWith("You're not a voter");
    });

    it('should deny if trying to add voter in wrong period', async () => {
        const voting = await loadFixture(deployVotingFixture);

        const [owner] = await ethers.getSigners();

        // Change status of the voting
        await voting.startProposalsRegistering();

        await expect(voting.addVoter(owner.address)).to.be.revertedWith("Voters registration is not open yet");
    });
});
