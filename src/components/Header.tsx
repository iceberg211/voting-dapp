import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Wallet, Vote, CheckCircle, AlertCircle } from 'lucide-react';

interface HeaderProps {
  account: string | null;
  hasVoted: boolean;
  error: string | null;
  successMessage: string | null;
  network: string;
  setNetwork: React.Dispatch<React.SetStateAction<'hardhat' | 'sepolia' | 'goerli'>>;
  connectWallet: () => void;
  connectWithPrivateKey: (rpcUrl: string, pk: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  account,
  hasVoted,
  error,
  successMessage,
  network,
  setNetwork,
  connectWallet,
  connectWithPrivateKey,
}) => {
  const [rpcUrl, setRpcUrl] = React.useState('');
  const [privateKey, setPrivateKey] = React.useState('');

  return (
    <header className="space-y-6 mb-8">
      {/* Title Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Vote className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Decentralized Voting
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Secure, transparent, and immutable voting powered by blockchain technology
        </p>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {successMessage && (
        <Alert className="max-w-2xl mx-auto border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Network Select */}
      <div className="flex justify-center">
        <select
          value={network}
          onChange={(e) => setNetwork(e.target.value as any)}
          className="border rounded px-2 py-1 text-sm bg-white"
        >
          <option value="hardhat">Hardhat</option>
          <option value="sepolia">Sepolia</option>
          <option value="goerli">Goerli</option>
        </select>
      </div>

      {/* Wallet Connection */}
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          {!account ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <Wallet className="h-12 w-12 text-blue-600 mb-2" />
              </div>
              <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Connect your Web3 wallet to participate in the voting process
              </p>
              <Button onClick={connectWallet} size="lg" className="gap-2">
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>

              {import.meta.env.DEV && (
                <div className="space-y-2 pt-4 text-left">
                  <input
                    type="text"
                    value={rpcUrl}
                    onChange={(e) => setRpcUrl(e.target.value)}
                    placeholder="RPC URL"
                    className="w-full border rounded px-3 py-1 text-sm"
                  />
                  <input
                    type="password"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Private Key"
                    className="w-full border rounded px-3 py-1 text-sm"
                  />
                  <Button
                    onClick={() => connectWithPrivateKey(rpcUrl, privateKey)}
                    variant="secondary"
                    className="w-full mt-2"
                  >
                    Use Private Key
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Wallet Connected</h3>
                <Badge variant={hasVoted ? "default" : "secondary"} className="gap-1">
                  {hasVoted ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Voted
                    </>
                  ) : (
                    <>
                      <Vote className="h-3 w-3" />
                      Can Vote
                    </>
                  )}
                </Badge>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">Connected Account</p>
                <p className="font-mono text-sm break-all">{account}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  {hasVoted ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">You have successfully voted</span>
                    </>
                  ) : (
                    <>
                      <Vote className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-600">You can cast your vote below</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </header>
  );
};
