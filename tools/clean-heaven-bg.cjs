#!/usr/bin/env node
/* tools/clean-heaven-bg.cjs
   Xoá 3 trạm máy tính vẽ tay (pill chữ nổi + laptop xám + cánh vàng + vòng cáp)
   khỏi ảnh nền Khu 4 để js/heaven.js vẽ 3 trạm đẹp từ heaven_stations.png đè lên.

   Input : assets/img/heaven_bg.png   (JPEG đổi phần mở rộng, 1024x614, không alpha)
   Output: assets/img/baked/heaven_bg_clean.png (PNG thật, cùng 1024x614)
   Ảnh gốc KHÔNG bị sửa — chạy lại bao nhiêu lần cũng ra cùng một kết quả.

   Thuật toán:
     1) Trong các RECT, nhận pixel "thuộc trạm" theo màu: pill gần đen, thân
        laptop xám trung tính (mây thật lệch xanh: b - r ~ +40), cánh/cáp vàng.
     2) Giãn nở 7px -> lấp lỗ -> giãn 2px -> làm mềm biên (feather 9px).
     3) Nền vá: hạ tỷ lệ 1/6 rồi giải Laplace (4 láng giềng) cho tới khi hội tụ
        -> tái tạo đúng độ dốc sáng tối của đám mây quanh lỗ.
     4) Chuyển vân mây thật từ DONOR: lấy dải cao tần (nguyên bản - bản mờ 6px)
        của vùng mây sạch ghép vào nền vá, nên chỗ vá không bị "phẳng lì".

   Cách dùng: node tools/clean-heaven-bg.cjs [--mask]  (--mask: xuất tmp/_mask.png) */
const fs = require('fs');
const path = require('path');
const { PNG } = require(path.join(__dirname, 'node_modules', 'pngjs'));
const jpeg = require(path.join(__dirname, 'node_modules', 'jpeg-js'));

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'assets', 'img', 'heaven_bg.png');
const OUT = path.join(ROOT, 'assets', 'img', 'baked', 'heaven_bg_clean.png');

/* toạ độ tính theo ẢNH GỐC 1024x614 (canvas 960x600 = chia 1.0667) */
const RECTS = [
  // trạm 1 — SẮP XẾP THUẬT TOÁN
  { x0: 296, y0: 258, x1: 498, y1: 440 },
  // trạm 2 — BẮT BUG
  { x0: 588, y0: 384, x1: 700, y1: 540 },
  // trạm 3 — SẮP XẾP CODE NÂNG CAO (tách 2 khối để không ăn mất chú thỏ ngồi laptop)
  { x0: 770, y0: 256, x1: 996, y1: 326 },   // pill
  { x0: 806, y0: 322, x1: 1000, y1: 428 }   // laptop + bệ đá + cáp xanh
];
/* Vài mẩu cáp nằm ngoài các RECT trên vẫn còn, nhưng sprite trạm vẽ đè lên đúng
   vùng đó nên không lộ ra — kiểm chứng bằng khung hình thật, không mở rộng mask
   thêm vì mask rộng sẽ ăn vào mấy chú thỏ vẽ trang trí sát bên. */
const DONOR = { x0: 40, y0: 470, x1: 300, y1: 610 };   // vùng mây sạch để lấy vân

const buf = fs.readFileSync(SRC);
const isPng = buf.readUInt32BE(0) === 0x89504e47;
const im = isPng ? PNG.sync.read(buf)
  : (() => { const j = jpeg.decode(buf, { useTArray: true, toRGBA32: true }); return { width: j.width, height: j.height, data: Buffer.from(j.data) }; })();
const W = im.width, H = im.height, d = im.data, N = W * H;

const inRect = (x, y) => RECTS.some(r => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1);

/* ---------- 1) mask thô ---------- */
const raw = new Uint8Array(N);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = y * W + x;
  if (!inRect(x, y)) continue;
  const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
  const l = r * .299 + g * .587 + b * .114;
  const darkPill = l < 92;
  const greyBody = Math.abs(r - g) < 16 && (b - r) < 26 && l > 92 && l < 215;
  const yellow = r > 170 && g > 130 && b < r - 70;
  const cable = g > 175 && (g - r) > 55;                       // cáp xanh lá / cyan rực (mây chỉ g~129)
  if (darkPill || greyBody || yellow || cable) raw[i] = 1;
}

