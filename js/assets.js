/* ============================================================
   assets.js — Manifest + bộ nạp ảnh AI-gen (chibi theme)
   Ảnh AI-gen không có kênh alpha thật, mà Chrome mở game bằng file:///
   lại cấm đọc pixel của ảnh cùng đĩa (Tainted canvas / CORS). Toàn bộ
   việc khử nền + cắt viền vì thế làm ngoại tuyến bằng:
       node tools/bake-sprites.cjs   ->  assets/img/baked/*.png
   Ở đây chỉ nạp ảnh đã trong suốt, không tạo canvas phụ, không getImageData.
   ============================================================ */
const ASSETS = {
  bg: 'assets/img/bg_city.png',
  street: 'assets/img/baked/street_assets.png?v=1',
  streetExtra: 'assets/img/baked/street_assets_extra.png?v=1',
  traffic: 'assets/img/baked/street_env_traffic.png?v=1',
  street_bg: 'assets/img/street_bg_clean.png?v=1',
  interior_bg: 'assets/interior_bg_revamp.png?v=1',
  net_bg: 'assets/img/interior_network_bg_revamp.png?v=1',
  hw_bg: 'assets/img/interior_hardware_bg_revamp.png?v=1',
  ccna_bg: 'assets/img/interior_ccna_bg_revamp.png?v=1',
  it_bg: 'assets/img/interior_helpdesk_isometric.png?v=2',
  dc_bg: 'assets/img/interior_datacenter_isometric.png?v=1',
  isp_bg: 'assets/img/interior_isp_isometric.png?v=1',
  sales_bg: 'assets/img/interior_office_wifi_isometric.png?v=1',
  noc_bg: 'assets/img/interior_noc_soc_isometric.png?v=1',
  lunar_bg: 'assets/lunar_base_bg.png?v=1',
  chars: {
    p: 'assets/img/baked/char_player.png',
    lan: 'assets/img/baked/npc_lan.png',
    tuan: 'assets/img/baked/npc_tuan.png',
    huong: 'assets/img/baked/npc_huong.png',
    duc: 'assets/img/baked/npc_duc.png',
    linh: 'assets/img/baked/npc_linh.png',
    khoa: 'assets/img/baked/npc_khoa.png',
    mai: 'assets/img/baked/npc_mai.png',
    son: 'assets/img/baked/npc_son.png',
    nam: 'assets/img/baked/npc_nam.png',
    /* Phi thuyền Khu 3 — cùng pipeline tẩy nền trắng + cắt bbox alpha */
    ship: 'assets/img/baked/ship_gen.png'
  }
};

const IMG = { bg: null, chars: {}, street: null, streetExtra: null, traffic: null, street_bg: null, interior_bg: null, net_bg: null, hw_bg: null, ccna_bg: null, it_bg: null, dc_bg: null, isp_bg: null, sales_bg: null, noc_bg: null, lunar_bg: null };
let assetsReady = false;

/* ============================================================
   SPRITE SHEET ĐƯỜNG PHỐ (baked/street_assets.png + baked/street_assets_extra.png — 1024x572)
   Ảnh nguồn AI-gen nền trắng #FFFFFF; tools/bake-sprites.cjs flood-fill
   từ mép ngoài ảnh để tẩy nền (pixel r,g,b > 240 → alpha = 0) và ghi ra
   PNG có alpha thật, nên tuyết trên ngọn thông, sọc bạt tiệm tạp hoá và
   chữ trên biển hiệu vẫn còn nguyên (chúng không thông với mép ảnh).
   Bảng SHEET lưu tọa độ cắt (x, y, w, h) — dò theo bbox vùng không trắng.
   Ô mặc định lấy từ sheet chính; ô đánh dấu extra: 1 thuộc sheet phụ;
   ô có sheet: 'traffic' thuộc sheet xe cộ / đám đông / đồ đường (2400x1792).
   Ô đánh dấu pocket: cần tẩy cả mảng trắng kín trong ô (bầu trời bị khung
   giàn giáo / dây điện khoanh lại, khoảng hở giữa các song hàng rào) —
   script bake đọc đúng bảng này.
   ============================================================ */
