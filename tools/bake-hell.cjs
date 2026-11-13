#!/usr/bin/env node
/* ============================================================
   tools/bake-hell.cjs — V36 KHU 6 ĐỊA NGỤC TRẦN NHÂN
   Chạy một lần khi artist đổi ảnh nguồn:
       node tools/bake-hell.cjs
       node tools/bake-hell.cjs --debug   ( ảnh ghép nền hồng để mắt thường soi )

   Nguồn (assets/img/, đều là WebP lossy đổi tên .png — 1024x572, nền trắng):
     demon_players_sheet.png  lưới 5 cột x 2 hàng (hàng 0 Quỷ Nam, 1 Quỷ Nữ)
     hell_npcs_sheet.png      lưới 4 cột x 2 hàng (Ma Trơi, Tiểu Quỷ / Quỷ Vương, Vạc)
     hell_st1..5.png          5 TRẠM IT SUPPORT ÂM PHỦ (V41), mỗi trạm một ảnh
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
     hell_st1..5.png       5 trạm, GIỮ NGUYÊN khổ ảnh nguồn (không cắt ô, không
                           dời cụm) — hell.js tự neo ĐÁY ảnh xuống mặt sàn và
                           tự co theo chiều cao trạm. Xem bakeFlat() bên dưới.

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

/* ---------- 4. TRẠM ÂM PHỦ: tẩy nền trắng TOÀN ẢNH, GIỮ NGUYÊN KHUNG ----------
   Khác hai sheet ở trên (cắt ô rồi dời cụm lớn nhất vào giữa), 5 trạm
   hell_st1..5 PHẢI giữ đúng bố cục Artist vẽ — mạch ảnh, dây cáp, nhân vật
   trong trạm nằm so le nhau, dời về tâm ô là hỏng hết cảnh. Nên ảnh ra cùng
   khổ ảnh nguồn, chỉ kênh alpha đổi. Flood-fill chạy trên cả ảnh: seed đúng
   4 biên, feather 2px y hệt hai sheet.
   SCRIPT IN ra "nền trắng còn sót" = số pixel đặc mà vẫn gần trắng. Nếu con
   số này lớn và nằm KÍN trong nét vẽ (không thông ra biên) thì đó là nền thật
   bị kẹt — ví dụ khoảng trống giữa các vòng dây cáp trạm 1. Với loại này ta
   truyền pocketMin > 0: tẩy thêm mọi cụm trắng thuần có diện tích >= pocketMin
   mà flood-fill biên không với tới.
   CHIỀU NGƯỢC: trạm 4 có đĩa hào quang trắng tinh quanh server, trạm 2 có quầng
   đèn lồng — đó là NÉT VẼ thật, truyền pocketMin (hoặc truyền 0) là thủng hiệu
   ứng, nên hai trạm đó để mặc định. */
