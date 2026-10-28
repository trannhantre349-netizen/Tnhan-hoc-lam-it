/* ============================================================
   V19 + V20 — ÂM THANH THẬT (Web Audio API) cho nhân vật + bầy thỏ,
   kèm nhạc nền có ducking. File ADD-ONLY: không sửa logic cũ của game.

   Vì sao không dùng thẻ <audio>: mỗi lần phát phải tạo/nạp lại phần
   giải mã, click nhanh hoặc đi liên tục là trễ hẳn vài chục ms và
   các tiếng đè nhau thành "rè". Ở đây mỗi file mp3 chỉ giải mã MỘT
   lần thành AudioBuffer, còn lúc phát chỉ tạo AudioBufferSourceNode
   (độ trễ ~0, cost rẻ) — đúng chuẩn low-latency của Web Audio.

   AudioContext: dùng lại getAC() của engine.js (js/engine.js:7) để cả
   game chỉ có MỘT context — Chrome giới hạn số context mỗi trang, và
   nút "🔊 Âm Thanh" (soundOn) cũng điều khiển đúng context đó. File này
   vì thế không tạo context riêng và không giải mã lúc parse: việc giải
   mã chỉ diễn ra sau thao tác đầu tiên (xem sfxUnlock).
   ============================================================ */

/* ---------- 1. Danh mục tài nguyên ---------- */
/* Thêm tiếng mới = thêm 1 dòng ở đây + 1 dòng trong SFX_CFG rồi gọi
   sfxPlay('ten') ở chỗ cần. File chưa có cũng không sao: sfxLoad() bắt
   lỗi im lặng, game chạy hệt như lúc chưa có âm thanh. */
const SFX_SRC = {
  step: 'assets/audio/step.mp3',
  coin: 'assets/audio/coin.mp3',
  pop: 'assets/audio/pop.mp3',
  /* V20: bgm KHÔNG phát bằng sfxPlay() — nó có route riêng (xem mục 7). */
  bgm: 'assets/audio/bgm.mp3'
};

/* ---------- 2. Tham số chỉnh được ---------- */
/* Các số dưới đây lấy từ ĐO THỰC file mp3 (giải mã rồi quét biên độ),
   không phải đoán:
     step.mp3 1.99s nhưng đầu file gần như im lặng, cú "bộp" thật nằm
       ở 1.70-1.80s và peak chỉ 0.044 (~-48 dBFS) -> cắt đúng đoạn đó
       (off/dur) và bù âm lượng (vol 2.8).
     coin.mp3 1.04s, peak 0.49 ngay 26ms, tắt dần sau 0.4s -> phát trọn.
     pop.mp3  1.03s, ồn ở 0.2s đầu rồi rơi -> phát trọn, để vol vừa.
   vol > 1 là khuếch đại thêm, vẫn an toàn vì peak nhỏ hơn 1. */
const SFX_CFG = {
  step: { vol: 2.8, gap: 200, off: 1.62, dur: .37, dist: 72 },
  coin: { vol: .42, gap: 90 },
  pop: { vol: .34, gap: 95 }
};
const SFX_DEF = { vol: .4, gap: 80 };
/* V20 — NHẠC NỀN. bgm.mp3 4MB / 256kbps / stereo ~2 phút.
   vol  = mức bình thường lúc chơi ngoài bản đồ
   duck = mức nhỏ lại khi mở modal / hồ sơ / hội thoại NPC
   tc   = thời hằng của setTargetAtTime (giây): 0.25s => mờ dần mượt,
          không nhảy cóc gây "clicky". Muốn fade nhanh thì giảm tc.
   check = giây giữa hai lần đọc trạng thái giao diện (xem sfxBgmDuck). */
const SFX_BGM = { key: 'bgm', vol: .4, duck: .1, tc: .25, check: .1 };
const SFX_TP = 60;          // px / frame: lớn hơn mức này là dịch chuyển tức thời
const SFX_MAX_VOICES = 8;   // trần số giọng phát cùng lúc (bảo vệ audio graph)

