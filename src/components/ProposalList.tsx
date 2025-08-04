import React from 'react';
import { formatEther } from 'ethers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Proposal } from '../hooks/types';

interface Props {
  proposals: Proposal[];
  voteOnProposal: (id: number) => void;
}

export const ProposalList: React.FC<Props> = ({ proposals, voteOnProposal }) => {
  const [now, setNow] = React.useState(() => Math.floor(Date.now() / 1000));

  React.useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  if (proposals.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="p-6 text-center text-muted-foreground">
          No proposals submitted yet.
        </CardContent>
      </Card>
    );
  }

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-4 mt-8">
      {proposals.map((p) => {
        const start = Number(p.startTime);
        const end = Number(p.endTime);
        let status: 'upcoming' | 'active' | 'ended';
        if (now < start) status = 'upcoming';
        else if (now > end) status = 'ended';
        else status = 'active';
        const remaining = status === 'upcoming' ? start - now : end - now;

        return (
          <Card key={Number(p.id)} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {p.description}
                <Badge
                  variant={
                    status === 'active'
                      ? 'default'
                      : status === 'upcoming'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {status === 'active'
                    ? `Ends in ${formatTime(remaining)}`
                    : status === 'upcoming'
                    ? `Starts in ${formatTime(remaining)}`
                    : 'Ended'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {p.link && (
                <a href={p.link} target="_blank" rel="noopener" className="text-blue-600 underline text-sm">
                  View Details
                </a>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Votes: {formatEther(p.voteCount)}</span>
                <Button
                  onClick={() => voteOnProposal(Number(p.id))}
                  disabled={status !== 'active'}
                  title={status !== 'active' ? 'Voting not active' : ''}
                >
                  Vote
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
