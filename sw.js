const CACHE_NAME = 'nexus-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/animations.css',
  '/css/components.css',
  '/js/app.js',
  '/js/ai-engine.js',
  '/js/data-store.js',
  '/js/voice.js',
  '/js/modules/dashboard.js',
  '/js/modules/mindspace.js',
  '/js/modules/careerlab.js',
  '/js/modules/moneyiq.js',
  '/js/modules/community.js',
  '/js/modules/journal.js',
  '/js/modules/achievements.js',
  '/js/modules/onboarding.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS.filter(url => !url.includes('undefined'))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).catch(() => caches.match('/index.html'));
    })
  );
});
