/* ============================================================
   skins.js — 👕 TỦ ĐỒ IT: đổi skin nhân vật vẽ hoàn toàn bằng Canvas
   ------------------------------------------------------------
   Nạp SAU reskin.js. Nhân vật gốc là ảnh chibi PNG, nên lớp áo không
   vẽ đè tự do (sẽ lệch bóng người) mà sơn bằng globalCompositeOperation
   = 'source-atop' lên một canvas tạm: màu chỉ rơi vào đúng phần pixel
   ĐÃ CÓ của nhân vật, không bao giờ lem ra nền. Canvas tạm chỉ vẽ rồi
   blit, không đọc pixel -> chạy tốt cả khi mở bằng file://.
   ============================================================ */

/* ---------- 1. DANH MỤC TRANG PHỤC ---------- */
const SKINS = [
  { id: 'default', ic: '🧢', n: 'Thực Tập Sinh', price: 0, at: 'Trang phục mặc định',
    e: 'Không có nội tại', d: 'Áo thun đen + dép tổ ong, chuẩn dân IT Support ngày đầu nhận việc.' },
  { id: 'office', ic: '👔', n: 'Dân Công Sở', price: 2500, at: 'Sơ mi trắng + quần tây + thẻ cấp cao',
    e: 'Vĩnh viễn +10% XP mọi nhiệm vụ', d: 'Đồng phục bàn giấy: sơ mi ủi phẳng, quần tây ly sắc, thẻ nhân viên cấp cao đeo trước ngực — đi đào tạo là sếp ưu tiên.' },
  { id: 'hoodie', ic: '🥷', n: 'Hacker Red Team', price: 4500, at: 'Hoodie đen trùm đầu + kính Matrix',
    e: 'NPC đi đường không bắt chuyện làm phiền', d: 'Áo mũ kéo trùm kín, kính râm xanh Ma trận. Ai nghĩ bạn là sinh viên thực tập mà còn nhắn "anh fix help em cái máy in"?' },
  { id: 'cto', ic: '🕴️', n: 'CTO / Giám đốc Công nghệ', price: 9000, at: 'Vest xanh đen + đồng hồ mạ vàng',
    e: 'Vĩnh viễn +15% Coin mọi khoản thưởng', d: 'Bộ vest may đo, ve áo bóng, đồng hồ vàng điểm đúng giờ họp board — đi tới đâu người ta nhường lối tới đó.' }
];
const SK_BY = {};
SKINS.forEach(s => { SK_BY[s.id] = s; });
function skinById(id) { return SK_BY[id] || SKINS[0]; }
S.skin = skinById(S.skin).id;              // save cũ / file lạ có thể không có trường này
function skEquipped() { return S.skin; }
function skOwned(id) { return id === 'default' || invHas('sk_' + id); }
const skCoinMul = () => skEquipped() === 'cto' ? 1.15 : 1;
const skXpMul = () => skEquipped() === 'office' ? 1.1 : 1;

/* ============================================================
   2. HỘI HOẠ — mọi toạ độ là (u, v) chuẩn hoá trong khung ảnh
   (0,0) = góc trên trái ảnh sprite, (1,1) = góc dưới phải.
   Đường bao dưới đây đo trực tiếp trên assets/img/baked/char_player.png:
   tóc 0.03→0.30 · mặt 0.20→0.38 · vai 0.40 · thân 0.42→0.70 ·
   chân 0.70→0.93 · giày 0.92→0.99 · khoảng trống giữa 2 chân tự trong suốt.
   ============================================================ */
const SK_P = {
  /* áo: khối vai → gấu, hai bên hơi loe theo cánh tay */
  torso: [[.265, .381], [.41, .366], [.59, .366], [.735, .381],
          [.880, .432], [.915, .520], [.905, .625], [.845, .714],
          [.155, .714], [.095, .625], [.085, .520], [.120, .432]],
  /* 2 ống quần: hình thang rộng dần xuống, khe giữa do alpha của ảnh cắt hộ */
  legs: [[.18, .660], [.84, .660], [.93, .934], [.09, .934]],
  shoes: [.06, .912, .90, .100],              // x, y, w, h — KHÔNG phải polygon
  /* mũ hoodie: khối ngoài trùm đầu + lỗ mặt (evenodd) */
  hoodOut: [[.26, -.06], [.50, -.10], [.74, -.06], [.97, .11], [1.03, .28],
            [.97, .415], [.74, .460], [.26, .460], [.03, .415], [-.03, .28], [.03, .11]],
  /* ve áo vest */
  lapelL: [[.330, .382], [.500, .398], [.440, .562], [.345, .468]],
  lapelR: [[.670, .382], [.500, .398], [.560, .562], [.655, .468]],
  /* cổ sơ mi: 2 tam giác gập */
  collL: [[.345, .380], [.505, .396], [.432, .478], [.398, .420]],
  collR: [[.655, .380], [.495, .396], [.568, .478], [.602, .420]],
  tie: [[.468, .430], [.532, .430], [.556, .572], [.500, .628], [.444, .572]],
  shirtV: [[.500, .394], [.436, .566], [.564, .566]],
  badge: [.545, .540, .155, .100],           // x, y, w, h
  lensL: [.205, .232, .235, .070],
  lensR: [.475, .232, .235, .070],
  bridge: [.430, .246, .050, .020],
  /* 2 dây rút hoodie */
  cordL: [[.437, .412], [.415, .548]],
  cordR: [[.556, .412], [.580, .548]],
  pocket: [.295, .578, .355, .100],
  watch: [.760, .588, .075, .042]
};

