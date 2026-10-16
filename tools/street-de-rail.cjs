/* tools/street-de-rail.cjs — gỡ 2 dải hộ lan khỏi ảnh nền Phố Ngoài
   (assets/img/street_bg_clean.png — JPEG đổi đuôi .png, 1024x572).

   Hộ lan A (trên vỉa hè, nguồn y 324..348 → trong game dst 290..338):
     xoá 3 đoạn thanh kim loại (đo từ viền mũ tròn: 219..423, 516..721,
     886..1023) rồi lát lại gạch bằng bản sao dải gạch sạch ngay phía
     trên (y-28), kéo lệch ngang --dxA cho khớp mạch chéo. Dải bê tông
     mép vỉa hè (349..354) chuẩn hoá về màu cột sạch tham chiếu.

   Hộ lan B (ven bãi cỏ, nguồn y 435..467 → trong game dst 447..458):
     chân trụ tại 10 cột x đã đo (vệt xám trong cỏ) nhổ trước bằng cỏ
     sạch bên cạnh; thanh hộ lan (435..455) đùn nhựa đường xuống;
     dải chuyển tiếp cỏ (460..467) dịch lên thay phần chân còn lại.

   Chạy khô (chỉ xuất preview):  node tools/street-de-rail.cjs --dry [--dxA=-42] [--tag=a-42]
   Ghi đè ảnh thật:              node tools/street-de-rail.cjs --write --dxA=-42
   (chạy từ gốc repo; module jpeg/png nạp từ tools/node_modules) */
const fs = require('fs'), path = require('path');
const jpeg = require(path.join(__dirname, 'node_modules', 'jpeg-js'));
const { PNG } = require(path.join(__dirname, 'node_modules', 'pngjs'));

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'assets', 'img', 'street_bg_clean.png');
const arg = (k, d) => { const m = process.argv.find(a => a.startsWith('--' + k + '=')); return m ? m.split('=')[1] : d; };
const DXA = +arg('dxA', 0);          // lệch ngang khi lát bù gạch
const DYA = 28;                       // dải gạch sạch nguồn nằm ngay trên vùng hộ lan
const WRITE = process.argv.includes('--write');
const TAG = arg('tag', 'dry');

const SEG_A = [[216, 426], [513, 724], [883, 1023]];
const REF_CURB_X = [100, 470, 800];
const FILL_A_Y = [321, 348];
const CURB_Y = [349, 354];

const LEGS_B = [[3, 18], [125, 140], [245, 262], [361, 380], [439, 456], [559, 576], [685, 700], [805, 822], [893, 910], [1011, 1023]];
const LEG_Y = [460, 470];
const BAR_B_Y = [435, 455];
const RAMP_B_Y = [456, 467];
const ROAD_SRC_Y = 425;
const RAMP_SRC_Y = 460;
const RAMP_SRC_MAX = 469;

const BG_BANDS = [[0, 200, 0, 206], [258, 306, 206, 254], [306, 355, 254, 352], [355, 434, 352, 447], [434, 460, 447, 458], [460, 572, 458, 600]];

const buf = fs.readFileSync(SRC);
if ((buf.readUInt16BE(0) & 0xffd8) !== 0xffd8) console.log('CẢNH BÁO: không thấy SOI JPEG?', buf.slice(0, 4).toString('hex'));
const dec = jpeg.decode(buf, { useTArray: true });
const W = dec.width, H = dec.height, D = dec.data;
const orig = Buffer.from(D);
console.log(`ảnh ${W}x${H}, dxA=${DXA}, ${WRITE ? 'GHI THẬT' : 'chạy khô'}`);

const px = (src, x, y) => (y * W + x) << 2;
function copyTo(x, y, src, sx, sy) {
  const i = px(D, x, y), j = px(src, sx, sy);
  D[i] = src[j]; D[i + 1] = src[j + 1]; D[i + 2] = src[j + 2]; D[i + 3] = 255;
}

