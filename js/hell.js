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
/* V42: bảng cỡ vẽ NPC Khu 6, gom một chỗ để cân sao cho cân với hang 2500px.
   Yêu cầu: Quỷ Vương 120–130px, tiểu quỷ/hồn ma/vạc 68–78px. hlDaisDraw lấy
   HL_KING_H/92 làm hệ số phóng bệ đá, nên đổi một chỗ là cả ngai lớn theo. */
const HL_KING_H = 126, HL_POT_H = 78, HL_IMP_H = 74, HL_GHOST_H = 72;
const HL_P_SCALE = 1.25;                             // nhân vật Quỷ Đỏ vẽ to 1.25x
/* Bảng tên khu chỉ hiện 3 giây đầu rồi tự mờ (V37) — vào cảnh là để ĐỌC tên,
   sau đó màn hình phải trả lại cho cảnh. */
const HL_TITLE_HOLD = 3, HL_TITLE_FADE = .9;
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
const HL_ST = { st: '', kx: 0, ky: 0, t0: 0, t0scene: 0, exitCd: 0, enterCd: 0,
                aura: 0, last: 0, hud: 0 };
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

/* Bệ đá + thảm đỏ của Quỷ Vương: vẽ TRƯỚC sprite trong cùng khoá sâu nên
   vua đứng CHẾM TRÊN bệ, không phải nổi trên nền hang. Thảm loang về phía
   người chơi (hình thang perspective) để lối đi cuối đại lộ ra "ngai". */
