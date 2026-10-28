#!/usr/bin/env node
/* ============================================================
   tools/bake-bunnies.cjs — "Nướng" sheet thỏ từ assets/bunny.png

   Ảnh nguồn do artist xuất là JPEG đổi tên .png (1024x633, không có kênh
   alpha), 29 chú thỏ trên nền xám phẳng rgb(224,226,226). Game không thể
   khử nền lúc chạy (Chrome mở file:/// chặn đọc pixel ảnh cùng đĩa), nên
   làm ngoại tuyến y hệt pipeline baked/ của bake-sprites.cjs — nhưng KHÔNG
   dùng chung hàm tẩy nền đó: bản kia lấy màu nền từ 4 góc ảnh và dung sai
   Δ=26, ăn luôn thân thỏ màu kem/trắng. Ở đây lấy trung vị cả viền ảnh và
   khoá chặt Δ≤10.

   Chống "viền xám lởm chởm" (điều user yêu cầu rõ):
   1. flood-fill từ mép với Δ≤10  -> nền thật sự biến mất, không halo.
   2. vòng 1: pixel còn sống DÍNH vào vùng bị xoá mà vẫn gần nền (Δ≤SOFT)
      -> alpha = 255*Δ/SOFT. Đây đúng bản chất pixel phủ một phần, nên mép
      chuyển mượt thay vì cắt răng cưa cứng.
   3. vòng 2: pixel sống dính vùng Δ≤110 mà gần nền (Δ≤46) -> alpha nửa.
      Bắt tiếp dải anti-alias loang ra ngoài của JPEG.
   4. Nhị phân alpha rồi làm mềm 1px bằng box blur 3x3: mọi alpha trung gian
      chỉ tồn tại ở đúng 1 viền pixel, không còn hạt rác lấm tấm trong thân.

   KHÔNG có bước "pocket" như bake-sprites.cjs: thử đục mọi mảng xám bị
   tai/chân khoanh kín thì bụng thỏ màu kem (224±10) bị thủng lỗ chỗ thành
   nền trong suốt. Nền xám của ảnh này vốn thông ra mép ở mọi khe tai/chân
   nên flood-fill thuần là đủ sạch.

   Sau đó: tìm thành phần liên thông của thỏ, xếp theo thứ tự đọc (trái->phải,
   trên->xuống), cắt bbox +3px, đóng gói vào lưới 8 cột ô BUN_CELL=152 cao,
   NEO ĐẾY đúng đáy ô (chân thỏ tại đáy ô) -> game chỉ cần 1 chỉ số ô.
   In ra bảng "chỉ số ô -> toạ độ gốc" để js/bunnies.js chọn tư thế theo màu.

   Chạy:  node tools/bake-bunnies.cjs
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const jpeg = require('jpeg-js');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'assets', 'bunny.png');
const OUT = path.join(ROOT, 'assets', 'img', 'baked', 'bunny_sheet.png');

const KEY_TOL = 10;    // nền phẳng: Δ kênh tối đa để bị coi là nền
const SOFT = 110;      // dải anti-alias: từ nền tới đâu thì alpha bán phần
const SOFT2 = 46;      // vòng 2 chỉ nới tới mức này
const BUN_CELL = 152;  // ô sheet (rộng = cao)
const BUN_COLS = 8;

/* ---------- nạp JPEG/PNG -> RGBA ---------- */
function readRGBA(file) {
  const buf = fs.readFileSync(file);
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    const j = jpeg.decode(buf, { useTArray: true, toRGBA32: true });
    return { w: j.width, h: j.height, d: Buffer.from(j.data) };
  }
  const p = PNG.sync.read(buf);
  return { w: p.width, h: p.height, d: p.data };
}

const im = readRGBA(SRC);
const W = im.w, H = im.h, N = W * H, d = im.d;

