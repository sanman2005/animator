'use strict';

const CACHE_VERSION = 1;

interface ExtendableEvent extends Event {
  request: RequestInfo;
  respondWith(fn: Promise<any>): void;
  waitUntil(fn: Promise<any>): void;
}

const openCache = () => caches.open(`v${CACHE_VERSION}`);

self.addEventListener('install', (event: ExtendableEvent) =>
  event.waitUntil(
    openCache().then(cache => cache.addAll(['./index.html', './client.js'])),
  ),
);

self.addEventListener('activate', event => {
  console.log(`ServiceWorker is activated. Version: ${CACHE_VERSION}`);
});

self.addEventListener('fetch', async (event: ExtendableEvent) => {
  const { request } = event;

  const proxyFetch = async () => {
    const responseFromCache = await caches.match(request);

    if (responseFromCache) return responseFromCache;

    const response = await fetch(request);
    const cache = await openCache();

    cache.put(request, response.clone());

    return response;
  };

  event.respondWith(proxyFetch());
});
