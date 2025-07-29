import React from 'react';
import { Candidate } from '../hooks/useVoting';

interface CandidateListProps {
  candidates: Candidate[];
  hasVoted: boolean;
  loadingVote: number | null;
  vote: (candidateId: number) => void;
}

export const CandidateList: React.FC<CandidateListProps> = ({ candidates, hasVoted, loadingVote, vote }) => {
  return (
    <main className="App-main">
      <h2>Candidates</h2>
      <div className="candidates-list">
        {candidates.length > 0 ? (
          candidates.map((candidate) => (
            <div key={Number(candidate.id)} className="candidate-card">
              <h3>{candidate.name}</h3>
              <p>Votes: {candidate.voteCount.toString()}</p>
              <button
                onClick={() => vote(Number(candidate.id))}
                disabled={hasVoted || loadingVote !== null}
                className="vote-button"
              >
                {loadingVote === Number(candidate.id) ? "Voting..." : "Vote"}
              </button>
            </div>
          ))
        ) : (
          <p>Loading candidates or none have been added...</p>
        )}
      </div>
    </main>
  );
};
