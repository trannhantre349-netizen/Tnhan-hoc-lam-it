/* ============================================================
   V21 — KHU 4 "THIÊN ĐÀNG IT" (ADD-ONLY)                js/heaven.js

   KHÔNG sửa một dòng nào của code cũ. Mọi thứ đều là móc nối
   (const _old = fn; fn = function(){ ... }) theo đúng idiom mà
   game.js (Khu 3), bunnies.js, vfx.js và sfx.js đang dùng:

     update()      → hvUpdate()   : hitbox cột sáng / trạm mây
     render()      → hvRender()   : vẽ cảnh HEAVEN + nhãn [E] của riêng nó
     doAction()    → hvAction()   : bấm [E] ở cột sáng / cổng về
     propCollides()→ hvBlocked()  : đa giác mặt mây = tường vô hình
     drawDecor()   → hvBeamWorld(): cột sáng WORLD nằm trong depth sort
     bunBand()     → dải đi riêng : thỏ không nhảy ra ngoài hư không
     BunnyNPC.prototype.paint     : thỏ thiên thần (trắng + cánh + hào quang)

   Nạp SAU sfx.js để lớp bọc update() nằm ngoài cùng (bước chân vẫn tính
   đúng trên mây), và SAU game.js/bunnies.js để SCENE_WALK, STAGE_IDS,
   decor, BunnyNPC đã tồn tại.

   ---------- TOẠ ĐỘ ----------
   Khung canvas 960x600. Điểm va chạm của nhân vật là tâm (S.p.x+10,
   S.p.y+18) — mọi bán kính dưới đây đều tính theo ĐIỂM TÂM đó, không
   tính theo góc trên-trái của sprite.

   * WORLD : HV_BEAM (352,425) — dải vỉa hè trống nhất quảng trường.
     Đã chấm bằng script Node đo ảnh nền (giải mã PNG, phân loại ô 24x24):
     100% ô chân + 100% cột 170px phía trên là nền đá sáng, không đè cây/cửa/tàu.
     Cách bãi đáp phi thuyền LU_PAD (640,278) 297px → hai trigger
     không bao giờ cùng kích hoạt.
   * HEAVEN: HV_POLY là đa giác 24 đỉnh khoanh MẶT MÂY đi được, đo bằng
     Node: vùng hợp lệ (cách biên ≥9px) trải từ y 276..546, x 118..878;
     cả 4 điểm interest (bãi đáp + 3 trạm mây) đều có lề biên 44..87px
     và đường thẳng nối từng cặp nằm trọn trong mây.
   ---------- HOÀNG TÍNH ----------
   Cảnh mới KHÔNG đụng vào save: S.scene không nằm trong saveData(), còn
   3 cờ minigame đăng ký vào STAGE_IDS để applySave() giữ nguyên kiểu
   boolean như ải Mặt Trăng.
   ---------- BẢNG MÀU (V21.3 — ĐÊM HOÀNG HÔN, theo image_13.png) ----------
   CẤM HOÀN TOÀN màu trắng tinh. Cả khu là ban đêm:
   * trời      : chàm → tím sâu #05071c → #141a3f → #2b2358 → #4a3565
                 + dải sao lấp lánh (hvStars) + trăng lưỡi liềm mờ
   * mặt mây   : xanh xám đêm #507299 → #3b587c → #263d5c, viền ánh bạc
   * mây trang trí: rgba(100,120,150,.9) / mây xa rgba(120,142,178,.34)
   * bóng mây : shadowColor rgba(0,8,22,.6), blur 46
   Chi tiết "thiên đường": cổng neon IT HEAVEN + cáp vàng/xanh phát sáng,
   bệ đá mây có đôi cánh vàng ở 3 trạm, bụi linh kiện gắn bóng đèn ấm,
   rương pha lê, biển XP/COIN, tháp server pha lê phía xa.
   Bước cuối của cảnh là hvShade() phủ rgba(0,8,24,.12) lên cả canvas.
   Mọi chữ treo đi qua hvCap() (nền tối đậm + viền đen dày + bóng đen)
   để tương phản tăng chứ không giảm theo nền.
   Ngoại lệ duy nhất: trụ sáng thang máy ở WORLD (Khu 1, hvBeamWorld) vẫn
   trắng vì đó là cột ánh sáng trên nền phố nắng, không phải mặt mây.
   ============================================================ */

/* ---------- 1. CẤU HÌNH TOẠ ĐỘ ---------- */
const HV_CFG = { fade: 1000 };                       // tổng thời lượng fade trắng (ms)

/* Cột sáng ở WORLD (Khu 1). Không có va chạm — đi xuyên được, chỉ là bẫy [E]. */
const HV_BEAM = { x: 352, y: 425, r: 58 };

/* Mặt mây đi được ở HEAVEN — đa giác kín, vẽ đúng bằng đường cong này. */
const HV_POLY = [
  [112, 372], [150, 330], [214, 305], [292, 292], [372, 278],
  [462, 268], [552, 266], [636, 276], [712, 292], [780, 312],
  [838, 342], [876, 382], [888, 428], [872, 472], [832, 508],
  [760, 532], [664, 548], [548, 556], [432, 554], [330, 542],
  [244, 522], [176, 494], [130, 456], [108, 414]
];

/* Bãi đáp mây: đến và đi cùng một chỗ (giống thảm LU_MAT của Khu 3). */
const HV_LAND = { x: 214, y: 436, r: 62 };

/* 3 Trạm Máy Tính Đám Mây — kind = module trong mg-coding.js. */
const HV_PCS = [
  { id: 'hv_pc1', kind: 'sort', hard: 0, x: 352, y: 366, r: 62, icon: '💻', name: 'SẮP XẾP THUẬT TOÁN', xp: 45, coin: 700, skill: 'troubleshooting' },
  { id: 'hv_pc2', kind: 'bug', hard: 0, x: 556, y: 468, r: 62, icon: '🐞', name: 'BẮT BUG', xp: 55, coin: 850, skill: 'networking' },
  { id: 'hv_pc3', kind: 'sort', hard: 1, x: 752, y: 368, r: 62, icon: '🖥️', name: 'SẮP XẾP CODE NÂNG CAO', xp: 70, coin: 1000, skill: 'datacenter' }
];

/* Dải đi bộ thô theo trục Y — engine clampWalkY() dùng cái này, còn đa
   giác thật thì do propCollides() bọc ở mục 6 quy định. */
SCENE_WALK.HEAVEN = { minY: 276, maxY: 546, spawnY: 436 };

/* Cờ hoàn thành minigame = ải boolean (nối gót LUNAR_STAGES ở game.js:4994). */
HV_PCS.forEach(p => { STAGE_IDS[p.id] = 1; });
if (!S.missionsDone) S.missionsDone = {};
HV_PCS.forEach(p => { if (!(p.id in S.missionsDone)) S.missionsDone[p.id] = false; });

/* ---------- 1b. ĐỒ TRANG TRÍ (CHỈ VẼ — không va chạm, không toạ độ game) ----------
   Mọi điểm dưới đây đã đo bằng Node: nằm trong HV_POLY, cách mép mây ≥19px
   và cách 4 điểm interest (bãi đáp + 3 trạm) ≥ pc.r + 26px → không bao giờ
   che mất chữ nổi hay đứng "treo" ngoài hư không. */
const HV_ARCH = { cx: 218, base: 452, x0: 150, x1: 286, top: 320 };   // cổng neon
const HV_DEC = [
  { t: 'bush', x: 340, y: 506 }, { t: 'bush', x: 540, y: 300 },
  { t: 'bush', x: 824, y: 470 }, { t: 'bush', x: 648, y: 520 },
  { t: 'chest', x: 660, y: 398 }, { t: 'chest', x: 486, y: 528 },
  { t: 'post', x: 612, y: 330, txt: '⭐ XP' }, { t: 'post', x: 836, y: 438, txt: '🪙 COIN' }
];
/* sao tĩnh (seed cố định → reload không "nhảy" trời sao) */
const HV_STARS = (() => {
  const r = seeded(20261029), out = [];
  for (let i = 0; i < 132; i++)
    out.push([r() * 960, 6 + r() * 252, .7 + r() * 1.5, r() * 6.283, .5 + r() * 2.4]);
  return out;
})();
/* tinh tú lớn có ảnh chữ thập */
const HV_SPARKS = [[92, 58, 5.4], [318, 34, 4.6], [556, 76, 5.8], [742, 40, 4.4], [896, 132, 5.0], [196, 168, 4.2], [452, 128, 4.8]];
/* dải ngân hà: các đốm mờ chéo góc trên-trái */
const HV_WAY = [[120, 60, 150, 62, 'rgba(126,110,220,.10)'], [236, 96, 130, 52, 'rgba(96,150,230,.09)'], [330, 140, 108, 44, 'rgba(150,110,210,.07)'], [58, 132, 96, 40, 'rgba(90,140,220,.07)']];
/* tháp server pha lê phía xa (vẽ TRƯỚC mặt mây → chân tháp bị mây che = ở xa) */
const HV_TOWERS = [{ x: 846, y: 472, s: 1 }, { x: 906, y: 434, s: .76 }];
/* cáp tín hiệu chạy trên mặt mây: [x0,y0, x1,y1, sag, màu] */
const HV_CABLES = [
  [150, 450, 62, 430, 26, 0], [286, 452, 352, 386, 30, 1],
  [352, 386, 556, 486, 34, 0], [556, 486, 752, 388, 40, 1],
  [752, 388, 872, 462, 26, 0], [218, 322, 300, 300, -22, 1]
];
const HV_WIRE = [['252,196,64', '255,232,150'], ['56,189,248', '178,240,255']];
const HV_HALO = 'rgba(253,224,71,.95)';

