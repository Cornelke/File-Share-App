
import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { TransferCapabilities } from '@/utils/transferSpeed';

export interface FileTransfer {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: 'pending' | 'transferring' | 'completed' | 'failed';
  transferSpeed?: string;
  file?: File;
}

export function useTransferManager(
  dataChannel: RTCDataChannel | null,
  deviceCapabilities: TransferCapabilities,
  isHighSpeedEnabled: boolean
) {
  const [transfers, setTransfers] = useState<FileTransfer[]>([]);
  const { toast } = useToast();

  const getFileSize = useCallback((size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1048576) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1073741824) return `${(size / 1048576).toFixed(1)} MB`;
    return `${(size / 1073741824).toFixed(1)} GB`;
  }, []);

  const addTransfer = useCallback((file: File) => {
    const newTransfer: FileTransfer = {
      id: Math.random().toString(36).substring(2, 10),
      name: file.name,
      size: getFileSize(file.size),
      progress: 0,
      status: 'pending',
      file
    };
    
    setTransfers(prev => [...prev, newTransfer]);
    return newTransfer.id;
  }, [getFileSize]);

  const updateTransfer = useCallback((id: string, updates: Partial<FileTransfer>) => {
    setTransfers(prev => 
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  }, []);

  const cancelTransfer = useCallback((id: string) => {
    updateTransfer(id, { status: 'failed', progress: 0 });
    
    if (dataChannel?.readyState === 'open') {
      dataChannel.send(JSON.stringify({
        type: 'cancel',
        fileId: id
      }));
    }
    
    toast({
      title: "Transfer cancelled",
      description: "File transfer has been cancelled."
    });
  }, [dataChannel, toast, updateTransfer]);

  return {
    transfers,
    addTransfer,
    updateTransfer,
    cancelTransfer,
    getFileSize
  };
}
