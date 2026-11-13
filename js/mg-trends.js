/* ============================================================
   mg-trends.js — V47: 4 TRẠM CÔNG NGHỆ XU HƯỚNG + 4 MINIGAME
   V48: Khu 1 Trung Tâm được dọn sạch — AI lên Mặt Trăng, Tường Lửa xuống
   Địa Ngục, Scam dời ra khỏi cụm Mèo Cam.
   ------------------------------------------------------------
   ADD-ONLY: file này KHÔNG sửa code cũ. Toàn bộ dựng trạm và mở hộp
   ải đi qua các hook bọc an toàn:
     · STREET  -> bọc drawAccident (vẽ trong translate(-camX), trước nhân vật)
     · HEAVEN + LUNAR_BASE -> bọc drawSprite(kind 'p') để chen vào ngay trước
       lệnh vẽ nhân vật của hvScene / drawLunarBase
     · HELL    -> bọc hlStList để chen vào list {k=chân, f} của Khu 6
     · update / doAction / mgFrame -> bọc kiểu `const _old = fn; fn = function(){}`
   Nạp TRƯỚC widescreen.js để wrapper setTransform của nó vẫn là lớp ngoài cùng.
   ============================================================ */

/* ---------- 1. ĐỊNH NGHĨA 4 TRẠM ----------
   x,y = điểm CHẠM ĐẤT (feet) trong toạ độ thế giới của từng cảnh; ảnh vẽ
   nguyên khổ box cắt từ assets/img/baked/station_*.png (đo bằng alpha trong
   tools/bake-hell.cjs) nên ĐÁY nét luôn nằm đúng y, bất kể ảnh gốc 1024x1024
   có lề trắng.  h = cao hiển thị (100-120px, giữ tỷ lệ gốc).
   V48: Khu 1 Trung Tâm được trả lại thoáng đãng — 2 trạm ở WORLD dời đi, và
   trạm Scam dời ra khỏi cụm Mèo Cam. Vị trí đã đo trên ảnh nền:
     · LUNAR_BASE (400,510): bãi regolith trống giữa Trạm cáp (195,540) và
       vòm an ninh (600,555), cách Server Biodome (442,372) 138px nên không
       giành vùng [E] của ải nào; nằm BẮT qua dải đi bộ của Kỹ sư An
       (310..490 @560) nên trạm đứng sau người, đúng phối cảnh.
     · STREET (1310,332) : vỉa hè trống giữa tiệm 1150 và 1470, không trùng
       mèo / NPC / cột đèn nào.
     · HELL (2415,546)   : đại lộ Âm Phủ, cách Trạm 5 (2230) và Quỷ Vương
       (2600) đúng 185px — hitbox r=66 của hai bên không chạm nhau.
     · HEAVEN (500,385)  : mặt mây trống giữa trạm 1 (302..442) và trạm 2 (534..674) */
const MGT_ST = [
  { i: 0, id: 'mgt_ai',    g: 'ai',    sc: 'LUNAR_BASE', x: 400,  y: 510, h: 118, img: 'stAiAudit',
    box: [120, 74, 892, 954],  rgb: '56,189,248',  icon: '🕵️', sign: 'KIỂM DUYỆT VIÊN AI',   xp: 60, coin: 120 },
  { i: 1, id: 'mgt_scam',  g: 'scam',  sc: 'STREET',     x: 1310, y: 332, h: 112, img: 'stAntiScam',
    box: [120, 82, 947, 946],  rgb: '244,63,94',   icon: '🚨', sign: 'THỢ SĂN LINK SCAM',    xp: 65, coin: 130 },
  { i: 2, id: 'mgt_ddos',  g: 'ddos',  sc: 'HELL',       x: 2415, y: 546, h: 120, img: 'stFirewall',
    box: [95, 69, 928, 926],   rgb: '251,146,60',  icon: '🛡️', sign: 'PHÒNG THỦ TƯỜNG LỬA',  xp: 75, coin: 150 },
  { i: 3, id: 'mgt_route', g: 'route', sc: 'HEAVEN',     x: 500,  y: 385, h: 100, img: 'stRouting',
    box: [18, 74, 1005, 957],  rgb: '167,139,250', icon: '🔀', sign: 'XOAY MẠCH ĐỊNH TUYẾN', xp: 80, coin: 160 }
];
MGT_ST.forEach(s => { s.act = '[E] ' + s.icon + ' ' + s.sign; });
const MGT_R = 50;              // bán kính vùng [E] — nhỏ hơn ải cũ để không giành targetAct
const MGT_W = 760, MGT_H = 380;
const MGT = { last: 0, alertSet: 0, alertOn: false, done: 0 };

/* Cờ hoàn thành là boolean của file save → PHẢI khai STAGE_IDS để applySave()
   không xoá key lạ, và phải thêm lại vào S.missionsDone ngay lúc nạp. */
if (!S.missionsDone) S.missionsDone = {};
for (const s of MGT_ST) {
  if (typeof STAGE_IDS !== 'undefined' && STAGE_IDS) STAGE_IDS[s.id] = 1;
  if (!(s.id in S.missionsDone)) S.missionsDone[s.id] = false;
}

/* ---------- 2. TIỆN ÍCH VẼ ---------- */
function mgtImg(k) { const im = IMG[k]; return (im && (im.naturalWidth || im.width)) ? im : null; }
function mgtRR(g, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  g.beginPath();
  g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
  g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
  g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y);
  g.closePath();
}
function mgtTx(g, s, x, y, o) {
  o = o || {};
  g.save();
  g.font = (o.w || 700) + ' ' + (o.s || 14) + 'px ' + (o.mono ? MG_MONO : '"Segoe UI",system-ui,sans-serif');
  g.textAlign = o.a || 'left';
  g.textBaseline = o.b || 'alphabetic';
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = o.gs || 10; }
  g.fillStyle = o.c || '#dbeafe';
  g.fillText(s, x, y);
  g.restore();
}
/* Ngắt dòng theo bề rộng — câu chữ tiếng Việt dài, bắt buộc phải wrap. */
function mgtWrap(g, s, maxW, size, mono) {
  g.save();
  g.font = (mono ? '700 ' : '600 ') + size + 'px ' + (mono ? MG_MONO : '"Segoe UI",system-ui,sans-serif');
  const words = String(s).split(/\s+/), lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  g.restore();
  return lines;
}

/* ---------- 3. DỰNG TRẠM (ảnh + bóng + bảng hiệu neon) ---------- */
function mgtSign(g, s, t) {
  if (typeof hvCap !== 'function') return;
  const done = !!S.missionsDone[s.id];
  const top = s.y + 2 - s.h - (26 + Math.round(s.h * .12));
  g.save();
  g.globalCompositeOperation = 'lighter';
  if (typeof hvGlow === 'function') hvGlow(g, s.x, top + 13, 54, s.rgb, (done ? .30 : .18) + .05 * Math.sin(t * 2.4 + s.i));
  g.restore();
  hvCap(g, s.x, top, (done ? '✔ ' : '') + s.icon + ' ' + s.sign, {
    font: 'bold 12px ', h: 24, r: 8, pad: 16,
    bg: done ? 'rgba(6,38,20,.95)' : 'rgba(6,12,26,.92)',
    rim: 'rgba(' + s.rgb + ',.9)', lw: 1.8, fg: done ? '#bbf7d0' : '#eaf6ff', blur: 12, olw: 1.3 });
}
function mgtDraw(g, s, t) {
  const b = s.box, bw = b[2] - b[0] + 1, bh = b[3] - b[1] + 1;
  const feetY = s.y + 2, k = s.h / bh, dw = bw * k, dh = bh * k;
  const im = mgtImg(s.img);
  /* bóng tiếp xúc: không có thì trạm trông như dán nổi trên nền */
  g.save();
  g.fillStyle = 'rgba(0,8,20,.34)';
  g.beginPath(); g.ellipse(s.x, feetY - 2, dw * .38, 7, 0, 0, 6.2832); g.fill();
  g.restore();
  g.save();
  g.globalCompositeOperation = 'lighter';
  if (typeof hvGlow === 'function') hvGlow(g, s.x, feetY - dh * .42, dh * .62, s.rgb, .10 + .04 * Math.sin(t * 1.8 + s.i));
  g.restore();
  if (!im) {                                    // ảnh chưa về: trụ neon + hitbox vẫn đúng
    g.save();
    g.strokeStyle = 'rgba(' + s.rgb + ',.85)'; g.lineWidth = 3;
    mgtRR(g, s.x - dw / 2, feetY - dh, dw, dh, 12); g.stroke();
    g.fillStyle = 'rgba(' + s.rgb + ',.12)'; g.fill();
    g.restore();
  } else {
    g.save();
    try { g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; } catch (e) {}
    g.drawImage(im, b[0], b[1], bw, bh, s.x - dw / 2, feetY - dh, dw, dh);
    g.restore();
  }
  mgtSign(g, s, t);
}

