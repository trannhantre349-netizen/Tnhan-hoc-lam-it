#!/usr/bin/env node
/* ============================================================
   tools/bake-monks.cjs — "Nướng" bộ sprite Sư Thầy Khu 5

   Nguồn (cả hai là JPEG đổi tên .png, magic FFD8, nền TRẮNG TINH 253-255,
   nét viền đen đậm, KHÔNG có bóng đổ rời -> chỉ cần tẩy nền là sạch):
     assets/img/monk_sheet.png  1024x765  lưới 7 cột x 3 hàng (21 tư thế)
         hàng 1: đứng chắp tay / lần hạt (niệm)      hàng 2: đi kinh hành
         hàng 3: ngồi thiền bán già                  (cột 6-7 hàng 2 cũng ngồi)
     assets/img/abbot_monk.png  1024x1024 Sư Trụ Trì chắp tay, 1 figure.

   Thuật toán:
     1. "trắng" = min(r,g,b) >= WHITE_MIN và tổng lệch khỏi 255 <= WHITE_SUM.
     2. LAN TỪ BIÊN (flood fill): chỉ nền thật thông ra biên. Bên trong hình
        không có vùng trắng kín nào lớn (mắt trắng, cổ áo) nên không sợ xoá oan.
     3. Viền JPEG: 2 vòng pixel sát nền mà vẫn sáng thì alpha = độ tối, tức
        vòng càng trắng càng trong -> hết quầng trắng răng cưa trên nền tối.
     4. monk_sheet XẾP LẠI thành lưới ô đều 7x3 (128x252, đáy ô = đường chân)
        vì các ô nguồn không đều nhau; abbot_monk cắt sát bbox + lề 1px.

   Đầu ra: assets/img/baked/monk_sheet.png, assets/img/baked/abbot_monk.png
   In ra bảng hình học từng ô (bbox + dòng "chân") để chép vào inpeace.js.

   Chạy:  node tools/bake-monks.cjs
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const jpeg = require('jpeg-js');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets', 'img', 'baked');

const WHITE_MIN = 205;
const WHITE_SUM = 140;
const SOFT = 2;                       // số vòng pixel làm mềm mép
const SOFT_K = 255 / 60;              // min-channel 195 -> alpha đầy đủ

function readRGBA(file) {
  const buf = fs.readFileSync(file);
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    const j = jpeg.decode(buf, { useTArray: true, toRGBA32: true });
    return { w: j.width, h: j.height, d: Buffer.from(j.data) };
  }
  const p = PNG.sync.read(buf);
  return { w: p.width, h: p.height, d: p.data };
}

/* Tẩy nền -> trả về {w,h,d RGBA} + bbox phần còn lại. */
function bake(src) {
  const W = src.w, H = src.h, d = src.d, N = W * H;
  const isWhite = i => {
    const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
    return Math.min(r, g, b) >= WHITE_MIN &&
           (255 - r) + (255 - g) + (255 - b) <= WHITE_SUM;
  };

  const bg = new Uint8Array(N), q = new Int32Array(N);
  let head = 0, tail = 0;
  const push = i => { if (!bg[i]) { bg[i] = 1; q[tail++] = i; } };
  for (let x = 0; x < W; x++) { if (isWhite(x)) push(x); if (isWhite((H - 1) * W + x)) push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { if (isWhite(y * W)) push(y * W); if (isWhite(y * W + W - 1)) push(y * W + W - 1); }
  while (head !== tail) {
    const i = q[head++], x = i % W, y = (i - x) / W;
    if (x > 0 && !bg[i - 1] && isWhite(i - 1)) push(i - 1);
    if (x < W - 1 && !bg[i + 1] && isWhite(i + 1)) push(i + 1);
    if (y > 0 && !bg[i - W] && isWhite(i - W)) push(i - W);
    if (y < H - 1 && !bg[i + W] && isWhite(i + W)) push(i + W);
  }

  const keep = new Uint8Array(N);
  for (let i = 0; i < N; i++) keep[i] = bg[i] ? 0 : 1;
  const dist = new Uint8Array(N);
  for (let r = 1; r <= SOFT; r++) {
    for (let i = 0; i < N; i++) {
      if (!keep[i] || dist[i]) continue;
      const x = i % W, y = (i - x) / W;
      if ((x > 0 && !keep[i - 1]) || (x < W - 1 && !keep[i + 1]) ||
          (y > 0 && !keep[i - W]) || (y < H - 1 && !keep[i + W])) dist[i] = r;
    }
  }

  const out = Buffer.alloc(N * 4);
  let minX = W, minY = H, maxX = -1, maxY = -1, kept = 0;
  for (let i = 0; i < N; i++) {
    const o = i * 4;
    if (!keep[i]) { out[o + 3] = 0; continue; }
    const mn = Math.min(d[o], d[o + 1], d[o + 2]);
    let a = 255;
    if (dist[i]) a = Math.max(0, Math.min(255, Math.round((255 - mn) * SOFT_K)));
    out[o] = d[o]; out[o + 1] = d[o + 1]; out[o + 2] = d[o + 2]; out[o + 3] = a;
    if (a > 24) {
      kept++;
      const x = i % W, y = (i - x) / W;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  return { W, H, out, minX, minY, maxX, maxY, kept, keep };
}

function writePNG(file, w, h, data) {
  const png = new PNG({ width: w, height: h });
  png.data = data;
  fs.writeFileSync(file, PNG.sync.write(png, { deflateLevel: 9 }));
}

function cropTo(b, pad) {
  const { W, H, out } = b;
  const x0 = Math.max(0, b.minX - pad), y0 = Math.max(0, b.minY - pad);
  const x1 = Math.min(W - 1, b.maxX + pad), y1 = Math.min(H - 1, b.maxY + pad);
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
  const c = Buffer.alloc(cw * ch * 4);
  for (let y = 0; y < ch; y++)
    for (let x = 0; x < cw; x++) {
      const s = ((y0 + y) * W + (x0 + x)) * 4, t = (y * cw + x) * 4;
      c[t] = out[s]; c[t + 1] = out[s + 1]; c[t + 2] = out[s + 2]; c[t + 3] = out[s + 3];
    }
  return { w: cw, h: ch, d: c, ox: x0, oy: y0 };
}

fs.mkdirSync(OUT_DIR, { recursive: true });

/* ---------- 1. monk_sheet: tẩy nền rồi XẾP LẠI thành lưới ô ĐỀU ---------- */
/* Ảnh nguồn 7 cột x 3 hàng nhưng các ô KHÔNG đều nhau (bề rộng 92..124, chiều
   cao 203..248) và figure lệch trái/phải trong ô. Vẽ thẳng từ lưới lệch thì mỗi
   lần đổi tư thế sư thầy nhảy kích thước, nghiêng người lệch trục. Nên bake xếp
   lại: mọi ô 128x252, figure CĂN GIỮA theo ngang và CĂN Đáy theo dọc (đáy =
   ĐƯỜNG CHÂN, dòng FOOT=250) → inpeace.js chỉ cần một công thức cho 21 tư thế,
   đúng cách tools/bake-female-sprites.cjs làm với sheet nhân vật. */
const SRC_SHEET = path.join(ROOT, 'assets', 'img', 'monk_sheet.png');
const s = bake(readRGBA(SRC_SHEET));

const COLX = [0, 161, 306, 451, 596, 732, 873, 1024];
const ROWY = [0, 277, 532, 765];
const CW = 128, CH = 252, FOOT = CH - 2;
const sheet = Buffer.alloc(CW * 7 * CH * 3 * 4);
const cells = [];
for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 7; c++) {
    let mnx = 1e9, mxx = -1, mny = 1e9, mxy = -1;
    for (let y = ROWY[r]; y < ROWY[r + 1]; y++)
      for (let x = COLX[c]; x < COLX[c + 1]; x++) {
        if (!s.keep[y * s.W + x]) continue;
        if (x < mnx) mnx = x; if (x > mxx) mxx = x;
        if (y < mny) mny = y; if (y > mxy) mxy = y;
      }
    const cw = mxx - mnx + 1, chh = mxy - mny + 1;
    const ox = Math.round(CW * c + (CW - cw) / 2);          // căn giữa theo ngang
    const oy = CH * r + (FOOT - chh);                        // đáy ô = đường chân
    for (let y = 0; y < chh; y++)
      for (let x = 0; x < cw; x++) {
        const src = ((mny + y) * s.W + (mnx + x)) * 4;
        const dst = ((oy + y) * CW * 7 + (ox + x)) * 4;
        sheet[dst] = s.out[src]; sheet[dst + 1] = s.out[src + 1];
        sheet[dst + 2] = s.out[src + 2]; sheet[dst + 3] = s.out[src + 3];
      }
    cells.push({ r: r + 1, c: c + 1, w: cw, h: chh });
  }
}
writePNG(path.join(OUT_DIR, 'monk_sheet.png'), CW * 7, CH * 3, sheet);
console.log('monk_sheet.png  ' + (CW * 7) + 'x' + (CH * 3) + '  lưới 7x3 ô ' + CW + 'x' + CH +
            '  đường chân dòng FOOT=' + FOOT + ' (trong ô)');
for (let r = 0; r < 3; r++)
  console.log('  hàng ' + (r + 1) + ': ' + cells.slice(r * 7, r * 7 + 7)
    .map(o => o.w + 'x' + o.h).join('  '));
const STAND = Math.max.apply(null, cells.filter(o => o.r === 1).map(o => o.h));
console.log('=> chiều cao ĐỨNG chuẩn = ' + STAND + 'px ô (BODY). Ngồi thiền ~' +
  Math.max.apply(null, cells.filter(o => o.r === 3).map(o => o.h)) +
  'px → cùng tỉ lệ vẽ, tự thấp hơn đúng mức người ngồi.');

/* ---------- 2. abbot_monk: cắt sát bbox ---------- */
const SRC_ABBOT = path.join(ROOT, 'assets', 'img', 'abbot_monk.png');
const a = bake(readRGBA(SRC_ABBOT));
const ac = cropTo(a, 1);
writePNG(path.join(OUT_DIR, 'abbot_monk.png'), ac.w, ac.h, ac.d);
console.log('abbot_monk.png  ' + ac.w + 'x' + ac.h + '  (cắt từ ' + a.W + 'x' + a.H +
            ' tại x' + ac.ox + ' y' + ac.oy + ')  pixel giữ ' + a.kept);
/* chiều cao figure thật = cả ảnh; chân nằm sát đáy -> inpeace.js chỉ việc
   đặt đáy sprite đúng điểm chân. */
console.log('=> Trụ Trì: chân tại đáy ảnh (' + ac.h + 'px), thân cao ' + ac.h +
            ', ngang ' + ac.w + ' (tỉ lệ ngang/cao = ' + (ac.w / ac.h).toFixed(3) + ')');