function skPoly(g, P, pts) {
  g.beginPath();
  pts.forEach((p, i) => { const x = p[0] * P.w, y = p[1] * P.h; i ? g.lineTo(x, y) : g.moveTo(x, y); });
  g.closePath();
}
function skBox(g, P, b) { g.beginPath(); g.rect(b[0] * P.w, b[1] * P.h, b[2] * P.w, b[3] * P.h); }
function skRound(g, P, b, r) {
  const x = b[0] * P.w, y = b[1] * P.h, w = b[2] * P.w, h = b[3] * P.h, rr2 = Math.min(r * P.w, w / 2, h / 2);
  g.beginPath();
  if (g.roundRect) g.roundRect(x, y, w, h, rr2);
  else {
    g.moveTo(x + rr2, y); g.lineTo(x + w - rr2, y); g.quadraticCurveTo(x + w, y, x + w, y + rr2);
    g.lineTo(x + w, y + h - rr2); g.quadraticCurveTo(x + w, y + h, x + w - rr2, y + h);
    g.lineTo(x + rr2, y + h); g.quadraticCurveTo(x, y + h, x, y + h - rr2);
    g.lineTo(x, y + rr2); g.quadraticCurveTo(x, y, x + rr2, y);
  }
}
/* khối gradient đứng: tối dần về đáy cho giống ảnh gốc có bóng */
function skGrad(g, P, v0, v1, c0, c1) {
  const lg = g.createLinearGradient(0, v0 * P.h, 0, v1 * P.h);
  lg.addColorStop(0, c0); lg.addColorStop(1, c1);
  return lg;
}
/* Vẽ thêm một subpath tròn đè lên path đang có (không beginPath) để fill('evenodd') khoét lỗ mặt */
function skFaceHole(g, P) {
  g.moveTo(P.w * .750, P.h * .288);
  g.ellipse(P.w * .495, P.h * .288, P.w * .255, P.h * .108, 0, 0, Math.PI * 2);
  g.closePath();
}

