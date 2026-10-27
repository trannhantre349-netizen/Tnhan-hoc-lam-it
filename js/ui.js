/* ============================================================
   ui.js — Joystick, chat, minimap, menu cài đặt, nút chạy
   ============================================================ */

/* ---------- JOYSTICK (mobile + desktop kéo chuột) ---------- */
(function setupJoystick() {
  const joy = document.getElementById('joystick');
  const knob = document.getElementById('joy-knob');
  if (!joy || !knob) return;
  const R = 34;               // biên độ kéo của núm
  const DEAD = 9;             // vùng chết
  let pid = null;
  /* Trạng thái núm: engine.resetInput() xả joy.active/dx/dy về 0 */
  const joyState = { active: false, dx: 0, dy: 0 };
  window.joy = joyState;

  function setKnob(dx, dy) { knob.style.transform = `translate(${dx}px, ${dy}px)`; }
  function applyDir(dx, dy) {
    touchDir.left = dx < -DEAD; touchDir.right = dx > DEAD;
    touchDir.up = dy < -DEAD;   touchDir.down = dy > DEAD;
    joyState.dx = dx; joyState.dy = dy; joyState.active = pid !== null;
  }
  function move(e) {
    if (pid === null || e.pointerId !== pid) return;
    const r = joy.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    if (d > R) { dx = dx / d * R; dy = dy / d * R; }
    setKnob(dx, dy); applyDir(dx, dy);
    e.preventDefault();
  }
  function release(e) {
    if (pid === null || (e && e.pointerId !== pid)) return;
    pid = null; setKnob(0, 0);
    touchDir.up = touchDir.down = touchDir.left = touchDir.right = false;
    joyState.active = false; joyState.dx = 0; joyState.dy = 0;
  }
  // engine.js resetInput() gọi khi đổi cảnh / window mất focus:
  // buông luôn pointer capture để joystick không bị "kẹt hướng" mãi
  window.joyReset = () => { pid = null; setKnob(0, 0); applyDir(0, 0); joyState.active = false; joyState.dx = 0; joyState.dy = 0; };
  // dự phòng: pointerup/touchend bị nuốt (đổi cảnh, rơi capture) vẫn phải nhả hướng
  window.addEventListener('pointerup', e => { if (pid !== null && e.pointerId === pid) window.joyReset(); });
  window.addEventListener('pointercancel', () => window.joyReset());
  joy.addEventListener('pointerdown', e => {
    pid = e.pointerId;
    try { joy.setPointerCapture(pid); } catch (err) {}
    move(e);
  });
  joy.addEventListener('pointermove', move);
  joy.addEventListener('pointerup', release);
  joy.addEventListener('pointercancel', release);
  joy.addEventListener('touchend', release);
  joy.addEventListener('touchcancel', release);
})();

