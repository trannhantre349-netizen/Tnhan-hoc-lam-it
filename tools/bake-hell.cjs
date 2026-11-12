#!/usr/bin/env node
/* ============================================================
   tools/bake-hell.cjs — V36 KHU 6 ĐỊA NGỤC TRẦN NHÂN
   Chạy một lần khi artist đổi ảnh nguồn:
       node tools/bake-hell.cjs
       node tools/bake-hell.cjs --debug   ( ảnh ghép nền hồng để mắt thường soi )

   Nguồn (assets/img/, đều là WebP lossy đổi tên .png — 1024x572, nền trắng):
     demon_players_sheet.png  lưới 5 cột x 2 hàng (hàng 0 Quỷ Nam, 1 Quỷ Nữ)
     hell_npcs_sheet.png      lưới 4 cột x 2 hàng (Ma Trơi, Tiểu Quỷ / Quỷ Vương, Vạc)
   Đích (assets/img/baked/):
     hell_demon_sheet.png  750x356, ô 150x178 — ĐÚNG BẰNG grid của sheet người
                           (baked/male_sprites.png) nên skins.js vẽ bằng cùng
                           công thức SK_GEO, chỉ khác HÀNG. Bàn chân mọi ô nằm
                           tại dòng 171 (FOOT=172), thân cao 158px như người thường.
     hell_npcs.png         1024x572, ô 256x286 giữ nguyên tỉ lệ gốc, căn giữa
                           trục x và neo đáy tại dòng 278 để hell.js tự co theo
                           từng loại mà không lệch chân.
     hell_bg.png           1024x572, nền Địa Ngục chuyển từ WebP sang PNG thật
                           để offline/PWA đọc được và không lem thêm khi vẽ.

   Node không có bộ giải mã WebP builtin, nên ảnh RIFF/WEBP đi qua wasm của
   @jsquash/webp (devDependency trong tools/, không nằm trong gói game).
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const jpeg = require('jpeg-js');

const ROOT = path.join(__dirname, '..');
const DEBUG = process.argv.includes('--debug');

/* Nền trắng đóng gói: ba kênh đều rất sáng VÀ tổng lệch trắng nhỏ. Ngưỡng
   rộng vì nguồn là WebP lossy — quầng nén quanh tóc/sừng lem tới 240+. */
const WHITE_MIN = 205, WHITE_SUM = 150;
const SOFT = 2, SOFT_K = 255 / 60;

async function readRGBA(f) {
  const buf = fs.readFileSync(f);
  if (buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP') {
    const mod = await import('@jsquash/webp/decode.js');
    const wasmPath = path.join(__dirname, 'node_modules', '@jsquash', 'webp', 'codec', 'dec', 'webp_dec.wasm');
    await mod.init(new WebAssembly.Module(fs.readFileSync(wasmPath)));
    const img = await mod.default(buf);
    return { w: img.width, h: img.height, d: Buffer.from(img.data) };
  }
  if (buf.readUInt32BE(0) === 0x89504e47) { const p = PNG.sync.read(buf); return { w: p.width, h: p.height, d: p.data }; }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    const j = jpeg.decode(buf, { useTArray: true, toRGBA32: true });
    return { w: j.width, h: j.height, d: Buffer.from(j.data) };
  }
  throw new Error('định dạng ảnh lạ: ' + f);
}

/* ---------- 1. Tẩy nền: flood-fill từ 4 biên của TỪNG Ô + làm mịn viền 2px ----------
   Seed theo ô (không theo cả ảnh) để quầng trắng giữa hai nhân vật không
   thông được sang nhau. */
