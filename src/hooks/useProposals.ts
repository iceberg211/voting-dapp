import { useState, useEffect, useCallback } from 'react';
import { Contract } from 'ethers';
import { Proposal } from './types';

export const useProposals = (
  contract: Contract | null,
  setError?: (msg: string | null) => void,
  setSuccess?: (msg: string | null) => void
) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalHistory, setProposalHistory] = useState<Array<{ voter: string; proposalId: bigint; weight: bigint; blockNumber: bigint }>>([]);

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
      const gas = await (contract.estimateGas as any).submitProposal(description, start, end, link);
      console.log('Estimated gas for submitProposal:', gas.toString());
      const tx = await (contract as any).submitProposal(description, start, end, link, { gasLimit: gas });
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
      const gas = await (contract.estimateGas as any).voteOnProposal(proposalId);
      console.log('Estimated gas for voteOnProposal:', gas.toString());
      const tx = await (contract as any).voteOnProposal(proposalId, { gasLimit: gas });
      await tx.wait();
      setSuccess && setSuccess('Voted on proposal');
      getAllProposals();
    } catch (err: any) {
      console.error('Error voting on proposal:', err);
      setError && setError(err.message || 'Failed to vote on proposal');
    }
  };

  const fetchProposalHistory = useCallback(async () => {
    if (!contract) return;
    try {
      const events = (await contract.queryFilter(contract.filters.ProposalVoted())) as any[];
      setProposalHistory(
        events.map((e: any) => ({
          voter: e.args?.voter as string,
          proposalId: e.args?.proposalId as bigint,
          weight: e.args?.weight as bigint,
          blockNumber: BigInt(e.blockNumber ?? 0),
        }))
      );
    } catch (err) {
      console.error('Error fetching proposal history:', err);
    }
  }, [contract]);

  useEffect(() => {
    if (!contract) return;
    getAllProposals();
    fetchProposalHistory();
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

  return { proposals, submitProposal, voteOnProposal, proposalHistory };
};
