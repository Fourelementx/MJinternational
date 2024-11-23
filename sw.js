// Cache name
const CACHE_NAME = 'four-elements-full-cache-v1';

// Offline fallback page
const OFFLINE_PAGE = 'https://fourelementx.github.io/MJinternational/index.html';

// Install event: Cache the offline fallback page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add(OFFLINE_PAGE);
    })
  );
  self.skipWaiting();
});

// Fetch event: Cache all pages and serve from cache if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse || 
        fetch(event.request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            // Cache the fetched response for future use
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => caches.match(OFFLINE_PAGE)) // Fallback to offline page
      );
    })
  );
});

// Activate event: Remove old caches if cache name changes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cache) => cache !== CACHE_NAME)
          .map((cache) => caches.delete(cache))
      );
    })
  );
  self.clients.claim();
});