/* ---------- 4. MÓC NỐI VẺO TỪNG CẢNH ---------- */
/* STREET: vẽ trong drawAccident — lúc đó ctx đã translate(-camX) và chưa vẽ
   nhân vật, nên trạm đứng ĐÚNG phối cảnh với người đi dạo (học theo hell.js). */
const _mgtOldAcc = drawAccident;
drawAccident = function () {
  _mgtOldAcc.apply(this, arguments);
  if (S.scene !== 'STREET') return;
  const s = MGT_ST[1];
  try { mgtDraw(ctx, s, Date.now() / 1000); } catch (e) {}
};

/* HEAVEN + LUNAR_BASE: hai cảnh này không có depth sort riêng mà gọi
   drawSprite(x, y, 'p') để vẽ NHÂN VẬT (hvScene tự xếp list, drawLunarBase vẽ
   người sau cùng). Móc vào đúng lệnh đó rồi vẽ trạm TRƯỚC nếu trạm ở xa hơn
   (chân cao hơn), SAU nếu trạm gần hơn. Chỉ bắt kind 'p' để không vẽ lặp khi
   thỏ/NPC gọi drawSprite. */
const MGT_SPR = {};
for (const s of MGT_ST) if (s.sc === 'HEAVEN' || s.sc === 'LUNAR_BASE') MGT_SPR[s.sc] = s;
const _mgtOldSpr = drawSprite;
drawSprite = function (x, y, r) {
  const s = MGT_SPR[S.scene];
  if (!s || (r || 'p') !== 'p') return _mgtOldSpr.apply(this, arguments);
  const near = s.y + 2 > y + 30;
  if (!near) { try { mgtDraw(ctx, s, Date.now() / 1000); } catch (e) {} }
  _mgtOldSpr.apply(this, arguments);
  if (near) { try { mgtDraw(ctx, s, Date.now() / 1000); } catch (e) {} }
};

/* HELL: hell.js tự xếp list {k=chân, f=vẽ} trong lúc ctx còn translate(-cam).
   Móc hlStList để chen trạm vào cùng band chiều sâu 476 của 5 trạm Âm Phủ —
   không tự vẽ ở lớp phủ vì lớp đó nằm NGOÀI translate và đè lên nhân vật. */
if (typeof hlStList === 'function') {
  const _mgtOldHlSt = hlStList, s = MGT_ST[2];
  hlStList = function (list, vis, t) {
    _mgtOldHlSt.apply(this, arguments);
    if (S.scene !== 'HELL' || !vis(s.x)) return;
    list.push({ k: 476, f: () => { try { mgtDraw(ctx, s, t); } catch (e) {} } });
  };
}

/* ---------- 5. NHÃN [E] + NÚT CHẠM MOBILE ---------- */
function mgtBusy() {
  if (typeof openModalEl === 'function' && openModalEl()) return true;
  if (typeof anyCtlModalOpen === 'function' && anyCtlModalOpen()) return true;
  try { if (typeof HV_CUT !== 'undefined' && HV_CUT) return true; } catch (e) {}
  try { if (typeof HL_CUT !== 'undefined' && HL_CUT) return true; } catch (e) {}
  return false;
}
function mgtPrompt() {
  if (targetAct || mgtBusy()) return;
  const sc = S.scene;
  /* STREET và HELL cuộn ngang: S.p.x là x MÀN HÌNH, còn trạm lưu x THẾ GIỚI. */
  if (sc !== 'STREET' && sc !== 'HEAVEN' && sc !== 'LUNAR_BASE' && sc !== 'HELL') return;
  const cam = (sc === 'STREET' || sc === 'HELL') ? (window._camX || 0) : 0;
  const cx = S.p.x + 10 + cam, cy = S.p.y + (sc === 'STREET' ? 30 : 18);
  for (const s of MGT_ST) {
    if (s.sc !== sc) continue;
    if (Math.hypot(cx - s.x, cy - s.y) < MGT_R) {
      targetAct = { t: 'mgt_st', i: s.i, txt: s.act + (S.missionsDone[s.id] ? ' (làm lại)' : '') };
      return;
    }
  }
}
const _mgtOldUpd = update;
update = function () { _mgtOldUpd.apply(this, arguments); mgtPrompt(); };

const _mgtOldAct = doAction;
doAction = function () {
  if (targetAct && targetAct.t === 'mgt_st') { mgtOpen(MGT_ST[targetAct.i].g); return; }
  _mgtOldAct.apply(this, arguments);
};

/* ---------- 6. DẢI BÁO ĐỘNG ĐỎ ĐẦU MÀN HÌNH (mở nhanh ải Tường Lửa) ---------- */
const MGT_ALERT_MS = 22000, MGT_ALERT_GAP = 95000;
function mgtAlertEl() {
  let e = document.getElementById('mgt-alert');
  if (e) return e;
  e = document.createElement('div');
  e.id = 'mgt-alert';
  /* width:max-content + max-width:88%: dải dài hơn khung #app thì tự xuống
     dòng thay vì tràn ra mép trái (mất chữ). Bỏ white-space:nowrap vì nowrap
     chặn hẳn việc co lại theo max-width. */
  e.style.cssText = 'display:none;position:absolute;top:56px;left:50%;transform:translateX(-50%);' +
    'width:max-content;max-width:88%;text-align:center;' +
    'z-index:119;align-items:center;gap:10px;padding:7px 16px;border-radius:11px;cursor:pointer;' +
    'background:linear-gradient(90deg,#7f1d1d,#dc2626 45%,#b91c1c);border:2px solid #fecaca;' +
    'box-shadow:0 10px 26px rgba(120,20,20,.5),0 0 0 3px rgba(239,68,68,.25);' +
    'color:#fff;font:800 12.5px "Segoe UI",sans-serif;pointer-events:auto;';
  e.innerHTML = '<span style="font-size:15px">🚨</span>' +
    '<span style="min-width:0">CẢNH BÁO DDoS — Server lõi đang bị botnet bắn! CHẠM ĐỂ PHÒNG THỦ</span>' +
    '<span style="font-size:11px;opacity:.85">[TƯỜNG LỬA]</span>';
  e.addEventListener('click', function () { sfxPlay('pop'); mgtOpen('ddos'); });
  e.addEventListener('touchstart', function () { }, { passive: true });
  document.getElementById('app').appendChild(e);
  return e;
}
function mgtAlertPaint(on) {
  const e = mgtAlertEl();
  if (on !== MGT.alertOn) { MGT.alertOn = on; e.style.display = on ? 'flex' : 'none'; }
  if (on) e.style.animation = (Math.floor(Date.now() / 400) % 2) ? 'none' : 'mgtPulse .8s infinite';
}
try {
  const st = document.createElement('style');
  st.textContent = '@keyframes mgtPulse{50%{filter:brightness(1.35)}}';
  document.head.appendChild(st);
} catch (e) {}

