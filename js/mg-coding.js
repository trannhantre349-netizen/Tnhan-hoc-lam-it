/* ============================================================
   V22 — 3 ẢI LẬP TRÌNH "THIÊN ĐÀNG IT" (ADD-ONLY)   js/mg-coding.js

   Không sửa một dòng code cũ nào của game. Toàn bộ là móc nối:

     mgFrame()  → vẽ canvas hv-mini mỗi khung hình khi modal mở
     doAction() → [E] ở trạm mây = mở ải; [E]/Space khi đang chơi = nút
                  hành động của ải (không lọt xuống world)
     update()   → nhận diện bấm ESC (closeAll ẩn modal) để gỡ trạng thái
     BUN_MINI_MODALS.push('hv-mini') → thỏ ẩn đúng chỗ khi modal mở

   Ba ải theo đúng mẫu image_16.png (bố cục: bảng ở trên, thỏ dẫn dắt ở GÓC
   TRÁI DƯỚI + bong bóng chữ bên phải, nút hành động đặt dưới bảng):
     ải 1 "SẮP XẾP THUẬT TOÁN" : bảng "Bảng xếp code" xám sẫm — "Sắp xếp thuật
            toán hoán vị", 6 dòng hoán vị a/b bị xáo. Bấm hai dòng (hoặc kéo
            thả) để đổi chỗ. "Kiểm tra" so 100% — sai thì dòng lỗi đỏ + rung.
            Bên phải là ô "Chạy thử console" thật: bảng watch từng dòng.
     ải 2 "BẮT BUG IT"          : màn RADAR tối (vòng đồng tâm + tia quét +
            vòng neon) phủ mã nguồn ngẫu nhiên, bug đỏ/xanh lá bò tự do (tối
            đa 15). Click trúng hitbox = nổ hạt + "+10 Coin / +5 XP".
            "Tiến độ: X/15 BUG" vàng + "Thời gian: 45s" cam.
     ải 3 "SẮP XẾP CODE NÂNG CAO": dải khối lồng màu toàn chiều rộng (bỏ hai
            tab của bản trước), ráp lại đúng thứ tự đóng mở ngoặc.

   Tông màu lấy theo Khu 4 ban đêm (js/heaven.js V21.3): nền chàm thẫm, không
   có trắng tinh, mọi chữ tiếng Việt đều viền đen đậm nên không mờ trên mây.
   Thỏ thiên thần chibi vẽ bằng lệnh (nảy nhẹ, hào quang vàng, cánh bạc) —
   không đụng ảnh sprite sheet cũ.

   Modal dùng chung hình học với lu-mini của Khu 3 (canvas trong 760x400,
   inset 14px 76px trong hộp #app 960x600 đã scale) nên không vỡ layout.
   ============================================================ */

/* ---------- 1. HÌNH HỌC ---------- */
const HVM_W = 760, HVM_H = 400;

/* Dải dưới chung cho cả 3 ải (mẫu image_16): thỏ dẫn dắt ở TRÁI, bong bóng
   chữ ở phải. Các bảng phía trên cao 266px tính từ y=34 nên vừa khít. */
const HVM_STRIP = { y: 306, h: 88, bx: 76, by: 368, bs: 46, kx: 124, kw: 336, ky: 322, kh: 46 };
/* ải 1: bảng xếp code + ô chạy thử */
const HVM_BOARD = { x: 24, y: 34, w: 356, h: 266, hx: 44, hy: 76, hw: 318, pitch: 36, bh: 30 };
const HVM_TRACE = { x: 396, y: 34, w: 344, h: 266 };
/* ải 2: màn hình radar debug */
const HVM_SCREEN = { x: 16, y: 40, w: 728, h: 260, gut: 46, lineTop: 62, lineH: 25, lines: 9, pad: 24 };
/* ải 3: dải khối lồng toàn chiều rộng */
const HVM_NEST = { x: 20, y: 34, w: 720, h: 266, hx: 40, hy: 70, hw: 684, pitch: 28, bh: 24, indent: 22 };

/* Màu dòng code (rim / nền / chữ) — 8 tông, không trắng tinh */
const HVM_HUE = [
  { rim: '#38bdf8', bg: '#0e2438', col: '#cfe9ff' },
  { rim: '#a78bfa', bg: '#191234', col: '#e4d9ff' },
  { rim: '#4ade80', bg: '#0e2a1b', col: '#cbf6d8' },
  { rim: '#60a5fa', bg: '#101f3a', col: '#d5e8ff' },
  { rim: '#f472b6', bg: '#2a1224', col: '#ffd8ee' },
  { rim: '#fbbf24', bg: '#28200e', col: '#ffefc4' },
  { rim: '#22d3ee', bg: '#0b2630', col: '#cbf5ff' },
  { rim: '#fb7185', bg: '#2b1016', col: '#ffd8de' }
];
const HVM_INK = 'rgba(0,0,0,.92)';
/* Bảng cánh riêng cho thỏ trong modal: nền modal tối hơn mây nên cánh phải
   sáng và viền nhạt hơn, nếu không nét viền đậm sẽ nuốt mất phần lông. */
const HVM_WING = { fill: 'rgba(228,242,255,.95)', stroke: 'rgba(146,184,226,.9)', hi: 'rgba(255,255,255,.85)' };

/* ---------- 2. NGÂN HÀNG ĐỀ ---------- */
/* ải 1 — thứ tự trong mảng = thứ tự chạy ĐÚNG (index chính là đáp án).
   run() trả về tên biến còn thiếu => mô phỏng đúng lỗi "dùng trước khi khai
   báo", nhờ đó ô console chạy thử nói thật chứ không phải vẽ cho đẹp. */
const HVM_SWAP = [
  { t: 'let a = 15;', run: v => { v.a = 15; return null; } },
  { t: 'let b = 25;', run: v => { v.b = 25; return null; } },
  { t: 'let temp = a;', run: v => ('a' in v) ? (v.temp = v.a, null) : 'a' },
  { t: 'a = b;', run: v => ('b' in v) ? (v.a = v.b, null) : 'b' },
  { t: 'b = temp;', run: v => ('temp' in v) ? (v.b = v.temp, null) : 'temp' },
  { t: 'console.log(a, b);', run: v => ('a' in v && 'b' in v) ? (v.log = v.a + ', ' + v.b, null) : (!('a' in v) ? 'a' : 'b') }
];
/* ải 3 — 8 khối lệnh nâng cao, d = độ lồng (bậc thụt lề) */
const HVM_NEST_SRC = [
  { t: 'async function uploadData() {', d: 0 },
  { t: 'try {', d: 1 },
  { t: 'let res = await fetch(url);', d: 2 },
  { t: 'let json = await res.json();', d: 2 },
  { t: 'return json.status;', d: 2 },
  { t: '} catch (error) {', d: 1 },
  { t: 'console.error(error);', d: 2 },
  { t: '},', d: 1 }
];
/* ải 2 — code ngẫu nhiên cho màn hình debug (mỗi ván bốc 10 dòng) */
const HVM_POOL = [
  'for (let i = 0; i < n; i++) {',
  '  player(never).ays();',
  '  if (S.p.moving) {',
  '    // BUG: thiếu break',
  '    speed = speed + accel;',
  '    send(frame, port);',
  '  }',
  'function updatePlayer() {',
  '  const vlan = readTag(frame);',
  '  if (vlan != expected) drop(frame);',
  '  while (queue.len > 0) {',
  '    tx(radio.ch, payload);',
  '  }',
  '  let dns = lookup(host);',
  '  hop++;   // TODO: sửa lại',
  '  if (!cable) return;',
  '  catch (err) { log(err); }',
  '  return may.ok;',
  '}'
];

/* sao nền tĩnh (seeded để không "nhảy" hạt khi vẽ lại) */
const HVM_BG_STARS = (() => {
  const r = seeded(20261029), out = [];
  for (let i = 0; i < 70; i++) out.push([r() * HVM_W, r() * HVM_H, .6 + r() * 1.2, r() * 6.283]);
  return out;
})();