/* ---- 1) hộ lan A: lát gạch bù + chuẩn hoá dải bê tông mép ---- */
let nA = 0;
SEG_A.forEach(([x0, x1], si) => {
  for (let y = FILL_A_Y[0]; y <= FILL_A_Y[1]; y++)
    for (let x = x0; x <= x1; x++) {
      const sx = Math.max(0, Math.min(W - 1, x + DXA));
      copyTo(x, y, orig, sx, y - DYA); nA++;
    }
  for (let y = CURB_Y[0]; y <= CURB_Y[1]; y++)
    for (let x = x0; x <= x1; x++) copyTo(x, y, orig, REF_CURB_X[si], y);
});
console.log('hộ lan A: lát bù', nA, 'điểm ảnh + bê tông mép 3 đoạn');

/* ---- 2) hộ lan B: nhổ chân trụ (chép cột cỏ sạch cách 40px) ---- */
let nB = 0;
for (const [lx0, lx1] of LEGS_B) {
  const shift = lx0 < 60 ? 40 : -40;
  for (let y = LEG_Y[0]; y <= LEG_Y[1]; y++)
    for (let x = lx0; x <= lx1; x++) { copyTo(x, y, orig, x + shift, y); nB++; }
}
/* ---- 3) hộ lan B: nhựa đường đùn xuống chỗ thanh (lặp 10 hàng nhựa sạch) ---- */
for (let y = BAR_B_Y[0]; y <= BAR_B_Y[1]; y++)
  for (let x = 0; x < W; x++) {
    const sy = ROAD_SRC_Y + ((y - BAR_B_Y[0]) % 10);
    copyTo(x, y, orig, x, sy); nB++;
  }
/* dải chuyển tiếp cỏ dịch lên — đọc từ D (đã nhổ chân trụ), ghi tăng dần an toàn */
for (let y = RAMP_B_Y[0]; y <= RAMP_B_Y[1]; y++)
  for (let x = 0; x < W; x++) {
    const sy = Math.min(RAMP_SRC_MAX, RAMP_SRC_Y + (y - RAMP_B_Y[0]));
    copyTo(x, y, D, x, sy); nB++;
  }
console.log('hộ lan B: nhổ chân + đùn nhựa + dịch cỏ =', nB, 'điểm ảnh');

/* ---- 4) preview đúng vải ghép BG_BANDS ---- */
const bandSy = dy => {
  for (const [s0, s1, d0, d1] of BG_BANDS) if (dy >= d0 && dy < d1) return Math.min(H - 1, Math.floor(s0 + (dy - d0) * (s1 - s0) / (d1 - d0)));
  return 0;
};
function preview(tag, data, y0, y1, scale) {
  const w = 960 * scale, h = (y1 - y0) * scale;
  const o = new PNG({ width: w, height: h });
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
    const dy = y0 + Math.floor(r / scale), dx = Math.floor(c / scale);
    const si = (bandSy(dy) * W + (dx % W)) << 2, di = (r * w + c) << 2;
    o.data[di] = data[si]; o.data[di + 1] = data[si + 1]; o.data[di + 2] = data[si + 2]; o.data[di + 3] = 255;
  }
  const out = path.join(ROOT, 'tmp', `preview-${tag}.png`);
  fs.writeFileSync(out, PNG.sync.write(o));
  console.log('preview ->', path.relative(ROOT, out));
}
preview('before-full', orig, 0, 600, 1);
preview('before-walk', orig, 200, 600, 1);
preview(TAG + '-walk', D, 200, 600, 1);
preview(TAG + '-sidewalk-zoom', D, 240, 370, 2);

/* ---- 5) ghi ảnh thật ---- */
if (WRITE) {
  const enc = jpeg.encode({ data: D, width: W, height: H }, 95);
  const tmpOut = SRC + '.new';
  fs.writeFileSync(tmpOut, enc.data);
  if (fs.readFileSync(tmpOut).readUInt16BE(0) !== 0xffd8) throw new Error('encode lỗi');
  fs.renameSync(tmpOut, SRC);
  console.log('ĐÃ GHI', path.relative(ROOT, SRC), fs.statSync(SRC).size, 'bytes (cũ', buf.length, ')');
}