function hlDaisDraw(g, x, feetY, t) {
  g.save();
  /* V42: bệ + thảm rộng theo chiều cao vua (DS = 126/92) để ngai, bệ và vua
     cùng một cỡ. CHỈ nhân bề NGANG: thảm đổ xuống phía người chơi mà dài thêm
     là tràn ra ngoài khung 600px. */
  const DS = HL_KING_H / 92;
  const cw0 = 74 * DS, cw1 = 128 * DS, cl = 96;
  const q = g.createLinearGradient(0, feetY - 6, 0, feetY + cl);
  q.addColorStop(0, 'rgba(150,22,28,.95)'); q.addColorStop(.55, 'rgba(112,14,20,.9)');
  q.addColorStop(1, 'rgba(74,8,14,.72)');
  g.beginPath();
  g.moveTo(x - cw0, feetY - 4); g.lineTo(x + cw0, feetY - 4);
  g.lineTo(x + cw1, feetY + cl); g.lineTo(x - cw1, feetY + cl);
  g.closePath(); g.fillStyle = q; g.fill();
  /* viền vàng + tua rua */
  g.strokeStyle = 'rgba(226,168,52,.85)'; g.lineWidth = 2.2; g.stroke();
  g.fillStyle = 'rgba(240,196,86,.55)';
  for (let i = -5; i <= 5; i++) {
    const u = (i + 5) / 10, ex = x - cw1 + (cw1 * 2) * u;
    g.fillRect(ex - 2, feetY + cl, 4, 5);
  }
  /* hai bậc đá: bậc dưới rộng, bậc trên sát chân vua */
  const st = [[112 * DS, 20], [86 * DS, 16]];
  for (let i = 0; i < st.length; i++) {
    const rw = st[i][0], hh = st[i][1], yy = feetY - 2 - (st.length - 1 - i) * 13;
    const s = g.createLinearGradient(0, yy - hh, 0, yy + 6);
    s.addColorStop(0, '#4a3038'); s.addColorStop(.5, '#2c1a20'); s.addColorStop(1, '#180d12');
    g.fillStyle = s;
    g.beginPath(); g.ellipse(x, yy, rw, hh * .5, 0, 0, 6.2832); g.fill();
    /* gờ lửa hắt lên từ miệng hang */
    g.strokeStyle = 'rgba(255,140,60,' + (.22 + .06 * Math.sin(t * 1.8 + i)).toFixed(3) + ')';
    g.lineWidth = 1.8; g.stroke();
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
  /* V41: Ngai vàng chỉ mở hầu bao khi 4/4 CA SỬA MÁY Âm Phủ đã xong. Chưa đủ
     thì Quỷ Vương chỉ nhắc — không trừ, không ghi cờ, người chơi lên đường
     sửa tiếp và quay lại bái kiến. */
  const ca = hlCaDone();
  if (ca < HL_CA_N) {
    if (typeof showBanner === 'function')
      showBanner('QUỶ VƯƠNG TRẦN NHÂN',
        '“Lũ tiểu quỷ đang kêu trời vì rớt mạng kìa, sửa giúp ta rồi quay lại lĩnh thưởng!”',
        '🔧 Ca sửa máy Âm Phủ: ' + ca + '/' + HL_CA_N + ' — còn ' + (HL_CA_N - ca) + ' trạm chưa xong', 'red');
    if (typeof beep === 'function') { try { beep(300, 'square', .12, .03); } catch (e) {} }
    return true;
  }
  const first = !S.missionsDone.hell_king;
  HL_ST.aura = 1;                                  // hào quang Quỷ Vương, bật mỗi lần bái kiến đủ ca
  if (first) {
    S.missionsDone.hell_king = true;
    if (typeof addXP === 'function') addXP(120);
    if (typeof addCoin === 'function') addCoin(150);
    try { if (typeof saveGame === 'function') saveGame(); } catch (e) {}
    if (typeof showBanner === 'function')
      showBanner('QUỶ VƯƠNG TRẦN NHÂN PHÁN XÉT', '“' + line + '”',
        '👹 Ân tứ: +120 EXP · +150 Coin · 🩸 Hào Quang Quỷ Vương', 'red');
  } else if (typeof showBanner === 'function') {
    showBanner('QUỶ VƯƠNG TRẦN NHÂN PHÁN XÉT', '“' + line + '”',
      '🔧 4/4 ca xong hết — phần thưởng lớn đã nhận, ở đây chỉ còn lửa', 'red');
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
  /* V41: 4 trạm sửa máy đứng LON GIAN hơn mọi điểm nhấn khác trên đại lộ và
     không trùng vùng nào của vạc/cổng, nên ưu tiên đầu tiên. Trạm 5 không có
     `act` — [E] của nó chính là nhãn bái kiến Quỷ Vương bên dưới. */
  const st = hlNearStation();
  if (st) { targetAct = { t: 'hl_st', n: st.n, txt: st.act }; return; }
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

/* ---------- 11b. DỌN MÀN HÌNH TRONG KHU 6 ---------- */
/* Bốn khối bị gọi tên: thanh nhiệm vụ bên trái, dãy menu trên cùng, minimap
   bên phải (🗺️ wm-badge là CON của nó nên biến mất theo), và toast "Chạy
   nhanh (giữ Shift)" do ui.js/game.js bắn ra mỗi lần đổi tốc độ.
   KHÔNG đụng vào joystick + nút Tương tác cảm ứng — Mobile vẫn phải đi được
   và vẫn phải bấm được [E]. Ẩn bằng display nên mọi tham chiếu DOM khác
   (syncHUD ghi chữ, dock blink) vẫn chạy hợp lệ, chỉ là không nhìn thấy. */
const HL_HUD = ['quest-panel', 'dock-tr', 'minimap-box'];
function hlHud(hide) {
  for (let i = 0; i < HL_HUD.length; i++) {
    const el = document.getElementById(HL_HUD[i]);
    if (!el) continue;
    if (hide) {
      if (el._hlDisp === undefined) el._hlDisp = el.style.display || '';
      if (el.style.display !== 'none') el.style.display = 'none';
    } else if (el._hlDisp !== undefined) {
      el.style.display = el._hlDisp;
      el._hlDisp = undefined;
    }
  }
  HL_ST.hud = hide ? 1 : 0;
}
/* Đồng bộ THEO CẢNH mỗi frame: vào Khu 6 bằng cổng, F5 ngay trong Khu 6, hay
   rời đi bằng ✕/ESC/[E] đều tự ẩn — tự hiện, không cần sửa file nào khác.
   Ghi lại display cũ nên nếu code khác từng đặt inline style cho các panel
   này thì giá trị đó được trả đúng, không xoá trắng. */
function hlHudSync() {
  const inHell = S.scene === 'HELL';
  if (inHell || HL_ST.hud) hlHud(inHell);
}
/* Toast chạy nhanh: chặn ĐÚNG hai câu chữ đó khi đang ở Khu 6, mọi toast
   khác của game vẫn lên bình thường. Móc lười vì game.js nạp sau file này. */
function hlHookToast() {
  try {
    if (typeof showToast !== 'function' || showToast.hlHooked) return;
    const old = showToast;
    showToast = function (m) {
      if (S.scene === 'HELL' && /Chạy nhanh|Đi bộ/.test(String(m == null ? '' : m))) return;
      return old.apply(this, arguments);
    };
    showToast.hlHooked = 1;
  } catch (e) {}
}

function hlEnter() {
  S.scene = 'HELL';
  window._camX = 0;
  S.p.x = HL_SPAWN.x - 10; S.p.y = HL_SPAWN.y - 30;
  S.p.moving = false;
  HL_ST.st = ''; HL_ST.aura = 0; HL_ST.exitCd = 0; HL_ST.enterCd = HL_ENTER_CD;
  HL_ST.t0scene = performance.now();               // đồng hồ tiêu đề 3 giây
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
/* HUD đã bị ẩn ở mục 11b, nên góc trên-phải là vùng trống thật sự: nút ngồi
   sát mép, không minimap / 🗺️ / sách đè lên. Bề rộng ĐO THEO CHỮ nên nhãn
   "✕ Rời Địa Ngục" luôn vừa khung, và hit test dùng đúng hộp này (cả PC lẫn
   chạm) — không có hộp thứ hai dễ lệch. */
const HL_EXIT_TXT = '✕ Rời Địa Ngục';
function hlExitBox() {
  const r = cv.getBoundingClientRect();
  const k = Math.max(.35, Math.min(6, (r && r.width) ? cv.width / r.width : 1));
  const fs = Math.round(13 * k), h = Math.round(32 * k);
  let tw = 104 * k;
  try {
    ctx.save();
    ctx.font = '700 ' + fs + 'px ' + (typeof IZF !== 'undefined' ? IZF : 'sans-serif');
    tw = ctx.measureText(HL_EXIT_TXT).width;
    ctx.restore();
  } catch (e) {}
  const w = Math.round(tw + 30 * k);
  let y = Math.round(10 * k);
  /* Banner khẩn cấp (#emg-hud) nằm ngay dải trên, lệch phải vào đúng mép nút
     ✕. Thà tụt nút xuống dưới banner còn hơn đè lên: đè nhau là mất luôn đường
     RA Khu 6, còn lệch vài chục pixel chỉ là thẩm mỹ. */
  try {
    const e = document.getElementById('emg-hud');
    const q = e && e.getBoundingClientRect();
    if (q && q.width && q.height && getComputedStyle(e).display !== 'none') {
      const bl = q.left - r.left, br = q.right - r.left, bt = q.top - r.top, bb = q.bottom - r.top;
      const pl = (cv.width - w - 10 * k) / k, pr = (cv.width - 10 * k) / k;
      if (br > pl && bl < pr && bb > 10 && bt < 10 + h / k) y = Math.round((bb + 6) * k);
    }
  } catch (err) {}
  return { x: Math.round(cv.width - w - 10 * k), y: y, w: w, h: h, k: k, fs: fs };
}
function hlExitDraw() {
  if (S.scene !== 'HELL' || HL_CUT) return;
  const b = hlExitBox();
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = .88;
  if (typeof izb === 'function') izb(b.x, b.y, b.w, b.h, b.h * .45, 'rgba(22,6,4,.84)');
  else { ctx.fillStyle = 'rgba(22,6,4,.84)'; ctx.fillRect(b.x, b.y, b.w, b.h); }
  ctx.strokeStyle = 'rgba(255,150,70,.62)'; ctx.lineWidth = Math.max(1, b.k);
  if (typeof rr === 'function') { rr(ctx, b.x, b.y, b.w, b.h, b.h * .45); ctx.stroke(); }
  else ctx.strokeRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = 'rgba(255,238,212,.97)';
  ctx.font = '700 ' + b.fs + 'px ' + (typeof IZF !== 'undefined' ? IZF : 'sans-serif');
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(HL_EXIT_TXT, b.x + b.w / 2, b.y + b.h / 2 + b.h * .02);
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
      hvGlow(ctx, HL_POT.x, HL_POT.y - 78, 104, '255,150,50', .26 + .07 * Math.sin(t * 3.3));
      hvGlow(ctx, HL_POT.x, HL_POT.y + 4, 82, '255,110,30', .18 + .05 * Math.sin(t * 2.1));
    }
    if (vis(HL_KING.x)) {
      hvGlow(ctx, HL_KING.x, HL_KING.y - 82, 172, '255,90,40', .16 + .045 * Math.sin(t * 1.2));
      hvGlow(ctx, HL_KING.x, HL_KING.y + 4, 104, '255,170,80', .12 + .04 * Math.sin(t * 2.4));
    }
    if (vis(HL_PORTAL.x)) hvGlow(ctx, HL_PORTAL.x, HL_PORTAL.y - 40, 88, '150,220,255', .12 + .04 * Math.sin(t * 2.2));
    for (let i = 0; i < HL_GHOSTS.length; i++) {
      const gh = HL_GHOSTS[i];
      if (vis(gh.x)) hvGlow(ctx, gh.x, gh.y - 26, 76, '140,240,255', .2 + .08 * Math.sin(t * 1.9 + gh.ph));
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
    if (!hlNpc(Math.floor(t * 2) % 2 ? 'pot_b' : 'pot_a', HL_POT.x, HL_POT.y + 2, HL_POT_H, false, 1))
      hlRiftDraw(ctx, HL_POT.x, HL_POT.y, HL_POT_H - 10, t, '🔥 VẠC LỬA');
  } });
  if (vis(HL_KING.x)) list.push({ k: HL_KING.pk, f: () => {
    /* V42: 126px — cao gấp ~1.75 lần nhân vật Quỷ Đỏ đã phóng 1.25 (58 → ~72px),
       vua vẫn LOOK down lên người chơi và còn chiếm được lưng ngai 240px. */
    const KH = HL_KING_H;
    hlDaisDraw(ctx, HL_KING.x, HL_KING.y + 2, t);
    if (!hlNpc(Math.floor(t * 1.1) % 3 ? 'king_a' : 'king_b', HL_KING.x, HL_KING.y + 2, KH, false, 1))
      hlRiftDraw(ctx, HL_KING.x, HL_KING.y, KH - 2, t, '👹 QUỶ VƯƠNG');
    /* Bảng tên vẽ SAU sprite nên luôn đọc được trên đầu, kể cả khi vua vừa
       vung tay (king_b). olw PHẢI mỏng (1.3): hvCap viền đen BÊN TRONG nét
       chữ, 12px mà để 3px là nét chữ bị nuốt sạch — đo ra 0 pixel sáng. */
    if (typeof hvCap === 'function')
      hvCap(ctx, HL_KING.x, HL_KING.y + 2 - KH - 32, '👹 Quỷ Vương Trần Nhân',
        { font: 'bold 13px ', h: 26, r: 9, pad: 20, bg: 'rgba(40,7,9,.95)',
          rim: 'rgba(226,168,52,.9)', lw: 1.8, fg: '#ffe7b4', blur: 14, olw: 1.3 });
  } });
  for (let i = 0; i < HL_IMPS.length; i++) {
    const im = HL_IMPS[i];
    if (!vis(im.x)) continue;
    list.push({ k: im.y, f: () => {
      const cell = (im.flee > 0 || Math.floor(t * 4) % 2) ? 'imp_b' : 'imp_a';
      if (!hlNpc(cell, im.x, im.y + 2, HL_IMP_H, im.dir < 0, 1))
        hlRiftDraw(ctx, im.x, im.y, HL_IMP_H - 16, t, '');
      if (im.flee > 0) {
        ctx.save();
        ctx.font = '700 12px ' + (typeof IZF !== 'undefined' ? IZF : 'sans-serif');
        ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,236,200,.95)';
        ctx.fillText('💦', im.x, im.y - HL_IMP_H - 10);
        ctx.restore();
      }
    } });
  }
  /* V41: 5 trạm IT Support Âm Phủ — khoá sâu pk 468..476, LUÔN nhỏ hơn mép
     trên dải đi bộ (500) nên nhân vật bao giờ cũng đi TRƯỚC trạm, không có
     chuyện trạm che mất người (và cũng không có va chạm ẩn). */
  hlStList(list, vis, t);
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
    if (!hlNpc(Math.floor(t * 2 + gh.ph) % 2 ? 'ghost_b' : 'ghost_a', gh.x, gh.y + bob, HL_GHOST_H, false, .82))
      hlRiftDraw(ctx, gh.x, gh.y + bob, HL_GHOST_H - 18, t, '');
  }
  hlEmbDraw(ctx);
  /* hào quang lửa quanh người khi vừa hấp thụ */
  if (HL_ST.aura > .02) {
    const k = hlScale(pfy) * HL_P_SCALE, a = HL_ST.aura;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,170,70,' + (.2 + .5 * a).toFixed(3) + ')';
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.ellipse(px + 10, pfy + 2, 30 * k, 9 * k, 0, 0, 6.2832); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();                                  /* ===== hết thế giới ===== */

  ctx.globalAlpha = .85; ctx.drawImage(lay, 0, 0); ctx.globalAlpha = 1;

  /* Tiêu đề khu: đầy đủ 3 giây đầu rồi mờ dần 0.9s, hết là KHÔNG vẽ nữa
     (góc trên giữa trả lại cho cảnh). Vào lại Khu 6 thì đồng hồ chạy lại. */
  if (typeof hvCap === 'function') {
    const age = (performance.now() - (HL_ST.t0scene || performance.now())) / 1000;
    const ta = age <= HL_TITLE_HOLD ? 1 : Math.max(0, 1 - (age - HL_TITLE_HOLD) / HL_TITLE_FADE);
    if (ta > .01) {
      /* V42: badge 🔧 X/4 đã chiếm dải trên cùng nên tiêu đề tụt xuống NGAY
         dưới hàng nút ✕ / 🗺️ (toạ độ px nền, theo k để chuẩn cả mobile). */
      const hb = hlMapBox();
      ctx.save(); ctx.globalAlpha = ta;
      hvCap(ctx, HL_VIEW_W / 2, hb.y + hb.h + Math.round(13 * hb.k),
        '🔥 KHU 6 · ĐỊA NGỤC TRẦN NHÂN',
        { font: 'bold 13px ', h: 24, r: 12, blur: 16, olw: 4 });
      ctx.restore();
    }
  }
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
  hlCaCounter(ctx);
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
  hlHookToast();
  hlHudSync();
  hlBgmStep();
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

