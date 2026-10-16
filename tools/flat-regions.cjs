/* Tim vung dat/san phang (variance thap) tren anh nen, quy do ve khung canvas
   960x536 dat tai y=64 (giong cach ve cua LUNAR_BASE). In ra cac o 40x28 de
   dung lam nguon lat (luFill) khi che mock-HUD bake trong anh.
   cach dung: node tools/flat-regions.cjs assets/lunar_base_bg.png [can_h] [off_y] */
const fs = require('fs'), path = require('path');
const jpeg = require(path.join(__dirname, 'node_modules/jpeg-js'));
const file = process.argv[2];
const CAN_H = +(process.argv[3] || 536), OFF_Y = +(process.argv[4] || 64);
const buf = fs.readFileSync(file);
const d = jpeg.decode(buf, { useTArray: true });
const W = d.width, H = d.height, px = d.data;
const K = 960 / W;                       // ti le ve giu khung anh
const BW = 40, BH = 28;                  // kich thuoc o theo do thi canvas
const out = [];
for (let cy = OFF_Y; cy + BH <= OFF_Y + CAN_H; cy += BH) {
  for (let cx = 0; cx + BW <= 960; cx += BW) {
    const sx = Math.floor(cx / K), sy = Math.floor((cy - OFF_Y) / K);
    const sw = Math.ceil(BW / K), sh = Math.ceil(BH / K);
    if (sx + sw > W || sy + sh > H) continue;
    let n = 0, sum = 0, sq = 0, r0 = 0, g0 = 0, b0 = 0;
    for (let y = sy; y < sy + sh; y += 2) for (let x = sx; x < sx + sw; x += 2) {
      const i = (y * W + x) * 4;
      const l = (px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114);
      sum += l; sq += l * l; n++;
      r0 += px[i]; g0 += px[i + 1]; b0 += px[i + 2];
    }
    const mean = sum / n, sd = Math.sqrt(sq / n - mean * mean);
    out.push({ cx, cy, sd, mean, rgb: [r0 / n | 0, g0 / n | 0, b0 / n | 0] });
  }
}
out.sort((a, b) => a.sd - b.sd);
console.log('anh ' + W + 'x' + H + '  K=' + K.toFixed(4) + '  canvas ' + 960 + 'x' + CAN_H + ' tai y=' + OFF_Y);
console.log('--- 26 o phang nhat (canvas x,y  sd  mean  rgb) ---');
out.slice(0, 26).forEach(o => console.log(o.cx + ',' + o.cy + '  sd=' + o.sd.toFixed(1) + '  L=' + o.mean.toFixed(0) + '  rgb=' + o.rgb.join(',')));
console.log('--- phang nhat tung dai y ---');
for (const band of [[64, 200], [200, 300], [300, 420], [420, 500], [500, 600]]) {
  const sel = out.filter(o => o.cy >= band[0] && o.cy < band[1]).slice(0, 8);
  console.log('y ' + band[0] + '..' + band[1] + ': ' + sel.map(o => o.cx + ',' + o.cy + '(sd' + o.sd.toFixed(0) + ',L' + o.mean.toFixed(0) + ')').join(' '));
}
