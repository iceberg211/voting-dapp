import { useState, useEffect, useCallback } from 'react';
import { Contract } from 'ethers';
import { Proposal } from './types';

export const useProposals = (
  contract: Contract | null,
  setError?: (msg: string | null) => void,
  setSuccess?: (msg: string | null) => void
) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);

  const getAllProposals = useCallback(async () => {
    if (!contract) return;
    try {
      const allProposals = await contract.getAllProposals();
      setProposals(allProposals);
    } catch (err) {
      console.error('Error fetching proposals:', err);
    }
  }, [contract]);

  const submitProposal = async (description: string, start: number, end: number, link: string) => {
    if (!contract) return;
    try {
      const tx = await contract.submitProposal(description, start, end, link);
      await tx.wait();
      setSuccess && setSuccess('Proposal submitted');
      getAllProposals();
    } catch (err: any) {
      console.error('Error submitting proposal:', err);
      setError && setError(err.message || 'Failed to submit proposal');
    }
  };

  const voteOnProposal = async (proposalId: number) => {
    if (!contract) return;
    try {
      const tx = await contract.voteOnProposal(proposalId);
      await tx.wait();
      setSuccess && setSuccess('Voted on proposal');
      getAllProposals();
    } catch (err: any) {
      console.error('Error voting on proposal:', err);
      setError && setError(err.message || 'Failed to vote on proposal');
    }
  };

  useEffect(() => {
    if (!contract) return;
    getAllProposals();
    const onProposalVote = (_voter: string, proposalId: bigint) => {
      setProposals(prev =>
        prev.map(p => (p.id === proposalId ? { ...p, voteCount: p.voteCount + 1n } : p))
      );
    };
    contract.on('ProposalVoted', onProposalVote);
    return () => {
      contract.off('ProposalVoted', onProposalVote);
    };
  }, [contract, getAllProposals]);

  return { proposals, submitProposal, voteOnProposal };
};