/* ---------- 7. VỎ HỘP ẢI ---------- */
let MGM = null;                                   // { s, mod, g, t, acc }
function mgmVisible() { return mgVis('mgt-mini'); }
function mgtEl() {
  let m = document.getElementById('mgt-mini');
  if (!m) {
    m = document.createElement('div');
    m.id = 'mgt-mini'; m.className = 'modal';
    document.getElementById('app').appendChild(m);
  }
  return m;
}
function mgtLayout(title, sub) {
  const m = mgtEl();
  m.style.cssText = 'display:flex;flex-direction:column;gap:8px;position:absolute;inset:14px 76px;transform:none;animation:none;padding:14px 20px 12px;background:linear-gradient(160deg,#0d1030,#05070f);border:2px solid #67e8f9;border-radius:18px;color:#e6f6ff;font:13px "Segoe UI",sans-serif;z-index:120;box-shadow:0 20px 60px #000c';
  m.innerHTML =
    '<div id="mgt-mini-hd" style="display:flex;justify-content:space-between;align-items:center"></div>' +
    '<div id="mgt-mini-hint" style="font-size:12px;color:#a5f3fc;min-height:16px"></div>' +
    '<div style="display:flex;justify-content:center"><canvas id="mgt-mini-cv" style="width:760px;max-width:100%;display:block;border-radius:12px;background:#060a18;touch-action:none;cursor:pointer"></canvas></div>' +
    '<div id="mgt-mini-foot" style="display:flex;justify-content:center;align-items:center;gap:10px;min-height:34px"></div>';
  document.getElementById('mgt-mini-hd').innerHTML =
    '<b style="font-size:16px;color:#fde047;text-shadow:0 2px 0 #000,0 0 12px #000">' + title + '</b>' +
    '<span style="display:flex;gap:10px;align-items:center;font-size:12px;color:#9fd7ea">' + sub +
    '<button onclick="mgtClose()" style="background:#141b33;color:#fff;border:1px solid #4762a0;border-radius:8px;padding:2px 10px;cursor:pointer">✖</button></span>';
  const cv = document.getElementById('mgt-mini-cv');
  const pos = ev => mgPoint(cv, ev, MGT_W, MGT_H);
  cv.addEventListener('pointerdown', ev => {
    try { cv.setPointerCapture(ev.pointerId); } catch (e) {}
    if (MGM && MGM.mod.ptr) MGM.mod.ptr(MGM.g, 'down', pos(ev));
  });
  cv.addEventListener('pointermove', ev => { if (MGM && MGM.mod.ptr) MGM.mod.ptr(MGM.g, 'move', pos(ev)); });
  cv.addEventListener('pointerup', ev => { if (MGM && MGM.mod.ptr) MGM.mod.ptr(MGM.g, 'up', pos(ev)); });
  cv.addEventListener('pointercancel', () => { if (MGM && MGM.mod.ptr) MGM.mod.ptr(MGM.g, 'up', { x: -99, y: -99 }); });
  return m;
}
function mgtFootBtns() {
  const f = document.getElementById('mgt-mini-foot');
  if (!f) return;
  const B = 'padding:8px 16px;border:1px solid #4762a0;border-radius:12px;background:#141b33;color:#cfe6ff;cursor:pointer;font-size:12px;font-weight:700';
  const over = MGM && MGM.g.over;
  f.innerHTML =
    (over ? '<button onclick="mgtReplay()" style="' + B + ';background:#1d2a52">🔄 CHẠY LẠI</button>'
          : (MGM && MGM.mod.again ? '<button onclick="mgtReplay()" style="' + B + '">' + MGM.mod.again + '</button>' : '')) +
    '<button onclick="mgtClose()" style="' + B + '">✖ THOÁT</button>';
}
function mgtHint(txt) {
  const h = document.getElementById('mgt-mini-hint');
  if (h && h.textContent !== txt) h.textContent = txt;
}
function mgtClose() {
  const m = document.getElementById('mgt-mini');
  if (m) m.style.display = 'none';
  MGM = null;
  MGT.alertSet = performance.now() + MGT_ALERT_GAP;   // vừa chơi xong: để yên một nhịp dài
  mgtAlertPaint(false);
  sfxPlay('pop');
}
function mgtReplay() { if (MGM) mgtStart(MGM.s.g); }
function mgtDoneCount() { return MGT_ST.filter(s => !!S.missionsDone[s.id]).length; }

function mgtOpen(kind) {
  if (mgtBusy()) return;
  if (!MGT_MODS[kind]) return;
  MGT.last = performance.now();
  mgtStart(kind);
  sfxPlay('pop');
}
function mgtStart(kind) {
  const s = MGT_ST.filter(o => o.g === kind)[0];
  const mod = MGT_MODS[kind];
  mgtLayout(s.icon + ' ' + s.sign, '🏢 Trạm xu hướng: ' + mgtDoneCount() + '/4');
  MGM = { s: s, mod: mod, g: mod.init(), t: 0 };
  mgtFootBtns();
  mgtHint(mod.hint);
  const m = document.getElementById('mgt-mini');
  m.style.display = 'flex';
  MGT.last = performance.now();
}

/* Thưởng — đi qua addXP/addCoin chuẩn (skin CTO vẫn nhân hệ số) rồi ghi save. */
function mgtWin(s, scoreTxt) {
  const first = !S.missionsDone[s.id];
  s.lastFirst = first;
  S.missionsDone[s.id] = true;
  /* Phần thưởng chỉ tính lần đầu (đồng khuôn hlMgWin) — chơi lại chỉ để xem lại ải. */
  if (first) {
    addXP(s.xp); addCoin(s.coin);
    if (typeof saveGame === 'function') saveGame();
  }
  sfxPlay('coin');
  if (typeof showBanner === 'function')
    showBanner('✔ TRẠM HOÀN THÀNH', s.icon + ' ' + s.sign,
      first ? '+' + s.xp + ' XP · +' + s.coin + ' Coin' : (scoreTxt || 'Đạt rồi') + ' · (làm lại không cộng thưởng)', 'green');
  else if (typeof showToast === 'function')
    showToast('✔ ' + s.sign + (first ? ' +' + s.xp + ' XP +' + s.coin + ' Coin' : ' (làm lại)'));
}
function mgtLose(s) {
  sfxPlay('pop');
  if (typeof showToast === 'function') showToast('✖ ' + s.sign + ': chưa đạt, bấm CHẠY LẠI để thử tiếp');
}

/* ---------- 8. TỪNG ẢI ---------- */
const MGT_MODS = {};

