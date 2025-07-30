const { ethers, artifacts } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy test ERC20 token
  const TestToken = await ethers.getContractFactory("TestToken");
  const token = await TestToken.deploy(ethers.parseEther("1000000"));
  await token.waitForDeployment();

  // Deploy test NFT
  const TestNFT = await ethers.getContractFactory("TestNFT");
  const nft = await TestNFT.deploy();
  await nft.waitForDeployment();

  // Deploy the Voting contract
  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  await voting.waitForDeployment();
  const votingAddress = await voting.getAddress();
  console.log("Voting contract deployed to:", votingAddress);

  await voting.setVoteToken(await token.getAddress());
  await voting.setVoteNFT(await nft.getAddress());

  // Add some initial candidates
  console.log("Adding initial candidates...");
  let tx = await voting.addCandidate("Alice");
  await tx.wait();
  tx = await voting.addCandidate("Bob");
  await tx.wait();
  console.log("Candidates 'Alice' and 'Bob' added.");

  // Save contract info to the frontend
  saveContractInfo(voting.address, await token.getAddress(), await nft.getAddress());
}

function saveContractInfo(votingAddress, tokenAddress, nftAddress) {
  const contractsDir = path.join(__dirname, "..", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  // Save the contract address
    fs.writeFileSync(
      path.join(contractsDir, "contract-address.json"),
      JSON.stringify({ Voting: votingAddress, VoteToken: tokenAddress, VoteNFT: nftAddress }, undefined, 2)
    );

  // Save the contract ABI
  const VotingArtifact = artifacts.readArtifactSync("Voting");
  fs.writeFileSync(
    path.join(contractsDir, "Voting.json"),
    JSON.stringify(VotingArtifact, null, 2)
  );

  console.log("Contract address and ABI saved to src/contracts");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});