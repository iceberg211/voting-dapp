import { useState, useCallback, useEffect } from 'react';
import { Contract } from 'ethers';

export const useVotingInfo = (contract: Contract | null, account: string | null) => {
  const [voteWeight, setVoteWeight] = useState<bigint>(0n);
  const [votingEndTime, setVotingEndTime] = useState<bigint>(0n);
  const [owner, setOwner] = useState<string | null>(null);

  const fetchInfo = useCallback(async () => {
    if (!contract || !account) return;
    try {
      const [weight, end, ownerAddress] = await Promise.all([
        contract.voteWeightOf(account),
        contract.votingEndTime(),
        contract.owner()
      ]);
      setVoteWeight(weight);
      setVotingEndTime(end);
      setOwner(ownerAddress);
    } catch (err) {
      console.error('Error fetching voting info:', err);
    }
  }, [contract, account]);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  return { voteWeight, votingEndTime, owner, refreshInfo: fetchInfo };
};
