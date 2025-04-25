
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import TransferStatus from '@/components/TransferStatus';
import { FileTransfer } from '@/hooks/useFileTransfer';

interface IncomingFilesPanelProps {
  receivedFiles: FileTransfer[];
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  isHighSpeedEnabled: boolean;
}

const IncomingFilesPanel: React.FC<IncomingFilesPanelProps> = ({
  receivedFiles,
  connectionStatus,
  isHighSpeedEnabled
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Incoming Files</CardTitle>
        <CardDescription>Files being received from the sender</CardDescription>
      </CardHeader>
      <CardContent>
        {receivedFiles.length > 0 ? (
          <div className="space-y-3">
            {receivedFiles.map((file) => (
              <TransferStatus 
                key={file.id}
                fileName={file.name}
                size={file.size}
                progress={file.progress}
                status={file.status}
                transferSpeed={file.transferSpeed}
                isHighSpeed={isHighSpeedEnabled}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              {connectionStatus === 'connected'
                ? 'Waiting for files from sender...'
                : 'Connect to start receiving files'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomingFilesPanel;
