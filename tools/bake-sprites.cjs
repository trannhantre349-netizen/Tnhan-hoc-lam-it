#!/usr/bin/env node
/* ============================================================
   tools/bake-sprites.cjs — "Nướng" sẵn nền trong suốt cho ảnh AI-gen
   Chạy MỘT LẦN sau khi artist thêm/đổi ảnh nguồn:  node tools/bake-sprites.cjs
   (npm install trong thư mục tools/ trước nếu thiếu pngjs / jpeg-js)

   Ảnh AI-gen không có kênh alpha: nền là màu trắng tinh. Trước đây game
   tẩy nền lúc chạy bằng canvas + getImageData(), nhưng Chrome mở file:///
   chặn đọc pixel ảnh cùng đĩa (Tainted canvas / CORS) nên cách đó hỏng.
   Script này làm đúng thuật toán đó ngoại tuyến và ghi ra PNG có alpha thật
   vào assets/img/baked/ — game chỉ còn việc nạp ảnh, không đụng pixel nữa.

   Thuật toán (giữ nguyên như bản runtime cũ để hình không đổi):
   1. flood-fill từ 4 mép ảnh qua pixel r,g,b > 240 -> alpha 0.
      Pixel trắng nằm KÍN bên trong sprite (tuyết trên ngọn thông, sọc bạt
      tạp hoá, chữ trên biển hiệu) không thông ra mép nên còn nguyên.
   2. nới 1px vòng ngoài cho vùng anti-alias (mọi kênh > 236) khỏi quầng trắng.
   3. ô cắt nào đánh dấu pocket: tẩy thêm mảng trắng kín trong ô (bầu trời
      bị khung giàn giáo / dây điện khoanh lại).
   4. ảnh nhân vật: cắt theo bbox alpha + 6px (thao tác trimImage cũ).

   Bảng toạ độ cắt và danh sách ảnh lấy thẳng từ js/assets.js — một nguồn
   cấu hình duy nhất, sửa SHEET xong chạy lại script là đủ.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const jpeg = require('jpeg-js');

const ROOT = path.join(__dirname, '..');
const IMG = path.join(ROOT, 'assets', 'img');
const OUT = path.join(IMG, 'baked');
const THR_BG = 240;   // nền trắng: mọi kênh lớn hơn mức này
const THR_AA = 236;   // viền anti-alias sát nền
const PAD = 6;        // lề giữ quanh bbox nhân vật
/* Sheet quái vật gen trên nền xanh đậm (#202A39) chứ không phải nền trắng.
   Với nền trắng, |kênh - 255| <= 14 tương đương đúng phép thử "> 240" cũ nên
   ảnh đường phố / nhân vật ra byte y hệt như trước. */
const THR_DK = 26, THR_DK_AA = 30;

/* ---------- đọc object literal trong js/assets.js ---------- */
function literal(src, name) {
  const at = src.indexOf('const ' + name + ' = {');
  if (at < 0) throw new Error('Không tìm thấy "const ' + name + ' = {" trong js/assets.js');
  let i = src.indexOf('{', at), depth = 0, text = '';
  const push = ch => { text += ch; };
  while (i < src.length) {
    const ch = src[i];
    if (ch === '"' || ch === "'" || ch === '`') {          // bỏ qua chuỗi
      push(ch); i++;
      while (i < src.length && src[i] !== ch) {
        if (src[i] === '\\') { push(src[i]); push(src[i + 1]); i += 2; continue; }
        push(src[i++]);
      }
      push(src[i++]); continue;
    }
    if (ch === '/' && src[i + 1] === '/') {                 // // comment
      while (i < src.length && src[i] !== '\n') push(src[i++]);
      continue;
    }
    if (ch === '/' && src[i + 1] === '*') {                 /* comment */
      push(src[i]); push(src[i + 1]); i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) push(src[i++]);
      push(src[i]); push(src[i + 1]); i += 2; continue;
    }
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    push(ch); i++;
    if (depth === 0) break;
  }
  return new Function('return ' + text)();
}

/* ---------- nạp ảnh nguồn (PNG hoặc JPEG) thành RGBA ---------- */
function readRGBA(file) {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32BE(0) === 0x89504e47) {
    const p = PNG.sync.read(buf);
    return { w: p.width, h: p.height, d: p.data, note: 'PNG', opaque: !hasAlpha(p.data) };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    const j = jpeg.decode(buf, { useTArray: true, toRGBA32: true });
    return { w: j.width, h: j.height, d: Buffer.from(j.data), note: 'JPEG', opaque: true };
  }
  throw new Error('Không nhận ra định dạng ảnh: ' + file);
}
/* pngjs không lộ colorType, nên hỏi thẳng dữ liệu: có pixel alpha nào không?
   Ảnh đã trong suốt thì KHÔNG được tẩy nền nữa — flood-fill sẽ ăn theo vùng
   alpha=0 và xoá luôn nét trắng của sprite chạm biên ô đó. */
