/* ============================================================
   js/hell.js — V36 · KHU 6: ĐỊA NGỤC TRẦN NHÂN
   ------------------------------------------------------------
   ADD-ONLY: một Scene thật tên 'HELL' (đi theo đúng lối Khu 4 Thiên Đàng
   và Khu 5 Thánh Đường — engine không phải sửa một dòng nào). Mọi kết nối
   với code cũ đều là BỌC HÀM (const _old = fn; fn = function(){...}), và
   mọi lời gọi xuyên file đều guard `typeof` vì engine.js gọi update() ngay
   lúc parse, khi các file khác chưa tồn tại.

   Ba nguồn ảnh mới đã tách nền bằng tools/bake-hell.cjs:
     baked/hell_demon_sheet.png  750x356, ô 150x178 — LƯỚI TRÙNG SHEET NGƯỜI
                                 (hàng 0 Quỷ Nam, hàng 1 Quỷ Nữ) nên skins.js
                                 chỉ cần đổi ảnh + đổi hàng, 5 góc xoay/bước
                                 đi, cỡ người, đường chân đều giữ nguyên.
     baked/hell_npcs.png         1024x572, ô 256x286, neo đáy dòng 278.
     baked/hell_bg.png           1024x572 nền hang lửa, ghép LẬT GƯƠNG 3 bản.

   Địa hình: đại lộ 2500px, camera cuộn _camX chung cơ chế với STREET/Khu 5.
   Khung nhìn rộng theo máy (960 → 2000) nhờ bọc vsLogicalW() — xem mục 14.
   ============================================================ */

/* ---------- 1. HÌNH HỌC ---------- */
const HL_MAP_W = 2500;
const HL_VIEW_H = 600;
let HL_VIEW_W = 960;
let HL_CAM_MAX = HL_MAP_W - HL_VIEW_W;
let HL_TW = 1076, HL_PROM_W = 3228;          // bề rộng một bản + bề dài dải nền
const HL_PROM_MIN_W = 3228;                  // 3 bản × 1076, chẵn để bản cuối không cụt

/* Dải đi bộ. Ảnh 572px → 600px (×1.049): mặt sàn đá gặp chân tường ở y≈491,
   mép dưới ảnh 600. ĐIỂM CHÂN đi được kẹp 500..578 — chừa 22px dưới đáy để
   sprite không bao giờ bị cắt chân. */
const HL_FEET_TOP = 500, HL_FEET_BOT = 578;
SCENE_WALK.HELL = { minY: HL_FEET_TOP - 30, maxY: HL_FEET_BOT - 30, spawnY: HL_FEET_TOP - 30 + 34 };
const HL_X0 = 26, HL_X1 = HL_MAP_W - 34;
const HL_SPAWN = { x: 150, y: 540 };         // y = ĐIỂM CHÂN lúc mới rơi xuống

/* Lưới sheet NPC (đo bằng tools/bake-hell.cjs 2026-11-12). */
const HL_NW = 256, HL_NC = 286, HL_NFOOT = 278;
const HL_CELL = { ghost_a: [0, 0], ghost_b: [1, 0], imp_a: [2, 0], imp_b: [3, 0],
                  king_a: [0, 1], king_b: [1, 1], pot_a: [2, 1], pot_b: [3, 1] };

/* Cổng KHE NỨT nằm ở CUỐI PHỐ NGOÀI (STREET), không nằm ở Khu Trung Tâm.
   x là toạ độ THẾ GIỚI của phố (dài 2880), y = ĐIỂM CHÂN trên vỉa hè (312).
   Chọn 2620 vì nó lọt giữa hai căn nhà 2470 và 2790 — cả hai đều nhường
   [E] trong bán kính 70px nên nhãn của cổng không bao giờ bị nuốt. */
const HL_GATE = { x: 2620, y: 312, r: 62 };
/* Lõi cổng: đứng trong vòng này thì [E] LUÔN là khe nứt. Đi bộ lang thang trên
   phố hay dừng ngay trước cửa (dải chat của họ phủ 2540→2660), mà cửa để người
   chơi đi xuống Địa Ngục thì không thể để một NPC che mất được. */
const HL_GATE_CORE = 44;

/* Các trạm trong Khu 6 — x là THẾ GIỚI, y là ĐIỂM CHÂN.
   pk = khoá vẽ: đặt CAO hơn mép trên dải đi bộ để nhân vật không bao giờ bị
   trạm che mất (bài học Khu 5). */
const HL_PORTAL = { x: 120, y: 540, r: 54, pk: 472 };
const HL_POT = { x: 1150, y: 536, r: 60, pk: 474 };
const HL_KING = { x: 2250, y: 534, r: 66, pk: 470 };
/* Ba Hồn Ma Trơi: bay LƠ LƯNG XUYÊN VẬT CẢN — hoàn toàn không có va chạm,
   không có [E] để không cướp nút của vạc/quỷ vương. */
const HL_GHOSTS = [{ x: 420, y: 452, ph: 0.0 }, { x: 1010, y: 428, ph: 2.1 }, { x: 1760, y: 462, ph: 4.4 }];
/* Hai Tiểu Quỷ cầm đinh ba tuần tra đúng hai đoạn người chơi yêu cầu.
   loot = số lần còn rớt đồ trong một lượt vào cảnh (chống farm vô hạn). */
const HL_IMPS = [{ lo: 500, hi: 950, x: 700, y: 548, dir: 1, spd: .85, flee: 0, loot: 2 },
                 { lo: 1350, hi: 1800, x: 1560, y: 548, dir: 1, spd: .85, flee: 0, loot: 2 }];

const HL_FADE = 900;
/* Chống kẹt tư thế (đúng bộ số Khu 5 V34): 0.4s hồi sau khi đứng dậy để cú
   bấm đó không rơi lại vào tư thế, 0.25s khoá vào/trả để ESC không bị nuốt. */
const HL_EXIT_CD = .4, HL_ENTER_CD = .25, HL_JOY_R = 10;
const HL_BOW_MS = 2200;                      // Quỷ Vương phán xét trong 2.2s

/* Lời phán xét của Quỷ Vương — dân IT đọc là cười, không cần dịch. */
const HL_JUDGE = [
  'Ticket của ngươi chưa đóng mà đã xuống đây. Về bấm đóng lại.',
  'Ngươi tắt server không báo trước. Đó là nghiệp.',
  'Ta đã xem commit "fix fix fix" của ngươi. Lửa ở đây còn nhẹ.',
  'Vòng lặp vô hạn của ngươi là một tác phẩm nghệ thuật. Ở lại mà xem.',
  'Ngươi đổ lỗi cho DNS. Dưới này DNS cũng đổ lỗi lại ngươi.',
  'Cat8 bấm đầu B mà chân 4-5 đấu chéo. Trăm năm không lên được tốc.',
  'Ngươi để 47 tab Chrome mở. Đây là nhà mới của ngươi.',
  'Stack Overflow tha thứ cho ngươi. Ta thì chưa.',
  'Ping 3ms mà kêu lag. Ngươi xuống đây để học cách kiên nhẫn.'
];