/* ---------- các nước sơn ---------- */
function skPaintOffice(g, P) {
  skPoly(g, P, SK_P.torso);
  g.fillStyle = skGrad(g, P, .36, .72, 'rgba(252,253,255,.95)', 'rgba(206,216,230,.95)'); g.fill();
  skPoly(g, P, SK_P.legs);
  g.fillStyle = skGrad(g, P, .66, .94, 'rgba(122,132,150,.94)', 'rgba(74,82,97,.96)'); g.fill();
  /* ly quần */
  g.strokeStyle = 'rgba(255,255,255,.30)'; g.lineWidth = Math.max(.7, P.w * .012);
  g.beginPath(); g.moveTo(.335 * P.w, .70 * P.h); g.lineTo(.315 * P.w, .925 * P.h);
  g.moveTo(.655 * P.w, .70 * P.h); g.lineTo(.695 * P.w, .925 * P.h); g.stroke();
  skBox(g, P, SK_P.shoes); g.fillStyle = 'rgba(28,31,38,.96)'; g.fill();
  /* thắt lưng + sơ mi + cổ + cà vạt */
  g.fillStyle = 'rgba(30,34,44,.95)'; g.fillRect(.19 * P.w, .660 * P.h, .62 * P.w, .030 * P.h);
  g.fillStyle = 'rgba(202,164,60,.95)'; g.fillRect(.465 * P.w, .658 * P.h, .07 * P.w, .034 * P.h);
  skPoly(g, P, SK_P.collL); g.fillStyle = '#ffffff'; g.fill();
  skPoly(g, P, SK_P.collR); g.fillStyle = '#e9eef7'; g.fill();
  skPoly(g, P, SK_P.tie); g.fillStyle = '#1e3a8a'; g.fill();
  g.fillStyle = '#16295f'; skPoly(g, P, [[.462, .400], [.538, .400], [.552, .438], [.448, .438]]); g.fill();
  /* dây đeo thẻ + thẻ nhân viên cấp cao */
  g.strokeStyle = '#b91c1c'; g.lineWidth = Math.max(.8, P.w * .020);
  g.beginPath(); g.moveTo(.395 * P.w, .404 * P.h); g.lineTo(.560 * P.w, .545 * P.h);
  g.moveTo(.600 * P.w, .404 * P.h); g.lineTo(.685 * P.w, .545 * P.h); g.stroke();
  skRound(g, P, SK_P.badge, .014); g.fillStyle = '#f8fafc'; g.fill();
  g.strokeStyle = 'rgba(30,41,59,.55)'; g.lineWidth = Math.max(.6, P.w * .008); g.stroke();
  g.fillStyle = '#1d4ed8'; g.fillRect(.545 * P.w, .540 * P.h, .155 * P.w, .022 * P.h);
  g.fillStyle = '#94a3b8'; g.fillRect(.556 * P.w, .568 * P.h, .038 * P.w, .050 * P.h);
  g.fillStyle = '#334155'; g.fillRect(.602 * P.w, .570 * P.h, .086 * P.w, .012 * P.h);
  g.fillRect(.602 * P.w, .586 * P.h, .062 * P.w, .012 * P.h);
  g.fillStyle = '#b45309'; g.fillRect(.556 * P.w, .622 * P.h, .132 * P.w, .010 * P.h);
  /* đường may ống tay + gấu áo cho ra dáng sơ mi đóng thùng */
  g.strokeStyle = 'rgba(120,140,170,.45)'; g.lineWidth = Math.max(.6, P.w * .010);
  g.beginPath();
  g.moveTo(.285 * P.w, .400 * P.h); g.lineTo(.255 * P.w, .690 * P.h);
  g.moveTo(.715 * P.w, .400 * P.h); g.lineTo(.745 * P.w, .690 * P.h);
  g.stroke();
}

function skPaintHoodie(g, P) {
  skPoly(g, P, SK_P.torso);
  g.fillStyle = skGrad(g, P, .36, .72, 'rgba(32,36,46,.94)', 'rgba(11,13,18,.97)'); g.fill();
  /* túi kangaroo */
  skRound(g, P, SK_P.pocket, .02);
  g.fillStyle = 'rgba(255,255,255,.055)'; g.fill();
  g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = Math.max(.6, P.w * .010); g.stroke();
  /* bo gấu áo + cuff */
  g.strokeStyle = 'rgba(150,165,190,.22)'; g.lineWidth = Math.max(.7, P.w * .014);
  skPoly(g, P, [[.17, .706], [.83, .706]]); g.stroke();
  skPoly(g, P, SK_P.legs);
  g.fillStyle = skGrad(g, P, .66, .94, 'rgba(26,29,37,.93)', 'rgba(14,16,21,.96)'); g.fill();
  g.fillStyle = 'rgba(148,163,184,.18)';
  g.fillRect(.20 * P.w, .900 * P.h, .30 * P.w, .026 * P.h);
  g.fillRect(.55 * P.w, .900 * P.h, .32 * P.w, .026 * P.h);
  skBox(g, P, SK_P.shoes); g.fillStyle = 'rgba(9,11,15,.96)'; g.fill();
  /* MŨ TRÙM ĐẦU: khối ngoài trừ lỗ mặt */
  skPoly(g, P, SK_P.hoodOut); skFaceHole(g, P);
  g.fillStyle = skGrad(g, P, 0, .46, 'rgba(54,60,75,.97)', 'rgba(17,19,26,.97)');
  g.fill('evenodd');
  /* đường may giữa mũ */
  g.strokeStyle = 'rgba(12,14,20,.55)'; g.lineWidth = Math.max(.7, P.w * .016);
  g.beginPath(); g.moveTo(.50 * P.w, .005 * P.h); g.quadraticCurveTo(.34 * P.w, .10 * P.h, .285 * P.w, .205 * P.h); g.stroke();
  /* viền mũ quanh mặt */
  g.beginPath(); skFaceHole(g, P);
  g.strokeStyle = 'rgba(6,8,12,.85)'; g.lineWidth = Math.max(.8, P.w * .026); g.stroke();
  /* dây rút */
  g.strokeStyle = '#aab6c8'; g.lineWidth = Math.max(.7, P.w * .014);
  g.beginPath(); g.moveTo(SK_P.cordL[0][0] * P.w, SK_P.cordL[0][1] * P.h); g.lineTo(SK_P.cordL[1][0] * P.w, SK_P.cordL[1][1] * P.h);
  g.moveTo(SK_P.cordR[0][0] * P.w, SK_P.cordR[0][1] * P.h); g.lineTo(SK_P.cordR[1][0] * P.w, SK_P.cordR[1][1] * P.h);
  g.stroke();
  /* kính Matrix */
  skRound(g, P, SK_P.lensL, .012); g.fillStyle = 'rgba(6,32,22,.95)'; g.fill();
  skRound(g, P, SK_P.lensR, .012); g.fill();
  skBox(g, P, SK_P.bridge); g.fill();
  g.strokeStyle = 'rgba(52,211,153,.85)'; g.lineWidth = Math.max(.6, P.w * .010);
  skRound(g, P, SK_P.lensL, .012); g.stroke();
  skRound(g, P, SK_P.lensR, .012); g.stroke();
  g.fillStyle = 'rgba(134,239,172,.75)';
  g.fillRect(.235 * P.w, .240 * P.h, .045 * P.w, .012 * P.h);
  g.fillRect(.505 * P.w, .240 * P.h, .045 * P.w, .012 * P.h);
}

