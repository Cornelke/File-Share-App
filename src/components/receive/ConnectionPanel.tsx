
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ConnectionStatus from '@/components/ConnectionStatus';
import QRCodeScanner from '@/components/QRCodeScanner';
import ConnectionCodeInput from '@/components/ConnectionCodeInput';
import { useToast } from '@/components/ui/use-toast';
import { isValidConnectionCode } from '@/utils/connectionCodes';

interface ConnectionPanelProps {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  setConnectionUrl: (url: string) => void;
  connectHandler: (url?: string) => void;
  connectionUrl: string;
}

const ConnectionPanel: React.FC<ConnectionPanelProps> = ({
  connectionStatus,
  setConnectionUrl,
  connectHandler,
  connectionUrl
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);
  const { toast } = useToast();
  
  const handleQRCodeScanned = (result: string) => {
    setIsScanning(false);
    setConnectionUrl(result);
    connectHandler(result);
  };
  
  const handleScanError = (error: Error) => {
    toast({
      title: "Scanning Error",
      description: error.message,
      variant: "destructive"
    });
  };
  
  const handleCodeComplete = (code: string) => {
    if (isValidConnectionCode(code)) {
      const baseUrl = window.location.origin;
      setConnectionUrl(`${baseUrl}/connect?code=${code}`);
      connectHandler(`${baseUrl}/connect?code=${code}`);
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 8-digit connection code",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect</CardTitle>
        <CardDescription>Enter code or scan QR code</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <ConnectionStatus state={connectionStatus} />
          
          {connectionStatus === 'disconnected' && (
            <>
              {isScanning ? (
                <QRCodeScanner 
                  onScan={handleQRCodeScanned}
                  onError={handleScanError}
                />
              ) : isManualInput ? (
                <>
                  <ConnectionCodeInput 
                    onComplete={handleCodeComplete}
                    loading={false}
                  />
                  <Button 
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => setIsManualInput(false)}
                  >
                    Scan QR Instead
                  </Button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="default"
                    className="w-full"
                    onClick={() => setIsManualInput(true)}
                  >
                    Enter Code Manually
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsScanning(true)}
                  >
                    Scan QR Code
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionPanel;
