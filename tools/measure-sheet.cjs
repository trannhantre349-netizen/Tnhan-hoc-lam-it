#!/usr/bin/env node
/* Đo bounding box các sprite trên một sheet nền trắng.
     node tools/measure-sheet.cjs assets/img/street_env_traffic.png
   Lặp lại đúng thuật toán của bake-sprites.cjs (flood từ 4 mép, ngưỡng >240),
   rồi nối nhãn các pixel còn lại -> bbox + diện tích, ghi ảnh cắt vào tmp/. */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const jpeg = require('jpeg-js');

const THR = 240;
const file = process.argv[2];
if (!file) { console.error('dùng: node tools/measure-sheet.cjs <anh> [areaMin]'); process.exit(1); }
const areaMin = +(process.argv[3] || 1500);

function readRGBA(f) {
  const buf = fs.readFileSync(f);
  if (buf.readUInt32BE(0) === 0x89504e47) { const p = PNG.sync.read(buf); return { w: p.width, h: p.height, d: p.data }; }
  if (buf[0] === 0xff && buf[1] === 0xd8) { const j = jpeg.decode(buf, { useTArray: true, toRGBA32: true }); return { w: j.width, h: j.height, d: Buffer.from(j.data) }; }
  throw new Error('định dạng lạ: ' + f);
}

const im = readRGBA(path.join(process.cwd(), file));
const W = im.w, H = im.h, N = W * H, d = im.d;
console.log(`${file}  ${W}x${H}`);

const white = i => d[i * 4] > THR && d[i * 4 + 1] > THR && d[i * 4 + 2] > THR;
// 1) flood nền từ mép
const bg = new Uint8Array(N), q = new Int32Array(N);
let head = 0, tail = 0;
const seed = i => { if (!bg[i] && white(i)) { bg[i] = 1; q[tail++] = i; } };
for (let x = 0; x < W; x++) { seed(x); seed((H - 1) * W + x); }
for (let y = 0; y < H; y++) { seed(y * W); seed(y * W + W - 1); }
while (head < tail) { const i = q[head++], x = i % W; if (x > 0) seed(i - 1); if (x < W - 1) seed(i + 1); if (i >= W) seed(i - W); if (i < N - W) seed(i + W); }
console.log('nền flood = ' + tail + 'px (' + (100 * tail / N).toFixed(1) + '%)');

// 2) nối nhãn phần còn lại
const lab = new Int32Array(N).fill(-1);
const comps = [];
const stack = new Int32Array(N);
for (let i = 0; i < N; i++) {
  if (bg[i] || lab[i] >= 0) continue;
  const id = comps.length;
  let sp = 0; stack[sp++] = i; lab[i] = id;
  let n = 0, x0 = W, y0 = H, x1 = -1, y1 = -1, sw = 0, sr = 0, sg = 0, sb = 0, opaque = 0;
  while (sp) {
    const p = stack[--sp], x = p % W, y = (p - x) / W;
    n++; sw += d[p * 4]; sr += d[p * 4 + 1]; sg += d[p * 4 + 2]; sb += d[p * 4 + 3];
    if (d[p * 4 + 3] > 200) opaque++;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    if (x > 0 && !bg[p - 1] && lab[p - 1] < 0) { lab[p - 1] = id; stack[sp++] = p - 1; }
    if (x < W - 1 && !bg[p + 1] && lab[p + 1] < 0) { lab[p + 1] = id; stack[sp++] = p + 1; }
    if (p >= W && !bg[p - W] && lab[p - W] < 0) { lab[p - W] = id; stack[sp++] = p - W; }
    if (p < N - W && !bg[p + W] && lab[p + W] < 0) { lab[p + W] = id; stack[sp++] = p + W; }
  }
  comps.push({ id, n, x0, y0, x1, y1, a: [sr / n | 0, sg / n | 0, sb / n | 0, sw / n | 0], opaque });
}
const keep = comps.filter(c => c.n >= areaMin).sort((a, b) => (a.y0 - b.y0) || (a.x0 - b.x0));
console.log(`linh kiện ${comps.length}, giữ ${keep.length} (>= ${areaMin}px)\n`);
for (const c of keep) {
  const fill = (100 * c.n / ((c.x1 - c.x0 + 1) * (c.y1 - c.y0 + 1))).toFixed(0);
  console.log(`#${String(c.id).padStart(3)} bbox x=${c.x0} y=${c.y0} w=${c.x1 - c.x0 + 1} h=${c.y1 - c.y0 + 1}  px=${c.n} lấp=${fill}%  TBGR=${c.a}`);
}
const small = comps.filter(c => c.n < areaMin).sort((a, b) => b.n - a.n).slice(0, 12);
console.log('\nbỏ qua (nhỏ hơn ngưỡng, thường là chữ caption):');
for (const c of small) console.log(`  #${c.id} px=${c.n} bbox x=${c.x0} y=${c.y0} w=${c.x1 - c.x0 + 1} h=${c.y1 - c.y0 + 1}`);

// 3) ghi ảnh cắt để đọc bằng mắt
const OUT = path.join(process.cwd(), 'tmp', 'crops');
fs.mkdirSync(OUT, { recursive: true });
for (const c of keep) {
  const w = c.x1 - c.x0 + 1, h = c.y1 - c.y0 + 1, p = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const gi = (c.y0 + y) * W + c.x0 + x, oi = (y * w + x) * 4;
    if (bg[gi]) { p.data[oi + 3] = 0; continue; }
    p.data[oi] = d[gi * 4]; p.data[oi + 1] = d[gi * 4 + 1]; p.data[oi + 2] = d[gi * 4 + 2]; p.data[oi + 3] = d[gi * 4 + 3];
  }
  fs.writeFileSync(path.join(OUT, `c${String(c.id).padStart(3, '0')}_x${c.x0}_y${c.y0}.png`), PNG.sync.write(p));
}
console.log(`\nđã ghi ${keep.length} ảnh cắt vào tmp/crops/`);