/* ---------- 2. ĐA GIÁC MÂY ---------- */
function hvInPoly(x, y) {
  const P = HV_POLY; let inside = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const xi = P[i][0], yi = P[i][1], xj = P[j][0], yj = P[j][1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function hvSegDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
  let t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function hvEdgeDist(x, y) {
  const P = HV_POLY; let m = 1e9;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) m = Math.min(m, hvSegDist(x, y, P[j][0], P[j][1], P[i][0], P[i][1]));
  return m;
}
/* 9px: đủ để thân nhân vật (cao 50px tính từ chân) không "treo" qua mép mây. */
function hvOnCloud(x, y) { return hvInPoly(x, y) && hvEdgeDist(x, y) >= 9; }

/* ---------- 3. ĐƯỜNG CONG MÂY (nét vẽ = miền va chạm) ---------- */
/* Nối các đỉnh bằng quadratic đi qua ĐIỂM GIỮA mỗi cạnh: đường cong ôm sát
   đa giác (lệch < 10px) nên phần tô+viền luôn phủ toàn bộ vùng đi được. */
function hvDeckPath(g) {
  const P = HV_POLY, n = P.length;
  g.beginPath();
  g.moveTo((P[n - 1][0] + P[0][0]) / 2, (P[n - 1][1] + P[0][1]) / 2);
  for (let i = 0; i < n; i++) {
    const a = P[i], b = P[(i + 1) % n];
    g.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
  }
  g.closePath();
}
/* Bông mây: 3 cung tròn lồng nhau (giữa to, hai bên nhỏ) — vẽ bằng bezier.
   rgb = màu lõi; mặc định là xám xanh ĐÊM (100,120,150) — Khu 4 cấm trắng. */
function hvPuff(g, x, y, r, a, rgb) {
  g.fillStyle = 'rgba(' + (rgb || '100,120,150') + ',' + a + ')';
  g.beginPath();
  g.moveTo(x - r * 1.5, y);
  g.bezierCurveTo(x - r * 1.6, y - r * 1.15, x - r * .55, y - r * 1.35, x - r * .18, y - r * .92);
  g.bezierCurveTo(x + r * .28, y - r * 1.5, x + r * 1.5, y - r * 1.05, x + r * 1.42, y - r * .12);
  g.bezierCurveTo(x + r * 1.75, y + r * .42, x + r * .8, y + r * .72, x, y + r * .62);
  g.bezierCurveTo(x - r * .9, y + r * .74, x - r * 1.72, y + r * .38, x - r * 1.5, y);
  g.closePath(); g.fill();
}

/* ---------- 4. CẢNH HEAVEN ---------- */
/* Quầng sáng tròn: MỘT sprite gradient dựng sẵn cho mỗi màu rồi drawImage.
   createRadialGradient + fill mỗi lần vẽ tốn ~0.15ms — với ~50 quầng/frame
   cảnh sẽ tụt từ 1.2ms xuống 10ms, nên bắt buộc phải cache sprite. */
const HV_GLOW = {};
function hvGlow(g, x, y, r, rgb, a) {
  let s = HV_GLOW[rgb];
  if (!s) {
    s = document.createElement('canvas'); s.width = s.height = 64;
    const sc = s.getContext('2d');
    const q = sc.createRadialGradient(32, 32, 0, 32, 32, 32);
    q.addColorStop(0, 'rgba(' + rgb + ',1)');
    q.addColorStop(.45, 'rgba(' + rgb + ',.38)');
    q.addColorStop(1, 'rgba(' + rgb + ',0)');
    sc.fillStyle = q; sc.fillRect(0, 0, 64, 64);
    HV_GLOW[rgb] = s;
  }
  const prev = g.globalAlpha;
  g.globalAlpha = prev * a;
  g.drawImage(s, x - r, y - r, r * 2, r * 2);
  g.globalAlpha = prev;
}
/* Điểm trên cung tròn bậc 2 (cáp võng xuống) */
function hvQAt(x0, y0, cx, cy, x1, y1, u) {
  const m = 1 - u;
  return [m * m * x0 + 2 * m * u * cx + u * u * x1, m * m * y0 + 2 * m * u * cy + u * u * y1];
}
/* Biển nổi dùng cho MỌI chữ treo ở Khu 4: nền tối đậm + viền đen + bóng đen.
   Nền mây đã tối nên chữ PHẢI có quầng đen riêng, nếu không sẽ "chìm" vào mây. */
function hvCap(g, cx, yTop, txt, o) {
  o = o || {};
  g.font = (o.font || 'bold 10px ') + IZF;
  g.textAlign = 'center';
  const h = o.h || 16, w = g.measureText(txt).width + (o.pad == null ? 16 : o.pad);
  g.save();
  g.shadowColor = 'rgba(0,0,0,.85)'; g.shadowBlur = o.blur == null ? 12 : o.blur; g.shadowOffsetY = 3;
  g.fillStyle = o.bg || 'rgba(4,9,22,.93)';
  rr(g, cx - w / 2, yTop, w, h, o.r == null ? 8 : o.r); g.fill();
  g.restore();
  g.strokeStyle = o.rim || 'rgba(0,0,0,.95)'; g.lineWidth = o.lw || 2;
  rr(g, cx - w / 2, yTop, w, h, o.r == null ? 8 : o.r); g.stroke();
  /* gờ bạc mỏng phía trên → tem đọc được cả trên nền mây đêm lẫn trời sao */
  g.strokeStyle = 'rgba(150,178,214,.32)'; g.lineWidth = 1;
  rr(g, cx - w / 2 + 1.5, yTop + 1.5, w - 3, h - 3, o.r == null ? 7 : Math.max(2, o.r - 2)); g.stroke();
  /* nét viền đen chạy quanh chữ sáng */
  if (o.outline !== false) { g.lineWidth = o.olw == null ? 3.4 : o.olw; g.strokeStyle = 'rgba(0,0,0,.95)'; g.strokeText(txt, cx, yTop + h - 4); }
  g.fillStyle = o.fg || '#f2f8ff'; g.fillText(txt, cx, yTop + h - 4);
  g.textAlign = 'left';
  return w;
}
const HV_SKY = {
  /* mây xa trôi chậm (parallax) — toạ độ gốc, wrap theo 1100px */
  far: [[120, 118, 30], [380, 82, 22], [640, 132, 26], [860, 96, 19], [250, 176, 16], [740, 186, 14]],
  /* gờ mây chính: đỉnh lấy từ nửa trên đa giác HV_POLY */
  rim: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
};
/* 8 mức alpha dựng sẵn: đổi fillStyle bằng xâu rgba mới ở 132 sao mỗi frame
   tốn hơn cả việc vẽ chúng, nên chỉ tra bảng. */
const STAR_A = [];
for (let i = 0; i < 8; i++) STAR_A.push('rgba(226,238,255,' + (.26 + i * .0857).toFixed(3) + ')');
let HV_AUR_G = null;
function hvStars(t) {
  /* sao nhỏ: fillRect 1-2px, nhấp nháy theo sin (không shadowBlur → rẻ) */
  for (let i = 0; i < HV_STARS.length; i++) {
    const s = HV_STARS[i];
    ctx.fillStyle = STAR_A[(Math.abs(Math.sin(t * s[4] + s[3])) * 7.99) | 0];
    ctx.fillRect(s[0], s[1], s[2], s[2]);
  }
  /* sao chữ thập + quầng: vài chấm lớn để trời có "điểm nhấn" */
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineWidth = 1.4;
  for (let i = 0; i < HV_SPARKS.length; i++) {
    const p = HV_SPARKS[i], k = .3 + .7 * Math.abs(Math.sin(t * (.7 + i * .17) + i * 1.7));
    ctx.strokeStyle = 'rgba(206,226,255,' + (.55 * k).toFixed(3) + ')';
    ctx.beginPath();
    ctx.moveTo(p[0] - p[2], p[1]); ctx.lineTo(p[0] + p[2], p[1]);
    ctx.moveTo(p[0], p[1] - p[2]); ctx.lineTo(p[0], p[1] + p[2]); ctx.stroke();
    hvGlow(ctx, p[0], p[1], p[2] * 1.9, '180,210,255', .2 * k);
  }
  ctx.restore();
}
function hvMoon() {
  /* trăng lưỡi liềm mờ (rgba tối, KHÔNG trắng) ở góc trên-phải */
  const x = 902, y = 74, r = 21;
  hvGlow(ctx, x, y, r * 3.4, '150,175,230', .16);
  ctx.fillStyle = 'rgba(214,228,255,.62)';
  ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
  ctx.fillStyle = 'rgba(13,17,46,.95)';
  ctx.beginPath(); ctx.arc(x - 8.5, y - 4.5, r * .95, 0, 6.2832); ctx.fill();
}
function hvSky(t) {
  /* Trời đêm hoàng hôn: chàm gần đen trên cao → tím sâu → xanh xám sát mặt mây.
     Không có stopping nào gần trắng; sáng nhất là dải tím #4a3565. */
  const g = ctx.createLinearGradient(0, 0, 0, 600);
  g.addColorStop(0, '#05071c'); g.addColorStop(.30, '#141a3f');
  g.addColorStop(.56, '#2b2358'); g.addColorStop(.80, '#4a3565'); g.addColorStop(1, '#3b4a72');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 960, 600);
  /* dải ngân hà chéo mờ */
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < HV_WAY.length; i++) {
    const w = HV_WAY[i];
    ctx.fillStyle = w[4]; ctx.beginPath();
    ctx.ellipse(w[0], w[1], w[2], w[3], -.42, 0, 6.2832); ctx.fill();
  }
  ctx.restore();
  hvStars(t);
  hvMoon();
  /* mây xa trôi lơ lửng: xám xanh đêm, trong suất thấp */
  for (let i = 0; i < HV_SKY.far.length; i++) {
    const c = HV_SKY.far[i], sp = 5 + i * 2.4;
    const x = ((c[0] + t * sp) % 1160) - 100;
    hvPuff(ctx, x, c[1], c[2], .34, '120,142,178');
    hvPuff(ctx, x + 6, c[1] + 5, c[2] * .72, .22, '150,168,204');
  }
  /* cực quang dịu thay cho tia nắng gắt: ba dải cong mờ tím/xanh */
  if (!HV_AUR_G) {
    const mk = mid => {
      const q = ctx.createLinearGradient(0, 40, 0, 300);
      q.addColorStop(0, 'rgba(126,160,255,0)'); q.addColorStop(.4, mid); q.addColorStop(1, 'rgba(140,120,220,0)');
      return q;
    };
    HV_AUR_G = [mk('rgba(110,180,240,.075)'), mk('rgba(168,130,230,.075)')];
  }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const x = 180 + i * 240, wob = Math.sin(t * .35 + i * 2.1) * 26;
    ctx.fillStyle = HV_AUR_G[i === 1 ? 1 : 0];
    ctx.beginPath(); ctx.moveTo(x - 34 + wob, 40); ctx.lineTo(x + 34 + wob, 40);
    ctx.lineTo(x + 118 - wob, 300); ctx.lineTo(x + 26 - wob, 300); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function hvDeck(t) {
  /* 0) quầng bóng đen xanh quanh mây: vẽ TRƯỚC, nét to hơn thân mây ~23px để
        khối mây tách khỏi trời đêm và tuyệt đối không "cháy" sáng. */
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(0,8,22,.42)'; ctx.lineWidth = 92; hvDeckPath(ctx); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,8,22,.5)'; ctx.lineWidth = 62; hvDeckPath(ctx); ctx.stroke();
  ctx.restore();
  /* 1) THÂN MÂY = XÁM XANH ĐÊM #507299 (cấm trắng tinh), đổ bóng đen đậm →
        mây nổi khối, nhìn như đá mây dưới ánh trăng. */
  ctx.save();
  ctx.shadowColor = 'rgba(0,8,22,.6)'; ctx.shadowBlur = 46; ctx.shadowOffsetY = 22;
  hvDeckPath(ctx);
  const g = ctx.createLinearGradient(0, 250, 0, 580);
  g.addColorStop(0, '#507299'); g.addColorStop(.5, '#3b587c'); g.addColorStop(1, '#263d5c');
  ctx.fillStyle = g; ctx.fill();
  ctx.restore();
  /* 2) viền bông 46px: miền vẽ RỘNG hơn miền va chạm 23px → chắc chắn
        mọi điểm đi được đều nằm trên mây đã tô. */
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = 46;
  ctx.strokeStyle = 'rgba(74,104,142,.92)'; hvDeckPath(ctx); ctx.stroke();
  ctx.restore();
  /* 3) gờ ÁNH BẠC trên mép + nét đen chân mây → khối rõ, chất "đêm" */
  ctx.save(); ctx.lineWidth = 2.6; ctx.strokeStyle = 'rgba(168,196,228,.5)'; hvDeckPath(ctx); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.lineWidth = 1.8; ctx.strokeStyle = 'rgba(0,6,18,.72)'; hvDeckPath(ctx); ctx.stroke(); ctx.restore();
  /* 4) bông mây trên gờ (đỉnh 0..10 = nửa trên đa giác). KHÔNG đổ bóng riêng
        cho từng bông: shadowBlur là nét vẽ đắt nhất của cảnh (11 bông = +2ms
        mỗi frame) mà bóng của chúng nằm lọt trong bóng thân mây anyway. */
  for (const i of HV_SKY.rim) {
    const p = HV_POLY[i];
    hvPuff(ctx, p[0], p[1] + 4, 26 + (i % 3) * 7, .9, '86,110,146');
    ctx.strokeStyle = 'rgba(160,188,220,.28)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(p[0], p[1] + 4, 20 + (i % 3) * 5, 3.6, 5.5); ctx.stroke();
    ctx.fillStyle = 'rgba(0,6,18,.34)';
    ctx.beginPath(); ctx.ellipse(p[0], p[1] + 14, 22 + (i % 3) * 5, 7, 0, 0, 6.2832); ctx.fill();
  }
  /* 5) gờ dưới: bóng đen cho thấy khối mây dày */
  for (let i = 12; i < 24; i += 2) {
    const p = HV_POLY[i];
    ctx.fillStyle = 'rgba(0,6,18,.44)';
    ctx.beginPath(); ctx.ellipse(p[0], p[1] + 16, 40, 15, 0, 0, 6.2832); ctx.fill();
  }
  /* 6) vân mây trôi + bóng râm đáy, tất cả nằm trong clip của mặt mây */
  ctx.save(); hvDeckPath(ctx); ctx.clip();
  for (let i = 0; i < 7; i++) {
    const x = ((t * (9 + i * 3)) % 1200) - 120, y = 300 + i * 34;
    ctx.fillStyle = 'rgba(150,175,205,.1)';
    ctx.beginPath(); ctx.ellipse(x, y, 92, 13, 0, 0, 6.2832); ctx.fill();
  }
  const sh = ctx.createLinearGradient(0, 420, 0, 580);
  sh.addColorStop(0, 'rgba(0,6,18,0)'); sh.addColorStop(1, 'rgba(0,6,18,.46)');
  ctx.fillStyle = sh; ctx.fillRect(0, 420, 960, 160);
  ctx.restore();
}
/* "Kính râm" cho cả Khu 4: một lớp phủ xanh đen nhạt lên toàn bộ canvas của
   scene, vẽ SAU phần cảnh nhưng TRƯỚC các chữ nổi để HUD DOM + nhãn [E]
   không bị giảm tương phản thêm. */
