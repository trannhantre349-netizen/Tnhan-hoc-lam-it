#!/usr/bin/env node
/* ============================================================
   tools/bake-female-sprites.cjs — Sheet sprite NỮ 4 skin x 5 hướng
   Chạy một lần khi artist đổi ảnh nguồn:
       node tools/bake-female-sprites.cjs
   Nguồn  : assets/img/female_sprites.png  (JPEG đổi tên, 1024x765, nền xám
            trung tính 48-50 có lưới kẻ ô + dải tiêu đề trắng trên cùng)
   Đích   : assets/img/baked/female_sprites.png  750x712, 5 cột x 4 hàng,
            ô 150x178, nền trong suốt thật, bàn chân mọi ô nằm tại y=172.

   Vì sao phải bake: ảnh AI-gen không có kênh alpha; Chrome mở file:/// chặn
   getImageData nên việc tẩy nền bắt buộc làm ngoại tuyến (xem js/assets.js).

   Vì sao phải xếp lại thành lưới đều: 20 ô trong ảnh gốc có kích thước lệch
   nhau 157→171px (cái nơ trên đầu, mũ hoodie) và chân không cùng một đường.
   Render bằng lưới ô đều -> mọi frame dùng đúng một (dw, dh), nhân vật không
   nhảy kích thước khi đổi hướng hay đổi skin.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const jpeg = require('jpeg-js');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'assets', 'img', 'female_sprites.png');
const OUT = path.join(ROOT, 'assets', 'img', 'baked', 'female_sprites.png');
const DEBUG = process.argv.includes('--debug');

/* ----- lưới ô trên ảnh nguồn (đo bằng flood-fill, xem ghi chú dưới) -----
   Nội dung 20 nhân vật: cột 257..363 | 420..516 | 569..667 | 717..813 | 871..967
                        hàng 67..232 | 238..403 | 411..579 | 590..753
   Ranh giới đặt giữa các khoảng trống, mép trái 240 còn né phần chữ chú giải
   (kết thúc tại x=235), mép trên 66 còn né dải tiêu đề (kết thúc tại y=64). */
const XE = [240, 391, 542, 691, 842, 995];
const YE = [66, 234, 409, 584, 758];
const CW = 150, CH = 178, FOOT = 172;   // ô đích; FOOT = đường chân chung mọi ô

/* Nền = xám trung tính, ba kênh sát nhau, nằm trong dải sáng của nền ảnh.
   Ngưỡng dưới 40 giữ lại phần tóc/bóng tối của nhân vật (29,29,27) vì chúng
   không thông ra mép ô; ngưỡng trên 82 giữ chữ trắng và viền sáng. */
const BG_LO = 40, BG_HI = 82, BG_SPREAD = 10;
const AA_LO = 30, AA_HI = 95, AA_SPREAD = 12;   // nới 1px viền anti-alias

function readRGBA(f) {
  const buf = fs.readFileSync(f);
  if (buf.readUInt32BE(0) === 0x89504e47) { const p = PNG.sync.read(buf); return { w: p.width, h: p.height, d: p.data }; }
  if (buf[0] === 0xff && buf[1] === 0xd8) { const j = jpeg.decode(buf, { useTArray: true, toRGBA32: true }); return { w: j.width, h: j.height, d: Buffer.from(j.data) }; }
  throw new Error('định dạng ảnh lạ: ' + f);
}

const im = readRGBA(SRC);
const W = im.w, H = im.h, d = im.d;
console.log('nguồn ' + path.basename(SRC) + ' ' + W + 'x' + H);

const px = (x, y) => { const i = (y * W + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
const spread = c => Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]);
const maxc = c => Math.max(c[0], c[1], c[2]);
const isBg = (x, y) => { const c = px(x, y); return spread(c) <= BG_SPREAD && maxc(c) >= BG_LO && maxc(c) <= BG_HI; };
const isNearBg = (x, y) => { const c = px(x, y); return spread(c) <= AA_SPREAD && maxc(c) >= AA_LO && maxc(c) <= AA_HI; };

const out = new PNG({ width: CW * 5, height: CH * 4 });

/* Với từng ô nguồn: flood nền TỪ VIỀN CỦA Ô (không phải cả ảnh) -> phần còn
   lại nối thành cụm lớn nhất chính là nhân vật; chữ chú giải và vệt lưới rời
   rã bị loại vì không phải cụm to nhất. */
