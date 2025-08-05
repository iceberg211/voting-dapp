import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, FileText } from 'lucide-react';

interface VoteRecord {
  voter: string;
  candidateId?: bigint;
  proposalId?: bigint;
  weight: bigint;
  blockNumber: bigint;
}

interface HistoryPanelProps {
  voteHistory: Array<{ voter: string; candidateId: bigint; weight: bigint; blockNumber: bigint }>;
  proposalHistory: Array<{ voter: string; proposalId: bigint; weight: bigint; blockNumber: bigint }>;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ voteHistory, proposalHistory }) => {
  const renderRecord = (record: VoteRecord, type: 'candidate' | 'proposal') => (
    <div
      key={`${type}-${record.blockNumber}-${record.voter}`}
      className="grid grid-cols-4 gap-2 text-sm py-2 border-b last:border-b-0"
    >
      <span className="truncate" title={record.voter}>{record.voter}</span>
      <span className="text-center">{type === 'candidate' ? Number(record.candidateId) : Number(record.proposalId)}</span>
      <span className="text-center">{Number(record.weight)}</span>
      <span className="text-center">{Number(record.blockNumber)}</span>
    </div>
  );

  return (
    <div className="mt-10 grid gap-6 md:grid-cols-2">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Candidate Votes
          </CardTitle>
          <CardDescription>History of all candidate ballots</CardDescription>
        </CardHeader>
        <CardContent>
          {voteHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No votes have been cast yet.</p>
          ) : (
            <div className="border rounded-md max-h-64 overflow-auto">
              <div className="grid grid-cols-4 gap-2 bg-muted text-xs font-medium p-2 rounded-t-md">
                <span>Voter</span>
                <span className="text-center">Candidate</span>
                <span className="text-center">Weight</span>
                <span className="text-center">Block</span>
              </div>
              {voteHistory.map((v) => renderRecord({ ...v, proposalId: undefined }, 'candidate'))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Proposal Votes
          </CardTitle>
          <CardDescription>History of proposal ballots</CardDescription>
        </CardHeader>
        <CardContent>
          {proposalHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No proposal votes yet.</p>
          ) : (
            <div className="border rounded-md max-h-64 overflow-auto">
              <div className="grid grid-cols-4 gap-2 bg-muted text-xs font-medium p-2 rounded-t-md">
                <span>Voter</span>
                <span className="text-center">Proposal</span>
                <span className="text-center">Weight</span>
                <span className="text-center">Block</span>
              </div>
              {proposalHistory.map((p) => renderRecord({ ...p, candidateId: undefined }, 'proposal'))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryPanel;