/* ===== 8a. 🕵️ KIỂM DUYỆT VIÊN AI — Papers, Please thu nhỏ ===== */
const MGT_AI = [
  { u: 'Địa chỉ 192.168.1.350 có phải IP hợp lệ không?', a: 'Hợp lệ, vì 192.168 là dải mạng nội bộ.', ok: false, why: 'Mỗi octet IPv4 chỉ 0–255. Số 350 là AI bịa.' },
  { u: 'Vì sao cáp quang ít bị nhiễu hơn cáp đồng?', a: 'Cáp quang truyền bằng ánh sáng nên không nhiễm nhiễu điện từ.', ok: true, why: 'Đúng: ánh sáng không bị ảnh hưởng bởi từ trường.' },
  { u: 'Rút điện rồi, dữ liệu trên RAM còn không?', a: 'Còn, RAM lưu dữ liệu vĩnh viễn kể cả khi mất điện.', ok: false, why: 'RAM là bộ nhớ tạm; ổ cứng/SSD mới lưu vĩnh viễn.' },
  { u: 'HTTPS chạy ở cổng nào?', a: 'Mặc định HTTPS dùng cổng 443/TCP.', ok: true, why: 'Đúng: 443 cho HTTPS, 80 cho HTTP.' },
  { u: 'Mạng /24 có bao nhiêu host dùng được?', a: '/24 nghĩa là 256 host dùng được trong mạng.', ok: false, why: 'Trừ địa chỉ mạng và broadcast, chỉ còn 254.' },
  { u: 'Thiết bị nào chuyển mạch ở Layer 2 theo địa chỉ MAC?', a: 'Switch hoạt động ở Layer 2 và chuyển khung tin theo MAC.', ok: true, why: 'Đúng: router mới làm việc ở Layer 3.' },
  { u: 'Lệnh nào xem bảng định tuyến trên Windows?', a: 'Dùng ipconfig /all để xem bảng định tuyến.', ok: false, why: 'Bảng định tuyến là route print; ipconfig chỉ hiện thông số card.' },
  { u: 'DNS dùng để làm gì?', a: 'DNS phân giải tên miền thành địa chỉ IP.', ok: true, why: 'Đúng: đó là nhiệm vụ chính của DNS.' },
  { u: 'Dây mạng Cat6 thuộc Layer nào trong mô hình OSI?', a: 'Cáp thuộc Layer 3 – Network vì nó mang gói tin đi xa.', ok: false, why: 'Cáp vật lý là Layer 1 – Physical.' },
  { u: '1 Gb/s bằng bao nhiêu Mb/s?', a: '1 Gigabit mỗi giây bằng 1000 Megabit mỗi giây.', ok: true, why: 'Đúng: hệ thập phân của chuẩn Ethernet.' },
  { u: 'Máy nhận IP 169.254.x.x nghĩa là gì?', a: 'Nghĩa là máy vừa nhận IP mới từ DHCP, mọi thứ đang bình thường.', ok: false, why: '169.254 là APIPA: không liên lạc được với DHCP server.' },
  { u: 'Thứ tự màu dây chuẩn T568B là gì?', a: 'Cam – Trắng cam – Lục – Trắng lam – Lam – Trắng lục – Nâu – Trắng nâu.', ok: false, why: 'Dãy đó trộn lẫn. T568B: Trắng cam–Cam–Trắng lục–Lam–Trắng lam–Lục–Trắng nâu–Nâu.' },
  { u: 'VLAN dùng để làm gì?', a: 'VLAN chia một switch vật lý thành nhiều mạng logic, cô lập broadcast.', ok: true, why: 'Đúng: lợi ích chính của VLAN là thu nhỏ miền broadcast.' },
  { u: 'SSH mặc định chạy trên cổng nào?', a: 'SSH dùng cổng 22, thay cho Telnet không mã hoá.', ok: true, why: 'Đúng: Telnet (23) gửi mật khẩu dạng plaintext.' },
  { u: 'Máy in mạng in chậm, nên xử lý sao?', a: 'Tắt tính năng chống virus của máy in laser vì nó làm nghẽn đường truyền giấy.', ok: false, why: 'Máy in laser không có "antivirus nghẽn giấy". Nguyên nhân thật thường là driver, bộ nhớ đệm hoặc mạng.' },
  { u: 'DHCP lease là gì?', a: 'Là thời hạn một địa chỉ IP được cấp cho thiết bị, hết hạn thì phải gia hạn.', ok: true, why: 'Đúng: máy sẽ tự xin gia hạn ở nửa chu kỳ lease.' }
];
MGT_MODS.ai = {
  hint: 'Đọc câu hỏi và câu trả lời của AI, rồi phán: ✅ HỢP LỆ hay ❌ AI BỊA ĐẶT. 15 giây mỗi câu, 5 câu một ván, đúng 4/5 là thắng.',
  again: '🔄 VÁN KHÁC',
  init() {
    const pool = MGT_AI.slice().sort(() => Math.random() - .5).slice(0, 5);
    return { qs: pool, n: 0, ok: 0, t: 15, flash: 0, good: false, over: 0, msg: '', dead: false };
  },
  ptr(g, kind, p) {
    if (kind !== 'down' || g.over || g.flash > 0) return;
    if (p.y < 300) return;
    const side = p.x < MGT_W / 2 ? 1 : 0;
    this.judge(g, side);
  },
  judge(g, side) {
    const q = g.qs[g.n];
    if (!q) return;
    const say = (side === 1) === q.ok;
    g.ok += say ? 1 : 0;
    g.flash = 1.5; g.good = say;
    g.msg = (say ? '✔ ' : '✖ ') + q.why;
    sfxPlay(say ? 'coin' : 'pop');
  },
  tick(g, dt) {
    if (g.over) return;
    if (g.flash > 0) {
      g.flash -= dt;
      if (g.flash <= 0) {
        g.n++;
        if (g.n >= g.qs.length) {
          g.over = g.ok >= 4 ? 1 : 2;
          g.dead = true;
          if (g.over === 1) mgtWin(MGT_ST[0], 'Đúng ' + g.ok + '/5 câu'); else mgtLose(MGT_ST[0]);
        } else g.t = 15;
      }
      return;
    }
    g.t -= dt;
    if (g.t <= 0) { g.flash = 1.2; g.good = false; g.msg = '⏱ Hết giờ! Câu đúng là: ' + (g.qs[g.n].ok ? 'HỢP LỆ' : 'AI BỊA ĐẶT'); sfxPlay('pop'); }
  },
  draw(g, c, t) {
    mgtShell(c, '🕵️', '57,254,220');
    const q = g.qs[Math.min(g.n, g.qs.length - 1)];
    mgtTx(c, 'CÂU ' + (Math.min(g.n + 1, g.qs.length)) + '/' + g.qs.length + '   ✔ ' + g.ok, 24, 30, { s: 15, c: '#a5f3fc', mono: true });
    mgtTx(c, '⏱ ' + Math.max(0, g.t).toFixed(1) + 's', MGT_W - 24, 30, { s: 15, a: 'right', c: g.t < 5 ? '#fca5a5' : '#a5f3fc', mono: true });
    /* thanh đếm giờ */
    c.save();
    c.fillStyle = 'rgba(255,255,255,.10)'; mgtRR(c, 24, 38, MGT_W - 48, 7, 4); c.fill();
    c.fillStyle = g.t < 5 ? '#ef4444' : '#22d3ee';
    mgtRR(c, 24, 38, Math.max(0, (MGT_W - 48) * g.t / 15), 7, 4); c.fill();
    c.restore();
    /* thẻ người dùng */
    mgtCard(c, 24, 56, MGT_W - 48, 66, 'rgba(15,32,60,.92)', '#7dd3fc', '🧑 NGƯỜI DÙNG HỎI');
    const l1 = mgtWrap(c, q.u, MGT_W - 90, 17);
    for (let i = 0; i < l1.length; i++) mgtTx(c, l1[i], 44, 96 + i * 21, { s: 17, w: 600, c: '#eaf6ff' });
    /* thẻ AI */
    mgtCard(c, 24, 130, MGT_W - 48, 74, 'rgba(30,18,52,.92)', '#c084fc', '🤖 TRỢ LÝ AI TRẢ LỜI');
    const l2 = mgtWrap(c, q.a, MGT_W - 90, 18);
    for (let i = 0; i < l2.length; i++) mgtTx(c, l2[i], 44, 172 + i * 22, { s: 18, w: 700, c: '#f5e8ff' });
    /* hai nút phán */
    const hot = g.flash > 0;
    mgtBigBtn(c, 24, 300, 348, 62, '✅  HỢP LỆ', hot && g.good ? '#22c55e' : 'rgba(20,60,45,.9)', '#4ade80');
    mgtBigBtn(c, 388, 300, 348, 62, '❌  AI BỊA ĐẶT', hot && !g.good ? '#dc2626' : 'rgba(70,20,26,.9)', '#fb7185');
    if (hot) {
      const lines = mgtWrap(c, g.msg, MGT_W - 120, 15);
      mgtCard(c, 36, 214, MGT_W - 72, 20 + lines.length * 19, g.good ? 'rgba(12,54,34,.95)' : 'rgba(58,12,16,.95)', g.good ? '#4ade80' : '#f87171', '');
      for (let i = 0; i < lines.length; i++) mgtTx(c, lines[i], MGT_W / 2, 240 + i * 19, { s: 15, a: 'center', c: '#f1f5f9' });
    }
    if (g.over) mgtResult(c, g.over === 1, 'Đúng ' + g.ok + '/5 câu · cần 4 để thắng', MGT_ST[0]);
  }
};

