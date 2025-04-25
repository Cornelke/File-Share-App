
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import ConnectionStatus from '@/components/ConnectionStatus';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConnectionPanelProps {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  connectedDevices: number;
  connectionId: string;
  connectionUrl: string;
  onStartConnection: () => void;
  filesSelected: boolean;
}

const ConnectionPanel: React.FC<ConnectionPanelProps> = ({
  connectionStatus,
  connectedDevices,
  connectionId,
  connectionUrl,
  onStartConnection,
  filesSelected
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection</CardTitle>
        <CardDescription>
          Share this code or scan QR with the receiving device
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <ConnectionStatus 
          state={connectionStatus} 
          connectedDevices={connectedDevices} 
        />
        
        <div className="my-4 w-full space-y-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Connection Code</p>
            <p className="text-2xl font-mono font-bold tracking-wider">{connectionId}</p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or scan QR</span>
            </div>
          </div>
          
          <QRCodeGenerator value={connectionUrl} />
        </div>
        
        {connectionStatus === 'disconnected' && (
          <Button 
            className="w-full gap-2"
            onClick={onStartConnection}
            disabled={!filesSelected}
          >
            <Share2 size={18} />
            Start Sharing
          </Button>
        )}
        
        {connectionStatus === 'connected' && (
          <Alert>
            <AlertDescription>
              Connection established! Files will be transferred when the receiving device accepts.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionPanel;