async function bakeFlat(srcRel, outRel, pocketMin) {
  const src = path.join(ROOT, srcRel), out = path.join(ROOT, outRel);
  const im = await readRGBA(src);
  const W = im.w, H = im.h, d = im.d;
  const cut = cutCell(im, 0, 0, W, H);

  /* Nhãn cụm trắng thuần CHƯA bị flood-fill biên với tới = nền kẹt trong nét. */
  const kill = new Uint8Array(W * H);
  let killed = 0;
  const pockets = [];
  if (pocketMin > 0) {
    const isW = (i) => {
      const o = i * 4, r = d[o], g = d[o + 1], b = d[o + 2];
      return Math.min(r, g, b) >= WHITE_MIN && (255 - r) + (255 - g) + (255 - b) <= WHITE_SUM;
    };
    const seen = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) {
      if (cut.bg[i] || !isW(i) || seen[i]) continue;
      const comp = [];
      let n = 0, px0 = W, py0 = H, px1 = -1, py1 = -1;
      comp.push(i); seen[i] = 1;
      for (let h = 0; h < comp.length; h++) {
        const p = comp[h], x = p % W, y = (p - x) / W;
        n++;
        if (x < px0) px0 = x; if (x > px1) px1 = x;
        if (y < py0) py0 = y; if (y > py1) py1 = y;
        const nb = [];
        if (x > 0) nb.push(p - 1);
        if (x < W - 1) nb.push(p + 1);
        if (p >= W) nb.push(p - W);
        if (p < W * H - W) nb.push(p + W);
        for (const q2 of nb) if (!cut.bg[q2] && !seen[q2] && isW(q2)) { seen[q2] = 1; comp.push(q2); }
      }
      if (n >= pocketMin) {
        pockets.push(n + '@' + px0 + ',' + py0 + ' ' + (px1 - px0 + 1) + 'x' + (py1 - py0 + 1));
        killed += n;
        for (const p of comp) kill[p] = 1;
      }
    }
  }

  const png = new PNG({ width: W, height: H });
  let op = 0, pocket = 0, bx0 = W, by0 = H, bx1 = -1, by1 = -1;
  for (let i = 0; i < W * H; i++) {
    if (cut.bg[i] || kill[i]) continue;
    const o = i * 4;
    const a = cut.keep[i] > 0 ? cut.keep[i] : 255;
    png.data[o] = d[o]; png.data[o + 1] = d[o + 1]; png.data[o + 2] = d[o + 2]; png.data[o + 3] = a;
    op++;
    const x = i % W, y = (i - x) / W;
    if (x < bx0) bx0 = x; if (x > bx1) bx1 = x;
    if (y < by0) by0 = y; if (y > by1) by1 = y;
    const mn = Math.min(d[o], d[o + 1], d[o + 2]);
    if (a === 255 && mn >= WHITE_MIN && (255 - d[o]) + (255 - d[o + 1]) + (255 - d[o + 2]) <= WHITE_SUM) pocket++;
  }
  if (!op) { console.error('  ' + path.basename(srcRel) + ': KHÔNG có nét nào — ảnh trắng toàn bộ'); process.exit(1); }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, PNG.sync.write(png, { deflateLevel: 9 }));
  console.log('\n' + path.basename(srcRel) + ' ' + W + 'x' + H + ' -> ' + path.relative(ROOT, out));
  console.log('  đặc ' + op + ' px (' + (100 * op / (W * H)).toFixed(1) + '% ảnh) · bbox ' +
    (bx1 - bx0 + 1) + 'x' + (by1 - by0 + 1) + ' @(' + bx0 + ',' + by0 + ')' +
    ' · trắng sót ' + pocket + ' px (' + (100 * pocket / op).toFixed(2) + '% nét)');
  if (pocketMin > 0) console.log('  tẩy nền kẹt ' + killed + ' px' +
    (pockets.length ? ' — ' + pockets.join(' | ') : ' (không cụm nào >= ' + pocketMin + ' px)'));
  if (DEBUG) {
    const p = path.join(ROOT, 'tmp', 'hell', path.basename(outRel).replace('.png', '_debug.png'));
    fs.mkdirSync(path.dirname(p), { recursive: true });
    const dbg = new PNG({ width: W, height: H });
    for (let i = 0; i < W * H; i++) {
      const a = png.data[i * 4 + 3] / 255;
      dbg.data[i * 4] = Math.round(png.data[i * 4] * a + 255 * (1 - a));
      dbg.data[i * 4 + 1] = Math.round(png.data[i * 4 + 1] * a);
      dbg.data[i * 4 + 2] = Math.round(png.data[i * 4 + 2] * a + 255 * (1 - a));
      dbg.data[i * 4 + 3] = 255;
    }
    fs.writeFileSync(p, PNG.sync.write(dbg));
    console.log('  ảnh soi: ' + path.relative(ROOT, p));
  }
}

/* ---------- 5. V44: 5 QUỶ GIAO VIỆC (hell_job_npcs.png) ----------
   Ảnh nguồn 1024x434 có 5 nhân vật KHÔNG cách đều (khe trắng giữa 2 con chỉ
   4px, con 1 rộng 220px) nên chia lưới đều 5 cột sẽ cắt cụt con số 1 và 5.
   Vì vậy cắt theo DẢI CỘT đo từ profile mực (biên đặt giữa khe hẹp nhất),
   còn ẢNH RA vẫn đúng yêu cầu: lưới đều 5 cột x 1 hàng, neo đáy chân.
   Khác bake(): lấy bbox HỢP NHẤT mọi nét đặc trong dải thay vì cụm to nhất,
   để sừng / đuôi / vũ khí rời khỏi thân không bị bỏ lại ngoài ô.
   hell.js phải biết kích thước NÉT của từng ô để co về chiều cao mong muốn
   mà không lệch chân, nên hàm này in bảng "cN nét WxH" — chép vào HL_JINK. */
