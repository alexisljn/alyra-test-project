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
});
