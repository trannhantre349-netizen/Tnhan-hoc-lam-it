/* tools/grid-img.cjs — đo tọa độ nội thất trong ảnh nền AI.
   node tools/grid-img.cjs <anh> <x0> <y0> <w> <h> <zoom> <ra.png>
   Anh goc 1024x637 -> khung canvas 960x600 (ty le 0.9375 / 0.94191). */
const fs = require('fs');
const path = require('path');
const jpeg = require('./node_modules/jpeg-js');
const { PNG } = require('./node_modules/pngjs');

const SRC_W = 1024, SRC_H = 637, CAN_W = 960;

/* font 5x7 cho chu so va dau phay */
const F = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  ',': ['00000', '00000', '00000', '00000', '00000', '00100', '01000']
};
function text(buf, w, h, s, tx, ty, str, col) {
  let cx = tx;
  for (const ch of str) {
    const g = F[ch]; if (!g) { cx += 6 * s; continue; }
    for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) {
      if (g[r][c] !== '1') continue;
      for (let dy = 0; dy < s; dy++) for (let dx = 0; dx < s; dx++) {
        const x = cx + c * s + dx, y = ty + r * s + dy;
        if (x < 0 || y < 0 || x >= w || y >= h) continue;
        const i = (y * w + x) * 4; buf[i] = col[0]; buf[i + 1] = col[1]; buf[i + 2] = col[2]; buf[i + 3] = 255;
      }
    }
    cx += 6 * s;
  }
}
function px(buf, w, h, x, y, col) {
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  const i = (y * w + x) * 4; buf[i] = col[0]; buf[i + 1] = col[1]; buf[i + 2] = col[2]; buf[i + 3] = 255;
}

const [infile, x0, y0, w0, h0, zoom, out] = process.argv.slice(2);
const X0 = +x0, Y0 = +y0, W = +w0, H = +h0, Z = +zoom;
/* Anh ve lech trong khung canvas (vd lunar_base_bg 1024x572 giu ti le khung,
   dat tai y=64..600): GRID_CAN_H = chieu cao phan anh chiem, GRID_OFF_Y = lech. */
const CAN_H = +(process.env.GRID_CAN_H || 600);
const OFF_Y = +(process.env.GRID_OFF_Y || 0);
const raw = fs.readFileSync(infile);
let rgb, sw, sh, bpp = 3;
if (raw[0] === 0xFF && raw[1] === 0xD8) {
  const im = jpeg.decode(raw, { useTArray: true, formatAsRGB: true });
  rgb = im.data; sw = im.width; sh = im.height;
  bpp = rgb.length / (sw * sh) | 0;
} else {
  const p = PNG.sync.read(raw);
  rgb = p.data; sw = p.width; sh = p.height; bpp = 4;
}

const outW = W * Z, outH = H * Z;
const buf = Buffer.alloc(outW * outH * 4);
for (let y = 0; y < outH; y++) {
  const cyy = Y0 + y / Z - OFF_Y, syy = Math.min(sh - 1, Math.floor(cyy * (sh / CAN_H)));
  for (let x = 0; x < outW; x++) {
    const cxx = X0 + x / Z, sxx = Math.min(sw - 1, Math.floor(cxx * (sw / CAN_W)));
    const si = (syy * sw + sxx) * bpp, oi = (y * outW + x) * 4;
    buf[oi] = rgb[si]; buf[oi + 1] = rgb[si + 1]; buf[oi + 2] = rgb[si + 2]; buf[oi + 3] = 255;
  }
}
/* luoi 50px canvas: ke 100 mau vang, ke 50 mau do */
for (let c = 0; c <= W; c += 50) {
  const x = c * Z, col = c % 100 === 0 ? [255, 255, 0] : [255, 40, 40];
  for (let k = 0; k < Math.max(1, Z / 2); k++) for (let y = 0; y < outH; y++) px(buf, outW, outH, x + k, y, col);
  if (c % 50 === 0) text(buf, outW, outH, Z, x + 2, 1, String(c + X0), [255, 255, 0]);
}
for (let r = 0; r <= H; r += 50) {
  const y = r * Z, col = r % 100 === 0 ? [255, 255, 0] : [255, 40, 40];
  for (let k = 0; k < Math.max(1, Z / 2); k++) for (let x = 0; x < outW; x++) px(buf, outW, outH, x, y + k, col);
  if (r % 50 === 0) text(buf, outW, outH, Z, 1, y + 2, String(r + Y0), [0, 255, 255]);
}
const png = new PNG({ width: outW, height: outH });
png.data = buf;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, PNG.sync.write(png));
console.log(out, outW + 'x' + outH, 'canvas region', X0 + ',' + Y0, (X0 + W) + ',' + (Y0 + H));
