/* tools/crop-region.cjs — cắt một vùng ảnh (PNG hoặc JPEG đổi đuôi .png) và phóng to
   để soi chi tiết trên màn hình đọc được. tuỳ chọn tăng sáng cho vùng tối.
   Cách dùng: node tools/crop-region.cjs <anh> <x> <y> <w> <h> <scale> <out.png> [boost]
   (chạy từ thư mục gốc repo — pngjs/jpeg-js nạp từ tools/node_modules) */
const fs = require('fs');
const path = require('path');
const { PNG } = require(path.join(__dirname, 'node_modules', 'pngjs'));
const jpeg = require(path.join(__dirname, 'node_modules', 'jpeg-js'));

function load(f) {
  const b = fs.readFileSync(f);
  if (b.readUInt32BE(0) === 0x89504e47) { const p = PNG.sync.read(b); return { w: p.width, h: p.height, d: p.data }; }
  const j = jpeg.decode(b, { useTArray: true, toRGBA32: true });
  return { w: j.width, h: j.height, d: Buffer.from(j.data) };
}
const [f, x, y, w, h, s, out, boost] = process.argv.slice(2);
const im = load(f);
const X = +x, Y = +y, W = +w, H = +h, S = +s, B = boost ? +boost : 1;
const o = new PNG({ width: W * S, height: H * S });
for (let r = 0; r < H * S; r++) for (let c = 0; c < W * S; c++) {
  const sy = Math.min(im.h - 1, Y + Math.floor(r / S)), sx = Math.min(im.w - 1, X + Math.floor(c / S));
  const si = (sy * im.w + sx) * 4, di = (r * W * S + c) * 4;
  for (let k = 0; k < 3; k++) o.data[di + k] = Math.min(255, Math.round(im.d[si + k] * B) + (B > 1 ? 8 : 0));
  o.data[di + 3] = 255;
}
fs.writeFileSync(out, PNG.sync.write(o));
console.log(`${f} ${im.w}x${im.h} crop(${X},${Y},${W},${H}) x${S} boost=${B} -> ${out}`);