/* V42: Quỷ Đỏ 1.25x trong Khu 6. Trạm 1–4 giờ cao 172–188px, vua 126px mà
   nhân vật vẫn 58px thì đứng cạnh bàn máy tính trông lọt thỏm như con kiến.
   Co giãn quanh ĐIỂM CHÂN (x+10, y+30) nên chân vẫn ghim đúng mặt sàn và bóng
   tiếp xúc + bụi chân mà vfx.js vẽ BÊN TRONG drawSprite cũng co theo cùng tỷ
   lệ. Wrapper của hell là vòng NGOÀI CÙNG (file này nạp sau bunnies/inpeace)
   nên cỡ nào cũng áp được lên bản vẽ cuối cùng. */
const _hlOldSpr = drawSprite;
drawSprite = function (x, y, r) {
  if (S.scene !== 'HELL' || r !== 'p') return _hlOldSpr(x, y, r);
  const cx = x + 10, fy = y + 30;
  ctx.save();
  ctx.translate(cx, fy); ctx.scale(HL_P_SCALE, HL_P_SCALE); ctx.translate(-cx, -fy);
  try { _hlOldSpr(x, y, r); } finally { ctx.restore(); }
};

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
    /* V41: hộp minigame đang mở DƯỚI Địa Ngục (mở từ trạm) thì [E] / nút
       Tương tác cảm ứng là nút hành động của hộp đó. mg-coding.js đã làm điều
       này cho HEAVEN, nhưng wrapper doAction của hell mới là vòng ngoài nên
       trong HELL phải tự lo, không thì Space/E câm lì giữa lúc sửa máy. */
    if (HVM && HVM.hl) { if (typeof hvMiniPulse === 'function') hvMiniPulse(); return; }
    if (LQM && LQM.hl) { if (typeof lqmPulse === 'function') lqmPulse(); return; }
    /* [E] / nút Tương tác cảm ứng là ĐƯỜNG RA của tư thế khoá, không phải
       tombol vô dụng (bài học kẹt thế ngồi Khu 5). */
    if (HL_ST.st) { hlRelease(); return; }
    if (!targetAct) return;
    if (targetAct.t === 'hl_absorb') { hlAbsorb(); return; }
    if (targetAct.t === 'hl_king') { hlAudience(); return; }
    if (targetAct.t === 'hl_st') { hlOpenStation(HL_STATIONS[targetAct.n - 1]); return; }
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
        /* V42: ô chạm bám theo HL_IMP_H — tiểu quỷ to thêm thì ngón tay với tới
           phần thân trên, không phải chỉ còn đúng hai chân dưới 72px cũ. */
        if (Math.abs(wx - im.x) < 36 && wy > im.y - HL_IMP_H - 8 && wy < im.y + 12) { hlStartle(im); return; }
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
  bowEnd: hlBowEnd, wx: hlWx, hudSync: hlHudSync, exitBox: hlExitBox,
};

