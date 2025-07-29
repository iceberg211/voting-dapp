import { useState, useEffect, useCallback } from "react";
import { Contract, isError } from "ethers";

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  useEffect(() => {
    if (contract && account) {
      getAllCandidates();
      getVoterStatus();

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

      return () => {
        contract.off('Voted', onVote);
      };
    }
  }, [contract, account, getAllCandidates, getVoterStatus]);

  return { candidates, hasVoted, loadingVote, vote, error, successMessage, setError };
};
