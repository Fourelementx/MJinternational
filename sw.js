// Cache name
const CACHE_NAME = 'four-elements-dynamic-cache-v1';

// Offline fallback page
const OFFLINE_PAGE = '/index.html';

// Install event: cache the offline page initially
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add(OFFLINE_PAGE);
    })
  );
  self.skipWaiting();
});

// Fetch event: cache only CSS, JS, and image files, and redirect to offline page if offline
self.addEventListener('fetch', (event) => {
  // Check if the request is for CSS, JS, or image
  if (
    event.request.destination === 'style' ||
    event.request.destination === 'script' ||
    event.request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request)
            .then((networkResponse) => {
              return caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
            })
            .catch(() => caches.match(OFFLINE_PAGE))
        );
      })
    );
  } else {
    // For other request types, just fetch from network and fall back to offline page if network fails
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_PAGE))
    );
  }
});

// Activate event: Clean up old caches
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
