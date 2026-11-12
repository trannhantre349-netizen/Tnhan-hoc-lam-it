/* ============================================================
   skins.js — 👕 TỦ ĐỒ IT: 4 trang phục của nhân vật
   ------------------------------------------------------------
   Nạp SAU reskin.js. Đồ mặc giờ lấy nguyên ô trong sheet ảnh đã vẽ sẵn
   (mục 7), không còn sơn vector đè lên sprite như trước V21 — xem khối
   chú thích đầu mục 7 để biết vì sao.
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
   TRANG PHỤC = SHEET ĐÃ VẼ SẴN (xem mục 7) — KHÔNG SƠN BẰNG CANVAS
   ------------------------------------------------------------
   Trước V21, 4 bộ đồ này là polygon đo trên ảnh nam (đường bao
   char_player.png) sơn source-atop đè lên sprite, rồi reskin.js blit lại
   ảnh nam gốc, nên nhân vật Nữ thành "đàn ông mặc đồ đàn ông" còn nhân
   vật Nam thì áo lem lệch bóng. Cả hai giới giờ mặc nguyên bộ vẽ sẵn
   trong assets/img/baked/female_sprites.png / male_sprites.png (4 hàng
   skin x 5 cột hướng), vì vậy toàn bộ bộ sơn cũ (bảng toạ độ SK_P, các
   hàm skPaint*, outfitCanvas, skPortraitLayer, lớp sơn đè avatar hội
   thoại) đã xoá khỏi mã nguồn — không còn đường nào để vẽ nhầm đồ của
   giới khác. IMG.chars.p vẫn là khung người trần và chỉ hiện 1-2 frame
   đầu khi sheet chưa nạp kịp; không bao giờ có lớp áo vẽ đè nữa.
   ============================================================ */

/* ---------- 5. TAB "TỦ ĐỒ" TRONG CỬA HÀNG ---------- */
let skTab = 'gear';
function shopTab(t) { skTab = t; renderShop(); beep(540, 'triangle', .05, .02); }

