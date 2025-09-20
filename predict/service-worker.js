// PERUBAHAN: Versi cache dinaikkan untuk memicu update.
// Setiap kali Anda mengubah file ini atau file yang di-cache, naikkan versinya (v3, v4, dst).
const CACHE_NAME = 'tictactoe-prediction-cache-v2';
const urlsToCache = [
  '/',
  'app.html'
];

// Event 'install': Dipicu saat service worker baru terdeteksi.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching new assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // PERUBAHAN: Memaksa service worker yang sedang menunggu untuk menjadi aktif.
        // Ini mempercepat proses update.
        return self.skipWaiting();
      })
  );
});

// Event 'fetch': Sekarang menggunakan strategi "Network falling back to Cache".
self.addEventListener('fetch', event => {
  event.respondWith(
    // 1. Coba ambil dari jaringan terlebih dahulu.
    fetch(event.request)
      .then(networkResponse => {
        // Jika berhasil, kita simpan salinannya di cache untuk penggunaan offline nanti.
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // 2. Jika jaringan gagal (offline), coba ambil dari cache.
        return caches.match(event.request);
      })
  );
});

// Event 'activate': Membersihkan cache lama dan mengambil alih kontrol.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // PERUBAHAN: Memberitahu service worker untuk segera mengontrol halaman.
      return self.clients.claim();
    }).then(() => {
      // PERUBAHAN: Kirim pesan ke semua klien (tab) yang terbuka.
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'CACHE_UPDATED' }));
      });
    })
  );
});