function cutCell(im, x0, y0, cw, ch) {
  const W = im.w, d = im.d;
  const isWhite = (x, y) => {
    const i = (y * W + x) * 4, r = d[i], g = d[i + 1], b = d[i + 2];
    return Math.min(r, g, b) >= WHITE_MIN && (255 - r) + (255 - g) + (255 - b) <= WHITE_SUM;
  };
  const n = cw * ch, bg = new Uint8Array(n), keep = new Uint8Array(n), q = new Int32Array(n);
  let head = 0, tail = 0;
  const seed = (i) => {
    if (bg[i]) return;
    if (isWhite(x0 + i % cw, y0 + ((i - i % cw) / cw))) { bg[i] = 1; q[tail++] = i; }
  };
  for (let x = 0; x < cw; x++) { seed(x); seed((ch - 1) * cw + x); }
  for (let y = 0; y < ch; y++) { seed(y * cw); seed(y * cw + cw - 1); }
  while (head < tail) {
    const i = q[head++], x = i % cw;
    if (x > 0) seed(i - 1);
    if (x < cw - 1) seed(i + 1);
    if (i >= cw) seed(i - cw);
    if (i < n - cw) seed(i + cw);
  }
  /* Hai vòng kề nền: alpha tỉ lệ với độ lệch trắng -> viền mờ dần thay vì cắt
     răng cưa. keep=0 nghĩa là nét đặc (alpha 255 ở bước sau). Vòng sau được
     tính từ nền GỐC cộng vòng feather trước, nhưng pixel feather không bao giờ
     bị đánh lại thành nền nên makeLayer() vẫn đọc được alpha của nó. */
  const seen = Uint8Array.from(bg);
  for (let ring = 0; ring < SOFT; ring++) {
    const frontier = [];
    for (let i = 0; i < n; i++) {
      if (seen[i]) continue;
      const x = i % cw;
      let adj = false;
      if (x > 0 && (bg[i - 1] || keep[i - 1])) adj = true;
      if (!adj && x < cw - 1 && (bg[i + 1] || keep[i + 1])) adj = true;
      if (!adj && i >= cw && (bg[i - cw] || keep[i - cw])) adj = true;
      if (!adj && i < n - cw && (bg[i + cw] || keep[i + cw])) adj = true;
      if (adj) frontier.push(i);
    }
    for (const i of frontier) {
      const s = (y0 + ((i - i % cw) / cw)) * W + (x0 + i % cw);
      const mn = Math.min(d[s * 4], d[s * 4 + 1], d[s * 4 + 2]);
      keep[i] = Math.min(255, Math.max(keep[i], Math.round((255 - mn) * SOFT_K)));
      seen[i] = 1;
    }
  }
  return { bg, keep };
}

/* ---------- 2. Cụm lớn nhất trong ô = nhân vật (bỏ nhãn chữ, vệt nén rời) ---------- */
function biggestBlob(cut, cw, ch) {
  const { bg, keep } = cut;
  const lab = new Int32Array(cw * ch).fill(-1), st = new Int32Array(cw * ch);
  let best = null, id = 0;
  for (let i = 0; i < cw * ch; i++) {
    if (bg[i] || keep[i] || lab[i] >= 0) continue;
    const cid = id++;
    let sp = 0, n = 0, bx0 = cw, by0 = ch, bx1 = -1, by1 = -1;
    st[sp++] = i; lab[i] = cid;
    while (sp) {
      const p = st[--sp], x = p % cw, y = (p - x) / cw;
      n++;
      if (x < bx0) bx0 = x; if (x > bx1) bx1 = x;
      if (y < by0) by0 = y; if (y > by1) by1 = y;
      const nb = [];
      if (x > 0) nb.push(p - 1);
      if (x < cw - 1) nb.push(p + 1);
      if (p >= cw) nb.push(p - cw);
      if (p < cw * ch - cw) nb.push(p + cw);
      for (const q2 of nb) if (!bg[q2] && lab[q2] < 0) { lab[q2] = cid; st[sp++] = q2; }
    }
    if (!best || n > best.n) best = { n, bx0, by0, bx1, by1, cid };
  }
  return best;
}

