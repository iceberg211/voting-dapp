import { useEthers } from "./hooks/useEthers";
import { useVoting } from "./hooks/useVoting";
import { Header } from "./components/Header";
import { CandidateList } from "./components/CandidateList";

function App() {
  const { account, contract, error: ethersError, connectWallet } = useEthers();
  const { 
    candidates, 
    hasVoted, 
    loadingVote, 
    vote, 
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
          connectWallet={connectWallet}
        />

        {account && (
          <CandidateList
            candidates={candidates}
            hasVoted={hasVoted}
            loadingVote={loadingVote}
            vote={vote}
          />
        )}
      </div>
    </div>
  );
}

export default App;