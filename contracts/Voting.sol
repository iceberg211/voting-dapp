// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title Voting
 * @dev A simple voting smart contract.
 */
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
}

contract Voting {
    address public owner;

    IERC20 public voteToken;
    IERC721 public voteNFT;

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 voteCount;
    }

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    mapping(uint256 => Candidate) public candidates;
    mapping(address => bool) public voters;

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public proposalVoters;

    uint256 public proposalsCount;

    uint256 public candidatesCount;

    uint256 public votingStartTime;
    uint256 public votingEndTime;

    event Voted(address indexed voter, uint256 indexed candidateId, uint256 weight);
    event CandidateAdded(uint256 indexed candidateId, string name);
    event ProposalSubmitted(uint256 indexed proposalId, address indexed proposer, string description);
    event ProposalVoted(address indexed voter, uint256 indexed proposalId, uint256 weight);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    function setVotingTime(uint256 _startTime, uint256 _endTime) public onlyOwner {
        votingStartTime = _startTime;
        votingEndTime = _endTime;
    }

    function addCandidate(string memory _name) public onlyOwner {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        emit CandidateAdded(candidatesCount, _name);
    }

    function setVoteToken(address _token) external onlyOwner {
        voteToken = IERC20(_token);
    }

    function setVoteNFT(address _nft) external onlyOwner {
        voteNFT = IERC721(_nft);
    }

    function vote(uint256 _candidateId) public {
        require(block.timestamp >= votingStartTime, "Voting has not started yet.");
        require(block.timestamp <= votingEndTime, "Voting has ended.");
        require(!voters[msg.sender], "You have already voted.");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID.");
        uint256 weight = _voteWeight(msg.sender);
        require(weight > 0, "No voting power.");

        voters[msg.sender] = true;
        candidates[_candidateId].voteCount += weight;

        emit Voted(msg.sender, _candidateId, weight);
    }

    function getAllCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidatesCount);
        for (uint i = 0; i < candidatesCount; i++) {
            allCandidates[i] = candidates[i + 1];
        }
        return allCandidates;
    }

    function submitProposal(string memory _description) external {
        proposalsCount++;
        proposals[proposalsCount] = Proposal(proposalsCount, msg.sender, _description, 0);
        emit ProposalSubmitted(proposalsCount, msg.sender, _description);
    }

    function voteOnProposal(uint256 _proposalId) external {
        require(_proposalId > 0 && _proposalId <= proposalsCount, "Invalid proposal ID.");
        require(!proposalVoters[_proposalId][msg.sender], "You have already voted on this proposal.");
        uint256 weight = _voteWeight(msg.sender);
        require(weight > 0, "No voting power.");

        proposalVoters[_proposalId][msg.sender] = true;
        proposals[_proposalId].voteCount += weight;

        emit ProposalVoted(msg.sender, _proposalId, weight);
    }

    function getAllProposals() external view returns (Proposal[] memory) {
        Proposal[] memory allProposals = new Proposal[](proposalsCount);
        for (uint i = 0; i < proposalsCount; i++) {
            allProposals[i] = proposals[i + 1];
        }
        return allProposals;
    }

    function _voteWeight(address voter) internal view returns (uint256) {
        uint256 tokenBalance = address(voteToken) != address(0) ? voteToken.balanceOf(voter) : 0;
        uint256 nftBalance = address(voteNFT) != address(0) ? voteNFT.balanceOf(voter) : 0;
        if (tokenBalance > 0) {
            return tokenBalance;
        } else {
            return nftBalance;
        }
    }
}
