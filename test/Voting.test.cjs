const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
  let Voting, voting, token, nft, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");
    token = await Token.deploy(ethers.parseEther("1000"));

    const NFT = await ethers.getContractFactory("TestNFT");
    nft = await NFT.deploy();

    const VotingFactory = await ethers.getContractFactory("Voting");
    voting = await VotingFactory.deploy();
    await voting.setVoteToken(await token.getAddress());
    await voting.setVoteNFT(await nft.getAddress());

    // distribute tokens and NFTs
    await token.transfer(addr1.address, ethers.parseEther("10"));
    await token.transfer(addr2.address, ethers.parseEther("5"));
    await nft.mint(addr1.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await voting.owner()).to.equal(owner.address);
    });
  });

  describe("Candidate Management", function () {
    it("Should allow the owner to add a candidate", async function () {
      await expect(voting.connect(owner).addCandidate("Candidate 1"))
        .to.emit(voting, "CandidateAdded")
        .withArgs(1, "Candidate 1");
      
      const candidate = await voting.candidates(1);
      expect(candidate.name).to.equal("Candidate 1");
      expect(await voting.candidatesCount()).to.equal(1);
    });

    it("Should not allow non-owners to add candidates", async function () {
      await expect(
        voting.connect(addr1).addCandidate("Candidate 2")
      ).to.be.revertedWith("Only owner can call this function.");
    });
  });

  describe("Voting Process", function () {
    beforeEach(async function () {
      await voting.connect(owner).addCandidate("Candidate 1");
      const blockNum = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNum);
      const now = block.timestamp;
      await voting.connect(owner).setVotingTime(now, now + 3600); // 1 hour voting window
    });

    it("Should allow a user to vote within the voting period", async function () {
      await expect(voting.connect(addr1).vote(1))
        .to.emit(voting, "Voted")
        .withArgs(addr1.address, 1, ethers.parseEther("10"));

      const candidate = await voting.candidates(1);
      expect(candidate.voteCount).to.equal(ethers.parseEther("10"));
      expect(await voting.voters(addr1.address)).to.be.true;
    });

    it("Should not allow a user to vote twice", async function () {
      await voting.connect(addr1).vote(1);
      await expect(voting.connect(addr1).vote(1)).to.be.revertedWith(
        "You have already voted."
      );
    });

    it("Should not allow voting before the start time", async function () {
      const blockNum = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNum);
      const now = block.timestamp;
      await voting.connect(owner).setVotingTime(now + 100, now + 3600);
      
      await expect(voting.connect(addr1).vote(1)).to.be.revertedWith(
        "Voting has not started yet."
      );
    });

    it("Should not allow voting after the end time", async function () {
        const blockNum = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNum);
        const now = block.timestamp;
        await voting.connect(owner).setVotingTime(now - 3600, now - 1);

        await expect(voting.connect(addr1).vote(1)).to.be.revertedWith(
            "Voting has ended."
        );
    });

    it("Should not allow voting for an invalid candidate", async function () {
        await expect(voting.connect(addr1).vote(99)).to.be.revertedWith(
            "Invalid candidate ID."
        );
    });
  });

  describe("View Functions", function () {
    it("Should return all candidates", async function () {
        await voting.connect(owner).addCandidate("Candidate A");
        await voting.connect(owner).addCandidate("Candidate B");

        const allCandidates = await voting.getAllCandidates();
        expect(allCandidates.length).to.equal(2);
        expect(allCandidates[0].name).to.equal("Candidate A");
        expect(allCandidates[1].name).to.equal("Candidate B");
    });
  });

  describe("Proposals", function () {
    beforeEach(async function () {
      await voting.connect(owner).addCandidate("Candidate 1");
      const blockNum = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNum);
      const now = block.timestamp;
      await voting.connect(owner).setVotingTime(now, now + 3600);
    });

    it("Allows users to submit and vote on proposals", async function () {
      await voting.connect(addr1).submitProposal("Proposal 1");
      const proposals = await voting.getAllProposals();
      expect(proposals.length).to.equal(1);
      expect(proposals[0].description).to.equal("Proposal 1");

      await expect(voting.connect(addr1).voteOnProposal(1))
        .to.emit(voting, "ProposalVoted")
        .withArgs(addr1.address, 1, ethers.parseEther("10"));

      const proposal = await voting.proposals(1);
      expect(proposal.voteCount).to.equal(ethers.parseEther("10"));
    });
  });
});
