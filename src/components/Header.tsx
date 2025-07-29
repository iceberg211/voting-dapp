import React from 'react';

interface HeaderProps {
  account: string | null;
  hasVoted: boolean;
  error: string | null;
  successMessage: string | null;
  connectWallet: () => void;
}

export const Header: React.FC<HeaderProps> = ({ account, hasVoted, error, successMessage, connectWallet }) => {
  return (
    <header className="App-header">
      <h1>Decentralized Voting Application</h1>
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
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