/* ---------- 2) giãn nở + lấp lỗ + feather ---------- */
function dilate(m, R) {
  const o = new Uint8Array(N);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!m[y * W + x]) continue;
    for (let dy = -R; dy <= R; dy++) {
      const ny = y + dy; if (ny < 0 || ny >= H) continue;
      const base = ny * W;
      for (let dx = -R; dx <= R; dx++) {
        const nx = x + dx; if (nx < 0 || nx >= W) continue;
        o[base + nx] = 1;
      }
    }
  }
  return o;
}
function fillHoles(m) {
  const out = m.slice(), q = new Int32Array(N);
  let head = 0, tail = 0;
  const seed = (x, y) => { const i = y * W + x; if (!out[i]) { out[i] = 2; q[tail++] = i; } };
  for (let x = 0; x < W; x++) { seed(x, 0); seed(x, H - 1); }
  for (let y = 0; y < H; y++) { seed(0, y); seed(W - 1, y); }
  while (head < tail) {
    const p = q[head++], px = p % W, py = (p / W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = px + dx, ny = py + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const np = ny * W + nx;
      if (out[np] === 0) { out[np] = 2; q[tail++] = np; }
    }
  }
  for (let i = 0; i < N; i++) out[i] = out[i] === 2 ? 0 : 1;
  return out;
}
let mask = fillHoles(dilate(raw, 7));
mask = dilate(mask, 2);

const FEATHER = 9;
let a = new Float32Array(N);
for (let i = 0; i < N; i++) a[i] = mask[i] ? 1 : 0;
for (let k = 0; k < FEATHER; k++) {
  const o = new Float32Array(N);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let s = 0, n = 0;
    for (let dy = -1; dy <= 1; dy++) {
      const ny = y + dy; if (ny < 0 || ny >= H) continue;
      const base = ny * W;
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx; if (nx < 0 || nx >= W) continue;
        s += a[base + nx]; n++;
      }
    }
    o[y * W + x] = s / n;
  }
  a = o;
}
const alpha = new Float32Array(N);
for (let i = 0; i < N; i++) alpha[i] = Math.min(1, Math.max(0, (a[i] - .18) / .64));

/* ---------- 3) Laplace inpaint trên lưới thô ---------- */
const S = 6, GW = Math.ceil(W / S), GH = Math.ceil(H / S), GN = GW * GH;
const cellMask = new Uint8Array(GN);
const cr = new Float32Array(GN * 3);
for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) {
  let n = 0, hit = 0, R = 0, G = 0, B = 0;
  for (let y = gy * S; y < Math.min(H, (gy + 1) * S); y++) for (let x = gx * S; x < Math.min(W, (gx + 1) * S); x++) {
    const i = y * W + x; n++;
    if (mask[i]) hit++;
    R += d[i * 4]; G += d[i * 4 + 1]; B += d[i * 4 + 2];
  }
  const gi = gy * GW + gx, c = gi * 3;
  cellMask[gi] = hit / n > .5 ? 1 : 0;
  cr[c] = R / n; cr[c + 1] = G / n; cr[c + 2] = B / n;
}
for (let gi = 0; gi < GN; gi++) {
  if (!cellMask[gi]) continue;
  const gx = gi % GW, gy = (gi / GW) | 0;
  let s = 0, n = 0;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = gx + dx, ny = gy + dy;
    if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
    const ni = ny * GW + nx; if (cellMask[ni]) continue;
    const c = ni * 3; s += cr[c] + cr[c + 1] + cr[c + 2]; n += 3;
  }
  const c = gi * 3; cr[c] = cr[c + 1] = cr[c + 2] = n ? s / n : 120;
}
for (let pass = 0; pass < 900; pass++) {
  for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) {
    const gi = gy * GW + gx; if (!cellMask[gi]) continue;
    let s0 = 0, s1 = 0, s2 = 0, n = 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = gx + dx, ny = gy + dy;
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      const c = (ny * GW + nx) * 3;
      s0 += cr[c]; s1 += cr[c + 1]; s2 += cr[c + 2]; n++;
    }
    const c = gi * 3;
    cr[c] += (s0 / n - cr[c]) * .5;
    cr[c + 1] += (s1 / n - cr[c + 1]) * .5;
    cr[c + 2] += (s2 / n - cr[c + 2]) * .5;
  }
}
function sampleGrid(gx, gy, k) {
  gx = Math.max(0, Math.min(GW - 1.001, gx)); gy = Math.max(0, Math.min(GH - 1.001, gy));
  const x0 = gx | 0, y0 = gy | 0, fx = gx - x0, fy = gy - y0;
  const i00 = (y0 * GW + x0) * 3 + k;
  return (cr[i00] * (1 - fx) + cr[i00 + 3] * fx) * (1 - fy)
       + (cr[i00 + GW * 3] * (1 - fx) + cr[i00 + GW * 3 + 3] * fx) * fy;
}

