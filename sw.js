const CACHE = 'ramigem-v1';
const URLS = [
  '/ramigem-catalogues/',
  '/ramigem-catalogues/index.html',
  '/ramigem-catalogues/rings.html',
  '/ramigem-catalogues/necklaces.html',
  '/ramigem-catalogues/earrings.html',
  '/ramigem-catalogues/bracelets.html',
  '/ramigem-catalogues/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(URLS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(response => {
      if (response && response.status === 200 && response.type === 'basic') {
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return response;
    })).catch(() => caches.match('/ramigem-catalogues/'))
  );
});