function hvShade() {
  ctx.fillStyle = 'rgba(0,8,24,.12)';
  ctx.fillRect(0, 0, 960, 600);
}

/* ---------- 4b. CHI TIẾT "THIÊN ĐÀNG" (V21.3) ---------- */
/* Tháp server pha lê phía xa: vẽ TRƯỚC mặt mây nên chân tháp bị mây che,
   nhìn thành cảnh nền ở tít sau gờ mây — không chặn đường đi. */
function hvTower(t, w) {
  const s = w.s, x = w.x, base = w.y, lv = 4, bw = 46 * s;
  const topRack = base - 34 * s - lv * 30 * s;
  /* thác ánh sáng đổ dọc thân */
  const wf = ctx.createLinearGradient(0, topRack, 0, base + 40);
  wf.addColorStop(0, 'rgba(120,220,255,.42)'); wf.addColorStop(1, 'rgba(120,220,255,0)');
  ctx.fillStyle = wf;
  ctx.beginPath(); ctx.moveTo(x + bw * .30, topRack + 6); ctx.lineTo(x + bw * .46, topRack + 6);
  ctx.lineTo(x + bw * .60, base + 40); ctx.lineTo(x + bw * .16, base + 40); ctx.closePath(); ctx.fill();
  for (let k = 0; k < lv; k++) {
    const lh = 26 * s, lw = bw - k * 3 * s, ly = base - 34 * s - k * 30 * s - lh;
    ctx.fillStyle = '#1b2740'; rr(ctx, x - lw / 2, ly, lw, lh, 4 * s); ctx.fill();
    ctx.strokeStyle = 'rgba(6,12,26,.95)'; ctx.lineWidth = 1.6; rr(ctx, x - lw / 2, ly, lw, lh, 4 * s); ctx.stroke();
    ctx.strokeStyle = 'rgba(150,180,220,.22)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - lw / 2 + 3, ly + 1.5); ctx.lineTo(x + lw / 2 - 3, ly + 1.5); ctx.stroke();
    for (let j = 0; j < 3; j++) {
      const on = .45 + .5 * Math.abs(Math.sin(t * 2.1 + k * 1.3 + j));
      ctx.fillStyle = j === 1 ? 'rgba(250,196,88,' + on + ')' : 'rgba(96,220,255,' + on + ')';
      ctx.fillRect(x - lw / 2 + 6 * s + j * 9 * s, ly + 7 * s, 5 * s, 2.6 * s);
    }
  }
  /* khối pha lê trên đỉnh */
  const cy = topRack - 22 * s, r = 17 * s;
  hvGlow(ctx, x, cy, r * 2.6, '120,200,255', .3 + .12 * Math.sin(t * 1.7));
  ctx.fillStyle = 'rgba(96,180,236,.85)';
  ctx.beginPath(); ctx.moveTo(x, cy - r); ctx.lineTo(x + r, cy); ctx.lineTo(x, cy + r); ctx.lineTo(x - r, cy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(168,226,255,.62)';
  ctx.beginPath(); ctx.moveTo(x, cy - r); ctx.lineTo(x + r, cy); ctx.lineTo(x, cy); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(10,24,44,.9)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(x, cy - r); ctx.lineTo(x + r, cy); ctx.lineTo(x, cy + r); ctx.lineTo(x - r, cy); ctx.closePath(); ctx.stroke();
  /* ăng-ten thiên thần */
  ctx.strokeStyle = 'rgba(200,220,246,.5)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(x, cy - r); ctx.lineTo(x, cy - r - 16 * s); ctx.stroke();
  ctx.strokeStyle = HV_HALO; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(x, cy - r - 20 * s, 9 * s, 3.2 * s, 0, 0, 6.2832); ctx.stroke();
}
function hvTowers(t) { for (const w of HV_TOWERS) hvTower(t, w); }

/* Cáp tín hiệu neon bò trên mặt mây: vỏ đen → lõi màu → xung dữ liệu chạy. */
function hvCables(t) {
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < HV_CABLES.length; i++) {
    const c = HV_CABLES[i], x0 = c[0], y0 = c[1], x1 = c[2], y1 = c[3];
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2 + c[4], wc = HV_WIRE[c[5]];
    const path = () => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1); };
    path(); ctx.strokeStyle = 'rgba(4,8,20,.6)'; ctx.lineWidth = 5.6; ctx.stroke();
    path(); ctx.strokeStyle = 'rgba(' + wc[0] + ',.9)'; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    path(); ctx.strokeStyle = 'rgba(' + wc[1] + ',.13)'; ctx.lineWidth = 8; ctx.stroke();
    ctx.restore();
    const u = (t * .26 + i * .17) % 1, q = hvQAt(x0, y0, cx, cy, x1, y1, u);
    hvGlow(ctx, q[0], q[1], 10, wc[1], .45);
    ctx.fillStyle = 'rgba(' + wc[1] + ',.95)';
    ctx.beginPath(); ctx.arc(q[0], q[1], 2.2, 0, 6.2832); ctx.fill();
    /* hai đầu nối */
    for (const e of [[x0, y0], [x1, y1]]) {
      ctx.fillStyle = '#24344f'; rr(ctx, e[0] - 4, e[1] - 3.4, 8, 6.8, 2); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 1.2; rr(ctx, e[0] - 4, e[1] - 3.4, 8, 6.8, 2); ctx.stroke();
    }
  }
  ctx.restore();
}
/* Cổng trời neon "IT HEAVEN" — đứng ngay trên bãi đáp, là điểm dịch chuyển. */
function hvArch(t) {
  const A = HV_ARCH, p = .5 + Math.sin(t * 1.8) * .5;
  const barY = A.top, barH = 34;
  /* bản rộng thanh ngang NẺO THEO chữ → không bao giờ bị cắt mất tên cổng */
  ctx.font = 'bold 17px ' + IZF;
  const bw = Math.max((A.x1 - A.x0) + 32, ctx.measureText('✦ IT HEAVEN ✦').width + 30), bx = A.cx - bw / 2;
  ctx.font = '10px ' + IZF;
  for (const px of [A.x0, A.x1]) {
    ctx.fillStyle = 'rgba(0,6,18,.45)';
    ctx.beginPath(); ctx.ellipse(px, A.base + 4, 17, 5.5, 0, 0, 6.2832); ctx.fill();
    const pg = ctx.createLinearGradient(px - 9, 0, px + 9, 0);
    pg.addColorStop(0, '#22304c'); pg.addColorStop(.42, '#5c7796'); pg.addColorStop(1, '#1d2942');
    ctx.fillStyle = pg; rr(ctx, px - 9, barY + barH - 6, 18, A.base - barY - barH + 6, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.lineWidth = 1.8;
    rr(ctx, px - 9, barY + barH - 6, 18, A.base - barY - barH + 6, 7); ctx.stroke();
    ctx.strokeStyle = 'rgba(120,220,255,' + (.3 + p * .35) + ')'; ctx.lineWidth = 2;
    ctx.setLineDash([9, 13]); ctx.lineDashOffset = -t * 34;
    ctx.beginPath(); ctx.moveTo(px, A.base - 5); ctx.lineTo(px, barY + barH + 2); ctx.stroke();
    ctx.setLineDash([]); ctx.lineDashOffset = 0;
  }
  /* thanh ngang: nền đá tối + viền neon kép (vàng trong, cyan ngoài) */
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
  const bg = ctx.createLinearGradient(0, barY, 0, barY + barH);
  bg.addColorStop(0, '#2c3f60'); bg.addColorStop(1, '#141e33');
  ctx.fillStyle = bg; rr(ctx, bx, barY, bw, barH, 13); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,.95)'; ctx.lineWidth = 3; rr(ctx, bx, barY, bw, barH, 13); ctx.stroke();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgba(252,211,77,' + (.55 + p * .3) + ')'; ctx.lineWidth = 2.4;
  rr(ctx, bx + 4, barY + 4, bw - 8, barH - 8, 10); ctx.stroke();
  ctx.strokeStyle = 'rgba(103,232,249,.42)'; ctx.lineWidth = 1.2;
  rr(ctx, bx + 1.6, barY + 1.6, bw - 3.2, barH - 3.2, 11.5); ctx.stroke();
  ctx.restore();
  /* chữ neon */
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  hvGlow(ctx, A.cx, barY + barH / 2, 62, '252,211,77', .1 + p * .06);
  ctx.restore();
  ctx.font = 'bold 17px ' + IZF; ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,.95)'; ctx.strokeText('✦ IT HEAVEN ✦', A.cx, barY + 24);
  const tg = ctx.createLinearGradient(0, barY + 8, 0, barY + 26);
  tg.addColorStop(0, '#fff3c4'); tg.addColorStop(.5, '#fcd34d'); tg.addColorStop(1, '#f59e0b');
  ctx.fillStyle = tg; ctx.fillText('✦ IT HEAVEN ✦', A.cx, barY + 24);
  ctx.textAlign = 'left'; ctx.font = '10px ' + IZF;
  /* dây đèn nháy vắt từ cổng xuống mặt mây */
  ctx.strokeStyle = 'rgba(10,16,32,.55)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(A.x0, barY + barH); ctx.quadraticCurveTo(A.cx, barY + barH + 34, A.x1, barY + barH); ctx.stroke();
  for (let i = 1; i <= 7; i++) {
    const u = i / 8, q = hvQAt(A.x0, barY + barH, A.cx, barY + barH + 34, A.x1, barY + barH, u);
    const on = .45 + .55 * Math.abs(Math.sin(t * 3 + i * 1.1));
    const col = i % 2 ? '252,211,77' : '103,232,249';
    hvGlow(ctx, q[0], q[1] + 3, 6, col, .3 * on);
    ctx.fillStyle = 'rgba(' + col + ',' + (.55 + on * .45) + ')';
    ctx.beginPath(); ctx.arc(q[0], q[1] + 3, 2, 0, 6.2832); ctx.fill();
  }
}
/* Bụi linh kiện: tán lá đêm + chip + bóng đèn filament ấm */
function hvBush(t, x, y) {
  const p = .5 + Math.sin(t * 2.2 + x * .05) * .5;
  ctx.fillStyle = 'rgba(0,6,18,.42)';
  ctx.beginPath(); ctx.ellipse(x, y + 5, 26, 7, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = '#16302b';
  for (const d of [[-15, -4, 13], [0, -12, 15], [15, -4, 12]]) {
    ctx.beginPath(); ctx.arc(x + d[0], y + d[1], d[2], 0, 6.2832); ctx.fill();
  }
  ctx.fillStyle = '#245044';
  for (const d of [[-9, -10, 8], [7, -15, 9], [16, -8, 6]]) {
    ctx.beginPath(); ctx.arc(x + d[0], y + d[1], d[2], 0, 6.2832); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x - 22, y + 2); ctx.quadraticCurveTo(x, y - 22, x + 22, y + 2); ctx.stroke();
  /* chip IC cắm trong bụi */
  ctx.fillStyle = '#16273f'; rr(ctx, x - 8, y - 9, 16, 11, 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.lineWidth = 1.2; rr(ctx, x - 8, y - 9, 16, 11, 2); ctx.stroke();
  ctx.fillStyle = 'rgba(150,180,220,.5)';
  for (let i = 0; i < 4; i++) ctx.fillRect(x - 6 + i * 4, y - 11.5, 2, 3);
  ctx.fillStyle = 'rgba(96,220,255,' + (.4 + p * .5) + ')'; ctx.fillRect(x - 5, y - 5, 10, 2);
  /* hai bóng đèn trên cuống */
  for (const b of [[-19, -20], [19, -18]]) {
    const bx = x + b[0], by = y + b[1];
    ctx.strokeStyle = '#123028'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(x + b[0] * .5, y - 6); ctx.quadraticCurveTo(bx, by + 12, bx, by + 5); ctx.stroke();
    ctx.fillStyle = '#2a3550'; rr(ctx, bx - 3, by + 1, 6, 4.5, 1.5); ctx.fill();
    hvGlow(ctx, bx, by - 3, 15, '255,206,110', .22 + p * .12);
    ctx.fillStyle = 'rgba(255,226,150,' + (.72 + p * .2) + ')';
    ctx.beginPath(); ctx.arc(bx, by - 3, 5.2, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = 'rgba(255,244,200,.9)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(bx - 1.6, by); ctx.lineTo(bx, by - 5); ctx.lineTo(bx + 1.6, by); ctx.stroke();
  }
}
/* Rương báu pha lê đặt trên bông mây */
function hvChest(t, x, y) {
  const p = .5 + Math.sin(t * 1.5 + x * .03) * .5;
  ctx.fillStyle = 'rgba(0,6,18,.4)';
  ctx.beginPath(); ctx.ellipse(x, y + 8, 24, 6.5, 0, 0, 6.2832); ctx.fill();
  hvPuff(ctx, x, y + 6, 17, .85, '78,102,136');
  hvGlow(ctx, x, y - 6, 30, '120,200,255', .16 + p * .1);
  /* nắp + thân pha lê */
  ctx.fillStyle = 'rgba(74,144,196,.92)';
  ctx.beginPath(); ctx.moveTo(x - 17, y - 2); ctx.lineTo(x - 13, y - 13); ctx.lineTo(x + 13, y - 13); ctx.lineTo(x + 17, y - 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(120,196,240,.92)'; rr(ctx, x - 17, y - 2, 34, 12, 3); ctx.fill();
  ctx.fillStyle = 'rgba(196,236,255,.55)'; rr(ctx, x - 15, y - 1, 30, 3.4, 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(x - 17, y - 2); ctx.lineTo(x - 13, y - 13); ctx.lineTo(x + 13, y - 13); ctx.lineTo(x + 17, y - 2); ctx.closePath(); ctx.stroke();
  rr(ctx, x - 17, y - 2, 34, 12, 3); ctx.stroke();
  /* khóa vàng + tia sáng */
  ctx.fillStyle = 'rgba(252,211,77,' + (.8 + p * .2) + ')'; rr(ctx, x - 3.5, y - 5, 7, 9, 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 1; rr(ctx, x - 3.5, y - 5, 7, 9, 2); ctx.stroke();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,240,190,.5)'; ctx.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    const a = t * .8 + i * 2.1;
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 6, y - 16 + Math.sin(a) * 2);
    ctx.lineTo(x + Math.cos(a) * 15, y - 26 + Math.sin(a) * 4); ctx.stroke();
  }
  ctx.restore();
}
/* Biển hiệu XP / COIN: cột + bảng mũi tên nền tối chữ neon */
function hvPost(t, x, y, txt) {
  const p = .5 + Math.sin(t * 2.4 + x * .04) * .5, top = y - 34;
  ctx.fillStyle = 'rgba(0,6,18,.4)';
  ctx.beginPath(); ctx.ellipse(x, y + 3, 11, 4, 0, 0, 6.2832); ctx.fill();
  ctx.fillStyle = '#3d4f6e'; rr(ctx, x - 2.5, top + 10, 5, y - top - 8, 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.lineWidth = 1.2; rr(ctx, x - 2.5, top + 10, 5, y - top - 8, 2); ctx.stroke();
  const w = 46, h = 22, bx = x - w / 2;
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.85)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
  ctx.fillStyle = 'rgba(8,14,30,.95)';
  ctx.beginPath();
  ctx.moveTo(bx + 4, top); ctx.lineTo(bx + w - 4, top); ctx.lineTo(bx + w + 7, top + h / 2);
  ctx.lineTo(bx + w - 4, top + h); ctx.lineTo(bx + 4, top + h); ctx.lineTo(bx - 7, top + h / 2);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,.95)'; ctx.lineWidth = 2.2; ctx.stroke();
  ctx.strokeStyle = 'rgba(' + (txt.indexOf('XP') >= 0 ? '103,232,249' : '252,211,77') + ',' + (.45 + p * .4) + ')';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(bx + 3, top + 2); ctx.lineTo(bx + w - 3, top + 2); ctx.stroke();
  hvGlow(ctx, x, top + h / 2, 26, txt.indexOf('XP') >= 0 ? '103,232,249' : '252,211,77', .1 + p * .07);
  ctx.font = 'bold 11px ' + IZF; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
  ctx.lineWidth = 3.6; ctx.strokeStyle = 'rgba(0,0,0,.95)'; ctx.strokeText(txt, x, top + 15);
  ctx.fillStyle = txt.indexOf('XP') >= 0 ? '#a5f3fc' : '#fde68a'; ctx.fillText(txt, x, top + 15);
  ctx.textAlign = 'left';
}
function hvDec(d, t) {
  if (d.t === 'bush') hvBush(t, d.x, d.y);
  else if (d.t === 'chest') hvChest(t, d.x, d.y);
  else hvPost(t, d.x, d.y, d.txt);
}

/* Bãi đáp / cổng về: vòng xoáy mây + trụ sáng xuống dưới */
function hvGate(t) {
  const p = .5 + Math.sin(t * 2.1) * .5;
  ctx.fillStyle = 'rgba(56,189,248,' + (.14 + p * .1) + ')';
  ellipsePath(ctx, HV_LAND.x, HV_LAND.y, HV_LAND.r, HV_LAND.r * .4); ctx.fill();
  ctx.strokeStyle = 'rgba(103,232,249,' + (.55 + p * .35) + ')'; ctx.lineWidth = 2.6; ctx.setLineDash([10, 8]);
  ctx.lineDashOffset = -t * 26;
  ellipsePath(ctx, HV_LAND.x, HV_LAND.y, HV_LAND.r, HV_LAND.r * .4); ctx.stroke();
  ctx.setLineDash([]); ctx.lineDashOffset = 0;
  for (let k = 0; k < 3; k++) {
    ctx.strokeStyle = 'rgba(150,196,232,' + (.5 - k * .13) + ')'; ctx.lineWidth = 2;
    ellipsePath(ctx, HV_LAND.x, HV_LAND.y - 2, (HV_LAND.r - 14 - k * 13) * (.9 + p * .1), (HV_LAND.r - 14 - k * 13) * .36);
    ctx.stroke();
  }
  const lg = ctx.createLinearGradient(0, HV_LAND.y - 150, 0, HV_LAND.y);
  lg.addColorStop(0, 'rgba(120,190,235,0)'); lg.addColorStop(1, 'rgba(140,205,245,' + (.24 + p * .14) + ')');
  ctx.fillStyle = lg;
  ctx.beginPath(); ctx.moveTo(HV_LAND.x - 26, HV_LAND.y - 4); ctx.lineTo(HV_LAND.x + 26, HV_LAND.y - 4);
  ctx.lineTo(HV_LAND.x + 12, HV_LAND.y - 150); ctx.lineTo(HV_LAND.x - 12, HV_LAND.y - 150); ctx.closePath(); ctx.fill();
  if (!(targetAct && targetAct.t === 'hv_world'))
    hvCap(ctx, HV_LAND.x, HV_LAND.y - 176, '☁️ CỔNG VỀ THÀNH PHỐ', { pad: 14 });
}
/* Trạm Máy Tính Đám Mây: bệ đá mây + đôi cánh vàng + màn hình code + cáp */
function hvPc(pc, t, active) {
  const done = !!S.missionsDone[pc.id], bob = Math.sin(t * 1.6 + pc.x * .01) * 2.4;
  const x = pc.x, y = pc.y + bob;
  ctx.fillStyle = 'rgba(0,6,18,.45)';
  ctx.beginPath(); ctx.ellipse(x, y + 8, 48, 14, 0, 0, 6.2832); ctx.fill();
  hvPuff(ctx, x, y + 4, 32, .95, '78,102,136');
  /* BỆ ĐÁ MÂY: khối đá bậc thang đỡ bàn, tối dần xuống đáy */
  const rg = ctx.createLinearGradient(0, y - 20, 0, y + 16);
  rg.addColorStop(0, '#546f92'); rg.addColorStop(1, '#2a3d59');
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.moveTo(x - 34, y - 14); ctx.lineTo(x - 26, y + 4); ctx.lineTo(x - 12, y + 13);
  ctx.lineTo(x + 14, y + 13); ctx.lineTo(x + 28, y + 4); ctx.lineTo(x + 34, y - 14);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.lineWidth = 1.8; ctx.stroke();
  ctx.strokeStyle = 'rgba(160,188,220,.3)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x - 32, y - 11); ctx.lineTo(x + 32, y - 11); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,6,18,.5)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(x - 18, y - 8); ctx.lineTo(x - 22, y + 10);
  ctx.moveTo(x + 16, y - 8); ctx.lineTo(x + 21, y + 10); ctx.stroke();
  ctx.fillStyle = 'rgba(0,6,18,.34)';
  ctx.beginPath(); ctx.ellipse(x, y + 12, 30, 7, 0, 0, 6.2832); ctx.fill();
  /* ĐÔI CÁNH VÀNG hai bên màn hình (pivot = dùng thẳng y làm trục cánh) */
  const mw = 62, mh = 40, mx = x - mw / 2, my = y - 26 - mh;
  hvWings(ctx, x, my + mh * .58, 112, t * .5 + pc.x * .01, HV_WING_G, true);
  /* chân bàn */
  ctx.fillStyle = '#41597c'; rr(ctx, x - 20, y - 26, 40, 8, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 1.4; rr(ctx, x - 20, y - 26, 40, 8, 4); ctx.stroke();
  /* thân màn hình */
  ctx.fillStyle = '#182338'; rr(ctx, mx - 3, my - 3, mw + 6, mh + 6, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.95)'; ctx.lineWidth = 1.8; rr(ctx, mx - 3, my - 3, mw + 6, mh + 6, 7); ctx.stroke();
  const sg = ctx.createLinearGradient(0, my, 0, my + mh);
  sg.addColorStop(0, done ? '#0b2f22' : '#08131f'); sg.addColorStop(1, done ? '#0f4430' : '#101f36');
  ctx.fillStyle = sg; rr(ctx, mx, my, mw, mh, 5); ctx.fill();
  /* code trên màn hình + quầng sáng màn hình hắt ra đêm */
  const cols = done ? ['#4ade80', '#86efac', '#22c55e'] : ['#7dd3fc', '#fde047', '#f0abfc'];
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  hvGlow(ctx, x, my + mh / 2, 46, done ? '74,222,128' : '96,180,240', .13);
  ctx.restore();
  for (let i = 0; i < 4; i++) {
    const lw = 12 + ((i * 17 + pc.x) % 26);
    ctx.fillStyle = cols[i % 3]; ctx.globalAlpha = .55 + .35 * Math.abs(Math.sin(t * 1.3 + i + pc.x));
    ctx.fillRect(mx + 6 + (i % 2) * 5, my + 7 + i * 8, lw, 3);
  }
  ctx.globalAlpha = 1;
  /* bàn phím + chuột */
  ctx.fillStyle = '#5b7396'; rr(ctx, x - 22, y - 17, 30, 9, 3); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 1; rr(ctx, x - 22, y - 17, 30, 9, 3); ctx.stroke();
  ctx.fillStyle = '#4c648a';
  ctx.beginPath(); ctx.ellipse(x + 16, y - 13, 5, 3.4, 0, 0, 6.2832); ctx.fill();
  /* hào quang trạm đang đứng cạnh */
  const pulse = .5 + Math.sin(t * 3.2) * .5;
  ctx.strokeStyle = active ? 'rgba(253,224,71,.95)' : (done ? 'rgba(74,222,128,.55)' : 'rgba(103,232,249,.5)');
  ctx.lineWidth = active ? 3 : 2; ctx.setLineDash([8, 7]); ctx.lineDashOffset = -t * 22;
  ellipsePath(ctx, x, y + 6, 44, 15); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
  if (!active) { ctx.globalAlpha = .3 + pulse * .3; ellipsePath(ctx, x, y + 6, 44 + pulse * 6, 15 + pulse * 3); ctx.stroke(); ctx.globalAlpha = 1; }
  /* biển nổi */
  hvCap(ctx, x, my - 26, (done ? '✅ ' : '') + pc.icon + ' ' + pc.name, {
    font: 'bold 10.5px ', h: 17, r: 8,
    fg: done ? '#c8f7d9' : '#f2f8ff',
    bg: done ? 'rgba(6,26,20,.95)' : 'rgba(4,9,22,.95)'
  });
}
/* Nhãn [E] — cùng kiểu, cùng hình với engine.render (engine vẽ rồi bị nền
   mây tô đè, nên cảnh tự dựng phải tự vẽ lại nhãn). */
function hvLabel(txt) {
  const bx = S.p.x + 10, by = S.p.y - 36, bounce = Math.sin(Date.now() * .006) * 2;
  ctx.font = 'bold 10px monospace';
  const w = Math.max(100, ctx.measureText(txt).width + 26), h = 20, r = 6;
  const x0 = bx - w / 2, y0 = by + bounce;
  /* 1) khối vàng + mũi tên đổ bóng xuống nền mây đêm → tem không "chìm" */
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 3;
  ctx.fillStyle = 'rgba(250,204,21,.97)';
  rr(ctx, x0, y0, w, h, r); ctx.fill();
  ctx.beginPath(); ctx.moveTo(bx - 5, y0 + h); ctx.lineTo(bx + 5, y0 + h); ctx.lineTo(bx, y0 + h + 6); ctx.fill();
  ctx.restore();
  /* 2) viền đen ĐẬY bao quanh tem + mũi tên */
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(0,0,0,.98)'; ctx.lineWidth = 2.8;
  rr(ctx, x0, y0, w, h, r); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx - 5, y0 + h); ctx.lineTo(bx + 5, y0 + h); ctx.lineTo(bx, y0 + h + 6); ctx.closePath(); ctx.stroke();
  /* 3) chữ đậm có quầng đen mảnh → nét chữ không bị nền vàng "nuốt" */
  ctx.textAlign = 'center';
  ctx.lineWidth = 2.4; ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.strokeText(txt, bx, y0 + 14);
  ctx.fillStyle = '#0b1220'; ctx.fillText(txt, bx, y0 + 14);
  ctx.textAlign = 'left';
}
function hvScene() {
  const t = Date.now() / 1000;
  hvSky(t);
  hvTowers(t);
  hvDeck(t);
  hvCables(t);
  hvGate(t);
  hvArch(t);
  /* depth sort: trạm/thảm/đồ trang trí nào thấp hơn (gần người xem hơn) vẽ sau */
  const list = HV_PCS.map(pc => ({ k: pc.y, f: () => hvPc(pc, t, !!(targetAct && targetAct.t === 'hv_pc' && HV_PCS[targetAct.i] === pc)) }));
  HV_DEC.forEach(d => list.push({ k: d.y - 6, f: () => hvDec(d, t) }));
  list.push({ k: S.p.y + 30, f: () => drawSprite(S.p.x, S.p.y, 'p') });
  list.sort((a, b) => a.k - b.k).forEach(o => o.f());
  /* biển khu */
  hvCap(ctx, 480, 22, '☁️ KHU 4 · THIÊN ĐÀNG IT — ĐÁM MÂY LẬP TRÌNH', { font: 'bold 13px ', h: 24, r: 12, blur: 16, olw: 4 });
  if (targetAct) hvLabel(targetAct.txt || '');
  try { if (typeof bunOverlay === 'function') bunOverlay(); } catch (e) {}
  /* bước CUỐI của cảnh: lớp "kính râm" phủ toàn bộ canvas HEAVEN (HUD là DOM
     nằm trên canvas nên không bị ảnh hưởng). */
  hvShade();
}

/* ---------- 5. CỘT SÁNG Ở WORLD (đi qua depth sort thật) ---------- */
decor.push({ t: 'hv_beam', x: HV_BEAM.x, y: HV_BEAM.y, s: 1 });
function hvBeamWorld(d) {
  const t = Date.now() / 1000, x = d.x, y = d.y, p = .5 + Math.sin(t * 2.4) * .5;
  ctx.fillStyle = 'rgba(125,211,252,' + (.13 + p * .09) + ')';
  ellipsePath(ctx, x, y, 46, 17); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,' + (.6 + p * .3) + ')'; ctx.lineWidth = 2.4; ctx.setLineDash([9, 7]);
  ctx.lineDashOffset = -t * 24; ellipsePath(ctx, x, y, 46, 17); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
  /* trụ sáng: loe dần lên cao, trong suốt nên nhân vật đứng trước vẫn thấy */
  const hg = ctx.createLinearGradient(0, y - 210, 0, y);
  hg.addColorStop(0, 'rgba(255,255,255,0)'); hg.addColorStop(.55, 'rgba(224,246,255,.3)'); hg.addColorStop(1, 'rgba(255,255,255,.62)');
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.moveTo(x - 34, y - 2); ctx.lineTo(x + 34, y - 2); ctx.lineTo(x + 19, y - 210); ctx.lineTo(x - 19, y - 210); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const cg = ctx.createLinearGradient(0, y - 205, 0, y);
  cg.addColorStop(0, 'rgba(255,255,255,0)'); cg.addColorStop(1, 'rgba(255,255,255,.5)');
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.moveTo(x - 12, y - 2); ctx.lineTo(x + 12, y - 2); ctx.lineTo(x + 6, y - 205); ctx.lineTo(x - 6, y - 205); ctx.closePath(); ctx.fill();
  ctx.restore();
  /* bông sáng bay lên dọc trụ */
  for (let i = 0; i < 7; i++) {
    const k = ((t * .34 + i / 7) % 1), sy = y - k * 205, sx = x + Math.sin(k * 7 + i) * (16 - k * 9);
    ctx.fillStyle = 'rgba(255,255,255,' + (.75 * (1 - k)) + ')';
    ctx.beginPath(); ctx.arc(sx, sy, 2.6 - k, 0, 6.2832); ctx.fill();
  }
  /* vòng thiên thần trên đỉnh */
  ctx.strokeStyle = 'rgba(253,224,71,' + (.5 + p * .4) + ')'; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.ellipse(x, y - 212, 20, 6.5, 0, 0, 6.2832); ctx.stroke();
  if (!(targetAct && targetAct.t === 'to_heaven'))
    hvCap(ctx, x, y + 12, '✦ THANG MÁY THIÊN ĐÀNG', { h: 16, pad: 14 });
}

/* ---------- 6. MÓC NỐI VẬT LÝ: ĐA GIÁC = TƯỜNG ---------- */
const _hvOldProp = propCollides;
propCollides = function (sc, nx, ny) {
  if (sc !== 'HEAVEN') return _hvOldProp(sc, nx, ny);
  if (hvOnCloud(nx + 10, ny + 18)) return false;
  /* lỡ đang đứng ngoài mây (save cũ / teleport) → mở chặn để còn đi vào lại */
  return hvOnCloud(S.p.x + 10, S.p.y + 18);
};

/* ---------- 7. FADE TRẮNG 1 GIÂY ---------- */
let HV_CUT = null;
function hvCutOv() {
  let ov = document.getElementById('hv-cut');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'hv-cut'; ov.className = 'modal';
    ov.innerHTML = '<canvas id="hv-cut-cv" width="960" height="600" style="width:100%;height:100%;display:block"></canvas>';
    document.getElementById('app').appendChild(ov);
  }
  ov.style.cssText = 'display:flex;position:absolute;inset:0;padding:0;margin:0;background:transparent;' +
    'border:0;border-radius:0;z-index:150;transform:none;animation:none;overflow:hidden';
  return ov;
}
function hvCutFrame(c, p, cap) {
  /* đường cong tam giác: 0 → 1 (nửa đầu) → 0 (nửa sau), làm mượt bằng cosine */
  const a = .5 - .5 * Math.cos(Math.PI * 2 * p);
  c.clearRect(0, 0, 960, 600);
  /* cắt cảnh bằng chàm đêm (không chớp trắng) */
  c.fillStyle = 'rgba(18,22,54,' + (a * .97).toFixed(3) + ')'; c.fillRect(0, 0, 960, 600);
  const cg = c.createRadialGradient(480, 300, 40, 480, 300, 520);
  cg.addColorStop(0, 'rgba(86,104,168,' + (a * .5).toFixed(3) + ')'); cg.addColorStop(1, 'rgba(26,30,72,0)');
  c.fillStyle = cg; c.fillRect(0, 0, 960, 600);
  if (cap && a > .55) {
    c.globalAlpha = Math.min(1, (a - .55) / .3);
    c.font = 'bold 26px ' + IZF; c.textAlign = 'center';
    c.lineWidth = 6; c.strokeStyle = 'rgba(0,0,0,.9)'; c.strokeText(cap, 480, 296);
    c.fillStyle = '#dbe9ff';
    c.fillText(cap, 480, 296);
    c.font = 'bold 13px ' + IZF; c.fillStyle = '#9fc0e8';
    c.fillText('✦ ✦ ' + '✦', 480, 324);
    c.globalAlpha = 1; c.textAlign = 'left';
  }
}
function hvFade(cap, then) {
  if (HV_CUT) return;
  const ov = hvCutOv(), cv = document.getElementById('hv-cut-cv'), c = cv.getContext('2d');
  const t0 = performance.now(), DUR = HV_CFG.fade;
  let fired = false;
  HV_CUT = { ov };
  const finish = () => {
    HV_CUT = null;
    ov.style.cssText = 'display:none';
    c.clearRect(0, 0, 960, 600);
    if (!fired) { fired = true; try { then(); } catch (e) {} }
  };
  const step = () => {
    if (!HV_CUT) return;
    if (ov.style.display !== 'flex') { finish(); return; }        // người chơi bấm ESC
    const p = Math.min(1, (performance.now() - t0) / DUR);
    hvCutFrame(c, p, cap);
    if (!fired && p >= .5) { fired = true; try { then(); } catch (e) {} }
    if (p < 1) requestAnimationFrame(step); else finish();
  };
  requestAnimationFrame(step);
}

