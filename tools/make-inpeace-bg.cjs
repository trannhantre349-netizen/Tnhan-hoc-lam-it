#!/usr/bin/env node
/* ============================================================
   tools/make-inpeace-bg.cjs — ẢNH NỀN CHỖ CHO cho Khu 5
   ------------------------------------------------------------
   Người chơi sẽ thay assets/img/inpeace_bg.png bằng ảnh thánh đường
   thật sau. File này vẽ bản placeholder để khung UI chạy được ngay và
   để ảnh thật chỉ việc ghi đè lên, không phải sửa code (js/inpeace.js
   cover-crop mọi kích thước ảnh).

     node tools/make-inpeace-bg.cjs [rộng cao]   (mặc định 1024 640)

   Cảnh: gian giữa nhà thờ nhìn chính diện — điểm tụ ở cung thánh,
   hai dãy cột lùi xa, vòm cửa sáng, cột sáng xiên từ cửa sổ hông xuống
   sàn gỗ, tối dần ra bốn góc. Toàn bộ là hàm toạ độ, không dùng ảnh gốc.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { PNG } = require(path.join(__dirname, 'node_modules', 'pngjs'));

const W = +(process.argv[2] || 1024), H = +(process.argv[3] || 640);
const OUT = path.join(__dirname, '..', 'assets', 'img', 'inpeace_bg.png');
const cx = W / 2, HOR = H * .42;                  // đường chân trời = cung thánh
const img = new PNG({ width: W, height: H });
const buf = new Float32Array(W * H * 3);
const R = (s => () => { s += 0x6D2B79F5; let r = Math.imul(s ^ (s >>> 15), 1 | s); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; })(12345);

function setp(x, y, r, g, b) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const o = ((y | 0) * W + (x | 0)) * 3;
  buf[o] = r; buf[o + 1] = g; buf[o + 2] = b;
}
function addp(x, y, r, g, b) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const o = ((y | 0) * W + (x | 0)) * 3;
  buf[o] += r; buf[o + 1] += g; buf[o + 2] += b;
}
const mix = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));
function glow(px, py, rx, ry, r, g, b, pow) {
  const x0 = Math.max(0, Math.floor(px - rx)), x1 = Math.min(W - 1, Math.ceil(px + rx));
  const y0 = Math.max(0, Math.floor(py - ry)), y1 = Math.min(H - 1, Math.ceil(py + ry));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const d = Math.hypot((x - px) / rx, (y - py) / ry);
    if (d >= 1) continue;
    const a = Math.pow(1 - d, pow || 2);
    addp(x, y, r * a, g * a, b * a);
  }
}

/* ---------- 1. Nền chung: trần tối → tường ấm → sàn sẫm ---------- */
for (let y = 0; y < H; y++) {
  const t = y / H;
  const c = t < .30 ? mix(.085, .155, t / .30) : t < .52 ? mix(.155, .215, (t - .30) / .22) : mix(.215, .06, (t - .52) / .48);
  for (let x = 0; x < W; x++) setp(x, y, c * 1.18, c * .92, c * .58);
}

/* ---------- 2. Cung thánh: vòm cửa sáng + bàn thờ + quầng hương ---------- */
glow(cx, HOR - H * .02, W * .13, H * .22, .50, .37, .17, 1.5);        // hào quang
/* cửa sổ vòm: thân chữ nhật + đầu bán nguyệt, tô đặc rồi mới thêm sáng */
const AW = W * .052, AH = H * .19, AT = HOR - AH * .92;
for (let y = Math.round(AT); y < HOR + H * .02; y++) {
  const cap = AT + AW, dx = y < cap ? Math.sqrt(Math.max(0, AW * AW - (cap - y) * (cap - y))) : AW;
  for (let x = Math.round(cx - dx); x <= Math.round(cx + dx); x++)
    setp(x, y, .78, .58, .27);
}
glow(cx, AT + AH * .35, AW * 2.6, AH * 1.5, .30, .22, .10, 1.8);      // ánh tràn ra tường
glow(cx, HOR + H * .015, W * .05, H * .05, .30, .22, .10, 2.2);       // bàn thờ

/* ---------- 3. Sàn gỗ: ván nằm ngang co theo phối cảnh + lối trung tâm ---------- */
for (let y = Math.round(HOR); y < H; y++) {
  const p = (y - HOR) / (H - HOR);
  const gap = 1 / Math.max(.02, p);
  const plank = (Math.floor(gap * .9) % 2) ? .012 : 0;
  const wood = .045 + p * .105 + plank;
  for (let x = 0; x < W; x++) {
    const aisle = Math.abs(x - cx) / (W * (.05 + p * .32));
    const lit = aisle < 1 ? (1 - aisle) * .055 * (1 - p * .35) : 0;
    const c = wood + lit;
    setp(x, y, c * 1.62, c * 1.14, c * .66);
  }
}

