
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Share, Loader2 } from 'lucide-react';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

interface ConnectionStatusProps {
  state?: ConnectionState;
  connectedDevices?: number;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  state = 'disconnected',
  connectedDevices = 0
}) => {
  const [animateIcon, setAnimateIcon] = useState(false);
  
  useEffect(() => {
    // Add animation when state changes
    setAnimateIcon(true);
    const timer = setTimeout(() => setAnimateIcon(false), 1000);
    
    return () => clearTimeout(timer);
  }, [state]);
  
  const statusConfig = {
    disconnected: {
      label: 'Disconnected',
      variant: 'outline' as const,
      icon: <WifiOff size={14} className="mr-1" />
    },
    connecting: {
      label: 'Connecting...',
      variant: 'outline' as const,
      icon: <Loader2 size={14} className="mr-1 animate-spin" />
    },
    connected: {
      label: 'Connected',
      variant: 'default' as const,
      icon: <Wifi size={14} className="mr-1" />
    },
    error: {
      label: 'Connection Error',
      variant: 'destructive' as const,
      icon: <WifiOff size={14} className="mr-1" />
    }
  };
  
  const config = statusConfig[state];
  
  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={config.variant}
        className={`${animateIcon ? 'animate-pulse' : ''}`}
      >
        {config.icon}
        {config.label}
      </Badge>
      
      {state === 'connected' && connectedDevices > 0 && (
        <Badge variant="secondary" className="flex items-center">
          <Share size={14} className="mr-1" />
          {connectedDevices} {connectedDevices === 1 ? 'device' : 'devices'} connected
        </Badge>
      )}
    </div>
  );
};

export default ConnectionStatus;
