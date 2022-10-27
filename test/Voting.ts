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
            .revertedWith("Ownable: caller is not the owner")
        ;
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

    it('should deny if trying to add a voter which is already been registered', async () => {
        const voting = await loadFixture(deployVotingFixture);

        const [owner] = await ethers.getSigners();

        // Add voter
        await voting.addVoter(owner.address);

        await expect(voting.addVoter(owner.address)).to.be.revertedWith("Already registered");
    });

    it('should return event to prove success of voter registration', async () => {
        const voting = await loadFixture(deployVotingFixture);

        const [owner] = await ethers.getSigners();

        await expect(voting.addVoter(owner.address))
            .to
            .emit(voting, "VoterRegistered")
            .withArgs(owner.address)
        ;
    });

    it('should return expected voters', async () => {
        const voting = await loadFixture(deployVotingFixture);

        const [owner] = await ethers.getSigners();

        // Add voter
        await voting.addVoter(owner.address);

        const voter: Voting.VoterStruct = await voting.getVoter(owner.address);

        const nonRegisteredVoter: Voting.VoterStruct = await voting.getVoter(ethers.constants.AddressZero);

        await expect(voter.isRegistered).to.be.equal(true);

        await expect(nonRegisteredVoter.isRegistered).to.be.equal(false);
    });

    it('should deny if user adds proposal in wrong period', async () => {
        const voting = await loadFixture(deployVotingFixture);

        const [owner] = await ethers.getSigners();

        // Add voter
        await voting.addVoter(owner.address);

        await expect(voting.addProposal("This proposal won't pass"))
            .to
            .be
            .revertedWith("Proposals are not allowed yet")
        ;
    });

    it('should deny if owner try to start proposals registration in wrong period', async () => {
        const voting = await loadFixture(deployVotingFixture);

        // Change period
        await voting.startProposalsRegistering();

        await voting.endProposalsRegistering();

        await expect(voting.startProposalsRegistering())
            .to
            .be
            .revertedWith("Registering proposals cant be started now")
        ;
    });

    it('should return event to prove success of starting proposals registrations', async () => {
        const voting = await loadFixture(deployVotingFixture);

        await expect(voting.startProposalsRegistering())
            .to
            .emit(voting, "WorkflowStatusChange")
            .withArgs(0,1)
        ;
    });

    it('should deny if user submit empty proposal', async () => {
        const voting = await loadFixture(deployVotingFixture);

        const [owner] = await ethers.getSigners();

        // Add voter
        await voting.addVoter(owner.address);

        // Change voting period
        await voting.startProposalsRegistering();

        await expect(voting.addProposal("")).to.be.revertedWith("Vous ne pouvez pas ne rien proposer");
    });

    it('should prove success on proposal submit', async () => {
        const voting = await loadFixture(deployVotingFixture);

        const [owner] = await ethers.getSigners();

        // Add voter
        await voting.addVoter(owner.address);

        // Change voting period
        await voting.startProposalsRegistering();

        await expect(voting.addProposal("Valid Proposal"))
            .to
            .emit(voting, "ProposalRegistered")
            .withArgs(1)
        ;
    });
});
