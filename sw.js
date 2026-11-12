// Service Worker: guarda la APLICACIÓN (no el clima) para abrirla sin Internet.
// Si cambiamos algún archivo, subimos el número de versión.
const CACHE = "el-tiempo-v1";
const ARCHIVOS = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.webmanifest",
    "./icon-192.png",
    "./icon-512.png"
];

// install: primera preparación, guardamos los archivos en caché.
self.addEventListener("install", function (evento) {
    evento.waitUntil(
        caches.open(CACHE).then(function (cache) {
            return cache.addAll(ARCHIVOS);
        })
    );
    self.skipWaiting();
});

// activate: puesta en servicio, borramos cachés de versiones anteriores.
self.addEventListener("activate", function (evento) {
    evento.waitUntil(
        caches.keys().then(function (nombres) {
            return Promise.all(
                nombres
                    .filter(function (nombre) { return nombre !== CACHE; })
                    .map(function (nombre) { return caches.delete(nombre); })
            );
        })
    );
    self.clients.claim();
});

// fetch: cada pedido. Primero la caché; si no está, Internet.
self.addEventListener("fetch", function (evento) {
    // Solo manejamos archivos de nuestra web. La API de Open-Meteo pasa directo.
    if (evento.request.method !== "GET" ||
        new URL(evento.request.url).origin !== self.location.origin) {
        return;
    }
    evento.respondWith(
        caches.match(evento.request).then(function (guardado) {
            return guardado || fetch(evento.request);
        })
    );
});
