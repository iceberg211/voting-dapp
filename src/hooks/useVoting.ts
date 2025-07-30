import { useState, useEffect, useCallback } from "react";
import { Contract, isError } from "ethers";

// Define the structure of a Candidate
export interface Candidate {
  id: bigint;
  name: string;
  voteCount: bigint;
}

export interface Proposal {
  id: bigint;
  proposer: string;
  description: string;
  voteCount: bigint;
  startTime: bigint;
  endTime: bigint;
  link: string;
}

export const useVoting = (contract: Contract | null, account: string | null) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteWeight, setVoteWeight] = useState<bigint>(0n);
  const [loadingVote, setLoadingVote] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [votingEndTime, setVotingEndTime] = useState<bigint>(0n);

  const getAllCandidates = useCallback(async () => {
    if (contract) {
      try {
        const allCandidates = await contract.getAllCandidates();
        setCandidates(allCandidates);
      } catch (err) {
        console.error("Error fetching candidates:", err);
        setError("Failed to fetch candidates. Is the contract on the right network?");
      }
    }
  }, [contract]);

  const getAllProposals = useCallback(async () => {
    if (contract) {
      try {
        const allProposals = await contract.getAllProposals();
        setProposals(allProposals);
      } catch (err) {
        console.error("Error fetching proposals:", err);
      }
    }
  }, [contract]);

  const getOwner = useCallback(async () => {
    if (contract) {
      try {
        const ownerAddress = await contract.owner();
        setOwner(ownerAddress);
      } catch (err) {
        console.error("Error fetching owner:", err);
      }
    }
  }, [contract]);

  const getVotingInfo = useCallback(async () => {
    if (contract && account) {
      try {
        const weight: bigint = await contract.voteWeightOf(account);
        setVoteWeight(weight);
        const end: bigint = await contract.votingEndTime();
        setVotingEndTime(end);
      } catch (err) {
        console.error('Error fetching voting info:', err);
      }
    }
  }, [contract, account]);

  const getVoterStatus = useCallback(async () => {
    if (contract && account) {
      try {
        const voterStatus = await contract.voters(account);
        setHasVoted(voterStatus);
      } catch (err) {
        console.error("Error fetching voter status:", err);
        // Non-critical error, so we don't set a user-facing error message
      }
    }
  }, [contract, account]);

  const vote = async (candidateId: number) => {
    if (contract) {
      try {
        setLoadingVote(candidateId);
        setError(null);
        setSuccessMessage(null);

        const tx = await contract.vote(candidateId);
        await tx.wait();

        setSuccessMessage("Vote successful!");
        setTimeout(() => setSuccessMessage(null), 5000); // Clear after 5s

      } catch (err: any) {
        console.error("Error voting:", err);
        let message = "An unknown error occurred.";
        if (isError(err, "ACTION_REJECTED")) {
          message = "Transaction rejected in wallet.";
        } else if (typeof err.reason === "string") {
          message = err.reason;
        } else if (err.message) {
          message = err.message;
        }
        setError(message);
        setTimeout(() => setError(null), 5000); // Clear after 5s
      } finally {
        setLoadingVote(null);
      }
    }
  };

  const addCandidate = async (name: string) => {
    if (contract) {
      try {
        const tx = await contract.addCandidate(name);
        await tx.wait();
        setSuccessMessage("Candidate added");
        getAllCandidates();
      } catch (err: any) {
        console.error("Error adding candidate:", err);
        setError(err.message || "Failed to add candidate");
      }
    }
  };

  const submitProposal = async (description: string, start: number, end: number, link: string) => {
    if (contract) {
      try {
        const tx = await contract.submitProposal(description, start, end, link);
        await tx.wait();
        setSuccessMessage("Proposal submitted");
        getAllProposals();
      } catch (err: any) {
        console.error("Error submitting proposal:", err);
        setError(err.message || "Failed to submit proposal");
      }
    }
  };

  const voteOnProposal = async (proposalId: number) => {
    if (contract) {
      try {
        const tx = await contract.voteOnProposal(proposalId);
        await tx.wait();
        setSuccessMessage("Voted on proposal");
        getAllProposals();
      } catch (err: any) {
        console.error("Error voting on proposal:", err);
        setError(err.message || "Failed to vote on proposal");
      }
    }
  };

  useEffect(() => {
    if (contract && account) {
      getAllCandidates();
      getAllProposals();
      getOwner();
      getVoterStatus();
      getVotingInfo();

      const onVote = (voter: string, candidateId: bigint) => {
        console.log('Voted event received!', { voter, candidateId });
        
        setCandidates(prevCandidates =>
          prevCandidates.map(c =>
            c.id === candidateId
              ? { ...c, voteCount: c.voteCount + 1n }
              : c
          )
        );

        if (voter.toLowerCase() === account.toLowerCase()) {
          setHasVoted(true);
        }
      };

      contract.on('Voted', onVote);
      const onProposalVote = (_voter: string, proposalId: bigint) => {
        setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, voteCount: p.voteCount + 1n } : p));
      };
      const onCandidateAdded = (id: bigint, name: string) => {
        setCandidates(prev => [...prev, { id, name, voteCount: 0n }]);
      };
      contract.on('ProposalVoted', onProposalVote);
      contract.on('CandidateAdded', onCandidateAdded);

      return () => {
        contract.off('Voted', onVote);
        contract.off('ProposalVoted', onProposalVote);
        contract.off('CandidateAdded', onCandidateAdded);
      };
    }
  }, [contract, account, getAllCandidates, getAllProposals, getOwner, getVoterStatus, getVotingInfo]);

  return {
    candidates,
    proposals,
    owner,
    voteWeight,
    votingEndTime,
    hasVoted,
    loadingVote,
    vote,
    addCandidate,
    submitProposal,
    voteOnProposal,
    error,
    successMessage,
    setError
  };
};