/* ---------- 15b. NÚT 🗺️ BẢN ĐỒ DỊCH CHUYỂN NHANH (V39) ---------- */
/* #wm-badge (nút 🗺️ HTML) là con của #minimap-box — mục 11b ẩn cụm này theo
   yêu cầu dọn màn hình, nên trong Khu 6 không còn lối mở bản đồ. Nút vẽ bằng
   Canvas, hộp suy ra từ hlExitBox(): vuông bằng chiều cao pill ✕, nằm sát
   TRÁI ✕ một khe 8px THIẾT BỊ. Vì đọc lại chính hộp đó, nút tự nhảy xuống theo
   khi ✕ tránh banner khẩn cấp (#emg-hud) và tự đổi cỡ theo k trên mọi khung. */
function hlMapBox() {
  const b = hlExitBox();
  return { x: b.x - b.h - 8 * b.k, y: b.y, w: b.h, h: b.h, k: b.k, fs: Math.round(b.h * .46) };
}
function hlMapDraw() {
  if (S.scene !== 'HELL' || HL_CUT) return;
  const b = hlMapBox();
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = .6;
  if (typeof izb === 'function') izb(b.x, b.y, b.w, b.h, b.h * .45, 'rgba(22,6,4,.84)');
  else { ctx.fillStyle = 'rgba(22,6,4,.84)'; ctx.fillRect(b.x, b.y, b.w, b.h); }
  ctx.strokeStyle = 'rgba(255,150,70,.62)'; ctx.lineWidth = Math.max(1, b.k);
  if (typeof rr === 'function') { rr(ctx, b.x, b.y, b.w, b.h, b.h * .45); ctx.stroke(); }
  else ctx.strokeRect(b.x, b.y, b.w, b.h);
  ctx.fillStyle = 'rgba(255,238,212,.97)';
  ctx.font = '700 ' + b.fs + 'px ' + (typeof IZF !== 'undefined' ? IZF : 'sans-serif');
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('🗺️', b.x + b.w / 2, b.y + b.h / 2 + b.h * .02);
  ctx.restore();
}
/* Bấm/chạm 🗺️: mở bản đồ tại chỗ, KHÔNG rời cảnh — có vậy thẻ KHU 6 mới hiện
   "📍 ĐANG Ở ĐÂY" và người chơi đi tiếp sang khu khác bằng đúng một chạm.
   Đang bái kiến (HL_ST.st='bow') thì xin đứng dậy trước cho nhân vật về tư thế
   thẳng; nếu enterCd còn chặn thì mục 15 vẫn tự dọn tư thế lúc đổi cảnh. */
if (typeof cv !== 'undefined' && cv) cv.addEventListener('pointerdown', function (e) {
  try {
    if (S.scene !== 'HELL' || HL_CUT) return;
    if (typeof openModalEl === 'function' && openModalEl()) return;
    if (typeof openWorldMap !== 'function') return;
    if (e.button != null && e.button !== 0) return;
    const r = cv.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const bx = (e.clientX - r.left) * cv.width / r.width;
    const by = (e.clientY - r.top) * cv.height / r.height;
    const b = hlMapBox();
    /* Pill ✕ chỉ cao 32px THIẾT BỊ → ô 🗺️ vuông bằng nó cũng nhỏ so với ngón
       cái. Nới 6px thiết bị ra TRÁI/TRÊN/DƯỚI, riêng biên PHẢI giữ nguyên vì
       sát cạnh đó là ✕ — nới vào ✕ là một chạm thành hai hành động. */
    const pad = 6 * b.k;
    if (bx < b.x - pad || bx > b.x + b.w || by < b.y - pad || by > b.y + b.h + pad) return;
    if (HL_ST.st) hlRelease();
    openWorldMap();
  } catch (err) {}
});

