
import { useCallback } from 'react';
import { FileTransfer } from './useTransferManager';

export function useOfflineStorage() {
  const storeFileLocally = useCallback(async (transfer: FileTransfer) => {
    if (!transfer.file) return;
    
    try {
      // Store file in IndexedDB for offline access
      const dbName = 'wifiFileFlow';
      const request = indexedDB.open(dbName, 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = async () => {
        const db = request.result;
        const tx = db.transaction('files', 'readwrite');
        const store = tx.objectStore('files');
        
        // Convert file to ArrayBuffer for storage
        const arrayBuffer = await transfer.file!.arrayBuffer();
        
        // Store file metadata and content
        await store.put({
          id: transfer.id,
          name: transfer.name,
          type: transfer.file!.type,
          size: transfer.size,
          lastModified: transfer.file!.lastModified,
          content: arrayBuffer
        });
        
        // Notify service worker about the cached file
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_FILE',
            file: transfer.file,
            metadata: {
              id: transfer.id,
              name: transfer.name,
              size: transfer.size
            }
          });
        }
      };
    } catch (error) {
      console.error('Error storing file offline:', error);
    }
  }, []);

  const retrieveFileLocally = useCallback(async (fileId: string) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('wifiFileFlow', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('files', 'readonly');
        const store = tx.objectStore('files');
        const getRequest = store.get(fileId);
        
        getRequest.onsuccess = () => {
          const fileData = getRequest.result;
          if (fileData) {
            const file = new File([fileData.content], fileData.name, {
              type: fileData.type,
              lastModified: fileData.lastModified
            });
            resolve(file);
          } else {
            reject(new Error('File not found in offline storage'));
          }
        };
        
        getRequest.onerror = () => reject(getRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  }, []);

  return {
    storeFileLocally,
    retrieveFileLocally
  };
}
