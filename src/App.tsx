import { useEthers } from "./hooks/useEthers";
import { useVoting } from "./hooks/useVoting";
import { Header } from "./components/Header";
import { CandidateList } from "./components/CandidateList";
import { ProposalList } from "./components/ProposalList";
import { AdminPanel } from "./components/AdminPanel";

function App() {
  const { account, contract, error: ethersError, network, setNetwork, connectWallet } = useEthers();
  const {
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
    error: votingError,
    successMessage
  } = useVoting(contract, account);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Header
          account={account}
          hasVoted={hasVoted}
          error={ethersError || votingError}
          successMessage={successMessage}
          network={network}
          setNetwork={setNetwork}
          connectWallet={connectWallet}
        />

        {account && (
          <>
            <CandidateList
              candidates={candidates}
              hasVoted={hasVoted}
              loadingVote={loadingVote}
              vote={vote}
              voteWeight={voteWeight}
              votingEndTime={votingEndTime}
            />
            <ProposalList proposals={proposals} voteOnProposal={voteOnProposal} />
            {owner && owner.toLowerCase() === account.toLowerCase() && (
              <AdminPanel addCandidate={addCandidate} submitProposal={submitProposal} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;