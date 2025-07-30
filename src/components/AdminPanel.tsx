import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  addCandidate: (name: string) => void;
  submitProposal: (desc: string, start: number, end: number, link: string) => void;
}

export const AdminPanel: React.FC<Props> = ({ addCandidate, submitProposal }) => {
  const [candidate, setCandidate] = useState('');
  const [proposal, setProposal] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [link, setLink] = useState('');

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
        <div className="space-y-2">
          <input className="border px-2 py-1 w-full" value={proposal} onChange={(e) => setProposal(e.target.value)} placeholder="Proposal description" />
          <input className="border px-2 py-1 w-full" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link" />
          <div className="flex gap-2">
            <input className="border px-2 py-1 flex-1" value={start} onChange={(e) => setStart(e.target.value)} placeholder="Start timestamp" />
            <input className="border px-2 py-1 flex-1" value={end} onChange={(e) => setEnd(e.target.value)} placeholder="End timestamp" />
          </div>
          <Button onClick={() => { submitProposal(proposal, Number(start), Number(end), link); setProposal(''); setStart(''); setEnd(''); setLink(''); }}>Submit</Button>
        </div>
      </CardContent>
    </Card>
  );
};