const SHEET = {
  // --- hàng trên: 3 toà nhà ---
  hoa:        { x: 81,  y: 21,  w: 208, h: 198 },  // Nhà Chị Hoa (nhà cam)
  tuan:       { x: 385, y: 25,  w: 242, h: 194 },  // Tạp hoá Anh Tuấn
  mai:        { x: 731, y: 21,  w: 232, h: 194 },  // Văn phòng Cô Mai
  // --- dải đường nhựa (lặp tile) — inset sâu để bỏ mép AA chuyển màu, chống hở nối ---
  road:       { x: 44,  y: 452, w: 743, h: 92 },
  // --- cây thông ---
  pineL:      { x: 43,  y: 261, w: 104, h: 152 },  // thông xanh lớn
  pineM:      { x: 157, y: 279, w: 88,  h: 134 },  // thông xanh vừa
  pineSnowL:  { x: 273, y: 261, w: 102, h: 152 },  // thông tuyết lớn
  pineSnowM:  { x: 389, y: 279, w: 88,  h: 132 },  // thông tuyết vừa
  // --- cột đèn / cột điện ---
  lampDouble: { x: 509, y: 271, w: 76,  h: 142 },  // đèn đôi cổ điển
  lampPost:   { x: 617, y: 271, w: 44,  h: 142 },  // đèn cong đơn
  poleUtil:   { x: 697, y: 251, w: 176, h: 162, pocket: 1 },  // cặp cột điện gỗ có dây (vùng trắng kín giữa 2 cột = nền)
  // --- bụi cây / biển báo ---
  bushBig:    { x: 867, y: 367, w: 58,  h: 46 },
  bushSmall:  { x: 937, y: 375, w: 44,  h: 34 },
  bushRound:  { x: 939, y: 487, w: 54,  h: 46 },
  signCity:   { x: 813, y: 461, w: 120, h: 72 },   // biển "VỀ THÀNH PHỐ"
  // --- 6 căn nhà còn lại (street_assets_extra.png) ---
  kho_dung:    { x: 36,  y: 56,  w: 325, h: 204, extra: 1 },  // Kho Anh Dũng
  cong_trinh:  { x: 407, y: 50,  w: 248, h: 210, extra: 1, pocket: 1 },  // khung giàn giáo + bạt khoanh kín nền trời
  lap_rap:     { x: 719, y: 53,  w: 253, h: 197, extra: 1 },  // Lắp Ráp Mô Hình PC
  quan_net:    { x: 68,  y: 321, w: 271, h: 229, extra: 1 },  // Quán Net Anh Ba
  server_mini: { x: 413, y: 316, w: 232, h: 234, extra: 1 },  // Server Mini Công Ty
  tiem_sua:    { x: 704, y: 321, w: 288, h: 229, extra: 1, pocket: 1 },   // Tiệm Sửa Máy (khe nền sau giá/biển phụ)

  /* ===== sheet street_env_traffic.png (2400x1792): xe cộ, tai nạn, đám đông, đồ đường ===== */
  // --- phương tiện (hàng 1-2) ---
  car_orange:    { x: 58,   y: 60,  w: 303, h: 218, sheet: 'traffic' },
  car_yellow:    { x: 408,  y: 72,  w: 346, h: 207, sheet: 'traffic' },
  truck_small:   { x: 798,  y: 48,  w: 379, h: 230, sheet: 'traffic' },   // ben xám
  pickup_blue:   { x: 1221, y: 61,  w: 392, h: 217, sheet: 'traffic' },
  moto_black:    { x: 1679, y: 100, w: 208, h: 185, sheet: 'traffic' },   // xe số xanh đen
  moto_red:      { x: 80,   y: 326, w: 264, h: 212, sheet: 'traffic' },   // tay ga đỏ
  moto_red_b:    { x: 1290, y: 335, w: 240, h: 203, sheet: 'traffic' },
  moto_blue:     { x: 1585, y: 369, w: 245, h: 170, sheet: 'traffic' },   // tay ga xanh
  van_beige:     { x: 1935, y: 41,  w: 408, h: 238, sheet: 'traffic' },
  van_blue:      { x: 830,  y: 307, w: 376, h: 231, sheet: 'traffic' },
  van_green:     { x: 408,  y: 315, w: 353, h: 223, sheet: 'traffic' },
  bicycle:       { x: 1879, y: 303, w: 208, h: 235, sheet: 'traffic' },   // người đạp xe, mũ xanh
  bicycle_b:     { x: 2141, y: 301, w: 202, h: 237, sheet: 'traffic' },   // người đạp xe, mũ đỏ
  // --- hiện trường tai nạn ---
  car_crashed_blue:  { x: 57,  y: 585, w: 420, h: 301, sheet: 'traffic' },  // xe con xanh nghiêng, xước thân
  moto_crashed_red:  { x: 505, y: 640, w: 332, h: 217, sheet: 'traffic' },  // xe đỏ đổ, mảnh vụn
  cone_orange:       { x: 888, y: 696, w: 138, h: 155, sheet: 'traffic' },
  barrier_stripe:    { x: 1386, y: 620, w: 287, h: 244, sheet: 'traffic' }, // rào sọc đỏ-trắng, 1 đèn
  barrier_orange:    { x: 1714, y: 619, w: 295, h: 243, sheet: 'traffic' }, // rào sọc cam, 2 đèn
  barrier_stripe_b:  { x: 2130, y: 1572, w: 226, h: 203, sheet: 'traffic' },
  sign_warning:      { x: 2063, y: 604, w: 137, h: 253, sheet: 'traffic' }, // biển tam giác "!"
  sign_no_left:      { x: 2221, y: 604, w: 124, h: 253, sheet: 'traffic' }, // biển tròn cấm rẽ trái
  sign_no_left_b:    { x: 1961, y: 1361, w: 101, h: 241, sheet: 'traffic' },
  // --- đám đông ---
  cop_hand:    { x: 56,   y: 940, w: 198, h: 329, sheet: 'traffic' },   // công an giơ tay
  npc_point_1: { x: 379,  y: 940, w: 190, h: 329, sheet: 'traffic' },   // áo xanh lá, chỉ tay
  npc_point_2: { x: 1188, y: 950, w: 139, h: 319, sheet: 'traffic' },   // nữ sinh giơ tay
  npc_scared:  { x: 1947, y: 948, w: 132, h: 321, sheet: 'traffic' },   // ôm mặt, hoảng
  npc_arms:    { x: 695,  y: 947, w: 130, h: 322, sheet: 'traffic' },   // khoanh tay
  npc_think:   { x: 1701, y: 947, w: 126, h: 322, sheet: 'traffic' },   // sờ cằm
  npc_teen:    { x: 945,  y: 946, w: 131, h: 323, sheet: 'traffic' },   // cậu bé áo xanh
  npc_worried: { x: 1442, y: 951, w: 141, h: 318, sheet: 'traffic' },   // nữ sinh lo lắng
  npc_phone:   { x: 2188, y: 952, w: 155, h: 317, sheet: 'traffic' },   // vừa đi vừa gọi
  // --- đồ đường ---
  pole_wire:    { x: 1209, y: 1341, w: 453, h: 423, sheet: 'traffic', pocket: 1 }, // cặp cột + dây võng (kẽ kín nền trời)
  lamp_post:    { x: 1705, y: 1358, w: 199, h: 408, sheet: 'traffic' },            // đèn đôi sáng vàng
  guardrail:    { x: 526,  y: 1370, w: 612, h: 101, sheet: 'traffic' },            // hộ lan kim loại
  fence_picket: { x: 49,   y: 1372, w: 435, h: 198, sheet: 'traffic', pocket: 1 }, // rào mũi giáo
  fence_iron:   { x: 517,  y: 1621, w: 631, h: 144, sheet: 'traffic', pocket: 1 }, // rào sắt lưới
  fence_iron_s: { x: 55,   y: 1602, w: 386, h: 163, sheet: 'traffic', pocket: 1 },
  pot_flowers:  { x: 2247, y: 1415, w: 103, h: 133, sheet: 'traffic' },
  pot_bush:     { x: 2092, y: 1419, w: 126, h: 132, sheet: 'traffic' },
  bush:         { x: 1890, y: 1621, w: 179, h: 145, sheet: 'traffic' }
};

