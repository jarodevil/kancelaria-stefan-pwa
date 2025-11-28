const CACHE_VERSION = 'stefan-v2-offline-1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Resources to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/stefan-icon.svg',
  '/offline.html', // Fallback page for offline
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...', event);
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
    }).catch(err => {
      console.error('[SW] Failed to cache static assets:', err);
    })
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...', event);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('stefan-v') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== API_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - implement cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Strategy 1: Network First (for API calls)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Strategy 2: Cache First (for static assets)
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // Strategy 3: Stale While Revalidate (for HTML pages)
  event.respondWith(staleWhileRevalidateStrategy(request, DYNAMIC_CACHE));
});

/**
 * Network First Strategy
 * Try network first, fallback to cache if offline
 * Good for API calls where fresh data is important
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    // Return a basic offline response for API calls
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Brak połączenia z internetem. Funkcja wymaga dostępu online.' 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Cache First Strategy
 * Check cache first, fallback to network
 * Good for static assets that don't change often
 */
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Failed to fetch:', request.url, error);
    
    // Return a fallback response
    return new Response('Offline - resource not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Stale While Revalidate Strategy
 * Return cached version immediately, update cache in background
 * Good for pages where some staleness is acceptable
 */
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, return cached version if available
    return cachedResponse || caches.match('/offline.html');
  });
  
  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Background Sync - queue failed requests for retry when online
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-notes') {
    event.waitUntil(syncNotes());
  }
});

/**
 * Sync queued notes when connection is restored
 */
async function syncNotes() {
  try {
    // Get pending notes from IndexedDB or localStorage
    const pendingNotes = await getPendingNotes();
    
    for (const note of pendingNotes) {
      try {
        await fetch('/api/notes/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(note),
        });
        
        // Remove from pending queue after successful sync
        await removePendingNote(note.id);
      } catch (error) {
        console.error('[SW] Failed to sync note:', note.id, error);
      }
    }
    
    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Helper functions for sync queue (using localStorage for simplicity)
async function getPendingNotes() {
  try {
    const pending = localStorage.getItem('stefan_pending_sync');
    return pending ? JSON.parse(pending) : [];
  } catch {
    return [];
  }
}

async function removePendingNote(noteId) {
  try {
    const pending = await getPendingNotes();
    const filtered = pending.filter(n => n.id !== noteId);
    localStorage.setItem('stefan_pending_sync', JSON.stringify(filtered));
  } catch (error) {
    console.error('[SW] Failed to remove pending note:', error);
  }
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Stefan - Asystent Prawny';
  const options = {
    body: data.body || 'Masz nową wiadomość',
    icon: '/stefan-icon.svg',
    badge: '/stefan-icon.svg',
    data: data.url || '/',
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});