/* ---------- 8. DỜI CẢNH ---------- */
function hvUp() {
  S.scene = 'HEAVEN';
  S.p.x = HV_LAND.x - 10; S.p.y = HV_LAND.y - 18;
  setZone('☁️ KHU 4 · THIÊN ĐÀNG', 'IT Heaven — Đám Mây Lập Trình');
  if (typeof sfxPlay === 'function') { sfxPlay('pop'); sfxPlay('coin', 1.6); }
  chord([660, 880, 1100, 1320]);
  showBanner('KHU 4 · THIÊN ĐÀNG IT', '☁️ Đám Mây Lập Trình',
    hvDone() + '/' + HV_PCS.length + ' trạm đã xong · Bấm [E] tại Trạm Mây để chơi', 'violet');
  if (typeof saveGame === 'function') saveGame();
}
function hvDown() {
  S.scene = 'WORLD';
  S.p.x = HV_BEAM.x - 10; S.p.y = HV_BEAM.y - 14;
  setZone('1. THÀNH PHỐ', 'Network City (World Map)');
  if (typeof sfxPlay === 'function') sfxPlay('pop', .8);
  beep(380);
  if (typeof saveGame === 'function') saveGame();
}
const hvDone = () => HV_PCS.filter(p => !!S.missionsDone[p.id]).length;

