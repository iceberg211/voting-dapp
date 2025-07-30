import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  addCandidate: (name: string) => void;
  submitProposal: (desc: string) => void;
}

export const AdminPanel: React.FC<Props> = ({ addCandidate, submitProposal }) => {
  const [candidate, setCandidate] = useState('');
  const [proposal, setProposal] = useState('');

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Admin Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input className="border px-2 py-1 flex-1" value={candidate} onChange={(e) => setCandidate(e.target.value)} placeholder="Candidate name" />
          <Button onClick={() => { addCandidate(candidate); setCandidate(''); }}>Add</Button>
        </div>
        <div className="flex gap-2">
          <input className="border px-2 py-1 flex-1" value={proposal} onChange={(e) => setProposal(e.target.value)} placeholder="Proposal description" />
          <Button onClick={() => { submitProposal(proposal); setProposal(''); }}>Submit</Button>
        </div>
      </CardContent>
    </Card>
  );
};