/* ---------- CHẠY NHANH: GIỮ SHIFT (nút 🏃 trên dock đã gỡ) ---------- */
let runOn = false;
function setRun(on) {
  on = !!on;
  if (runOn === on) return;
  runOn = on;
  SPEED_BOOST = on ? 2.2 : 1.4;
  showToast(on ? '🏃 Chạy nhanh (giữ Shift)' : '🚶 Đi bộ');
}
function anyCtlModalOpen() {
  if (openModalEl()) return true;                 // minigame, hội thoại modal, cửa hàng, đại sự cố...
  const dlg = document.getElementById('dialog');
  return !!dlg && getComputedStyle(dlg).display !== 'none';
}
window.addEventListener('keydown', e => {
  // Shift chạy nhanh: bỏ qua khi đang gõ trong ô nhập liệu hiển thị HOẶC khi đang mở modal
  if (e.code !== 'ShiftLeft' && e.code !== 'ShiftRight') return;
  if (isTypingField(document.activeElement) || anyCtlModalOpen()) { if (runOn) setRun(false); return; }
  setRun(true);
});
window.addEventListener('keyup', e => { if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') setRun(false); });
// đang giữ Shift mà Alt+Tab / ẩn tab → tự nhả, không kẹt tốc độ chạy
window.addEventListener('blur', () => setRun(false));
document.addEventListener('visibilitychange', () => { if (document.hidden) setRun(false); });

/* ---------- MENU CÀI ĐẶT ---------- */
function toggleSettings(e) {
  if (e) e.stopPropagation();
  const m = document.getElementById('settings-menu');
  if (m) m.classList.toggle('open');
}
document.addEventListener('pointerdown', e => {
  const m = document.getElementById('settings-menu');
  if (m && m.classList.contains('open') && !m.contains(e.target) && !e.target.closest('.dock-btn')) {
    m.classList.remove('open');
  }
});

/* ---------- PANEL NHIỆM VỤ / KHU VỰC ---------- */
function toggleQuestPanel() {
  const p = document.getElementById('quest-panel');
  if (p) p.classList.toggle('folded');
}
function toggleAreaPanel() {
  const p = document.getElementById('area-panel');
  if (!p) return;
  p.classList.toggle('open');
  const btn = document.getElementById('ap-open-btn');
  if (btn) btn.style.display = p.classList.contains('open') ? 'none' : 'flex';
  if (p.classList.contains('open') && typeof renderAreaPanel === 'function') renderAreaPanel();
}
function closeAreaPanel() {
  const p = document.getElementById('area-panel');
  if (p) p.classList.remove('open');
  const btn = document.getElementById('ap-open-btn');
  if (btn) btn.style.display = 'flex';
}
function spawnAtBuilding(id) {
  const b = (typeof blds !== 'undefined') ? blds.find(x => x.id === id) : null;
  S.scene = 'WORLD';
  window._camX = 0;
  S.lastBld = id;
  if (!b) { S.p.x = 480; S.p.y = 392; setZone('1. THÀNH PHỐ', 'Network City (World Map)'); return; }
  let ex = Math.max(30, Math.min(890, b.x + b.w / 2 - 10));
  let ey = Math.min(548, b.y + b.h + 18);
  if (typeof boxCollides === 'function' && boxCollides(ex, ey)) ey = Math.max(45, b.y - 36);
  if (typeof boxCollides === 'function' && boxCollides(ex, ey)) { ex = 480; ey = 392; }
  S.p.x = ex; S.p.y = ey;
  setZone('1. THÀNH PHỐ', 'Network City (World Map)');
}
function areaGo(id) {
  const hasBld = typeof buildingOpen === 'function' && typeof buildingLock === 'function';
  const open = id === 'STREET' ? true : (!hasBld || buildingOpen(id));
  const lk = id === 'STREET' || !hasBld ? null : buildingLock(id);
  if (!open) { showToast(`🔒 Khu này mở ở Ải ${lk ? lk.no : '?'} — đi tiếp ải hiện tại nhé!`); return; }
  if (typeof closeAll === 'function') closeAll();
  const names = { OFFICE: 'VP Kế Toán (góc trái trên)', ACADEMY: 'Học Viện CCNA (trên giữa)', IT: 'Trụ Sở IT (góc phải trên)', HARDWARE: 'Lab Phần Cứng (trái giữa)', DC: 'Data Center (phải giữa)', SALES: 'VP Kinh Doanh (trái dưới)', ISP: 'Trạm Mạng ISP (phải dưới)', STREET: 'Phố Máy Tính (cổng dưới bản đồ)' };
  if (id === 'STREET') {
    S.scene = 'STREET';
    window._camX = 0;
    // spawn trên vỉa hè, giống cổng ra phố — không dùng Y cũ của WORLD
    S.p.x = 90; S.p.y = SCENE_WALK.STREET.spawnY;
    setZone('5. PHỐ NGOÀI', 'Phố Cài Win Dạo');
  } else {
    spawnAtBuilding(id);
  }
  closeAreaPanel();
  showToast('🧭 Đi tới: ' + (names[id] || id));
  beep(440);
}

/* ---------- CHAT ---------- */
let chatTab = 'all';
function chatLog(ch, html) {
  const log = document.getElementById('chat-log'); if (!log) return;
  const d = document.createElement('div');
  d.className = 'cm ' + (ch === 'sys' ? 'sys' : (ch === 'guild' ? 'guild' : ''));
  d.dataset.ch = ch;
  d.innerHTML = html;
  if (chatTab !== 'all' && ch !== chatTab && ch !== 'sys') d.style.display = 'none';
  log.appendChild(d);
  while (log.children.length > 42) log.removeChild(log.firstChild);
  log.scrollTop = log.scrollHeight;
}
function switchChatTab(ch, btn) {
  chatTab = ch;
  document.querySelectorAll('.chat-tab').forEach(b => b.classList.toggle('active', b === btn));
  const log = document.getElementById('chat-log'); if (!log) return;
  Array.from(log.children).forEach(d => {
    d.style.display = (ch === 'all' || d.dataset.ch === ch || d.dataset.ch === 'sys') ? '' : 'none';
  });
  log.scrollTop = log.scrollHeight;
}
const CHAT_NPC = [
  ['Chị Lan', '📶 Ai ping thấy 8.8.8.8 chưa? Mạng sống lại rồi kìa!'],
  ['Tuấn', '🔧 Cáp T568B: cam trắng – cam – xanh lá trắng – xanh dương... nhớ chưa?'],
  ['Chị Hương', '🖥️ Lab phần cứng mới về lô RAM, qua test đi!'],
  ['Anh Khoa', '🗄️ Patch panel đấu xong nhớ ghi nhãn port nha mấy đứa'],
  ['Chị Linh', '🎫 Ticket ai làm nhanh quá trời, đỉnh!'],
  ['Chị Mai', '📡 Traceroute 5 hop là ra Internet ngay á'],
  ['Anh Sơn', '📶 Wifi kênh 1-6-11 là chuẩn bài, đừng đặt trùng!'],
  ['Thầy Đức', '🎓 Ôn subnetting đi, thi CCNA là qua!']
];
const CHAT_REPLY = ['👍 Ok bro!', '😄 hihi', '🚀 Let\'s go!', '💯 chuẩn luôn', '🤝 cảm ơn nha!'];
function sendChat() {
  const inp = document.getElementById('chat-in'); if (!inp) return;
  const v = inp.value.trim(); if (!v) return;
  inp.value = '';
  if (/^\/dev\b/i.test(v)) {
    chatLog('sys', '🛠️ <b>DEV:</b> mở bảng nhảy ải — chọn ải 1 → 10 để kiểm tra nhanh.');
    openDevMenu();
    return;
  }
  chatLog('all', `<b style="color:#1668b4">${typeof playerName !== 'undefined' ? playerName : 'Bạn'}:</b> ${v.replace(/</g, '&lt;')}`);
  const [who] = CHAT_NPC[Math.random() * CHAT_NPC.length | 0];
  setTimeout(() => chatLog('all', `<b>${who}:</b> ${CHAT_REPLY[Math.random() * CHAT_REPLY.length | 0]}`), 900 + Math.random() * 1200);
}
(function chatBoot() {
  const inp = document.getElementById('chat-in');
  if (inp) inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); sendChat(); e.stopPropagation(); }
  });
  chatLog('sys', '🎮 Chào mừng tới <b>Network City</b>! Bấm vào toà nhà sáng đèn để nhận ải.');
  chatLog('guild', '<b>Chị Lan:</b> Sáng sớm mà mạng VP Kế Toán lại dở chứng 😭');
  setInterval(() => {
    if (document.hidden) return;
    const [who, msg] = CHAT_NPC[Math.random() * CHAT_NPC.length | 0];
    chatLog('all', `<b>${who}:</b> ${msg}`);
  }, 34000);
})();