/* ---------- 9. HOOK UPDATE / RENDER / [E] ---------- */
function hvUiOpen() {
  try {
    if (typeof anyCtlModalOpen === 'function' && anyCtlModalOpen()) return true;
  } catch (e) {}
  return false;
}
function hvUpdate() {
  if (HV_CUT || hvUiOpen()) return;               // đang fade / đang mở bảng: không gợi ý
  const cx = S.p.x + 10, cy = S.p.y + 18;
  if (S.scene === 'WORLD') {
    if (Math.hypot(cx - HV_BEAM.x, cy - HV_BEAM.y) < HV_BEAM.r)
      targetAct = { t: 'to_heaven', txt: '[E] ✦ LÊN THIÊN ĐÀNG IT' };
  } else if (S.scene === 'HEAVEN') {
    if (Math.hypot(cx - HV_LAND.x, cy - HV_LAND.y) < HV_LAND.r)
      targetAct = { t: 'hv_world', txt: '[E] ☁️ XUỐNG THÀNH PHỐ' };
    HV_PCS.forEach((pc, i) => {
      if (Math.hypot(cx - pc.x, cy - pc.y) < pc.r)
        targetAct = { t: 'hv_pc', i: i, txt: '[E] ' + pc.icon + ' ' + pc.name + (S.missionsDone[pc.id] ? ' (làm lại)' : '') };
    });
  }
}
const _hvOldUpd = update;
update = function () { _hvOldUpd.apply(this, arguments); hvUpdate(); };