function drawSkinChar(g, box, id) {
  /* Thẻ xem trước lấy thẳng ô hàng tương ứng trong sheet của giới đang chơi
     (cột 0 = đứng trực diện). Sheet chưa nạp thì để trống: skinPreviewTo đã
     in "…" thay thẻ, vẽ khung người trần theo cỡ ảnh cũ chỉ thêm lệch. */
  const SH = skSheetImg();
  if (!SH || !assetsReady) return;
  const sc = box.h / SK_GEO.CH, dw = SK_GEO.CW * sc;
  g.drawImage(SH, 0, (SK_ROW[id] || 0) * SK_GEO.CH, SK_GEO.CW, SK_GEO.CH,
              box.x + (box.w - dw) / 2, box.y, dw, box.h);
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
  if (!skSheetReady()) {
    g.fillStyle = '#64748b'; g.font = '10px "Segoe UI", sans-serif'; g.textAlign = 'center';
    g.fillText('…', cv.width / 2, cv.height / 2); g.textAlign = 'left';
    return;
  }
  const H = cv.height - 30, W = H * SK_GEO.CW / SK_GEO.CH;
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

/* ============================================================
   7. SHEET TRANG PHỤC THEO GIỚI TÍNH (V21 nữ · V22 nam)
   ------------------------------------------------------------
   Mục này là NGUỒN ĐỒ HỌA DUY NHẤT của nhân vật. Bug trước V21: 4 skin
   sơn bằng Canvas theo đường bao đo trên ảnh nam rồi reskin.js blit lại
   ảnh nam gốc -> nhân vật Nữ bị thay bằng người Nam mặc đồ Nam, còn
   nhân vật Nam mặc đồ "vẽ đè" lệch bóng người.

   Lưới: 4 HÀNG = 4 skin theo đúng thứ tự mảng SKINS ở mục 1
         (0 Thực Tập Sinh · 1 Dân Công Sở · 2 Hacker Red Team · 3 CTO),
         5 CỘT = 5 hướng (0 đứng quay trái · 1 đứng quay phải ·
         2 lưng quay phải · 3 lưng quay trái · 4 đang bước đi, art gốc
         luôn quay sang PHẢI nên cột này tự lật khi đi trái).
         Mọi ô 150x178 px, thân nhân vật cao 158 px, bàn chân nằm tại
         dòng 172 của ô — do tools/bake-female-sprites.cjs và
         tools/bake-male-sprites.cjs xếp lại đều nên chỉ cần MỘT cặp
         (dw, dh) cho cả 40 ô của hai giới: đổi hướng, đổi skin, đổi giới
         tính đều không làm nhân vật nhảy kích thước.

   Neo vẽ: giống hệt nhánh cũ trong reskin.js — cx = x+10, feet = y+30,
           bob theo S.p.step, bóng tiếp xúc cùng toạ độ. Vfx.js bọc
           drawChibi() để vẽ bóng mềm + bụi chân TRƯỚC khi hàm này chạy,
           nên hai lớp hiệu ứng vẫn nguyên ở mọi cảnh (WORLD, STREET,
           phòng trong, HEAVEN) vì tất cả đều đi qua drawSprite('p').
           Hitbox không đổi: engine va chạm theo S.p + ô sàn, sprite chỉ
           là lớp vẽ.
   ============================================================ */
const SK_GEO = { CW: 150, CH: 178, FOOT: 172, BODY: 158, H: 50 };
const SK_ROW = {};
SKINS.forEach((s, i) => { SK_ROW[s.id] = i; });
/* Sheet của giới đang chơi; null vài frame đầu chưa nạp -> reskin.js vẽ tạm
   khung người trần (IMG.chars.p), tuyệt đối không có lớp áo sơn đè. */
function skSheetImg() { return playerGender === 'female' ? IMG.femSprites : IMG.maleSprites; }
function skSheetReady() { return !!(skSheetImg() && assetsReady); }

/* Game chỉ lưu S.p.dir trái/phải (engine.js:1395), không có hướng mặt/lưng,
   nên chiều dọc đọc trực tiếp phím đang giữ: đi lên = thấy lưng. Biến module
   chứ không nhét vào S — file save phải giữ nguyên từng byte. */
let skBack = false;
const _skFaceUpd = update;
update = function () {
  _skFaceUpd();
  try {
    const up = (typeof held === 'function' && held('up')) || (typeof touchDir !== 'undefined' && touchDir.up);
    const dn = (typeof held === 'function' && held('down')) || (typeof touchDir !== 'undefined' && touchDir.down);
    if (up && !dn) skBack = true;
    else if (dn && !up) skBack = false;
  } catch (e) {}
};

function skSheetCol() {
  const right = (S.p.dir || 1) > 0;
  if (S.p.moving) return 4;
  return skBack ? (right ? 2 : 3) : (right ? 1 : 0);
}

function skSheetChibi(x, y) {
  const right = (S.p.dir || 1) > 0;
  const col = skSheetCol();
  /* V36: sang Khu 6 thì thân người thay bằng sheet Quỷ — hàng 0 Quỷ Nam, hàng 1
     Quỷ Nữ theo giới tính đang chơi. Lưới 150x178 giống hệt sheet người nên 5 cột
     hướng, nhịp bước, bóng chân không phải sửa. Sheet chưa nạp thì vẫn mặc đồ
     thường (không mất hình); ảnh đại diện HUD/cửa hàng vẫn dùng skSheetImg cũ. */
  const hell = (typeof S !== 'undefined' && S.scene === 'HELL') ? IMG.demonSheet : null;
  const row = hell ? (playerGender === 'female' ? 1 : 0) : (SK_ROW[skEquipped()] || 0);
  const sc = SK_GEO.H / SK_GEO.BODY, dw = SK_GEO.CW * sc, dh = SK_GEO.CH * sc;
  const cx = x + 10, feet = y + 30;
  const bob = S.p.moving ? Math.abs(Math.sin(S.p.step * 0.32)) * 2.2
    : Math.sin(Date.now() / 600 + x) * 0.8;
  ctx.fillStyle = 'rgba(23,63,102,.22)';
  ctx.beginPath(); ctx.ellipse(cx, feet + 2, dw * 0.26, 4.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.translate(cx, feet - bob);
  /* cột 4 vẽ sẵn quay sang phải -> lật khi đi trái; 4 cột kia đã có bản đối xứng */
  if (col === 4 && !right) ctx.scale(-1, 1);
  try { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; } catch (e) {}
  ctx.drawImage(hell || skSheetImg(), col * SK_GEO.CW, row * SK_GEO.CH, SK_GEO.CW, SK_GEO.CH,
    -dw / 2, -dh * (SK_GEO.FOOT / SK_GEO.CH), dw, dh);
  ctx.restore();
}

/* Bọc drawChibi(): sheet của giới đang chơi đã nạp -> vẽ từ sheet; mọi trường
   hợp khác (NPC, ambient, sheet 404) đi đúng đường cũ, không đổi gì gameplay. */
const _skDrawChibi = drawChibi;
drawChibi = function (x, y, r) {
  if (r === 'p' && skSheetReady()) {
    try { skSheetChibi(x, y); return; } catch (e) {}
  }
  return _skDrawChibi(x, y, r);
};

/* ============================================================
   8. CHÂN DUNG AVATAR CŨNG LẤY TỪ SHEET (V22)
   ------------------------------------------------------------
   Ba khung ảnh đại diện của NAM trước đây cắt từ char_player.png rồi sơn
   lớp áo đo theo đường bao cũ -> đầu ngoài phố một kiểu, đầu trong thẻ HUD
   một kiểu. Giờ cắt đúng ô trực diện (cột 0) của hàng skin đang mặc trong
   sheet nên khớp 100% với nhân vật đi ngoài đường. NỮ giữ nguyên ảnh chân
   dung riêng icon-113.png như V15 — không đụng vào khung đã duyệt.
   Hình cắt: ô 150x178, thân căn giữa theo trục x, đầu bắt đầu từ dòng ~15,
   vai kết thúc ~dòng 92 -> vuông 84px cạnh, tâm x = 75.
   ============================================================ */
const SK_HEAD = { s: 84, top: 8, cx: 75 };
function skHeadInto(g, T, over) {
  const SH = skSheetImg(); if (!SH) return;
  const row = SK_ROW[skEquipped()] || 0, k = over || 0;
  try { g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; } catch (e) {}
  g.drawImage(SH, SK_HEAD.cx - SK_HEAD.s / 2, row * SK_GEO.CH + SK_HEAD.top,
              SK_HEAD.s, SK_HEAD.s, -k, -k, T + 2 * k, T + 2 * k);
}

/* thẻ HUD 132x132 — giữ đúng nền gradient của bản gốc, vẫn chặn vẽ lại mỗi frame */
let skAvSig = '';
const _skHudAv = renderHudAvatar;
renderHudAvatar = function () {
  const cv = document.getElementById('pc-av-cv');
  if (!(cv && playerGender === 'male' && skSheetReady())) { skAvSig = ''; _skHudAv(); return; }
  const sig = skEquipped() + '|sheet|' + cv.width;
  if (sig === skAvSig) return;
  skAvSig = sig;
  const g = cv.getContext('2d'), T = cv.width;
  g.clearRect(0, 0, T, T);
  const bg = g.createLinearGradient(0, 0, 0, T);
  bg.addColorStop(0, '#dff2ff'); bg.addColorStop(1, '#7ec8ff');
  g.fillStyle = bg; g.fillRect(0, 0, T, T);
  skHeadInto(g, T, 0);
};

/* khung chat 56x56: reskin.js cắt ô vuông ở đỉnh ảnh rồi phóng ra 64 (lệch 4px
   ra ngoài khung bo tròn) -> vẽ lại y hệt bằng ô sheet. */
const _skChatAv = drawAvatar;
drawAvatar = function (spk) {
  const s = String(spk || '');
  const me = s.includes('Nhân') || s.includes(playerName) || s === 'Bạn';
  if (!(me && playerGender === 'male' && skSheetReady())) return _skChatAv(spk);
  const acv = document.getElementById('av-cv'); if (!acv) return;
  const a = acv.getContext('2d');
  a.clearRect(0, 0, 56, 56);
  const g = a.createLinearGradient(0, 0, 0, 56);
  g.addColorStop(0, '#54b6ff'); g.addColorStop(1, '#2f9df0');
  a.fillStyle = g; a.fillRect(0, 0, 56, 56);
  skHeadInto(a, 56, 4);
};

/* bảng Tạo Nhân Vật 76x104: xem trước TOÀN THÂN theo giới đang chọn, dùng đúng
   ảnh sheet (CC là const của game.js, chỉ đọc chứ không sửa). */
const _skCcPrev = typeof ccPreview === 'function' ? ccPreview : null;
if (_skCcPrev) {
  ccPreview = function () {
    const cv = document.getElementById('cc-av');
    const im = (typeof CC !== 'undefined' && CC.g === 'female') ? IMG.femSprites : IMG.maleSprites;
    if (!(cv && im && assetsReady)) return _skCcPrev();
    const g = cv.getContext('2d');
    g.clearRect(0, 0, cv.width, cv.height);
    try { g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; } catch (e) {}
    const dh = cv.height, dw = dh * SK_GEO.CW / SK_GEO.CH;
    const row = SK_ROW[skEquipped()] || 0;
    g.drawImage(im, 0, row * SK_GEO.CH, SK_GEO.CW, SK_GEO.CH, (cv.width - dw) / 2, 0, dw, dh);
  };
}
