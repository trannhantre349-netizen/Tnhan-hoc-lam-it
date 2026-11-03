#!/usr/bin/env node
/* ============================================================
   tools/bake-bench.cjs — "Nướng" chiếc ghế dài nhà thờ

   Nguồn: assets/img/church_bench.png — đúng ra là JPEG đổi tên .png
   (magic FFD8FFE0) 1024x572, ghế gỗ gothic trên NỀN TRẮNG TĨNH.
   JPEG không có kênh alpha → phải tự tạo alpha ở bước dựng.

   Thuật toán (nền phẳng nên đơn giản hơn heaven_stations):
     1. "trắng" = cả ba kênh đều >= WHITE_MIN và tổng lệch khỏi 255
        không quá WHITE_SUM. Ngưỡng rộng vì JPEG loang viền quanh nét gỗ.
     2. LAN TỪ BIÊN (flood fill) qua các pixel trắng. Chỉ nền thật mới
        thông ra biên, nên mọi vệt sáng trắng BÊN TRONG thân ghế (gờ gỗ
        phản quang, mép tiện) không bị xoá oan.
     3. Dải 2px sát nền: alpha giảm dần theo độ trắng -> hết quầng trắng
        răng cưa mà vẫn giữ nét gỗ.
     4. Cắt sát khung (bbox phần còn lại) + chừa 1px để drawImage không
        hớt mất viền.

   Đầu ra: assets/img/baked/church_bench.png (RGBA, nền trong suốt).
   In ra bbox + hàng "mặt ghế" để inpeace.js căn điểm ngồi.

   Chạy:  node tools/bake-bench.cjs
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const jpeg = require('jpeg-js');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'assets', 'img', 'church_bench.png');
const OUT = path.join(ROOT, 'assets', 'img', 'baked', 'church_bench.png');

const WHITE_MIN = 214;              // kênh sáng nhất còn bị coi là trắng
const WHITE_SUM = 96;               // tổng (255-r)+(255-g)+(255-b) tối đa
const SOFT = 2;                     // bề rộng dải làm mềm mép (px)

function readRGBA(file) {
  const buf = fs.readFileSync(file);
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    const j = jpeg.decode(buf, { useTArray: true, toRGBA32: true });
    return { w: j.width, h: j.height, d: Buffer.from(j.data) };
  }
  const p = PNG.sync.read(buf);
  return { w: p.width, h: p.height, d: p.data };
}

const src = readRGBA(SRC);
const W = src.w, H = src.h, d = src.d, N = W * H;
console.log('nguồn ' + W + 'x' + H);

const isWhite = i => {
  const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
  return (255 - r) + (255 - g) + (255 - b) <= WHITE_SUM &&
         Math.min(r, g, b) >= WHITE_MIN;
};

/* ---------- 1+2. flood nền từ biên ---------- */
const bg = new Uint8Array(N);
const q = new Int32Array(N);
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

/* ---------- 3. alpha: 0 nền, 255 thân ghế, dải SOFT làm mềm ---------- */
const keep = new Uint8Array(N);            // pixel còn giữ lại
for (let i = 0; i < N; i++) keep[i] = bg[i] ? 0 : 1;
const dist = new Uint8Array(N);            // khoảng cách (xấp xỉ) tới nền
for (let r = 1; r <= SOFT; r++) {
  for (let i = 0; i < N; i++) {
    if (!keep[i] || dist[i]) continue;
    const x = i % W, y = (i - x) / W;
    let near = false;
    if (x > 0 && !keep[i - 1]) near = true;
    else if (x < W - 1 && !keep[i + 1]) near = true;
    else if (y > 0 && !keep[i - W]) near = true;
    else if (y < H - 1 && !keep[i + W]) near = true;
    if (near) dist[i] = r;
  }
}

let minX = W, minY = H, maxX = -1, maxY = -1, kept = 0;
const out = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  const o = i * 4;
  if (!keep[i]) { out[o + 3] = 0; continue; }
  const x = i % W, y = (i - x) / W;
  /* mép ngoài cùng của dải mềm mà vẫn trắng thì cho trong suốt một phần */
  let a = 255;
  if (dist[i] === 1 && isWhite(i)) a = 110;
  else if (dist[i] === 2 && isWhite(i)) a = 190;
  out[o] = d[o]; out[o + 1] = d[o + 1]; out[o + 2] = d[o + 2]; out[o + 3] = a;
  if (a > 24) {
    kept++;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
}

/* ---------- 4. cắt sát khung + 1px lề ---------- */
const pad = 1;
minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
maxX = Math.min(W - 1, maxX + pad); maxY = Math.min(H - 1, maxY + pad);
const OW = maxX - minX + 1, OH = maxY - minY + 1;
const crop = Buffer.alloc(OW * OH * 4);
for (let y = 0; y < OH; y++)
  for (let x = 0; x < OW; x++) {
    const s = ((minY + y) * W + (minX + x)) * 4, t = (y * OW + x) * 4;
    crop[t] = out[s]; crop[t + 1] = out[s + 1]; crop[t + 2] = out[s + 2]; crop[t + 3] = out[s + 3];
  }

const png = new PNG({ width: OW, height: OH });
png.data = crop;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, PNG.sync.write(png, { deflateLevel: 9 }));

/* ---------- báo cáo hình học cho inpeace.js ---------- */
const rowFill = [];
for (let g = 0; g < 10; g++) {
  const y0 = Math.floor(g * OH / 10), y1 = Math.floor((g + 1) * OH / 10);
  let n = 0, tot = 0;
  for (let y = y0; y < y1; y++) for (let x = 0; x < OW; x += 2) { tot++; if (crop[(y * OW + x) * 4 + 3] > 24) n++; }
  rowFill.push(Math.round(100 * n / tot) + '%');
}
console.log('đầu ra ' + OW + 'x' + OH + '  bbox nguồn x' + minX + '..' + maxX + ' y' + minY + '..' + maxY);
console.log('pixel giữ ' + kept + ' / ' + N);
console.log('độ đầy theo 10 dải hàng (trên->dưới): ' + rowFill.join(' '));
console.log('=> mặt ghế (ngồi) ~ ' + (0.495 * OH).toFixed(1) + 'px tính từ ĐỈNH sprite,' +
  ' chân ghế tại đáy. Chiều cao sprite gốc ' + OH + 'px.');
console.log('đã ghi ' + path.relative(ROOT, OUT));