/* ===== 8b. 🚨 THỢ SĂN LINK SCAM — vuốt thẻ ===== */
const MGT_SCAM = [
  { k: 'SMS', t: '"Vietcombank: Tài khoản của bạn bị khóa. Soạn XACTHUC-OTP-9812 gửi 9146 để mở khóa ngay."', bad: true, why: 'Ngân hàng KHÔNG bao giờ hỏi OTP qua tin nhắn.' },
  { k: 'EMAIL', t: '"GẤP – Giám đốc nhờ chuyển 500 triệu cho đối tác, làm gấp, không cần gọi lại xác nhận."', bad: true, why: 'Mẹo giả danh sếp (BEC): luôn xác nhận qua số điện thoại nội bộ.' },
  { k: 'LINK', t: 'https://vietcombank-xacthuc.vn.xyz/login', bad: true, why: 'Domain thật là vietcombank.com.vn; ".vn.xyz" là tên giả.' },
  { k: 'LINK', t: 'https://github.com/settings/security — bật 2FA cho tài khoản nội bộ', bad: false, why: 'Đúng domain github.com, thao tác do tự mình mở.' },
  { k: 'NỘI BỘ', t: 'Thông báo bảo trì mạng 20:00 tối nay — có chữ ký phòng IT và mã ticket HD-1187', bad: false, why: 'Có ticket tra được trong hệ thống giúp việc.' },
  { k: 'SMS', t: '"Chúc mừng bạn trúng 1 chỉ SJC! Gửi CCCD + ảnh CMND 2 mặt + mã OTP để nhận thưởng."', bad: true, why: 'Trúng thưởng + xin giấy tờ + OTP = lừa đảo chiếm tài khoản.' },
  { k: 'LINK', t: 'http://192.168.1.1 — trang quản trị router của công ty', bad: false, why: 'Địa chỉ riêng trong mạng nội bộ, đúng thiết bị đang cấu hình.' },
  { k: 'APP', t: '"Diệt virus Pro" tự tải về, đòi quyền admin và yêu cầu tắt Windows Defender', bad: true, why: 'Phần mềm diệt virus thật không bao giờ đòi tắt trình bảo vệ.' },
  { k: 'EMAIL', t: 'Biên lai tiền điện, đường dẫn trỏ đúng evn.com.vn (đã kiểm tra domain)', bad: false, why: 'Domain chính chủ của Tập đoàn Điện lực Việt Nam.' },
  { k: 'CHAT', t: 'Lời mời họp Teams từ đồng nghiệp, domain công ty, lịch đã có sẵn trong calendar', bad: false, why: 'Có đối chiếu được với lịch chung → hợp lệ.' }
];
MGT_MODS.scam = {
  hint: 'Vuốt thẻ sang TRÁI = 🗑️ CHẶN SCAM, sang PHẢI = 🛡️ AN TOÀN (hoặc bấm hai nút lớn). Đúng 5/6 thẻ để thắng, chuỗi đúng cộng combo.',
  again: '🔄 BỘ THẺ KHÁC',
  init() {
    return {
      cards: MGT_SCAM.slice().sort(() => Math.random() - .5).slice(0, 6),
      n: 0, ok: 0, combo: 0, best: 0, dx: 0, drag: null, flash: 0, good: false, msg: '', over: 0, dead: false
    };
  },
  card() { const g = MGM.g; return g.cards[g.n]; },
  answer(g, side) {
    if (g.over || g.flash > 0 || !g.cards[g.n]) return;
    const c = g.cards[g.n];
    const say = side === 0;                       // 0 = CHẶN SCAM, 1 = AN TOÀN
    const right = say === c.bad;
    g.ok += right ? 1 : 0;
    g.combo = right ? g.combo + 1 : 0;
    g.best = Math.max(g.best, g.combo);
    g.flash = 1.0; g.good = right;
    g.msg = (right ? '✔ ' : '✖ ') + c.why;
    sfxPlay(right ? 'coin' : 'pop');
  },
  ptr(g, kind, p) {
    if (g.over) return;
    if (kind === 'down' && p.y > 70 && p.y < 280 && p.x > 120 && p.x < 640) g.drag = p.x;
    else if (kind === 'move' && g.drag != null) g.dx = Math.max(-260, Math.min(260, p.x - g.drag));
    else if (kind === 'up') {
      if (g.drag != null && Math.abs(g.dx) > 110) { this.answer(g, g.dx < 0 ? 0 : 1); g.dx = 0; }
      else if (g.drag != null) g.dx = 0;
      g.drag = null;
      if (p && p.y > 292) this.answer(g, p.x < MGT_W / 2 ? 0 : 1);
    }
  },
  tick(g, dt) {
    if (g.over) return;
    if (g.flash > 0) {
      g.flash -= dt;
      if (g.flash <= 0) {
        g.n++;
        if (g.n >= g.cards.length) {
          g.over = g.ok >= 5 ? 1 : 2; g.dead = true;
          if (g.over === 1) mgtWin(MGT_ST[1], 'Đúng ' + g.ok + '/6 · combo ' + g.best); else mgtLose(MGT_ST[1]);
        }
      }
      return;
    }
    if (Math.abs(g.dx) > 110) this.answer(g, g.dx < 0 ? 0 : 1);
  },
  draw(g, c, t) {
    mgtShell(c, '🚨', '244,63,94');
    mgtTx(c, 'THẺ ' + Math.min(g.n + 1, g.cards.length) + '/' + g.cards.length, 24, 30, { s: 15, c: '#fecdd3', mono: true });
    mgtTx(c, 'ĐÚNG ' + g.ok + '   COMBO x' + g.combo, MGT_W - 24, 30, { s: 15, a: 'right', c: g.combo >= 2 ? '#fde047' : '#fecdd3', mono: true });
    const cd = g.cards[Math.min(g.n, g.cards.length - 1)];
    if (cd) {
      const tilt = g.dx / 900, ox = g.dx;
      c.save();
      c.translate(MGT_W / 2 + ox, 175); c.rotate(tilt);
      c.fillStyle = 'rgba(10,14,30,.96)';
      mgtRR(c, -250, -100, 500, 200, 16); c.fill();
      c.strokeStyle = ox < -40 ? '#ef4444' : ox > 40 ? '#22c55e' : '#f43f5e';
      c.lineWidth = 3; mgtRR(c, -250, -100, 500, 200, 16); c.stroke();
      c.restore();
      const cx = MGT_W / 2 + ox;
      mgtTx(c, cd.k, cx - 226, 105, { s: 13, c: '#fda4af', mono: true });
      mgtTx(c, g.dx < -40 ? '🗑️ CHẶN' : g.dx > 40 ? '🛡️ AN TOÀN' : '↔ Vuốt để phán', cx + 226, 105, { s: 13, a: 'right', c: '#94a3b8' });
      const lines = mgtWrap(c, cd.t, 452, 19);
      for (let i = 0; i < lines.length; i++)
        mgtTx(c, lines[i], cx, 132 + i * 24 - Math.max(0, lines.length - 4) * 12, { s: 19, w: 600, a: 'center', c: '#f8fafc' });
    }
    mgtBigBtn(c, 24, 300, 348, 62, '🗑️  CHẶN SCAM', 'rgba(70,18,22,.92)', '#fb7185');
    mgtBigBtn(c, 388, 300, 348, 62, '🛡️  AN TOÀN', 'rgba(16,56,38,.92)', '#4ade80');
    if (g.flash > 0) {
      const ls = mgtWrap(c, g.msg, MGT_W - 120, 15);
      mgtCard(c, 36, 216, MGT_W - 72, 18 + ls.length * 19, g.good ? 'rgba(12,54,34,.96)' : 'rgba(58,12,16,.96)', g.good ? '#4ade80' : '#f87171', '');
      for (let i = 0; i < ls.length; i++) mgtTx(c, ls[i], MGT_W / 2, 240 + i * 19, { s: 15, a: 'center', c: '#f1f5f9' });
    }
    if (g.over) mgtResult(c, g.over === 1, 'Đúng ' + g.ok + '/6 thẻ · combo cao nhất x' + g.best, MGT_ST[1]);
  }
};

