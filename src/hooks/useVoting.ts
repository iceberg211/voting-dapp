import { useState } from 'react';
import { Contract } from 'ethers';
import { useCandidates } from './useCandidates';
import { useProposals } from './useProposals';
import { useVotingInfo } from './useVotingInfo';

export type { Candidate, Proposal } from './types';

export const useVoting = (contract: Contract | null, account: string | null) => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const candidatesData = useCandidates(contract, account, setError, setSuccessMessage);
  const proposalsData = useProposals(contract, setError, setSuccessMessage);
  const votingInfo = useVotingInfo(contract, account);

  return {
    ...candidatesData,
    ...proposalsData,
    ...votingInfo,
    error,
    successMessage,
    setError
  };
};