/* ---------- 2. TRẠNG THÁI ---------- */
let HL_CUT = null;
const HL_ST = { st: '', kx: 0, ky: 0, t0: 0, exitCd: 0, enterCd: 0,
                aura: 0, last: 0 };
const HL_EMB = [];                           // tàn lửa dưới chân + tia lửa vạc

/* Cờ hoàn thành là boolean của file save → PHẢI khai ở STAGE_IDS, nếu không
   applySave() sẽ xoá sạch khi nạp (bài học Khu 4). */
if (typeof STAGE_IDS !== 'undefined' && STAGE_IDS) STAGE_IDS.hell_king = 1;
if (!S.missionsDone) S.missionsDone = {};
if (!('hell_king' in S.missionsDone)) S.missionsDone.hell_king = false;

/* ---------- 3. TIỆN ÍCH ---------- */
function hlWx() { return S.p.x + 10 + (window._camX || 0); }
function hlKx() {
  try { if (typeof VS !== 'undefined' && VS && typeof VS.kx === 'function') return VS.kx() || 1; } catch (e) {}
  return 1;
}
function hlBackW() {
  try { if (typeof VS !== 'undefined' && VS && typeof VS.backW === 'function') return VS.backW() || 960; } catch (e) {}
  return 960;
}
function hlImg(k) { return (typeof IMG !== 'undefined' && IMG && IMG[k]) || null; }
function hlCv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function hlJoyDrag() {
  try {
    const j = window.joy;
    return !!j && j.active && (Math.abs(j.dx) > HL_JOY_R || Math.abs(j.dy) > HL_JOY_R);
  } catch (e) { return false; }
}
/* Phối cảnh nhẹ: càng sát mép dưới càng to, như Khu 5. */
function hlScale(fy) {
  const u = Math.max(0, Math.min(1, (fy - HL_FEET_TOP) / (HL_FEET_BOT - HL_FEET_TOP)));
  return .92 + .08 * u;
}

/* Vẽ một ô của sheet NPC: cao `h` pixel màn hình, ĐƯỜNG CHÂN tại feetY.
   HL_NFOOT được đưa về đúng feetY nên mọi loại (ma, quỷ, vạc) cùng đứng
   trên một mặt sàn, không loại nào chìm hay nổi. */
function hlNpc(cell, wx, feetY, h, flip, alpha) {
  const im = hlImg('hellNpcs');
  if (!im || !im.width || !HL_CELL[cell]) return false;
  const c = HL_CELL[cell][0], r = HL_CELL[cell][1];
  const k = h / HL_NC, dw = HL_NW * k, dh = HL_NC * k;
  ctx.save();
  if (alpha != null) ctx.globalAlpha = alpha;
  try { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; } catch (e) {}
  if (flip) { ctx.translate(wx, 0); ctx.scale(-1, 1); ctx.translate(-wx, 0); }
  ctx.drawImage(im, c * HL_NW, r * HL_NC, HL_NW, HL_NC, wx - dw / 2, feetY - HL_NFOOT * k, dw, dh);
  ctx.restore();
  return true;
}

/* ---------- 4. KHUNG NHÌN + CAMERA ---------- */
/* Widescreen gọi gián tiếp qua hlSyncView() mỗi frame (không sửa file nào). */
function hlSetView(w) {
  const hi = (typeof VS !== 'undefined' && VS && VS.maxW) || 2000;
  const vw = Math.max(960, Math.min(hi, Math.round(w || 960)));
  if (vw === HL_VIEW_W) return;
  HL_VIEW_W = vw;
  HL_CAM_MAX = HL_MAP_W - HL_VIEW_W;
  HL_LAY = null;
  window._camX = Math.max(0, Math.min(HL_CAM_MAX, window._camX || 0));
  if (S && S.scene === 'HELL') S.p.x = Math.max(15, Math.min(vw - 35, S.p.x));
}
function hlSyncView() {
  hlHookLW();
  hlSetView(hlBackW());
}
/* Edge-scroll y HỆT STREET/Khu 5: chạy SAU engine.update, position đã chốt. */
function hlCamStep() {
  let cam = window._camX || 0;
  const push = HL_VIEW_W - 340;
  if (S.p.x > push) { const d = Math.min(S.p.x - push, HL_CAM_MAX - cam); cam += d; S.p.x -= d; }
  if (S.p.x < 300) { const d = Math.min(300 - S.p.x, cam); cam -= d; S.p.x += d; }
  window._camX = Math.max(0, Math.min(HL_CAM_MAX, cam));
}

/* ---------- 5. NỀN GHÉP LẬT GƯƠNG (DỰNG MỘT LẦN) ---------- */
/* Bề rộng một bản theo TỈ LỆ ẢNH THẬT, cao đúng 600 khung hình. */
function hlPromSize(im) {
  if (im) {
    const W = im.naturalWidth || im.width, H = im.naturalHeight || im.height;
    HL_TW = Math.max(64, Math.round(HL_VIEW_H * W / H));
  } else HL_TW = 1076;
  HL_PROM_W = Math.max(HL_PROM_MIN_W, Math.ceil(HL_MAP_W / HL_TW) * HL_TW);
}
/* thuận – lật – thuận: bản lẻ được lật NGANG, nên mép phải bản thuận áp vào
   mép phải bản lật — hai cột pixel cuối trùng nhau từng chút một, đường ghép
   biến mất mà không cần pha màu (và không cần đọc pixel lúc chạy). */
function hlPromArt(g, im) {
  const W = im.naturalWidth || im.width, H = im.naturalHeight || im.height;
  for (let k = 0; k * HL_TW < HL_PROM_W; k++) {
    const x = k * HL_TW;
    if (k % 2) {
      g.save(); g.translate(x + HL_TW, 0); g.scale(-1, 1);
      g.drawImage(im, 0, 0, W, H, 0, 0, HL_TW, HL_VIEW_H);
      g.restore();
    } else g.drawImage(im, 0, 0, W, H, x, 0, HL_TW, HL_VIEW_H);
  }
}
/* Không ảnh (404 / chưa kịp nạp) → hang lửa vector cùng hình học để hitbox
   và các trạm vẫn đứng đúng chỗ. */