/* Màu nền = trung vị DÀY của mọi pixel viền ảnh (4 góc của bake-sprites dễ
   trúng phải thân thỏ nếu artist đặt sát mép). */
function borderBg() {
  const px = [];
  const push = (x, y) => { const i = (y * W + x) * 4; px.push([d[i], d[i + 1], d[i + 2]]); };
  for (let x = 0; x < W; x++) for (let k = 0; k < 6; k++) push(x, Math.min(H - 1, Math.floor(k * (H - 1) / 5)));
  for (let y = 0; y < H; y++) for (let k = 0; k < 6; k++) push(Math.min(W - 1, Math.floor(k * (W - 1) / 5)), y);
  return [0, 1, 2].map(c => px.map(p => p[c]).sort((a, b) => a - b)[px.length >> 1]);
}
const BG = borderBg();
const dist = i => Math.max(
  Math.abs(d[i * 4] - BG[0]), Math.abs(d[i * 4 + 1] - BG[1]), Math.abs(d[i * 4 + 2] - BG[2]));
const isBg = (i, tol) => dist(i) <= tol;

/* ---------- 1. flood-fill nền từ mép ---------- */
const kill = new Uint8Array(N), q = new Int32Array(N);
let head = 0, tail = 0;
const seed = i => { if (!kill[i] && isBg(i, KEY_TOL)) { kill[i] = 1; q[tail++] = i; } };
for (let x = 0; x < W; x++) { seed(x); seed((H - 1) * W + x); }
for (let y = 0; y < H; y++) { seed(y * W); seed(y * W + W - 1); }
while (head < tail) {
  const i = q[head++], x = i % W;
  if (x > 0) seed(i - 1);
  if (x < W - 1) seed(i + 1);
  if (i >= W) seed(i - W);
  if (i < N - W) seed(i + W);
}
const flooded = tail;
function y_(i) { return (i - i % W) / W; }

/* ---------- 2 + 3. làm mềm viền anti-alias ---------- */
let soft1 = 0, soft2 = 0;
const alpha = new Uint8Array(N);
for (let i = 0; i < N; i++) alpha[i] = kill[i] ? 0 : 255;
const nb4 = i => {
  const x = i % W, r = [];
  if (x > 0) r.push(i - 1);
  if (x < W - 1) r.push(i + 1);
  if (i >= W) r.push(i - W);
  if (i < N - W) r.push(i + W);
  return r;
};
/* vòng 1: dính nền bị xoá */
for (let i = 0; i < N; i++) {
  if (alpha[i] === 0) continue;
  if (!nb4(i).some(j => alpha[j] === 0)) continue;
  const t = dist(i);
  if (t <= SOFT) { alpha[i] = Math.max(28, Math.min(255, Math.round(255 * t / SOFT))); soft1++; }
}
/* vòng 2: dính vùng đã mềm hoá mà vẫn còn gần nền */
for (let i = 0; i < N; i++) {
  if (alpha[i] !== 255) continue;
  if (!nb4(i).some(j => alpha[j] < 255)) continue;
  const t = dist(i);
  if (t <= SOFT2) { alpha[i] = Math.round(255 * t / SOFT2 / 2) + 60; soft2++; }
}

/* ---------- 4. nhị phân rồi blur 1px -> chỉ còn 1 viền alpha trung gian ---------- */
const bin = new Uint8Array(N);
for (let i = 0; i < N; i++) bin[i] = alpha[i] >= 128 ? 255 : 0;
for (let i = 0; i < N; i++) {
  if (bin[i] === 0) { alpha[i] = 0; continue; }
  let sum = 0; const nb = nb4(i);
  for (const j of nb) sum += bin[j];
  alpha[i] = Math.round(255 * (0.4 + 0.6 * sum / (nb.length * 255)));
}
for (let i = 0; i < N; i++) d[i * 4 + 3] = alpha[i];

