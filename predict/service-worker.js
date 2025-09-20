// Setiap kali Anda mengubah file aplikasi, naikkan versi cache ini.
const CACHE_NAME = 'player-zero-cache-v3';
// Daftar file inti agar aplikasi bisa jalan offline.
// 'index.html' adalah nama file utama Anda. Sesuaikan jika perlu.
const urlsToCache = [
  '/',
  'app.html' 
];

// Event 'install': Dipicu saat service worker baru terdeteksi.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Menyimpan aset baru ke cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Memaksa service worker baru untuk aktif segera.
        return self.skipWaiting();
      })
  );
});

// Event 'fetch': Menggunakan strategi "Network Coba Dulu, Kalau Gagal Baru Cache".
self.addEventListener('fetch', event => {
  // Hanya proses permintaan GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Jika berhasil, simpan salinan di cache untuk penggunaan offline.
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Jika jaringan gagal, coba ambil dari cache.
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
            console.log('Service Worker: Menghapus cache lama', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Memberitahu service worker untuk segera mengontrol halaman.
      return self.clients.claim();
    }).then(() => {
      // Kirim pesan ke semua tab yang terbuka bahwa update telah selesai.
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'CACHE_UPDATED' }));
      });
    })
  );
});