/* ===== 8c. 🛡️ PHÒNG THỦ TƯỜNG LỬA DDoS — 20 giây ===== */
MGT_MODS.ddos = {
  hint: 'Gói XANH là người dùng thật — để nó đi qua. Gói ĐỎ/TÍM là botnet — chạm (hoặc bấm) để bắn laser tiêu diệt. Sống sót 20 giây.',
  again: '',
  init() {
    return { t: 20, hp: 100, pk: [], cd: 0, hit: 0, zap: null, killed: 0, miss: 0, over: 0, dead: false, msg: '' };
  },
  ptr(g, kind, p) {
    if (kind !== 'down' || g.over) return;
    let best = -1, bd = 34;
    for (let i = 0; i < g.pk.length; i++) {
      const k = g.pk[i], d = Math.hypot(p.x - k.x, p.y - k.y);
      if (d < bd) { bd = d; best = i; }
    }
    if (best < 0) return;
    const k = g.pk[best];
    g.zap = { x: k.x, y: k.y, t: .22 };
    if (k.bad) { g.pk.splice(best, 1); g.killed++; g.hit = .3; sfxPlay('coin'); }
    else { g.pk.splice(best, 1); g.hp -= 12; g.miss++; g.hit = 0; sfxPlay('pop'); g.msg = 'Bắn nhầm người dùng thật!'; }
  },
  tick(g, dt) {
    if (g.over) return;
    g.t -= dt; g.cd -= dt;
    if (g.hit > 0) g.hit -= dt;
    if (g.zap) { g.zap.t -= dt; if (g.zap.t <= 0) g.zap = null; }
    const left = Math.max(0, g.t);
    if (g.cd <= 0) {
      const bad = Math.random() < .58;
      g.cd = left > 14 ? .55 : left > 7 ? .38 : .3;
      g.pk.push({ x: 96, y: [112, 176, 240, 304][Math.floor(Math.random() * 4)],
        v: (bad ? 150 : 96) + Math.random() * (left > 10 ? 70 : 130), bad: bad, r: bad ? 15 : 13, ph: Math.random() * 6 });
    }
    for (let i = g.pk.length - 1; i >= 0; i--) {
      const k = g.pk[i];
      k.x += k.v * dt;
      if (k.x > 654) {
        g.pk.splice(i, 1);
        if (k.bad) { g.hp -= 15; g.hit = .5; sfxPlay('pop'); }
      }
    }
    if (g.hp <= 0) { g.hp = 0; g.over = 2; g.dead = true; mgtLose(MGT_ST[2]); return; }
    if (g.t <= 0) { g.over = 1; g.dead = true; mgtWin(MGT_ST[2], 'Chặn ' + g.killed + ' gói botnet'); }
  },
  draw(g, c, t) {
    mgtShell(c, '🛡️', '251,146,60');
    /* ống truyền: Internet -> Server lõi */
    c.save();
    c.fillStyle = 'rgba(8,14,30,.9)'; mgtRR(c, 84, 84, 592, 240, 12); c.fill();
    c.strokeStyle = 'rgba(56,189,248,.35)'; c.lineWidth = 2;
    mgtRR(c, 84, 84, 592, 240, 12); c.stroke();
    c.restore();
    mgtNode(c, 44, 204, 42, '🌐', 'INTERNET', '56,189,248', t);
    mgtNode(c, 706, 204, 44, '🗄️', 'SERVER LÕI', g.hp > 40 ? '74,222,128' : '239,68,68', t);
    /* đường lane */
    c.save();
    c.strokeStyle = 'rgba(148,163,184,.16)'; c.lineWidth = 1;
    for (const y of [112, 176, 240, 304]) { c.beginPath(); c.moveTo(92, y); c.lineTo(660, y); c.stroke(); }
    c.restore();
    /* gói tin */
    for (const k of g.pk) {
      const pulse = .78 + .22 * Math.sin(t * 8 + k.ph);
      c.save();
      c.globalCompositeOperation = 'lighter';
      if (typeof hvGlow === 'function') hvGlow(c, k.x, k.y, k.r * 2.4, k.bad ? (k.r % 2 ? '244,63,94' : '168,85,247') : '34,197,94', .3 * pulse);
      c.restore();
      c.save();
      c.fillStyle = k.bad ? (k.v > 190 ? '#a855f7' : '#ef4444') : '#22c55e';
      mgtRR(c, k.x - k.r, k.y - k.r * .72, k.r * 2, k.r * 1.44, 5); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.5;
      mgtRR(c, k.x - k.r, k.y - k.r * .72, k.r * 2, k.r * 1.44, 5); c.stroke();
      c.restore();
      mgtTx(c, k.bad ? '☠' : '👤', k.x, k.y + 5, { s: 13, a: 'center' });
    }
    if (g.zap) {
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.strokeStyle = 'rgba(250,204,21,' + Math.max(0, g.zap.t / .22) + ')';
      c.lineWidth = 4;
      c.beginPath(); c.moveTo(706, 204); c.lineTo(g.zap.x, g.zap.y); c.stroke();
      c.restore();
    }
    /* HUD */
    mgtTx(c, '⏱ ' + Math.max(0, g.t).toFixed(1) + 's', 24, 34, { s: 17, c: g.t < 6 ? '#fca5a5' : '#fed7aa', mono: true });
    mgtTx(c, 'ĐÃ CHẶN ' + g.killed, MGT_W / 2, 34, { s: 14, a: 'center', c: '#a5b4fc' });
    c.save();
    c.fillStyle = 'rgba(255,255,255,.12)'; mgtRR(c, MGT_W - 250, 22, 226, 14, 7); c.fill();
    c.fillStyle = g.hp > 55 ? '#22c55e' : g.hp > 25 ? '#f59e0b' : '#ef4444';
    mgtRR(c, MGT_W - 250, 22, Math.max(0, 226 * g.hp / 100), 14, 7); c.fill();
    c.restore();
    mgtTx(c, '🛡️ SERVER ' + Math.round(g.hp) + '%', MGT_W - 24, 52, { s: 12, a: 'right', c: '#e2e8f0' });
    if (g.hit > 0) {
      c.save(); c.fillStyle = 'rgba(239,68,68,' + (g.hit / .5 * .3) + ')'; c.fillRect(0, 0, MGT_W, MGT_H); c.restore();
      mgtTx(c, g.msg, MGT_W / 2, 356, { s: 14, a: 'center', c: '#fca5a5' });
    }
    if (g.over) mgtResult(c, g.over === 1, 'Chặn ' + g.killed + ' gói botnet · server còn ' + Math.round(g.hp) + '%', MGT_ST[2]);
  }
};