/* ---------- 4) vân mây thật: dải cao tần của DONOR ---------- */
const DW = DONOR.x1 - DONOR.x0 + 1, DH = DONOR.y1 - DONOR.y0 + 1;
function blurChannel(k, rad) {                                   // box blur 2 pass separable
  const src = new Float32Array(DW * DH);
  for (let y = 0; y < DH; y++) for (let x = 0; x < DW; x++) src[y * DW + x] = d[((DONOR.y0 + y) * W + DONOR.x0 + x) * 4 + k];
  const tmp = new Float32Array(DW * DH), dst = new Float32Array(DW * DH);
  for (let y = 0; y < DH; y++) for (let x = 0; x < DW; x++) {
    let s = 0, n = 0;
    for (let dx = -rad; dx <= rad; dx++) { const nx = x + dx; if (nx < 0 || nx >= DW) continue; s += src[y * DW + nx]; n++; }
    tmp[y * DW + x] = s / n;
  }
  for (let y = 0; y < DH; y++) for (let x = 0; x < DW; x++) {
    let s = 0, n = 0;
    for (let dy = -rad; dy <= rad; dy++) { const ny = y + dy; if (ny < 0 || ny >= DH) continue; s += tmp[ny * DW + x]; n++; }
    dst[y * DW + x] = s / n;
  }
  return dst;
}
const HP = [0, 1, 2].map(k => {
  const bl = blurChannel(k, 6), out = new Float32Array(DW * DH);
  for (let y = 0; y < DH; y++) for (let x = 0; x < DW; x++) {
    out[y * DW + x] = d[((DONOR.y0 + y) * W + DONOR.x0 + x) * 4 + k] - bl[y * DW + x];
  }
  return out;
});
const GAIN = .85;

/* ---------- 5) composite ---------- */
const out = new PNG({ width: W, height: H });
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = y * W + x, o = i * 4, av = alpha[i];
  const gx = (x + S / 2) / S - .5, gy = (y + S / 2) / S - .5;
  const tx = ((x - DONOR.x0) % DW + DW) % DW, ty = ((y - DONOR.y0) % DH + DH) % DH;
  const ti = ty * DW + tx;
  for (let k = 0; k < 3; k++) {
    const orig = d[i * 4 + k];
    if (av <= 0) { out.data[o + k] = orig; continue; }
    const fill = sampleGrid(gx, gy, k) + HP[k][ti] * GAIN;
    out.data[o + k] = Math.max(0, Math.min(255, Math.round(orig * (1 - av) + fill * av)));
  }
  out.data[o + 3] = 255;
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, PNG.sync.write(out));
let cnt = 0; for (let i = 0; i < N; i++) if (mask[i]) cnt++;
console.log(`ok -> ${path.relative(ROOT, OUT)}  ${W}x${H}  mask=${cnt}px (${(cnt / N * 100).toFixed(1)}%)`);

if (process.argv.includes('--mask')) {
  const m = new PNG({ width: W, height: H });
  for (let i = 0; i < N; i++) {
    m.data[i * 4] = mask[i] ? 255 : 0; m.data[i * 4 + 1] = Math.round(alpha[i] * 255);
    m.data[i * 4 + 2] = 0; m.data[i * 4 + 3] = 255;
  }
  fs.writeFileSync(path.join(ROOT, 'tmp', '_mask.png'), PNG.sync.write(m));
  console.log('mask -> tmp/_mask.png');
}
