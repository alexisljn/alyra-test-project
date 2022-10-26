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
});