/* ===== 8d. 🔀 XOAY MẠCH ĐỊNH TUYẾN — lưới 4x4 ===== */
const MGT_D = [[0, -1], [1, 0], [0, 1], [-1, 0]];      // 0 trên, 1 phải, 2 dưới, 3 trái
const MGT_SHAPE = { I: [0, 2], L: [0, 1], T: [1, 2, 3] };
function mgtDirIdx(dx, dy) { return dx === 0 ? (dy < 0 ? 0 : 2) : (dx > 0 ? 1 : 3); }
function mgtConns(cell) { return MGT_SHAPE[cell.k].map(d => (d + cell.r) % 4); }
MGT_MODS.route = {
  hint: 'Chạm từng ô để xoay 90°. Nối mạch từ 📶 ROUTER (trên-trái) tới ☁️ CLOUD SERVER (dưới-phải) — mạch sáng là thắng ngay.',
  again: '🔄 MẠCH KHÁC',
  init() {
    /* Sinh bàn cờ CÓ LỜI GIẢI: đi ngẫu nhiên toàn bước PHẢI/XUỐNG từ (0,0)
       tới (3,3), ghép ô trên đường thành I/L đúng hướng, sau đó xoay ngẫu
       nhiên toàn bộ. Vì vậy không bao giờ sinh ra bàn cờ vô nghiệm. */
    const path = [[0, 0]];
    let x = 0, y = 0;
    while (x < 3 || y < 3) {
      const d = (x >= 3) ? 2 : (y >= 3) ? 1 : (Math.random() < .5 ? 1 : 2);
      x += MGT_D[d][0]; y += MGT_D[d][1]; path.push([x, y]);
    }
    const need = {};
    for (let i = 0; i < path.length; i++) {
      const key = path[i][0] + ',' + path[i][1], set = need[key] || (need[key] = []);
      if (i > 0) { const p = path[i - 1]; set.push(mgtDirIdx(p[0] - path[i][0], p[1] - path[i][1])); }
      if (i < path.length - 1) { const n = path[i + 1]; set.push(mgtDirIdx(n[0] - path[i][0], n[1] - path[i][1])); }
    }
    const cells = [];
    for (let gy = 0; gy < 4; gy++) for (let gx = 0; gx < 4; gx++) {
      const key = gx + ',' + gy, nd = need[key];
      let k, r;
      if (nd) {
        const opp = nd.length === 2 && (nd[0] + 2) % 4 === nd[1];
        k = opp ? 'I' : 'L';
        r = 0;
        while (r < 4 && !nd.every(d => mgtConns({ k: k, r: r }).indexOf(d) >= 0)) r++;
        if (r > 3) { r = 0; }
      } else {
        k = Math.random() < .45 ? 'I' : (Math.random() < .55 ? 'L' : 'T');
        r = Math.floor(Math.random() * 4);
      }
      cells.push({ x: gx, y: gy, k: k, r: r, lit: false });
    }
    const g = { cells: cells, lit: [], win: false, over: 0, dead: false, t: 0 };
    /* Hai ô đầu cuối cố định, các ô trên đường đi bị xoay NGẪU NHIÊN để bàn cờ
       không mở ra đã xong. Ô thẳng (I) chỉ được lệch 1 hoặc 3 nấc vì lệch 2
       nấc vẫn cho đúng hai hướng nối cũ. */
    for (let tries = 0; tries < 20; tries++) {
      for (let i = 1; i < path.length - 1; i++) {
        const c = cells[path[i][1] * 4 + path[i][0]];
        c.r = (c.r + (c.k === 'I' ? (Math.random() < .5 ? 1 : 3) : 1 + Math.floor(Math.random() * 3))) % 4;
      }
      g.win = false;
      if (!this.solve(g, true)) break;           // đã là bàn cờ chưa lời giải
    }
    g.win = false; g.over = 0;
    this.solve(g, true);                         // lit = phần mạch đang thông để vẽ
    return g;
  },
  solve(g, quiet) {
    /* BFS từ ô ROUTER qua các khớp nối HAI CHIỀU; ô nào tới được là có dòng
       chảy -> vẽ sáng. Thắng khi ô CLOUD nằm trong tập đó. */
    const at = (x, y) => g.cells[y * 4 + x];
    const seen = new Array(16).fill(false), q = [at(0, 0)];
    seen[0] = true;
    while (q.length) {
      const c = q.shift();
      for (const d of mgtConns(c)) {
        const nx = c.x + MGT_D[d][0], ny = c.y + MGT_D[d][1];
        if (nx < 0 || ny < 0 || nx > 3 || ny > 3) continue;
        const n = at(nx, ny);
        if (seen[n.y * 4 + n.x]) continue;
        if (mgtConns(n).indexOf((d + 2) % 4) < 0) continue;
        seen[n.y * 4 + n.x] = true; q.push(n);
      }
    }
    g.lit = g.cells.filter((c, i) => seen[i]);
    if (seen[15] && !g.win) {
      g.win = true;
      if (!quiet) { g.over = 1; g.dead = true; mgtWin(MGT_ST[3]); }
    }
    return seen[15];
  },
  ptr(g, kind, p) {
    if (kind !== 'down' || g.over) return;
    const X = mgtGridX(), Y = mgtGridY(), S = 76;
    const gx = Math.floor((p.x - X) / S), gy = Math.floor((p.y - Y) / S);
    if (gx < 0 || gy < 0 || gx > 3 || gy > 3) return;
    if ((gx === 0 && gy === 0) || (gx === 3 && gy === 3)) return;   // hai đầu cố định
    const c = g.cells[gy * 4 + gx];
    c.r = (c.r + 1) % 4;
    sfxPlay('pop', 1.4 + Math.random() * .3);
    this.solve(g);
  },
  tick(g, dt) { g.t += dt; },
  draw(g, c, t) {
    mgtShell(c, '🔀', '167,139,250');
    const X = mgtGridX(), Y = mgtGridY(), S = 76;
    mgtTx(c, 'Lưới định tuyến 4×4 — chạm để xoay 90°', MGT_W / 2, 30, { s: 14, a: 'center', c: '#c7d2fe' });
    c.save();
    c.strokeStyle = 'rgba(129,140,248,.22)'; c.lineWidth = 2;
    for (let i = 0; i <= 4; i++) {
      c.beginPath(); c.moveTo(X + i * S, Y); c.lineTo(X + i * S, Y + 4 * S); c.stroke();
      c.beginPath(); c.moveTo(X, Y + i * S); c.lineTo(X + 4 * S, Y + i * S); c.stroke();
    }
    c.restore();
    for (const cell of g.cells) {
      const cx = X + cell.x * S + S / 2, cy = Y + cell.y * S + S / 2;
      const lit = g.lit.indexOf(cell) >= 0;
      c.save();
      c.fillStyle = lit ? 'rgba(23,58,48,.55)' : 'rgba(12,18,38,.72)';
      mgtRR(c, X + cell.x * S + 3, Y + cell.y * S + 3, S - 6, S - 6, 10); c.fill();
      c.restore();
      mgtPipe(c, cx, cy, cell, lit, t);
    }
    mgtNode(c, X + S / 2, Y + S / 2, 30, '📶', 'ROUTER', '34,197,94', t);
    mgtNode(c, X + 3 * S + S / 2, Y + 3 * S + S / 2, 30, '☁️', 'CLOUD', '56,189,248', t);
    mgtTx(c, 'Đã xoay ' + Math.round(g.t) + 's', 24, MGT_H - 12, { s: 12, c: '#94a3b8', mono: true });
    mgtTx(c, g.win ? '✔ MẠCH THÔNG' : 'Mạch chưa thông', MGT_W - 24, MGT_H - 12,
      { s: 13, a: 'right', c: g.win ? '#4ade80' : '#fca5a5' });
    if (g.over) mgtResult(c, true, 'Định tuyến thành công', MGT_ST[3]);
  }
};
function mgtGridX() { return (MGT_W - 4 * 76) / 2; }
function mgtGridY() { return 46; }
function mgtPipe(g, cx, cy, cell, lit, t) {
  const S = 76, half = S / 2 - 6, w = 15;
  const ds = mgtConns(cell);
  g.save();
  g.lineCap = 'round';
  for (const d of ds) {
    const dx = MGT_D[d][0], dy = MGT_D[d][1];
    g.strokeStyle = lit ? 'rgba(16,80,60,.95)' : 'rgba(30,41,66,.95)';
    g.lineWidth = w;
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + dx * half, cy + dy * half); g.stroke();
    g.strokeStyle = lit ? '#34d399' : '#64748b';
    g.lineWidth = w - 7;
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + dx * half, cy + dy * half); g.stroke();
    if (lit) {
      g.globalCompositeOperation = 'lighter';
      const p = .55 + .45 * Math.sin(t * 4 + (cx + cy) * .03);
      g.strokeStyle = 'rgba(110,231,183,' + (.35 * p) + ')';
      g.lineWidth = w - 11;
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + dx * half, cy + dy * half); g.stroke();
      g.globalCompositeOperation = 'source-over';
    }
  }
  g.fillStyle = lit ? '#6ee7b7' : '#94a3b8';
  g.beginPath(); g.arc(cx, cy, 6.5, 0, 6.2832); g.fill();
  g.restore();
}