/* ---------- 4. Hai dãy cột + vòm nối (vẽ SAU sàn để chân cột đứng trên sàn) ---------- */
const COL = [];
for (let k = 8; k >= 1; k--) {
  const p = k / 8;
  const off = Math.pow(p, 1.55) * W * .47;
  const half = Math.pow(p, .8) * W * .026 + 3;
  const top = HOR - Math.pow(p, .9) * H * .30;
  const bot = HOR + Math.pow(p, 1.25) * H * .60;
  COL.push({ p, off, half, top, bot });
}
COL.forEach((c, i) => {
  const shade = .05 + c.p * .11;
  for (const s of [-1, 1]) {
    const X = cx + s * c.off;
    for (let y = Math.round(c.top); y <= Math.round(c.bot); y++) {
      for (let x = Math.round(X - c.half); x <= Math.round(X + c.half); x++) {
        const dx = (x - X) / c.half;
        if (Math.abs(dx) > 1) continue;
        const round = 1 - .55 * dx * dx;
        const t = (y - c.top) / (c.bot - c.top);
        const cap = (t < .05) || (t > .93) ? 1.35 : 1;               // đầu + đế cột
        const v = shade * round * cap;
        setp(x, y, v * 1.5, v * 1.16, v * .74);
      }
    }
  }
  /* vòm nối hai cột cùng hàng: dải cong mảnh sát trần */
  if (i < COL.length - 1) {
    const nx = COL[i + 1], rise = Math.min(c.top, nx.top) - H * .045;
    for (const s of [-1, 1]) {
      const x0 = cx + s * c.off, x1 = cx + s * nx.off;
      for (let x = Math.round(Math.min(x0, x1)); x <= Math.round(Math.max(x0, x1)); x++) {
        const t = (x - x0) / (x1 - x0 || 1);
        const y = c.top + (nx.top - c.top) * t - Math.sin(Math.PI * t) * (c.top - rise);
        for (let d = 0; d < Math.max(2, c.half * .5); d++) setp(x, y + d, .055 + c.p * .05, .045 + c.p * .04, .03 + c.p * .025);
      }
    }
  }
});

/* ---------- 5. Ô kính màu hai bên tường (mờ, không loè) ---------- */
for (let k = 2; k <= 6; k++) {
  const p = k / 6, off = Math.pow(p, 1.55) * W * .47;
  const w = Math.pow(p, .8) * W * .022, h = w * 2.3;
  const y = HOR - h * .95;
  for (const s of [-1, 1]) {
    const X = cx + s * (off + w * 2.6);
    const pal = s < 0 ? [.15, .05, .07] : [.05, .085, .15];
    glow(X, y + h / 2, w, h / 2, pal[0], pal[1], pal[2], 1.4);
  }
}

/* ---------- 6. Cột sáng xiên từ cửa sổ hông xuống sàn ---------- */
function shaft(x0, y0, x1, y1, w, r, g, b) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy);
  const ux = dx / L, uy = dy / L;
  const X0 = Math.max(0, Math.min(x0, x1) - w * 2), X1 = Math.min(W - 1, Math.max(x0, x1) + w * 2);
  const Y0 = Math.max(0, Math.min(y0, y1)), Y1 = Math.min(H - 1, Math.max(y0, y1));
  for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) {
    const t = ((x - x0) * ux + (y - y0) * uy) / L;
    if (t < 0 || t > 1) continue;
    const px = x0 + ux * L * t, py = y0 + uy * L * t;
    const d = Math.hypot(x - px, y - py) / (w * (.55 + t * .9));
    if (d >= 1) continue;
    const a = Math.pow(1 - d, 1.6) * (1 - t * .3);
    addp(x, y, r * a, g * a, b * a);
  }
}
shaft(cx - W * .30, HOR - H * .14, cx - W * .10, H * .99, W * .032, .20, .15, .06);
shaft(cx + W * .30, HOR - H * .14, cx + W * .10, H * .99, W * .032, .20, .15, .06);
shaft(cx - W * .10, HOR - H * .06, cx - W * .015, H * .98, W * .020, .16, .12, .045);
shaft(cx + W * .10, HOR - H * .06, cx + W * .015, H * .98, W * .020, .16, .12, .045);
glow(cx, HOR + H * .10, W * .22, H * .16, .07, .05, .022, 1.4);        // sáng phản trên sàn

/* ---------- 7. Bụi sáng lơ lửng + vignette ---------- */
for (let i = 0; i < 1800; i++) {
  const x = Math.round(R() * W), y = Math.round(HOR - H * .12 + R() * (H - HOR + H * .12));
  const s = R() < .82 ? 1 : 2, a = .02 + R() * .08;
  for (let dy = 0; dy < s; dy++) for (let dx = 0; dx < s; dx++) addp(x + dx, y + dy, a * .95, a * .8, a * .46);
}
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const o = (y * W + x) * 3, q = (y * W + x) << 2;
  const d = Math.hypot((x - cx) / (W * .60), (y - H * .5) / (H * .60));
  const vig = 1 - Math.pow(Math.max(0, Math.min(1, (d - .40) / .78)), 1.5) * .80;
  img.data[q] = Math.max(0, Math.min(255, Math.round(buf[o] * vig * 255)));
  img.data[q + 1] = Math.max(0, Math.min(255, Math.round(buf[o + 1] * vig * 255)));
  img.data[q + 2] = Math.max(0, Math.min(255, Math.round(buf[o + 2] * vig * 255)));
  img.data[q + 3] = 255;
}
fs.writeFileSync(OUT, PNG.sync.write(img));
console.log('ghi ' + path.relative(process.cwd(), OUT) + ' ' + W + 'x' + H + ' = ' + (fs.statSync(OUT).size / 1048576).toFixed(2) + ' MB');
