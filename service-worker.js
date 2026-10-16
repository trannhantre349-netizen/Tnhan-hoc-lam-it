/* ============================================================
   service-worker.js — PWA Nhân IT: CCNA Adventure
   Chiến lược: Cache-First (ưu tiên cache, fallback mạng).
   - install : nạp sẵn TOÀN BỘ tài nguyên game vào cache rồi skipWaiting.
   - activate: xoá cache phiên bản cũ cùng tiền tố, clients.claim().
   - fetch   : có trong cache → trả ngay (offline 100% từ lần 2);
               chưa có → tải mạng, lưu bản sao vào cache cho lần sau;
               mất mạng + là điều hướng trang → trả index.html trong cache.

   LƯU Ý QUAN TRỌNG: mỗi khi sửa nội dung file game, đổi CACHE_NAME
   (vd 'it-game-v1.1') để trình duyệt nạp lại bản mới.

   Thêm tài nguyên mới? Cập nhật cả ASSETS.js và PRECACHE bên dưới.
   ============================================================ */
const CACHE_NAME = 'it-game-v1.0';

const PRECACHE = [
  // --- vỏ ứng dụng ---
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  // --- mã nguồn ---
  './js/engine.js',
  './js/mg-art.js',
  './js/game.js',
  './js/assets.js',
  './js/reskin.js',
  './js/skins.js',
  './js/ui.js',
  // --- icon PWA ---
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  // --- nền thành phố / thế giới ---
  './assets/img/bg_city.png',
  // --- nền nội thất (isometric) + base ---
  './assets/interior_bg_revamp.png?v=1',
  './assets/img/interior_network_bg_revamp.png?v=1',
  './assets/img/interior_hardware_bg_revamp.png?v=1',
  './assets/img/interior_ccna_bg_revamp.png?v=1',
  './assets/img/interior_helpdesk_isometric.png?v=2',
  './assets/img/interior_datacenter_isometric.png?v=1',
  './assets/img/interior_isp_isometric.png?v=1',
  './assets/lunar_base_bg.png?v=1',
  // --- phố ngoài: sprite sheet đã bake (nền trong suốt thật) ---
  './assets/img/street_bg_clean.png?v=1',
  './assets/img/baked/street_assets.png?v=1',
  './assets/img/baked/street_assets_extra.png?v=1',
  './assets/img/baked/street_env_traffic.png?v=1',
  // --- nhân vật ---
  './assets/img/baked/char_player.png',
  './assets/img/baked/npc_lan.png',
  './assets/img/baked/npc_tuan.png',
  './assets/img/baked/npc_huong.png',
  './assets/img/baked/npc_duc.png',
  './assets/img/baked/npc_linh.png',
  './assets/img/baked/npc_khoa.png',
  './assets/img/baked/npc_mai.png',
  './assets/img/baked/npc_son.png',
  './assets/img/baked/ship_gen.png',
  // --- font nội bộ (Baloo 2 + JetBrains Mono, gồm subset tiếng Việt) ---
  './assets/fonts/baloo-2-devanagari.woff2',
  './assets/fonts/baloo-2-vietnamese.woff2',
  './assets/fonts/baloo-2-latin-ext.woff2',
  './assets/fonts/baloo-2-latin.woff2',
  './assets/fonts/jetbrains-mono-cyrillic-ext.woff2',
  './assets/fonts/jetbrains-mono-cyrillic.woff2',
  './assets/fonts/jetbrains-mono-greek.woff2',
  './assets/fonts/jetbrains-mono-vietnamese.woff2',
  './assets/fonts/jetbrains-mono-latin-ext.woff2',
  './assets/fonts/jetbrains-mono-latin.woff2'
];

/* ---------- install: nạp trước toàn bộ, không để 1 file lỗi chặn cả app ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => {})));
    await self.skipWaiting();
  })());
});

/* ---------- activate: dọn cache phiên bản cũ, nhận ngay quyền điều khiển ---------- */
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k.startsWith('it-game-') && k !== CACHE_NAME).map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

/* ---------- fetch: Cache-First ---------- */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // tài nguyên ngoài (nếu có) để trình duyệt tự lo

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // 1) Có trong cache → phục vụ ngay, không chạm mạng
    let hit = await cache.match(req);
    if (!hit) hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;

    // 2) Chưa có → tải mạng, đồng thời lưu bản sao cho lần sau
    try {
      const res = await fetch(req);
      if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
      return res;
    } catch (err) {
      // 3) Mất mạng: điều hướng trang thì trả index.html đã cache
      if (req.mode === 'navigate') {
        const fallback = await cache.match('./index.html') || await cache.match('./');
        if (fallback) return fallback;
      }
      throw err;
    }
  })());
});