/* Nút vẽ SAU cùng chuỗi render của hell (wrapper mới bọc wrapper cũ) nên không
   bị dải nền/vạc lửa che; HL_CUT đã ẩn nó suốt phim nứt địa ngục. */
const _hlOldRndMap = render;
render = function () {
  const out = _hlOldRndMap.apply(this, arguments);
  try { hlMapDraw(); } catch (e) {}
  return out;
};

/* ============================================================
   16. V41 — 5 TRẠM IT SUPPORT ÂM PHỦ + CUỘC THI CA SỬA MÁY
   ------------------------------------------------------------
   Trạm 1..4 = 4 "ca sửa máy", mỗi ca mở lại MỘT minigame đã có sẵn của game
   (không viết minigame mới, không sửa minigame cũ):
     1 🖥️ diệt virus  -> ải bug của Khu 4   (hvMiniEnter 1 = HVM_G2)
     2 🌐 cáp quang   -> ải đấu cáp Khu 3   (lqmEnter 4 = lq_cable)
     3 ❄️ hạ nhiệt    -> ải làm mát Khu 3   (lqmEnter 1 = lq_bio, bản V40)
     4 💾 sổ sinh tử -> ải nối mạch Khu 3   (lqmEnter 0 = lq_lab)
   Thắng trong Địa Ngục PHẢI KHÔNG được ghi cờ lq_/hv_ hay trả Coin của Khu
   3/Khu 4 (900–1600 Coin), nên lqmWin/hvMiniWin được bọc: có cờ .hl là phần
   thưởng đi về hell_stN + XP/Coin cố định, không đụng gì tới tiến trình khu khác.
   Trạm 5 = Ngai Vàng đặt ngay SAU Quỷ Vương, không có ca riêng — [E] của nó là
   nhãn bái kiến cũ, và hlBowEnd chỉ thưởng lớn khi đã đủ 4/4.
   ============================================================ */

/* box = khung NỘI DUNG thật của ảnh 1024x1024, do tools/bake-hell.cjs đo và in
   ra log lúc bake (bbox). Neo theo box chứ không theo cả ảnh: ảnh nguồn chừa
   lề trắng 28–78px dưới đáy, vẽ cả ảnh là trạm nổi bồng bềnh trên mặt sàn.
   Artist đổi ảnh nguồn -> chạy bake rồi chép lại 5 bộ số này. */
const HL_CA_N = 4;
/* V42: ảnh trạm gốc chỉ 879–931px nội dung mà vẽ 120–134px thì chìm nghỉm trong
   hang lửa 2500px. Phóng lên ~1.8 lần (172–188px, ngai 240px) theo HẸN TỶ LỆ
   ĐỀU (k = h / bh, bề rộng tự suy ra từ bw) nên không hề méo hình. Đáy vẫn neo
   y=545 — sát mặt sàn đá, trên mép dưới dải đi bộ một chút để chân bàn chạm đất. */
const HL_STATIONS = [
  { n: 1, id: 'hell_st1', img: 'hellSt1', x: 450, y: 545, h: 184, r: 66, pk: 476,
    box: [80, 50, 958, 945], mg: 'hv', mi: 1, xp: 40, coin: 50, rgb: '120,220,255',
    act: '[E] 🖥️ DIỆT VIRUS CHO TIỂU QUỶ', sign: '🖥️ DIỆT VIRUS' },
  { n: 2, id: 'hell_st2', img: 'hellSt2', x: 880, y: 545, h: 176, r: 66, pk: 476,
    box: [130, 70, 896, 952], mg: 'lq', mi: 4, xp: 45, coin: 60, rgb: '255,170,60',
    act: '[E] 🌐 NỐI CÁP QUANG VONG XUYÊN', sign: '🌐 NỐI CÁP QUANG' },
  { n: 3, id: 'hell_st3', img: 'hellSt3', x: 1320, y: 545, h: 188, r: 66, pk: 476,
    box: [97, 25, 926, 995], mg: 'lq', mi: 1, xp: 50, coin: 70, rgb: '140,240,255',
    act: '[E] ❄️ HẠ NHIỆT LÒ SERVER', sign: '❄️ HẠ NHIỆT LÕI' },
  { n: 4, id: 'hell_st4', img: 'hellSt4', x: 1760, y: 545, h: 172, r: 66, pk: 476,
    box: [211, 69, 812, 956], mg: 'lq', mi: 0, xp: 60, coin: 80, rgb: '220,150,255',
    act: '[E] 💾 CỨU DỮ LIỆU SỔ SINH TỬ', sign: '💾 CỨU SỔ SINH TỬ' },
  /* pk 468 < HL_KING.pk 470 → ngai luôn đứng SAU vua, đúng thứ trước-sau của
     một cái ngai có người ngồi. Cao 240px để vua 126px ngồi trước vẫn còn thấy
     lưng ngai looming phía sau. */
  { n: 5, id: 'hell_st5', img: 'hellSt5', x: 2220, y: 532, h: 240, r: 0, pk: 468,
    box: [47, 76, 977, 970], ca: false, rgb: '255,120,40', sign: '👹 NGAI VÀNG' }
];

/* Cờ hoàn thành là boolean trong file save → PHẢI khai STAGE_IDS, nếu không
   applySave() xoá sạch khi nạp (bài học Khu 4). */
if (typeof STAGE_IDS !== 'undefined' && STAGE_IDS)
  for (let i = 0; i < HL_CA_N; i++) STAGE_IDS[HL_STATIONS[i].id] = 1;
if (!S.missionsDone) S.missionsDone = {};
for (let i = 0; i < HL_CA_N; i++)
  if (!(HL_STATIONS[i].id in S.missionsDone)) S.missionsDone[HL_STATIONS[i].id] = false;