function hlPromFallback(g) {
  const wall = g.createLinearGradient(0, 0, 0, 470);
  wall.addColorStop(0, '#0d0503'); wall.addColorStop(.5, '#3a1108'); wall.addColorStop(1, '#6b1e08');
  g.fillStyle = wall; g.fillRect(0, 0, HL_PROM_W, 470);
  const fl = g.createLinearGradient(0, 470, 0, HL_VIEW_H);
  fl.addColorStop(0, '#4a1a08'); fl.addColorStop(.4, '#2a1008'); fl.addColorStop(1, '#1a0b06');
  g.fillStyle = fl; g.fillRect(0, 470, HL_PROM_W, HL_VIEW_H - 470);
  for (let x = 180; x < HL_PROM_W; x += 420) {
    const q = g.createLinearGradient(0, 0, 0, 470);
    q.addColorStop(0, 'rgba(255,120,40,0)'); q.addColorStop(.55, 'rgba(255,110,30,.35)');
    q.addColorStop(1, 'rgba(255,170,60,.75)');
    g.fillStyle = q; g.fillRect(x - 5, 40, 10, 430);
  }
}
let HL_PROM = null, HL_PROM_KEY = '';
function hlProm() {
  const im = hlImg('hellBg');
  const iw = im ? (im.naturalWidth || im.width || 0) : 0;
  const key = iw > 1 ? iw + 'x' + (im.naturalHeight || im.height) : 'fb';
  if (HL_PROM && HL_PROM_KEY === key) return HL_PROM;
  hlPromSize(iw > 1 ? im : null);
  const cv2 = hlCv(HL_PROM_W, HL_VIEW_H), g = cv2.getContext('2d');
  g.fillStyle = '#0d0503'; g.fillRect(0, 0, HL_PROM_W, HL_VIEW_H);
  if (iw > 1) hlPromArt(g, im); else hlPromFallback(g);
  /* Tối bớt một chút để quầng lửa vẽ sau nổi lên, và để chân nhân vật không
     chìm vào nền (ảnh gốc đã rất rực). */
  g.fillStyle = 'rgba(14,4,2,.22)'; g.fillRect(0, 0, HL_PROM_W, HL_VIEW_H);
  HL_PROM = cv2; HL_PROM_KEY = key;
  HL_LAY = null;
  return HL_PROM;
}

/* ---------- 6. VIGNETTE CACHE ---------- */
let HL_LAY = null;
function hlLayers() {
  if (HL_LAY) return HL_LAY;
  const v = hlCv(HL_VIEW_W, HL_VIEW_H), g = v.getContext('2d');
  const q = g.createRadialGradient(HL_VIEW_W / 2, 300, 180, HL_VIEW_W / 2, 300, HL_VIEW_W * .72);
  q.addColorStop(0, 'rgba(0,0,0,0)'); q.addColorStop(.62, 'rgba(20,4,2,.18)');
  q.addColorStop(1, 'rgba(24,4,2,.62)');
  g.fillStyle = q; g.fillRect(0, 0, HL_VIEW_W, HL_VIEW_H);
  HL_LAY = v;
  return HL_LAY;
}

/* ---------- 7. TÀN LỬA ---------- */
function hlEmber(wx, wy, hot) {
  if (HL_EMB.length > 220) HL_EMB.shift();
  HL_EMB.push({ x: wx, y: wy, vx: (Math.random() - .5) * .7,
    vy: -(0.5 + Math.random() * 1.1) * (hot ? 1.5 : 1),
    r: 1 + Math.random() * 1.8, life: 1, hot: hot ? 1 : 0 });
}
function hlEmbStep(dt) {
  const k = Math.min(3, dt * 60);
  for (let i = HL_EMB.length - 1; i >= 0; i--) {
    const e = HL_EMB[i];
    e.x += e.vx * k; e.y += e.vy * k; e.vy -= .006 * k;
    e.life -= (e.hot ? .012 : .02) * k;
    if (e.life <= 0) HL_EMB.splice(i, 1);
  }
}
function hlEmbDraw(g) {
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < HL_EMB.length; i++) {
    const e = HL_EMB[i], a = Math.max(0, Math.min(1, e.life));
    g.fillStyle = e.hot ? 'rgba(255,196,96,' + (a * .9).toFixed(3) + ')'
                        : 'rgba(255,124,44,' + (a * .75).toFixed(3) + ')';
    g.beginPath(); g.arc(e.x, e.y, e.r * (.5 + a * .8), 0, 6.2832); g.fill();
  }
  g.restore();
}

/* ---------- 8. VẼ TRẠM ---------- */
/* Cổng VỀ: vòm sáng xanh lạnh — đối lập với lửa đỏ của cả khu nên ngón cái
   tìm thấy ngay, và người chơi hiểu "đây là lối ra". */
function hlPortalDraw(g, x, y, t) {
  const w = 62, h = 96;
  g.save();
  if (typeof hvGlow === 'function')
    hvGlow(g, x, y - 44, 92, '150,220,255', .16 + .05 * Math.sin(t * 2.2));
  const q = g.createLinearGradient(0, y - h, 0, y);
  q.addColorStop(0, 'rgba(196,236,255,.16)'); q.addColorStop(.55, 'rgba(150,220,255,.42)');
  q.addColorStop(1, 'rgba(220,244,255,.72)');
  g.fillStyle = q;
  g.beginPath();
  g.moveTo(x - w / 2, y); g.lineTo(x - w / 2, y - h * .62);
  g.quadraticCurveTo(x, y - h * 1.16, x + w / 2, y - h * .62);
  g.lineTo(x + w / 2, y); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(240,250,255,.75)'; g.lineWidth = 2.4;
  g.stroke();
  g.fillStyle = 'rgba(24,34,44,.72)';
  g.font = '700 11px ' + (typeof IZF !== 'undefined' ? IZF : 'sans-serif');
  g.textAlign = 'center';
  g.fillText('🚪 VỀ PHỐ', x, y - h - 8);
  g.textAlign = 'left';
  g.restore();
}
/* Khe nứt rực lửa — dùng cho cả cổng vào ở Phố Ngoài lẫn điểm nhấn cuối Khu 6 */
function hlRiftDraw(g, x, feetY, hgt, t, label) {
  const w = hgt * .52;
  g.save();
  if (typeof hvGlow === 'function') {
    hvGlow(g, x, feetY - hgt * .5, hgt * .95, '255,110,30', .2 + .05 * Math.sin(t * 1.7));
    hvGlow(g, x, feetY - 6, hgt * .5, '255,180,70', .16 + .05 * Math.sin(t * 3.1));
  }
  /* thân khe: đường gấp khúc rộng giữa, thắt hai đầu */
  const pts = [[0, -1], [-.16, -.82], [.1, -.6], [-.12, -.4], [.14, -.2], [-.02, 0]];
  g.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const px = x + pts[i][0] * w, py = feetY + pts[i][1] * hgt;
    if (i) g.lineTo(px, py); else g.moveTo(px, py);
  }
  for (let i = pts.length - 1; i >= 0; i--) {
    const px = x + w * .3 + pts[i][0] * w * .6, py = feetY + pts[i][1] * hgt;
    g.lineTo(px, py);
  }
  g.closePath();
  const q = g.createLinearGradient(0, feetY - hgt, 0, feetY);
  q.addColorStop(0, 'rgba(255,236,170,.95)'); q.addColorStop(.45, 'rgba(255,140,40,.92)');
  q.addColorStop(1, 'rgba(180,40,10,.9)');
  g.fillStyle = q; g.fill();
  g.strokeStyle = 'rgba(40,8,4,.85)'; g.lineWidth = 2.2; g.stroke();
  /* mép đá cháy xém hai bên */
  g.fillStyle = 'rgba(20,8,6,.55)';
  g.beginPath(); g.ellipse(x, feetY + 3, w * .82, 7, 0, 0, 6.2832); g.fill();
  if (label) {
    g.font = '700 11px ' + (typeof IZF !== 'undefined' ? IZF : 'sans-serif');
    g.textAlign = 'center';
    g.lineWidth = 3.4; g.strokeStyle = 'rgba(0,0,0,.8)';
    g.strokeText(label, x, feetY - hgt - 10);
    g.fillStyle = 'rgba(255,226,170,.95)';
    g.fillText(label, x, feetY - hgt - 10);
    g.textAlign = 'left';
  }
  g.restore();
}