const SFX = {
  ctx: null, on: 0, buf: {}, raw: {}, bad: {}, done: {},
  last: {}, voices: 0, acc: 0, alt: 1, prev: null,
  /* V20 */ gain: null, src: null, duck: -1, poll: 0
};

/* ---------- 3. Mở khoá âm thanh ---------- */
/* Trình duyệt cấm auto-play: context chỉ chạy sau một thao tác thật
   (click / chạm / phím). Listener gắn trên document bằng capture nên
   bấm vào HUD hay dock cũng mở khoá được, không chỉ riêng canvas. */
function sfxCtx() {
  try {
    if (typeof getAC === 'function') return getAC();
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    if (!SFX.ctx) SFX.ctx = new C();
    return SFX.ctx;
  } catch (e) { return null; }
}

function sfxUnlock() {
  if (SFX.on) return;
  const a = sfxCtx();
  if (!a) return;                      // trình duyệt không có Web Audio: im lặng
  SFX.ctx = a;
  SFX.on = 1;
  try { if (a.state === 'suspended' && a.resume) a.resume().catch(() => {}); } catch (e) {}
  for (const k in SFX_SRC) if (SFX.raw[k]) sfxDecode(k);
  ['pointerdown', 'keydown', 'touchstart'].forEach(t =>
    document.removeEventListener(t, sfxUnlock, true));
}

/* ---------- 4. Nạp + giải mã buffer ---------- */
/* fetch chạy ngay lúc parse (mạng là phần chậm), còn decodeAudioData
   chờ tới khi có context. Thiếu file -> console.warn MỘT lần rồi thôi,
   không ném lỗi ra ngoài nên game không crash. */
function sfxDecode(k) {
  if (SFX.done[k] || SFX.bad[k]) return;
  const a = SFX.ctx || sfxCtx(); if (!a) return;
  SFX.done[k] = 1;
  try {
    /* slice(0): decodeAudioData "nuốt" ArrayBuffer gốc, để lại bản copy
       phòng khi context bị thay thế và phải giải mã lại. */
    const p = a.decodeAudioData(SFX.raw[k].slice(0));
    if (p && p.then) p.then(b => { SFX.buf[k] = b; }, e => sfxFail(k, e));
    else if (p) SFX.buf[k] = p;
  } catch (e) { sfxFail(k, e); }
}

function sfxFail(k, e) {
  SFX.bad[k] = 1;
  console.warn('[sfx] bỏ qua ' + (SFX_SRC[k] || k) + ': ' + ((e && e.message) || e));
}

function sfxLoad() {
  for (const k in SFX_SRC) {
    if (!window.fetch) { SFX.bad[k] = 1; continue; }
    fetch(SFX_SRC[k]).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.arrayBuffer();
    }).then(b => {
      if (!b || !b.byteLength) throw new Error('file rỗng');
      SFX.raw[k] = b;
      if (SFX.on) sfxDecode(k);        // mở khoá rồi thì giải mã ngay
    }).catch(e => sfxFail(k, e));     /* file:// cũng rơi vào đây -> chỉ warn */
  }
}

/* ---------- 5. Phát ---------- */
function sfxMuted() {
  /* soundOn là của engine.js (nút 🔊) — tôn trọng nó, tắt nút là im hết. */
  try { return typeof soundOn !== 'undefined' && !soundOn; } catch (e) { return false; }
}

function sfxUiOpen() {
  try {
    if (typeof anyCtlModalOpen === 'function' && anyCtlModalOpen()) return true;
    if (typeof openModalEl === 'function' && openModalEl()) return true;
  } catch (e) {}
  return false;
}

