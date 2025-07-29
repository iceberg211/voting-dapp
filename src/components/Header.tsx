import React from 'react';

interface HeaderProps {
  account: string | null;
  hasVoted: boolean;
  error: string | null;
  connectWallet: () => void;
}

export const Header: React.FC<HeaderProps> = ({ account, hasVoted, error, connectWallet }) => {
  return (
    <header className="App-header">
      <h1>Decentralized Voting Application</h1>
      {error && <p className="error">{error}</p>}
      {!account ? (
        <button onClick={connectWallet} className="connect-button">
          Connect Wallet
        </button>
      ) : (
        <div className="account-info">
          <p>Connected Account: {account}</p>
          <p>Status: {hasVoted ? "You have already voted" : "You can vote"}</p>
        </div>
      )}
    </header>
  );
};
