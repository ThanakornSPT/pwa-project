// Good Vibes Tracker - Service Worker
// Phase 1: Basic Caching Strategy

const CACHE_NAME = 'goodvibes-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/app.css',
    '/js/app.js',
    '/js/controllers/mood.controller.js',
    '/js/services/storage.service.js',
    '/js/components/install-prompt.js',
    '/manifest.json',
    'https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular.min.js'
];

// Install event - Cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - Serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            }
        )
    );
});

// Activate event - Clean up old caches
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
        })
    );
});
