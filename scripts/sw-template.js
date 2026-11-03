/* global self, caches, CACHE_NAME, CACHE_PREFIX, PRECACHE, APP_BASE */

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE.map((url) => new Request(url, { cache: "reload" })));
    } catch (error) {
      await caches.delete(CACHE_NAME);
      throw error; // Failed installs never replace a working offline version.
    }
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // Only this app's caches; other GitHub Pages apps on the origin are untouched.
    for (const key of await caches.keys()) if (key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith(APP_BASE)) return;
  // Cache-first versioned shell avoids combining a new HTML document with old chunks.
  // A new complete build is installed separately and activated after user consent.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const isHome = event.request.mode === "navigate" && (url.pathname === APP_BASE || url.pathname === `${APP_BASE}index.html`);
    const cached = await cache.match(isHome ? APP_BASE : event.request);
    if (cached) return cached;
    try { return await fetch(event.request); } catch {
      return new Response("Tidak dapat dimuatkan. Buka halaman utama yang telah dicache.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    event.waitUntil((async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const appWindows = windows.filter((client) => new URL(client.url).pathname.startsWith(APP_BASE));
      if (appWindows.length > 1) {
        event.source?.postMessage({ type: "UPDATE_BLOCKED" });
        return;
      }
      await self.skipWaiting();
    })());
  }
  if (event.data?.type === "CACHE_STATUS") {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE_NAME);
      const ready = (await Promise.all(PRECACHE.map((url) => cache.match(url)))).every(Boolean);
      event.source?.postMessage({ type: "CACHE_READY", ready });
    })());
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const existing = windows.find((client) => new URL(client.url).pathname.startsWith(APP_BASE));
    if (existing) return existing.focus();
    return self.clients.openWindow(APP_BASE);
  })());
});