function hasAlpha(d) {
  for (let i = 3; i < d.length; i += 4) if (d[i] < 255) return true;
  return false;
}

function writeRGBA(file, w, h, d) {
  const p = new PNG({ width: w, height: h });
  p.data = Buffer.from(d);
  fs.writeFileSync(file, PNG.sync.write(p));
}

/* ---------- tẩy nền ---------- */
/* Màu nền = trung vị 4 góc ảnh (JPEG lẫn nhiễu nên không lấy 1 pixel đơn). */
function bgCorners(im) {
  const s = [[0, 0], [im.w - 1, 0], [0, im.h - 1], [im.w - 1, im.h - 1]].map(([x, y]) => {
    const i = (y * im.w + x) * 4; return [im.d[i], im.d[i + 1], im.d[i + 2]];
  });
  return [0, 1, 2].map(c => s.map(p => p[c]).sort((a, b) => a - b)[1]);
}
function keyWhite(im, boxes) {
  const W = im.w, H = im.h, N = W * H, d = im.d;
  const BGc = bgCorners(im), isWhite = BGc.every(v => v > THR_BG - 1);
  const KEYC = isWhite ? [255, 255, 255] : BGc;
  const white = (i, thr) => {
    const t = thr === THR_BG ? (isWhite ? 14 : THR_DK) : (isWhite ? 18 : THR_DK_AA);
    return Math.abs(d[i * 4] - KEYC[0]) <= t &&
           Math.abs(d[i * 4 + 1] - KEYC[1]) <= t &&
           Math.abs(d[i * 4 + 2] - KEYC[2]) <= t;
  };
  const kill = new Uint8Array(N), q = new Int32Array(N);
  let head = 0, tail = 0;
  const seed = i => { if (!kill[i] && white(i, THR_BG)) { kill[i] = 1; q[tail++] = i; } };
  for (let x = 0; x < W; x++) { seed(x); seed((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { seed(y * W); seed(y * W + W - 1); }
  while (head < tail) {
    const i = q[head++], x = i % W;
    if (x > 0) seed(i - 1);
    if (x < W - 1) seed(i + 1);
    if (i >= W) seed(i - W);
    if (i < N - W) seed(i + W);
  }
  const flooded = tail;
  const fringe = [];
  for (let i = 0; i < N; i++) {
    if (!kill[i]) continue;
    const x = i % W;
    if (x > 0 && !kill[i - 1] && white(i - 1, THR_AA)) fringe.push(i - 1);
    if (x < W - 1 && !kill[i + 1] && white(i + 1, THR_AA)) fringe.push(i + 1);
    if (i >= W && !kill[i - W] && white(i - W, THR_AA)) fringe.push(i - W);
    if (i < N - W && !kill[i + W] && white(i + W, THR_AA)) fringe.push(i + W);
  }
  for (const i of fringe) kill[i] = 1;

  let pocketed = 0;
  for (const s of boxes.filter(b => b.pocket)) {
    const comp = new Int32Array(s.w * s.h), vis = new Uint8Array(s.w * s.h);
    for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) {
      const gi = (s.y + y) * W + s.x + x;
      if (kill[gi] || !white(gi, THR_BG) || vis[y * s.w + x]) continue;
      let n = 0, closed = true;
      vis[y * s.w + x] = 1; comp[n++] = gi;
      for (let h = 0; h < n; h++) {
        const i = comp[h], cx = i % W, cy = (i - cx) / W, bx = cx - s.x, by = cy - s.y;
        if (bx < 1 || by < 1 || bx >= s.w - 1 || by >= s.h - 1) closed = false;
        const nb = [bx > 0 ? i - 1 : -1, bx < s.w - 1 ? i + 1 : -1, by > 0 ? i - W : -1, by < s.h - 1 ? i + W : -1];
        for (const j of nb) {
          if (j < 0) continue;
          const vx = j % W - s.x, vy = ((j - j % W) / W) - s.y;
          if (vx < 0 || vy < 0 || vx >= s.w || vy >= s.h || vis[vy * s.w + vx]) continue;
          vis[vy * s.w + vx] = 1;
          if (kill[j] || !white(j, THR_BG)) continue;
          comp[n++] = j;
        }
      }
      if (closed) { pocketed += n; for (let h = 0; h < n; h++) kill[comp[h]] = 1; }
    }
  }

  for (let i = 0; i < N; i++) if (kill[i]) d[i * 4 + 3] = 0;

  // kiểm tra: trong ô cắt còn sót pixel trắng nào KHÔNG chủ ý không?
  const residual = [];
  for (const s of boxes) {
    let w = 0;
    for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) {
      const i = (s.y + y) * W + s.x + x;
      if (!kill[i] && white(i, THR_BG)) w++;
    }
    if (w) residual.push(s.name + ':' + w);
  }
  return { flooded, aa: fringe.length, pocketed, residual, bg: KEYC };
}

/* ---------- cắt theo bbox alpha ---------- */
function trimByAlpha(im) {
  const W = im.w, H = im.h, d = im.d;
  let a = W, b = H, e = -1, f = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (d[(y * W + x) * 4 + 3] > 16) { if (x < a) a = x; if (x > e) e = x; if (y < b) b = y; if (y > f) f = y; }
  }
  if (e < 0) return null;
  a = Math.max(0, a - PAD); b = Math.max(0, b - PAD);
  e = Math.min(W - 1, e + PAD); f = Math.min(H - 1, f + PAD);
  const w = e - a + 1, h = f - b + 1, out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) d.copy(out, y * w * 4, ((b + y) * W + a) * 4, ((b + y) * W + a + w) * 4);
  return { w, h, d: out, x: a, y: b };
}