function hlCaDone() {
  let n = 0;
  for (let i = 0; i < HL_CA_N; i++) if (S.missionsDone && S.missionsDone[HL_STATIONS[i].id]) n++;
  return n;
}
function hlNearStation() {
  const wx = hlWx(), wy = S.p.y + 18;
  for (let i = 0; i < HL_CA_N; i++) {
    const s = HL_STATIONS[i];
    if (Math.abs(wx - s.x) < s.r && wy > s.y - 110 && wy < s.y + 92) return s;
  }
  return null;
}

/* ----- vẽ ----- */
function hlStArt(g, s, t) {
  const im = hlImg(s.img);
  const feetY = s.y + 2;
  if (!im || !(im.naturalWidth || im.width)) {         // thiếu ảnh: trụ lửa + nhãn, hitbox vẫn đúng
    hlRiftDraw(g, s.x, s.y, Math.round(s.h * .55), t, s.sign);
    return;
  }
  const b = s.box, bw = b[2] - b[0] + 1, bh = b[3] - b[1] + 1;
  const k = s.h / bh, dw = bw * k, dh = bh * k;
  g.save();
  try { g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; } catch (e) {}
  /* ĐÁY cụm pixel nằm đúng feetY, trục x căn giữa trạm — không cần biết ảnh
     gốc rộng bao nhiêu, mọi trạm cùng đứng trên một mặt sàn đá. */
  g.drawImage(im, b[0], b[1], bw, bh, s.x - dw / 2, feetY - dh, dw, dh);
  g.restore();
}
function hlStSign(g, s, t) {
  if (typeof hvCap !== 'function') return;
  const done = s.ca !== false && !!S.missionsDone[s.id];
  /* V42: trạm cao gấp ~1.8 nên bảng hiệu cũng phải nhả lên THEO, không chỉ
     cách đỉnh một khe cố định — mép trên ảnh trạm 1-4 là ăng-ten/nóc nhà, để
     sát quá là bảng đè lên chi tiết. Khe = 30px + 10% chiều cao trạm. */
  const top = s.y + 2 - s.h - ((s.n === 5 ? 40 : 30) + Math.round(s.h * .1));
  g.save();
  g.globalCompositeOperation = 'lighter';
  if (typeof hvGlow === 'function')
    hvGlow(g, s.x, top + 13, 52, s.rgb, (done ? .3 : .17) + .05 * Math.sin(t * 2.4 + s.n));
  g.restore();
  /* olw 1.3 như bảng tên Quỷ Vương: viền đen của hvCap nằm TRONG nét chữ, để
     dày là nét 12px bị nuốt sạch. */
  hvCap(g, s.x, top, (done ? '✔ ' : '') + s.sign, {
    font: 'bold 12px ', h: 24, r: 8, pad: 16,
    bg: done ? 'rgba(6,38,20,.95)' : 'rgba(30,8,6,.92)',
    rim: done ? 'rgba(74,222,128,.9)' : 'rgba(255,150,60,.85)',
    lw: 1.8, fg: done ? '#bbf7d0' : '#ffe7b4', blur: 12, olw: 1.3 });
}
function hlStDraw(g, s, t) { hlStArt(g, s, t); hlStSign(g, s, t); }
function hlStList(list, vis, t) {
  for (let i = 0; i < HL_STATIONS.length; i++) {
    const s = HL_STATIONS[i];
    if (!vis(s.x)) continue;
    list.push({ k: s.pk, f: () => hlStDraw(ctx, s, t) });
  }
}
/* V42: badge dời khỏi góc trên-TRÁI. Chỗ cũ nằm dưới thẻ "Nhân-IT Lv.x" nên
   người chơi chỉ thấy đúng chữ 0/4 lòi ra. Giờ nó áp sát MÉP TRÁI của nút 🗺️,
   vẽ bằng ĐÚNG hệ pixel backing + hệ số k của hlExitBox(): tự nhảy xuống khi
   ✕ tránh banner khẩn cấp, tự đổi cỡ theo mọi khung hình, và không thẻ HUD nào
   che được nữa vì ngay cạnh ✕/🗺️ là vùng đã dọn sạch (mục 11b). */
function hlCaCounter(g) {
  const n = hlCaDone(), full = n >= HL_CA_N;
  const txt = '🔧 Ca sửa máy Âm Phủ: ' + n + '/' + HL_CA_N;
  const mb = hlMapBox(), k = mb.k;
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.font = '700 ' + Math.round(13 * k) + 'px ' + (typeof IZF !== 'undefined' ? IZF : 'sans-serif');
  const w = Math.round(g.measureText(txt).width + 26 * k), h = mb.h;
  const x = Math.max(Math.round(4 * k), Math.round(mb.x - 8 * k - w)), y = mb.y;
  g.globalAlpha = .92;
  if (typeof izb === 'function') izb(x, y, w, h, h * .45, 'rgba(22,6,4,.84)');
  else { g.fillStyle = 'rgba(22,6,4,.84)'; g.fillRect(x, y, w, h); }
  g.strokeStyle = full ? 'rgba(74,222,128,.85)' : 'rgba(255,150,60,.6)';
  g.lineWidth = Math.max(1, 1.4 * k);
  if (typeof rr === 'function') { rr(g, x, y, w, h, h * .45); g.stroke(); }
  else g.strokeRect(x, y, w, h);
  g.fillStyle = full ? '#bbf7d0' : '#ffe7b4';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(txt, x + w / 2, y + h / 2 + h * .02);
  g.restore();
}

/* ----- mở / thắng / đóng ca ----- */
function hlCaHeader(st) {
  const hd = document.getElementById(st.mg === 'hv' ? 'hv-mini-hd' : 'lu-mini-hd');
  if (!hd) return;
  const close = st.mg === 'hv' ? 'hvMiniClose()' : 'lqmClose()';
  hd.innerHTML =
    '<b style="font-size:16px">' + st.sign + ' — TRẠM ' + st.n + ' ÂM PHỦ</b>' +
    '<span style="display:flex;gap:8px;align-items:center;font-size:12px;color:#fca5a5">🔧 ' +
    hlCaDone() + '/' + HL_CA_N +
    '<button onclick="' + close + '" style="background:#2a0d0a;color:#fff;border:1px solid #7f3a2a;border-radius:8px;padding:2px 10px;cursor:pointer">✖</button></span>';
}
function hlOpenStation(st) {
  if (!st || !st.act || HL_CUT) return;
  if (st.mg === 'hv') {
    if (typeof hvMiniEnter !== 'function') return;
    hvMiniEnter(st.mi);
    if (!HVM) return;                    // hvmCut() chặn: không có hộp thì không đề cờ
    HVM.hl = st;
  } else {
    if (typeof lqmEnter !== 'function') return;
    lqmEnter(st.mi);
    if (!LQM) return;
    LQM.hl = st;
  }
  hlCaHeader(st);
  if (typeof sfxPlay === 'function') { try { sfxPlay('pop', .7); } catch (e) {} }
}
/* Phần thưởng CỦA ÂM PHỦ: XP/Coin cố định theo trạm, một lần cho mỗi cờ
   hell_stN. Không sao chép bất kỳ dòng nào của lqmWin/hvMiniWin ngoài việc
   tự vẽ lại hint + nút trong hộp. */