/* ---------- 3. TIỆN ÍCH ---------- */
function hvmSfx(k, rate) {
  /* sfx.js luôn tồn tại vì nạp trước, nhưng guard để file âm thanh thiếu
     không bao giờ làm crash minigame (người chơi đang giữa ván). */
  try { if (typeof sfxPlay === 'function') sfxPlay(k, rate); } catch (e) {}
}
function hvmChord(freqs) {
  try { if (typeof chord === 'function') chord(freqs); } catch (e) {}
}
function hvmBeep(f, ty, d, v) {
  try { if (typeof beep === 'function') beep(f, ty, d, v); } catch (e) {}
}
function hvmShuffle(n) {
  /* xáo trộn ít nhất 2 vị trí sai — tránh "mở ra đã thắng" */
  let a;
  for (let guard = 0; guard < 40; guard++) {
    a = [];
    for (let i = 0; i < n; i++) a.push(i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    let wrong = 0;
    for (let i = 0; i < n; i++) if (a[i] !== i) wrong++;
    if (wrong >= 2) return a;
  }
  return a;
}
/* Glow: đi nhờ hvGlow của heaven.js (ảnh sprite 64px đã cache theo màu) —
   tạo radialGradient mỗi khung hình cho 15 con bug là rớt FPS ngay. */
function hvmGlow(g, x, y, r, rgb, a) {
  if (typeof hvGlow === 'function') { hvGlow(g, x, y, r, rgb, a); return; }
  const q = g.createRadialGradient(x, y, 0, x, y, r);
  q.addColorStop(0, 'rgba(' + rgb + ',' + a + ')');
  q.addColorStop(1, 'rgba(' + rgb + ',0)');
  g.fillStyle = q; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
}
/* Chữ tiếng Việt có viền đen đậm — yêu cầu "chống mờ" của ải. */
function hvmTxt(g, s, x, y, o) {
  o = o || {};
  const size = o.size || 10;
  g.font = (o.weight || 700) + ' ' + size + 'px ' + (o.mono === false ? '"Baloo 2","Segoe UI",sans-serif' : MG_MONO);
  g.textAlign = o.align || 'left';
  g.textBaseline = 'alphabetic';
  const prev = g.globalAlpha;
  if (o.alpha != null) g.globalAlpha = prev * o.alpha;
  g.lineJoin = 'round';
  if (o.ol !== false) {
    g.strokeStyle = o.ol || HVM_INK;
    g.lineWidth = o.olw || Math.max(2.6, size * .3);
    g.strokeText(s, x, y);
  }
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = o.glowSize || 8; }
  g.fillStyle = o.color || '#e6eefb';
  g.fillText(s, x, y);
  g.shadowBlur = 0; g.textAlign = 'left'; g.globalAlpha = prev;
}
function hvmPanel(g, x, y, w, h, top, bottom, rim) {
  const grd = g.createLinearGradient(0, y, 0, y + h);
  grd.addColorStop(0, top || '#242b3d'); grd.addColorStop(1, bottom || '#141a28');
  rr(g, x, y, w, h, 12); g.fillStyle = grd; g.fill();
  g.strokeStyle = 'rgba(0,0,0,.7)'; g.lineWidth = 3; g.stroke();
  g.strokeStyle = rim || 'rgba(125,211,252,.35)'; g.lineWidth = 1.6; g.stroke();
}
function hvmBoard(g, b, title, o) {
  o = o || {};
  hvmPanel(g, b.x, b.y, b.w, b.h, '#2b3242', '#171d29', o.rim || 'rgba(125,211,252,.32)');
  /* thanh tiêu đề 2 dòng: tên bảng + dòng mô tả (mẫu có cả hai) */
  const hh = o.sub ? 32 : 26;
  rr(g, b.x + 8, b.y + 8, b.w - 16, hh, 8);
  g.fillStyle = 'rgba(6,10,20,.7)'; g.fill();
  g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 2; g.stroke();
  hvmGlow(g, b.x + b.w / 2, b.y + 8 + hh / 2, 70, '125,211,252', .1);
  hvmTxt(g, title, b.x + b.w / 2, b.y + (o.sub ? 22 : 26),
    { size: o.sub ? 12 : 13.5, color: '#eaf4ff', align: 'center', mono: false });
  if (o.sub) hvmTxt(g, o.sub, b.x + b.w / 2, b.y + 36,
    { size: 10.5, color: '#8fb4dc', align: 'center', mono: false, ol: false });
}
/* Cánh đơn (mẫu vẽ một đôi cánh ôm hai góc bảng) — hvWings của heaven.js vẽ
   cả cặp đối xứng quanh một trục nên không dùng cho góc rời được. */
function hvmWing(g, x, y, h, dir, ph, pal) {
  const P = pal || HVM_WING, f = Math.sin(ph * 3.4) * .3, w = h * .46;
  g.save(); g.translate(x, y); g.scale(dir, 1);
  g.fillStyle = P.fill;
  g.beginPath(); g.moveTo(2, 0);
  g.bezierCurveTo(w * .5, -w * (.72 + f * .3), w * 1.12, -w * (.5 - f * .35), w * .92, w * .12);
  g.bezierCurveTo(w * .62, w * .04, w * .3, w * .18, 2, 0);
  g.closePath(); g.fill();
  g.strokeStyle = P.stroke; g.lineWidth = 1; g.stroke();
  g.strokeStyle = P.hi; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(w * .16, -w * .1); g.quadraticCurveTo(w * .52, -w * .46, w * .84, -w * .3); g.stroke();
  g.restore();
}
/* Đôi cánh trang trí ở hai góc trên của bảng + dải mây chân thẻ (đúng chất
   "thẻ thiên đàng" trong mẫu). */
function hvmCardDeco(g, b, t) {
  hvmWing(g, b.x + 4, b.y + 30, 46, -1, t, HVM_WING);
  hvmWing(g, b.x + b.w - 4, b.y + 30, 46, 1, t + .7, HVM_WING);
}
function hvmCloudBand(g, t) {
  const y = HVM_H - 6;
  g.save();
  for (let i = 0; i < 9; i++) {
    const x = 20 + i * 92 + Math.sin(t * .35 + i) * 5, r = 20 + (i % 3) * 7;
    g.fillStyle = i % 2 ? 'rgba(148,190,240,.13)' : 'rgba(196,222,255,.1)';
    g.beginPath();
    g.ellipse(x, y, r * 1.7, r * .62, 0, 0, 6.283);
    g.ellipse(x - r * .8, y - r * .3, r * .8, r * .5, 0, 0, 6.283);
    g.ellipse(x + r * .7, y - r * .22, r * .7, r * .44, 0, 0, 6.283);
    g.fill();
  }
  g.restore();
}
/* Dải dẫn dắt chung: thỏ trái + bong bóng phải (bố cục mẫu image_16) */
function hvmGuide(g, t, lines, o) {
  o = o || {};
  const ST = HVM_STRIP;
  hvmBubble(g, ST.kx, ST.ky, ST.kw, ST.kh, lines, {
    tail: 'left', tailX: ST.kx, size: o.size || 11.5, lh: o.lh || 15
  });
  hvmBunny(g, ST.bx, ST.by, ST.bs, t, o.bunny || {});
}
function hvmBar(g, x, y, w, h, v, col, txt) {
  const k = Math.max(0, Math.min(1, v));
  rr(g, x, y, w, h, h / 2); g.fillStyle = 'rgba(0,0,0,.55)'; g.fill();
  g.strokeStyle = HVM_INK; g.lineWidth = 2; g.stroke();
  if (k > 0) {
    rr(g, x + 1.5, y + 1.5, Math.max(h, (w - 3) * k), h - 3, (h - 3) / 2);
    g.fillStyle = col; g.fill();
    rr(g, x + 1.5, y + 1.5, Math.max(h, (w - 3) * k), (h - 3) * .45, (h - 3) / 2);
    g.fillStyle = 'rgba(255,255,255,.22)'; g.fill();
  }
  if (txt) hvmTxt(g, txt, x + w + 8, y + h - 1, { size: 9.5, color: col });
}
function hvmCodeBg(g, t) {
  const grd = g.createLinearGradient(0, 0, 0, HVM_H);
  grd.addColorStop(0, '#070b20'); grd.addColorStop(.6, '#0b1130'); grd.addColorStop(1, '#161a3e');
  g.fillStyle = grd; g.fillRect(0, 0, HVM_W, HVM_H);
  /* sao nhỏ li ti */
  g.fillStyle = '#bcd6f5';
  for (const s of HVM_BG_STARS) {
    g.globalAlpha = .16 + .24 * (0.5 + 0.5 * Math.sin(t * 1.8 + s[3]));
    g.fillRect(s[0], s[1], s[2], s[2]);
  }
  g.globalAlpha = 1;
  /* lưới mạch */
  g.strokeStyle = 'rgba(90,160,230,.07)'; g.lineWidth = 1;
  for (let x = 0; x <= HVM_W; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, HVM_H); g.stroke(); }
  for (let y = 0; y <= HVM_H; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(HVM_W, y); g.stroke(); }
  /* hai cột nhị phân trôi */
  g.save(); g.globalAlpha = .1; g.fillStyle = '#7dd3fc';
  g.font = '700 10px ' + MG_MONO;
  for (let c = 0; c < 10; c++) {
    const x = 24 + c * 78, sp = 26 + (c % 3) * 9, off = (t * sp) % 22;
    for (let r = -1; r < 20; r++) {
      const v = (c * 7 + r * 13 + Math.floor(t * sp / 22)) % 3;
      g.fillText(v === 0 ? '010' : v === 1 ? '1011' : '10', x, off + r * 22);
    }
  }
  g.restore();
}
/* Bọt chữ của thỏ (sáng trên nền tối, viền đen) */
function hvmBubble(g, x, y, w, h, lines, o) {
  o = o || {};
  rr(g, x, y, w, h, 11);
  g.fillStyle = o.bg || '#eef4ff'; g.fill();
  g.strokeStyle = '#0b1020'; g.lineWidth = 2.6; g.stroke();
  /* đuôi */
  const tx = o.tailX != null ? o.tailX : x + w * .5;
  g.beginPath();
  if (o.tail === 'down') { g.moveTo(tx - 8, y + h - 1); g.lineTo(tx + 8, y + h - 1); g.lineTo(tx, y + h + 12); }
  else if (o.tail === 'left') { g.moveTo(x + 1, y + h * .38); g.lineTo(x + 1, y + h * .66); g.lineTo(x - 14, y + h * .58); }
  else { g.moveTo(x + 8, y + h - 1); g.lineTo(x + 24, y + h - 1); g.lineTo(x + 6, y + h + 12); }
  g.closePath(); g.fillStyle = o.bg || '#eef4ff'; g.fill();
  g.strokeStyle = '#0b1020'; g.lineWidth = 2.6; g.stroke();
  for (let i = 0; i < lines.length; i++)
    hvmTxt(g, lines[i], x + w / 2, y + 20 + i * (o.lh || 16),
      { size: o.size || 12, color: '#111a2e', align: 'center', mono: false, ol: 'rgba(255,255,255,.85)', olw: 2.4 });
}
/* Thỏ thiên thần chibi — vẽ bằng lệnh, nảy nhẹ tại chỗ.
   o.glasses: đeo kính (ải 3) · o.net: cầm vợt bắt bug (ải 2) */
