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
