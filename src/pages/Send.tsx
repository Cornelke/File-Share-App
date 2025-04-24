import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FileDropZone from '@/components/FileDropZone';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import ConnectionStatus from '@/components/ConnectionStatus';
import TransferStatus, { FileTransferStatus } from '@/components/TransferStatus';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateConnectionCode } from '@/utils/connectionCodes';

interface FileTransfer {
  id: string;
  file: File;
  progress: number;
  status: FileTransferStatus;
}

const Send = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [transfers, setTransfers] = useState<FileTransfer[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected');
  const [connectedDevices, setConnectedDevices] = useState(0);
  const [connectionCode, setConnectionCode] = useState('');
  const { toast } = useToast();
  
  const connectionUrl = `http://localhost:8080/connect?id=${Math.random().toString(36).substring(2, 8)}`;
  
  useEffect(() => {
    setConnectionCode(generateConnectionCode());
  }, []);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };
  
  const startSharing = () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to share.",
        variant: "destructive"
      });
      return;
    }
    
    setConnectionStatus('connecting');
    
    setTimeout(() => {
      setConnectionStatus('connected');
      setConnectedDevices(1);
      
      const newTransfers: FileTransfer[] = files.map(file => ({
        id: Math.random().toString(36).substring(2, 10),
        file,
        progress: 0,
        status: 'pending'
      }));
      
      setTransfers(newTransfers);
      
      newTransfers.forEach((transfer, index) => {
        setTimeout(() => {
          simulateFileTransfer(transfer.id);
        }, index * 800);
      });
      
      toast({
        title: "Connection established!",
        description: "Ready to transfer files."
      });
    }, 1500);
  };
  
  const simulateFileTransfer = (id: string) => {
    setTransfers(prev => 
      prev.map(t => t.id === id ? { ...t, status: 'transferring' as FileTransferStatus } : t)
    );
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 1;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setTransfers(prev => 
          prev.map(t => t.id === id ? { ...t, progress: 100, status: 'completed' as FileTransferStatus } : t)
        );
        
        setTimeout(() => {
          const allCompleted = transfers.every(t => t.id === id || t.status === 'completed');
          if (allCompleted) {
            toast({
              title: "All files transferred!",
              description: "Files have been successfully transferred."
            });
          }
        }, 500);
      } else {
        setTransfers(prev => 
          prev.map(t => t.id === id ? { ...t, progress } : t)
        );
      }
    }, 300);
  };
  
  const cancelTransfer = (id: string) => {
    setTransfers(prev => 
      prev.map(t => t.id === id ? { ...t, status: 'failed', progress: 0 } : t)
    );
    
    toast({
      title: "Transfer cancelled",
      description: "File transfer has been cancelled."
    });
  };
  
  const getFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1048576) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else if (size < 1073741824) {
      return `${(size / 1048576).toFixed(1)} MB`;
    } else {
      return `${(size / 1073741824).toFixed(1)} GB`;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Send Files</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Files</CardTitle>
                  <CardDescription>Choose files you want to share with other devices</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileDropZone onFilesSelected={handleFilesSelected} />
                </CardContent>
              </Card>
              
              {transfers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>File Transfers</CardTitle>
                    <CardDescription>Status of your file transfers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {transfers.map((transfer) => (
                      <TransferStatus 
                        key={transfer.id}
                        fileName={transfer.file.name}
                        size={getFileSize(transfer.file.size)}
                        progress={transfer.progress}
                        status={transfer.status}
                        onCancel={transfer.status !== 'completed' ? 
                          () => cancelTransfer(transfer.id) : undefined}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="space-y-6">
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
                      <p className="text-2xl font-mono font-bold tracking-wider">{connectionCode}</p>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">or scan QR</span>
                      </div>
                    </div>
                    
                    <QRCodeGenerator value={`${connectionUrl}?code=${connectionCode}`} />
                  </div>
                  
                  {connectionStatus === 'disconnected' && (
                    <Button 
                      className="w-full gap-2"
                      onClick={startSharing}
                      disabled={files.length === 0}
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
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Send;
