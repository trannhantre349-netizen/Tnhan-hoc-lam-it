/* ============================================================
   reskin.js — Lớp giao diện mới (chibi sáng màu)
   Ghi đè các hàm vẽ của game gốc; KHÔNG đụng vào logic gameplay.
   ============================================================ */

/* ---------- 0. ẢNH AI CẦN SMOOTHING (engine gốc tắt để vẽ pixel-art) ---------- */
try { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; } catch (e) {}
try { bg.imageSmoothingEnabled = true; bg.imageSmoothingQuality = 'high'; } catch (e) {}

/* ---------- 1. NỀN THẾ GIỚI: ảnh AI thay cho nền tuyết vẽ tay ---------- */
const _buildWorldBG0 = buildWorldBG;
buildWorldBG = function () {
  if (!assetsReady || !IMG.bg) { _buildWorldBG0(); return; }
  bg.clearRect(0, 0, 960, 600);
  bg.drawImage(IMG.bg, 0, 0, 960, 600); // 1536x960 -> đúng tỉ lệ 960x600
};

/* ---------- 2. TẮT TRANG TRÍ MÙA ĐÔNG / HIỆU ỨNG CŨ ---------- */
try { decor.length = 0; } catch (e) {}
drawCenterPiece = function () {};
drawPlazaEmblem = function () {};
drawPackets = function () {};

/* ---------- 3. NHÂN VẬT CHIBI (ảnh AI) ---------- */
const NPC_KEYS = ['lan', 'tuan', 'huong', 'duc', 'linh', 'khoa', 'mai', 'son'];

function chibiImgFor(r) {
  if (r === 'p') return IMG.chars.p;
  if (IMG.chars[r]) return IMG.chars[r];
  // npc đường phố (a0..a12) / vai trò ambient -> bốc theo hash cho ổn định
  let h = 0; const s = String(r);
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return IMG.chars[NPC_KEYS[h % NPC_KEYS.length]];
}

