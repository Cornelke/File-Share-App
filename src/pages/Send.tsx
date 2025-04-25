
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FileDropZone from '@/components/FileDropZone';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import ConnectionStatus from '@/components/ConnectionStatus';
import TransferStatus from '@/components/TransferStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFileTransfer } from '@/hooks/useFileTransfer';

const Send = () => {
  const { 
    files,
    transfers,
    connectionStatus,
    connectedDevices,
    connectionId,
    handleFilesSelected,
    startConnection,
    cancelTransfer
  } = useFileTransfer('send');
  
  const connectionUrl = `https://${window.location.host}/connect?code=${connectionId}`;
  
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
                        fileName={transfer.name}
                        size={transfer.size}
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
                    
                    <QRCodeGenerator value={`${connectionUrl}?code=${connectionId}`} />
                  </div>
                  
                  {connectionStatus === 'disconnected' && (
                    <Button 
                      className="w-full gap-2"
                      onClick={startConnection}
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
