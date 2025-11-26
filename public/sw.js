const CACHE_NAME = 'roguecraft-v2';

// Install event - cache core files
self.addEventListener('install', event => {
  console.log('Service Worker: Installing v2');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: Caching files');
      return cache.addAll([
        '/AcecraftPrototype/',
        '/AcecraftPrototype/index.html'
      ]).catch(err => {
        console.error('Service Worker: Failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating v2');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - network first, cache fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Check if valid response
        if (!response || response.status !== 200) {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache the fetched file (async, don't block)
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        }).catch(err => {
          console.error('Service Worker: Cache put failed:', err);
        });

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then(response => {
          if (response) {
            console.log('Service Worker: Serving from cache:', event.request.url);
            return response;
          }

          // Fallback for offline navigation
          if (event.request.mode === 'navigate') {
            return caches.match('/AcecraftPrototype/index.html');
          }

          throw new Error('No cached response available');
        });
      })
  );
});