async function bakeCells(srcRel, outRel, xbands, CW, CH, foot) {
  const src = path.join(ROOT, srcRel), out = path.join(ROOT, outRel);
  const im = await readRGBA(src);
  const W = im.w, H = im.h;
  const png = new PNG({ width: CW * xbands.length, height: CH });
  const lines = [];
  for (let c = 0; c < xbands.length; c++) {
    const x0 = xbands[c][0], cw = xbands[c][1] - x0 + 1;
    const cut = cutCell(im, x0, 0, cw, H);
    let bx0 = cw, bx1 = -1, by0 = H, by1 = -1, n = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < cw; x++) {
      if (cut.bg[y * cw + x]) continue;
      n++;
      if (x < bx0) bx0 = x; if (x > bx1) bx1 = x;
      if (y < by0) by0 = y; if (y > by1) by1 = y;
    }
    if (!n) { console.error('  Ô ' + c + ' trắng toàn bộ — sai dải cột?'); process.exit(1); }
    const lay = makeLayer(im, x0, 0, cw, H, cut);
    const g = blitCell(png, c * CW, 0, CW, CH, foot, lay, cw, H, { bx0, by0, bx1, by1 }, 0);
    lines.push('  c' + c + ' nét ' + g.dw + 'x' + g.dh + '  (nguồn ' + (bx1 - bx0 + 1) + 'x' +
      (by1 - by0 + 1) + ' @' + (x0 + bx0) + ',' + by0 + ') px=' + n);
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, PNG.sync.write(png, { deflateLevel: 9 }));
  console.log('\n' + path.basename(src) + ' ' + W + 'x' + H + ' -> ' + path.relative(ROOT, out) +
    '  lưới đều ' + xbands.length + ' cột ô ' + CW + 'x' + CH + ' chân=' + foot);
  console.log(lines.join('\n'));
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
  /* V41: 5 TRẠM IT SUPPORT ÂM PHỦ — ảnh rời, giữ nguyên khổ, chỉ tẩy nền trắng.
     pocketMin=1 riêng trạm 1: nền trắng kẹt trong các vòng dây cáp dưới gầm bàn.
     V48:hell_st6 là Cổng TƯỜNG LỬA của Trạm 5 — cùng quy tắc, vẽ bằng IMG.hellSt6
     thay cho khung chữ nhật vector tạm trong js/hell.js. */
  for (let i = 1; i <= 6; i++)
    await bakeFlat('assets/img/hell_st' + i + '.png', 'assets/img/baked/hell_st' + i + '.png', i === 1 ? 1 : 0);
  /* V43: CỔNG VÀO ĐỊA NGỤC ở cuối Phố Ngoài — cùng quy tắc bakeFlat (giữ nguyên
     khổ, chỉ đổi kênh alpha). hell.js neo ĐÁY bbox xuống mặt sàn vỉa hè nên chỉ
     cần chép bbox log này in ra vào HL_GATE.box. */
  await bakeFlat('assets/img/hell_gate.png', 'assets/img/baked/hell_gate.png', 0);
  /* V44: 5 QUỶ GIAO VIỆC đứng cạnh 5 trạm Âm Phủ — dải cột đo bằng profile mực
     (tools/_inspect_job.cjs), ô 224x304 vì nét to nhất 220x295. */
  await bakeCells('assets/img/hell_job_npcs.png', 'assets/img/baked/hell_job_npcs.png',
    [[0, 254], [255, 408], [409, 613], [614, 800], [801, 1023]], 224, 304, 300);
  /* V45: CỔNG LÊN THIÊN ĐÀNG ở Khu Trung Tâm — cùng quy tắc bakeFlat như cổng
     hell_gate: giữ nguyên khổ, flood-fill nền trắng từ 4 biên + feather 2px.
     Nguồn là WebP lossless mang đuôi .png nên đi qua readRGBA (wasm).
     heaven.js neo ĐÁY bbox xuống mặt đất, vì vậy bbox in ra ở đây là số liệu
     duy nhất cần chép vào HG_GATE_BOX. */
  await bakeFlat('assets/img/heaven_gate.png', 'assets/img/baked/heaven_gate.png', 0);
  /* V47: 4 TRẠM CÔNG NGHỆ XU HƯỚNG mới (Kiểm Duyệt AI · Thợ Săn Scam · Tường
     Lửa DDoS · Xoay Mạch Định Tuyến) — cùng quy tắc bakeFlat: giữ nguyên khổ
     1024x1024, flood-fill nền trắng từ 4 biên + feather 2px. Nguồn là WebP
     VP8X mang đuôi .png nên đi qua readRGBA (wasm). mg-trends.js neo ĐÁY bbox
     xuống mặt đất nên bbox in ra ở đây là số liệu phải chép vào MGT_BOX. */
  for (const k of ['ai_audit', 'antiscam', 'firewall', 'routing'])
    await bakeFlat('assets/img/station_' + k + '.png', 'assets/img/baked/station_' + k + '.png', 0);
  const bg = await readRGBA(path.join(ROOT, 'assets/img/hell_bg.png'));
  const bgPng = new PNG({ width: bg.w, height: bg.h });
  bgPng.data = Buffer.from(bg.d);
  const bgOut = path.join(ROOT, 'assets/img/baked/hell_bg.png');
  fs.mkdirSync(path.dirname(bgOut), { recursive: true });
  fs.writeFileSync(bgOut, PNG.sync.write(bgPng, { deflateLevel: 9 }));
  console.log('\nđã ghi ' + path.relative(ROOT, bgOut) + ' ' + bg.w + 'x' + bg.h + ' (nền, giữ nguyên)');
})().catch(e => { console.error('LỖI: ' + e.stack); process.exit(1); });