function hvmBunny(g, x, y, s, t, o) {
  o = o || {};
  const hop = Math.abs(Math.sin(t * 2.3 + (o.ph || 0)));
  const lift = hop * s * .12;
  const by = y - lift;
  const line = '#161d31', body = '#f5f8ff';
  const lw = Math.max(1.4, s * .05);
  g.save();
  /* bóng đổ co theo cú nảy */
  g.fillStyle = 'rgba(0,6,18,.4)';
  ellipsePath(g, x, y + s * .04, s * (.4 - hop * .07), s * .1); g.fill();
  /* cánh sau lưng — sáng hơn cánh trong scene vì modal nền rất tối */
  if (typeof hvWings === 'function') {
    try { hvWings(g, x, by + s * .04, s * 1.6, t * (o.fast ? 1.6 : 1) + (o.ph || 0), HVM_WING, true); } catch (e) {}
  } else {
    g.fillStyle = 'rgba(228,242,255,.9)';
    for (const sg of [-1, 1]) { g.save(); g.translate(x, by + s * .06); g.scale(sg, 1);
      g.beginPath(); g.ellipse(s * .3, -s * .05, s * .28, s * .14, -.5, 0, 6.283); g.fill(); g.restore(); }
  }
  g.lineJoin = 'round'; g.strokeStyle = line; g.lineWidth = lw;
  /* tai */
  for (const sg of [-1, 1]) {
    g.save(); g.translate(x + sg * s * .15, by - s * .74);
    g.rotate(sg * (.16 + hop * .07));
    g.fillStyle = body; rr(g, -s * .11, -s * .5, s * .22, s * .6, s * .11); g.fill(); g.stroke();
    g.fillStyle = '#f6b4cd'; rr(g, -s * .055, -s * .42, s * .11, s * .42, s * .055); g.fill();
    g.restore();
  }
  /* chân + thân + đầu */
  g.fillStyle = body;
  for (const sg of [-1, 1]) { ellipsePath(g, x + sg * s * .2, y - s * .04 - lift, s * .14, s * .09); g.fill(); g.stroke(); }
  ellipsePath(g, x, by + s * .24, s * .3, s * .26); g.fill(); g.stroke();
  ellipsePath(g, x - s * .3, by + s * .18, s * .1, s * .07); g.fill(); g.stroke();
  ellipsePath(g, x + s * .3, by + s * .18, s * .1, s * .07); g.fill(); g.stroke();
  ellipsePath(g, x, by - s * .12, s * .34, s * .31); g.fill(); g.stroke();
  /* mặt */
  g.fillStyle = line;
  for (const sg of [-1, 1]) { ellipsePath(g, x + sg * s * .13, by - s * .13, s * .045, s * .06); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,.9)';
  for (const sg of [-1, 1]) { g.beginPath(); g.arc(x + sg * s * .145, by - s * .155, s * .017, 0, 7); g.fill(); }
  g.fillStyle = '#f2789f';
  ellipsePath(g, x, by - s * .04, s * .035, s * .028); g.fill();
  g.strokeStyle = 'rgba(242,120,159,.5)'; g.lineWidth = Math.max(1, s * .03);
  for (const sg of [-1, 1]) { g.beginPath(); g.arc(x + sg * s * .23, by - s * .02, s * .055, 0, 6.283); g.stroke(); }
  g.strokeStyle = 'rgba(22,29,49,.7)'; g.lineWidth = Math.max(1, s * .028);
  for (const sg of [-1, 1]) {
    g.beginPath(); g.moveTo(x + sg * s * .2, by - s * .06); g.lineTo(x + sg * s * .38, by - s * .09);
    g.moveTo(x + sg * s * .2, by - s * .02); g.lineTo(x + sg * s * .38, by - s * .01); g.stroke();
  }
  /* kính(trạm 3) */
  if (o.glasses) {
    g.strokeStyle = '#101827'; g.lineWidth = Math.max(1.4, s * .04);
    for (const sg of [-1, 1]) {
      g.beginPath(); g.arc(x + sg * s * .13, by - s * .13, s * .1, 0, 6.283);
      g.fillStyle = 'rgba(150,210,255,.3)'; g.fill(); g.stroke();
    }
    g.beginPath(); g.moveTo(x - s * .03, by - s * .13); g.lineTo(x + s * .03, by - s * .13); g.stroke();
  }
  /* vợt bắt bug(trạm 2) */
  if (o.net) {
    const nx = x + s * .52, ny = by - s * .5, r = s * .2;
    g.strokeStyle = '#7c4a1e'; g.lineWidth = Math.max(1.8, s * .05);
    g.beginPath(); g.moveTo(x + s * .26, by + s * .1); g.lineTo(nx, ny); g.stroke();
    g.strokeStyle = '#cbd5e1'; g.lineWidth = Math.max(1.6, s * .045);
    g.beginPath(); g.arc(nx, ny, r, 0, 6.283); g.stroke();
    g.save(); g.beginPath(); g.arc(nx, ny, r, 0, 6.283); g.clip();
    g.strokeStyle = 'rgba(203,213,225,.5)'; g.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      g.beginPath(); g.moveTo(nx + i * r * .45, ny - r); g.lineTo(nx + i * r * .45, ny + r); g.stroke();
      g.beginPath(); g.moveTo(nx - r, ny + i * r * .45); g.lineTo(nx + r, ny + i * r * .45); g.stroke();
    }
    g.restore();
    g.fillStyle = '#dc2626'; g.beginPath(); g.arc(nx, ny, r * .34, 0, 7); g.fill();
    g.strokeStyle = '#3b0a0a'; g.lineWidth = 1; g.stroke();
  }
  /* hào quang — đặt cao hơn hẳn ngọn tai, viền mảnh để không thành "thanh vàng" */
  hvmGlow(g, x, by - s * 1.42, s * .34, '252,211,77', .14 + hop * .07);
  g.strokeStyle = 'rgba(253,224,71,.95)'; g.lineWidth = Math.max(1.6, s * .036);
  g.beginPath(); g.ellipse(x, by - s * 1.42, s * .21, s * .062, 0, 0, 6.2832); g.stroke();
  g.strokeStyle = 'rgba(255,248,222,.75)'; g.lineWidth = Math.max(1, s * .018);
  g.beginPath(); g.ellipse(x, by - s * 1.45, s * .17, s * .045, 0, 0, 6.2832); g.stroke();
  g.restore();
}
/* Chữ bay lên khi diệt bug */
function hvmFloatPush(g, x, y, txt, col) {
  if (g.floats.length < 26) g.floats.push({ x: x, y: y, txt: txt, col: col, t: 0 });
}
function hvmFloatsTick(g, dt) {
  for (let i = g.floats.length - 1; i >= 0; i--) {
    const f = g.floats[i]; f.t += dt; f.y -= 30 * dt;
    if (f.t > 1.15) g.floats.splice(i, 1);
  }
}
function hvmFloatsDraw(g, S) {
  for (const f of S.floats)
    hvmTxt(g, f.txt, f.x, f.y, { size: 13, color: f.col, align: 'center', alpha: Math.max(0, 1 - f.t / 1.15), olw: 3.6 });
}
function hvmWinOverlay(g, L) {
  g.fillStyle = 'rgba(3,10,22,.78)'; g.fillRect(0, 0, HVM_W, HVM_H);
  const st = '⭐'.repeat(L.stars) + '☆'.repeat(3 - L.stars);
  hvmTxt(g, '✅ CHƯƠNG TRÌNH CHẠY ĐÚNG', HVM_W / 2, 176,
    { size: 24, color: '#4ade80', align: 'center', mono: false, glow: '#22c55e', glowSize: 16, olw: 5 });
  hvmTxt(g, st, HVM_W / 2, 214, { size: 22, color: '#fde047', align: 'center', olw: 4 });
  hvmTxt(g, 'Bấm ✔ XONG TRẠM để nhận thưởng, hoặc LÀM LẠI để lấy sao cao hơn',
    HVM_W / 2, 246, { size: 12, color: '#bae6fd', align: 'center', mono: false, olw: 3.4 });
}
function hvmFailOverlay(g, S) {
  g.fillStyle = 'rgba(3,6,12,.8)'; g.fillRect(0, 0, HVM_W, HVM_H);
  hvmTxt(g, '⏱ HẾT GIỜ — BUG LAN TOÀN MẠCH', HVM_W / 2, 186,
    { size: 24, color: '#f97316', align: 'center', mono: false, glow: '#ef4444', glowSize: 14, olw: 5 });
  hvmTxt(g, 'Diệt được ' + S.killed + '/' + S.need + ' con · còn ' + (S.need - S.killed) + ' con chờ vá',
    HVM_W / 2, 218, { size: 12.5, color: '#cbd5e1', align: 'center', mono: false, olw: 3.6 });
}

/* ============================================================
   4. TRÒ CHUNG — XẾP DÒNG CODE (bấm 2 dòng HOẶC kéo thả để đổi chỗ)
   ============================================================ */