/* ---------- 9. TICK ---------- */
function hlGhostTick(dt, now) {
  const k = Math.min(3, dt * 60), t = now / 1000;
  for (let i = 0; i < HL_GHOSTS.length; i++) {
    const gh = HL_GHOSTS[i];
    /* bay ngang qua mọi thứ: chỉ cộng dồn vị trí, KHÔNG hề đụng va chạm */
    gh.x += Math.cos(t * .32 + gh.ph) * .55 * k;
    if (gh.x < 200) gh.x = 200; if (gh.x > HL_MAP_W - 200) gh.x = HL_MAP_W - 200;
    gh.y = 452 - 26 * Math.abs(Math.sin(t * .9 + gh.ph));
  }
}
function hlImpTick(dt) {
  const k = Math.min(3, dt * 60);
  for (let i = 0; i < HL_IMPS.length; i++) {
    const im = HL_IMPS[i];
    if (im.flee > 0) {
      im.flee = Math.max(0, im.flee - dt);
      im.x += im.dir * 3.4 * k;                 // giật mình: chạy bán sống bán chết
      if (im.x < HL_X0 + 40) { im.x = HL_X0 + 40; im.dir = 1; }
      if (im.x > HL_X1 - 40) { im.x = HL_X1 - 40; im.dir = -1; }
      if (Math.random() < dt * 14) hlEmber(im.x, im.y - 6, false);
      if (im.flee === 0) im.spd = .85;
      continue;
    }
    im.x += im.dir * im.spd * k;
    if (im.x <= im.lo) { im.x = im.lo; im.dir = 1; }
    if (im.x >= im.hi) { im.x = im.hi; im.dir = -1; }
  }
}
function hlAuraTick(dt) {
  if (HL_ST.aura > 0) {
    HL_ST.aura = Math.max(0, HL_ST.aura - dt / 14);
    if (Math.random() < dt * 9)
      hlEmber(hlWx() + (Math.random() - .5) * 26, S.p.y + 30 - Math.random() * 30, true);
  }
}
/* Tư thế cúi lạy tự kết thúc sau HL_BOW_MS — người chơi không cần bấm gì thêm. */
function hlBowTick(now) {
  if (HL_ST.st !== 'bow') return;
  if (now - HL_ST.t0 >= HL_BOW_MS) hlBowEnd();
}

/* ---------- 10. TƯƠNG TÁC ---------- */
function hlAbsorb() {
  HL_ST.aura = 1;
  for (let i = 0; i < 46; i++)
    hlEmber(HL_POT.x + (Math.random() - .5) * 60, HL_POT.y - 20 - Math.random() * 70, true);
  for (let i = 0; i < 26; i++)
    hlEmber(hlWx() + (Math.random() - .5) * 30, S.p.y + 30 - Math.random() * 46, true);
  if (typeof sfxPlay === 'function') { sfxPlay('pop', .8); }
  if (typeof chord === 'function') chord([196, 262, 330]);
  if (typeof showBanner === 'function')
    showBanner('KHU 6 · ĐỊA NGỤC TRẦN NHÂN', '🔥 Hấp Thụ Hỏa Khí',
      'Lửa chạy trong máu — tàn lửa bay dưới chân một lúc', 'red');
}
function hlAudience() {
  HL_ST.st = 'bow'; HL_ST.t0 = performance.now();
  HL_ST.kx = S.p.x; HL_ST.ky = S.p.y; HL_ST.enterCd = HL_ENTER_CD;
  S.p.moving = false;
  if (typeof sfxPlay === 'function') sfxPlay('pop', .6);
  if (typeof chord === 'function') chord([147, 196, 233]);
}
function hlBowEnd() {
  if (HL_ST.st !== 'bow') return false;
  HL_ST.st = '';
  HL_ST.exitCd = HL_EXIT_CD;
  const line = HL_JUDGE[Math.floor(Math.random() * HL_JUDGE.length)];
  const first = !S.missionsDone.hell_king;
  if (first) {
    S.missionsDone.hell_king = true;
    if (typeof addXP === 'function') addXP(30);
    if (typeof showBanner === 'function')
      showBanner('QUỶ VƯƠNG TRẦN NHÂN PHÁN XÉT', '「' + line + '」',
        '🩸 Buff Huyết Quỷ Vương · +30 EXP', 'red');
  } else if (typeof showBanner === 'function') {
    showBanner('QUỶ VƯƠNG TRẦN NHÂN PHÁN XÉT', '「' + line + '」',
      'Phần thưởng đã nhận rồi — lần sau xuống đây chơi', 'red');
  }
  if (typeof syncHUD === 'function') { try { syncHUD(); } catch (e) {} }
  return true;
}
/* Click/ chạm vào Tiểu Quỷ: giật mình bỏ chạy, rớt Coin + XP. */
function hlStartle(im) {
  if (im.flee > 0) return;
  im.flee = 1.5;
  im.dir = (hlWx() > im.x) ? -1 : 1;            // quay lưng về phía người chơi
  for (let i = 0; i < 30; i++)
    hlEmber(im.x + (Math.random() - .5) * 40, im.y - 10 - Math.random() * 40, false);
  if (im.loot > 0) {
    im.loot--;
    if (typeof addCoin === 'function') addCoin(12);
    if (typeof addXP === 'function') addXP(8);
    if (typeof sfxPlay === 'function') sfxPlay('coin', 1.4);
    if (typeof showBanner === 'function')
      showBanner('KHU 6 · ĐỊA NGỤC TRẦN NHÂN', '👹 Tiểu Quỷ đánh rơi đồ',
        '+12 Coin · +8 XP — nó chạy nhanh hơn lúc nó đứng', 'red');
  } else if (typeof sfxPlay === 'function') sfxPlay('pop', .5);
}

function hlPrompt() {
  const wx = hlWx(), wy = S.p.y + 18;
  const near = (o, dy0, dy1) => Math.abs(wx - o.x) < o.r && wy > o.y - dy0 && wy < o.y + dy1;
  if (near(HL_KING, 110, 100)) {
    targetAct = { t: 'hl_king', txt: '[E] 👹 BÁI KIẾN QUỶ VƯƠNG' }; return;
  }
  if (near(HL_POT, 100, 90)) {
    targetAct = { t: 'hl_absorb', txt: '[E] 🔥 HẤP THỤ HỎA KHÍ' }; return;
  }
  if (near(HL_PORTAL, 100, 90)) {
    targetAct = { t: 'hl_street', txt: '[E] 🚪 VỀ LẠI PHỐ NGOÀI' }; return;
  }
  targetAct = null;
}