function sfxPlay(k, rate) {
  if (!SFX.on || sfxMuted()) return;
  const b = SFX.buf[k]; if (!b) return;
  const c = SFX_CFG[k] || SFX_DEF;
  const now = performance.now();
  if (now - (SFX.last[k] || -1e9) < (c.gap || 0)) return;            // chống spam
  if (SFX.voices >= SFX_MAX_VOICES) return;                          // quá tải: bỏ lượt
  const a = SFX.ctx;
  SFX.voices++; SFX.last[k] = now;
  const v = { c: 0 };
  const free = () => { if (!v.c) { v.c = 1; SFX.voices--; } };       // không rò đếm
  try {
    /* cắt đoạn: off là giây bắt đầu, dur là độ dài phát — bước chân chỉ
       cần 0.37s "bộp", phát cả file 2s thì 8 bước chồng lên thành rè. */
    const off = Math.max(0, Math.min(c.off || 0, b.duration - .02));
    const dur = Math.min(c.dur || 1e9, b.duration - off);
    const s = a.createBufferSource(), g = a.createGain();
    s.buffer = b;
    s.playbackRate.value = rate || 1;
    g.gain.value = c.vol;
    s.connect(g); g.connect(a.destination);
    s.onended = free;
    setTimeout(free, (dur / (rate || 1) + .15) * 1000);              // Safari lỗi onended
    s.start(a.currentTime, off, dur);
  } catch (e) { free(); }
}

/* ---------- 6. Bước chân theo QUÃNG ĐƯỜNG, không theo frame ---------- */
/* Đi theo px (không phải "mỗi 16 frame"): máy 60Hz và 144Hz mới nghe
   giống nhau; SFX_TP chặn trường hợp warp/đổi cảnh làm d nhảy cóc,
   còn gap trong SFX_CFG giữ nhịp tối thiểu khi đi nhanh bất thường.
   Tốc độ thường = 2.6 x SPEED_BOOST 1.4 = 3.64 px/frame, nên 72px/bước
   rơi đúng ~19 frame — nằm trong cửa sổ 15-20 frame của yêu cầu. */
function sfxStep() {
  if (!SFX.on) return;
  const p = S.p;
  /* Phố Ngoài: S.p.x là toạ độ MÀN HÌNH (camera cuộn nó), phải cộng
     _camX mới ra quãng đường thật — không thì đi giữa màn hình im bặt. */
  const cam = S.scene === 'STREET' ? (window._camX || 0) : 0;
  const wx = p.x + cam, wy = p.y;
  const A = SFX.prev;
  SFX.prev = { x: wx, y: wy, sc: S.scene };
  if (!A || A.sc !== S.scene) { SFX.acc = 0; return; }
  if (!p.moving || sfxUiOpen()) return;
  const d = Math.hypot(wx - A.x, wy - A.y);
  if (d > SFX_TP || d < .05) return;
  SFX.acc += d;
  const dist = (SFX_CFG.step && SFX_CFG.step.dist) || 72;
  if (SFX.acc >= dist) {
    SFX.acc -= dist;
    /* Lag spike có thể tích đủ 2-3 bước cùng lúc: giữ lại tối đa 1 bước */
    if (SFX.acc > dist) SFX.acc = 0;
    SFX.alt = -SFX.alt;
    /* lệch nhẹ trái/phải (±5.5%) để hai chân không phát y hệt nhau */
    sfxPlay('step', 1 + SFX.alt * .055);
  }
}

/* ---------- 7. NHẠC NỀN + DUCKING ---------- */
/* BGM đi trên đường RIÊNG:  AudioBufferSourceNode(loop) -> bgmGain -> destination,
   còn SFX vẫn vào thẳng destination như cũ. Vì thế chỉnh vol/duck của nhạc
   không hề ăn vào âm lượng tiếng động, và ngược lại.

   Hai hàm dưới đây không tự chạy lúc parse: nhạc chỉ phát sau khi mở khoá
   (SFX.on) vì trước đó context còn suspended, phát lên là nghe hụt đoạn
   đầu bản nhạc. */
