
// Transfer speed configurations and utilities
export interface TransferCapabilities {
  highSpeed: boolean;
  maxChunkSize: number;
  concurrentTransfers: number;
  checksumSupport: boolean;
}

// Default configuration for slower devices
export const DEFAULT_TRANSFER_CONFIG: TransferCapabilities = {
  highSpeed: false,
  maxChunkSize: 1024 * 1024, // 1MB
  concurrentTransfers: 1,
  checksumSupport: false
};

// Configuration for high-performance devices
export const HIGH_SPEED_CONFIG: TransferCapabilities = {
  highSpeed: true,
  maxChunkSize: 5 * 1024 * 1024, // 5MB
  concurrentTransfers: 3,
  checksumSupport: true
};

// Check device capabilities using available browser APIs
export const checkDeviceCapabilities = (): TransferCapabilities => {
  // Check if device supports high-speed transfers based on hardware
  const hasStrongCPU = navigator.hardwareConcurrency > 4;
  const hasGoodMemory = !('deviceMemory' in navigator) || (navigator as any).deviceMemory > 4;
  
  // Check network capabilities - if available
  let hasGoodNetwork = true;
  if ('connection' in navigator) {
    const conn = (navigator as any).connection;
    if (conn) {
      const effectiveType = conn.effectiveType;
      const downlink = conn.downlink;
      
      // Only allow high-speed for 4g or higher connections with decent bandwidth
      if (effectiveType && ['slow-2g', '2g', '3g'].includes(effectiveType)) {
        hasGoodNetwork = false;
      }
      
      // Require at least 1.5 Mbps for high-speed
      if (downlink && downlink < 1.5) {
        hasGoodNetwork = false;
      }
    }
  }
  
  // Battery status check (if available)
  let hasBatteryPower = true;
  if ('getBattery' in navigator) {
    (navigator as any).getBattery().then((battery: any) => {
      // If battery is below 15% and not charging, avoid high-speed
      if (battery.level < 0.15 && !battery.charging) {
        hasBatteryPower = false;
      }
    }).catch(() => {
      // If we can't get battery info, assume it's fine
    });
  }
  
  // Storage check
  let hasStorageSpace = true;
  if ('storage' in navigator && 'estimate' in (navigator as any).storage) {
    (navigator as any).storage.estimate().then((estimate: any) => {
      const availableMB = (estimate.quota - estimate.usage) / (1024 * 1024);
      // If less than 200MB free, avoid high-speed
      if (availableMB < 200) {
        hasStorageSpace = false;
      }
    }).catch(() => {
      // If we can't estimate storage, assume it's fine
    });
  }
  
  return (hasStrongCPU && hasGoodMemory && hasGoodNetwork && hasBatteryPower && hasStorageSpace) 
    ? HIGH_SPEED_CONFIG 
    : DEFAULT_TRANSFER_CONFIG;
};

// Calculate actual bytes per second from chunk size and time
export const calculateBytesPerSecond = (
  bytesTransferred: number, 
  milliseconds: number
): number => {
  return bytesTransferred / (milliseconds / 1000);
};

// Format transfer speed as human-readable string
export const formatTransferSpeed = (bytesPerSecond: number): string => {
  if (bytesPerSecond < 1024) {
    return `${bytesPerSecond.toFixed(1)} B/s`;
  } else if (bytesPerSecond < 1048576) {
    return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
  } else {
    return `${(bytesPerSecond / 1048576).toFixed(1)} MB/s`;
  }
};
