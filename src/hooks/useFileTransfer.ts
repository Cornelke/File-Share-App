
import { useState, useEffect, useCallback } from 'react';
import { useConnectionState } from './useConnectionState';
import { useTransferManager } from './useTransferManager';
import { useOfflineStorage } from './useOfflineStorage';
import { checkDeviceCapabilities } from '@/utils/transferSpeed';

export type { FileTransfer } from './useTransferManager';

export function useFileTransfer(mode: 'send' | 'receive') {
  const [files, setFiles] = useState<File[]>([]);
  const [deviceCapabilities] = useState(checkDeviceCapabilities());
  const [isHighSpeedEnabled, setIsHighSpeedEnabled] = useState(deviceCapabilities.highSpeed);
  
  const {
    peerConnection,
    dataChannel,
    connectionId,
    connectionStatus,
    connectedDevices,
    setConnectionId,
    initializeConnection,
    setConnectionStatus
  } = useConnectionState(mode);
  
  const {
    transfers,
    addTransfer,
    updateTransfer,
    cancelTransfer,
    getFileSize
  } = useTransferManager(dataChannel, deviceCapabilities, isHighSpeedEnabled);
  
  const { storeFileLocally, retrieveFileLocally } = useOfflineStorage();

  // Handle data channel messages
  useEffect(() => {
    if (!dataChannel) return;
    
    const handleMessage = async (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'file-info':
            if (mode === 'receive') {
              // Create an empty ArrayBuffer that we'll fill with chunks later
              const emptyContent = new Uint8Array(0);
              
              // Create a proper File object with all required properties
              const file = new File(
                [emptyContent], 
                message.fileName || 'unknown-file',
                {
                  type: message.fileType || 'application/octet-stream',
                  lastModified: Date.now()
                }
              );
              
              const transferId = addTransfer(file);
              
              dataChannel.send(JSON.stringify({
                type: 'ready',
                fileId: transferId,
                highSpeed: isHighSpeedEnabled
              }));
            }
            break;
            
          case 'file-data':
            if (mode === 'receive') {
              const { fileId, chunk, progress } = message;
              updateTransfer(fileId, { progress, status: 'transferring' });
              
              if (progress === 100) {
                // When file transfer is complete, retrieve the complete file from storage
                try {
                  const file = await retrieveFileLocally(fileId);
                  if (file && file instanceof File) {
                    updateTransfer(fileId, { 
                      status: 'completed',
                      file: file
                    });
                  } else {
                    // Handle the case when file is not a proper File object
                    const fallbackFile = new File(
                      [new Uint8Array(0)],
                      'unknown-file',
                      { type: 'application/octet-stream' }
                    );
                    updateTransfer(fileId, { 
                      status: 'completed',
                      file: fallbackFile
                    });
                  }
                } catch (error) {
                  console.error('Error retrieving complete file:', error);
                  // Create a fallback empty file if retrieval fails
                  const fallbackFile = new File(
                    [new Uint8Array(0)],
                    'file-transfer-failed',
                    { type: 'application/octet-stream' }
                  );
                  updateTransfer(fileId, { 
                    status: 'failed',
                    file: fallbackFile
                  });
                }
              }
              
              dataChannel.send(JSON.stringify({
                type: 'ack',
                fileId,
                progress
              }));
            }
            break;
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };
    
    dataChannel.onmessage = handleMessage;
  }, [dataChannel, mode, addTransfer, updateTransfer, isHighSpeedEnabled, retrieveFileLocally]);

  const startConnection = useCallback(() => {
    if (connectionStatus !== 'disconnected') return;
    setConnectionStatus('connecting');
    initializeConnection();
  }, [connectionStatus, initializeConnection, setConnectionStatus]);

  const acceptConnection = useCallback(() => {
    if (connectionStatus !== 'disconnected') return;
    setConnectionStatus('connecting');
    initializeConnection();
  }, [connectionStatus, initializeConnection, setConnectionStatus]);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    selectedFiles.forEach(file => {
      const transferId = addTransfer(file);
      storeFileLocally({
        id: transferId,
        name: file.name,
        size: getFileSize(file.size),
        progress: 0,
        status: 'pending',
        file
      });
    });
  }, [addTransfer, getFileSize, storeFileLocally]);

  return {
    // State
    files,
    transfers,
    connectionStatus,
    connectedDevices,
    connectionId,
    isHighSpeedEnabled,
    receivedFiles: transfers,
    
    // Methods
    setFiles,
    setConnectionId,
    startConnection,
    acceptConnection,
    handleFilesSelected,
    cancelTransfer
  };
}