/* ---------- thành phần liên thông của thỏ ---------- */
const live = i => alpha[i] > 24;
const buns = [];
{
  const vis = new Uint8Array(N), comp = new Int32Array(N);
  for (let s = 0; s < N; s++) {
    if (vis[s] || !live(s)) continue;
    let n = 0, x0 = W, x1 = -1, y0 = H, y1 = -1;
    vis[s] = 1; comp[n++] = s;
    for (let h = 0; h < n; h++) {
      const i = comp[h], x = i % W, y = y_(i);
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (const j of nb4(i)) { if (vis[j] || !live(j)) continue; vis[j] = 1; comp[n++] = j; }
    }
    if (n >= 400) buns.push({ x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, area: n });
  }
}
/* thứ tự đọc: chia dải theo hàng (tâm y) rồi trái -> phải.
   Index ô sheet = đúng thứ tự này, js/bunnies.js chọn tư thế theo bảng in ra. */
buns.sort((a, b) => (Math.round(a.y / 90) - Math.round(b.y / 90)) || (a.x - b.x));

const rows = Math.ceil(buns.length / BUN_COLS);
const SW = BUN_COLS * BUN_CELL, SH = rows * BUN_CELL;
const sheet = Buffer.alloc(SW * SH * 4);
const put = (sx, sy, sw, sh, dx, dy) => {
  for (let y = 0; y < sh; y++) {
    const srow = ((sy + y) * W + sx) * 4, drow = ((dy + y) * SW + dx) * 4;
    d.copy(sheet, drow, srow, srow + sw * 4);
  }
};
buns.forEach((b, i) => {
  const m = 3;                                  // nới 3px cho viền mềm khỏi bị cắt
  const sx = Math.max(0, b.x - m), sy = Math.max(0, b.y - m);
  const ex = Math.min(W - 1, b.x + b.w - 1 + m), ey = Math.min(H - 1, b.y + b.h - 1 + m);
  const cw = ex - sx + 1, ch = ey - sy + 1;
  const col = i % BUN_COLS, row = (i - col) / BUN_COLS;
  /* NEO ĐẾY: đáy thỏ nằm đúng đáy ô để game đặt chân tại dy + dh, không cần
     hiệu chỉnh riêng cho từng frame (các tư thế cao thấp khác nhau). */
  put(sx, sy, cw, ch, col * BUN_CELL + Math.round((BUN_CELL - cw) / 2), row * BUN_CELL + (BUN_CELL - ch));
});
fs.mkdirSync(path.dirname(OUT), { recursive: true });
const p = new PNG({ width: SW, height: SH });
p.data = sheet;
fs.writeFileSync(OUT, PNG.sync.write(p));

/* ---------- báo cáo ---------- */
const maxH = Math.max(...buns.map(b => b.h)), maxW = Math.max(...buns.map(b => b.w));
console.log(`nguồn ${path.basename(SRC)} ${W}xH=${H}  nền=${JSON.stringify(BG)}`);
console.log(`nền trong-suất=${flooded}px  viền mềm=${soft1}+${soft2}px  ` +
  `thỏ=${buns.length}  ô lớn nhất=${maxW}x${maxH} (cell ${BUN_CELL})`);
console.log(`sheet ${SW}x${SH}  ->  ${path.relative(ROOT, OUT).replace(/\\/g, '/')}`);
console.log(`\nBUN_N=${buns.length}  BUN_COLS=${BUN_COLS}  BUN_CELL=${BUN_CELL}`);
console.log('\nchỉ số ô | hàng,cột | nguồn x,y  w x h  | mô tả tư thế (xem assets/bunny.png)');
buns.forEach((b, i) => {
  const col = i % BUN_COLS, row = (i - col) / BUN_COLS;
  console.log(`  ${String(i).padStart(2)}    | ${row},${col}    | ${String(b.x).padStart(4)},${String(b.y).padStart(3)}  ${String(b.w).padStart(3)}x${String(b.h).padStart(3)}`);
});