let placed = 0;
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 5; c++) {
    const x0 = XE[c], x1 = XE[c + 1], y0 = YE[r], y1 = YE[r + 1];
    const aw = x1 - x0, ah = y1 - y0, an = aw * ah;
    const bg = new Uint8Array(an), q = new Int32Array(an);
    let head = 0, tail = 0;
    const seed = i => { if (!bg[i] && isBg(x0 + i % aw, y0 + ((i - i % aw) / aw))) { bg[i] = 1; q[tail++] = i; } };
    for (let x = 0; x < aw; x++) { seed(x); seed((ah - 1) * aw + x); }
    for (let y = 0; y < ah; y++) { seed(y * aw); seed(y * aw + aw - 1); }
    while (head < tail) {
      const i = q[head++], x = i % aw;
      if (x > 0) seed(i - 1);
      if (x < aw - 1) seed(i + 1);
      if (i >= aw) seed(i - aw);
      if (i < an - aw) seed(i + aw);
    }
    /* nới 1px: pixel sát vùng nền mà vẫn gần màu nền -> coi là nền, cắt viền xám */
    const aa = Uint8Array.from(bg);
    for (let i = 0; i < an; i++) {
      if (!bg[i]) continue;
      const x = i % aw;
      const nb = [];
      if (x > 0) nb.push(i - 1);
      if (x < aw - 1) nb.push(i + 1);
      if (i >= aw) nb.push(i - aw);
      if (i < an - aw) nb.push(i + aw);
      for (const n of nb) if (!bg[n] && isNearBg(x0 + n % aw, y0 + ((n - n % aw) / aw))) aa[n] = 1;
    }

    /* cụm lớn nhất trong ô */
    const lab = new Int32Array(an).fill(-1), st = new Int32Array(an);
    let best = null, id = 0;
    for (let i = 0; i < an; i++) {
      if (aa[i] || lab[i] >= 0) continue;
      const cid = id++;
      let sp = 0, n = 0, bx0 = aw, by0 = ah, bx1 = -1, by1 = -1;
      st[sp++] = i; lab[i] = cid;
      while (sp) {
        const p = st[--sp], x = p % aw, y = (p - x) / aw;
        n++;
        if (x < bx0) bx0 = x; if (x > bx1) bx1 = x;
        if (y < by0) by0 = y; if (y > by1) by1 = y;
        const nb = [];
        if (x > 0) nb.push(p - 1);
        if (x < aw - 1) nb.push(p + 1);
        if (p >= aw) nb.push(p - aw);
        if (p < an - aw) nb.push(p + aw);
        for (const q2 of nb) if (!aa[q2] && lab[q2] < 0) { lab[q2] = cid; st[sp++] = q2; }
      }
      if (!best || n > best.n) best = { n, bx0, by0, bx1, by1, cid };
    }
    if (!best || best.n < 3000) { console.error('  Ô hàng ' + r + ' cột ' + c + ' KHÔNG tìm thấy nhân vật (px=' + (best ? best.n : 0) + ')'); process.exit(1); }

    const cwid = best.bx1 - best.bx0 + 1, chgt = best.by1 - best.by0 + 1;
    const dx = Math.round((CW - cwid) / 2) - best.bx0;      // căn giữa theo trục người
    const dy = FOOT - best.by1 - 1;                          // đáy cụm (chân) đặt tại FOOT
    let copied = 0;
    for (let y = 0; y < ah; y++) {
      for (let x = 0; x < aw; x++) {
        const i = y * aw + x;
        if (aa[i] || lab[i] !== best.cid) continue;
        const ox = c * CW + x + dx, oy = r * CH + y + dy;
        if (ox < 0 || ox >= out.width || oy < 0 || oy >= out.height) continue;
        const s = px(x0 + x, y0 + y), o = (oy * out.width + ox) * 4;
        out.data[o] = s[0]; out.data[o + 1] = s[1]; out.data[o + 2] = s[2]; out.data[o + 3] = 255;
        copied++;
      }
    }
    placed++;
    console.log('  r' + r + 'c' + c + ' nguồn x=' + (x0 + best.bx0) + ' y=' + (y0 + best.by0) + ' w=' + cwid + ' h=' + chgt +
      ' px=' + best.n + ' -> ô x=' + (c * CW) + ' y=' + (r * CH) + ' (đè ' + copied + 'px)');
  }
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, PNG.sync.write(out));
console.log('đã ghi ' + path.relative(ROOT, OUT) + ' ' + out.width + 'x' + out.height + ' (' + placed + ' ô)');

if (DEBUG) {
  /* ghép lên nền hồng để mắt thường thấy ngay chỗ bị lem / bị cắt */
  const dbg = new PNG({ width: out.width, height: out.height });
  for (let i = 0; i < out.width * out.height; i++) {
    const a = out.data[i * 4 + 3] / 255;
    dbg.data[i * 4] = Math.round(255 * a + 255 * (1 - a));
    dbg.data[i * 4 + 1] = Math.round(40 * a + 0 * (1 - a));
    dbg.data[i * 4 + 2] = Math.round(180 * a + 255 * (1 - a));
    dbg.data[i * 4 + 3] = 255;
  }
  const p = path.join(ROOT, 'tmp', 'fem_baked_debug.png');
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, PNG.sync.write(dbg));
  console.log('ảnh kiểm tra: tmp/fem_baked_debug.png');
}
