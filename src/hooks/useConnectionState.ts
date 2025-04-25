
import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { generateConnectionCode } from '@/utils/connectionCodes';
import { createPeerConnection } from '@/utils/webrtc';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export function useConnectionState(mode: 'send' | 'receive') {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [connectionId, setConnectionId] = useState<string>(generateConnectionCode());
  const [connectedDevices, setConnectedDevices] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const { toast } = useToast();

  const initializeConnection = useCallback(() => {
    const { pc, dc } = createPeerConnection(mode);
    setPeerConnection(pc);
    
    if (mode === 'send') {
      const dataChannel = pc.createDataChannel('fileTransfer');
      setDataChannel(dataChannel);
    } else {
      pc.ondatachannel = (event) => {
        setDataChannel(event.channel);
      };
    }
    
    pc.onconnectionstatechange = () => {
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
    
    return pc;
  }, [mode, toast]);

  return {
    peerConnection,
    dataChannel,
    connectionId,
    connectedDevices,
    connectionStatus,
    setConnectionId,
    initializeConnection,
    setConnectionStatus
  };
}
