const CACHE_NAME = 'tictactoe-prediction-cache-v1';
// Daftar file inti yang diperlukan agar aplikasi dapat berjalan offline.
const urlsToCache = [
  '/',
  'app.html'
  // Aset dari CDN seperti tailwind dan firebase akan ditangani oleh strategi network-first.
];

// Event 'install': Dipicu saat service worker pertama kali diinstal.
self.addEventListener('install', event => {
  // Menunggu hingga proses caching aset inti selesai.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Event 'fetch': Dipicu setiap kali aplikasi membuat permintaan jaringan (misalnya, meminta file, gambar, atau data).
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika permintaan ada di dalam cache, langsung kembalikan dari cache.
        if (response) {
          return response;
        }

        // Jika tidak ada di cache, coba ambil dari jaringan.
        return fetch(event.request).catch(() => {
            // Jika jaringan gagal (misalnya, offline), Anda bisa memberikan halaman fallback jika ada.
            // Untuk saat ini, biarkan saja gagal agar browser menampilkan halaman error offline standar.
        });
      })
  );
});

// Event 'activate': Dipicu setelah service worker diinstal dan siap mengambil alih.
// Ini adalah tempat yang baik untuk membersihkan cache lama.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Hapus semua cache yang tidak ada dalam whitelist.
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