/* Vẽ 1 món cắt từ sheet vào (dx, dy, dw, dh). Trả false nếu sheet chưa nạp. */
function sheetSrc(s) { return s && IMG[s.sheet || (s.extra ? 'streetExtra' : 'street')]; }
function sheetDraw(g, key, dx, dy, dw, dh) {
  const s = SHEET[key], src = sheetSrc(s);
  if (!s || !src) return false;
  g.drawImage(src, s.x, s.y, s.w, s.h, dx, dy, dw, dh);
  return true;
}
/* Chiều cao tương ứng khi kéo rộng dw (giữ tỉ lệ gốc) */
function sheetH(key, dw) { const s = SHEET[key]; return s ? dw * s.h / s.w : 0; }
/* Chiều rộng tương ứng khi đặt cao dh */
function sheetW(key, dh) { const s = SHEET[key]; return s ? dh * s.w / s.h : 0; }

function loadOne(src) {
  return new Promise(res => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => { console.warn('[assets] không nạp được ' + src + ' — chạy bản vẽ vector.'); res(null); };
    im.src = src;
  });
}

(function preloadAssets() {
  const jobs = [];
  jobs.push(loadOne(ASSETS.bg).then(im => { IMG.bg = im; }));
  jobs.push(loadOne(ASSETS.street).then(im => { IMG.street = im; }));
  jobs.push(loadOne(ASSETS.streetExtra).then(im => { IMG.streetExtra = im; }));
  jobs.push(loadOne(ASSETS.traffic).then(im => { IMG.traffic = im; }));
  jobs.push(loadOne(ASSETS.street_bg).then(im => { IMG.street_bg = im; }));
  jobs.push(loadOne(ASSETS.interior_bg).then(im => { IMG.interior_bg = im; }));
  jobs.push(loadOne(ASSETS.net_bg).then(im => { IMG.net_bg = im; }));
  jobs.push(loadOne(ASSETS.hw_bg).then(im => { IMG.hw_bg = im; }));
  jobs.push(loadOne(ASSETS.ccna_bg).then(im => { IMG.ccna_bg = im; }));
  jobs.push(loadOne(ASSETS.it_bg).then(im => { IMG.it_bg = im; }));
  jobs.push(loadOne(ASSETS.dc_bg).then(im => { IMG.dc_bg = im; }));
  jobs.push(loadOne(ASSETS.isp_bg).then(im => { IMG.isp_bg = im; }));
  jobs.push(loadOne(ASSETS.sales_bg).then(im => { IMG.sales_bg = im; }));
  jobs.push(loadOne(ASSETS.noc_bg).then(im => { IMG.noc_bg = im; }));
  jobs.push(loadOne(ASSETS.lunar_bg).then(im => { IMG.lunar_bg = im; }));

  Object.entries(ASSETS.chars).forEach(([k, src]) => {
    jobs.push(loadOne(src).then(im => { IMG.chars[k] = im; }));
  });
  Promise.all(jobs).then(() => {
    assetsReady = true;
    // Nền đã có -> dựng lại background thế giới bằng ảnh AI
    try { if (typeof buildWorldBG === 'function') buildWorldBG(); } catch (e) {}
    try { if (typeof renderHudAvatar === 'function') renderHudAvatar(); } catch (e) {}
  });
})();
