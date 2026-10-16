// Navigation and API requests always use the network so old restaurant data or pages cannot linger.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())await caches.delete(key);await self.clients.claim()})()));
self.addEventListener('fetch',event=>{if(event.request.mode==='navigate'||new URL(event.request.url).pathname.startsWith('/api/'))event.respondWith(fetch(event.request))});
