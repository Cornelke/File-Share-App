
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ConnectionPanel from '@/components/receive/ConnectionPanel';
import IncomingFilesPanel from '@/components/receive/IncomingFilesPanel';
import { TransferCapabilities, checkDeviceCapabilities } from '@/utils/transferSpeed';
import { useFileTransfer } from '@/hooks/useFileTransfer';

const Receive = () => {
  const [connectionUrl, setConnectionUrl] = useState('');
  const [deviceCapabilities, setDeviceCapabilities] = useState<TransferCapabilities | null>(null);
  
  const { 
    receivedFiles, 
    isHighSpeedEnabled,
    connectionStatus,
    setConnectionId,
    acceptConnection
  } = useFileTransfer('receive');
  
  const connect = (url?: string) => {
    const connectionString = url || connectionUrl;
    
    if (!connectionString) {
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
    
    // Actual connection is handled by the useFileTransfer hook
    acceptConnection();
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
              <ConnectionPanel 
                connectionStatus={connectionStatus}
                setConnectionUrl={setConnectionUrl}
                connectHandler={connect}
                connectionUrl={connectionUrl}
              />
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              <IncomingFilesPanel 
                receivedFiles={receivedFiles}
                connectionStatus={connectionStatus}
                isHighSpeedEnabled={isHighSpeedEnabled}
              />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Receive;