const _hvOldRnd = render;
render = function () {
  _hvOldRnd();
  if (S.scene === 'HEAVEN' && !HV_CUT) hvScene();
};

const _hvOldAct = doAction;
doAction = function () {
  if (HV_CUT) return;
  if (targetAct && targetAct.t === 'to_heaven') { hvFade('ĐANG BAY LÊN THIÊN ĐÀNG', hvUp); return; }
  if (targetAct && targetAct.t === 'hv_world') { hvFade('ĐANG HẠ CÁNH VỀ THÀNH PHỐ', hvDown); return; }
  _hvOldAct();
};

/* Cột sáng WORLD: mượn luôn depth sort của engine (decor → drawDecor) để
   nhân vật đi trước cột thì bị cột đè, đi sau thì đè lên cột — đúng quy
   luật của mọi vật thể khác trong thành phố. */
const _hvOldDecor = drawDecor;
drawDecor = function (d) {
  if (d.t === 'hv_beam') { try { hvBeamWorld(d); } catch (e) { _hvOldDecor(d); } return; }
  _hvOldDecor(d);
};

/* ---------- 10. THỎ + VFX TRÊN MÂY ---------- */
/* Dải đi của thỏ bó trong hình chữ nhật nội tiếp lớn nhất của mặt mây
   (đo bằng Node: x 270..772, y 340..512) → không con nào nhảy ra hư không. */
