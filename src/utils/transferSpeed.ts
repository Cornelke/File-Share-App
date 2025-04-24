
// Transfer speed configurations and utilities
export interface TransferCapabilities {
  highSpeed: boolean;
  maxChunkSize: number;
  concurrentTransfers: number;
}

export const DEFAULT_TRANSFER_CONFIG = {
  highSpeed: false,
  maxChunkSize: 1024 * 1024, // 1MB
  concurrentTransfers: 1
};

export const HIGH_SPEED_CONFIG = {
  highSpeed: true,
  maxChunkSize: 5 * 1024 * 1024, // 5MB
  concurrentTransfers: 3
};

export const checkDeviceCapabilities = (): TransferCapabilities => {
  // Check if device supports high-speed transfers
  const hasStrongCPU = navigator.hardwareConcurrency > 4;
  const hasGoodMemory = !('deviceMemory' in navigator) || (navigator as any).deviceMemory > 4;
  
  return hasStrongCPU && hasGoodMemory ? HIGH_SPEED_CONFIG : DEFAULT_TRANSFER_CONFIG;
};

