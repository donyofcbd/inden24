const CACHE_NAME = "govt-jobs-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

// ✅ Install event — cache essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 Caching app shell...");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// ✅ Activate event — clean old cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  console.log("✅ Service Worker activated.");
});

// ✅ Fetch event — Network first, then cache fallback
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Try Network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone and store in cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // If offline, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          } else if (request.destination === "document") {
            // fallback for offline
            return caches.match("/index.html");
          }
        });
      })
  );
});
