// 股識 SW v10 — 每次更新這個版本號
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
