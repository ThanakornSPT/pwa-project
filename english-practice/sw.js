const CACHE_NAME = 'pwa-cache-v1';
const assets = ["index.html"];

// ขั้นตอนการ Install: เก็บไฟล์ลง Cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(assets);
        })
    );
});

// ขั้นตอนการ Fetch: ดึงไฟล์จาก Cache ถ้า Offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});