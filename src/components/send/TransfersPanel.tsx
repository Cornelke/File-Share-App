
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TransferStatus from '@/components/TransferStatus';
import { FileTransfer } from '@/hooks/useFileTransfer';

interface TransfersPanelProps {
  transfers: FileTransfer[];
  onCancelTransfer: (id: string) => void;
}

const TransfersPanel: React.FC<TransfersPanelProps> = ({ transfers, onCancelTransfer }) => {
  if (transfers.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>File Transfers</CardTitle>
        <CardDescription>Status of your file transfers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {transfers.map((transfer) => (
          <TransferStatus 
            key={transfer.id}
            fileName={transfer.name}
            size={transfer.size}
            progress={transfer.progress}
            status={transfer.status}
            onCancel={transfer.status !== 'completed' ? 
              () => onCancelTransfer(transfer.id) : undefined}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default TransfersPanel;