/* ---------- 11. VÀO / RA + CHUYỂN CẢNH 100% CANVAS ---------- */
/* Không một thẻ DOM nào: bản DOM cũ (bài học V33 Khu 5) làm openModalEl()
   thấy .modal → engine bỏ nguyên khung update, và body.modal-open giấu luôn
   phim cảm ứng đúng lúc người chơi cần nó nhất. */
function hlFade(cap, then) {
  if (HL_CUT) return;
  HL_CUT = { cap: cap, then: then, t0: performance.now(), fired: false };
}
function hlCutStep(now) {
  if (!HL_CUT) return;
  const p = Math.min(1, (now - HL_CUT.t0) / HL_FADE);
  if (!HL_CUT.fired && p >= .5) { HL_CUT.fired = true; try { HL_CUT.then(); } catch (e) {} }
  if (p >= 1) { HL_CUT = null; return; }
  try { if (typeof resetInput === 'function') resetInput(); } catch (e) {}
}
function hlCutDraw(now) {
  if (!HL_CUT) return;
  const p = Math.min(1, (now - HL_CUT.t0) / HL_FADE);
  const a = .5 - .5 * Math.cos(Math.PI * 2 * p);
  const W = cv.width, H = cv.height;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = 'rgba(8,2,1,' + a.toFixed(3) + ')';
  ctx.fillRect(0, 0, W, H);
  if (HL_CUT.cap && a > .5) {
    ctx.globalAlpha = Math.min(1, (a - .5) / .3);
    ctx.textAlign = 'center';
    ctx.font = 'italic 400 22px ' + (typeof IP_SERIF !== 'undefined' ? IP_SERIF : 'serif');
    ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(0,0,0,.9)';
    ctx.strokeText(HL_CUT.cap, W / 2, H / 2);
    ctx.fillStyle = '#ffd9a4'; ctx.fillText(HL_CUT.cap, W / 2, H / 2);
    ctx.font = '400 13px ' + (typeof IP_SERIF !== 'undefined' ? IP_SERIF : 'serif');
    ctx.fillStyle = '#c96a3a';
    ctx.fillText('🔥      🔥', W / 2, H / 2 + 30);
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
  }
  ctx.restore();
}

function hlEnter() {
  S.scene = 'HELL';
  window._camX = 0;
  S.p.x = HL_SPAWN.x - 10; S.p.y = HL_SPAWN.y - 30;
  S.p.moving = false;
  HL_ST.st = ''; HL_ST.aura = 0; HL_ST.exitCd = 0; HL_ST.enterCd = HL_ENTER_CD;
  HL_EMB.length = 0;
  for (let i = 0; i < HL_IMPS.length; i++) { HL_IMPS[i].flee = 0; HL_IMPS[i].loot = 2; }
  hlSyncView();
  setZone('6. ĐỊA NGỤC', 'Địa Ngục Trần Nhân');
  if (typeof sfxPlay === 'function') { sfxPlay('pop'); sfxPlay('coin', 1.4); }
  if (typeof chord === 'function') chord([110, 165, 220]);
  if (typeof showBanner === 'function')
    showBanner('KHU 6 · ĐỊA NGỤC TRẦN NHÂN', '🔥 Hóa Thân Quỷ Đỏ',
      'Đi hết 2500px hang lửa · Chạm Tiểu Quỷ để nó đánh rơi đồ · Bái kiến Quỷ Vương', 'red');
  try { if (typeof saveGame === 'function') saveGame(); } catch (e) {}
}
function hlStreet() {
  S.scene = 'STREET';
  /* Đặt người chơi NGAY TẠI Khe Nứt chứ không phải mép trái phố. Nếu chỉ
     _camX = 0 rồi thả S.p.x = 2610, engine sẽ kẹp về (khung nhìn − 35) ≈ 925
     và người chơi rơi tõm vào giữa phố, không còn ở cửa. */
  const vw = hlBackW(), camMax = Math.max(0, 2880 - vw);
  const cam = Math.min(camMax, Math.max(0, HL_GATE.x - Math.round(vw / 2)));
  window._camX = cam;
  S.p.x = HL_GATE.x - 10 - cam; S.p.y = HL_GATE.y - 30;
  S.p.moving = false;
  HL_ST.st = ''; HL_ST.aura = 0; HL_EMB.length = 0;
  setZone('5. PHỐ NGOÀI', 'Phố Cài Win Dạo');
  if (typeof sfxPlay === 'function') sfxPlay('pop', .8);
  if (typeof beep === 'function') beep(320);
  try { if (typeof saveGame === 'function') saveGame(); } catch (e) {}
}
function hlLeave() {
  if (HL_CUT || S.scene !== 'HELL') return;
  if (typeof openModalEl === 'function' && openModalEl()) return;
  hlFade('🚪 ĐANG TRỞ RA PHỐ NGOÀI', hlStreet);
}

/* MỔ KHOÁ TƯ THẾ — một đường ra duy nhất cho mọi cách bấm (V34 Khu 5):
   [E]/nút Tương tác, kéo cần Joystick, hoặc phím WASD/mũi tên/Space/Esc. */
function hlRelease() {
  if (HL_CUT || !HL_ST.st || HL_ST.enterCd > 0) return false;
  if (typeof openModalEl === 'function' && openModalEl()) return false;
  if (HL_ST.st === 'bow') return hlBowEnd();
  HL_ST.st = ''; HL_ST.exitCd = HL_EXIT_CD;
  return true;
}

/* ---------- 12. ✕ RỜI KHU 6 (chỉ vẽ canvas, không thẻ HTML) ---------- */
function hlExitBox() {
  const r = cv.getBoundingClientRect();
  const k = (r && r.width) ? cv.width / r.width : 1;
  const s = 46 * Math.max(.35, Math.min(6, k));
  /* Khu 6 GIỮ NGUYÊN HUD (khác Khu 5 Zen), nên góc phải-trên đã có minimap
     (z-index 12) chiếm chỗ — đặt ✕ ngay trên nó, thụt xuống đúng bề cao thẻ.
     Không có minimap (màn dọc gọn/Máy bàn phím ẩn panel) thì về đúng góc
     như nút ✕ của Khu 5. */
  let y = 10 * k;
  try {
    const m = document.getElementById('minimap-box');
    const mr = m && m.getBoundingClientRect();
    if (m && mr && mr.width && mr.height && getComputedStyle(m).display !== 'none') {
      const need = s + 8 * k;
      const below = (mr.bottom - r.top) * k + 6 * k;
      if (below + need <= cv.height) y = below;
    }
  } catch (e) {}
  return { x: cv.width - s - 10 * k, y: y, w: s, h: s, k: k };
}
function hlExitDraw() {
  if (S.scene !== 'HELL' || HL_CUT) return;
  const b = hlExitBox();
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = .6;
  if (typeof izb === 'function') izb(b.x, b.y, b.w, b.h, b.w * .28, 'rgba(16,6,4,.72)');
  else { ctx.fillStyle = 'rgba(16,6,4,.72)'; ctx.fillRect(b.x, b.y, b.w, b.h); }
  ctx.strokeStyle = 'rgba(255,150,70,.5)'; ctx.lineWidth = Math.max(1, b.k);
  ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w * .46, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,232,200,.94)';
  ctx.font = '700 ' + Math.round(b.h * .42) + 'px ' + (typeof IZF !== 'undefined' ? IZF : 'sans-serif');
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('✕', b.x + b.w / 2, b.y + b.h / 2 + b.h * .02);
  ctx.restore();
}

