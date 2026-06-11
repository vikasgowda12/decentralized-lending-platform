const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DecentralizedVoting", function () {
  async function deployFixture() {
    const [owner, voter1, voter2] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory("DecentralizedVoting");
    const contract = await Voting.deploy("Demo Election", ["Alice", "Bob"]);
    await contract.waitForDeployment();
    return { contract, owner, voter1, voter2 };
  }

  it("authorizes voters and records a vote", async function () {
    const { contract, voter1 } = await deployFixture();

    await contract.authorizeVoter(voter1.address);
    await contract.startElection();
    await contract.connect(voter1).castVote(1);

    const voter = await contract.getVoter(voter1.address);
    const results = await contract.getResults();

    expect(voter.hasVoted).to.equal(true);
    expect(voter.votedCandidateId).to.equal(1n);
    expect(results[0].voteCount).to.equal(1n);
  });

  it("prevents double voting", async function () {
    const { contract, voter1 } = await deployFixture();

    await contract.authorizeVoter(voter1.address);
    await contract.startElection();
    await contract.connect(voter1).castVote(2);

    await expect(contract.connect(voter1).castVote(1)).to.be.revertedWith(
      "Voter has already voted"
    );
  });

  it("blocks unauthorized voters", async function () {
    const { contract, voter2 } = await deployFixture();

    await contract.startElection();

    await expect(contract.connect(voter2).castVote(1)).to.be.revertedWith(
      "Voter is not authorized"
    );
  });
}