const _hvOldBand = bunBand;
bunBand = function (sc) {
  const b = _hvOldBand(sc);
  if (sc === 'HEAVEN') { b.x0 = 270; b.x1 = 772; b.y0 = 340; b.y1 = 512; }
  return b;
};

/* Hai bảng màu cánh: thiên thần (trắng ngà ánh bạc) và vàng (dùng cho trạm). */
const HV_WING_A = { fill: 'rgba(206,224,244,.9)', stroke: 'rgba(74,104,142,.95)', hi: 'rgba(236,246,255,.55)' };
const HV_WING_G = { fill: 'rgba(252,211,77,.95)', stroke: 'rgba(112,66,10,.95)', hi: 'rgba(255,244,190,.8)' };
function hvWings(g, x, y, h, ph, pal, pivot) {
  const P = pal || HV_WING_A;
  const f = Math.sin(ph * 3.4) * .35, w = h * .46, hy = pivot ? y : y - h * .62;
  g.save();
  for (const s of [-1, 1]) {
    g.save(); g.translate(x, hy); g.scale(s, 1);
    g.fillStyle = P.fill;
    g.beginPath();
    g.moveTo(2, 0);
    g.bezierCurveTo(w * .5, -w * (.72 + f * .3), w * 1.12, -w * (.5 - f * .35), w * .92, w * .12);
    g.bezierCurveTo(w * .62, w * .04, w * .3, w * .18, 2, 0);
    g.closePath(); g.fill();
    /* lông vũ: hai nét cong tối trong lòng cánh */
    g.strokeStyle = P.stroke; g.lineWidth = 1; g.stroke();
    g.beginPath();
    g.moveTo(w * .22, -w * .04); g.quadraticCurveTo(w * .5, -w * .3, w * .78, -w * .2);
    g.moveTo(w * .18, w * .02); g.quadraticCurveTo(w * .44, -w * .12, w * .7, -w * .02);
    g.stroke();
    g.strokeStyle = P.hi; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(w * .16, -w * .1); g.quadraticCurveTo(w * .52, -w * .46, w * .84, -w * .3); g.stroke();
    g.restore();
  }
  g.restore();
}
function hvHalo(g, x, y, h) {
  const p = .5 + Math.sin(Date.now() / 1000 * 2.2 + x * .05) * .5;
  hvGlow(g, x, y - h * 1.06, h * .42, '252,211,77', .1 + p * .08);
  g.strokeStyle = HV_HALO; g.lineWidth = 2.4;
  g.beginPath(); g.ellipse(x, y - h * 1.06, h * .24, h * .075, 0, 0, 6.2832); g.stroke();
  g.strokeStyle = 'rgba(255,248,222,.75)'; g.lineWidth = 1;
  g.beginPath(); g.ellipse(x, y - h * 1.06 - 1, h * .2, h * .05, 0, 0, 6.2832); g.stroke();
}
/* Tai nghe + phù hiệu: gán chỉ số cố định cho từng con (thêm thuộc tính mới
   trên instance, không đụng bất kỳ trường nào của BunnyNPC cũ). */
