
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FileDropZone from '@/components/FileDropZone';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import ConnectionStatus from '@/components/ConnectionStatus';
import TransferStatus, { TransferStatus } from '@/components/TransferStatus';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileTransfer {
  id: string;
  file: File;
  progress: number;
  status: TransferStatus;
}

const Send = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [transfers, setTransfers] = useState<FileTransfer[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected');
  const [connectedDevices, setConnectedDevices] = useState(0);
  const { toast } = useToast();
  
  // Mock connection URL - in a real app this would be generated dynamically
  const connectionUrl = `http://localhost:8080/connect?id=${Math.random().toString(36).substring(2, 8)}`;
  
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
    
    // Simulate connecting
    setConnectionStatus('connecting');
    
    // Simulate connection established after 1.5 seconds
    setTimeout(() => {
      setConnectionStatus('connected');
      setConnectedDevices(1);
      
      // Create transfer objects from files
      const newTransfers: FileTransfer[] = files.map(file => ({
        id: Math.random().toString(36).substring(2, 10),
        file,
        progress: 0,
        status: 'pending'
      }));
      
      setTransfers(newTransfers);
      
      // Simulate transfer progress for each file
      newTransfers.forEach((transfer, index) => {
        // Start with a slight delay for each file
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
    // Mark file as transferring
    setTransfers(prev => 
      prev.map(t => t.id === id ? { ...t, status: 'transferring' as TransferStatus } : t)
    );
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 1;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setTransfers(prev => 
          prev.map(t => t.id === id ? { ...t, progress: 100, status: 'completed' as TransferStatus } : t)
        );
        
        // Check if all transfers are completed
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
                    Share this code with the device that will receive files
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <ConnectionStatus 
                    state={connectionStatus} 
                    connectedDevices={connectedDevices} 
                  />
                  
                  <div className="my-4">
                    <QRCodeGenerator value={connectionUrl} />
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
