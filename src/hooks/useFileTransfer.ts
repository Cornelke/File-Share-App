
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { TransferCapabilities, checkDeviceCapabilities } from '@/utils/transferSpeed';
import { generateConnectionCode } from '@/utils/connectionCodes';
import { createPeerConnection, setupDataChannel } from '@/utils/webrtc';

export interface FileTransfer {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: 'pending' | 'transferring' | 'completed' | 'failed';
  transferSpeed?: string;
  file?: File;
}

// Mode can be either 'send' or 'receive'
export function useFileTransfer(mode: 'send' | 'receive') {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [connectionId, setConnectionId] = useState<string>(generateConnectionCode());
  const [transfers, setTransfers] = useState<FileTransfer[]>([]);
  const [connectedDevices, setConnectedDevices] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected');
  const [files, setFiles] = useState<File[]>([]);
  const [deviceCapabilities, setDeviceCapabilities] = useState<TransferCapabilities>(
    checkDeviceCapabilities()
  );
  const [isHighSpeedEnabled, setIsHighSpeedEnabled] = useState(deviceCapabilities.highSpeed);
  
  const { toast } = useToast();

  // File size formatter
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
  
  // Transfer speed calculator
  const getTransferSpeed = (fileSize: number): string => {
    const baseSpeed = 1024 * 1024; // 1MB/s base speed
    const speed = isHighSpeedEnabled ? baseSpeed * 5 : baseSpeed;
    const speedMB = speed / (1024 * 1024);
    return `${speedMB.toFixed(1)} MB`;
  };

  // Initialize WebRTC connection
  const initializeConnection = useCallback(() => {
    const { pc, dc } = createPeerConnection(mode);
    
    setPeerConnection(pc);
    
    if (mode === 'send') {
      const dataChannel = pc.createDataChannel('fileTransfer');
      setupDataChannel(dataChannel, handleDataChannelMessage);
      setDataChannel(dataChannel);
    } else {
      pc.ondatachannel = (event) => {
        setupDataChannel(event.channel, handleDataChannelMessage);
        setDataChannel(event.channel);
      };
    }
    
    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state changed: ${pc.connectionState}`);
      
      switch (pc.connectionState) {
        case 'connected':
          setConnectionStatus('connected');
          setConnectedDevices(1);
          toast({
            title: "Connection established!",
            description: `Ready to ${mode === 'send' ? 'send' : 'receive'} files.`
          });
          break;
        case 'disconnected':
        case 'failed':
        case 'closed':
          setConnectionStatus('disconnected');
          setConnectedDevices(0);
          break;
      }
    };
    
    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state: ${pc.iceConnectionState}`);
    };
    
    // Handle ICE candidate errors
    pc.onicecandidateerror = (event) => {
      console.error("ICE candidate error:", event);
    };
    
    // Log any general errors
    pc.onerror = (error) => {
      console.error("PeerConnection error:", error);
      setConnectionStatus('error');
    };
    
    return pc;
  }, [mode, toast, isHighSpeedEnabled]);

  // Handle data channel messages
  const handleDataChannelMessage = useCallback((event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'file-info':
          // Received file info, prepare to receive file
          if (mode === 'receive') {
            const newTransfer: FileTransfer = {
              id: message.fileId,
              name: message.fileName,
              size: message.fileSize,
              progress: 0,
              status: 'pending',
            };
            
            setTransfers(prev => [...prev, newTransfer]);
            
            // Acknowledge ready to receive
            dataChannel?.send(JSON.stringify({
              type: 'ready',
              fileId: message.fileId,
              highSpeed: isHighSpeedEnabled
            }));
          }
          break;
          
        case 'ready':
          // Receiver is ready for file transfer
          if (mode === 'send') {
            const fileToSend = transfers.find(t => t.id === message.fileId);
            if (fileToSend && fileToSend.file) {
              // Update if high speed is supported on both devices
              const receiverHighSpeed = message.highSpeed;
              const useHighSpeed = isHighSpeedEnabled && receiverHighSpeed;
              
              // Start sending file
              sendFile(fileToSend.file, fileToSend.id, useHighSpeed);
            }
          }
          break;
          
        case 'file-data':
          // Received a chunk of file data
          if (mode === 'receive') {
            const { fileId, chunk, chunkIndex, totalChunks } = message;
            
            // Store chunks (in a real app, you'd handle file assembly)
            // For now, just update progress
            const progress = Math.floor((chunkIndex / totalChunks) * 100);
            
            setTransfers(prev => 
              prev.map(t => t.id === fileId ? { 
                ...t, 
                progress,
                status: progress < 100 ? 'transferring' : 'completed',
                transferSpeed: progress < 100 ? getTransferSpeed(t.size.length) : undefined
              } : t)
            );
            
            // Acknowledge chunk receipt
            dataChannel?.send(JSON.stringify({
              type: 'ack',
              fileId,
              chunkIndex
            }));
          }
          break;
          
        case 'ack':
          // Receiver acknowledged chunk receipt
          if (mode === 'send') {
            const { fileId, chunkIndex } = message;
            
            // Update progress based on acknowledged chunk
            const transfer = transfers.find(t => t.id === fileId);
            if (transfer && transfer.file) {
              const totalChunks = Math.ceil(transfer.file.size / (deviceCapabilities.maxChunkSize));
              const progress = Math.floor((chunkIndex / totalChunks) * 100);
              
              setTransfers(prev => 
                prev.map(t => t.id === fileId ? {
                  ...t,
                  progress,
                  status: progress < 100 ? 'transferring' : 'completed',
                  transferSpeed: progress < 100 ? getTransferSpeed(transfer.file!.size) : undefined
                } : t)
              );
            }
          }
          break;
          
        case 'error':
          // Handle transfer error
          const transferId = message.fileId;
          setTransfers(prev => 
            prev.map(t => t.id === transferId ? { ...t, status: 'failed', progress: 0 } : t)
          );
          
          toast({
            title: "Transfer failed",
            description: message.error || "Unknown error occurred",
            variant: "destructive"
          });
          break;
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }, [mode, transfers, dataChannel, deviceCapabilities, isHighSpeedEnabled, toast]);

  // Send a file through WebRTC
  const sendFile = useCallback((file: File, fileId: string, useHighSpeed: boolean) => {
    if (!dataChannel || dataChannel.readyState !== 'open') {
      console.error("Data channel not open");
      return;
    }
    
    // Update transfer status to 'transferring'
    setTransfers(prev => 
      prev.map(t => t.id === fileId ? { 
        ...t, 
        status: 'transferring',
        transferSpeed: getTransferSpeed(file.size)
      } : t)
    );
    
    const chunkSize = useHighSpeed ? deviceCapabilities.maxChunkSize : 1024 * 1024;
    const totalChunks = Math.ceil(file.size / chunkSize);
    let chunkIndex = 0;
    
    const sendNextChunk = async () => {
      if (chunkIndex >= totalChunks) return;
      
      try {
        const start = chunkIndex * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        const chunk = file.slice(start, end);
        
        // Convert chunk to base64 for transmission
        const reader = new FileReader();
        reader.onloadend = () => {
          try {
            const base64data = reader.result?.toString().split(',')[1];
            
            // Send chunk metadata and data
            dataChannel.send(JSON.stringify({
              type: 'file-data',
              fileId,
              chunkIndex,
              totalChunks,
              chunk: base64data
            }));
            
            // We'll wait for ack before sending next chunk in a real implementation
            // For now, we'll just simulate progress
            chunkIndex++;
            
            if (chunkIndex < totalChunks) {
              setTimeout(sendNextChunk, 100); // Rate limiting for demo
            }
          } catch (err) {
            console.error("Error sending chunk:", err);
          }
        };
        
        reader.readAsDataURL(chunk);
      } catch (error) {
        console.error("Error reading file chunk:", error);
      }
    };
    
    // Start sending chunks
    sendNextChunk();
  }, [dataChannel, deviceCapabilities, getTransferSpeed]);

  // Initialize connection on component mount
  useEffect(() => {
    setDeviceCapabilities(checkDeviceCapabilities());
    setIsHighSpeedEnabled(checkDeviceCapabilities().highSpeed);
  }, []);

  // Function to start a connection
  const startConnection = useCallback(() => {
    if (connectionStatus !== 'disconnected') return;
    
    setConnectionStatus('connecting');
    const pc = initializeConnection();
    
    // For demo purposes, we're simulating the connection
    setTimeout(() => {
      if (mode === 'send' && files.length > 0) {
        // Create transfer objects for each file
        const newTransfers: FileTransfer[] = files.map(file => ({
          id: Math.random().toString(36).substring(2, 10),
          file: file,
          name: file.name,
          size: getFileSize(file.size),
          progress: 0,
          status: 'pending'
        }));
        
        setTransfers(newTransfers);
        
        // Notify receiver about files
        if (dataChannel && dataChannel.readyState === 'open') {
          newTransfers.forEach(transfer => {
            dataChannel.send(JSON.stringify({
              type: 'file-info',
              fileId: transfer.id,
              fileName: transfer.name,
              fileSize: transfer.size
            }));
          });
        }
      }
    }, 1500);
  }, [connectionStatus, files, initializeConnection, mode, dataChannel]);

  // Function to accept a connection (for receive mode)
  const acceptConnection = useCallback(() => {
    if (connectionStatus !== 'disconnected') return;
    
    setConnectionStatus('connecting');
    initializeConnection();
    
    // For demo purposes, we're simulating the connection
    setTimeout(() => {
      setConnectionStatus('connected');
    }, 1500);
  }, [connectionStatus, initializeConnection]);

  // Function to handle file selection (for send mode)
  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
  }, []);

  // Function to handle file reception (for receive mode)
  const handleFileReceived = useCallback((file: File) => {
    const fileTransfer: FileTransfer = {
      id: Math.random().toString(36).substring(2, 10),
      name: file.name,
      size: getFileSize(file.size),
      progress: 100,
      status: 'completed'
    };
    
    setTransfers(prev => [...prev, fileTransfer]);
    
    toast({
      title: "File received!",
      description: `Successfully received ${file.name}`
    });
  }, [toast]);

  // Function to cancel a transfer
  const cancelTransfer = useCallback((id: string) => {
    setTransfers(prev => 
      prev.map(t => t.id === id ? { ...t, status: 'failed', progress: 0 } : t)
    );
    
    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(JSON.stringify({
        type: 'cancel',
        fileId: id
      }));
    }
    
    toast({
      title: "Transfer cancelled",
      description: "File transfer has been cancelled."
    });
  }, [dataChannel, toast]);

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
    handleFileReceived,
    cancelTransfer,
    getFileSize
  };
}