/* ---------- 13. FRAME CẢNH ---------- */
function hlScene() {
  const t = Date.now() / 1000;
  const prom = hlProm(), lay = hlLayers();
  const cam = Math.max(0, Math.min(HL_CAM_MAX, Math.round(window._camX || 0)));
  const px = S.p.x + cam;                          // nhân vật ở KHÔNG GIAN THẾ GIỚI
  const pfy = S.p.y + 30;                          // ĐIỂM CHÂN

  ctx.fillStyle = '#0d0503'; ctx.fillRect(0, 0, HL_VIEW_W, HL_VIEW_H);
  /* Nền đã dựng 3228px → chỉ MỘT drawImage theo ô nguồn, không nội suy cả
     tấm mỗi frame (bài học hiệu năng Khu 4/Khu 5). */
  ctx.drawImage(prom, cam, 0, HL_VIEW_W, HL_VIEW_H, 0, 0, HL_VIEW_W, HL_VIEW_H);

  ctx.save(); ctx.translate(-cam, 0);
  const vis = x => x > cam - 280 && x < cam + HL_VIEW_W + 280;

  /* ===== lớp phát sáng: lò lửa nền + hào quang ===== */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  if (typeof hvGlow === 'function') {
    /* miệng lửa ngay dưới chân nhân vật: Khu 6 lúc nào cũng "nóng" */
    hvGlow(ctx, px + 10, pfy - 8, 74, '255,120,40', .1 + .03 * Math.sin(t * 2.6));
    if (vis(HL_POT.x)) {
      hvGlow(ctx, HL_POT.x, HL_POT.y - 74, 96, '255,150,50', .26 + .07 * Math.sin(t * 3.3));
      hvGlow(ctx, HL_POT.x, HL_POT.y + 4, 78, '255,110,30', .18 + .05 * Math.sin(t * 2.1));
    }
    if (vis(HL_KING.x)) {
      hvGlow(ctx, HL_KING.x, HL_KING.y - 60, 130, '255,90,40', .16 + .045 * Math.sin(t * 1.2));
      hvGlow(ctx, HL_KING.x, HL_KING.y + 4, 92, '255,170,80', .12 + .04 * Math.sin(t * 2.4));
    }
    if (vis(HL_PORTAL.x)) hvGlow(ctx, HL_PORTAL.x, HL_PORTAL.y - 40, 88, '150,220,255', .12 + .04 * Math.sin(t * 2.2));
    for (let i = 0; i < HL_GHOSTS.length; i++) {
      const gh = HL_GHOSTS[i];
      if (vis(gh.x)) hvGlow(ctx, gh.x, gh.y - 20, 62, '140,240,255', .2 + .08 * Math.sin(t * 1.9 + gh.ph));
    }
    if (HL_ST.aura > .02) {
      hvGlow(ctx, px + 10, pfy - 34, 96, '255,150,50', .1 + .5 * HL_ST.aura);
      hvGlow(ctx, px + 10, pfy - 66, 60, '255,210,120', .06 + .34 * HL_ST.aura);
    }
  }
  ctx.restore();

  /* ===== depth sort theo ĐIỂM CHÂN ===== */
  const list = [];
  if (vis(HL_PORTAL.x)) list.push({ k: HL_PORTAL.pk, f: () => hlPortalDraw(ctx, HL_PORTAL.x, HL_PORTAL.y + 2, t) });
  if (vis(HL_POT.x)) list.push({ k: HL_POT.pk, f: () => {
    if (!hlNpc(Math.floor(t * 2) % 2 ? 'pot_b' : 'pot_a', HL_POT.x, HL_POT.y + 2, 80, false, 1))
      hlRiftDraw(ctx, HL_POT.x, HL_POT.y, 70, t, '🔥 VẠC LỬA');
  } });
  if (vis(HL_KING.x)) list.push({ k: HL_KING.pk, f: () => {
    if (!hlNpc(Math.floor(t * 1.1) % 3 ? 'king_a' : 'king_b', HL_KING.x, HL_KING.y + 2, 100, false, 1))
      hlRiftDraw(ctx, HL_KING.x, HL_KING.y, 90, t, '👹 QUỶ VƯƠNG');
  } });
  for (let i = 0; i < HL_IMPS.length; i++) {
    const im = HL_IMPS[i];
    if (!vis(im.x)) continue;
    list.push({ k: im.y, f: () => {
      const cell = (im.flee > 0 || Math.floor(t * 4) % 2) ? 'imp_b' : 'imp_a';
      if (!hlNpc(cell, im.x, im.y + 2, 66, im.dir < 0, 1))
        hlRiftDraw(ctx, im.x, im.y, 50, t, '');
      if (im.flee > 0) {
        ctx.save();
        ctx.font = '700 12px ' + (typeof IZF !== 'undefined' ? IZF : 'sans-serif');
        ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,236,200,.95)';
        ctx.fillText('💦', im.x, im.y - 74);
        ctx.restore();
      }
    } });
  }
  /* TÀN LỬA DƯỚI CHÂN (yêu cầu): người chơi là Quỷ Đỏ thì chân phải biết. */
  list.push({ k: pfy, f: () => drawSprite(px, S.p.y, 'p') });
  list.sort((a, b) => a.k - b.k);
  for (let i = 0; i < list.length; i++) { try { list[i].f(); } catch (e) {} }

  /* Hồn Ma bay: VẼ SAU cùng lớp dưới (xuyên mọi thứ, kể cả nhân vật) vì
     chúng là khói — bị che thì mất hết chất. */
  for (let i = 0; i < HL_GHOSTS.length; i++) {
    const gh = HL_GHOSTS[i];
    if (!vis(gh.x)) continue;
    const bob = Math.sin(t * 1.6 + gh.ph) * 5;
    if (!hlNpc(Math.floor(t * 2 + gh.ph) % 2 ? 'ghost_b' : 'ghost_a', gh.x, gh.y + bob, 58, false, .82))
      hlRiftDraw(ctx, gh.x, gh.y + bob, 40, t, '');
  }
  hlEmbDraw(ctx);
  /* hào quang lửa quanh người khi vừa hấp thụ */
  if (HL_ST.aura > .02) {
    const k = hlScale(pfy), a = HL_ST.aura;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,170,70,' + (.2 + .5 * a).toFixed(3) + ')';
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.ellipse(px + 10, pfy + 2, 30 * k, 9 * k, 0, 0, 6.2832); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();                                  /* ===== hết thế giới ===== */

  ctx.globalAlpha = .85; ctx.drawImage(lay, 0, 0); ctx.globalAlpha = 1;

  if (typeof hvCap === 'function')
    hvCap(ctx, HL_VIEW_W / 2, 22, '🔥 KHU 6 · ĐỊA NGỤC TRẦN NHÂN',
      { font: 'bold 13px ', h: 24, r: 12, blur: 16, olw: 4 });
  /* Nhãn [E] và thanh cuộn đều theo MÀN HÌNH. */
  if (targetAct && typeof hvLabel === 'function') hvLabel(targetAct.txt || '');
  else if (targetAct) {
    ctx.save();
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = 'rgba(250,204,21,.95)';
    ctx.fillRect(S.p.x + 10 - 60, S.p.y - 36, 120, 20);
    ctx.fillStyle = '#0f172a'; ctx.textAlign = 'center';
    ctx.fillText(targetAct.txt || '', S.p.x + 10, S.p.y - 22);
    ctx.restore();
  }
  hlCamBar(ctx, cam);
}
/* Thanh tiến trình đại lộ — cùng kiểu Khu 5, cho biết còn bao xa tới Quỷ Vương. */
function hlCamBar(g, cam) {
  const w = 168, h = 5, x = Math.round((HL_VIEW_W - w) / 2), y = HL_VIEW_H - 18;
  g.save();
  g.fillStyle = 'rgba(20,8,6,.55)';
  if (typeof rr === 'function') rr(g, x, y, w, h, 2.5); else g.fillRect(x, y, w, h);
  g.fill();
  const p = HL_CAM_MAX > 0 ? Math.max(0, Math.min(1, cam / HL_CAM_MAX)) : 1;
  g.fillStyle = 'rgba(255,150,60,.85)';
  g.fillRect(x, y, Math.max(3, w * p), h);
  g.restore();
}

