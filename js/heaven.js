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
   ---------- BẢNG MÀU (V21.1) ----------
   Khu này đứng chơi rất lâu nên cố ý KHÔNG dùng trắng/xanh nhạt làm nền:
   trời là xanh lam sâu chuyển hoàng hôn, mây là ngà-xám có bóng tối quanh
   biên, và mọi chữ treo đều đi qua hvCap() (nền tối + viền đen + bóng đổ)
   để không chìm trên mặt mây.
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
   rgb = màu lõi, mặc định trắng; gọi truyền ngà/xám để bớt chói. */
function hvPuff(g, x, y, r, a, rgb) {
  g.fillStyle = 'rgba(' + (rgb || '255,255,255') + ',' + a + ')';
  g.beginPath();
  g.moveTo(x - r * 1.5, y);
  g.bezierCurveTo(x - r * 1.6, y - r * 1.15, x - r * .55, y - r * 1.35, x - r * .18, y - r * .92);
  g.bezierCurveTo(x + r * .28, y - r * 1.5, x + r * 1.5, y - r * 1.05, x + r * 1.42, y - r * .12);
  g.bezierCurveTo(x + r * 1.75, y + r * .42, x + r * .8, y + r * .72, x, y + r * .62);
  g.bezierCurveTo(x - r * .9, y + r * .74, x - r * 1.72, y + r * .38, x - r * 1.5, y);
  g.closePath(); g.fill();
}

/* ---------- 4. CẢNH HEAVEN ---------- */
/* Biển nổi dùng cho MỌI chữ treo ở Khu 4: nền tối đậm + viền đen + bóng đổ.
   Mây sáng và trời xanh đều làm chữ rgba thường chìm, nên chữ luôn có
   quầng tối phía sau và nét tối quanh nét chữ sáng. */
function hvCap(g, cx, yTop, txt, o) {
  o = o || {};
  g.font = (o.font || 'bold 10px ') + IZF;
  g.textAlign = 'center';
  const h = o.h || 16, w = g.measureText(txt).width + (o.pad == null ? 16 : o.pad);
  g.save();
  g.shadowColor = 'rgba(3,10,22,.65)'; g.shadowBlur = o.blur == null ? 10 : o.blur; g.shadowOffsetY = 2;
  g.fillStyle = o.bg || 'rgba(5,16,32,.86)';
  rr(g, cx - w / 2, yTop, w, h, o.r == null ? 8 : o.r); g.fill();
  g.restore();
  g.strokeStyle = o.rim || 'rgba(2,8,18,.9)'; g.lineWidth = o.lw || 1.5;
  rr(g, cx - w / 2, yTop, w, h, o.r == null ? 8 : o.r); g.stroke();
  /* nét viền đen chạy quanh chữ sáng → đọc được cả trên nền mây trắng */
  if (o.outline !== false) { g.lineWidth = 2.6; g.strokeStyle = 'rgba(2,8,18,.92)'; g.strokeText(txt, cx, yTop + h - 4); }
  g.fillStyle = o.fg || '#eef7ff'; g.fillText(txt, cx, yTop + h - 4);
  g.textAlign = 'left';
  return w;
}
const HV_SKY = {
  /* mây xa trôi chậm (parallax) — toạ độ gốc, wrap theo 1100px */
  far: [[120, 118, 30], [380, 82, 22], [640, 132, 26], [860, 96, 19], [250, 176, 16], [740, 186, 14]],
  /* gờ mây chính: đỉnh lấy từ nửa trên đa giác HV_POLY */
  rim: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
};
function hvSky(t) {
  /* Trời hoàng hôn dịu: xanh lam sâu trên cao → xám xanh sương dưới đáy.
     Không có stopping nào gần trắng; độ sáng trung bình thấp hơn bản cũ
     rõ rệt để đứng chơi lâu không mỏi mắt. */
  const g = ctx.createLinearGradient(0, 0, 0, 600);
  g.addColorStop(0, '#0e2b52'); g.addColorStop(.34, '#1b4d81');
  g.addColorStop(.62, '#356f9f'); g.addColorStop(.84, '#578ab2'); g.addColorStop(1, '#6d97bd');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 960, 600);
  /* mặt trời chiều: quả cầu hổ phách nhỏ + quầng ấm mỏng (thay cho đốm trắng gắt cũ) */
  const sg = ctx.createRadialGradient(128, 84, 4, 128, 84, 148);
  sg.addColorStop(0, 'rgba(255,205,140,.6)'); sg.addColorStop(.3, 'rgba(250,178,112,.2)'); sg.addColorStop(1, 'rgba(240,160,100,0)');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(128, 84, 148, 0, 6.2832); ctx.fill();
  ctx.fillStyle = 'rgba(255,226,182,.8)'; ctx.beginPath(); ctx.arc(128, 84, 20, 0, 6.2832); ctx.fill();
  /* mây xa trôi — ngà xám, alpha thấp vì trời đã tối */
  for (let i = 0; i < HV_SKY.far.length; i++) {
    const c = HV_SKY.far[i], sp = 5 + i * 2.4;
    const x = ((c[0] + t * sp) % 1160) - 100;
    hvPuff(ctx, x, c[1], c[2], .22 + (i % 3) * .05, '206,226,246');
  }
  /* tia sáng rơi xiên — chỉ còn 1/3 độ mạnh so với bản trắng trước đây */
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .055 + Math.sin(t * .8) * .015;
  const rg = ctx.createLinearGradient(0, 0, 0, 420);
  rg.addColorStop(0, 'rgba(255,232,196,.6)'); rg.addColorStop(1, 'rgba(255,232,196,0)');
  ctx.fillStyle = rg;
  for (let i = 0; i < 4; i++) {
    const x = 210 + i * 190;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 58, 0); ctx.lineTo(x + 150, 420); ctx.lineTo(x + 42, 420); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
