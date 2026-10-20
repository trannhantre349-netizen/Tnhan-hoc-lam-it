#!/usr/bin/env node
/* Đo đạc ảnh interior_noc_soc_isometric.png -> tọa độ canvas 960x600
   cho SCENE_BOXES / exit / spawn. In: biên đa giác sàn theo hàng + bbox cụm đồ. */
const fs = require('fs');
const { PNG } = require('pngjs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const png = PNG.sync.read(fs.readFileSync(path.join(ROOT, 'assets/img/interior_noc_soc_isometric.png')));
const W = png.width, H = png.height;
const FX = 960 / W, FY = 600 / H; // 1536x1024 -> 960x600

function px(x, y) { const i = (y * W + x) * 4; return [png.data[i], png.data[i + 1], png.data[i + 2]]; }

// ---- classifier ----
function cls(x, y) {
  const [r, g, b] = px(x, y);
  if (r < 22 && g < 22 && b < 22) return 'black';
  if (r > 150 && g < 90 && b < 90) return 'red';
  if (g > 120 && b > 140 && r < 110) return 'screen'; // màn hình xanh/cyan
  if (r > 120 && r < 200 && g > 130 && g < 205 && b > 150 && b < 220 && b >= g - 6) return 'floor';
  if (r > 140 && g > 115 && b < 115) return 'desk';   // bàn gỗ/xám ấm
  if (g > 60 && g > r + 12 && g > b + 12) return 'plant';
  if (r >= 22 && r < 90 && g >= 22 && g < 90 && b >= 22 && b < 100) return 'dark';
  return 'other';
}

// ---- biên sàn theo hàng (mọi 8px) ----
console.log('--- FLOOR span theo hàng (canvas coords) ---');
const spans = [];
for (let y = 0; y < H; y += 8) {
  let mn = -1, mx = -1;
  for (let x = 0; x < W; x += 4) {
    if (cls(x, y) === 'floor') { if (mn < 0) mn = x; mx = x; }
  }
  if (mn >= 0) spans.push([Math.round(y * FY), Math.round(mn * FX), Math.round(mx * FX)]);
}
for (let i = 0; i < spans.length; i += 6) console.log('y=' + spans[i][0] + '  x ' + spans[i][1] + ' .. ' + spans[i][2]);
console.log('tổng hàng có floor:', spans.length);

// ---- bbox cụm theo class (grid 6px, cluster đơn giản theo cột liền kề) ----
function bboxOf(want) {
  let a = W, b = H, e = -1, f = -1, n = 0;
  for (let y = 0; y < H; y += 6) for (let x = 0; x < W; x += 6) {
    if (cls(x, y) === want) { n++; if (x < a) a = x; if (x > e) e = x; if (y < b) b = y; if (y > f) f = y; }
  }
  return n ? { n, x: Math.round(a * FX), y: Math.round(b * FY), x2: Math.round(e * FX), y2: Math.round(f * FY) } : null;
}
console.log('\n--- bbox tổng theo class ---');
for (const w of ['red', 'screen', 'desk', 'plant', 'dark', 'black']) {
  const r = bboxOf(w);
  console.log(w.padEnd(7), r ? `x${r.x}..${r.x2} y${r.y}..${r.y2} (n=${r.n})` : 'none');
}

// ---- màn hình lớn gắn tường: cluster 'screen' theo cụm (tách trái/phải theo x) ----
function clusterCols(want, gap) {
  const cols = [];
  for (let x = 0; x < W; x += 6) {
    let hit = false;
    for (let y = 0; y < H; y += 6) if (cls(x, y) === want) { hit = true; break; }
    cols.push(hit ? 1 : 0);
  }
  const runs = []; let s = -1;
  for (let i = 0; i <= cols.length; i++) {
    if (i < cols.length && cols[i]) { if (s < 0) s = i; }
    else if (s >= 0) {
      if (!runs.length || (i - s) * 6 > 0) { runs.push([s, i - 1]); s = -1; }
    }
  }
  // gộp run cách nhau < gap cột
  const merged = [];
  for (const r of runs) {
    if (merged.length && (r[0] - merged[merged.length - 1][1]) * 6 < gap) merged[merged.length - 1][1] = r[1];
    else merged.push(r.slice());
  }
  return merged.map(([a, b]) => {
    let top = H, bot = -1;
    for (let y = 0; y < H; y += 6) for (let x = a * 6; x <= b * 6 && x < W; x += 6)
      if (cls(x, y) === want) { if (y < top) top = y; if (y > bot) bot = y; }
    return { x: Math.round(a * 6 * FX), x2: Math.round(b * 6 * FX), y: Math.round(top * FY), y2: Math.round(bot * FY) };
  });
}
console.log('\n--- cụm screen (gap<40px) ---');
for (const c of clusterCols('screen', 40)) console.log(`x${c.x}..${c.x2} y${c.y}..${c.y2}`);
console.log('\n--- cụm red (gap<30px) ---');
for (const c of clusterCols('red', 30)) console.log(`x${c.x}..${c.x2} y${c.y}..${c.y2}`);

// ---- thảm đỏ: cụm red vùng dưới-trái (y>300 canvas) ----
console.log('\n--- red y>300 ---');
const reds = clusterCols('red', 30).filter(c => c.y > 300);
for (const c of reds) console.log(`x${c.x}..${c.x2} y${c.y}..${c.y2}`);

// ---- chữ trên thảm (vùng đỏ dưới cùng): in ảnh crop ASCII để xác định hướng chữ ----
const crop = { x0: 0.13, y0: 0.60, x1: 0.30, y1: 0.74 };
console.log('\n--- crop thảm (ASCII 2px/char, R=đỏ, .=khác) ---');
for (let y = Math.floor(H * crop.y0); y < H * crop.y1; y += 3) {
  let line = '';
  for (let x = Math.floor(W * crop.x0); x < W * crop.x1; x += 3) {
    const c = cls(x, y);
    line += c === 'red' ? 'R' : (c === 'black' ? '.' : ' ');
  }
  console.log(line);
}