/* ---------- chạy ---------- */
const src = fs.readFileSync(path.join(ROOT, 'js', 'assets.js'), 'utf8');
const ASSETS = literal(src, 'ASSETS');
const SHEET = literal(src, 'SHEET');
fs.mkdirSync(OUT, { recursive: true });
const lines = [];

const sheets = (() => {
  const groups = new Map();
  for (const [name, s] of Object.entries(SHEET)) {
    const key = s.sheet || (s.extra ? 'streetExtra' : 'street');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push([name, s]);
  }
  return [...groups].map(([key, boxes]) => ({ key, file: ASSETS[key], boxes }));
})();
for (const sh of sheets) {
  const from = path.join(IMG, path.basename(sh.file.split('?')[0]));
  const im = readRGBA(from);
  const st = keyWhite(im, sh.boxes.map(([name, s]) => ({ ...s, name })));
  const to = path.join(OUT, path.basename(from));
  writeRGBA(to, im.w, im.h, im.d);
  lines.push(
    `${sh.key.padEnd(12)} ${path.basename(from)} [${im.note} ${im.w}x${im.h}] -> baked/  ` +
    `nền=${JSON.stringify(st.bg)}  ` +
    `trong-suất=${st.flooded + st.aa}px (flood ${st.flooded} + AA ${st.aa})  ` +
    `pocket=${st.pocketed}px  ô-cắt=${sh.boxes.length}  trắng-còn-lại=[${st.residual.join(' ') || 'không'}]`
  );
}

for (const [k, p] of Object.entries(ASSETS.chars)) {
  /* Chỉ những ảnh game trỏ vào baked/ mới cần bake. Ảnh artist xuất sẵn có
     kênh alpha thật (vd sprite NỮ char_player_female.png) game nạp thẳng. */
  if (!p.includes('baked/')) continue;
  const from = path.join(IMG, path.basename(p));
  if (!fs.existsSync(from)) { lines.push(`char ${k.padEnd(7)} KHÔNG TÌM THẤY ${path.basename(from)} -> bỏ qua`); continue; }
  const im = readRGBA(from);
  /* Ảnh sprite mới gen nền trắng tinh (chưa có kênh alpha) thì tẩy nền trước
     khi cắt; ảnh đã có alpha sẵn thì giữ nguyên, không đụng pixel của nó. */
  const keyed = im.opaque ? keyWhite(im, []) : null;
  const t = trimByAlpha(im);
  const to = path.join(OUT, path.basename(from));
  if (!t) { fs.copyFileSync(from, to); lines.push(`char ${k.padEnd(7)} ảnh trống -> copy nguyên bản`); continue; }
  writeRGBA(to, t.w, t.h, t.d);
  lines.push(`char ${k.padEnd(7)} ${im.w}x${im.h} -> ${t.w}x${t.h} (góc ${t.x},${t.y})` +
    (keyed ? `  trong-suất=${keyed.flooded + keyed.aa}px  trắng-còn-lại=[${keyed.residual.join(' ') || 'không'}]` : ''));
}

console.log(lines.join('\n'));
console.log(`\nXong. Chạy lại sau khi đổi ảnh nguồn:  node tools/bake-sprites.cjs`);
