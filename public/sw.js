
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Estratégia Network First para garantir dados atualizados no servidor local
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
