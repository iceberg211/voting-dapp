import { useState, useEffect, useCallback } from 'react';
import { Contract, isError } from 'ethers';
import { Candidate } from './types';

export const useCandidates = (
  contract: Contract | null,
  account: string | null,
  setError?: (msg: string | null) => void,
  setSuccess?: (msg: string | null) => void
) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [loadingVote, setLoadingVote] = useState<number | null>(null);
  const [voteHistory, setVoteHistory] = useState<Array<{ voter: string; candidateId: bigint; weight: bigint; blockNumber: bigint }>>([]);

  const getAllCandidates = useCallback(async () => {
    if (!contract) return;
    try {
      const allCandidates = await contract.getAllCandidates();
      setCandidates(allCandidates);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError && setError('Failed to fetch candidates.');
    }
  }, [contract, setError]);

  const getVoterStatus = useCallback(async () => {
    if (!contract || !account) return;
    try {
      const voterStatus = await contract.voters(account);
      setHasVoted(voterStatus);
    } catch (err) {
      console.error('Error fetching voter status:', err);
    }
  }, [contract, account]);

  const vote = async (candidateId: number) => {
    if (!contract) return;
    try {
      setLoadingVote(candidateId);
      setError && setError(null);
      setSuccess && setSuccess(null);
      const gas = await (contract.estimateGas as any).vote(candidateId);
      console.log('Estimated gas for vote:', gas.toString());
      const tx = await (contract as any).vote(candidateId, { gasLimit: gas });
      await tx.wait();
      setSuccess && setSuccess('Vote successful!');
    } catch (err: any) {
      console.error('Error voting:', err);
      let message = 'An unknown error occurred.';
      if (isError(err, 'ACTION_REJECTED')) {
        message = 'Transaction rejected in wallet.';
      } else if (typeof err.reason === 'string') {
        message = err.reason;
      } else if (err.message) {
        message = err.message;
      }
      setError && setError(message);
    } finally {
      setLoadingVote(null);
    }
  };

  const addCandidate = async (name: string) => {
    if (!contract) return;
    try {
      const gas = await (contract.estimateGas as any).addCandidate(name);
      console.log('Estimated gas for addCandidate:', gas.toString());
      const tx = await (contract as any).addCandidate(name, { gasLimit: gas });
      await tx.wait();
      setSuccess && setSuccess('Candidate added');
      getAllCandidates();
    } catch (err: any) {
      console.error('Error adding candidate:', err);
      setError && setError(err.message || 'Failed to add candidate');
    }
  };

  const fetchVoteHistory = useCallback(async () => {
    if (!contract) return;
    try {
      const events = (await contract.queryFilter(contract.filters.Voted())) as any[];
      setVoteHistory(
        events.map((e: any) => ({
          voter: e.args?.voter as string,
          candidateId: e.args?.candidateId as bigint,
          weight: e.args?.weight as bigint,
          blockNumber: BigInt(e.blockNumber ?? 0),
        }))
      );
    } catch (err) {
      console.error('Error fetching vote history:', err);
    }
  }, [contract]);

  useEffect(() => {
    if (!contract || !account) return;
    getAllCandidates();
    getVoterStatus();
    fetchVoteHistory();

    const onVote = (voter: string, candidateId: bigint) => {
      setCandidates(prev =>
        prev.map(c =>
          c.id === candidateId ? { ...c, voteCount: c.voteCount + 1n } : c
        )
      );
      if (voter.toLowerCase() === account.toLowerCase()) {
        setHasVoted(true);
      }
    };
    const onCandidateAdded = (id: bigint, name: string) => {
      setCandidates(prev => [...prev, { id, name, voteCount: 0n }]);
    };
    contract.on('Voted', onVote);
    contract.on('CandidateAdded', onCandidateAdded);
    return () => {
      contract.off('Voted', onVote);
      contract.off('CandidateAdded', onCandidateAdded);
    };
  }, [contract, account, getAllCandidates, getVoterStatus]);

  return { candidates, hasVoted, loadingVote, vote, addCandidate, voteHistory };
};