/* ---------- 9. KHUNG VẼ CHUNG CỦA HỘP ẢI ---------- */
function mgtShell(g, icon, rgb) {
  const grd = g.createLinearGradient(0, 0, 0, MGT_H);
  grd.addColorStop(0, '#0a1026'); grd.addColorStop(1, '#05070f');
  g.fillStyle = grd; g.fillRect(0, 0, MGT_W, MGT_H);
  g.save();
  g.strokeStyle = 'rgba(' + rgb + ',.06)'; g.lineWidth = 1;
  for (let x = 0; x < MGT_W; x += 38) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, MGT_H); g.stroke(); }
  for (let y = 0; y < MGT_H; y += 38) { g.beginPath(); g.moveTo(0, y); g.lineTo(MGT_W, y); g.stroke(); }
  g.restore();
  g.save();
  g.globalCompositeOperation = 'lighter';
  if (typeof hvGlow === 'function') hvGlow(g, MGT_W / 2, -40, MGT_W * .7, rgb, .07);
  g.restore();
  mgtTx(g, '✖', MGT_W - 12, 20, { s: 12, a: 'right', c: 'rgba(148,163,184,.5)' });
}
function mgtCard(g, x, y, w, h, bg, rim, tag) {
  g.save();
  g.fillStyle = bg; mgtRR(g, x, y, w, h, 12); g.fill();
  g.strokeStyle = rim; g.lineWidth = 2; mgtRR(g, x, y, w, h, 12); g.stroke();
  g.restore();
  if (tag) mgtTx(g, tag, x + 18, y + 20, { s: 11, c: rim });
}
function mgtBigBtn(g, x, y, w, h, txt, bg, rim) {
  g.save();
  g.fillStyle = bg; mgtRR(g, x, y, w, h, 12); g.fill();
  g.strokeStyle = rim; g.lineWidth = 2.4; mgtRR(g, x, y, w, h, 12); g.stroke();
  g.shadowColor = rim; g.shadowBlur = 12;
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1;
  mgtRR(g, x + 3, y + 3, w - 6, h - 6, 10); g.stroke();
  g.restore();
  mgtTx(g, txt, x + w / 2, y + h / 2 + 8, { s: 22, w: 800, a: 'center', c: '#f8fafc', glow: rim, gs: 10 });
}
function mgtNode(g, x, y, r, icon, label, rgb, t) {
  g.save();
  g.globalCompositeOperation = 'lighter';
  if (typeof hvGlow === 'function') hvGlow(g, x, y, r * 2.6, rgb, .22 + .08 * Math.sin(t * 3));
  g.restore();
  g.save();
  g.fillStyle = 'rgba(8,14,28,.95)'; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
  g.strokeStyle = 'rgba(' + rgb + ',.95)'; g.lineWidth = 2.5; g.stroke();
  g.restore();
  mgtTx(g, icon, x, y + 8, { s: Math.round(r * .9), a: 'center' });
  mgtTx(g, label, x, y + r + 14, { s: 10, a: 'center', c: 'rgba(' + rgb + ',1)' });
}
function mgtResult(g, win, sub, s) {
  g.save();
  g.fillStyle = 'rgba(2,6,16,.82)'; g.fillRect(0, 0, MGT_W, MGT_H);
  g.restore();
  mgtTx(g, win ? '🏆  HOÀN THÀNH TRẠM' : '💥  CHƯA ĐẠT', MGT_W / 2, 168,
    { s: 34, w: 800, a: 'center', c: win ? '#fde047' : '#fca5a5', glow: win ? '#fbbf24' : '#ef4444', gs: 22 });
  mgtTx(g, sub, MGT_W / 2, 206, { s: 16, a: 'center', c: '#e2e8f0' });
  mgtTx(g, win
    ? (s.lastFirst ? '+' + s.xp + ' XP · +' + s.coin + ' Coin' : 'Đã đạt trước đó · chơi lại không cộng thưởng')
      + '   (bấm 🔄 CHẠY LẠI để chơi tiếp)'
    : 'Bấm 🔄 CHẠY LẠI để thử lại',
    MGT_W / 2, 234, { s: 14, a: 'center', c: win ? '#86efac' : '#cbd5e1' });
}

/* ---------- 10. VÒNG LẶP ---------- */
function mgtTick() {
  const now = performance.now();
  const dt = Math.min(.05, (now - (MGT.last || now)) / 1000);   // tab ẩn vẫn chạy đúng nhịp
  MGT.last = now;
  /* Dải báo động: không phụ thuộc hộp ải, đo bằng thời gian tích luỹ. */
  if (!MGT.alertSet) MGT.alertSet = now + 20000;
  if (MGM) { mgtAlertPaint(false); }
  else {
    const on = now >= MGT.alertSet && now < MGT.alertSet + MGT_ALERT_MS;
    if (!on && now >= MGT.alertSet + MGT_ALERT_MS) { MGT.alertSet = now + MGT_ALERT_GAP; }
    mgtAlertPaint(on);
  }
  if (!MGM) return;
  if (!mgmVisible()) { MGM = null; return; }      // ESC / closeAll()
  if (!MGM.g.over && !MGM.g.dead) MGM.mod.tick(MGM.g, dt);
  MGM.mod.draw(MGM.g, mgFit(document.getElementById('mgt-mini-cv'), MGT_W, MGT_H), now / 1000);
  if (MGM.g.over && !MGM.footDone) { MGM.footDone = true; mgtFootBtns(); }
}
const _mgtOldMgFrame = mgFrame;
mgFrame = function () { try { mgtTick(); } catch (e) {} return _mgtOldMgFrame.apply(this, arguments); };

/* Thỏ mini không được bò vào hộp ải này — cùng khuôn các ải khác đã dùng. */
try { if (typeof BUN_MINI_MODALS !== 'undefined') BUN_MINI_MODALS.push('mgt-mini'); } catch (e) {}

/* Tên khác với const MGT nội bộ — nếu trùng thì handle này bị che và vô dụng. */
window.mgtDbg = { st: MGT_ST, mg: () => MGM, open: mgtOpen, mods: MGT_MODS, W: MGT_W, H: MGT_H };
