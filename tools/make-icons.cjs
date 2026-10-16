// Sinh icon PWA (192x192 + 512x512) từ avatar Nhân IT trong assets/img/baked/char_player.png.
// Chạy: node tools/make-icons.cjs  → assets/img/icon-192.png, assets/img/icon-512.png
// Thiết kế: nền gradient tối theo theme (#1a1e29 → #0f172a), quầng sáng xanh, mặt nhân vật giữa khung (an toàn maskable).
const fs = require('fs');
const path = require('path');
const { PNG } = require('./node_modules/pngjs');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'assets', 'img', 'baked', 'char_player.png');

function loadRGBA(file) {
  const p = PNG.sync.read(fs.readFileSync(file));
  return { w: p.width, h: p.height, d: p.data };
}

function alphaBBox(im) {
  let minX = im.w, minY = im.h, maxX = -1, maxY = -1;
  for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) {
    if (im.d[(y * im.w + x) * 4 + 3] > 16) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

/* Lấy mẫu song tuyến (premultiplied alpha để mép không bị viền tối) */
function sample(im, fx, fy) {
  const x0 = Math.max(0, Math.min(im.w - 1, Math.floor(fx))), y0 = Math.max(0, Math.min(im.h - 1, Math.floor(fy)));
  const x1 = Math.min(im.w - 1, x0 + 1), y1 = Math.min(im.h - 1, y0 + 1);
  const tx = Math.max(0, Math.min(1, fx - x0)), ty = Math.max(0, Math.min(1, fy - y0));
  const out = [0, 0, 0, 0];
  const q = [[x0, y0, (1 - tx) * (1 - ty)], [x1, y0, tx * (1 - ty)], [x0, y1, (1 - tx) * ty], [x1, y1, tx * ty]];
  for (const [x, y, wt] of q) {
    const i = (y * im.w + x) * 4, a = im.d[i + 3] / 255 * wt;
    out[0] += im.d[i] * a; out[1] += im.d[i + 1] * a; out[2] += im.d[i + 2] * a; out[3] += a;
  }
  if (out[3] > 0) { out[0] /= out[3]; out[1] /= out[3]; out[2] /= out[3]; }
  out[3] *= 255;
  return out;
}

function makeIcon(size) {
  const out = Buffer.alloc(size * size * 4);
  const top = [0x1a, 0x1e, 0x29], bot = [0x0f, 0x17, 0x2a];
  const glowX = size * 0.5, glowY = size * 0.46, glowR = size * 0.46;
  for (let y = 0; y < size; y++) {
    const k = y / (size - 1);
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      out[i] = top[0] + (bot[0] - top[0]) * k;
      out[i + 1] = top[1] + (bot[1] - top[1]) * k;
      out[i + 2] = top[2] + (bot[2] - top[2]) * k;
      // quầng sáng xanh sau đầu
      const dx = (x - glowX) / glowR, dy = (y - glowY) / glowR;
      const g = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
      const ga = g * g * 0.42;
      out[i] = out[i] * (1 - ga) + 0x3a * ga;
      out[i + 1] = out[i + 1] * (1 - ga) + 0xa5 * ga;
      out[i + 2] = out[i + 2] * (1 - ga) + 0xff * ga;
      out[i + 3] = 255;
    }
  }
  return out;
}

function drawFace(dst, W, face, fw, fh, dx, dy) {
  for (let y = 0; y < fh; y++) {
    const ty = dy + y;
    if (ty < 0 || ty >= W) continue;
    for (let x = 0; x < fw; x++) {
      const tx = dx + x;
      if (tx < 0 || tx >= W) continue;
      const s = sample(face, x * face.__sx, y * face.__sy);
      if (s[3] < 2) continue;
      const i = (ty * W + tx) * 4, a = s[3] / 255;
      dst[i] = dst[i] * (1 - a) + s[0] * a;
      dst[i + 1] = dst[i + 1] * (1 - a) + s[1] * a;
      dst[i + 2] = dst[i + 2] * (1 - a) + s[2] * a;
    }
  }
}

function savePNG(buf, w, h, file) {
  const p = new PNG({ width: w, height: h });
  buf.copy(p.data);
  fs.writeFileSync(file, PNG.sync.write(p));
  console.log('wrote', file, w + 'x' + h, fs.statSync(file).size, 'bytes');
}

function main() {
  const src = loadRGBA(SRC);
  const bb = alphaBBox(src);
  // Crop phần ĐẦU (khuôn mặt): 42% chiều cao vùng alpha tính từ đỉnh
  const headH = Math.round(bb.h * 0.42);
  const face = {
    w: bb.w, h: headH,
    d: (() => {
      const d = Buffer.alloc(bb.w * headH * 4);
      for (let y = 0; y < headH; y++) src.d.copy(d, y * bb.w * 4, ((bb.y + y) * src.w + bb.x) * 4, ((bb.y + y) * src.w + bb.x + bb.w) * 4);
      return d;
    })()
  };
  face.__sx = 1; face.__sy = 1;

  const MASTER = 512;
  for (const size of [MASTER, 192]) {
    const canvas = makeIcon(size);
    // đầu chiếm 62% chiều cao icon, tâm hơi cao hơn giữa
    const fh = Math.round(size * 0.62);
    const fw = Math.round(fh * face.w / face.h);
    const fdx = Math.round((size - fw) / 2);
    const fdy = Math.round(size * 0.50 - fh / 2);
    face.__sx = face.w / fw; face.__sy = face.h / fh;
    drawFace(canvas, size, face, fw, fh, fdx, fdy);
    savePNG(canvas, size, size, path.join(ROOT, 'assets', 'img', 'icon-' + size + '.png'));
  }
}
main();
