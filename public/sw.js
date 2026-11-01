const CACHE = "mo-v4";
const SHELL = ["/", "/index.html", "/logo.png", "/icon-192.png", "/icon-512.png", "/favicon.png", "/manifest.json"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;
  if (new URL(e.request.url).pathname.startsWith("/api/")) return;

  // Network-first pour les pages HTML : permet de pousser des updates rapidement
  const isHTML = e.request.mode === "navigate" || e.request.headers.get("accept")?.includes("text/html");
  if (isHTML) {
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request).then(r => r || caches.match("/")))
    );
    return;
  }

  // Cache-first pour le reste (icônes, JS, CSS)
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

// ─── Notifications push ──────────────────────────────────────────────────────
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) {}
  e.waitUntil(self.registration.showNotification(d.title || "Mo", {
    body: d.body || "C'est l'heure de compléter ta journée.",
    icon: "/icon-192.png", badge: "/icon-192.png", tag: "mo-rappel", data: { url: d.url || "/" },
  }));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) if ("focus" in c) return c.focus();
    return self.clients.openWindow((e.notification.data && e.notification.data.url) || "/");
  }));
});
