
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scan, Download } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TransferStatus, { FileTransferStatus } from '@/components/TransferStatus';
import ConnectionStatus from '@/components/ConnectionStatus';
import QRCodeScanner from '@/components/QRCodeScanner';
import { useToast } from '@/components/ui/use-toast';
import ConnectionCodeInput from '@/components/ConnectionCodeInput';
import { isValidConnectionCode } from '@/utils/connectionCodes';
import { TransferCapabilities, checkDeviceCapabilities } from '@/utils/transferSpeed';
import { useFileTransfer } from '@/hooks/useFileTransfer';

const Receive = () => {
  const [connectionUrl, setConnectionUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected');
  const [isManualInput, setIsManualInput] = useState(false);
  const [deviceCapabilities, setDeviceCapabilities] = useState<TransferCapabilities | null>(null);
  const { toast } = useToast();
  
  const { 
    receivedFiles, 
    isHighSpeedEnabled,
    setConnectionId,
    acceptConnection,
    handleFileReceived 
  } = useFileTransfer('receive');
  
  const handleQRCodeScanned = (result: string) => {
    setIsScanning(false);
    setConnectionUrl(result);
    connect(result);
  };
  
  const handleScanError = (error: Error) => {
    toast({
      title: "Scanning Error",
      description: error.message,
      variant: "destructive"
    });
  };
  
  const connect = (url?: string) => {
    const connectionString = url || connectionUrl;
    
    if (!connectionString && !isScanning) {
      toast({
        title: "Connection URL required",
        description: "Please enter a connection URL or scan a QR code.",
        variant: "destructive"
      });
      return;
    }
    
    // Extract connection ID from URL or code
    try {
      const urlObj = new URL(connectionString);
      const code = urlObj.searchParams.get('code');
      if (code) {
        setConnectionId(code);
      }
    } catch (err) {
      console.error("Invalid connection URL", err);
    }
    
    setConnectionStatus('connecting');
    
    // Actual connection is handled by the useFileTransfer hook
    acceptConnection();
  };

  const handleCodeComplete = (code: string) => {
    if (isValidConnectionCode(code)) {
      setConnectionUrl(`http://localhost:8080/connect?code=${code}`);
      connect(`http://localhost:8080/connect?code=${code}`);
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 8-digit connection code",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const capabilities = checkDeviceCapabilities();
    setDeviceCapabilities(capabilities);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Receive Files</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Connect</CardTitle>
                  <CardDescription>Enter code or scan QR code</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <ConnectionStatus 
                      state={connectionStatus} 
                    />
                    
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
                              loading={connectionStatus === 'connecting'}
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
                          <>
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
                          </>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2 space-y-6">
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
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Receive;
