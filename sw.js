/* Service worker de ATRAPA FICHAS — funciona offline.
   Cada vez que cambies algún archivo (por ejemplo datos.js),
   subí este número para que las tablets bajen la versión nueva. */
const VERSION = "atrapa-v1";

const ARCHIVOS = [
  "./",
  "index.html",
  "estilos.css",
  "datos.js",
  "juego.js",
  "manifest.webmanifest",
  "fuentes/fredoka.woff2",
  "iconos/icono-180.png",
  "iconos/icono-192.png",
  "iconos/icono-512.png",
  "iconos/icono-maskable-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((enCache) => {
      if (enCache) return enCache;
      return fetch(e.request).then((resp) => {
        // guarda también lo que no estaba en la lista (ej: imágenes de fondos/)
        if (resp.ok && new URL(e.request.url).origin === location.origin) {
          const copia = resp.clone();
          caches.open(VERSION).then((c) => c.put(e.request, copia));
        }
        return resp;
      }).catch(() => caches.match("index.html"));
    })
  );
});
