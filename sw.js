// Good Vibes Tracker - Service Worker for GitHub Pages
// Updated for offline functionality

const CACHE_NAME = 'goodvibes-v1.0.0';
const CACHE_STATIC_NAME = 'goodvibes-static-v1.0.0';
const CACHE_DYNAMIC_NAME = 'goodvibes-dynamic-v1.0.0';

// Static assets to cache immediately
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/app.css',
    './js/app.js',
    './js/controllers/mood.controller.js',
    './js/services/storage.service.js',
    './js/services/habits.service.js',
    './js/components/install-prompt.js',
    // External CDN resources
    'https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular.min.js'
];

// Assets to cache on first use (dynamic)
const DYNAMIC_ASSETS = [
    './assets/icons/icon-72x72.jpg',
    './assets/icons/icon-96x96.jpg',
    './assets/icons/icon-128x128.jpg',
    './assets/icons/icon-192x192.jpg',
    './assets/icons/icon-512x512.jpg'
];

// Install event - Cache static assets
self.addEventListener('install', event => {
    console.log('[SW] Installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(CACHE_STATIC_NAME)
                .then(cache => {
                    console.log('[SW] Caching static assets');
                    return cache.addAll(STATIC_ASSETS);
                }),
            
            // Pre-cache dynamic assets
            caches.open(CACHE_DYNAMIC_NAME)
                .then(cache => {
                    console.log('[SW] Pre-caching dynamic assets');
                    return cache.addAll(DYNAMIC_ASSETS.filter(asset => 
                        !STATIC_ASSETS.includes(asset)
                    ));
                })
        ]).then(() => {
            console.log('[SW] Installation complete');
            // Force activation
            return self.skipWaiting();
        })
    );
});

// Activate event - Clean up old caches and take control
self.addEventListener('activate', event => {
    console.log('[SW] Activating...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_STATIC_NAME && 
                            cacheName !== CACHE_DYNAMIC_NAME &&
                            cacheName !== CACHE_NAME) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            
            // Take control of all clients
            self.clients.claim()
        ]).then(() => {
            console.log('[SW] Activation complete');
        })
    );
});

// Fetch event - Serve cached content with fallback strategies
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    const { request } = event;
    const url = new URL(request.url);
    
    // Handle different types of requests with appropriate strategies
    if (isStaticAsset(request.url)) {
        // Static assets: Cache first
        event.respondWith(cacheFirst(request));
    } else if (isExternalResource(request.url)) {
        // External resources: Stale while revalidate
        event.respondWith(staleWhileRevalidate(request));
    } else if (isNavigationRequest(request)) {
        // Navigation requests: Network first with offline fallback
        event.respondWith(networkFirstWithOfflineFallback(request));
    } else {
        // Other requests: Network first
        event.respondWith(networkFirst(request));
    }
});

// Strategy: Cache First (for static assets)
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_STATIC_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('[SW] Cache first failed:', error);
        return new Response('Offline content not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Strategy: Network First (for API calls and dynamic content)
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_DYNAMIC_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('[SW] Network first fallback to cache:', error);
        const cachedResponse = await caches.match(request);
        return cachedResponse || new Response('Content not available offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Strategy: Stale While Revalidate (for external resources)
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            const cache = caches.open(CACHE_DYNAMIC_NAME);
            cache.then(c => c.put(request, networkResponse.clone()));
        }
        return networkResponse;
    }).catch(error => {
        console.log('[SW] Stale while revalidate fetch failed:', error);
        return cachedResponse;
    });
    
    return cachedResponse || fetchPromise;
}

// Strategy: Network First with Offline Fallback (for navigation)
async function networkFirstWithOfflineFallback(request) {
    try {
        return await fetch(request);
    } catch (error) {
        console.log('[SW] Network failed, serving offline fallback');
        const cache = await caches.open(CACHE_STATIC_NAME);
        return await cache.match('./index.html') || await cache.match('./');
    }
}

// Helper functions
function isStaticAsset(url) {
    return STATIC_ASSETS.some(asset => url.includes(asset.replace('./', ''))) ||
           url.includes('.css') ||
           url.includes('.js') ||
           url.includes('.png') ||
           url.includes('.jpg') ||
           url.includes('.svg');
}

function isExternalResource(url) {
    return url.includes('googleapis.com') ||
           url.includes('cdnjs.cloudflare.com') ||
           !url.includes(self.location.origin);
}

function isNavigationRequest(request) {
    return request.mode === 'navigate' ||
           (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Background sync for when network is restored
self.addEventListener('sync', event => {
    console.log('[SW] Background sync:', event.tag);
    
    if (event.tag === 'sync-data') {
        event.waitUntil(syncOfflineData());
    }
});

// Sync offline data when network is restored
async function syncOfflineData() {
    try {
        console.log('[SW] Syncing offline data...');
        // Here you could implement data sync logic
        // For now, we'll just log that sync is available
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'SYNC_AVAILABLE',
                message: 'Network restored - data sync available'
            });
        });
    } catch (error) {
        console.error('[SW] Sync failed:', error);
    }
}

// Handle messages from the main app
self.addEventListener('message', event => {
    console.log('[SW] Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_CACHE_SIZE') {
        getCacheSize().then(size => {
            event.ports[0].postMessage({ cacheSize: size });
        });
    }
});

// Get total cache size
async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
                const text = await response.clone().text();
                totalSize += text.length;
            }
        }
    }
    
    return totalSize;
}