function hlCaFinish(st) {
  const M = st.mg === 'hv' ? HVM : LQM;
  if (!M) return;
  M.done = true;
  let stars = 1;
  try {
    const mod = st.mg === 'hv' ? M.mod : (typeof LQM_GAMES !== 'undefined' ? LQM_GAMES[M.i] : null);
    if (mod && mod.stars) stars = Math.max(1, Math.min(3, mod.stars(M.g) | 0));
  } catch (e) {}
  const first = !S.missionsDone[st.id];
  if (first) {
    S.missionsDone[st.id] = true;
    if (typeof addXP === 'function') addXP(st.xp);
    if (typeof addCoin === 'function') addCoin(st.coin);
  }
  try { if (typeof saveGame === 'function') saveGame(); } catch (e) {}
  try { if (typeof updateQuestHUD === 'function') updateQuestHUD(); } catch (e) {}
  if (typeof sfxPlay === 'function') { try { sfxPlay('coin', 1.4); } catch (e) {} }
  if (typeof chord === 'function') { try { chord([660, 880, 1100]); } catch (e) {} }
  const el = document.getElementById(st.mg === 'hv' ? 'hv-mini-hint' : 'lu-mini-hint');
  if (el) {
    el.style.color = '#4ade80';
    el.innerHTML = '🎉 <b>CA XONG!</b> ' + '⭐'.repeat(stars) + '☆'.repeat(3 - stars) + ' — ' +
      (first ? '🎁 +' + st.xp + ' EXP | +' + st.coin + ' Coin'
             : 'Quỷ Vương đã thưởng ca này rồi — làm lại cho vui, không nhận thêm') +
      ' · 🔧 Ca sửa máy Âm Phủ: ' + hlCaDone() + '/' + HL_CA_N +
      (hlCaDone() >= HL_CA_N ? ' · <b>Lên ngai lĩnh thưởng lớn!</b>' : '');
  }
  hlCaHeader(st);
  const f = document.getElementById(st.mg === 'hv' ? 'hv-mini-foot' : 'lu-mini-foot');
  if (f) f.innerHTML =
    '<button onclick="hlCaClose()" style="padding:9px 30px;border:0;border-radius:12px;background:#22c55e;color:#04120a;font-weight:800;cursor:pointer;font-size:14px">✔ XONG CA</button>' +
    '<button onclick="hlCaReplay()" style="padding:9px 18px;border:1px solid #475569;border-radius:12px;background:#161f3a;color:#cbd5e1;cursor:pointer">🔄 CHƠI LẠI</button>';
}
/* Hai hàm win cũ chỉ chạy khi KHÔNG phải ca Âm Phủ — cờ .hl mất là đủ. */
if (typeof lqmWin === 'function') {
  const _hlOldLqWin = lqmWin;
  lqmWin = function () {
    if (LQM && LQM.hl) { hlCaFinish(LQM.hl); return; }
    return _hlOldLqWin.apply(this, arguments);
  };
}
if (typeof hvMiniWin === 'function') {
  const _hlOldHvWin = hvMiniWin;
  hvMiniWin = function () {
    if (HVM && HVM.hl) { hlCaFinish(HVM.hl); return; }
    return _hlOldHvWin.apply(this, arguments);
  };
}
function hlCaClose() {
  const st = (LQM && LQM.hl) || (HVM && HVM.hl) || null;
  if (st && st.mg === 'hv' && typeof hvMiniClose === 'function') hvMiniClose();
  else if (typeof lqmClose === 'function') lqmClose();
  /* 0.4s: đứng lại tại trạm vừa sửa xong thì nhãn [E] chưa hiện vội, kẻo cú
     bấm "XONG CA" rơi trúng vào lần mở hộp tiếp theo. */
  HL_ST.exitCd = HL_EXIT_CD;
  if (typeof saveGame === 'function') { try { saveGame(); } catch (e) {} }
}
function hlCaReplay() {
  const st = (LQM && LQM.hl) || (HVM && HVM.hl) || null;
  if (!st) return;
  if (st.mg === 'hv') { if (typeof hvMiniReplay === 'function') { hvMiniReplay(); hlCaHeader(st); } }
  else if (typeof lqmReplay === 'function') { lqmReplay(); hlCaHeader(st); }
}

/* Cho test + cho các lớp sau: hình học trạm và tiến trình ca sửa máy. */
window.HELL.stations = HL_STATIONS;
window.HELL.caDone = hlCaDone;
window.HELL.caN = () => HL_CA_N;
window.HELL.openStation = hlOpenStation;
window.HELL.closeCa = hlCaClose;

/* ============================================================
   17. V42 — NHẠC NỀN RIÊNG CHO KHU 6 (assets/sfx/hell_bgm.mp3)
   ------------------------------------------------------------
   Khu 6 borrow nguyên khuôn của inpeace.js:389-457 + :2004:
   * Dùng lại AudioContext CHUNG của engine (sfxCtx → getAC): không mở context
     thứ hai (Chrome chặn quá 6 context/trang) và nút 🔊 soundOn của HUD tắt
     được cả nhạc Địa Ngục vì sfxMuted() đọc đúng cờ đó.
   * fetch → decodeAudioData THỬ ĐÚNG MỘT LẦN mỗi phiên (HL_AUDIO.tried). Thiếu
     file / HTTP lỗi / giải mã lỗi → console.warn một dòng rồi im lặng, không
     một lời gọi nào lọt ra ngoài try-catch, game vẫn chạy.
   * loop vô tận, fade-in ~1.5s bằng setTargetAtTime — gán thẳng biên độ là có
     tiếng "click" ngay nốt đầu tiên.
   * Nhỏ còn 16% (duck) mỗi khi có hộp đang mở: bảng Quỷ Vương, minigame sửa
     máy, bản đồ dịch chuyển — đọc openModalEl() của engine, không sửa file nào.
   * Nhạc thành phố IM HẲN trong Khu 6 (bọc sfxBgmDuck), và DỪNG HẲN khi rời
     cảnh: hlBgmStep canh THEO S.scene chứ không canh theo hàm ra, nên cả bốn
     lối thoát đều sạch — cổng [E] VỀ PHỐ, ✕ Rời Địa Ngục, ESC, và bản đồ
     (wmGo/wmLeaveHell tự gán S.scene, không đi qua hlStreet chút nào).
   ============================================================ */
