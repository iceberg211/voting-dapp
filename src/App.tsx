import { useEthers } from "./hooks/useEthers";
import { useVoting } from "./hooks/useVoting";
import { Header } from "./components/Header";
import { CandidateList } from "./components/CandidateList";
import "./App.css";

function App() {
  const { account, contract, error: ethersError, connectWallet } = useEthers();
  const { 
    candidates, 
    hasVoted, 
    loadingVote, 
    vote, 
    error: votingError 
  } = useVoting(contract, account);

  return (
    <div className="App">
      <Header 
        account={account}
        hasVoted={hasVoted}
        error={ethersError || votingError}
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
  );
}

export default App;