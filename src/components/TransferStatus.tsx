
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { FileIcon, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type TransferStatus = 'pending' | 'transferring' | 'completed' | 'failed';

interface FileTransferProps {
  fileName: string;
  size: string;
  progress: number;
  status: TransferStatus;
  onCancel?: () => void;
}

const TransferStatus: React.FC<FileTransferProps> = ({
  fileName,
  size,
  progress,
  status,
  onCancel
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <FileIcon className="h-4 w-4 text-muted-foreground" />;
      case 'transferring':
        return (
          <div className="relative h-4 w-4">
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
        );
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Waiting';
      case 'transferring':
        return `${progress}%`;
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 truncate">
            <span className="flex-shrink-0">
              {getStatusIcon()}
            </span>
            
            <div className="truncate">
              <div className="text-sm font-medium truncate">{fileName}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <span>{size}</span>
                <span>•</span>
                <span className={
                  status === 'completed' ? 'text-green-500' : 
                  status === 'failed' ? 'text-destructive' : ''
                }>
                  {getStatusText()}
                </span>
              </div>
            </div>
          </div>

          {(status === 'pending' || status === 'transferring') && onCancel && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Progress 
          value={progress} 
          className="h-1" 
          color={
            status === 'completed' ? 'bg-green-500' : 
            status === 'failed' ? 'bg-red-500' : undefined
          } 
        />
      </CardContent>
    </Card>
  );
};

export default TransferStatus;