function skPaintCto(g, P) {
  /* tóc chải gọn: chỉ phủ bóng mờ + ngôi lệch, không tô khối để giữ đường tóc gốc */
  g.fillStyle = skGrad(g, P, .020, .200, 'rgba(40,50,68,.55)', 'rgba(10,14,22,0)');
  g.beginPath(); g.ellipse(P.w * .50, P.h * .098, P.w * .35, P.h * .088, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(186,204,228,.22)'; g.lineWidth = Math.max(.8, P.w * .011);
  g.beginPath();
  g.moveTo(.40 * P.w, .048 * P.h); g.quadraticCurveTo(.56 * P.w, .070 * P.h, .70 * P.w, .104 * P.h);
  g.moveTo(.28 * P.w, .082 * P.h); g.quadraticCurveTo(.40 * P.w, .100 * P.h, .50 * P.w, .118 * P.h);
  g.moveTo(.52 * P.w, .036 * P.h); g.quadraticCurveTo(.64 * P.w, .052 * P.h, .74 * P.w, .080 * P.h);
  g.stroke();
  g.strokeStyle = 'rgba(8,11,17,.7)'; g.lineWidth = Math.max(.9, P.w * .013);
  g.beginPath(); g.moveTo(.372 * P.w, .034 * P.h); g.quadraticCurveTo(.348 * P.w, .084 * P.h, .318 * P.w, .128 * P.h); g.stroke();
  skPoly(g, P, SK_P.torso);
  g.fillStyle = skGrad(g, P, .36, .72, 'rgba(37,48,70,.95)', 'rgba(16,22,35,.97)'); g.fill();
  /* sơ mi tối màu + cà vạt đen than + ve áo navy */
  skPoly(g, P, SK_P.collL); g.fillStyle = '#2b3648'; g.fill();
  skPoly(g, P, SK_P.collR); g.fillStyle = '#222c3c'; g.fill();
  skPoly(g, P, SK_P.shirtV); g.fillStyle = '#26303f'; g.fill();
  skPoly(g, P, SK_P.tie);
  g.fillStyle = skGrad(g, P, .40, .63, 'rgba(24,30,42,1)', 'rgba(10,13,19,1)'); g.fill();
  g.strokeStyle = 'rgba(148,163,184,.28)'; g.lineWidth = Math.max(.6, P.w * .007);
  skPoly(g, P, SK_P.tie); g.stroke();
  skPoly(g, P, SK_P.lapelL); g.fillStyle = skGrad(g, P, .38, .55, 'rgba(58,72,100,.98)', 'rgba(28,36,54,.98)'); g.fill();
  skPoly(g, P, SK_P.lapelR); g.fillStyle = skGrad(g, P, .38, .55, 'rgba(48,60,86,.98)', 'rgba(22,29,44,.98)'); g.fill();
  /* viền ve áo bóng lụa */
  g.strokeStyle = 'rgba(148,178,220,.42)'; g.lineWidth = Math.max(.6, P.w * .011);
  skPoly(g, P, SK_P.lapelL); g.stroke();
  skPoly(g, P, SK_P.lapelR); g.stroke();
  /* cúc áo vest mạ vàng */
  g.fillStyle = '#fcd34d';
  [[.470, .648], [.470, .690]].forEach(b => {
    g.beginPath(); g.arc(b[0] * P.w, b[1] * P.h, Math.max(.8, P.w * .017), 0, 7); g.fill();
  });
  /* khăn túi áo */
  g.fillStyle = '#fbbf24'; skPoly(g, P, [[.612, .492], [.672, .480], [.664, .516], [.606, .522]]); g.fill();
  /* quần vest + giày da */
  skPoly(g, P, SK_P.legs);
  g.fillStyle = skGrad(g, P, .66, .94, 'rgba(31,40,58,.95)', 'rgba(14,19,30,.97)'); g.fill();
  g.strokeStyle = 'rgba(148,163,184,.22)'; g.lineWidth = Math.max(.7, P.w * .012);
  g.beginPath(); g.moveTo(.345 * P.w, .70 * P.h); g.lineTo(.33 * P.w, .925 * P.h);
  g.moveTo(.65 * P.w, .70 * P.h); g.lineTo(.68 * P.w, .925 * P.h); g.stroke();
  skBox(g, P, SK_P.shoes); g.fillStyle = 'rgba(14,15,20,.97)'; g.fill();
  g.fillStyle = 'rgba(255,255,255,.30)';
  g.fillRect(.20 * P.w, .940 * P.h, .20 * P.w, .014 * P.h);
  g.fillRect(.72 * P.w, .940 * P.h, .20 * P.w, .014 * P.h);
  /* đồng hồ mạ vàng ở cổ tay phải */
  skRound(g, P, SK_P.watch, .010);
  g.fillStyle = skGrad(g, P, .58, .64, 'rgba(253,224,71,1)', 'rgba(202,138,4,1)'); g.fill();
  g.fillStyle = '#fffbeb';
  g.beginPath(); g.arc(.797 * P.w, .609 * P.h, Math.max(1, P.w * .017), 0, 7); g.fill();
  g.strokeStyle = 'rgba(120,53,15,.9)'; g.lineWidth = Math.max(.5, P.w * .007); g.stroke();
}

const SK_PAINT = { office: skPaintOffice, hoodie: skPaintHoodie, cto: skPaintCto };

/* ---------- canvas tạm theo (skin, cỡ) — vẽ 1 lần, dùng lại mọi frame ---------- */
const skCache = {};
function outfitCanvas(id, w, h) {
  const img = IMG.chars.p;
  if (!img || !assetsReady) return null;
  w = Math.max(8, Math.round(w)); h = Math.max(8, Math.round(h));
  const key = id + '|' + w + 'x' + h;
  if (skCache[key]) return skCache[key];
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  try { g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; } catch (e) {}
  g.drawImage(img, 0, 0, w, h);
  const fn = SK_PAINT[id];
  if (fn) {
    g.save();
    g.globalCompositeOperation = 'source-atop';   // màu chỉ rơi vào pixel của nhân vật
    fn(g, { w: w, h: h });
    g.restore();
  }
  skCache[key] = cv;
  return cv;
}

/* ---------- 3b. CHÂN DUNG HUD (headshot) ----------
   Cùng bộ toạ độ chuẩn hoá (u,v) với lớp áo toàn thân, nên mọi chi tiết
   source-atop tự bám đúng và phóng to theo góc cắt cận mặt của HUD. */
const SK_PORTRAIT = {
  /* Thực tập sinh: tóc đen rối + cổ hoodie đen đơn giản */
  default: function (g, P) {
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(15,18,26,.85)'; g.lineWidth = Math.max(1, P.w * .016);
    g.beginPath();
    g.moveTo(.30 * P.w, .078 * P.h); g.quadraticCurveTo(.245 * P.w, .040 * P.h, .205 * P.w, .058 * P.h);
    g.moveTo(.62 * P.w, .072 * P.h); g.quadraticCurveTo(.70 * P.w, .036 * P.h, .755 * P.w, .056 * P.h);
    g.moveTo(.45 * P.w, .050 * P.h); g.quadraticCurveTo(.50 * P.w, .016 * P.h, .562 * P.w, .038 * P.h);
    g.stroke();
    g.fillStyle = 'rgba(17,20,28,.92)';
    skPoly(g, P, [[.350, .366], [.500, .404], [.650, .366], [.676, .398], [.500, .448], [.324, .398]]); g.fill();
    g.strokeStyle = 'rgba(126,142,168,.30)'; g.lineWidth = Math.max(.7, P.w * .010);
    skPoly(g, P, [[.352, .370], [.500, .408], [.648, .370]]); g.stroke();
  },
  /* Dân công sở: viền cổ sơ mi trắng sắc + khoá dây đỏ đeo thẻ */
  office: function (g, P) {
    g.strokeStyle = 'rgba(120,140,170,.72)'; g.lineWidth = Math.max(.7, P.w * .011);
    skPoly(g, P, SK_P.collL); g.stroke();
    skPoly(g, P, SK_P.collR); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.55)';
    skPoly(g, P, [[.352, .384], [.498, .398], [.470, .414], [.372, .402]]); g.fill();
    g.fillStyle = '#cbd5e1'; skRound(g, P, [.468, .414, .064, .026], .008); g.fill();
    g.strokeStyle = '#7f1d1d'; g.lineWidth = Math.max(.6, P.w * .008);
    g.beginPath(); g.moveTo(.395 * P.w, .404 * P.h); g.lineTo(.560 * P.w, .500 * P.h);
    g.moveTo(.600 * P.w, .404 * P.h); g.lineTo(.685 * P.w, .500 * P.h); g.stroke();
  },
  /* Hacker Red Team: tối nhẹ nửa dưới mặt + phản quang xanh Matrix trên mắt kính */
  hoodie: function (g, P) {
    g.fillStyle = skGrad(g, P, .345, .45, 'rgba(3,5,9,0)', 'rgba(3,5,9,.40)');
    g.fillRect(0, .345 * P.h, P.w, .105 * P.h);
    g.fillStyle = 'rgba(110,231,183,.34)';
    g.fillRect(.252 * P.w, .240 * P.h, .011 * P.w, .046 * P.h);
    g.fillRect(.522 * P.w, .240 * P.h, .011 * P.w, .046 * P.h);
    g.strokeStyle = 'rgba(148,163,184,.16)'; g.lineWidth = Math.max(.7, P.w * .012);
    g.beginPath(); g.arc(P.w * .495, P.h * .288, P.w * .276, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
  },
  /* CTO: nút cà vạt + viền cổ sơ mi tối cho ra chất vest ở khung cận */
  cto: function (g, P) {
    g.fillStyle = 'rgba(9,12,18,.96)'; skRound(g, P, [.460, .396, .080, .040], .010); g.fill();
    g.strokeStyle = 'rgba(186,204,228,.45)'; g.lineWidth = Math.max(.7, P.w * .010);
    skPoly(g, P, SK_P.collL); g.stroke();
    skPoly(g, P, SK_P.collR); g.stroke();
    g.fillStyle = 'rgba(253,224,71,.85)';
    g.beginPath(); g.arc(.500 * P.w, .478 * P.h, Math.max(.9, P.w * .013), 0, 7); g.fill();
  }
};
function skPortraitLayer(dw, dh) {
  const img = IMG.chars.p;
  if (!img || !assetsReady) return null;
  const id = skEquipped();
  dw = Math.max(8, Math.round(dw)); dh = Math.max(8, Math.round(dh));
  const key = 'av|' + id + '|' + dw + 'x' + dh;
  if (skCache[key]) return skCache[key];
  const cv = document.createElement('canvas');
  cv.width = dw; cv.height = dh;
  const g = cv.getContext('2d');
  try { g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; } catch (e) {}
  g.drawImage(img, 0, 0, dw, dh);
  g.save();
  g.globalCompositeOperation = 'source-atop';   // chỉ sơn lên pixel của nhân vật
  const fn = SK_PAINT[id]; if (fn) fn(g, { w: dw, h: dh });
  const pv = SK_PORTRAIT[id]; if (pv) pv(g, { w: dw, h: dh });
  g.restore();
  skCache[key] = cv;
  return cv;
}

/* ---------- 3. MÓC VÀO DRAW CHIBI (reskin.js gọi) ---------- */
function skOnChibi(g, box, r) {
  if (r !== 'p') return;
  const id = skEquipped();
  if (id === 'default') return;
  const c = outfitCanvas(id, box.w * 2, box.h * 2);
  if (c) g.drawImage(c, box.x, box.y, box.w, box.h);
}

/* ---------- 4. AVATAR HỘI THOẠI cũng mặc đồ ---------- */
const _skAvatar = drawAvatar;
drawAvatar = function (spk) {
  _skAvatar(spk);
  const s = String(spk || '');
  if (!(s.includes('Nhân') || s.includes(playerName) || s === 'Bạn')) return;
  /* V15: avatar NỮ là ảnh chân dung riêng (icon-113) — hình cắt theo khung nam
     mà sơn lên thì lệch, nên bỏ qua lớp trang phục ở khung này. */
  if (playerGender === 'female') return;
  const id = skEquipped(); if (id === 'default') return;
  const acv = document.getElementById('av-cv'); if (!acv) return;
  const img = IMG.chars.p; if (!img) return;
  /* reskin.js cắt ô vuông size = min(w, h*0.55) ở đỉnh ảnh rồi phóng ra 64x64 */
  const size = Math.min(img.width, img.height * 0.55);
  const k = 64 / size;
  const c = outfitCanvas(id, 64 * 2, (img.height * k) * 2);
  if (!c) return;
  const a = acv.getContext('2d');
  a.save();
  a.drawImage(c, -4, -4, 64, img.height * k);
  a.restore();
};

/* ---------- 5. TAB "TỦ ĐỒ" TRONG CỬA HÀNG ---------- */
let skTab = 'gear';
function shopTab(t) { skTab = t; renderShop(); beep(540, 'triangle', .05, .02); }

function drawSkinChar(g, box, id) {
  const c = outfitCanvas(id, box.w * 2, box.h * 2);
  if (c) g.drawImage(c, box.x, box.y, box.w, box.h);
}
function skinPreviewTo(cv, id) {
  const g = cv.getContext('2d');
  g.clearRect(0, 0, cv.width, cv.height);
  const bg = g.createLinearGradient(0, 0, 0, cv.height);
  bg.addColorStop(0, '#16233c'); bg.addColorStop(1, '#0a1120');
  g.fillStyle = bg; g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = 'rgba(56,189,248,.10)'; g.fillRect(0, cv.height - 26, cv.width, 26);
  g.strokeStyle = 'rgba(125,211,252,.25)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(0, cv.height - 26.5); g.lineTo(cv.width, cv.height - 26.5); g.stroke();
  const img = IMG.chars.p;
  if (!img || !assetsReady) {
    g.fillStyle = '#64748b'; g.font = '10px "Segoe UI", sans-serif'; g.textAlign = 'center';
    g.fillText('…', cv.width / 2, cv.height / 2); g.textAlign = 'left';
    return;
  }
  const H = cv.height - 30, W = H * (img.width / img.height);
  drawSkinChar(g, { x: (cv.width - W) / 2, y: 6, w: W, h: H }, id);
}
function skCard(s) {
  const owned = skOwned(s.id);
  const on = skEquipped() === s.id;
  const poor = S.coin < s.price;
  let btn;
  if (!owned) btn = '<button class="sp-buy wd-buy' + (poor ? ' poor' : '') + '" onclick="skBuy(\'' + s.id + '\')">' + COIN_IC + ' ' +
    s.price.toLocaleString() + '<b>MUA</b></button>';
  else if (on) btn = '<span class="wd-on">✔ ĐANG MẶC</span>';
  else btn = '<button class="wd-equip" onclick="skEquip(\'' + s.id + '\')">👕 MẶC VÀO</button>';
  return '<div class="wd-card' + (on ? ' on' : '') + (owned ? '' : ' locked') +
    '" onmouseenter="skInfo(\'' + s.id + '\')" onmouseleave="skInfo(\'\')">' +
    '<canvas class="wd-cv" data-skin="' + s.id + '" width="126" height="152"></canvas>' +
    '<b class="wd-nm">' + s.ic + ' ' + s.n + '</b>' +
    '<span class="wd-at">' + s.at + '</span>' +
    '<span class="wd-eff">' + s.e + '</span>' + btn + '</div>';
}
/* rêo chuột vào thẻ -> mô tả dài hiện ở dòng footer, không choán chỗ trong thẻ */
function skInfo(id) {
  const f = document.querySelector('#shop-modal .sp-foot');
  if (f) f.innerHTML = id ? '<b>' + skinById(id).n + ':</b> ' + skinById(id).d : skFoot();
}
function skGrid() {
  return '<div class="wd-grid">' + SKINS.map(skCard).join('') + '</div>' +
    '<div class="wd-note">💡 Skin vẽ bằng Canvas ngay trong trình duyệt — đổi là thấy ngoài phố, trong phòng và cả ảnh đại diện hội thoại.</div>';
}
function skFoot() {
  const own = SKINS.filter(s => skOwned(s.id) && s.id !== 'default');
  const on = skinById(skEquipped());
  return own.length
    ? '🎽 Đang mặc: <b>' + on.ic + ' ' + on.n + '</b> — ' + on.e + ' · Đã sưu tầm ' + own.length + '/' + (SKINS.length - 1)
    : '💡 Chưa có bộ nào — Coin đang để không, thử <b>Dân Công Sở</b> 2.500 ' + COIN_IC + ' xem sao.';
}
const _renderShopSk = renderShop;
renderShop = function () {
  _renderShopSk();
  const m = shopBox();
  const head = m.querySelector('.sp-head');
  const list = m.querySelector('.sp-list');
  const foot = m.querySelector('.sp-foot');
  if (!head || !list) return;
  let tabs = m.querySelector('.sp-tabs');
  if (!tabs) {
    tabs = document.createElement('div');
    tabs.className = 'sp-tabs';
    head.parentNode.insertBefore(tabs, list);
  }
  tabs.innerHTML = '<button class="sp-tab' + (skTab === 'gear' ? ' act' : '') + '" onclick="shopTab(\'gear\')">🔧 Phụ Kiện IT</button>' +
    '<button class="sp-tab' + (skTab === 'wear' ? ' act' : '') + '" onclick="shopTab(\'wear\')">👕 Tủ Đồ IT</button>' +
    '<span class="sp-tab-hint">' + SKINS.filter(s => skOwned(s.id) && s.id !== 'default').length + '/' + (SKINS.length - 1) + ' bộ đã có</span>';
  if (skTab === 'wear') {
    m.classList.add('wd-mode');
    list.className = 'wd-list';
    list.innerHTML = skGrid();
    Array.prototype.forEach.call(m.querySelectorAll('.wd-cv'), cv => skinPreviewTo(cv, cv.dataset.skin));
    if (foot) foot.innerHTML = skFoot();
  } else {
    m.classList.remove('wd-mode');
    list.className = 'sp-list';
  }
};

function skBuy(id) {
  const s = skinById(id);
  if (skOwned(id)) { skEquip(id); return; }
  if (S.coin < s.price) {
    showToast('Thiếu ' + (s.price - S.coin).toLocaleString() + ' Coin — phá ải và nhận việc phụ rồi quay lại nhé!');
    beep(190, 'square', .18, .05);
    return;
  }
  S.coin -= s.price;
  S.inv['sk_' + id] = 1;
  syncHUD();
  skEquip(id, true);
  chord([520, 660, 780, 990]);
  showBanner('TỦ ĐỒ IT', s.ic + ' ' + s.n, '👕 Đã mặc — ' + s.e, 'green');
}
function skEquip(id, quiet) {
  const s = skinById(id);
  if (!skOwned(s.id)) { showToast('🔒 ' + s.n + ' chưa mua — ' + s.price.toLocaleString() + ' Coin ở Tủ Đồ.'); return; }
  if (S.skin === s.id) return;
  S.skin = s.id;
  saveGame();
  try { updateBuffBar(); } catch (e) {}
  try { if (typeof renderHudAvatar === 'function') renderHudAvatar(); } catch (e) {}
  if (!quiet) {
    showToast(s.ic + ' Đã mặc ' + s.n + ' — ' + s.e);
    beep(700, 'triangle', .09, .03);
  }
  if (shopOpen()) renderShop();
}

/* ---------- 6. NỘI TẠI: bọc 3 hàm gốc ---------- */
const _skAddCoin = addCoin;
addCoin = function (n) { _skAddCoin(n > 0 ? Math.round(n * skCoinMul()) : n); };
const _skAddXP = addXP;
addXP = function (n) { _skAddXP(n > 0 ? Math.round(n * skXpMul()) : n); };

/* Hoodie: người đi đường không chặn [E] NÓI CHUYỆN nữa */
const _skUpdate = update;
update = function () {
  _skUpdate();
  try { if (targetAct && targetAct.t === 'chat' && skEquipped() === 'hoodie') targetAct = null; } catch (e) {}
};

/* chip nội tại trên dải buff HUD */
const _skBuff = updateBuffBar;
updateBuffBar = function () {
  _skBuff();
  const bar = document.getElementById('buff-bar');
  if (!bar) return;
  const id = skEquipped();
  const chip = bar.querySelector('.buff-skin');
  if (bar.dataset.sk === id && (id === 'default' || chip)) return;   // bản gốc có thể xoá chip -> vẽ lại
  bar.dataset.sk = id;
  if (chip) chip.remove();
  if (id === 'default') return;
  const s = skinById(id);
  const el = document.createElement('span');
  el.className = 'buff-chip buff-skin';
  el.setAttribute('data-tip', s.e);
  el.textContent = s.ic;
  bar.appendChild(el);
  bar.classList.remove('hidden');
};

/* mua xong là HUD/buff phải vẽ lại — syncHUD đã gọi updateBuffBar, chỉ cần bảo đảm
   signature buff đổi khi mặc đồ khác */
try { updateBuffBar(); } catch (e) {}
