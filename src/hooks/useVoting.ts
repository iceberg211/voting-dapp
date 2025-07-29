import { useState, useEffect, useCallback } from "react";
import { Contract } from "ethers";

// Define the structure of a Candidate
export interface Candidate {
  id: bigint;
  name: string;
  voteCount: bigint;
}

export const useVoting = (contract: Contract | null, account: string | null) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [loadingVote, setLoadingVote] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        const tx = await contract.vote(candidateId);
        await tx.wait();
        setHasVoted(true);
        await getAllCandidates(); // Refresh candidates to show new vote count
      } catch (err: any) {
        console.error("Error voting:", err);
        const message = err.reason || "Transaction failed. Have you already voted?";
        setError(message);
      } finally {
        setLoadingVote(null);
      }
    }
  };

  useEffect(() => {
    if (contract && account) {
      getAllCandidates();
      getVoterStatus();
    }
  }, [contract, account, getAllCandidates, getVoterStatus]);

  return { candidates, hasVoted, loadingVote, vote, error, setError };
};
