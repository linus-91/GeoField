/* Offline cache for the field data portal. Change VERSION whenever index.html changes. */
var VERSION = 'field-portal-v3-1';
var FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(function (cache) {
    return cache.match(e.request, {ignoreSearch: true}).then(function (hit) {
      var net = fetch(e.request).then(function (res) { if (res && res.ok) cache.put(e.request, res.clone()); return res; }).catch(function () { return hit || cache.match('./index.html'); });
      return hit || net;
    });
  }));
});
