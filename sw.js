// 股識 Service Worker v1.0
// 讓 App 可以離線使用、更快載入

const CACHE_NAME = 'gushi-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',const CACHE_NAME = 'gushi-v9';
const CACHE_URLS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {// 股識 SW v10 — 每次更新這個版本號
const CACHE_NAME = 'gushi-v10';
const CACHE_URLS = ['/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  // 立即接管，不等舊 SW
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => {
      return Promise.allSettled(CACHE_URLS.map(url => c.add(url).catch(() => {})));
    })
  );
});

self.addEventListener('activate', e => {
  // 清除所有舊版快取
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => {
        console.log('[SW] Deleting old cache:', k);
        return caches.delete(k);
      }))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // API 請求完全不快取
  if (url.includes('openai.com') || url.includes('yahoo.com') ||
      url.includes('twse.com') || url.includes('corsproxy') ||
      url.includes('allorigins') || url.includes('codetabs') ||
      url.includes('google.com/rss') || url.includes('fonts.')) {
    return; // 直接走網路
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 成功就更新快取
        if (res.ok && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => {
        // 離線時用快取
        return caches.match(e.request).then(cached => {
          if (cached) return cached;
          if (e.request.destination === 'document') return caches.match('/index.html');
        });
      })
  );
});

  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(CACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('openai.com') ||
      e.request.url.includes('yahoo.com') ||
      e.request.url.includes('twse.com') ||
      e.request.url.includes('corsproxy') ||
      e.request.url.includes('allorigins')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        if (e.request.destination === 'document') return caches.match('/index.html');
      });
    })
  );
});

  '/icon-512.png',
];

// 安裝：預快取核心資源
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_URLS))
  );
  self.skipWaiting();
});

// 啟動：清除舊快取
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 請求攔截：優先用快取，失敗才聯網
self.addEventListener('fetch', e => {
  // API 請求不快取，直接聯網
  if (e.request.url.includes('openai.com') ||
      e.request.url.includes('yahoo.com') ||
      e.request.url.includes('twse.com') ||
      e.request.url.includes('corsproxy') ||
      e.request.url.includes('allorigins')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // 靜態資源才快取
        if (res.ok && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        // 離線時回傳主頁
        if (e.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