/* ---------- 14. UPDATE ---------- */
function hlUpdate(dt, now) {
  /* Bộ đếm ngược đi bằng dt TIÊM TÍCH: tab bị ẩn rồi mở lại không bị "nợ"
     cả chục giây khoá (bài học V34). */
  if (HL_ST.exitCd > 0) HL_ST.exitCd = Math.max(0, HL_ST.exitCd - dt);
  if (HL_ST.enterCd > 0) HL_ST.enterCd = Math.max(0, HL_ST.enterCd - dt);
  if (S.scene !== 'HELL' && HL_ST.st) { HL_ST.st = ''; HL_ST.aura = 0; HL_EMB.length = 0; }
  /* Tàn lửa chỉ sống trong hai cảnh có khe nứt. Sang cảnh khác mà để lại là
     mang toạ độ thế giới Khu 6 sang Khu 1 vẽ lung tung, nên xoá sạch. */
  if (S.scene !== 'HELL' && S.scene !== 'STREET' && HL_EMB.length) HL_EMB.length = 0;
  hlSyncView();
  if (S.scene === 'HELL' || S.scene === 'STREET') hlEmbStep(dt);
  if (S.scene === 'HELL') {
    hlGhostTick(dt, now); hlImpTick(dt); hlAuraTick(dt); hlBowTick(now);
    const cam = window._camX || 0;
    /* tàn lửa dưới chân Quỷ: bước thì rớt nhiều, đứng thì thưa thưa */
    if (S.p.moving && Math.random() < .55) hlEmber(cam + S.p.x + (Math.random() - .5) * 18, S.p.y + 28, false);
    else if (Math.random() < .06) hlEmber(cam + S.p.x + (Math.random() - .5) * 14, S.p.y + 28, false);
    /* tàn lửa nền: miệng núi lửa lúc nào cũng nhả */
    if (Math.random() < dt * 12)
      hlEmber(cam + Math.random() * HL_VIEW_W, HL_FEET_BOT + 6 - Math.random() * 40, false);
  }
  if (HL_CUT) return;

  if (S.scene === 'HELL') {
    /* V34 + Mobile: kéo cần Joystick là mở khoá ngay frame đó, không cần buông
       ngón. openModalEl() chặn: lúc hộp đang mở thì kéo là để gõ chữ. */
    if (HL_ST.st) {
      if (hlJoyDrag() && !(typeof openModalEl === 'function' && openModalEl())) hlRelease();
      if (HL_ST.st) { S.p.x = HL_ST.kx; S.p.y = HL_ST.ky; S.p.moving = false; }
    } else hlCamStep();
    /* 0.4s vừa đứng dậy: đừng gợi ý trạm, kẻo cú bấm thoát rơi lại vào tư thế. */
    if (HL_ST.st || HL_ST.exitCd > 0 || (typeof openModalEl === 'function' && openModalEl())) { targetAct = null; return; }
    hlPrompt();
    return;
  }
  /* KHÔNG đụng window._camX ở đây: STREET tự cập nhật mỗi frame (game.js:3651). */
  if (S.scene !== 'STREET') return;
  if (typeof anyCtlModalOpen === 'function' && anyCtlModalOpen()) return;
  const cx = S.p.x + 10 + (window._camX || 0), cy = S.p.y + 30;
  const dg = Math.hypot(cx - HL_GATE.x, cy - HL_GATE.y);
  if (dg < HL_GATE_CORE || (!targetAct && dg < HL_GATE.r))
    targetAct = { t: 'to_hell', txt: '[E] 🔥 VÀO ĐỊA NGỤC TRẦN NHÂN' };
}

/* ---------- 15. MÓC NỐI ---------- */
/* Tường của hang lửa = hai đầu khúc đường. nx/ny engine đưa vào là ĐIỂM NEO
   hệ MÀN HÌNH nên phải cộng _camX. Biên va chạm RỘNG HƠN SCENE_WALK một chút:
   trùng biên thì đúng hàng kẹp bị tính là "ngoài" → kẹt đứng. */
const _hlOldProp = propCollides;
propCollides = function (sc, nx, ny) {
  if (sc !== 'HELL') return _hlOldProp(sc, nx, ny);
  const wx = nx + 10 + (window._camX || 0), wy = ny + 18;
  return !(wx > HL_X0 && wx < HL_X1 && wy > HL_FEET_TOP - 18 && wy < HL_FEET_BOT + 12);
};

/* Widescreen chỉ mở khung nhìn rộng cho STREET và INPEACE. Thay vì sửa file
   đó, hell.js bọc vsLogicalW(): ở HELL trả đúng bề rộng backing, mọi cảnh
   khác trả y hệt cũ. Bọc lazily vì widescreen.js NẠP SAU file này — lúc parse
   thì vsLogicalW chưa tồn tại, gọi sớm là ReferenceError. */