function hvDeck(t) {
  /* 0) quầng bóng lạnh quanh mây: vẽ TRƯỚC, nét to hơn thân mây ~23px để
        đám mây nổi khối trên nền trời đậm, không "chìm nghỉm" vào trời. */
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(9,26,50,.22)'; ctx.lineWidth = 92; hvDeckPath(ctx); ctx.stroke();
  ctx.strokeStyle = 'rgba(24,52,88,.32)'; ctx.lineWidth = 62; hvDeckPath(ctx); ctx.stroke();
  ctx.restore();
  /* 1) thân mây: xám ngà dịu → xanh slate đáy (bỏ hẳn trắng 100%) */
  hvDeckPath(ctx);
  const g = ctx.createLinearGradient(0, 250, 0, 580);
  g.addColorStop(0, 'rgba(214,228,245,.94)'); g.addColorStop(.55, 'rgba(183,201,226,.95)'); g.addColorStop(1, 'rgba(126,153,187,.97)');
  ctx.fillStyle = g; ctx.fill();
  /* 2) viền bông 46px: miền vẽ RỘNG hơn miền va chạm 23px → chắc chắn
        mọi điểm đi được đều nằm trên mây đã tô. */
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = 46;
  ctx.strokeStyle = 'rgba(214,228,245,.7)'; hvDeckPath(ctx); ctx.stroke();
  ctx.restore();
  /* 3) gờ sáng trên mép mây (nhẹ) rồi nét tối chân mây (đậm) → có khối */
  ctx.save(); ctx.lineWidth = 2.6; ctx.strokeStyle = 'rgba(246,251,255,.45)'; hvDeckPath(ctx); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(30,58,94,.5)'; hvDeckPath(ctx); ctx.stroke(); ctx.restore();
  /* 4) bông mây đực trên gờ (đỉnh 0..10 = nửa trên đa giác) */
  for (const i of HV_SKY.rim) {
    const p = HV_POLY[i];
    hvPuff(ctx, p[0], p[1] + 4, 26 + (i % 3) * 7, .42, '206,221,240');
  }
  /* 5) gờ dưới: bóng xanh xám cho thấy khối mây dày */
  for (let i = 12; i < 24; i += 2) {
    const p = HV_POLY[i];
    ctx.fillStyle = 'rgba(48,78,118,.42)';
    ctx.beginPath(); ctx.ellipse(p[0], p[1] + 16, 40, 15, 0, 0, 6.2832); ctx.fill();
  }
  /* 6) vân sáng chạy trên mặt mây (thời gian trôi = mây trôi) */
  ctx.save(); hvDeckPath(ctx); ctx.clip();
  for (let i = 0; i < 7; i++) {
    const x = ((t * (9 + i * 3)) % 1200) - 120, y = 300 + i * 34;
    ctx.fillStyle = 'rgba(238,246,255,.16)';
    ctx.beginPath(); ctx.ellipse(x, y, 92, 13, 0, 0, 6.2832); ctx.fill();
  }
  /* bóng râm phía dưới khối mây — tăng chiều sâu, vẽ trong clip nên không loang ra trời */
  const sh = ctx.createLinearGradient(0, 470, 0, 580);
  sh.addColorStop(0, 'rgba(30,60,98,0)'); sh.addColorStop(1, 'rgba(24,52,88,.3)');
  ctx.fillStyle = sh; ctx.fillRect(0, 470, 960, 130);
  ctx.restore();
}
/* Bãi đáp / cổng về: vòng xoáy mây + trụ sáng xuống dưới */
function hvGate(t) {
  const p = .5 + Math.sin(t * 2.1) * .5;
  ctx.fillStyle = 'rgba(125,211,252,' + (.16 + p * .1) + ')';
  ellipsePath(ctx, HV_LAND.x, HV_LAND.y, HV_LAND.r, HV_LAND.r * .4); ctx.fill();
  ctx.strokeStyle = 'rgba(56,189,248,' + (.5 + p * .35) + ')'; ctx.lineWidth = 2.6; ctx.setLineDash([10, 8]);
  ctx.lineDashOffset = -t * 26;
  ellipsePath(ctx, HV_LAND.x, HV_LAND.y, HV_LAND.r, HV_LAND.r * .4); ctx.stroke();
  ctx.setLineDash([]); ctx.lineDashOffset = 0;
  for (let k = 0; k < 3; k++) {
    ctx.strokeStyle = 'rgba(255,255,255,' + (.5 - k * .13) + ')'; ctx.lineWidth = 2;
    ellipsePath(ctx, HV_LAND.x, HV_LAND.y - 2, (HV_LAND.r - 14 - k * 13) * (.9 + p * .1), (HV_LAND.r - 14 - k * 13) * .36);
    ctx.stroke();
  }
  const lg = ctx.createLinearGradient(0, HV_LAND.y - 150, 0, HV_LAND.y);
  lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(191,240,255,' + (.2 + p * .12) + ')');
  ctx.fillStyle = lg;
  ctx.beginPath(); ctx.moveTo(HV_LAND.x - 26, HV_LAND.y - 4); ctx.lineTo(HV_LAND.x + 26, HV_LAND.y - 4);
  ctx.lineTo(HV_LAND.x + 12, HV_LAND.y - 150); ctx.lineTo(HV_LAND.x - 12, HV_LAND.y - 150); ctx.closePath(); ctx.fill();
  if (!(targetAct && targetAct.t === 'hv_world'))
    hvCap(ctx, HV_LAND.x, HV_LAND.y - 168, '☁️ CỔNG VỀ THÀNH PHỐ', { pad: 14 });
}
/* Trạm Máy Tính Đám Mây: bàn mây + màn hình code + biển tên */
function hvPc(pc, t, active) {
  const done = !!S.missionsDone[pc.id], bob = Math.sin(t * 1.6 + pc.x * .01) * 2.4;
  const x = pc.x, y = pc.y + bob;
  ctx.fillStyle = 'rgba(10,28,52,.32)';
  ctx.beginPath(); ctx.ellipse(x, y + 6, 46, 13, 0, 0, 6.2832); ctx.fill();
  hvPuff(ctx, x, y + 2, 30, .8, '236,244,253');
  /* chân bàn */
  ctx.fillStyle = '#d5e2f3'; rr(ctx, x - 20, y - 26, 40, 8, 4); ctx.fill();
  /* thân màn hình */
  const mw = 62, mh = 40, mx = x - mw / 2, my = y - 26 - mh;
  ctx.fillStyle = '#233044'; rr(ctx, mx - 3, my - 3, mw + 6, mh + 6, 7); ctx.fill();
  const sg = ctx.createLinearGradient(0, my, 0, my + mh);
  sg.addColorStop(0, done ? '#0b2f22' : '#0b1a2e'); sg.addColorStop(1, done ? '#0f4430' : '#12233d');
  ctx.fillStyle = sg; rr(ctx, mx, my, mw, mh, 5); ctx.fill();
  /* code trên màn hình */
  const cols = done ? ['#4ade80', '#86efac', '#22c55e'] : ['#7dd3fc', '#fde047', '#f0abfc'];
  for (let i = 0; i < 4; i++) {
    const lw = 12 + ((i * 17 + pc.x) % 26);
    ctx.fillStyle = cols[i % 3]; ctx.globalAlpha = .55 + .35 * Math.abs(Math.sin(t * 1.3 + i + pc.x));
    ctx.fillRect(mx + 6 + (i % 2) * 5, my + 7 + i * 8, lw, 3);
  }
  ctx.globalAlpha = 1;
  /* bàn phím + chuột */
  ctx.fillStyle = '#c9d8ec'; rr(ctx, x - 22, y - 17, 30, 9, 3); ctx.fill();
  ctx.fillStyle = '#8ea6c4'; ctx.beginPath(); ctx.ellipse(x + 16, y - 13, 5, 3.4, 0, 0, 6.2832); ctx.fill();
  /* hào quang trạm đang đứng cạnh */
  const pulse = .5 + Math.sin(t * 3.2) * .5;
  ctx.strokeStyle = active ? 'rgba(253,224,71,.95)' : (done ? 'rgba(74,222,128,.5)' : 'rgba(125,211,252,.45)');
  ctx.lineWidth = active ? 3 : 2; ctx.setLineDash([8, 7]); ctx.lineDashOffset = -t * 22;
  ellipsePath(ctx, x, y + 4, 44, 15); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
  if (!active) { ctx.globalAlpha = .35 + pulse * .3; ellipsePath(ctx, x, y + 4, 44 + pulse * 6, 15 + pulse * 3); ctx.stroke(); ctx.globalAlpha = 1; }
  /* biển nổi */
  hvCap(ctx, x, my - 26, (done ? '✅ ' : '') + pc.icon + ' ' + pc.name, {
    font: 'bold 10.5px ', h: 17, r: 8,
    fg: done ? '#c8f7d9' : '#eef7ff',
    rim: done ? 'rgba(20,66,44,.9)' : 'rgba(2,10,24,.88)'
  });
}
/* Nhãn [E] — cùng kiểu, cùng hình với engine.render (engine vẽ rồi bị nền
   mây tô đè, nên cảnh tự dựng phải tự vẽ lại nhãn). */