/* Lớp RGBA của ô: màu nguyên bản, alpha = 255 cho nét đặc, = mức feather cho
   viền sát nền. PHẢI cộng (x0,y0) khi đọc nguồn — cutCell trả mặt nạ theo ô
   nhưng bộ nhớ đệm layer chỉ rộng cw×ch, nên thiếu offset là mọi ô bị tô bằng
   màu của ô (0,0) (bài học 2026-11-12: Quỷ Vương + Tiểu Quỷ ra bóng xanh lơ
   Ma Trơi, còn nền trắng của ô gốc biến thành thân trắng viền dày). */
function makeLayer(im, x0, y0, cw, ch, cut) {
  const W = im.w, d = im.d;
  const lay = new Float64Array(cw * ch * 4);
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    const i = y * cw + x, o = i * 4, s = ((y0 + y) * W + (x0 + x)) * 4;
    if (cut.bg[i]) continue;
    lay[o] = d[s]; lay[o + 1] = d[s + 1]; lay[o + 2] = d[s + 2];
    lay[o + 3] = cut.keep[i] > 0 ? cut.keep[i] : 255;
  }
  return lay;
}

function sample(lay, cw, ch, fx, fy) {
  const x = Math.max(0, Math.min(cw - 1.001, fx)), y = Math.max(0, Math.min(ch - 1.001, fy));
  const x0 = x | 0, y0 = y | 0, tx = x - x0, ty = y - y0;
  const at = (px, py) => { const o = (py * cw + px) * 4; return [lay[o], lay[o + 1], lay[o + 2], lay[o + 3]]; };
  const a = at(x0, y0), b = at(x0 + 1, y0), c = at(x0, y0 + 1), e = at(x0 + 1, y0 + 1);
  const out = [0, 0, 0, 0];
  for (let k = 0; k < 4; k++) out[k] = (a[k] * (1 - tx) + b[k] * tx) * (1 - ty) + (c[k] * (1 - tx) + e[k] * tx) * ty;
  return out;
}

/* ---------- 3. Thu phóng NGƯỢC theo alpha tiên nhân ----------
   Vét nguồn chưa nhân alpha rồi nội suy sẽ viền xám quanh sừng/đuôi, nên mọi
   mẫu ảnh đều nhân màu với alpha trước khi cộng, và chia lại sau khi ghi. */
function blitCell(out, cellX, cellY, CW, CH, foot, lay, cw, ch, blob, fitH) {
  const sw = blob.bx1 - blob.bx0 + 1, sh = blob.by1 - blob.by0 + 1;
  const k = fitH ? fitH / sh : 1;
  const dw = Math.max(1, Math.round(sw * k)), dh = Math.max(1, Math.round(sh * k));
  const tlX = Math.round((CW - dw) / 2), tlY = foot - 1 - (dh - 1);
  for (let dy = 0; dy < dh; dy++) {
    for (let dx = 0; dx < dw; dx++) {
      const gx = tlX + dx, gy = tlY + dy;
      if (gx < 0 || gx >= CW || gy < 0 || gy >= CH) continue;
      const s = sample(lay, cw, ch, blob.bx0 + (dx + 0.5) / k, blob.by0 + (dy + 0.5) / k);
      const al = s[3] / 255;
      if (al <= 0.004) continue;
      const o = ((cellY + gy) * out.width + (cellX + gx)) * 4;
      const da = out.data[o + 3] / 255, na = al + da * (1 - al);
      for (let c = 0; c < 3; c++) {
        const src = s[c] * al, dst = out.data[o + c] * da;
        out.data[o + c] = na > 0 ? Math.round((src + dst) / na) : 0;
      }
      out.data[o + 3] = Math.round(na * 255);
    }
  }
  return { dw, dh };
}

