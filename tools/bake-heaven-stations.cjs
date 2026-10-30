#!/usr/bin/env node
/* ============================================================
   tools/bake-heaven-stations.cjs — "Nướng" sheet 3 trạm Khu 4

   Nguồn: assets/img/heaven_stations.png — JPEG đổi tên .png 1024x765,
   KHÔNG có kênh alpha, nền là trời đêm chuyển màu + mây bồng bềnh (không
   phải nền phẳng nên KHÔNG tẩy theo màu được: thân trạm màu xám navy và
   nền trời cũng navy, một mức Δ nào cũng hoặc để lại quầng trời hoặc ăn
   luôn màn hình code).

   Thuật toán: TẠCH THEO LIÊN THÔNG VÙNG có rào chắn viền (flood fill bị
   chặn bởi nét vẽ).  Ảnh này theo hoạt hình: mọi chi tiết của trạm đều có
   nét viền đậm bao kín, còn nền trời/mây thì mượt không có nét.
     1. ảnh gradient: pixel là "rào" nếu chênh kênh tối đa với 1 trong 4
        láng giềng >= EDGE_T. Giãn nở rào 1px để bịt kẽ hở do JPEG.
     2. xuất phát từ MỌI pixel không-rào nằm trên biên 1/3 ảnh (trái, phải,
        đỉnh, đáy CAP_Y) lan toả qua vùng không rào -> đó chính là nền.
        Nền bị xoá alpha kể cả khi nó "chui" vào khe giữa hai cánh hay dưới
        vầng sáng, vì những khe đó thông ra biên.
     3. phần còn lại = trạm. Nhị phân rồi làm mềm 2 vòng box blur 3x3 để mép
        không răng cưa cứng.
   Dòng chú thích "Ài 1: ..." ở đáy ảnh có nét viền đen khoanh kín chữ trắng
   nên flood-fill KHÔNG tự ăn được -> cắt hẳn bằng CAP_Y trước khi dò.

   Đầu ra: assets/img/baked/heaven_stations.png 1023x706, 3 ô BẰNG NHAU
   341px (đúng quy ước "chia 3 phần đều nhau" của game).

   Chạy:  node tools/bake-heaven-stations.cjs
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const jpeg = require('jpeg-js');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'assets', 'img', 'heaven_stations.png');
const OUT = path.join(ROOT, 'assets', 'img', 'baked', 'heaven_stations.png');

const CAP_Y = 706;   // cắt dải chữ chú thích "Ài 1/2/3: ..."
const CELL = 341;    // rộng 1/3 ảnh nguồn = rộng 1 ô sheet đầu ra
const EDGE_T = 30;   // ngưỡng gradient coi là nét viền

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
const W = src.w, H = Math.min(src.h, CAP_Y), d = src.d;
const N = W * H;
console.log('nguồn ' + src.w + 'x' + src.h + ' -> làm việc ' + W + 'x' + H);

/* ---------- 1. rào chắn = nét viền, giãn nở 1px ---------- */
const bar0 = new Uint8Array(N);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x, o = i * 4;
    const r = d[o], g = d[o + 1], b = d[o + 2];
    let m = 0;
    const nb = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
    for (let k = 0; k < 4; k++) {
      const nx = nb[k][0], ny = nb[k][1];
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const q = (ny * W + nx) * 4;
      m = Math.max(m, Math.abs(d[q] - r), Math.abs(d[q + 1] - g), Math.abs(d[q + 2] - b));
    }
    if (m >= EDGE_T) bar0[i] = 1;
  }
}
const bar = new Uint8Array(N);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (!bar0[y * W + x]) continue;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nx = x + dx, ny = y + dy;
    if (nx >= 0 && ny >= 0 && nx < W && ny < H) bar[ny * W + nx] = 1;
  }
}

/* ---------- 2. flood-fill nền từ biên từng 1/3 ---------- */
const bg = new Uint8Array(N);
const stack = new Int32Array(N);
for (let c = 0; c < 3; c++) {
  const x0 = c * CELL, x1 = Math.min(W, x0 + CELL);
  let sp = 0;
  const push = (i) => { if (!bg[i] && !bar[i]) { bg[i] = 1; stack[sp++] = i; } };
  for (let x = x0; x < x1; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W + x0); push(y * W + x1 - 1); }
  while (sp) {
    const i = stack[--sp], x = i % W, y = (i / W) | 0;
    if (x + 1 < x1) push(i + 1);
    if (x - 1 >= x0) push(i - 1);
    if (y > 0) push(i - W);
    if (y + 1 < H) push(i + W);
  }
}