function hvLabel(txt) {
  const bx = S.p.x + 10, by = S.p.y - 36, bounce = Math.sin(Date.now() * .006) * 2;
  ctx.font = 'bold 10px monospace';
  const w = Math.max(100, ctx.measureText(txt).width + 26), h = 20, r = 6;
  const x0 = bx - w / 2, y0 = by + bounce;
  /* 1) khối vàng + mũi tên đổ bóng xuống nền mây → tem không "dính" vào mây */
  ctx.save();
  ctx.shadowColor = 'rgba(3,10,22,.72)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 3;
  ctx.fillStyle = 'rgba(250,204,21,.95)';
  rr(ctx, x0, y0, w, h, r); ctx.fill();
  ctx.beginPath(); ctx.moveTo(bx - 5, y0 + h); ctx.lineTo(bx + 5, y0 + h); ctx.lineTo(bx, y0 + h + 6); ctx.fill();
  ctx.restore();
  /* 2) viền đen đậm bao quanh tem */
  ctx.strokeStyle = 'rgba(4,12,24,.95)'; ctx.lineWidth = 2.2;
  rr(ctx, x0, y0, w, h, r); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx - 5, y0 + h); ctx.lineTo(bx + 5, y0 + h); ctx.lineTo(bx, y0 + h + 6); ctx.closePath(); ctx.stroke();
  /* 3) chữ đậm trên nền vàng — tem đã có viền đen + bóng đổ nên không cần quầng */
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0b1220'; ctx.fillText(txt, bx, y0 + 14);
  ctx.textAlign = 'left';
}
function hvScene() {
  const t = Date.now() / 1000;
  hvSky(t);
  hvDeck(t);
  hvGate(t);
  /* depth sort: trạm nào thấp hơn (gần người xem hơn) vẽ sau */
  const list = HV_PCS.map(pc => ({ k: pc.y, f: () => hvPc(pc, t, !!(targetAct && targetAct.t === 'hv_pc' && HV_PCS[targetAct.i] === pc)) }));
  list.push({ k: S.p.y + 30, f: () => drawSprite(S.p.x, S.p.y, 'p') });
  list.sort((a, b) => a.k - b.k).forEach(o => o.f());
  /* biển khu */
  hvCap(ctx, 480, 22, '☁️ KHU 4 · THIÊN ĐÀNG IT — ĐÁM MÂY LẬP TRÌNH', { font: 'bold 13px ', h: 24, r: 12, blur: 14 });
  if (targetAct) hvLabel(targetAct.txt || '');
  try { if (typeof bunOverlay === 'function') bunOverlay(); } catch (e) {}
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
  /* trắng ngà mây chứ không trắng 100% — cắt cảnh vẫn rõ nhưng không lóe */
  c.fillStyle = 'rgba(238,245,253,' + (a * .94).toFixed(3) + ')'; c.fillRect(0, 0, 960, 600);
  const cg = c.createRadialGradient(480, 300, 40, 480, 300, 520);
  cg.addColorStop(0, 'rgba(206,232,250,' + (a * .5).toFixed(3) + ')'); cg.addColorStop(1, 'rgba(150,196,232,0)');
  c.fillStyle = cg; c.fillRect(0, 0, 960, 600);
  if (cap && a > .55) {
    c.globalAlpha = Math.min(1, (a - .55) / .3);
    c.font = 'bold 26px ' + IZF; c.textAlign = 'center';
    c.lineWidth = 4; c.strokeStyle = 'rgba(6,20,40,.55)'; c.strokeText(cap, 480, 296);
    c.fillStyle = '#12467a';
    c.fillText(cap, 480, 296);
    c.font = 'bold 13px ' + IZF; c.fillStyle = '#4d7ea8';
    c.fillText('✦ ✦ ✦', 480, 324);
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

/* Thỏ thiên thần: trắng toát (filter, không đọc pixel → file:// vẫn chạy)
   + cánh + hào quang vẽ bằng cung tròn. Scratch canvas dùng chung 1 cái. */
const HV_HALO = 'rgba(253,224,71,.95)';
function hvWings(g, x, y, h, ph) {
  const f = Math.sin(ph * 3.4) * .35, w = h * .46, hy = y - h * .62;
  g.save();
  for (const s of [-1, 1]) {
    g.save(); g.translate(x, hy); g.scale(s, 1);
    g.fillStyle = 'rgba(255,255,255,.94)';
    g.beginPath();
    g.moveTo(2, 0);
    g.bezierCurveTo(w * .5, -w * (.72 + f * .3), w * 1.12, -w * (.5 - f * .35), w * .92, w * .12);
    g.bezierCurveTo(w * .62, w * .04, w * .3, w * .18, 2, 0);
    g.closePath(); g.fill();
    g.strokeStyle = 'rgba(186,230,253,.85)'; g.lineWidth = 1; g.stroke();
    g.restore();
  }
  g.restore();
}
function hvHalo(g, x, y, h) {
  g.strokeStyle = HV_HALO; g.lineWidth = 2.2;
  g.beginPath(); g.ellipse(x, y - h * 1.06, h * .24, h * .075, 0, 0, 6.2832); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1;
  g.beginPath(); g.ellipse(x, y - h * 1.06, h * .24, h * .075, 0, 0, 6.2832); g.stroke();
}
const _hvOldPaint = BunnyNPC.prototype.paint;
BunnyNPC.prototype.paint = function (g, x, y, hh) {
  if (S.scene !== 'HEAVEN') { return _hvOldPaint.call(this, g, x, y, hh); }
  const h = hh || this.h;
  hvWings(g, x, y, h, this.ph);
  const canFilter = ('filter' in g);
  if (canFilter) g.save(), g.filter = 'brightness(1.85) saturate(.22) contrast(.96)';
  _hvOldPaint.call(this, g, x, y, hh);
  if (canFilter) g.restore();
  hvHalo(g, x, y, h);
};

/* Thỏ thiên thần cũng rớt quà: bunLoot đã tự lo phần coin/XP, chỉ nhắc
   lại âm thanh bằng đúng kênh SFX của V19 (guard typeof — sfx.js có thể
   chưa nạp trên bản cache cũ). */
if (typeof sfxPlay === 'function') { /* không cần bọc gì thêm: sfx.js đã hook bunLoot */ }