function hvGear(b) {
  if (b.hvGear == null) {
    BunnyNPC.__hvN = (BunnyNPC.__hvN || 0) + 1;
    b.hvGear = BunnyNPC.__hvN % 4;             // 0 tai nghe · 1 bay · 2 kìm sửa · 3 thường
  }
  return b.hvGear;
}
function hvHeadphones(g, x, y, h) {
  const hy = y - h * .74, r = h * .3;
  g.strokeStyle = '#1b2740'; g.lineWidth = Math.max(1.6, h * .07); g.lineCap = 'round';
  g.beginPath(); g.arc(x, hy, r, Math.PI * 1.06, Math.PI * 1.94); g.stroke();
  for (const s of [-1, 1]) {
    g.fillStyle = '#16233c';
    g.beginPath(); g.ellipse(x + s * r, hy + r * .18, r * .3, r * .42, 0, 0, 6.2832); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.9)'; g.lineWidth = 1; g.stroke();
    g.fillStyle = 'rgba(103,232,249,.85)';
    g.beginPath(); g.arc(x + s * r, hy + r * .18, r * .12, 0, 6.2832); g.fill();
  }
}
const _hvOldPaint = BunnyNPC.prototype.paint;
BunnyNPC.prototype.paint = function (g, x, y, hh) {
  if (S.scene !== 'HEAVEN') { return _hvOldPaint.call(this, g, x, y, hh); }
  const gear = hvGear(this), h = hh || this.h;
  /* con "bay" chỉ nhấc HÌNH VẼ lên vài px (không đụng toạ độ logic/va chạm) */
  const fly = gear === 1 ? 5 + Math.sin(this.ph * 3.4) * 2.4 : 0;
  const dy = y - fly;
  hvWings(g, x, dy, h * (gear === 1 ? 1.32 : 1), this.ph * (gear === 1 ? 1.7 : 1), HV_WING_A);
  const canFilter = ('filter' in g);
  /* ban đêm nên chỉ tăng sáng nhẹ — trắng toát quá sẽ loá trên nền mây đêm */
  if (canFilter) g.save(), g.filter = 'brightness(1.2) saturate(.62) contrast(1.04)';
  _hvOldPaint.call(this, g, x, dy, hh);
  if (canFilter) g.restore();
  if (gear === 0) hvHeadphones(g, x, dy, h);
  hvHalo(g, x, dy, h);
  if (fly) { g.fillStyle = 'rgba(0,6,18,.3)'; g.beginPath(); g.ellipse(x, y + h * .1, h * .3, h * .1, 0, 0, 6.2832); g.fill(); }
};

/* Thỏ thiên thần cũng rớt quà: bunLoot đã tự lo phần coin/XP, chỉ nhắc
   lại âm thanh bằng đúng kênh SFX của V19 (guard typeof — sfx.js có thể
   chưa nạp trên bản cache cũ). */
if (typeof sfxPlay === 'function') { /* không cần bọc gì thêm: sfx.js đã hook bunLoot */ }