function hlHookLW() {
  try {
    if (typeof vsLogicalW !== 'function' || vsLogicalW.hlHooked) return;
    const old = vsLogicalW;
    vsLogicalW = function () {
      if (typeof S !== 'undefined' && S && S.scene === 'HELL') return hlBackW();
      return old();
    };
    vsLogicalW.hlHooked = 1;
  } catch (e) {}
}

const _hlOldUpd = update;
update = function () {
  const now = performance.now();
  try { hlCutStep(now); } catch (e) {}
  _hlOldUpd.apply(this, arguments);
  const dt = Math.min(.05, (now - (HL_ST.last || now)) / 1000);
  HL_ST.last = now;
  try { hlUpdate(dt, now); } catch (e) {}
};

const _hlOldRnd = render;
render = function () {
  _hlOldRnd();
  if (S.scene === 'HELL') { try { hlScene(); } catch (e) {} }
  /* Cổng Khe Nứt ở CUỐI PHỐ NGOÀI: game.js vẽ STREET rồi return sớm nên lớp
     này phải tự nhân toạ độ cuộn — drawStreet() đã dịch hết rồi. */
  if (S.scene === 'STREET' && !HL_CUT) {
    try {
      const t = Date.now() / 1000, cam = window._camX || 0;
      const sx = HL_GATE.x - cam;
      if (sx > -160 && sx < HL_VIEW_W + 160) {
        hlRiftDraw(ctx, sx, HL_GATE.y + 4, 116, t, '🔥 ĐỊA NGỤC TRẦN NHÂN');
        if (Math.random() < .5) hlEmber(HL_GATE.x + (Math.random() - .5) * 34, HL_GATE.y - 6, true);
        if (targetAct && targetAct.t === 'to_hell' && typeof drawPrompt === 'function')
          drawPrompt('[E] 🔥 VÀO ĐỊA NGỤC TRẦN NHÂN');
      }
      /* tàn lửa khe nứt đi hệ THẾ GIỚI, phải tự dịch theo _camX vì drawStreet
         đã vẽ xong và nhả transform rồi. */
      ctx.save(); ctx.translate(-cam, 0); hlEmbDraw(ctx); ctx.restore();
    } catch (e) {}
  }
  try { hlExitDraw(); } catch (e) {}
  try { hlCutDraw(performance.now()); } catch (e) {}
};

const _hlOldAct = doAction;
doAction = function () {
  if (HL_CUT) return;
  if (S.scene === 'HELL') {
    /* [E] / nút Tương tác cảm ứng là ĐƯỜNG RA của tư thế khoá, không phải
       tombol vô dụng (bài học kẹt thế ngồi Khu 5). */
    if (HL_ST.st) { hlRelease(); return; }
    if (!targetAct) return;
    if (targetAct.t === 'hl_absorb') { hlAbsorb(); return; }
    if (targetAct.t === 'hl_king') { hlAudience(); return; }
    if (targetAct.t === 'hl_street') { hlFade('🚪 ĐANG TRỞ RA PHỐ NGOÀI', hlStreet); return; }
    return;
  }
  if (targetAct && targetAct.t === 'to_hell') {
    hlFade('🔥 ĐANG MỞ KHE NỨT ĐỊA NGỤC', hlEnter); return;
  }
  _hlOldAct.apply(this, arguments);
};

/* Chạm: (1) ✕ rời Khu 6 — tính theo pixel BACKING, đúng cả khi sx ≠ sy;
   (2) Tiểu Quỷ — quy client → backing → logical (chia kx) → thế giới. */
if (typeof cv !== 'undefined' && cv) cv.addEventListener('pointerdown', function (e) {
  try {
    if (HL_CUT) return;
    const r = cv.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const bx = (e.clientX - r.left) * cv.width / r.width;
    const by = (e.clientY - r.top) * cv.height / r.height;
    if (S.scene === 'HELL') {
      const b = hlExitBox();
      if (bx >= b.x && bx <= b.x + b.w && by >= b.y && by <= b.y + b.h) { hlLeave(); return; }
      if (e.button != null && e.button !== 0) return;
      if (typeof openModalEl === 'function' && openModalEl()) return;
      const k = hlKx(), cam = window._camX || 0;
      const wx = bx / k + cam, wy = by / k;
      for (let i = 0; i < HL_IMPS.length; i++) {
        const im = HL_IMPS[i];
        if (Math.abs(wx - im.x) < 34 && wy > im.y - 72 && wy < im.y + 12) { hlStartle(im); return; }
      }
    }
  } catch (err) {}
});

/* Phím: Esc rời Khu 6 (bắt ở giai đoạn THU GOM để phân biệt với hộp modal);
   WASD/mũi tên/Space/Esc đang có tư thế khoá thì mở khoá ngay — PC lẫn Mobile
   dùng chung một đường vì nút Tương tác đã đi qua doAction → hlRelease. */
const HL_STAND_KEYS = /^(Key[WASD]|Arrow(Up|Down|Left|Right)|Space|Escape)$/;
window.addEventListener('keydown', function (e) {
  try {
    if (e.repeat) return;
    if (S.scene !== 'HELL' || HL_CUT) return;
    if (HL_ST.st) {
      if (HL_STAND_KEYS.test(e.code)) hlRelease();
      return;
    }
    if (e.code !== 'Escape') return;
    if (typeof openModalEl === 'function' && openModalEl()) return;
    const dm = document.getElementById('dev-menu');
    if (dm && getComputedStyle(dm).display !== 'none') return;
    hlLeave();
  } catch (err) {}
}, true);

/* Khung nhìn đổi (resize, xoay máy, thanh URL mobile thụt xuống) → dựng lại
   dải nền + kẹp lại camera. Đọc VS.backW() chứ không đọc innerWidth. */
window.addEventListener('resize', function () { try { hlSyncView(); } catch (e) {} });
window.addEventListener('orientationchange', function () { setTimeout(hlSyncView, 220); });
if (window.visualViewport && window.visualViewport.addEventListener)
  window.visualViewport.addEventListener('resize', function () { try { hlSyncView(); } catch (e) {} });

/* Cho các lớp sau và cho test: bề rộng dải nền, khung nhìn, hình học trạm. */
window.HELL = {
  mapW: () => HL_MAP_W, viewW: () => HL_VIEW_W, camMax: () => HL_CAM_MAX,
  tileW: () => HL_TW, promW: () => HL_PROM_W, feet: [HL_FEET_TOP, HL_FEET_BOT],
  gate: HL_GATE, portal: HL_PORTAL, pot: HL_POT, king: HL_KING,
  imps: HL_IMPS, ghosts: HL_GHOSTS, st: HL_ST, cut: () => HL_CUT,
  enter: hlEnter, street: hlStreet, setView: hlSetView, prompt: hlPrompt,
  release: hlRelease, startle: hlStartle, absorb: hlAbsorb, audience: hlAudience,
  bowEnd: hlBowEnd, wx: hlWx
};
