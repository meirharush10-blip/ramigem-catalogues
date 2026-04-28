// Ramigem CRM Service Worker
// Increment CACHE_VERSION on every deploy to force update
const CACHE_VERSION = 'ramigem-v4.1';
const ASSETS = [
  '/ramigem-catalogues/crm.html',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_VERSION; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Network first for the CRM HTML (so updates land immediately)
  if (e.request.url.includes('crm.html')) {
    e.respondWith(
      fetch(e.request).then(function(res) {
        var clone = res.clone();
        caches.open(CACHE_VERSION).then(function(cache) { cache.put(e.request, clone); });
        return res;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }
  // Cache first for everything else (fonts etc)
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request);
    })
  );
});

// Allow main thread to trigger skipWaiting
self.addEventListener('message', function(e) {
  if (e.data && e.data.action === 'skipWaiting') self.skipWaiting();
});
