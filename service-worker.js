const CACHE_NAME = "nurse-sync-cache-v1";
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./service-worker.js",
  // favicon/icon external (may or may not be cachable depending on CORS)
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgknoLG26yQzq-esjpd2dO0jyhlibaQJQXsZk6qXt68LH7eODrjcI8tQEQxCumhta-dHx1LZkvB2Lg7S-YJuA3XmUtgCpqju6tXarVI3OIz7YKa5rX1HEue19ZaAUaxpQ5ymEMNpo5B5LgyRZ27wnekrsUDZnjaeH5C5OaHnjA45gauZinFHll3IGASJlzC/s16000/Desain_tanpa_judul-removebg-preview.png",
  // app iframe URLs (may be rejected by remote server for caching)
  "https://www.appsheet.com/start/fddf162d-c048-4ddc-ac12-8994cf340f7b?refresh=1",
  "https://www.appsheet.com/start/fddf162d-c048-4ddc-ac12-8994cf340f7b?refresh=1"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE.map(url => new Request(url, {mode: 'no-cors'})))
        .catch(err => {
          // Some cross-origin requests may fail due to CORS - that's expected.
          console.warn("Some resources failed to cache (likely cross-origin/CORS):", err);
          return Promise.resolve();
        });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map(k => {
        if (k !== CACHE_NAME) return caches.delete(k);
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Try cache first, then network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(err => {
        // network failed
        return new Response('<h1>Offline</h1><p>Content is not available offline.</p>', {
          headers: { 'Content-Type': 'text/html' }
        });
      });
    })
  );
});
