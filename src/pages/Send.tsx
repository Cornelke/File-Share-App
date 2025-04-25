
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FileSelectionPanel from '@/components/send/FileSelectionPanel';
import TransfersPanel from '@/components/send/TransfersPanel';
import ConnectionPanel from '@/components/send/ConnectionPanel';
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
  
  const connectionUrl = `${window.location.origin}/connect?code=${connectionId}`;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Send Files</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <FileSelectionPanel onFilesSelected={handleFilesSelected} />
              <TransfersPanel transfers={transfers} onCancelTransfer={cancelTransfer} />
            </div>
            
            <div className="space-y-6">
              <ConnectionPanel 
                connectionStatus={connectionStatus}
                connectedDevices={connectedDevices}
                connectionId={connectionId}
                connectionUrl={connectionUrl}
                onStartConnection={startConnection}
                filesSelected={files.length > 0}
              />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Send;
