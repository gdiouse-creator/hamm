const CACHE_NAME = 'kuang-jizhang-v1';
const ASSETS = ['./', './index.html', './manifest.json', './quotes.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

// 優先連網抓最新版本；只有真的離線、連不上網路時，才退回用手機裡存的舊版本。
// 這樣你在 GitHub 更新檔案後，手機上會抓到新版，不會一直卡在舊版的快取。
self.addEventListener('fetch', (e)=>{
  e.respondWith(
    fetch(e.request).then(res=>{
      const resClone = res.clone();
      caches.open(CACHE_NAME).then(cache=> cache.put(e.request, resClone)).catch(()=>{});
      return res;
    }).catch(()=> caches.match(e.request).then(cached=> cached || caches.match('./index.html')))
  );
});
