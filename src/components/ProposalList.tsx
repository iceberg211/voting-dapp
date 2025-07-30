import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Proposal } from '../hooks/useVoting';

interface Props {
  proposals: Proposal[];
  voteOnProposal: (id: number) => void;
}

export const ProposalList: React.FC<Props> = ({ proposals, voteOnProposal }) => {
  if (proposals.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="p-6 text-center text-muted-foreground">
          No proposals submitted yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      {proposals.map((p) => (
        <Card key={Number(p.id)}>
          <CardHeader>
            <CardTitle>{p.description}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {p.link && (
              <a href={p.link} target="_blank" rel="noopener" className="text-blue-600 underline text-sm">
                View Details
              </a>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Votes: {String(p.voteCount)}</span>
              <Button onClick={() => voteOnProposal(Number(p.id))}>Vote</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