function drawChibi(x, y, r) {
  const img = chibiImgFor(r);
  if (!img) { _sprPixel(x, y, r); return; } // ảnh chưa nạp -> tạm vẽ pixel gốc
  const me = r === 'p';
  const A = window._amb;
  const moving = me ? S.p.moving : (A ? A.moving : false);
  const ph = (me ? S.p.step : (A ? A.ph : 0)) * 0.32;
  const dir = me ? (S.p.dir || 1) : (A ? A.dir : 1);
  const bob = moving ? Math.abs(Math.sin(ph)) * 2.2 : Math.sin(Date.now() / 600 + x) * 0.8;
  const H = me ? 50 : 46;
  const W = H * (img.width / img.height);
  const cx = x + 10, feet = y + 30;
  ctx.fillStyle = 'rgba(23,63,102,.22)';
  ctx.beginPath(); ctx.ellipse(cx, feet + 2, W * 0.30, 4.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.save();
  ctx.translate(cx, feet - bob);
  if (dir > 0) ctx.scale(-1, 1);
  ctx.drawImage(img, -W / 2, -H, W, H);
  /* móc cho skins.js sơn bộ trang phục lên ĐÚNG khung nhân vật (đã lật theo hướng đi) */
  try { if (typeof skOnChibi === 'function') skOnChibi(ctx, { x: -W / 2, y: -H, w: W, h: H }, r); } catch (e) {}
  ctx.restore();
}

/* giữ bản pixel gốc làm fallback */
const _sprPixel = _sprNoName;

function drawNameTag(x, y, r) {
  const me = r === 'p';
  const info = me ? [PLAYER_NAME, '#1d7fd6'] : IZ_NAMES[r];
  if (!info) return; // npc phố/ambient: không tag
  const [nm] = info;
  const cx = x + 10, ty = y - (me ? 46 : 40) + (me ? Math.sin(Date.now() / 330) * 1.5 : 0);
  ctx.save();
  ctx.font = (me ? 'bold 12.5px ' : 'bold 10.5px ') + (typeof IZF !== 'undefined' ? IZF : 'sans-serif');
  const w = ctx.measureText(nm).width + (me ? 20 : 14), h = me ? 20 : 16;
  // bong bóng tên trắng viền xanh
  ctx.fillStyle = 'rgba(255,255,255,.94)';
  rr(ctx, cx - w / 2, ty, w, h, h / 2); ctx.fill();
  ctx.strokeStyle = me ? '#3aa5ff' : '#bfe3ff'; ctx.lineWidth = me ? 2 : 1.4;
  rr(ctx, cx - w / 2, ty, w, h, h / 2); ctx.stroke();
  ctx.fillStyle = me ? '#3aa5ff' : 'rgba(255,255,255,.94)';
  ctx.beginPath(); ctx.moveTo(cx - 4, ty + h - .5); ctx.lineTo(cx + 4, ty + h - .5); ctx.lineTo(cx, ty + h + 4.5); ctx.closePath(); ctx.fill();
  if (!me) { ctx.strokeStyle = '#bfe3ff'; ctx.lineWidth = 1; ctx.stroke(); }
  ctx.textAlign = 'center';
  ctx.fillStyle = me ? '#1668b4' : '#274b6e';
  ctx.fillText(nm, cx, ty + h - (me ? 5.5 : 4.5));
  ctx.textAlign = 'left';
  ctx.restore();
}

/* NPC ambient (người qua lại) — thay pixel bằng chibi */
ambDraw = function (n) {
  const x = n.fx - 10, y = n.fy - 30;
  window._amb = { moving: n.moving, ph: n.ph, dir: n.dir };
  ctx.save();
  try {
    if (n.sit) { ctx.beginPath(); ctx.rect(x - 22, y - 34, 64, 58); ctx.clip(); }
    drawChibi(x, y, n.role);
  } finally { ctx.restore(); window._amb = null; }
  if (n.act === 'drink') {
    const cx = n.fx + n.dir * 9, cy = n.fy - 14;
    izb(cx - 3, cy - 4, 7, 9, 2, '#fff'); ctx.fillStyle = '#3aa5ff'; ctx.fillRect(cx - 2, cy, 5, 4);
  }
};

/* Vẽ nhân vật + depth-sort người qua lại quanh player (giữ nguyên bản bọc V6) */
drawSprite = function (x, y, r = 'p') {
  if (r === 'p') {
    let A = [], B = []; const pf = y + 30;
    try { const L = ambList().slice().sort((a, b) => a.fy - b.fy); A = L.filter(n => n.fy <= pf); B = L.filter(n => n.fy > pf); } catch (e) {}
    A.forEach(n => { try { ambDraw(n); } catch (e) {} });
    drawChibi(x, y, 'p'); drawNameTag(x, y, 'p');
    B.forEach(n => { try { ambDraw(n); } catch (e) {} });
    return;
  }
  drawChibi(x, y, r); drawNameTag(x, y, r);
};

/* ---------- 4. TOÀ NHÀ: biển hiệu cute trên nền AI ---------- */
drawBuilding = function (b, active) {
  const m = BLD_META[b.id] || { icon: '🏢', accent: b.c };
  /* buildingOpen/buildingLock/STAGES nằm ở game.js — guard để frame sớm không ném lỗi, loop sống */
  const hasBld = typeof buildingOpen === 'function' && typeof buildingLock === 'function';
  const open = !hasBld || buildingOpen(b.id);
  const lk = hasBld ? buildingLock(b.id) : null;
  const stage = hasBld ? STAGES.find(s => s.bld === b.id) : null;
  const done = stage ? !!S.missionsDone[stage.id] : false;
  const cx = b.x + b.w / 2, gy = b.y + b.h - 4;
  const t = Date.now() / 1000;

  // vệt sáng dưới chân cửa
  const puls = (Math.sin(t * (active ? 4.2 : 1.8)) + 1) / 2;
  const gg = ctx.createRadialGradient(cx, gy, 4, cx, gy, 60);
  gg.addColorStop(0, open ? `rgba(255,220,110,${active ? .5 + puls * .3 : .28})` : 'rgba(120,140,160,.18)');
  gg.addColorStop(1, 'rgba(255,220,110,0)');
  ctx.fillStyle = gg;
  ctx.beginPath(); ctx.ellipse(cx, gy + 2, 58, 16, 0, 0, Math.PI * 2); ctx.fill();

  // biển hiệu: bảng trắng bo tròn, viền màu accent, icon + tên
  const bob = active ? Math.sin(t * 4) * 2 : 0;
  const label = `${m.icon} ${b.name}`;
  ctx.save();
  ctx.font = 'bold 12.5px ' + (typeof IZF !== 'undefined' ? IZF : 'sans-serif');
  const bw = Math.max(120, ctx.measureText(label).width + 26), bh = 26;
  const bx = cx - bw / 2, by = b.y - 30 + bob;
  // cột + bóng
  ctx.fillStyle = 'rgba(23,63,102,.20)';
  rr(ctx, bx + 3, by + 4, bw, bh, 10); ctx.fill();
  ctx.fillStyle = open ? 'rgba(255,255,255,.95)' : 'rgba(226,232,240,.92)';
  rr(ctx, bx, by, bw, bh, 10); ctx.fill();
  ctx.strokeStyle = open ? (active ? '#ffc93c' : (m.accent || '#3aa5ff')) : '#94a3b8';
  ctx.lineWidth = active ? 3 : 2;
  rr(ctx, bx, by, bw, bh, 10); ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = open ? '#173f66' : '#64748b';
  ctx.fillText(label, cx, by + 17.5);
  // huy hiệu góc phải
  if (done) {
    ctx.fillStyle = '#35c96e'; ctx.beginPath(); ctx.arc(bx + bw - 2, by - 2, 10, 0, 7); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('✓', bx + bw - 2, by + 2);
  } else if (!open && lk) {
    ctx.fillStyle = '#173f66'; ctx.beginPath(); ctx.arc(bx + bw - 2, by - 2, 11, 0, 7); ctx.fill();
    ctx.strokeStyle = '#ffd95e'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#ffd95e'; ctx.font = 'bold 9px sans-serif'; ctx.fillText('Ải ' + lk.no, bx + bw - 2, by + 1.5);
  } else if (active) {
    ctx.fillStyle = '#ffc93c'; ctx.beginPath(); ctx.arc(bx + bw - 2, by - 2 + puls * 2, 9, 0, 7); ctx.fill();
    ctx.fillStyle = '#173f66'; ctx.font = 'bold 11px sans-serif'; ctx.fillText('▶', bx + bw - 1, by + 2 + puls * 2);
  }
  ctx.textAlign = 'left';
  ctx.restore();
};

/* ---------- 5. AVATAR HỘI THOẠI (canvas 56x56) ---------- */
const AV_MAP = [['Lan', 'lan'], ['Hương', 'huong'], ['Tuấn', 'tuan'], ['Đức', 'duc'],
  ['Linh', 'linh'], ['Khoa', 'khoa'], ['Mai', 'mai'], ['Sơn', 'son'],
  ['Bạn', 'p'], ['Nhân', 'p'], ['Bảo vệ', 'khoa'], ['T-REX', 'cre_rex_idle']];
drawAvatar = function (spk) {
  const acv = document.getElementById('av-cv'); if (!acv) return;
  const a = acv.getContext('2d');
  a.clearRect(0, 0, 56, 56);
  const g = a.createLinearGradient(0, 0, 0, 56);
  g.addColorStop(0, '#54b6ff'); g.addColorStop(1, '#2f9df0');
  a.fillStyle = g; a.fillRect(0, 0, 56, 56);
  const hit = AV_MAP.find(([k]) => spk.includes(k));
  const img = hit ? IMG.chars[hit[1]] : null;
  if (hit && hit[1].indexOf('cre_') === 0 && IMG.creatures) {
    // frame sinh vật: cắt từ sheet theo SHEET, căn giữa vào ô tròn 56x56
    const s = SHEET[hit[1]], size = Math.max(s.w, s.h);
    const dw = 56 * s.w / size, dh = 56 * s.h / size;
    a.drawImage(IMG.creatures, s.x, s.y, s.w, s.h, 28 - dw / 2, 28 - dh / 2, dw, dh);
  } else if (img) {
    // crop phần đầu+vai (55% trên) của ảnh đã trim, phóng vừa khung tròn
    const sw = img.width, sh = img.height * 0.55;
    const size = Math.min(sw, sh);
    a.drawImage(img, (sw - size) / 2, 0, size, size, -4, -4, 64, 64);
  } else {
    a.font = '30px sans-serif'; a.textAlign = 'center'; a.fillStyle = '#fff';
    a.fillText('🤖', 28, 40); a.textAlign = 'left';
  }
};

/* ---------- 5b. AVATAR HUD: CHÂN DUNG CẬN CẢNH (headshot) ----------
   Tách hẳn khỏi nhân vật đi dạo (vẫn vẽ toàn thân). Chỉ lấy phần đầu→vai
   của sprite rồi phóng to cho chủ thể chiếm ~85% diện tích ô, căn giữa.
   hudAvSig: vẽ lại chỉ khi skin / cỡ canvas / ảnh đổi -> không tốn CPU mỗi frame. */
const HUD_AV = { vBot: 0.48, fill: 0.922 };        // fill = sqrt(0.85): diện tích chủ thể ~85% ô
let hudAvSig = '';
function renderHudAvatar() {
  const cv = document.getElementById('pc-av-cv'); if (!cv) return;
  const img = IMG.chars.p;
  const sk = (typeof skEquipped === 'function') ? skEquipped() : 'default';
  const sig = sk + '|' + cv.width + '|' + (img && assetsReady ? img.width + 'x' + img.height : 'pending');
  if (sig === hudAvSig) return;
  hudAvSig = sig;
  const g = cv.getContext('2d'), T = cv.width;
  g.clearRect(0, 0, T, T);
  const bg = g.createLinearGradient(0, 0, 0, T);
  bg.addColorStop(0, '#dff2ff'); bg.addColorStop(1, '#7ec8ff');
  g.fillStyle = bg; g.fillRect(0, 0, T, T);
  if (!img || !assetsReady) return;
  try { g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; } catch (e) {}
  const cropH = img.height * HUD_AV.vBot;                 // đỉnh đầu → ngang vai/ngực trên
  const s = (T * HUD_AV.fill) / Math.max(img.width, cropH);
  const dw = img.width * s, dh = img.height * s;
  const dx = (T - dw) / 2;                                // căn giữa theo trục người
  const dy = (T - cropH * s) / 2;                         // vùng đầu+vai nằm giữa ô
  const layer = (typeof skPortraitLayer === 'function')
    ? skPortraitLayer(Math.round(dw), Math.round(dh)) : null;
  g.drawImage(layer || img, dx, dy, dw, dh);
}
renderHudAvatar();   // khung nền ngay khi nạp, assets.js sẽ gọi lại khi ảnh nhân vật sẵn sàng

/* ---------- 6. PANEL NHIỆM VỤ + KHU VỰC ---------- */
function renderQuestPanel() {
  const qpT = document.getElementById('qp-title');
  const qpS = document.getElementById('qp-steps');
  const qpR = document.getElementById('qp-reward');
  if (!qpT || !qpS) return;
  const cur = currentStage();
  if (!cur) {
    qpT.innerHTML = '🏆 Đã vượt toàn bộ ải!';
    qpS.innerHTML = '<div class="qp-step done"><span class="ck">✓</span><span>Network City đã an toàn</span></div>';
    if (qpR) qpR.innerHTML = '';
    return;
  }
  const m = MISSIONS.find(mm => mm.id === cur.s.id);
  qpT.innerHTML = `${cur.s.icon} <b>Ải ${cur.i + 1}/${STAGES.length}</b> — ${cur.s.name}`;
  const doneAll = !!S.missionsDone[cur.s.id];
  qpS.innerHTML = (m ? m.steps : []).map((st, idx) => {
    let cls = 'cur', ck = '▶';
    const isCur = (cur.s.id === 'nat') ? (idx === S.qStep - 1 && !doneAll) : (idx === 0 && !doneAll);
    const isDone = doneAll || (cur.s.id === 'nat' && idx < S.qStep - 1);
    if (isDone) { cls = 'done'; ck = '✓'; }
    else if (!isCur) { cls = 'todo'; ck = '·'; }
    return `<div class="qp-step ${cls}"><span class="ck">${ck}</span><span>${st}</span></div>`;
  }).join('');
  if (qpR) qpR.innerHTML = m ? `🎁 ${m.reward}` : '';
}

function renderAreaPanel() {
  const list = document.getElementById('ap-list'); if (!list) return;
  const items = [];
  Object.keys(BLD_META).forEach(id => {
    const b = (typeof blds !== 'undefined' ? blds.find(x => x.id === id) : null);
    const m = BLD_META[id];
    const hasBld = typeof buildingOpen === 'function' && typeof buildingLock === 'function';
    const open = !hasBld || buildingOpen(id);
    const lk = hasBld ? buildingLock(id) : null;
    const stage = hasBld ? STAGES.find(s => s.bld === id) : null;
    const done = stage ? !!S.missionsDone[stage.id] : false;
    const here = (typeof targetAct !== 'undefined') && targetAct && targetAct.t === 'bld' && targetAct.d && targetAct.d.id === id;
    items.push({
      id, icon: m.icon, name: b ? b.name : id, desc: m.desc || '',
      cls: here ? 'here' : (open ? '' : 'locked'),
      tag: done ? '✅ Xong' : (open ? (here ? '📍 Đang ở' : '▶ Vào') : `🔒 Ải ${lk ? lk.no : '?'}`)
    });
  });
  items.push({ id: 'STREET', icon: '🛣️', name: 'PHỐ MÁY TÍNH', desc: 'Sửa máy kiếm coin', cls: '', tag: '▶ Ra phố' });
  list.innerHTML = items.map(it =>
    `<div class="ap-item ${it.cls}" onclick="areaGo('${it.id}')">
       <span class="ap-ic">${it.icon}</span>
       <span><div class="ap-nm">${it.name}</div><div class="ap-sub">${it.desc}</div></span>
       <span class="ap-st">${it.tag}</span>
     </div>`).join('');
}

/* bọc hàm cũ: mỗi lần game cập nhật HUD quest -> vẽ lại panel mới */
const _updateQuestHUD0 = updateQuestHUD;
updateQuestHUD = function () {
  _updateQuestHUD0();
  try { renderQuestPanel(); renderAreaPanel(); } catch (e) {}
};

/* ---------- 7. CẢNH TRONG NHÀ: nâng sáng cho hợp theme ---------- */
const _renderReskin = render;
render = function () {
  _renderReskin();
  const cvEl = document.getElementById('cv');
  if (cvEl) {
    const f = (S.scene === 'WORLD' || S.scene === 'STREET') ? 'none' : 'brightness(1.55) saturate(1.15) contrast(.92)';
    if (cvEl.style.filter !== f) cvEl.style.filter = f;
  }
};

/* khởi tạo panel lần đầu */
try { renderQuestPanel(); renderAreaPanel(); } catch (e) {}
