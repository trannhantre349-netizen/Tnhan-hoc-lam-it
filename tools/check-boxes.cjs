#!/usr/bin/env node
/* Dán các ô cắt trong SHEET (đã bake) lên nền HUỲNH QUANG để nhìn thấy tận mắt
   chỗ nào còn quầng trắng / mảng nền chưa tẩy.  Mặc định lấy sheet traffic.
     node tools/check-boxes.cjs [street|streetExtra|traffic] [tên1 tên2 ...] */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const ROOT = path.join(__dirname, '..');
function literal(src, name) {
  const at = src.indexOf('const ' + name + ' = {');
  let i = src.indexOf('{', at), depth = 0, text = '';
  while (i < src.length) {
    const c = src[i];
    if (c === '"' || c === "'" || c === '`') {
      text += c; i++;
      while (i < src.length && src[i] !== c) { if (src[i] === '\\') { text += src[i] + src[i + 1]; i += 2; continue; } text += src[i++]; }
      text += src[i++]; continue;
    }
    if (c === '{') depth++; if (c === '}') depth--;
    text += c; i++; if (!depth) break;
  }
  return new Function('return ' + text)();
}
const srcJs = fs.readFileSync(path.join(ROOT, 'js', 'assets.js'), 'utf8');
const ASSETS = literal(srcJs, 'ASSETS'), SHEET = literal(srcJs, 'SHEET');
const which = process.argv[2] || 'traffic';
const boxKeys = process.argv.slice(3).filter(k => SHEET[k]);
const keys = boxKeys.length ? boxKeys : Object.entries(SHEET).filter(([, s]) => (s.sheet || (s.extra ? 'streetExtra' : 'street')) === which).map(([k]) => k);
const img = PNG.sync.read(fs.readFileSync(path.join(ROOT, ASSETS[which].split('?')[0])));

const CW = 300, CH = 260, COLS = 4, rows = Math.ceil(keys.length / COLS);
const g = new PNG({ width: COLS * CW, height: rows * CH });
for (let i = 0; i < g.width * g.height; i++) { const o = i * 4; g.data[o] = 255; g.data[o + 1] = 0; g.data[o + 2] = 255; g.data[o + 3] = 255; }
const frame = (x0, y0, w, h) => {
  for (let x = x0; x < x0 + w; x++) for (const y of [y0, y0 + h - 1]) { const o = (y * g.width + x) * 4; g.data[o] = g.data[o + 1] = g.data[o + 2] = 20; }
  for (let y = y0; y < y0 + h; y++) for (const x of [x0, x0 + w - 1]) { const o = (y * g.width + x) * 4; g.data[o] = g.data[o + 1] = g.data[o + 2] = 20; }
};
keys.forEach((k, n) => {
  const s = SHEET[k], ox = (n % COLS) * CW, oy = Math.floor(n / COLS) * CH;
  const sc = Math.min((CW - 10) / s.w, (CH - 10) / s.h), w = Math.round(s.w * sc), h = Math.round(s.h * sc);
  const px = ox + ((CW - w) >> 1), py = oy + ((CH - h) >> 1);
  let semi = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const si = ((s.y + Math.min(s.h - 1, (y * s.h / h) | 0)) * img.width + s.x + Math.min(s.w - 1, (x * s.w / w) | 0)) * 4;
    const a = img.data[si + 3]; if (a < 8) continue;
    if (a < 250) semi++;
    const di = ((py + y) * g.width + px + x) * 4;
    g.data[di] = img.data[si]; g.data[di + 1] = img.data[si + 1]; g.data[di + 2] = img.data[si + 2]; g.data[di + 3] = 255;
  }
  frame(ox, oy, CW, CH);
  console.log(`${k.padEnd(18)} ${s.w}x${s.h}  alpha-lẻ=${semi}`);
});
const out = path.join(ROOT, 'tmp', `check_${which}.png`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, PNG.sync.write(g));
console.log(`\n${out}  — ${keys.length} ô, thứ tự đọc: trái->phải, trên->dưới`);
console.log(keys.join(' | '));
