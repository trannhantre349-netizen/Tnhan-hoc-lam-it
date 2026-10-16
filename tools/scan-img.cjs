/* In run màu theo hàng hoặc cột của ảnh nền (tự nhận JPEG/PNG).
   node tools/scan-img.cjs <anh> row <y>            -> run sáng/tối cả hàng
   node tools/scan-img.cjs <anh> col <x> <y0> <y1>  -> run màu theo cột */
const fs = require('fs'), path = require('path');
const jpeg = require('jpeg-js'), PNG = require('pngjs').PNG;
const file = process.argv[2];
const buf = fs.readFileSync(path.resolve(file));
let W, H, get;
if (buf.readUInt32BE(0) === 0x89504e47) {
  const p = PNG.sync.read(buf); W = p.width; H = p.height;
  get = (x, y) => { const i = (y * W + x) * 4; return [p.data[i], p.data[i + 1], p.data[i + 2]]; };
} else {
  const p = jpeg.decode(buf, { useTArray: true }); W = p.width; H = p.height;
  get = (x, y) => { const i = (y * W + x) * 4; return [p.data[i], p.data[i + 1], p.data[i + 2]]; };
}
console.log(`${W}x${H}`);
const mode = process.argv[3];
let run = null, start = 0, n;
if (mode === 'row') {
  const y = +process.argv[4]; n = W;
  for (let x = 0; x <= n; x++) {
    const k = x < n ? (get(x, y).reduce((a, b) => a + b) > 420 ? 'SANG' : 'TOI  ') : null;
    if (k !== run) { if (run) console.log(`x ${String(start).padStart(4)}-${String(x - 1).padStart(4)} w=${String(x - start).padStart(4)} ${run}`); run = k; start = x; }
  }
} else {
  const x = +process.argv[4]; const y0 = +process.argv[5]; n = +process.argv[6];
  for (let y = y0; y <= n; y++) {
    const k = y < n ? get(x, y).map(v => (v / 24) | 0).join(',') : null;
    if (k !== run) { if (run) console.log(`y ${String(start).padStart(3)}-${String(y - 1).padStart(3)} h=${String(y - start).padStart(3)} ${run.padEnd(10)} ${get(x, start)}`); run = k; start = y; }
  }
}
