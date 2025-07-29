// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Voting
 * @dev A simple voting smart contract.
 */
contract Voting {
    address public owner;

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    mapping(uint256 => Candidate) public candidates;
    mapping(address => bool) public voters;

    uint256 public candidatesCount;

    uint256 public votingStartTime;
    uint256 public votingEndTime;

    event Voted(address indexed voter, uint256 indexed candidateId);
    event CandidateAdded(uint256 indexed candidateId, string name);

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

    function vote(uint256 _candidateId) public {
        require(block.timestamp >= votingStartTime, "Voting has not started yet.");
        require(block.timestamp <= votingEndTime, "Voting has ended.");
        require(!voters[msg.sender], "You have already voted.");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID.");

        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        emit Voted(msg.sender, _candidateId);
    }

    function getAllCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidatesCount);
        for (uint i = 0; i < candidatesCount; i++) {
            allCandidates[i] = candidates[i + 1];
        }
        return allCandidates;
    }
}