/* Banner game -> đổ vào kênh hệ thống */
const _showBanner0 = showBanner;
showBanner = function (top, main, sub, cls) {
  _showBanner0(top, main, sub, cls);
  try {
    const t = String(main).replace(/<[^>]*>/g, '');
    chatLog('sys', `📢 <b>${t}</b>${sub ? ' — ' + String(sub).replace(/<[^>]*>/g, '') : ''}`);
  } catch (e) {}
};

/* ---------- MÀN DỌC: dock thanh điều khiển ra body (thoát scale của #app) ---------- */
function adaptPortrait() {
  const touch = document.getElementById('touch');
  const chat = document.getElementById('chat-box');
  const app = document.getElementById('app');
  if (!touch || !app) return;
  const portrait = window.innerHeight > window.innerWidth;
  if (portrait) {
    if (touch.parentElement !== document.body) document.body.appendChild(touch);
    if (chat && chat.parentElement !== document.body) document.body.appendChild(chat);
    const r = app.getBoundingClientRect();
    if (chat) chat.style.top = (r.bottom + 8) + 'px';
  } else {
    if (touch.parentElement !== app) app.appendChild(touch);
    if (chat && chat.parentElement !== app) app.insertBefore(chat, touch);
    if (chat) chat.style.top = '';
  }
  touch.classList.toggle('body-docked', portrait);
  if (chat) chat.classList.toggle('body-docked', portrait);
}
window.addEventListener('resize', adaptPortrait);
window.addEventListener('orientationchange', () => setTimeout(adaptPortrait, 220));
setTimeout(adaptPortrait, 60);

