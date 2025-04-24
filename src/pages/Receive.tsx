import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface ReceivedFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: FileTransferStatus;
  transferSpeed?: string;
}

const Receive = () => {
  const [connectionUrl, setConnectionUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected');
  const [receivedFiles, setReceivedFiles] = useState<ReceivedFile[]>([]);
  const [isManualInput, setIsManualInput] = useState(false);
  const [deviceCapabilities, setDeviceCapabilities] = useState<TransferCapabilities | null>(null);
  const [isHighSpeedEnabled, setIsHighSpeedEnabled] = useState(false);
  const { toast } = useToast();
  
  const mockFiles = [
    { name: 'Project Presentation.pptx', size: '5.2 MB' },
    { name: 'Vacation Photos.zip', size: '21.8 MB' },
    { name: 'Budget Report 2025.xlsx', size: '240 KB' },
    { name: 'Meeting Notes.docx', size: '45 KB' },
    { name: 'Product Demo.mp4', size: '128 MB' },
  ];
  
  const handleQRCodeScanned = (result: string) => {
    setIsScanning(false);
    setConnectionUrl(result);
    connect();
  };
  
  const handleScanError = (error: Error) => {
    toast({
      title: "Scanning Error",
      description: error.message,
      variant: "destructive"
    });
  };

  const simulateScan = () => {
    setIsScanning(true);
    
    // Simulate scanning for 2 seconds
    setTimeout(() => {
      setIsScanning(false);
      connect();
    }, 2000);
  };
  
  const connect = () => {
    if (!connectionUrl && !isScanning) {
      toast({
        title: "Connection URL required",
        description: "Please enter a connection URL or scan a QR code.",
        variant: "destructive"
      });
      return;
    }
    
    setConnectionStatus('connecting');
    
    // Simulate connecting
    setTimeout(() => {
      setConnectionStatus('connected');
      
      toast({
        title: "Connected successfully!",
        description: "Ready to receive files."
      });
      
      // Simulate receiving file info after 1 second
      setTimeout(() => {
        // Create mock received files
        const files: ReceivedFile[] = mockFiles.map((file, index) => ({
          id: Math.random().toString(36).substring(2, 10),
          name: file.name,
          size: file.size,
          progress: 0,
          status: 'pending'
        }));
        
        setReceivedFiles(files);
        
        // Simulate download starting after another second
        setTimeout(() => {
          simulateFileTransfers(files);
        }, 1000);
      }, 1000);
    }, 1500);
  };
  
  const getTransferSpeed = (fileSize: number): string => {
    const baseSpeed = 1024 * 1024; // 1MB/s base speed
    const speed = isHighSpeedEnabled ? baseSpeed * 5 : baseSpeed;
    const speedMB = speed / (1024 * 1024);
    return `${speedMB} MB`;
  };

  const simulateFileTransfers = (files: ReceivedFile[]) => {
    const chunkSize = deviceCapabilities?.maxChunkSize || 1024 * 1024;
    const concurrent = deviceCapabilities?.concurrentTransfers || 1;
    
    // Process files in batches based on concurrent transfer limit
    for (let i = 0; i < files.length; i += concurrent) {
      const batch = files.slice(i, i + concurrent);
      batch.forEach((file, index) => {
        setTimeout(() => {
          simulateFileTransfer(file.id);
        }, index * (isHighSpeedEnabled ? 400 : 800));
      });
    }
  };
  
  const simulateFileTransfer = (id: string) => {
    const fileSize = Math.random() * 1024 * 1024 * 100; // Random file size up to 100MB
    const transferSpeed = getTransferSpeed(fileSize);

    setReceivedFiles(prev => 
      prev.map(f => f.id === id ? { 
        ...f, 
        status: 'transferring' as FileTransferStatus,
        transferSpeed 
      } : f)
    );

    let progress = 0;
    const increment = isHighSpeedEnabled ? 10 : 5;
    const interval = setInterval(() => {
      progress += increment;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setReceivedFiles(prev => 
          prev.map(f => f.id === id ? { 
            ...f, 
            progress: 100, 
            status: 'completed' as FileTransferStatus,
            transferSpeed: undefined 
          } : f)
        );
        
        const allCompleted = receivedFiles.every(f => f.id === id || f.status === 'completed');
        if (allCompleted) {
          setTimeout(() => {
            toast({
              title: "All files received!",
              description: "Files have been successfully downloaded."
            });
          }, 500);
        }
      } else {
        setReceivedFiles(prev => 
          prev.map(f => f.id === id ? { ...f, progress, transferSpeed } : f)
        );
      }
    }, isHighSpeedEnabled ? 150 : 350);
  };

  const handleCodeComplete = (code: string) => {
    if (isValidConnectionCode(code)) {
      setConnectionUrl(`http://localhost:8080/connect?code=${code}`);
      connect();
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
    setIsHighSpeedEnabled(capabilities.highSpeed);
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
