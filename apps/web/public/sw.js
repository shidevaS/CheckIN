// Service Worker for Tuiton Academy PWA
const CACHE_NAME = 'tuiton-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/roadmaps',
  '/challenges',
  '/live',
  '/leaderboard',
  '/profile',
  '/community',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found
      if (cachedResponse) {
        // Update cache in background
        event.waitUntil(
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, networkResponse.clone());
                });
              }
            })
            .catch(() => {
              // Ignore network errors for background update
            })
        );
        return cachedResponse;
      }

      // Fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          // Cache successful responses
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/dashboard');
          }
          // Return a generic offline response for other requests
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-challenges') {
    event.waitUntil(syncChallenges());
  }
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgress());
  }
});

async function syncChallenges() {
  // Sync pending challenge submissions when online
  const cache = await caches.open('tuiton-offline');
  const requests = await cache.keys();
  const pendingRequests = requests.filter((req) => req.url.includes('/api/challenges/') && req.method === 'POST');

  for (const req of pendingRequests) {
    try {
      const response = await fetch(req);
      if (response.ok) {
        await cache.delete(req);
      }
    } catch (e) {
      console.log('Failed to sync challenge:', e);
    }
  }
}

async function syncProgress() {
  // Sync lesson progress when online
  const cache = await caches.open('tuiton-offline');
  const requests = await cache.keys();
  const pendingRequests = requests.filter((req) => req.url.includes('/api/lessons/') && req.method === 'POST');

  for (const req of pendingRequests) {
    try {
      const response = await fetch(req);
      if (response.ok) {
        await cache.delete(req);
      }
    } catch (e) {
      console.log('Failed to sync progress:', e);
    }
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon.svg',
    badge: '/icons/icon.svg',
    vibrate: [200, 100, 200],
    data: {
      url: data.href || '/dashboard',
    },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const url = event.notification.data?.url || '/dashboard';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        return clients.openWindow(url);
      })
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});