async function bake(srcRel, outRel, cols, rows, CW, CH, foot, fitH, minPx) {
  const src = path.join(ROOT, srcRel), out = path.join(ROOT, outRel);
  const im = await readRGBA(src);
  const W = im.w, H = im.h;
  console.log('\n' + path.basename(src) + ' ' + W + 'x' + H + ' -> ' + path.basename(outRel) +
    '  lưới ' + cols + 'x' + rows + ' ô ' + CW + 'x' + CH);
  const png = new PNG({ width: CW * cols, height: CH * rows });
  const lines = [];
  for (let r = 0; r < rows; r++) {
    const y0 = Math.round(r * H / rows), ch = Math.round((r + 1) * H / rows) - y0;
    for (let c = 0; c < cols; c++) {
      const x0 = Math.round(c * W / cols), cw = Math.round((c + 1) * W / cols) - x0;
      const cut = cutCell(im, x0, y0, cw, ch);
      const blob = biggestBlob(cut, cw, ch);
      if (!blob || blob.n < minPx) {
        console.error('  Ô r' + r + 'c' + c + ' KHÔNG thấy nhân vật (px=' + (blob ? blob.n : 0) + ')');
        process.exit(1);
      }
      const lay = makeLayer(im, x0, y0, cw, ch, cut);
      const g = blitCell(png, c * CW, r * CH, CW, CH, foot, lay, cw, ch, blob, fitH);
      lines.push(`r${r}c${c} nguồn ${blob.bx1 - blob.bx0 + 1}x${blob.by1 - blob.by0 + 1} px=${blob.n} -> ${g.dw}x${g.dh} @đáy${foot - 1}`);
    }
  }
  console.log(lines.map(s => '  ' + s).join('\n'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, PNG.sync.write(png, { deflateLevel: 9 }));
  console.log('  đã ghi ' + path.relative(ROOT, out) + ' ' + png.width + 'x' + png.height);
  if (DEBUG) {
    const p = path.join(ROOT, 'tmp', 'hell', path.basename(outRel).replace('.png', '_debug.png'));
    fs.mkdirSync(path.dirname(p), { recursive: true });
    const dbg = new PNG({ width: png.width, height: png.height });
    for (let i = 0; i < png.width * png.height; i++) {
      const a = png.data[i * 4 + 3] / 255;
      dbg.data[i * 4] = Math.round(255 * a + 255 * (1 - a));
      dbg.data[i * 4 + 1] = Math.round(40 * a);
      dbg.data[i * 4 + 2] = Math.round(180 * a + 255 * (1 - a));
      dbg.data[i * 4 + 3] = 255;
    }
    fs.writeFileSync(p, PNG.sync.write(dbg));
    console.log('  ảnh soi: ' + path.relative(ROOT, p));
  }
}

(async () => {
  /* fitH=158 đúng bằng SK_GEO.BODY của sheet người -> Quỷ cao ngang người,
     skSheetChibi() không phải đổi một con số nào. */
  await bake('assets/img/demon_players_sheet.png', 'assets/img/baked/hell_demon_sheet.png',
    5, 2, 150, 178, 172, 158, 4000);
  /* Ô NPC giữ nguyên tỉ lệ gốc (fitH=0) — hell.js tự co theo từng loại. */
  await bake('assets/img/hell_npcs_sheet.png', 'assets/img/baked/hell_npcs.png',
    4, 2, 256, 286, 278, 0, 2500);
  const bg = await readRGBA(path.join(ROOT, 'assets/img/hell_bg.png'));
  const bgPng = new PNG({ width: bg.w, height: bg.h });
  bgPng.data = Buffer.from(bg.d);
  const bgOut = path.join(ROOT, 'assets/img/baked/hell_bg.png');
  fs.mkdirSync(path.dirname(bgOut), { recursive: true });
  fs.writeFileSync(bgOut, PNG.sync.write(bgPng, { deflateLevel: 9 }));
  console.log('\nđã ghi ' + path.relative(ROOT, bgOut) + ' ' + bg.w + 'x' + bg.h + ' (nền, giữ nguyên)');
})().catch(e => { console.error('LỖI: ' + e.stack); process.exit(1); });
