#!/usr/bin/env node
/* Đo đạc ảnh interior_noc_soc_isometric.png (bản mới) -> tọa độ canvas 960x600.
   Xuất: ASCII map phân loại + cụm màn hình cyan (bàn máy) + cụm đỏ (thảm). */
const fs = require('fs');
const { PNG } = require('pngjs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const png = PNG.sync.read(fs.readFileSync(path.join(ROOT, 'assets/img/interior_noc_soc_isometric.png')));
const W = png.width, H = png.height;
const FX = 960 / W, FY = 600 / H;

function px(x, y) { const i = (y * W + x) * 4; return [png.data[i], png.data[i + 1], png.data[i + 2]]; }

function cls(x, y) {
  const [r, g, b] = px(x, y);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  if (r < 20 && g < 20 && b < 20) return 'K';            // đen
  if (r > 120 && r > g * 1.7 && r > b * 1.7) return 'R'; // đỏ (thảm/LED)
  if (b > 100 && g > 80 && b > r + 30 && g > r + 10) return 'C'; // cyan màn hình
  if (g > 110 && g > r + 25 && g > b + 15) return 'G';   // xanh lá (LED rack/cây)
  if (r > 150 && g > 110 && b < 110) return 'W';         // ấm/gỗ/vàng
  if (mx < 78 && b >= r - 8) return 'F';                 // sàn xám tối xanh
  if (mx < 78) return 'D';                               // tối khác
  return '.';                                            // khác (tường sáng, v.v.)
}

// ---- ASCII map 120x? ----
const CW = 120, sx = W / CW, sy = sx;
const CH = Math.round(H / sy);
console.log(`ASCII map ${CW}x${CH} (1 ký tự = ${sx.toFixed(1)}px native = ${(sx*FX).toFixed(1)}px canvas)`);
console.log('C=cyan màn, R=đỏ, G=xanh lá, F=sàn, K=đen, D=tối, .=khác');
let head = '     ';
for (let c = 0; c < CW; c += 10) head += String(Math.round(c * sx * FX)).padStart(10, ' ');
console.log(head);
for (let row = 0; row < CH; row++) {
  const counts = {};
  let line = '';
  for (let c = 0; c < CW; c++) {
    let best = '', bn = 0;
    for (const k of ['C', 'R', 'G', 'W']) counts[k] = 0;
    for (let dx = 0; dx < sx; dx++) for (let dy = 0; dy < sy; dy++) {
      const k = cls(Math.min(W - 1, Math.floor(c * sx + dx)), Math.min(H - 1, Math.floor(row * sy + dy)));
      if (counts[k] != null) counts[k]++;
    }
    for (const k of ['C', 'R', 'G', 'W']) if (counts[k] > bn) { bn = counts[k]; best = k; }
    if (!best || bn < 2) {
      // không có màu nổi bật → lấy lớp nền theo pixel giữa ô
      best = cls(Math.floor(c * sx + sx / 2), Math.floor(row * sy + sy / 2));
      if (best === '.') best = ' ';
    }
    line += best;
  }
  console.log(String(Math.round(row * sy * FY)).padStart(4) + ' ' + line);
}

// ---- cụm màn hình cyan (connected components trên lưới 8px) ----
const GS = 8, gw = Math.ceil(W / GS), gh = Math.ceil(H / GS);
const grid = [];
for (let gy = 0; gy < gh; gy++) { grid[gy] = []; for (let gx = 0; gx < gw; gx++) grid[gy][gx] = cls(gx * GS + GS / 2, gy * GS + GS / 2); }
function clustersOf(ch, minN) {
  const seen = [], out = [];
  for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
    if (grid[gy][gx] !== ch || seen[gy * gw + gx]) continue;
    const q = [[gx, gy]]; seen[gy * gw + gx] = 1;
    let x0 = gx, x1 = gx, y0 = gy, y1 = gy, n = 0;
    while (q.length) {
      const [cx, cy] = q.pop(); n++;
      if (cx < x0) x0 = cx; if (cx > x1) x1 = cx;
      if (cy < y0) y0 = cy; if (cy > y1) y1 = cy;
      for (const [nx, ny] of [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1],[cx+1,cy+1],[cx-1,cy-1],[cx+1,cy-1],[cx-1,cy+1]]) {
        if (nx < 0 || ny < 0 || nx >= gw || ny >= gh || seen[ny * gw + nx] || grid[ny][nx] !== ch) continue;
        seen[ny * gw + nx] = 1; q.push([nx, ny]);
      }
    }
    if (n >= (minN || 3)) out.push({ n, x: Math.round(x0 * GS * FX), y: Math.round(y0 * GS * FY), x2: Math.round((x1 + 1) * GS * FX), y2: Math.round((y1 + 1) * GS * FY) });
  }
  return out.sort((a, b) => b.n - a.n);
}
console.log('\n--- cụm C (màn hình cyan), n>=6 ---');
clustersOf('C', 6).slice(0, 18).forEach(c => console.log(`x${c.x}..${c.x2} y${c.y}..${c.y2} (n=${c.n}) cx=${Math.round((c.x+c.x2)/2)},cy=${Math.round((c.y+c.y2)/2)}`));
console.log('\n--- cụm R (đỏ), n>=3 ---');
clustersOf('R', 3).slice(0, 12).forEach(c => console.log(`x${c.x}..${c.x2} y${c.y}..${c.y2} (n=${c.n})`));
console.log('\n--- cụm G (xanh lá), n>=4 ---');
clustersOf('G', 4).slice(0, 12).forEach(c => console.log(`x${c.x}..${c.x2} y${c.y}..${c.y2} (n=${c.n})`));

// ---- biên sàn theo hàng: hàng nào có >= 30% pixel F ----
console.log('\n--- FLOOR span theo hàng canvas (mỗi 16px native) ---');
for (let y = 0; y < H; y += 16) {
  let mn = -1, mx = -1, n = 0;
  for (let x = 0; x < W; x += 4) if (cls(x, y) === 'F') { n++; if (mn < 0) mn = x; mx = x; }
  if (n > W / 4 * 0.25) console.log(`y=${Math.round(y * FY)}  x ${Math.round(mn * FX)}..${Math.round(mx * FX)}  n=${n}`);
}
