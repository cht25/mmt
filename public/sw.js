/* Mahi And Muhi Traders — Tali Khata Service Worker
 * Strategy: network-first for everything (keeps HMR/dev preview fresh),
 * falling back to cache when offline. App shell is precached at install.
 */
const CACHE = "mmt-talikhata-v1";
const PRECACHE = ["/", "/app.html", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png", "/favicon-96.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // fonts/CDN stay network-only

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === "navigate") {
          const shell = await caches.match("/app.html");
          if (shell) return shell;
        }
        return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
      }),
  );
});