function hvmRowY(cfg, k) { return cfg.hy + k * cfg.pitch; }
function hvmListInit(g, lines, t) {
  g.lines = lines; g.n = lines.length;
  g.order = hvmShuffle(g.n);
  g.sel = -1; g.drag = null; g.bad = []; g.hintAt = null;
  g.mistakes = 0; g.hintUsed = 0; g.t0 = t; g.win = false; g.resolve = 0;
}
function hvmRowAt(cfg, g, p) {
  for (let k = 0; k < g.n; k++) {
    const y = hvmRowY(cfg, k);
    if (p.y >= y - 3 && p.y <= y + cfg.bh + 3 && p.x >= cfg.hx - 10 && p.x <= cfg.hx + cfg.hw) return k;
  }
  return -1;
}
function hvmSwap(g, a, b, t) {
  if (a === b) return;
  const t2 = g.order[a]; g.order[a] = g.order[b]; g.order[b] = t2;
  g.bad = []; g.resolve = 0; g.sel = -1;
  hvmSfx('pop'); hvmBeep(680, 'triangle', .05, .03);
}
function hvmListDown(g, cfg, p) {
  if (g.win) return;
  const k = hvmRowAt(cfg, g, p);
  if (k < 0) { g.sel = -1; g.drag = null; return; }
  g.drag = { from: k, sx: p.x, sy: p.y, x: p.x, y: p.y, dragging: false };
}
function hvmListMove(g, cfg, p) {
  const d = g.drag; if (!d) return;
  d.x = p.x; d.y = p.y;
  if (!d.dragging && Math.hypot(p.x - d.sx, p.y - d.sy) > 6) { d.dragging = true; g.sel = -1; hvmBeep(540, 'sine', .04, .02); }
}
function hvmListUp(g, cfg, p) {
  const d = g.drag; g.drag = null;
  if (!d || g.win) return;
  const k = hvmRowAt(cfg, g, p);
  if (!d.dragging) {
    if (g.sel < 0) { g.sel = d.from; hvmBeep(760, 'sine', .05, .025); }
    else if (g.sel === d.from) g.sel = -1;
    else { hvmSwap(g, g.sel, d.from); return; }
    return;
  }
  if (k >= 0 && k !== d.from) hvmSwap(g, d.from, k);
}
function hvmListCheck(g, t, onWin) {
  if (g.win) return;
  const bad = [];
  for (let i = 0; i < g.n; i++) if (g.order[i] !== i) bad.push(i);
  if (!bad.length) { g.bad = []; onWin(); return; }
  g.mistakes++; g.bad = bad; g.resolve = t + 1.25;
  hvmBeep(150, 'square', .18, .05);
}
function hvmListTick(g, t, dt) {
  if (g.hintAt && t > g.hintAt.until) g.hintAt = null;
  if (g.resolve && t >= g.resolve) { g.resolve = 0; g.bad = []; }
}
function hvmListHint(g, t) {
  for (let i = 0; i < g.n; i++) {
    if (g.order[i] === i) continue;
    let j = i;                                    // dòng đúng đang đứng ở ô j
    for (let k = 0; k < g.n; k++) if (g.order[k] === i) j = k;
    g.hintAt = { a: i, b: j, until: t + 2.2 };
    g.hintUsed++;
    hvmBeep(940, 'sine', .07, .025);
    return;
  }
}
function hvmListStars(g) { return g.hintUsed ? 1 : g.mistakes === 0 ? 3 : g.mistakes <= 2 ? 2 : 1; }
/* viên thuốc code: ô kéo ở mép trái + dải màu + chữ monospace */
function hvmPill(g, x, y, w, h, txt, o) {
  o = o || {};
  const sh = o.shake ? Math.sin(o.shake * 44) * 3 : 0;
  x += sh;
  if (o.lift) { g.save(); g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 16; g.shadowOffsetY = 7; }
  /* ô kéo (như mẫu: vuông xám có chấm) */
  rr(g, x, y, h - 4, h, 8);
  g.fillStyle = o.gut || '#39414f'; g.fill();
  g.strokeStyle = 'rgba(0,0,0,.8)'; g.lineWidth = 2; g.stroke();
  if (o.num === undefined) {
    g.fillStyle = 'rgba(226,238,255,.5)';
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++)
      g.fillRect(x + (h - 4) * .3 + c * 6, y + h * .32 + r * 7, 2.4, 2.4);
  }
  /* thân viên thuốc */
  const px = x + h + 2, pw = w - h - 2;
  rr(g, px, y, pw, h, 9);
  const grd = g.createLinearGradient(0, y, 0, y + h);
  grd.addColorStop(0, o.bg || '#122036'); grd.addColorStop(1, '#0a1220');
  g.fillStyle = grd; g.fill();
  if (o.lift) g.restore();
  g.strokeStyle = o.rim || 'rgba(125,211,252,.5)'; g.lineWidth = o.lw || 2.4; g.stroke();
  if (o.glow) hvmGlow(g, px + pw / 2, y + h / 2, pw * .55, o.glow, .14);
  if (o.num !== undefined) {
    hvmTxt(g, String(o.num), x + (h - 4) / 2, y + h / 2 + 4, { size: 11, color: '#dbe7f7', align: 'center' });
  }
  hvmTxt(g, fitTxt(g, txt, pw - 22, o.size || 12.5), px + 11, y + h / 2 + 4.4,
    { size: o.size || 12.5, color: o.col || '#dbeafe', olw: 3 });
  if (o.mark) hvmTxt(g, o.mark, x + w - 6, y + h / 2 + 5, { size: 14, color: o.markCol || '#4ade80', align: 'right', olw: 3.4 });
}

/* ============================================================
   5. ẢI 1 — "Bảng xếp code" (hoán đổi a và b)
   ============================================================ */
function hvmRunSwap(S) {
  const v = {}, tr = [];
  const watch = () => ['a', 'b', 'temp'].filter(k => k in v).map(k => k + '=' + v[k]).join('  ');
  for (let k = 0; k < S.n; k++) {
    const line = HVM_SWAP[S.order[k]], miss = line.run(v);
    if (miss) { tr.push({ t: line.t, err: miss }); return { err: miss, k: k, tr: tr }; }
    tr.push({ t: line.t, w: /^console\.log/.test(line.t) ? 'in ra ' + v.log : watch() });
  }
  return { log: v.log, ok: v.log === '25, 15', tr: tr };
}
const HVM_G1 = {
  key: 'sort',
  btn: '✔ KIỂM TRA',
  btnBg: 'linear-gradient(160deg,#fde047,#f59e0b)',
  again: '🔄 LÀM LẠI',
  btn2: '💡 GỢI Ý',
  init(g, t, pc) {
    hvmListInit(g, HVM_SWAP.map(l => l.t), t);
  },
  tick(g, t, dt) { if (!g.win) hvmListTick(g, t, dt); },
  ptr(g, kind, p, t) {
    if (g.win) return;
    if (kind === 'down') hvmListDown(g, HVM_BOARD, p);
    else if (kind === 'move') hvmListMove(g, HVM_BOARD, p);
    else if (kind === 'up') hvmListUp(g, HVM_BOARD, p);
  },
  pulse(g, t) { hvmListCheck(g, t, () => { g.win = true; }); },
  hintBtn(g, t) { if (!g.win) hvmListHint(g, t); },
  hint(g) {
    const S = g;
    if (S.win) return '🎉 Đoạn code đã chạy đúng!';
    if (S.bad.length) return '❌ ' + S.bad.length + ' dòng sai thứ tự — chúng đã được đánh dấu đỏ, đổi chỗ rồi bấm KIỂM TRA lại.';
    if (S.hintAt) return '💡 Hãy đổi chỗ dòng ' + (S.hintAt.a + 1) + ' ↔ ' + (S.hintAt.b + 1) + ' (đang nhấp nháy vàng).';
    if (S.sel >= 0) return '🖱 Đã chọn dòng ' + (S.sel + 1) + ' — bấm thêm một dòng nữa (hoặc kéo thả) để đổi chỗ.';
    return '🖱 Bấm hai dòng để ĐỔI CHỖ, hoặc KÉO thả một dòng lên dòng khác · xếp đúng 6/6 rồi bấm ✔ KIỂM TRA';
  },
  stars(g) { return hvmListStars(g); },
  draw(g, S, t, L) {
    hvmCodeBg(g, t);
    hvmCloudBand(g, t);
    /* bảng xếp code */
    hvmBoard(g, HVM_BOARD, 'Bảng xếp code', { sub: 'Sắp xếp thuật toán hoán vị' });
    hvmCardDeco(g, HVM_BOARD, t);
    const cfg = HVM_BOARD;
    const dragK = (S.drag && S.drag.dragging) ? S.drag.from : -1;
    for (let k = 0; k < S.n; k++) {
      if (k === dragK) continue;
      const i = S.order[k], hue = HVM_HUE[i % HVM_HUE.length];
      const bad = S.bad.indexOf(k) >= 0;
      const hint = !!S.hintAt && (S.hintAt.a === k || S.hintAt.b === k);
      hvmPill(g, cfg.hx, hvmRowY(cfg, k), cfg.hw, cfg.bh, S.lines[i], {
        num: k + 1, size: 11.5,
        rim: bad ? '#ef4444' : hint ? '#fde047' : S.sel === k ? '#f8fafc' : hue.rim,
        bg: bad ? '#2b1016' : hue.bg,
        col: bad ? '#fecaca' : hue.col,
        glow: hint ? '253,224,71' : S.sel === k ? '248,250,252' : null,
        shake: bad ? t : 0,
        mark: bad ? '✕' : (S.win ? '✔' : ''),
        markCol: bad ? '#f87171' : '#4ade80'
      });
    }
    if (dragK >= 0) {
      const i = S.order[dragK], hue = HVM_HUE[i % HVM_HUE.length];
      const y = Math.max(cfg.y + 30, Math.min(cfg.y + cfg.h - cfg.bh - 4, S.drag.y - cfg.bh / 2));
      hvmPill(g, cfg.hx + 10, y, cfg.hw, cfg.bh, S.lines[i], { num: dragK + 1, size: 11.5, rim: '#7dd3fc', bg: hue.bg, col: '#eaf5ff', lift: true });
    }
    /* ô chạy thử console: bảng watch chạy theo đúng thứ tự đang xếp */
    const TR = HVM_TRACE;
    hvmBoard(g, TR, 'Chạy thử console', { rim: 'rgba(167,139,250,.4)' });
    const r = hvmRunSwap(S);
    hvmTxt(g, 'Mục tiêu: a = 25 · b = 15', TR.x + 16, TR.y + 54, { size: 11.5, color: '#c7d6ee', mono: false });
    hvmTxt(g, 'console.log(a, b) →', TR.x + 16, TR.y + 78, { size: 11, color: '#8fb4dc' });
    if (r.err) {
      hvmTxt(g, '⚠ ReferenceError: ' + r.err + ' is not defined', TR.x + 132, TR.y + 78,
        { size: 12, color: '#fca5a5', mono: false });
      hvmTxt(g, 'dòng ' + (r.k + 1) + ' dùng biến chưa được gán', TR.x + 16, TR.y + 98, { size: 10.5, color: '#f0ab8f', mono: false });
    } else {
      hvmTxt(g, r.log, TR.x + 132, TR.y + 80, { size: 17, color: r.ok ? '#4ade80' : '#fbbf24', glow: r.ok ? '#22c55e' : '#f59e0b', glowSize: 10 });
    }
    /* vết chạy từng dòng (chỉ những dòng đã chạy được) */
    rr(g, TR.x + 12, TR.y + 108, TR.w - 24, 132, 9);
    g.fillStyle = 'rgba(4,9,20,.72)'; g.fill();
    g.strokeStyle = 'rgba(125,211,252,.2)'; g.lineWidth = 1.4; g.stroke();
    for (let i = 0; i < r.tr.length && i < 6; i++) {
      const e = r.tr[i], y = TR.y + 126 + i * 19;
      hvmTxt(g, String(i + 1), TR.x + 22, y, { size: 9.5, color: '#4d7ba3', ol: false });
      hvmTxt(g, e.err ? '✕ ' + e.t : e.t, TR.x + 38, y,
        { size: 10.5, color: e.err ? '#fca5a5' : '#bcd8f2', olw: 2.4 });
      if (!e.err) hvmTxt(g, e.w, TR.x + TR.w - 22, y, { size: 10.5, color: '#7fe3a8', align: 'right', olw: 2.4 });
    }
    if (r.tr.length < S.n)
      hvmTxt(g, '… ' + (S.n - r.tr.length) + ' dòng còn lại chưa chạy tới', TR.x + 38,
        TR.y + 126 + r.tr.length * 19, { size: 10, color: '#8a7fb0', mono: false, olw: 2.4 });
    hvmTxt(g, r.ok ? '✔ đúng kết quả hoán đổi' : '✕ a và b chưa đổi chỗ cho nhau',
      TR.x + 16, TR.y + TR.h - 26, { size: 11.5, color: r.ok ? '#86efac' : '#fcd34d', mono: false });
    hvmTxt(g, 'Sai ' + S.mistakes + ' lần · Gợi ý ' + S.hintUsed,
      TR.x + TR.w - 16, TR.y + TR.h - 10, { size: 10.5, color: '#93a7c4', align: 'right', mono: false });
    /* thỏ dẫn dắt + bọt chữ (dải dưới, theo mẫu) */
    hvmGuide(g, t, ['Kéo thả để đổi chỗ các dòng', 'code theo đúng logic nhé!'], {});
    hvmTxt(g, 'Trạm 1 · thuật toán đổi chỗ', HVM_W - 24, HVM_STRIP.ky + 60,
      { size: 10.5, color: '#8fb4dc', align: 'right', mono: false });
    if (L.done) hvmWinOverlay(g, L);
    mgDrawFx(g, 'hv-mini');
  }
};

