
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scan, Download } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TransferStatus, { TransferStatus } from '@/components/TransferStatus';
import ConnectionStatus from '@/components/ConnectionStatus';
import { useToast } from '@/components/ui/use-toast';

interface ReceivedFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: TransferStatus;
}

const Receive = () => {
  const [connectionUrl, setConnectionUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected');
  const [receivedFiles, setReceivedFiles] = useState<ReceivedFile[]>([]);
  const { toast } = useToast();
  
  const mockFiles = [
    { name: 'Project Presentation.pptx', size: '5.2 MB' },
    { name: 'Vacation Photos.zip', size: '21.8 MB' },
    { name: 'Budget Report 2025.xlsx', size: '240 KB' },
    { name: 'Meeting Notes.docx', size: '45 KB' },
    { name: 'Product Demo.mp4', size: '128 MB' },
  ];
  
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
  
  const simulateFileTransfers = (files: ReceivedFile[]) => {
    files.forEach((file, index) => {
      // Stagger the start of each transfer
      setTimeout(() => {
        simulateFileTransfer(file.id);
      }, index * 800);
    });
  };
  
  const simulateFileTransfer = (id: string) => {
    // Mark file as transferring
    setReceivedFiles(prev => 
      prev.map(f => f.id === id ? { ...f, status: 'transferring' as TransferStatus } : f)
    );
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 1;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setReceivedFiles(prev => 
          prev.map(f => f.id === id ? { ...f, progress: 100, status: 'completed' as TransferStatus } : f)
        );
        
        // Check if all transfers are completed
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
          prev.map(f => f.id === id ? { ...f, progress } : f)
        );
      }
    }, 350);
  };
  
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
                  <CardDescription>Enter connection code or scan QR code</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <ConnectionStatus state={connectionStatus} />
                    
                    {connectionStatus === 'disconnected' && (
                      <>
                        <div className="flex space-x-2 pt-4">
                          <Input 
                            placeholder="Enter connection URL"
                            value={connectionUrl}
                            onChange={(e) => setConnectionUrl(e.target.value)}
                          />
                          <Button variant="outline" className="shrink-0 px-3" onClick={simulateScan}>
                            <Scan size={18} />
                          </Button>
                        </div>
                        
                        <Button 
                          className="w-full gap-2" 
                          onClick={connect}
                          disabled={isScanning}
                        >
                          {isScanning ? (
                            <>Scanning...</>
                          ) : (
                            <>
                              <Download size={18} />
                              Connect & Receive
                            </>
                          )}
                        </Button>
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
