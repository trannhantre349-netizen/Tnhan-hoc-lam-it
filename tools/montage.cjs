#!/usr/bin/env node
/* Gh ảnh cắt trong tmp/crops/ thành contact sheet có số thứ tự (font 3x5 vẽ tay),
   để đọc bằng mắt rồi gán tên cho từng ô SHEET.  node tools/montage.cjs [per=12] */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const CELL = 300, COLS = 4, PER = +(process.argv[2] || 12);
const dir = path.join(process.cwd(), 'tmp', 'crops');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png')).sort();

const F = { '0': 0x75575, '1': 0x22622, '2': 0x77177, '3': 0x77377, '4': 0x57355, '5': 0x71775, '6': 0x71777, '7': 0x73222, '8': 0x75775, '9': 0x75773 };
function put(g, x, y, r, gb, b) { if (x < 0 || y < 0 || x >= g.width || y >= g.height) return; const i = (y * g.width + x) * 4; g.data[i] = r; g.data[i + 1] = gb; g.data[i + 2] = b; g.data[i + 3] = 255; }
function text(g, ox, oy, s, col) {
  for (let c = 0; c < s.length; c++) { const m = F[s[c]]; if (!m) continue; for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) if (m & (1 << (14 - (y * 3 + x)))) { put(g, ox + c * 5 + x, oy + y, ...col); put(g, ox + c * 5 + x + 1, oy + y, ...col); put(g, ox + c * 5 + x, oy + y + 1, ...col); put(g, ox + c * 5 + x + 1, oy + y + 1, ...col); } }
}
function paste(dst, src, dx, dy) {
  const k = CELL / Math.max(src.width, src.height), w = Math.max(1, Math.round(src.width * k)), h = Math.max(1, Math.round(src.height * k));
  const ox = dx + Math.round((CELL - w) / 2), oy = dy + 14;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = Math.min(src.width - 1, Math.floor(x * src.width / w)), sy = Math.min(src.height - 1, Math.floor(y * src.height / h));
    const si = (sy * src.width + sx) * 4, di = ((oy + y) * dst.width + ox + x) * 4;
    if (src.data[si + 3] < 128) continue;
    dst.data[di] = src.data[si]; dst.data[di + 1] = src.data[si + 1]; dst.data[di + 2] = src.data[si + 2]; dst.data[di + 3] = 255;
  }
  return [ox, oy, w, h];
}

for (let page = 0; page * PER < files.length; page++) {
  const list = files.slice(page * PER, page * PER + PER);
  const rows = Math.ceil(list.length / COLS);
  const g = new PNG({ width: COLS * CELL, height: rows * CELL });
  for (let i = 0; i < g.width * g.height; i++) { const o = i * 4; g.data[o] = 118; g.data[o + 1] = 126; g.data[o + 2] = 138; g.data[o + 3] = 255; }
  list.forEach((f, idx) => {
    const global = page * PER + idx;
    const src = PNG.sync.read(fs.readFileSync(path.join(dir, f)));
    const dx = (idx % COLS) * CELL, dy = Math.floor(idx / COLS) * CELL;
    const [ox, oy, w, h] = paste(g, src, dx, dy);
    for (let x = 0; x < CELL; x++) { put(g, dx + x, dy, 20, 20, 20); put(g, dx + x, dy + CELL - 1, 20, 20, 20); }
    for (let y = 0; y < CELL; y++) { put(g, dx, dy + y, 20, 20, 20); put(g, dx + CELL - 1, dy + y, 20, 20, 20); }
    text(g, ox, oy - 11, `${global}: ${f.replace(/^c0*/, '').replace(/_.*/, '')}`, [255, 240, 120]);
    text(g, ox, oy + h + 2, `${src.width}x${src.height}`, [190, 235, 255]);
  });
  const out = path.join(process.cwd(), 'tmp', `montage_${page}.png`);
  fs.writeFileSync(out, PNG.sync.write(g));
  console.log(out + '  ô ' + (page * PER) + '..' + (page * PER + list.length - 1) + '  (thứ tự = danh sách bbox đã sắp xếp)');
}