/* ============================================================
   6. ẢI 2 — "BẮT BUG IT"
   ============================================================ */
const HVM_BUGC = {
  red: { a: '#fca5a5', b: '#dc2626', c: '#7f1d1d', rgb: '239,68,68' },
  green: { a: '#bbf7d0', b: '#22c55e', c: '#14532d', rgb: '74,222,128' }
};
const HVM_G2 = {
  key: 'bug',
  btn: '',
  again: '▶ CHƠI TIẾP',
  init(g, t, pc) {
    /* bốc 10 dòng code ngẫu nhiên cho màn hình debug */
    const pool = HVM_POOL.slice(); g.src = [];
    for (let i = 0; i < HVM_SCREEN.lines && pool.length; i++)
      g.src.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    g.bugs = []; g.floats = []; g.killed = 0; g.miss = 0;
    g.need = 15; g.max = 15; g.time = 45; g.left = 45;
    g.spawn = 0; g.id = 0; g.dead = false; g.win = false;
    g.mouse = { x: -99, y: -99, in: false }; g.t0 = t;
    g.bonusCoin = 0; g.bonusXp = 0;
    for (let i = 0; i < 7; i++) this.spawnBug(g);
  },
  spawnBug(g) {
    const R = HVM_SCREEN, m = R.pad;
    g.bugs.push({
      id: g.id++,
      x: R.x + m + Math.random() * (R.w - m * 2),
      y: R.y + m + Math.random() * (R.h - m * 2),
      ang: Math.random() * 6.283, sp: 40 + Math.random() * 54,
      sz: 9 + Math.random() * 4, wob: Math.random() * 6.28,
      col: Math.random() < .5 ? 'red' : 'green',
      turn: .5 + Math.random() * 1.3, flash: 0
    });
  },
  tick(g, t, dt) {
    if (g.win || g.dead) { hvmFloatsTick(g, dt); return; }
    g.left -= dt;
    if (g.left <= 0) {
      g.left = 0; g.dead = true;
      hvmBeep(90, 'sawtooth', .35, .05);
      mgBurst('hv-mini', HVM_W / 2, HVM_H / 2, '#f97316', 20);
      return;
    }
    const R = HVM_SCREEN, m = R.pad;
    g.spawn -= dt;
    if (g.spawn <= 0 && g.bugs.length < g.max && g.killed + g.bugs.length < g.need) {
      this.spawnBug(g); g.spawn = .5 + Math.random() * .5;
    }
    for (const b of g.bugs) {
      b.turn -= dt;
      if (b.turn <= 0) { b.ang += (Math.random() - .5) * 1.9; b.turn = .45 + Math.random() * 1.3; }
      b.x += Math.cos(b.ang) * b.sp * dt;
      b.y += Math.sin(b.ang) * b.sp * dt * .62;
      if (b.x < R.x + m) { b.x = R.x + m; b.ang = Math.PI - b.ang; }
      if (b.x > R.x + R.w - m) { b.x = R.x + R.w - m; b.ang = Math.PI - b.ang; }
      if (b.y < R.y + m) { b.y = R.y + m; b.ang = -b.ang; }
      if (b.y > R.y + R.h - m) { b.y = R.y + R.h - m; b.ang = -b.ang; }
      b.wob += dt * 11;
    }
    hvmFloatsTick(g, dt);
    if (g.killed >= g.need) g.win = true;
  },
  ptr(g, kind, p, t) {
    g.mouse = { x: p.x, y: p.y, in: true };
    if (kind !== 'down' || g.win || g.dead) return;
    const R = HVM_SCREEN;
    let best = -1, bd = 1e9;
    for (let k = 0; k < g.bugs.length; k++) {
      const b = g.bugs[k], d = Math.hypot(p.x - b.x, p.y - b.y);
      if (d <= b.sz * 1.9 && d < bd) { bd = d; best = k; }
    }
    if (best >= 0) {
      const b = g.bugs[best], C = HVM_BUGC[b.col];
      g.bugs.splice(best, 1); g.killed++;
      g.bonusCoin += 10; g.bonusXp += 5;
      hvmSfx('pop'); hvmBeep(820, 'triangle', .05, .03);
      mgBurst('hv-mini', b.x, b.y, C.b, 12);
      mgBurst('hv-mini', b.x, b.y, '#fde047', 6);
      hvmFloatPush(g, b.x, b.y - 8, '+10 Coin', '#fbbf24');
      hvmFloatPush(g, b.x, b.y + 12, '+5 XP', '#4ade80');
      return;
    }
    if (p.x > R.x && p.x < R.x + R.w && p.y > R.y && p.y < R.y + R.h) {
      g.miss++;
      mgBurst('hv-mini', p.x, p.y, '#94a3b8', 5);
      hvmBeep(170, 'square', .07, .03);
    }
  },
  pulse(g, t) {
    if (g.win || g.dead || !g.bugs.length) return;
    let best = g.bugs[0];
    for (const b of g.bugs) if (Math.hypot(b.x - g.mouse.x, b.y - g.mouse.y) < Math.hypot(best.x - g.mouse.x, best.y - g.mouse.y)) best = b;
    best.flash = t + .9;
    hvmBeep(900, 'sine', .06, .025);
  },
  hint(g) {
    const S = g;
    if (S.dead) return '⏱ Hết giờ — bấm ▶ CHƠI TIẾP để bắt đầu ván mới.';
    if (S.win) return '🎉 Sạch bug! Đám mây đã online trở lại.';
    return '🐞 Click trúng con bug đang bò trên mã nguồn · mỗi con +10 Coin +5 XP · còn ' +
      (S.need - S.killed) + '/' + S.need + ' con trước khi hết ' + Math.ceil(S.left) + 's';
  },
  stars(g) { return g.left >= 22 ? 3 : g.left >= 10 ? 2 : 1; },
  draw(g, S, t, L) {
    hvmCodeBg(g, t);
    hvmCloudBand(g, t);
    const R = HVM_SCREEN;
    /* header: "Tiến độ: 8/15 BUG" vàng + "Thời gian: 45s" cam (đúng mẫu) */
    hvmTxt(g, 'Tiến độ: ' + S.killed + '/' + S.need + ' BUG', 20, 24,
      { size: 14, color: '#fde047', mono: false, olw: 4.2, glow: '#f59e0b', glowSize: 8 });
    hvmBar(g, 20, 30, 190, 7, S.killed / S.need, '#4ade80');
    const tc = S.left > 20 ? '#fb923c' : S.left > 10 ? '#fbbf24' : '#ef4444';
    hvmTxt(g, 'Thời gian: ' + Math.ceil(S.left) + 's', HVM_W - 20, 24,
      { size: 14, color: tc, align: 'right', mono: false, olw: 4.2, glow: S.left <= 10 ? '#ef4444' : null, glowSize: 10 });
    hvmBar(g, HVM_W - 210, 30, 190, 7, S.left / S.time, tc);
    hvmTxt(g, 'Bọ còn bò: ' + S.bugs.length + '   ·   Bấm trượt: ' + S.miss, HVM_W / 2, 24,
      { size: 11, color: '#93a7c4', align: 'center', mono: false });
    /* màn hình radar */
    hvmPanel(g, R.x, R.y, R.w, R.h, '#0b1120', '#050912', 'rgba(125,211,252,.26)');
    const cx = R.x + R.w / 2, cy = R.y + R.h / 2, rad = R.h / 2 - 12;
    /* vòng tròn radar + vạch ngắm */
    g.save();
    g.beginPath(); g.arc(cx, cy, rad, 0, 6.283);
    g.fillStyle = 'rgba(14,60,74,.5)'; g.fill();
    g.strokeStyle = 'rgba(45,212,191,.5)'; g.lineWidth = 2; g.stroke();
    for (let i = 1; i <= 3; i++) {
      g.beginPath(); g.arc(cx, cy, rad * i / 4, 0, 6.283);
      g.strokeStyle = 'rgba(45,212,191,' + (.26 - i * .04) + ')'; g.lineWidth = 1.2; g.stroke();
    }
    g.strokeStyle = 'rgba(45,212,191,.22)'; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(cx - rad, cy); g.lineTo(cx - 10, cy); g.moveTo(cx + 10, cy); g.lineTo(cx + rad, cy);
    g.moveTo(cx, cy - rad); g.lineTo(cx, cy - 10); g.moveTo(cx, cy + 10); g.lineTo(cx, cy + rad); g.stroke();
    /* quét radar: một tia + vệt mờ đi sau nó (sprite glow, không gradient mới) */
    const sa = t * .9;
    hvmGlow(g, cx + Math.cos(sa) * rad * .62, cy + Math.sin(sa) * rad * .62, rad * .5, '45,212,191', .07);
    g.strokeStyle = 'rgba(94,234,212,.55)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(sa) * rad, cy + Math.sin(sa) * rad); g.stroke();
    g.restore();
    /* code nền trong màn hình */
    g.fillStyle = 'rgba(56,189,248,.05)';
    g.fillRect(R.x, R.y, R.gut, R.h);
    g.strokeStyle = 'rgba(125,211,252,.18)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(R.x + R.gut, R.y); g.lineTo(R.x + R.gut, R.y + R.h); g.stroke();
    for (let i = 0; i < R.lines; i++) {
      const y = R.lineTop + i * R.lineH;
      hvmTxt(g, String(i + 1).padStart(2, '0'), R.x + 12, y, { size: 9.5, color: '#3f6f96', ol: false });
      const bug = i % 3 === 1;
      hvmTxt(g, S.src[i] || '', R.x + R.gut + 16, y, { size: 11, color: bug ? '#b9d8f5' : '#8fb4dc', olw: 2.4, alpha: .8 });
      if (bug) {
        g.strokeStyle = 'rgba(248,113,113,.35)'; g.lineWidth = 1.3;
        g.beginPath();
        for (let x = R.x + R.gut + 16; x < R.x + R.w - 14; x += 8) g.lineTo(x, y + 6 + ((x / 8) % 2 ? 2 : 0));
        g.stroke();
      }
    }
    /* vòng neon trang trí quanh màn (chất "phá hoại" của mẫu) */
    for (let i = 0; i < 4; i++) {
      const a0 = t * .5 + i * 1.57;
      g.strokeStyle = i % 2 ? 'rgba(232,121,249,.5)' : 'rgba(56,189,248,.5)';
      g.lineWidth = 3; g.lineCap = 'round';
      g.beginPath(); g.arc(cx, cy, rad + 8 + i * 5, a0, a0 + .85); g.stroke();
      g.beginPath(); g.arc(cx, cy, rad + 8 + i * 5, a0 + 3.14, a0 + 3.99); g.stroke();
    }
    g.lineCap = 'butt';
    /* bug */
    for (const b of S.bugs) this.drawBug(g, b, t);
    /* con trỏ ngắm */
    if (S.mouse.in && !S.win && !S.dead &&
      S.mouse.x > R.x && S.mouse.x < R.x + R.w && S.mouse.y > R.y && S.mouse.y < R.y + R.h) {
      g.save(); g.translate(S.mouse.x, S.mouse.y); g.rotate(t * 1.4);
      g.strokeStyle = 'rgba(103,232,249,.85)'; g.lineWidth = 2;
      g.beginPath(); g.arc(0, 0, 16, 0, 6.283); g.stroke();
      g.setLineDash([5, 6]); g.beginPath(); g.arc(0, 0, 22, 0, 6.283); g.stroke(); g.setLineDash([]);
      for (const a of [0, 1.5708, 3.1416, 4.7124]) {
        g.beginPath(); g.moveTo(Math.cos(a) * 24, Math.sin(a) * 24); g.lineTo(Math.cos(a) * 31, Math.sin(a) * 31); g.stroke();
      }
      g.restore();
      hvmTxt(g, 'CLICK ĐỂ FIX!', S.mouse.x + 36, S.mouse.y - 20, { size: 11.5, color: '#fde047', mono: false, olw: 3.6 });
    }
    hvmFloatsDraw(g, S);
    /* thỏ cầm vợt + bọt chữ (dải dưới) */
    hvmGuide(g, t, ['Nhập nhanh để tiêu diệt', 'hết Bug phá hoại!'], { bunny: { net: true, fast: true, ph: 1.2 } });
    hvmTxt(g, '🪙 +' + S.bonusCoin + ' Coin   ⭐ +' + S.bonusXp + ' XP', HVM_W - 24, HVM_STRIP.ky + 58,
      { size: 12, color: '#fbbf24', align: 'right', mono: false, olw: 3.6 });
    if (S.dead && !S.win) hvmFailOverlay(g, S);
    if (L.done) hvmWinOverlay(g, L);
    mgDrawFx(g, 'hv-mini');
  },
  drawBug(g, b, t) {
    const C = HVM_BUGC[b.col], s = b.sz;
    const mark = b.flash && t < b.flash;
    hvmGlow(g, b.x, b.y, s * 2.6, mark ? '253,224,71' : C.rgb, .2);
    g.save(); g.translate(b.x, b.y); g.rotate(b.ang);
    /* chân */
    g.strokeStyle = '#0a1020'; g.lineWidth = 1.5;
    for (let i = -1; i <= 1; i++) {
      const lx = i * s * .5, sw = Math.sin(b.wob * 2 + i) * 2.2;
      g.beginPath(); g.moveTo(lx, 0); g.lineTo(lx - s * .5, s + sw); g.stroke();
      g.beginPath(); g.moveTo(lx, 0); g.lineTo(lx + s * .5, -s - sw); g.stroke();
    }
    /* râu */
    g.beginPath(); g.moveTo(s * .9, -2); g.lineTo(s * 1.5, -s * .7); g.stroke();
    g.beginPath(); g.moveTo(s * .9, 2); g.lineTo(s * 1.5, s * .7); g.stroke();
    /* cánh */
    const grd = g.createLinearGradient(-s, -s, s, s);
    grd.addColorStop(0, C.a); grd.addColorStop(.5, C.b); grd.addColorStop(1, C.c);
    g.beginPath(); g.ellipse(0, 0, s * 1.05, s * .76, 0, 0, 7);
    g.fillStyle = grd; g.fill();
    g.strokeStyle = 'rgba(8,12,22,.9)'; g.lineWidth = 1.6; g.stroke();
    g.beginPath(); g.moveTo(-s * 1.02, 0); g.lineTo(s * .98, 0);
    g.strokeStyle = 'rgba(10,14,24,.8)'; g.lineWidth = 1.4; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.8)';
    for (let i = 0; i < 3; i++) {
      g.beginPath(); g.arc(-s * .5 + i * s * .5, -s * .32, 1.4, 0, 7); g.fill();
      g.beginPath(); g.arc(-s * .5 + i * s * .5, s * .32, 1.4, 0, 7); g.fill();
    }
    /* đầu + mắt */
    g.beginPath(); g.arc(s * 1.0, 0, s * .4, 0, 7); g.fillStyle = '#0f1626'; g.fill();
    g.fillStyle = '#fde047';
    g.beginPath(); g.arc(s * 1.12, -s * .16, s * .1, 0, 7); g.fill();
    g.beginPath(); g.arc(s * 1.12, s * .16, s * .1, 0, 7); g.fill();
    if (mark) { g.strokeStyle = '#fde047'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, s * 1.7, 0, 7); g.stroke(); }
    g.restore();
  }
};