const HL_BGM_URL = 'assets/sfx/hell_bgm.mp3';
const HL_VOL = .5;                    // mức nhạc lúc đứng trong hang lửa
const HL_VOL_DUCK = .16;              // mức lúc đang mở hộp
const HL_AUDIO = { tried: false, buf: null, src: null, gain: null, want: -1, on: false };

function hlCtx() {
  try { if (typeof sfxCtx === 'function') return sfxCtx(); } catch (e) {}
  try { if (typeof getAC === 'function') return getAC(); } catch (e) {}
  return null;
}

function hlBgmLoad() {
  if (HL_AUDIO.tried) return;
  HL_AUDIO.tried = true;
  if (!window.fetch) return;
  const a = hlCtx();
  if (!a) { console.warn('[hell] trình duyệt không có Web Audio — Khu 6 im lặng.'); return; }
  try {
    fetch(HL_BGM_URL).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.arrayBuffer();
    }).then(b => a.decodeAudioData(b)).then(buf => {
      HL_AUDIO.buf = buf;
      if (S.scene === 'HELL') hlBgmStart();
    }).catch(e => {
      console.warn('[hell] bỏ qua nhạc Địa Ngục: ' + ((e && e.message) || e));
    });
  } catch (e) {
    console.warn('[hell] bỏ qua nhạc Địa Ngục: ' + ((e && e.message) || e));
  }
}

function hlBgmStart() {
  const a = hlCtx();
  if (!a || !HL_AUDIO.buf || HL_AUDIO.src) return;
  try {
    const g = a.createGain(); g.gain.value = 0; g.connect(a.destination);
    const s = a.createBufferSource();
    s.buffer = HL_AUDIO.buf; s.loop = true; s.connect(g);
    s.start(a.currentTime);
    HL_AUDIO.src = s; HL_AUDIO.gain = g; HL_AUDIO.want = -1;
    g.gain.setTargetAtTime(hlBgmLevel(), a.currentTime, .75);
    HL_AUDIO.want = hlBgmLevel();
  } catch (e) { HL_AUDIO.src = null; HL_AUDIO.gain = null; }
}

/* Fade-out 700ms rồi mới stop(): cắt src ngay là đứt tiếng giữa chừng, nghe
   như ai đó rút dây loa. want=-1 để nếu vào lại Khu 6, hlBgmSync chắc chắn
   được chỉnh mức một lần. */
function hlBgmStop() {
  const a = hlCtx(), s = HL_AUDIO.src, g = HL_AUDIO.gain;
  HL_AUDIO.src = null; HL_AUDIO.gain = null; HL_AUDIO.want = -1;
  if (!s) return;
  try {
    if (g && a) {
      g.gain.cancelScheduledValues(a.currentTime);
      g.gain.setValueAtTime(g.gain.value, a.currentTime);
      g.gain.setTargetAtTime(0, a.currentTime, .18);
    }
    setTimeout(() => { try { s.stop(); } catch (e) {} try { s.disconnect(); if (g) g.disconnect(); } catch (e) {} }, 700);
  } catch (e) { try { s.stop(); } catch (e2) {} }
}

/* Nút 🔊 tắt ngấm > hộp đang mở > mức thường. Có HL_AUDIO.want chặn nên Web
   Audio chỉ bị chạm khi mức đích THỰC SỰ đổi, không phải 60 lần/giây. */
function hlBgmLevel() {
  if (typeof sfxMuted === 'function' && sfxMuted()) return 0;
  if ((typeof openModalEl === 'function' && openModalEl()) || HL_ST.st === 'bow') return HL_VOL_DUCK;
  return HL_VOL;
}
function hlBgmSync() {
  const a = hlCtx();
  if (!a || !HL_AUDIO.gain || !HL_AUDIO.src) return;
  const want = hlBgmLevel();
  if (want === HL_AUDIO.want) return;
  HL_AUDIO.want = want;
  try { HL_AUDIO.gain.gain.setTargetAtTime(want, a.currentTime, want === HL_VOL ? .75 : .18); } catch (e) {}
}

/* Một đường duy nhất cho mọi lối vào/ra cảnh — chạy mỗi frame trong hlUpdate. */
function hlBgmStep() {
  try {
    const inHell = S.scene === 'HELL';
    if (inHell !== HL_AUDIO.on) {
      HL_AUDIO.on = inHell;
      if (inHell) { hlBgmLoad(); hlBgmStart(); } else hlBgmStop();
    }
    if (inHell) hlBgmSync();
  } catch (e) {}
}

/* Nhạc thành phố IM HẲN trong Khu 6 (giống hệt inpeace.js:2004). SFX.duck là
   memo của sfx.js — ép về 0 thì lúc rời đi, hàm gốc tính lại thấy khác (vol
   .4) nên tự mở nhạc phố lên, không cần đụng một dòng nào của sfx.js. */
const _hlOldDuck = sfxBgmDuck;
sfxBgmDuck = function () {
  if (S.scene !== 'HELL') { _hlOldDuck.apply(this, arguments); return; }
  try {
    if (typeof SFX !== 'undefined' && SFX.on && SFX.gain && SFX.duck !== 0) {
      SFX.duck = 0;
      SFX.gain.gain.setTargetAtTime(0, SFX.ctx.currentTime, SFX_BGM.tc);
    }
  } catch (e) {}
};

window.HELL.bgm = HL_AUDIO;
window.HELL.bgmLevel = hlBgmLevel;
window.HELL.bgmUrl = HL_BGM_URL;
