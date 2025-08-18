const CACHE_NAME = 'easy-talk-v1.0';
const urlsToCache = [
    './',
    './index.html',
    // Cache external dependencies
    'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.8.3/angular.min.js',
    // Cache manifest and icons (inline data URLs will be handled automatically)
];

// Install event - cache resources
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: Install complete');
                // Force activation of new service worker
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Install failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete old cache versions
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activation complete');
            // Take control of all pages immediately
            return self.clients.claim();
        })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http requests
    if (!event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return cachedResponse;
                }

                // Otherwise, fetch from network
                console.log('Service Worker: Fetching from network', event.request.url);
                return fetch(event.request)
                    .then(response => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response for caching
                        const responseToCache = response.clone();

                        // Cache the fetched resource
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.error('Service Worker: Fetch failed', error);
                        
                        // Return a fallback page for navigation requests when offline
                        if (event.request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                        
                        // For other requests, you could return a default response
                        throw error;
                    });
            })
    );
});

// Handle background sync (if needed in the future)
self.addEventListener('sync', event => {
    console.log('Service Worker: Background sync', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Add background sync logic here if needed
            Promise.resolve()
        );
    }
});

// Handle push notifications (if needed in the future)
self.addEventListener('push', event => {
    console.log('Service Worker: Push received');
    
    const options = {
        body: event.data ? event.data.text() : 'New update available!',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMTYiIHk9IjE2IiB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHJ4PSI5IiBmaWxsPSIjODBjNmI1Ii8+PHRleHQgeD0iNjQiIHk9IjQ0IiBmb250LXNpemU9IjI4cHgiIGZpbGw9IiNmZmZmZmYiIGZvbnQtd2VpZ2h0PSJiIj5FPC90ZXh0Pjwvc3ZnPg==',
        badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMTYiIHk9IjE2IiB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHJ4PSI5IiBmaWxsPSIjODBjNmI1Ii8+PHRleHQgeD0iNjQiIHk9IjQ0IiBmb250LXNpemU9IjI4cHgiIGZpbGw9IiNmZmZmZmYiIGZvbnQtd2VpZ2h0PSJiIj5FPC90ZXh0Pjwvc3ZnPg==',
        vibrate: [200, 100, 200],
        data: {
            url: './'
        }
    };

    event.waitUntil(
        self.registration.showNotification('Easy Talk', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url || './')
    );
});

// Log service worker updates
self.addEventListener('message', event => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('Service Worker: Script loaded');