/* ============================================================
   7. ẢI 3 — "SẮP XẾP CODE NÂNG CAO" (khối lồng async/await)
   ============================================================ */
/* Đọc thứ tự hiện tại bằng stack CÓ KIỂU KHỐI (hàm / try / catch) → báo đúng
   lỗi ngữ pháp. Mẫu 8 dòng kết thúc bằng "}," nên khối hàm async vẫn còn mở:
   đó là cấu trúc ĐÚNG, vì vậy so với stack residual của đáp án chứ không so
   với 0 — nếu không thì bảng phụ luôn méc "còn 1 ngoặc chưa đóng". */
function hvmNestTok(txt) {
  if (/^async function/.test(txt)) return { push: 'hàm' };
  if (/^try\s*\{/.test(txt)) return { push: 'try' };
  if (/^\}\s*catch/.test(txt)) return { close: 'try', push: 'catch' };
  if (/^\}/.test(txt)) return { close: '*' };
  return {};
}
function hvmNestStack(lines, order) {
  const st = []; let err = null, max = 0;
  for (let k = 0; k < order.length && !err; k++) {
    const tk = hvmNestTok(lines[order[k]]);
    if (tk.close) {
      if (!st.length) err = { k: k, why: 'đóng ngoặc sớm hơn mở — chưa có khối nào đang mở' };
      else if (tk.close !== '*' && st[st.length - 1] !== tk.close) err = { k: k, why: 'là "} catch" — phải đặt ngay sau "try {"' };
      else st.pop();
    }
    if (tk.push) st.push(tk.push);
    max = Math.max(max, st.length);
  }
  return { st: st, max: max, err: err };
}
const HVM_NEST_REF = hvmNestStack(HVM_NEST_SRC.map(l => l.t), HVM_NEST_SRC.map((l, i) => i));
function hvmNestScan(S) {
  const r = hvmNestStack(S.lines, S.order);
  r.ok = !r.err && r.st.join('|') === HVM_NEST_REF.st.join('|');
  return r;
}
const HVM_G3 = {
  key: 'nest',
  btn: '✔ HOÀN THÀNH',
  btnBg: 'linear-gradient(160deg,#c4b5fd,#7c3aed)',
  again: '🔄 LÀM LẠI',
  btn2: '💡 GỢI Ý',
  init(g, t, pc) {
    hvmListInit(g, HVM_NEST_SRC.map(l => l.t), t);
    g.dep = HVM_NEST_SRC.map(l => l.d);
  },
  tick(g, t, dt) { if (!g.win) hvmListTick(g, t, dt); },
  ptr(g, kind, p, t) {
    if (g.win) return;
    if (kind === 'down') hvmListDown(g, HVM_NEST, p);
    else if (kind === 'move') hvmListMove(g, HVM_NEST, p);
    else if (kind === 'up') hvmListUp(g, HVM_NEST, p);
  },
  pulse(g, t) { hvmListCheck(g, t, () => { g.win = true; }); },
  hintBtn(g, t) { if (!g.win) hvmListHint(g, t); },
  hint(g) {
    const S = g;
    if (S.win) return '🎉 Hàm tải dữ liệu đám mây đã lồng khối chuẩn!';
    const sc = hvmNestScan(S);
    if (S.bad.length) return '❌ ' + S.bad.length + ' khối sai vị trí (đỏ) — xếp lại cho đúng rồi bấm HOÀN THÀNH.';
    if (S.hintAt) return '💡 Đổi khối ' + (S.hintAt.a + 1) + ' ↔ ' + (S.hintAt.b + 1) + ' (đang nhấp nháy vàng).';
    if (sc.err) return '⚠ Ngữ pháp lỗi ở dòng ' + (sc.err.k + 1) + ': ' + sc.err.why + '.';
    if (!sc.ok) return '⚠ Cấu trúc lồng chưa khớp — khối đang mở: ' + sc.st.join(' → ') + '.';
    return '🖱 Bấm hai khối (hoặc kéo thả) để đổi chỗ · mạch đúng: async → try → await → return → catch → log → đóng khối';
  },
  stars(g) { return hvmListStars(g); },
  draw(g, S, t, L) {
    hvmCodeBg(g, t);
    hvmCloudBand(g, t);
    /* thẻ code một tiêu đề (mẫu bỏ hai tab của bản cũ) */
    hvmBoard(g, HVM_NEST, 'Tải dữ liệu đám mây', { rim: 'rgba(34,211,238,.34)' });
    hvmCardDeco(g, HVM_NEST, t);
    hvmTxt(g, 'Chức năng · async / await / try-catch', HVM_W / 2, 22,
      { size: 11.5, color: '#93c5fd', align: 'center', mono: false });
    /* các khối lồng */
    const cfg = HVM_NEST;
    const dragK = (S.drag && S.drag.dragging) ? S.drag.from : -1;
    for (let k = 0; k < S.n; k++) {
      if (k === dragK) continue;
      const i = S.order[k], d = S.dep[i], hue = HVM_HUE[i % HVM_HUE.length];
      const bad = S.bad.indexOf(k) >= 0;
      const hint = !!S.hintAt && (S.hintAt.a === k || S.hintAt.b === k);
      const x = cfg.hx + d * cfg.indent, w = cfg.hw - d * cfg.indent;
      const y = hvmRowY(cfg, k);
      rr(g, x, y, w, cfg.bh, 7);
      const grd = g.createLinearGradient(0, y, 0, y + cfg.bh);
      grd.addColorStop(0, bad ? '#2b1016' : hue.bg); grd.addColorStop(1, '#0a1220');
      g.fillStyle = grd; g.fill();
      g.strokeStyle = bad ? '#ef4444' : hint ? '#fde047' : S.sel === k ? '#f8fafc' : hue.rim;
      g.lineWidth = 2.2; g.stroke();
      /* dải lồng bên trái */
      g.fillStyle = bad ? '#ef4444' : hue.rim;
      rr(g, x, y, 5, cfg.bh, 2.5); g.fill();
      if (hint || S.sel === k) hvmGlow(g, x + w / 2, y + cfg.bh / 2, w * .5, hint ? '253,224,71' : '248,250,252', .12);
      hvmTxt(g, String(k + 1), cfg.hx - 14, y + cfg.bh / 2 + 4, { size: 10, color: '#7f97b6', align: 'center', ol: false });
      hvmTxt(g, fitTxt(g, S.lines[S.order[k]], w - 22, 11.5), x + 12, y + cfg.bh / 2 + 4,
        { size: 11.5, color: bad ? '#fecaca' : hue.col, olw: 2.8 });
      if (bad || S.win) hvmTxt(g, bad ? '✕' : '✔', x + w - 8, y + cfg.bh / 2 + 5,
        { size: 12.5, color: bad ? '#f87171' : '#4ade80', align: 'right', olw: 3 });
    }
    if (dragK >= 0) {
      const i = S.order[dragK], d = S.dep[i], hue = HVM_HUE[i % HVM_HUE.length];
      const x = cfg.hx + d * cfg.indent;
      const y = Math.max(cfg.y + 36, Math.min(cfg.y + cfg.h - cfg.bh - 4, S.drag.y - cfg.bh / 2));
      rr(g, x, y, cfg.hw - d * cfg.indent, cfg.bh, 7);
      g.save(); g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 16; g.shadowOffsetY = 7;
      g.fillStyle = hue.bg; g.fill(); g.restore();
      g.strokeStyle = '#7dd3fc'; g.lineWidth = 2.4; g.stroke();
      hvmTxt(g, S.lines[i], x + 12, y + cfg.bh / 2 + 4, { size: 11.5, color: '#eaf5ff', olw: 2.8 });
    }
    /* dải dưới: thỏ đeo kính + bọt chữ + khối đọc stack ngoặc (góc phải) */
    const sc = hvmNestScan(S);
    hvmGuide(g, t, ['Cùng hoàn thành đoạn code', 'phức tạp này nào!'], { bunny: { glasses: true, ph: 2.1 } });
    hvmChestMini(g, 486, 372, t);
    hvmTxt(g, 'ĐỘ SÂU LỒNG: ' + sc.max + ' / ' + HVM_NEST_REF.max, HVM_W - 24, 322,
      { size: 10.5, color: '#c7d6ee', align: 'right', mono: false });
    for (let d = 0; d < HVM_NEST_REF.max; d++) {
      const wBar = 180 - d * 34, bx = HVM_W - 24 - wBar, by = 328 + d * 9;
      g.fillStyle = sc.max > d ? '#a78bfa' : 'rgba(120,150,190,.25)';
      rr(g, bx, by, wBar, 6, 3); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.7)'; g.lineWidth = 1.2; g.stroke();
    }
    hvmTxt(g, sc.ok ? '✔ lồng khối chuẩn' : '✕ chưa khớp ngoặc',
      HVM_W - 24, 372, { size: 11.5, color: sc.ok ? '#86efac' : '#fca5a5', align: 'right', mono: false, olw: 3.2 });
    hvmTxt(g, sc.err ? 'Dòng ' + (sc.err.k + 1) + ': đóng sớm hơn mở' : 'Khối đang mở: ' + sc.st.join(' · '),
      HVM_W - 24, 388, { size: 9.5, color: '#93a7c4', align: 'right', mono: false, olw: 2.6 });
    if (L.done) hvmWinOverlay(g, L);
    mgDrawFx(g, 'hv-mini');
  }
};
function hvmChestMini(g, x, y, t) {
  const p = .5 + .5 * Math.sin(t * 2.2);
  hvmGlow(g, x, y - 8, 30 + p * 6, '252,211,77', .16 + p * .08);
  g.fillStyle = '#8b5a1e'; rr(g, x - 20, y - 8, 40, 20, 5); g.fill();
  g.strokeStyle = '#2b1a08'; g.lineWidth = 2; g.stroke();
  g.fillStyle = '#b07a2e'; rr(g, x - 22, y - 18, 44, 12, 6); g.fill(); g.stroke();
  g.fillStyle = '#fde047';
  for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(x - 12 + i * 8, y - 14 - (i % 2) * 3, 4, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(0,0,0,.8)'; g.lineWidth = 1.2; g.stroke();
  g.fillStyle = '#facc15'; rr(g, x - 4, y - 6, 8, 10, 2); g.fill(); g.stroke();
}

const HVM_MODS = { sort: HVM_G1, bug: HVM_G2, nest: HVM_G3 };
/* Trạm 3 trong heaven.js vẫn khai kind:'sort' (file đó không sửa) → nối ải
   theo id để khỏi đụng dữ liệu của Khu 4. */
const HVM_FOR = { hv_pc1: HVM_G1, hv_pc2: HVM_G2, hv_pc3: HVM_G3 };

/* ============================================================
   8. MODAL hv-mini
   ============================================================ */
let HVM = null;                                    // { pc, mod, g, done, stars, t, _hint }

function hvmVisible() { return mgVis('hv-mini'); }
function hvmCut() { try { return typeof HV_CUT !== 'undefined' && !!HV_CUT; } catch (e) { return false; } }

function hvMiniEl() {
  let m = document.getElementById('hv-mini');
  if (!m) {
    m = document.createElement('div');
    m.id = 'hv-mini'; m.className = 'modal';
    document.getElementById('app').appendChild(m);
  }
  return m;
}
function hvMiniLayout() {
  const m = hvMiniEl();
  m.style.cssText = 'display:flex;flex-direction:column;gap:8px;position:absolute;inset:14px 76px;transform:none;animation:none;padding:14px 20px 12px;background:linear-gradient(160deg,#0b2a55,#04101f);border:2px solid #7dd3fc;border-radius:18px;color:#e6f2ff;font:13px "Segoe UI",sans-serif;z-index:120;box-shadow:0 20px 60px #000c';
  m.innerHTML =
    '<div id="hv-mini-hd" style="display:flex;justify-content:space-between;align-items:center"></div>' +
    '<div id="hv-mini-hint" style="font-size:12px;color:#bae6fd;min-height:16px"></div>' +
    '<div style="display:flex;justify-content:center"><canvas id="hv-mini-cv" style="width:760px;max-width:100%;display:block;border-radius:12px;background:#070b20;touch-action:none;cursor:crosshair"></canvas></div>' +
    '<div id="hv-mini-foot" style="display:flex;justify-content:center;align-items:center;gap:10px;min-height:38px"></div>';
  const cv = document.getElementById('hv-mini-cv');
  const pos = ev => mgPoint(cv, ev, HVM_W, HVM_H);
  cv.addEventListener('pointerdown', ev => {
    try { cv.setPointerCapture(ev.pointerId); } catch (e) {}
    hvMiniPtr('down', pos(ev));
  });
  cv.addEventListener('pointermove', ev => hvMiniPtr('move', pos(ev)));
  cv.addEventListener('pointerup', ev => hvMiniPtr('up', pos(ev)));
  cv.addEventListener('pointercancel', () => hvMiniPtr('up', { x: -99, y: -99 }));
  return m;
}
function hvMiniPtr(kind, p) {
  if (!HVM || HVM.done) return;
  HVM.mod.ptr(HVM.g, kind, p, MGX.t);
}
function hvMiniPulse() {
  if (!HVM || HVM.done) return;
  if (HVM.mod.pulse) HVM.mod.pulse(HVM.g, MGX.t);
}
function hvMiniHint() {
  if (!HVM || HVM.done) return;
  if (HVM.mod.hintBtn) HVM.mod.hintBtn(HVM.g, MGX.t);
}
function hvMiniFoot() {
  const f = document.getElementById('hv-mini-foot');
  if (!f || !HVM) return;
  const mod = HVM.mod;
  /* Mẫu image_16: nút chính màu riêng cho từng ải, nút phụ nhỏ hơn */
  const A = 'padding:10px 26px;border:0;border-radius:12px;color:#04101f;font-weight:800;cursor:pointer;font-size:14px;box-shadow:0 3px 0 #0008';
  const B = 'padding:8px 16px;border:1px solid #475569;border-radius:12px;background:#161f3a;color:#cbd5e1;cursor:pointer;font-size:12px';
  const live = !HVM.g.dead;
  f.innerHTML =
    (mod.btn && live ? '<button onclick="hvMiniPulse()" style="' + A + ';background:' + (mod.btnBg || 'linear-gradient(160deg,#38bdf8,#1d4ed8)') + '">' + mod.btn + '</button>' : '') +
    '<button onclick="hvMiniReplay()" style="' + B + '">' + (mod.again || '🔄 CHẠY LẠI') + '</button>' +
    (mod.btn2 && live ? '<button onclick="hvMiniHint()" style="' + B + '">' + mod.btn2 + '</button>' : '') +
    '<button onclick="hvMiniClose()" style="' + B + '">✖ THOÁT</button>';
}
function hvMiniDone() { return HV_PCS.filter(p => !!S.missionsDone[p.id]).length; }

function hvMiniEnter(i) {
  const pc = HV_PCS[i];
  if (!pc || hvmCut()) return;
  const mod = HVM_FOR[pc.id] || HVM_MODS[pc.kind] || HVM_G1;
  hvMiniLayout();
  HVM = { pc: pc, mod: mod, g: {}, done: false, stars: 0, t: MGX.t, _hint: null, _dead: false };
  mod.init(HVM.g, MGX.t, pc);
  document.getElementById('hv-mini-hd').innerHTML =
    '<b style="font-size:16px;color:#fde047;text-shadow:0 2px 0 #000,0 0 10px #000">ẢI ' + (i + 1) + ': ' + pc.name + '</b>' +
    '<span style="display:flex;gap:8px;align-items:center;font-size:12px;color:#9fc7ea">☁️ Khu 4: ' + hvMiniDone() + '/' + HV_PCS.length +
    '<button onclick="hvMiniClose()" style="background:#0f2742;color:#fff;border:1px solid #3b6f9f;border-radius:8px;padding:2px 10px;cursor:pointer">✖</button></span>';
  hvMiniFoot();
  hvmSfx('pop');
  hvmBeep(660, 'triangle', .1, .04);
}
function hvMiniReplay() {
  if (!HVM) return;
  HVM.done = false; HVM.stars = 0; HVM._hint = null; HVM._dead = false;
  HVM.g = {};
  const el = document.getElementById('hv-mini-hint');
  if (el) el.style.color = '#bae6fd';
  HVM.mod.init(HVM.g, MGX.t, HVM.pc);
  hvMiniFoot();
  hvmBeep(520, 'triangle', .1, .04);
}
function hvMiniClose() {
  const m = document.getElementById('hv-mini');
  if (m) m.style.display = 'none';
  HVM = null;
}
function hvMiniWin() {
  const pc = HVM.pc, mod = HVM.mod;
  HVM.done = true;
  HVM.stars = mod.stars(HVM.g);
  const st = '⭐'.repeat(HVM.stars) + '☆'.repeat(3 - HVM.stars);
  const first = !S.missionsDone[pc.id];
  S.missionsDone[pc.id] = true;
  /* ải 2 cộng nốt phần thưởng vụn đã gom từng con bug */
  const xp = pc.xp * HVM.stars + (HVM.g.bonusXp || 0);
  const coin = pc.coin * HVM.stars + (HVM.g.bonusCoin || 0);
  addXP(xp); addCoin(coin);
  if (pc.skill && S.skills[pc.skill] !== undefined) S.skills[pc.skill] = Math.min(5, S.skills[pc.skill] + 1);
  hvmSfx('coin');                              // đúng yêu cầu: thắng = sfxPlay('coin')
  hvmChord([660, 880, 1100]);
  saveGame(); updateQuestHUD();
  const msg = '🎁 +' + xp + ' EXP | +' + coin.toLocaleString() + ' Coin' +
    (pc.skill ? ' | +' + pc.skill.toUpperCase() + ' Skill' : '') +
    (first ? '' : ' <span style="opacity:.7">(cày lại — đủ 100%)</span>');
  showToast('☁️ ' + pc.name + ' hoàn thành!');
  if (first && hvMiniDone() === HV_PCS.length) {
    showBanner('KHU 4 · THIÊN ĐÀNG IT', '☁️ SẠCH 3/3 TRẠM MÂY', 'Toàn bộ đám mây lập trình đã online — ' + S.title + '!', 'violet');
  }
  const nx = HV_PCS.filter(z => !S.missionsDone[z.id])[0];
  const el = document.getElementById('hv-mini-hint');
  if (el) {
    el.style.color = '#4ade80';
    el.innerHTML = '🎉 <b>CHƯƠNG TRÌNH CHẠY ĐÚNG!</b> ' + st + ' — ' + msg +
      ' · ☁️ Khu 4: ' + hvMiniDone() + '/' + HV_PCS.length +
      (nx ? ' · Trạm tiếp: ' + nx.icon + ' ' + nx.name : ' · <b>Cả 3 trạm mây đã sáng!</b>');
  }
  const f = document.getElementById('hv-mini-foot');
  if (f) f.innerHTML =
    '<button onclick="hvMiniClose()" style="padding:9px 30px;border:0;border-radius:12px;background:#22c55e;color:#04120a;font-weight:800;cursor:pointer;font-size:14px">✔ XONG TRẠM</button>' +
    '<button onclick="hvMiniReplay()" style="padding:9px 18px;border:1px solid #475569;border-radius:12px;background:#161f3a;color:#cbd5e1;cursor:pointer">' + (HVM.mod.again || '🔄 CHẠY LẠI') + '</button>';
}
function hvMiniDead() {
  HVM._dead = true;
  const f = document.getElementById('hv-mini-foot');
  if (f) f.innerHTML =
    '<button onclick="hvMiniReplay()" style="padding:9px 26px;border:0;border-radius:12px;background:#f97316;color:#160603;font-weight:800;cursor:pointer;font-size:14px">' + (HVM.mod.again || '🔄 CHẠY LẠI') + '</button>' +
    '<button onclick="hvMiniClose()" style="padding:9px 18px;border:1px solid #475569;border-radius:12px;background:#161f3a;color:#cbd5e1;cursor:pointer">✖ THOÁT</button>';
}
/* Mỗi khung hình khi modal mở (mgFrame bên dưới gọi) */
function hvMiniFrame(cv, t) {
  if (!HVM) return;
  const dt = Math.min(0.05, Math.max(0, t - (HVM.t || t)));
  HVM.t = t;
  const g = mgFit(cv, HVM_W, HVM_H);
  if (!HVM.done) {
    HVM.mod.tick(HVM.g, t, dt);
    const hint = HVM.mod.hint ? HVM.mod.hint(HVM.g, t) : '';
    if (hint !== HVM._hint) {
      HVM._hint = hint;
      const el = document.getElementById('hv-mini-hint');
      if (el) el.innerHTML = hint;
    }
    if (HVM.g.win) hvMiniWin();
    else if (HVM.g.dead && !HVM._dead) hvMiniDead();
  }
  HVM.mod.draw(g, HVM.g, t, HVM);
}

/* ============================================================
   9. MÓC NỐI (wrapper — không sửa hàm cũ)
   ============================================================ */
/* Thỏ ẩn sau modal hv-mini giống các minigame khác */
try { if (typeof BUN_MINI_MODALS !== 'undefined') BUN_MINI_MODALS.push('hv-mini'); } catch (e) {}

const _hvmOldFrame = mgFrame;
mgFrame = function () {
  _hvmOldFrame();                       // đã cập nhật MGX.t và vẽ các modal khác
  if (HVM && hvmVisible()) {
    const cv = document.getElementById('hv-mini-cv');
    if (cv) hvMiniFrame(cv, MGX.t);
  }
};

const _hvmOldUpd = update;
update = function () {
  _hvmOldUpd.apply(this, arguments);
  if (HVM && !hvmVisible()) HVM = null;   // bấm ESC → closeAll() ẩn modal
};

const _hvmOldAct = doAction;
doAction = function () {
  if (HVM) { hvMiniPulse(); return; }     // [E]/Space = nút hành động trong game
  if (targetAct && targetAct.t === 'hv_pc' && !hvmCut()) { hvMiniEnter(targetAct.i); return; }
  _hvmOldAct();
};