/* ---------- ẨN JOYSTICK/CHAT KHI MODAL MỞ ---------- */
setInterval(() => {
  const app = document.getElementById('app'); if (!app) return;
  const modal = !!openModalEl();
  const dlgEl = document.getElementById('dialog');
  const dlg = dlgEl && getComputedStyle(dlgEl).display !== 'none';
  app.classList.toggle('modal-open', modal || dlg);
  document.body.classList.toggle('modal-open', modal || dlg);
}, 250);

/* ---------- ẨN CHAT KHI ĐANG HỘI THOẠI ---------- */
(function dlgChatSync() {
  const dlg = document.getElementById('dialog');
  const chat = document.getElementById('chat-box');
  if (!dlg || !chat) return;
  const sync = () => chat.classList.toggle('hide-dlg', getComputedStyle(dlg).display !== 'none');
  new MutationObserver(sync).observe(dlg, { attributes: true, attributeFilter: ['style', 'class'] });
  sync();
})();

/* ---------- MINIMAP ---------- */
(function setupMinimap() {
  const mm = document.getElementById('minimap');
  if (!mm) return;
  const g = mm.getContext('2d');
  const W = mm.width, H = mm.height;
  function draw() {
    g.clearRect(0, 0, W, H);
    g.save();
    // clip tròn
    g.beginPath(); g.arc(W / 2, H / 2, W / 2 - 2, 0, Math.PI * 2); g.clip();
    if (S.scene === 'WORLD' && IMG.bg) {
      const s = Math.max(W / IMG.bg.width, H / IMG.bg.height);
      const dw = IMG.bg.width * s, dh = IMG.bg.height * s;
      g.drawImage(IMG.bg, (W - dw) / 2, (H - dh) / 2, dw, dh);
      // chấm toà nhà
      if (typeof blds !== 'undefined' && typeof buildingOpen === 'function') blds.forEach(b => {
        g.fillStyle = buildingOpen(b.id) ? '#ffc93c' : '#94a3b8';
        g.strokeStyle = '#fff'; g.lineWidth = 1.5;
        g.beginPath(); g.arc((b.x + b.w / 2) / 960 * W, (b.y + b.h / 2) / 600 * H, 3.2, 0, 7); g.fill(); g.stroke();
      });
      // player pulse
      const px = S.p.x / 960 * W, py = S.p.y / 600 * H, puls = (Date.now() / 350) % 2;
      g.strokeStyle = `rgba(58,165,255,${1 - puls / 2})`; g.lineWidth = 2;
      g.beginPath(); g.arc(px, py, 5 + puls * 5, 0, 7); g.stroke();
      g.fillStyle = '#3aa5ff'; g.strokeStyle = '#fff'; g.lineWidth = 2;
      g.beginPath(); g.arc(px, py, 5, 0, 7); g.fill(); g.stroke();
    } else {
      const gg = g.createLinearGradient(0, 0, 0, H);
      gg.addColorStop(0, '#54b6ff'); gg.addColorStop(1, '#1668b4');
      g.fillStyle = gg; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,255,255,.92)';
      g.font = 'bold 13px "Baloo 2", sans-serif'; g.textAlign = 'center';
      g.fillText(S.scene === 'STREET' ? '🛣️' : '🏢', W / 2, H / 2 - 2);
      g.font = 'bold 10px "Baloo 2", sans-serif';
      g.fillText(S.scene === 'STREET' ? 'PHỐ MÁY TÍNH' : 'TRONG NHÀ', W / 2, H / 2 + 16);
      g.textAlign = 'left';
    }
    g.restore();
    g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 3;
    g.beginPath(); g.arc(W / 2, H / 2, W / 2 - 2, 0, Math.PI * 2); g.stroke();
  }
  setInterval(draw, 350);
})();

// Gán trực tiếp vào window để onclick trong HTML luôn gọi được
window.toggleMinimap = function () {
  const mb = document.getElementById('minimap-box');
  if (!mb) return;
  mb.classList.toggle('folded');
  const t = document.getElementById('mm-toggle');
  if (t) {
    t.textContent = mb.classList.contains('folded') ? '+' : '–';
  }
};
