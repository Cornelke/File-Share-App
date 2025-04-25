
// FileShare Service Worker for offline functionality
const CACHE_NAME = 'fileshare-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
  '/send',
  '/receive',
  '/connect'
];

// Cache essential assets during installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Clean up old caches during activation
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim all clients so the service worker is in control immediately
      return self.clients.claim();
    })
  );
});

// Network-first strategy with fallback to cache
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Handle SPA navigation
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/');
        })
    );
    return;
  }
  
  event.respondWith(
    // Try network first
    fetch(event.request)
      .then(response => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Add to cache for future offline use
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            // If both network and cache fail, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Handle file sharing without internet
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_FILE') {
    const { file, metadata } = event.data;
    caches.open(CACHE_NAME).then(cache => {
      cache.put(`/shared-files/${metadata.id}`, new Response(file));
    });
  }
});

// Handle offline sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-files') {
    event.waitUntil(syncFiles());
  }
});

// Function to sync files when online
async function syncFiles() {
  // Implementation depends on your app's needs
  console.log('Syncing files with server when back online');
  // Example: Read from IndexedDB and sync with server
}

// Notify clients when app is ready for offline use
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