function sfxBgmStart() {
  const a = SFX.ctx, b = SFX.buf[SFX_BGM.key];
  if (!a || !b || SFX.src) return;
  const g = a.createGain();
  /* vào mức duck luôn nếu nhạc khởi động trong lúc đang mở modal (vd: người
     chơi mở Hồ Sơ rồi mới bấm cú click đầu tiên) — khỏi có khoảnh khắc to. */
  g.gain.value = sfxMuted() ? 0 : (sfxUiOpen() ? SFX_BGM.duck : SFX_BGM.vol);
  g.connect(a.destination);
  const s = a.createBufferSource();
  s.buffer = b;
  s.loop = true;                       // lặp vô tận cả bản nhạc
  s.connect(g);
  SFX.gain = g; SFX.src = s; SFX.duck = -1;
  SFX.poll = 0;
  try { s.start(a.currentTime); } catch (e) {}
}

/* Được gọi mỗi frame trong update(). Nặng nhất là sfxUiOpen() (phải đọc
   display của modal) nên có SFX_BGM.check chặn: dưới 0.1s thì bỏ qua,
   đủ nhanh để fade theo cú bấm mà không tính lại 60 lần/giây. */
function sfxBgmDuck() {
  if (!SFX.on || SFX.bad[SFX_BGM.key]) return;   // file lỗi -> khỏi chạm bản nhạc
  if (!SFX.src) { if (!SFX.buf[SFX_BGM.key]) return; sfxBgmStart(); }
  const now = performance.now();
  if (now - SFX.poll < SFX_BGM.check * 1000) return;
  SFX.poll = now;
  /* TẮT tiếng (nút 🔊) thì nhạc im hẳn, không chỉ nhỏ lại. */
  const want = sfxMuted() ? 0 : (sfxUiOpen() ? SFX_BGM.duck : SFX_BGM.vol);
  if (want === SFX.duck || !SFX.gain) return;
  SFX.duck = want;
  try {
    /* setTargetAtTime thay vì gán thẳng: Web Audio tự cong theo hàm mũ nên
       không có bước nhảy biên độ -> không "clicky" ở điểm giao nhau. */
    SFX.gain.gain.setTargetAtTime(want, SFX.ctx.currentTime, SFX_BGM.tc);
  } catch (e) {}
}

/* ---------- 8. Móc nối (hook) ---------- */
/* update(): sfx.js nạp CUỐI nên lớp bọc này nằm ngoài cùng — bước chân
   vẫn tính đúng sau các bọc của bunnies.js và vfx.js. */
const _sfxOldUpd = update;
update = function () {
  _sfxOldUpd.apply(this, arguments);
  try { sfxStep(); } catch (e) {}
  try { sfxBgmDuck(); } catch (e) {}
};

/* bunLoot(): thỏ rớt đồ -> tiếng coin (bunnies.js:394 đã beep tổng hợp
   riêng, mp3 này là lớp dày hơn phủ lên cùng sự kiện). */
if (typeof bunLoot === 'function') {
  const _sfxOldLoot = bunLoot;
  bunLoot = function () {
    const r = _sfxOldLoot.apply(this, arguments);
    try { sfxPlay('coin'); } catch (e) {}
    return r;
  };
}

/* talk(): là PHƯƠNG THỨC của class BunnyNPC (bunnies.js:225) nên phải
   bọc trên prototype — mọi con thỏ đang sống lẫn con sinh sau dùng
   chung một bảng method, không phải sửa class. talk() chỉ trả về giá
   trị khi thỏ THỰC SỰ nói (ngưỡng gần + cooldown + trần 2 hộp đi qua),
   nhờ vậy bong bóng hiện lên mới kêu "pop". */
try {
  if (typeof BunnyNPC === 'function' && BunnyNPC.prototype && BunnyNPC.prototype.talk) {
    const _sfxOldTalk = BunnyNPC.prototype.talk;
    BunnyNPC.prototype.talk = function () {
      const r = _sfxOldTalk.apply(this, arguments);
      if (r) sfxPlay('pop', .95 + Math.random() * .12);
      return r;
    };
  }
} catch (e) {}

['pointerdown', 'keydown', 'touchstart'].forEach(t =>
  document.addEventListener(t, sfxUnlock, { capture: true, passive: true }));
try { sfxLoad(); } catch (e) {}