/* ---------- 3. bỏ rác vụn (sao/tia sáng lẻ) rồi làm mềm mép ---------- */
const alive = new Uint8Array(N);
for (let i = 0; i < N; i++) alive[i] = bg[i] ? 0 : 1;
/* gán nhãn thành phần liên thông 8 hướng, xoá cụm nhỏ hơn MIN_AREA */
const MIN_AREA = 26;
const label = new Int32Array(N).fill(0);
const areas = [0];
let nxt = 1;
const st = new Int32Array(N);
for (let s = 0; s < N; s++) {
  if (!alive[s] || label[s]) continue;
  let sp = 0, id = nxt++, area = 0;
  label[s] = id; st[sp++] = s;
  while (sp) {
    const i = st[--sp], x = i % W, y = (i / W) | 0; area++;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx;
      if (alive[j] && !label[j]) { label[j] = id; st[sp++] = j; }
    }
  }
  areas[id] = area;
}
for (let i = 0; i < N; i++) if (alive[i] && areas[label[i]] < MIN_AREA) alive[i] = 0;

let a = new Float64Array(N);
for (let i = 0; i < N; i++) a[i] = alive[i] ? 255 : 0;

function blur3(p) {
  const t = new Float64Array(N);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0, n = 0;
    for (let dx = -1; dx <= 1; dx++) { const nx = x + dx; if (nx < 0 || nx >= W) continue; s += p[y * W + nx]; n++; }
    t[y * W + x] = s / n;
  }
  const o = new Float64Array(N);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0, n = 0;
    for (let dy = -1; dy <= 1; dy++) { const ny = y + dy; if (ny < 0 || ny >= H) continue; s += t[ny * W + x]; n++; }
    o[y * W + x] = s / n;
  }
  return o;
}
a = blur3(a); a = blur3(a);
for (let i = 0; i < N; i++) {
  let v = (a[i] - 60) * (255 / 135);
  a[i] = v < 0 ? 0 : v > 255 ? 255 : v;
}

/* ---------- 4. đóng gói 3 ô bằng nhau ---------- */
const out = new PNG({ width: CELL * 3, height: H });
const rep = [];
for (let c = 0; c < 3; c++) {
  let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1, keep = 0;
  for (let y = 0; y < H; y++) for (let x = c * CELL; x < Math.min(W, (c + 1) * CELL); x++) {
    const i = y * W + x, o = (y * out.width + x) * 4;
    out.data[o] = d[i * 4]; out.data[o + 1] = d[i * 4 + 1]; out.data[o + 2] = d[i * 4 + 2];
    out.data[o + 3] = Math.round(a[i]);
    if (a[i] > 8) { keep++; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  /* "chan may": 22 hang cuoi cua bbox -> tam va be ngang cua day may */
  let fx = 0, fn = 0, fmin = 1e9, fmax = -1;
  for (let y = Math.max(0, maxY - 21); y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    if (a[y * W + x] > 200) { fx += x; fn++; if (x < fmin) fmin = x; if (x > fmax) fmax = x; }
  }
  rep.push('tram ' + (c + 1) + ': bbox x ' + minX + '..' + maxX + '  y ' + minY + '..' + maxY +
    '  (w ' + (maxX - minX + 1) + ' h ' + (maxY - minY + 1) + ')  giu ' + (keep * 100 / (CELL * H)).toFixed(1) + '%' +
    '  | chan may: tamlun x=' + (fn ? (fx / fn - minX).toFixed(0) : '?') + '/' + (maxX - minX + 1) +
    '  ngang ' + (fmax - fmin + 1) + 'px  day y=' + (maxY - minY + 1));
}
/* cột nằm ngoài 3*CELL (nguồn 1024 > 1023) bị bỏ: alpha = 0 */
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, PNG.sync.write(out));
console.log(rep.join('\n'));
console.log('xuat ' + OUT + ' ' + out.width + 'x' + out.height + ' ' + fs.statSync(OUT).size + ' bytes');
