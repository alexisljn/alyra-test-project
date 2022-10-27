import {ethers} from "hardhat";
import {Voting} from "../typechain-types";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {BigNumber} from "ethers";

describe("Voting smart contract test", () => {

    async function deployVotingFixture() {
        const votingFactory = await ethers.getContractFactory("Voting");

        const voting: Voting = await votingFactory.deploy();

        await voting.deployed();

        return voting;
    }

    describe("Test modifiers of contract", () => {
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
    })

    describe("Test Workflow status changes", () => {
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

        it('should deny if owner try to end proposal registration in wrong period', async () => {
            const voting = await loadFixture(deployVotingFixture);

            await expect(voting.endProposalsRegistering())
                .to
                .be
                .revertedWith("Registering proposals havent started yet")
            ;

        });

        it('should emit event to act the end of proposal registration', async () => {
            const voting = await loadFixture(deployVotingFixture);

            // Change period
            await voting.startProposalsRegistering();

            await expect(voting.endProposalsRegistering())
                .to
                .emit(voting, "WorkflowStatusChange")
                .withArgs(1,2)
            ;
        });

        it('should deny if owner try to start voting in wrong period', async () => {
            const voting = await loadFixture(deployVotingFixture);

            await expect(voting.startVotingSession())
                .to
                .be
                .revertedWith("Registering proposals phase is not finished")
            ;
        });

        it('should emit event to act the start of voting session', async () => {
            const voting = await loadFixture(deployVotingFixture);

            // Change period
            await voting.startProposalsRegistering();

            await voting.endProposalsRegistering();

            await expect(voting.startVotingSession())
                .to
                .emit(voting, "WorkflowStatusChange")
                .withArgs(2,3)
            ;
        });

        it('should deny if owner try to end voting in wrong period', async () => {
            const voting = await loadFixture(deployVotingFixture);

            await expect(voting.endVotingSession())
                .to
                .be
                .revertedWith("Voting session havent started yet")
            ;
        });

        it('should emit event to act the start of voting session', async () => {
            const voting = await loadFixture(deployVotingFixture);

            // Change period
            await voting.startProposalsRegistering();

            await voting.endProposalsRegistering();

            await voting.startVotingSession();

            await expect(voting.endVotingSession())
                .to
                .emit(voting, "WorkflowStatusChange")
                .withArgs(3,4)
            ;
        });
    })

    describe("Test voters handling", () => {
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

            expect(voter.isRegistered).to.be.equal(true);

            expect(nonRegisteredVoter.isRegistered).to.be.equal(false);
        });
    })

    describe("Test proposal handling", () => {
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

        it('should deny if proposal don\'t exist', async () => {
            const voting = await loadFixture(deployVotingFixture);

            const [owner] = await ethers.getSigners();

            // Add voter
            await voting.addVoter(owner.address);

            // Change voting period
            await voting.startProposalsRegistering();

            await expect(voting.getOneProposal(1)).to.be.reverted;
        });

        it('should return expected proposal', async () => {
            const voting = await loadFixture(deployVotingFixture);

            const [owner] = await ethers.getSigners();

            // Add voter
            await voting.addVoter(owner.address);

            // Change voting period
            await voting.startProposalsRegistering();

            // Add proposal
            await voting.addProposal("Valid Proposal");

            const validProposal: Voting.ProposalStruct = await voting.getOneProposal(1);

            expect(validProposal.description).to.be.equal("Valid Proposal");
        });
    })

    describe("Test voting handling", () => {
        it('should deny if voter votes in wrong period', async () => {
            const voting = await loadFixture(deployVotingFixture);

            const [owner] = await ethers.getSigners();

            // Add voter
            await voting.addVoter(owner.address);

            await expect(voting.setVote(0)).to.be.revertedWith("Voting session havent started yet");
        });

        it('should deny if user votes for a proposal that has not been found', async () => {
            const voting = await loadFixture(deployVotingFixture);

            const [owner] = await ethers.getSigners();

            // Add voter
            await voting.addVoter(owner.address);

            // Change voting periods
            await voting.startProposalsRegistering();
            await voting.endProposalsRegistering();
            await voting.startVotingSession();

            await expect(voting.setVote(1)).to.be.revertedWith("Proposal not found");

        });

        it('should return event to prove success of vote', async () => {
            const voting = await loadFixture(deployVotingFixture);

            const [owner] = await ethers.getSigners();

            // Add voter
            await voting.addVoter(owner.address);

            // Change voting periods
            await voting.startProposalsRegistering();
            await voting.endProposalsRegistering();
            await voting.startVotingSession();

            await expect(voting.setVote(0)).to.emit(voting, "Voted").withArgs(owner.address, 0);
        });

        it('should deny if voter votes twice', async () => {
            const voting = await loadFixture(deployVotingFixture);

            const [owner] = await ethers.getSigners();

            // Add voter
            await voting.addVoter(owner.address);

            // Change voting periods
            await voting.startProposalsRegistering();
            await voting.endProposalsRegistering();
            await voting.startVotingSession();

            // Vote for first time
            await voting.setVote(0);

            await expect(voting.setVote(0)).to.be.revertedWith("You have already voted");
        });
    })

    describe("Test results handling", () => {
        it('should deny if owner wants to tally votes in wrong period', async () => {
            const voting = await loadFixture(deployVotingFixture);

            await expect(voting.tallyVotes()).to.be.revertedWith("Current status is not voting session ended");
        });

        it('should return event to prove tally votes has been successful AND the winning proposal', async () => {
            const voting = await loadFixture(deployVotingFixture);

            const [owner, voter1, voter2] = await ethers.getSigners();

            // Add voters
            await voting.addVoter(owner.address);
            await voting.addVoter(voter1.address);
            await voting.addVoter(voter2.address);

            // Change period to submit proposal
            await voting.startProposalsRegistering();

            // Add proposal
            await voting.addProposal("Winning Proposal !");

            // Change periods to vote
            await voting.endProposalsRegistering();
            await voting.startVotingSession();

            // Voters vote
            await voting.setVote(0);

            await voting.connect(voter1).setVote(1);

            await voting.connect(voter2).setVote(1);

            // Change period to tally votes
            await voting.endVotingSession();

            await expect(voting.tallyVotes()).to.emit(voting, "WorkflowStatusChange").withArgs(4,5);

            const winningProposalId: BigNumber = await voting.winningProposalID();

            expect(winningProposalId).to.be.equal(BigNumber.from("1"));
        });
    })
});
