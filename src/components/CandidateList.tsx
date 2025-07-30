import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Candidate } from '../hooks/useVoting';
import { Users, Vote, Loader2, Trophy, Medal, Award } from 'lucide-react';

interface CandidateListProps {
  candidates: Candidate[];
  hasVoted: boolean;
  loadingVote: number | null;
  vote: (candidateId: number) => void;
  voteWeight: bigint;
  votingEndTime: bigint;
}

export const CandidateList: React.FC<CandidateListProps> = ({ candidates, hasVoted, loadingVote, vote, voteWeight, votingEndTime }) => {
  // Sort candidates by vote count for ranking
  const sortedCandidates = [...candidates].sort((a, b) => Number(b.voteCount) - Number(a.voteCount));
  const [remaining, setRemaining] = React.useState<number>(0);

  React.useEffect(() => {
    const update = () => {
      const diff = Number(votingEndTime) - Math.floor(Date.now() / 1000);
      setRemaining(diff > 0 ? diff : 0);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [votingEndTime]);
  
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "border-yellow-200 bg-yellow-50";
      case 1:
        return "border-gray-200 bg-gray-50";
      case 2:
        return "border-amber-200 bg-amber-50";
      default:
        return "";
    }
  };

  if (candidates.length === 0) {
    return (
      <main className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Candidates</h2>
          <p className="text-muted-foreground">Loading candidates...</p>
        </div>
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">
              Please wait while we load the candidates or no candidates have been added yet.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Choose Your Candidate</h2>
        <p className="text-muted-foreground">
          Select the candidate you want to vote for. Your vote is permanent and cannot be changed.
        </p>
        <div className="flex justify-center gap-4 mt-2">
          <Badge variant="secondary">Your Weight: {String(voteWeight)}</Badge>
          <Badge variant="secondary">Time Left: {remaining}s</Badge>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedCandidates.map((candidate, index) => {
          const candidateId = Number(candidate.id);
          const voteCount = Number(candidate.voteCount);
          const isLoading = loadingVote === candidateId;
          
          return (
            <Card 
              key={candidateId} 
              className={`transition-all duration-200 hover:shadow-lg ${getRankColor(index)}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    {getRankIcon(index)}
                    {candidate.name}
                  </CardTitle>
                  {index < 3 && (
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Vote Count */}
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Total Votes:</span>
                  <Badge variant="secondary" className="ml-auto">
                    {voteCount}
                  </Badge>
                </div>

                {/* Vote Progress Bar */}
                {candidates.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Vote Share</span>
                      <span>
                        {candidates.reduce((total, c) => total + Number(c.voteCount), 0) > 0
                          ? Math.round((voteCount / candidates.reduce((total, c) => total + Number(c.voteCount), 0)) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: candidates.reduce((total, c) => total + Number(c.voteCount), 0) > 0
                            ? `${(voteCount / candidates.reduce((total, c) => total + Number(c.voteCount), 0)) * 100}%`
                            : '0%'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Vote Button */}
                <Button
                  onClick={() => vote(candidateId)}
                  disabled={hasVoted || loadingVote !== null}
                  className="w-full gap-2"
                  variant={hasVoted ? "outline" : "default"}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Voting...
                    </>
                  ) : hasVoted ? (
                    <>
                      <Vote className="h-4 w-4" />
                      Voted
                    </>
                  ) : (
                    <>
                      <Vote className="h-4 w-4" />
                      Vote for {candidate.name}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Voting Statistics */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Users className="h-5 w-5" />
            Voting Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-600">
                {candidates.reduce((total, candidate) => total + Number(candidate.voteCount), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Votes</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-purple-600">{candidates.length}</p>
              <p className="text-sm text-muted-foreground">Candidates</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};
