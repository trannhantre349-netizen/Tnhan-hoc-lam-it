/* ============================================================
   V26 — KHU 5 "ĐẠI LỘ TĨNH TÂM" — SCENE CUỘN CAMERA   js/inpeace.js

   KIẾN TRÚC (V25: hành lang 2400px · V26: ảnh thật + ghế ngồi tịnh tâm):
   Khu 5 vẫn là MỘT CẢNH ĐỘC LẬP `S.scene = 'INPEACE'`, người chơi đi từ CỔNG ĐÁ
   đầu đường, qua ba DÂY GHẾ dài để Ngồi Tịnh Tâm, hai CỤM NẾN vàng, tới BÀN THỜ
   LỚN ở cuối đại lộ rồi quỳ ghi lời nguyện.

   Cảnh lạ không có trong engine → engine.render() vẽ xong mới tới hàm này
   phủ toàn bộ khung (đúng cách heaven.js làm với HEAVEN), còn engine.update()
   vẫn lo chuyển động + va chạm bằng SCENE_WALK + propCollides. Không sửa
   một dòng nào của engine.js / game.js / heaven.js / sfx.js.

   Móc nối (idiom `const _old = fn; fn = function(){...}`), tất cả guard try/catch:
     propCollides()  → dải đi được của đại lộ (toạ độ THẾ GIỚI)
     update()        → ipUpdate(): camera _camX · [E] 3 trạm · quỳ · motes
     render()        → ipScene(): nền ghép + trạm nến + nhân vật + chữ bay
     doAction()      → vào cảnh · thắp nến · quỳ · gửi lời nguyện · về Khu 1
     drawSprite()    → phối cảnh (scale .84→1.0 theo chân) + tư thế quỳ
     drawDecor()     → cổng đá ở chân cầu thang Học Viện CCNA (depth sort thật)
     sfxStep()       → bước chân tính theo QUÃNG ĐƯỜNG THẾ GIỚI (có _camX)
     sfxBgmDuck()    → nhạc thành phố im hẳn trong Thánh Đường
     addXP()         → buff 🕊 Tâm Hồn Bình An +10% EXP trong 10 phút
     updateBuffBar() → chip 🕊 trên dải buff HUD

   Nạp SAU heaven.js để hvCap()/hvGlow()/hvLabel() đã tồn tại.

   ---------- CAMERA (sao nguyên cách của STREET) ----------
   engine.js:1405 kẹp `nx` vào 15..925 cho MỌI scene, nên S.p.x BUỘC phải là
   toạ độ MÀN HÌNH — không thể dùng công thức _camX = S.p.x − 480 (công thức
   đó giả định S.p.x là toạ độ thế giới và sẽ bị engine cắt ngọn). STREET giải
   quyết bằng edge-scroll: camera chỉ chạy khi người chơi chạm mép trái/phải.
   Ở đây dùng đúng công thức đó (game.js:3612-3615) với biên đại lộ:
       S.p.x > 620  → đẩy _camX lên, trừ lại S.p.x
       S.p.x < 300  → kéo _camX về, cộng lại S.p.x
   _camX ∈ [0, IP_CAM_MAX=1440]  ⇒  thế giới đi được = S.p.x + _camX ∈ [25, 2365]
   → phủ trọn yêu cầu "x từ 100 đến 2300" mà không đụng engine.js.

   ---------- TOẠ ĐỘ (đo từ assets/img/inpeace_bg.png, 1248x832 JPEG) ----------
   V26: ảnh THẬT đã về — nội thất gothic nhìn NGANG 90° (không còn phối cảnh
   một điểm tụ), nên bỏ hẳn kiểu "cắt nhịp vòm + cung thánh" của V25 và bỏ luôn
   dải sàn đỏ bầm vẽ tay. Ảnh phủ vừa khít CHIỀU CAO 600 → một bản rộng
   1248 × 600/832 = 900px. Ghép 3 bản so le THUẬN–LẬT–THUẬN (mirror tiling):
   đường ghép nối đúng hai MÉP GIỐNG NHAU của ảnh nên VÔ HÌNH, không cần
   crossfade (crossfade trên tường đá để lại bóng ma — đã thử ở V25).
   Bề rộng canvas nền = 3 × 900 = 2700px, dài hơn đại lộ 300px: camera kẹp ở
   1440 nên khung hình cuối cùng kết thúc đúng 2400 — đầu bị cắt của bản thứ
   ba không bao giờ hiện ra.
     chân tường đá : y ≈ 476   (nguồn 660/832 — nơi tường gặp sàn)
     dải sàn sáng  : 476..554
     lan can chạm nổi: 554..600 (dải tối dưới cùng của ảnh, đọc như tiền cảnh)
     ĐIỂM CHÂN đi được 500..552  ⇒  điểm va chạm (x+10, y+18) 488..570
     SCENE_WALK kẹp theo điểm NEO (S.p.y = chân − 30) nên thành 470..522.

   Trạm dọc hành lang (toạ độ THẾ GIỚI):
     x 120   CỔNG ĐÁ        [E] Về lại Thành Phố
     x 600 / 1200 / 1700  GHẾ DÀI (baked/church_bench.png)  [E] Ngồi Tịnh Tâm
     x 850 / 1550  CỤM NẾN  [E] Thắp Nến
     x 2250  BÀN THỜ LỚN    [E] Thắp Nến Lớn → quỳ → Sổ nguyện ước

   Hai chỗ lệch yêu cầu ban đầu vì phải khớp ảnh/engine thật:
     * Vùng chân là 500..552 chứ không phải đúng 510..530 — dải 20px quá hẹp
       để còn đi lên/xuống; 500..552 nằm trọn trong phần SÀN SÁNG của ảnh
       (476..554) nên nhân vật không bao giờ đứng lạc lên tường.
     * _camX dùng edge-scroll của STREET, không dùng S.p.x − 480 (lý do ở trên).

   ---------- ẢNH / NHẠC ----------
   * assets/img/inpeace_bg.png : nền thánh đường. Đại lộ 2700x600 được DỰNG MỘT
     LẦN vào canvas offscreen (ipProm) bằng drawImage theo từng bản ghép, nên ảnh
     bao nhiêu kích thước cũng chỉ cần ghi đè file. Chưa có ảnh → ipPromFallback()
     tự vẽ nhịp vòm bằng vector, không bao giờ crash.
   * assets/img/baked/church_bench.png : ghế dài 873x433 RGBA, tẩy nền trắng bằng
         node tools/bake-bench.cjs
     Mặt ghế nằm ở 49.5% chiều cao sprite tính từ ĐỈNH (đo bằng Node) — inpeace.js
     căn điểm ngồi theo đúng tỉ lệ đó. Thiếu ảnh → ghế vẽ bằng khung gỗ vector.
   * assets/sfx/inpeace_bgm.mp3: nhạc đàn organ tự tổng hợp ngoại tuyến bằng
         node tools/make-inpeace-bgm.cjs   (120s, loop khít, bản quyền = mình)
     Thiếu file → fetch fail → console.warn MỘT lần, Thánh Đường im lặng,
     game vẫn chạy. Không đọc pixel, không auto-play trước cú click.
   ============================================================ */

/* ---------- 1. CẤU HÌNH ---------- */
/* Cổng đặt ở CHÂN BẬC TAM CẤP trước cửa Học Viện CCNA, không nằm giữa quảng
   trường nữa (chỗ cũ (560,380) chắn lối đi giữa đài phun nước và bãi đáp).
   Đo trên ảnh cover-crop 960x600 của bg_city.png (1536x960 × 0.625):
     thềm cửa  y ≈ 160 · các bậc 160..192 · mép bậc cuối 192 · trục cầu thang x ≈ 351
   IP_GATE là tâm HITBOX tính bằng ĐIỂM VA CHẠM (S.p.x+10, S.p.y+18) nên vòng
   r=34 phủ đúng bậc thang (ĐIỂM CHÂN 158..226) — đứng xa trên quảng trường thì
   [E] không bật. dy: vòm đá vẽ thấp hơn hitbox 10px để chân vòm đặt đúng mặt
   thềm; s: co toàn bộ hình vòm còn 60% để không che biển đồng hồ và huy hiệu
   sách của mặt tiền (vòm gốc cao 128px, từ y=196 lên tới y=68 là chìm hết tòa nhà). */
const IP_GATE = { x: 351, y: 186, r: 34, dy: 10, s: .6 };
const IP_BGM_URL = 'assets/sfx/inpeace_bgm.mp3';
const IP_VOL = .55;                                    // mức nhạc trong Thánh Đường
const IP_FADE = 900;                                   // ms cắt cảnh vào/ra

/* Phông Serif thanh thoát — cùng stack an toàn cho tiếng Việt có dấu ở
   mg-art.js:1524. CẤM Georgia (Chrome Windows thiếu dấu trong một số glyph). */
const IP_SERIF = "'Times New Roman','Liberation Serif','Palatino Linotype',serif";

/* Vùng đi được của ĐẠI LỘ (toạ độ THẾ GIỚI). SCENE_WALK kẹp theo ĐIỂM NEO
   (S.p.y = chân − 30), còn propCollides thử bằng ĐIỂM VA CHẠM (S.p.x+10,
   S.p.y+18 = chân − 12). Biên va chạm RỘNG HƠN biên kẹp một chút: nếu trùng
   nhau thì đúng tại hàng kẹp, điểm kiểm tra nằm trên cạnh và bị coi là
   "ngoài" → propCollides chặn luôn cả trượt ngang → nhân vật dán chặt vào mép
   cho tới khi bấm ngược lại. */
const IP_MAP_W = 2400;                                   // chiều dài đại lộ
const IP_VIEW_W = 960, IP_VIEW_H = 600;
const IP_CAM_MAX = IP_MAP_W - IP_VIEW_W;                 // 1440
/* Một bản ảnh = cao 600, rộng theo tỉ lệ nguồn (tính thật lúc bake). */
const IP_TILE_H = IP_VIEW_H;
const IP_PROM_MIN_W = 2700;                              // 3 bản × 900
/* Chân tường đá: nơi tường gặp sàn, đo từ ảnh (nguồn y 660/832 × 0.7212). */
const IP_WALL_Y = 476;
const IP_FEET_TOP = 500, IP_FEET_BOT = 552;              // ĐIỂM CHÂN đi được
SCENE_WALK.INPEACE = { minY: IP_FEET_TOP - 30, maxY: IP_FEET_BOT - 30, spawnY: 524 - 30 };
const IP_X0 = 26, IP_X1 = IP_MAP_W - 34;                 // hai đầu đại lộ
const IP_SPAWN = { x: 120, y: 528 };                     // điểm chân lúc mới vào
/* Các trạm — x là toạ độ THẾ GIỚI, y là ĐIỂM CHÂN của trạm.
   pk = KHOÁ VẼ (depth sort). Cảnh này nhìn ngang nên mọi trạm là nội thất tựa
   tường: pk đặt CAO hơn mép trên dải đi bộ để nhân vật KHÔNG BAO GIỜ bị che
   mất khi đi lướt qua — thà trạm nằm sau lưng còn hơn người chơi biến mất. */
const IP_PORTAL = { x: 120, y: 528, r: 52, pk: 470 };    // [E] Về lại Thành Phố
const IP_CANDLES = [{ x: 850, y: 520, r: 62, lit: 0, pk: 476 },
                    { x: 1550, y: 520, r: 62, lit: 0, pk: 476 }];
/* Bàn thờ lớn cuối hành lang — [E] Thắp Nến Lớn (máy trạng thái quỳ + Sổ
   nguyện ước giữ nguyên như V25, chỉ đổi nhãn theo yêu cầu V26). */
const IP_ALTAR_X = 2250;
const IP_ALTAR = { x: IP_ALTAR_X, y: 512, r: 66, pk: 474 };   // [E] Thắp Nến Lớn
/* Ba dãy ghế dọc hành lang (yêu cầu: x ≈ 600 / 1200 / 1700). */
const IP_PEWS = [{ x: 600, y: 512, r: 78, pk: 468, next: 0 },
                 { x: 1200, y: 512, r: 78, pk: 468, next: 0 },
                 { x: 1700, y: 512, r: 78, pk: 468, next: 0 }];
const IP_PEW_W = 152;                    // bề rộng ghế trên màn hình
const IP_PEW_SEAT = .495;                // mặt ghế: 49.5% cao sprite, tính từ ĐỈNH
const IP_KNEEL_MS = 420, IP_RISE_HOLD = 790, IP_RISE_MS = 530;
const IP_SIT_MS = 260;                   // ngồi xuống / đứng dậy bao lâu
const IP_SEAT_MIN_MS = 1500;             // ngồi đủ 1,5 giây mới tính một lần tĩnh tâm
const IP_SEAT_COOL_MS = 60 * 1000;       // mỗi ghế cách nhau 1 phút mới thưởng tiếp
const IP_SOUL_XP = 10;                   // "+10 Tâm Hồn" khi đứng dậy
const IP_SEAT_PEACE_MS = 5 * 60 * 1000;  // cộng thêm 5 phút cho buff 🕊
const IP_PEACE_MS = 10 * 60 * 1000;                    // buff 🕊 10 phút
const IP_XP = 100;
/* Ảnh V26 là nội thất CHỤP CHIỀU nên đã tối sẵn; phủ .45 như V25 là thành
   hang đen, mất hết kính màu. Giảm còn .26 — vẫn đêm tĩnh tâm, vẫn thấy sắc
   xanh đỏ của cửa kính. */
const IP_NIGHT = 'rgba(10,10,18,.26)';   // màn đêm bake một lần vào đại lộ
const IP_PRAY_KEY = 'network_city_it_prayers';         // Sổ nguyện ước — KHÁC KHOÁ SAVE
const IP_PRAY_MAX = 120;                               // giữ 120 lời nguyện gần nhất

/* Chế độ Zen: danh sách DOM cần tắt trong Thánh Đường (đo trực tiếp trên
   localhost ngày 2026-11-02 — id nào không tồn tại thì vòng lặp bỏ qua).
   #quest-hud đã bị CSS giữ display:none !important nên không cần liệt kê. */
const IP_HUD_IDS = ['player-card', 'buff-bar', 'dock-tr', 'minimap-box',
  'quest-panel', 'area-panel', 'ap-open-btn', 'chat-box', 'touch'];

/* ---------- 2. TRẠNG THÁI ---------- */
const IP_ST = {
  st: '',        // '' | 'down' | 'kneel' | 'rise' | 'up' | 'sit' | 'seated' | 'stand'
  kn: 0,         // 0 đứng → 1 quỳ hoàn toàn (dùng cho phối cảnh tư thế)
  si: 0,         // 0 đứng → 1 NGỒI yên trên ghế (co thân 74% quanh điểm chân)
  pew: null,     // ghế đang ngồi { x, y, pk, next }
  tSit: 0,       // thời điểm bắt đầu ngồi yên (để tính "ngồi đủ lâu")
  kx: 0, ky: 0,  // vị trí bị khoá khi quỳ/ngồi
  t0: 0, last: 0,
  fly: null,     // { txt, lines, t0 } dòng chữ bay lên trần kính màu
  pray: 0,       // số lời nguyện đã gửi trong phiên
  zen: 0,        // 1 = HUD đang bị ẩn
  hud: {}        // id -> giá trị style.display nội tuyến TRƯỚC khi ẩn
};
const IP_AUDIO = { buf: null, tried: false, src: null, gain: null, want: -1 };
const IP_PEACE = { until: 0 };
const IP_MOTES = [];
let IP_CUT = null;

/* ---------- 3. ÂM THANH ---------- */
/* Dùng lại AudioContext CHUNG của engine (getAC) — cùng cái mà sfx.js đang
   dùng, nên không sinh thêm context thứ hai (Chrome chặn quá 6 context/trang)
   và nút 🔊 của HUD điều khiển được cả nhạc Thánh Đường. */
function ipCtx() {
  try { if (typeof sfxCtx === 'function') return sfxCtx(); } catch (e) {}
  try { if (typeof getAC === 'function') return getAC(); } catch (e) {}
  return null;
}

function ipBgmLoad() {
  if (IP_AUDIO.tried) return;                 // chỉ thử đúng một lần mỗi phiên
  IP_AUDIO.tried = true;
  if (!window.fetch) return;
  const a = ipCtx();
  if (!a) { console.warn('[inpeace] trình duyệt không có Web Audio — Thánh Đường im lặng.'); return; }
  try {
    fetch(IP_BGM_URL).then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.arrayBuffer();
    }).then(b => a.decodeAudioData(b)).then(buf => {
      IP_AUDIO.buf = buf;
      if (S.scene === 'INPEACE' && !IP_CUT) ipBgmStart();
    }).catch(e => {
      console.warn('[inpeace] bỏ qua nhạc Thánh Đường: ' + ((e && e.message) || e));
    });
  } catch (e) {
    console.warn('[inpeace] bỏ qua nhạc Thánh Đường: ' + ((e && e.message) || e));
  }
}

function ipBgmStart() {
  const a = ipCtx();
  if (!a || !IP_AUDIO.buf || IP_AUDIO.src) return;
  try {
    const g = a.createGain(); g.gain.value = 0; g.connect(a.destination);
    const s = a.createBufferSource();
    s.buffer = IP_AUDIO.buf; s.loop = true; s.connect(g);
    s.start(a.currentTime);
    IP_AUDIO.src = s; IP_AUDIO.gain = g; IP_AUDIO.want = 0;
    /* fade-in ~2s: setTargetAtTime cong theo hàm mũ nên không có bước nhảy
       biên độ ở điểm bắt đầu → không "clicky". */
    g.gain.setTargetAtTime(IP_VOL, a.currentTime, .75);
    IP_AUDIO.want = IP_VOL;
  } catch (e) { IP_AUDIO.src = null; IP_AUDIO.gain = null; }
}

function ipBgmStop() {
  const a = ipCtx(), s = IP_AUDIO.src, g = IP_AUDIO.gain;
  IP_AUDIO.src = null; IP_AUDIO.gain = null; IP_AUDIO.want = -1;
  if (!s) return;
  try {
    if (g && a) {
      g.gain.cancelScheduledValues(a.currentTime);
      g.gain.setValueAtTime(g.gain.value, a.currentTime);
      g.gain.setTargetAtTime(0, a.currentTime, .18);
    }
    /* stop() ngay thì đuôi fade bị cắt phắt → trễ 700ms cho kịp mờ xuống. */
    setTimeout(() => { try { s.stop(); } catch (e) {} try { s.disconnect(); if (g) g.disconnect(); } catch (e) {} }, 700);
  } catch (e) { try { s.stop(); } catch (e2) {} }
}

/* Nút 🔊 tắt / mở giữa chừng → chỉnh mức theo. Chạy mỗi frame nhưng có
   IP_AUDIO.want chặn nên chỉ chạm Web Audio khi mức đích THỰC SỰ đổi (đúng
   cách sfx.js làm với SFX.duck). */
function ipBgmSync() {
  const a = ipCtx();
  if (!a || !IP_AUDIO.gain || !IP_AUDIO.src) return;
  const want = (typeof sfxMuted === 'function' && sfxMuted()) ? 0 : IP_VOL;
  if (want === IP_AUDIO.want) return;
  IP_AUDIO.want = want;
  try { IP_AUDIO.gain.gain.setTargetAtTime(want, a.currentTime, want ? .75 : .18); } catch (e) {}
}

/* Tiếng chuông ngân: beep()/chord() của engine chỉ là sóng tam giác 0.15s nên
   không ra chất chuông nhà thờ. Ở đây chồng 5 hoạ âm — mỗi cái suy giảm
   exponential với nhịp riêng (âm trầm tắt chậm, bổng tắt nhanh) — nên đuôi
   chuông kéo ~2.6s. Nối thẳng ra destination giống hệt beep(), dùng chung
   AudioContext của engine, và tôn trọng nút 🔊 qua sfxMuted().
   Không có Web Audio / context hỏng → try-catch nuốt im lặng, không crash. */
function ipBell(big) {
  if (typeof sfxMuted === 'function' && sfxMuted()) return;
  const a = ipCtx();
  if (!a) return;
  try {
    const t0 = a.currentTime, base = big ? 392 : 523.25;
    const par = [[1, 1, 2.6], [2.0, .42, 1.7], [2.76, .3, 1.3], [4.07, .16, .9], [5.4, .09, .55]];
    for (let i = 0; i < par.length; i++) {
      const o = a.createOscillator(), g = a.createGain();
      o.type = 'sine';
      o.frequency.value = base * par[i][0];
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(.075 * par[i][1], t0 + .012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + par[i][2]);
      o.connect(g); g.connect(a.destination);
      o.start(t0); o.stop(t0 + par[i][2] + .05);
    }
  } catch (e) {}
}

/* ---------- 4. HÌNH HỌC + CAMERA ---------- */
/* Phối cảnh một điểm tụ dọc đại lộ: càng lên cao (chân 448, sát dãy ghế) càng
   nhỏ (0.84), xuống tới mép thảm gần (chân 566) về đúng 1.0 như ngoài thành phố. */
function ipScale(fy) {
  const u = Math.max(0, Math.min(1, (fy - IP_FEET_TOP) / (IP_FEET_BOT - IP_FEET_TOP)));
  return .84 + .16 * u;
}
/* ĐIỂM VA CHẠM của nhân vật ra toạ độ THẾ GIỚI (engine giữ S.p.x là màn hình). */
function ipWx() { return S.p.x + 10 + (window._camX || 0); }

/* Edge-scroll y HỆT STREET (game.js:3612-3615) nhưng kẹp theo biên đại lộ.
   Gọi SAU engine.update() nên position đã chốt; trừ/cộng lại S.p.x làm nhân
   vật đứng yên trên màn hình trong khi thế giới trôi đi. */
function ipCamStep() {
  let cam = window._camX || 0;
  if (S.p.x > 620) { const d = Math.min(S.p.x - 620, IP_CAM_MAX - cam); cam += d; S.p.x -= d; }
  if (S.p.x < 300) { const d = Math.min(300 - S.p.x, cam); cam -= d; S.p.x += d; }
  window._camX = Math.max(0, Math.min(IP_CAM_MAX, cam));
}

/* ---------- 5. LỚP VẼ CACHE ---------- */
/* Trụ sáng + vignette dựng MỘT lần vào canvas offscreen: tạo gradient rồi fill
   960x600 mỗi frame tốn ~1.5ms, drawImage chỉ ~0.05ms (bài học Khu 4). */
let IP_LAY = null;
function ipShaft(g, xt, wt, xb, wb, y0, y1, a) {
  const q = g.createLinearGradient(0, y0, 0, y1);
  q.addColorStop(0, 'rgba(255,236,196,' + a.toFixed(3) + ')');
  q.addColorStop(.42, 'rgba(255,222,164,' + (a * .55).toFixed(3) + ')');
  q.addColorStop(1, 'rgba(255,206,132,0)');
  g.fillStyle = q;
  g.beginPath(); g.moveTo(xt - wt, y0); g.lineTo(xt + wt, y0);
  g.lineTo(xb + wb, y1); g.lineTo(xb - wb, y1); g.closePath(); g.fill();
}
function ipCv(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; return c;
}

/* ---------- 5b. ĐẠI LỘ DỰNG MỘT LẦN (V26: 3 bản ảnh ghép LẬT GƯƠNG) ---------- */
/* Bề rộng một bản và bề ngang canvas phụ thuộc TỈ LỆ ẢNH THẬT, nên hai giá trị
   này là `let` — ipLayers() dựng sau và phải dựng lại khi ảnh đổi cỡ. */
let IP_TW = 900, IP_PROM_W = IP_PROM_MIN_W;

/* Bề rộng một bản = cao 600 nhân tỉ lệ nguồn. Dài hơn đại lộ CHẴN số bản để
   bản cuối không bị cụt: 2400/900 = 2.67 → 3 bản = 2700. Camera kẹp ở 1440 nên
   khung hình cuối dừng ở 2400, 300px thừa không bao giờ vào màn hình. */
function ipPromSize(im) {
  if (im) {
    const W = im.naturalWidth || im.width, H = im.naturalHeight || im.height;
    IP_TW = Math.max(64, Math.round(IP_TILE_H * W / H));
  } else IP_TW = 900;
  IP_PROM_W = Math.max(IP_PROM_MIN_W, Math.ceil(IP_MAP_W / IP_TW) * IP_TW);
}

/* Không vẽ sàn gì cả: ảnh V26 đã có sẵn chân tường + sàn đá + lan can chạm nổi.
   Dải sàn đỏ bầm vẽ tay của V25 xoá toàn bộ theo yêu cầu. */
function ipPromArt(g, im) {
  const W = im.naturalWidth || im.width, H = im.naturalHeight || im.height;
  const tiles = Math.ceil(IP_PROM_W / IP_TW);
  for (let k = 0; k < tiles; k++) {
    const x = k * IP_TW;
    if (k % 2) {
      /* Lật ngang: mép PHẢI của bản thuận áp vào mép PHẢI của bản lật → hai
         nửa trụ đá ghép thành một trụ nguyên, đường ghép biến mất. */
      g.save(); g.translate(x + IP_TW, 0); g.scale(-1, 1);
      g.drawImage(im, 0, 0, W, H, 0, 0, IP_TW, IP_TILE_H);
      g.restore();
    } else {
      g.drawImage(im, 0, 0, W, H, x, 0, IP_TW, IP_TILE_H);
    }
  }
}

/* Chưa có ảnh (404 / chưa kịp nạp) → tường đá + sàn vector, cùng hình học
   (chân tường 476, sàn 476..600) để mọi hitbox và ghế vẫn đúng chỗ. */
function ipPromFallback(g) {
  const wall = g.createLinearGradient(0, 0, 0, IP_WALL_Y);
  wall.addColorStop(0, '#15110c'); wall.addColorStop(.45, '#3a2f20');
  wall.addColorStop(.8, '#584732'); wall.addColorStop(1, '#2b2116');
  g.fillStyle = wall; g.fillRect(0, 0, IP_PROM_W, IP_WALL_Y);
  const fl = g.createLinearGradient(0, IP_WALL_Y, 0, IP_VIEW_H);
  fl.addColorStop(0, '#20190f'); fl.addColorStop(.35, '#4a3d2a');
  fl.addColorStop(1, '#2a2118');
  g.fillStyle = fl; g.fillRect(0, IP_WALL_Y, IP_PROM_W, IP_VIEW_H - IP_WALL_Y);
  for (let x = 0; x < IP_PROM_W; x += 300) {
    const w = 34, top = 70, bot = IP_WALL_Y - 10;
    const cg = g.createLinearGradient(x - w, 0, x + w, 0);
    cg.addColorStop(0, 'rgba(14,10,6,.9)'); cg.addColorStop(.45, 'rgba(120,96,58,.85)');
    cg.addColorStop(1, 'rgba(14,10,6,.9)');
    g.fillStyle = cg; g.fillRect(x - w, top, w * 2, bot - top);
    const win = g.createLinearGradient(0, top, 0, bot);
    win.addColorStop(0, 'rgba(150,190,255,.34)'); win.addColorStop(.55, 'rgba(210,150,90,.16)');
    win.addColorStop(1, 'rgba(90,60,30,.05)');
    g.fillStyle = win;
    g.beginPath(); g.moveTo(x - 17, bot - 6); g.lineTo(x - 17, top + 60);
    g.quadraticCurveTo(x, top + 8, x + 17, top + 60); g.lineTo(x + 17, bot - 6);
    g.closePath(); g.fill();
  }
  const ap = g.createRadialGradient(IP_ALTAR_X, 200, 14, IP_ALTAR_X, 200, 300);
  ap.addColorStop(0, 'rgba(255,222,158,.5)'); ap.addColorStop(.5, 'rgba(214,158,74,.14)');
  ap.addColorStop(1, 'rgba(120,80,30,0)');
  g.fillStyle = ap; g.fillRect(IP_ALTAR_X - 300, 0, 600, IP_WALL_Y);
}

let IP_PROM = null, IP_PROM_KEY = '';
function ipProm() {
  const im = (typeof IMG !== 'undefined' && IMG.ipBg) || null;
  const iw = im ? (im.naturalWidth || im.width || 0) : 0;
  const key = iw > 1 ? iw + 'x' + (im.naturalHeight || im.height) : 'fb';
  if (IP_PROM && IP_PROM_KEY === key) return IP_PROM;
  ipPromSize(iw > 1 ? im : null);
  const cv = ipCv(IP_PROM_W, IP_VIEW_H), g = cv.getContext('2d');
  g.fillStyle = '#0a0805'; g.fillRect(0, 0, IP_PROM_W, IP_VIEW_H);
  if (iw > 1) ipPromArt(g, im); else ipPromFallback(g);
  /* Màn đêm bake LUÔN VÀO ĐẠI LỘ: mỗi frame đỡ mất một fillRect phủ kín, và
     các lớp 'lighter' vẽ sau vẫn nổi rực trên nền đã xuống chiều. */
  g.fillStyle = IP_NIGHT; g.fillRect(0, 0, IP_PROM_W, IP_VIEW_H);
  IP_PROM = cv; IP_PROM_KEY = key;
  IP_LAY = null;                     // trụ sáng phải dựng lại theo bề ngang mới
  return IP_PROM;
}

/* ---------- 5c. TRỤ SÁNG + VIGNETTE CACHE ---------- */
function ipLayers() {
  if (IP_LAY) return IP_LAY;
  const sh = ipCv(IP_PROM_W, IP_VIEW_H);
  const s = sh.getContext('2d');
  /* Ảnh V26 TỰ có trụ sáng trong kính (nguồn x ≈ 930/1248 → 0.749 bề ngang
     một bản). Vẽ thêm đúng vào chỗ đó để sáng DỒN đúng chỗ, không cắt ngang
     trụ khác. Bản lẻ lật gương → trụ sáng cũng lật theo, tính bằng IP_TW. */
  const sx = Math.round(IP_TW * .749);
  for (let k = 0; k * IP_TW < IP_PROM_W; k++) {
    const x = (k % 2) ? (k + 1) * IP_TW - sx : k * IP_TW + sx;
    if (x > IP_MAP_W + 200) continue;
    ipShaft(s, x, 22, x + 34, 78, 40, IP_FEET_TOP + 6, .075);
    ipShaft(s, x - 150, 14, x - 128, 46, 70, IP_FEET_TOP, .04);
  }
  ipShaft(s, IP_ALTAR_X, 74, IP_ALTAR_X, 168, 60, IP_FEET_BOT + 8, .16);
  ipShaft(s, IP_ALTAR_X, 30, IP_ALTAR_X, 86, 60, IP_FEET_BOT + 8, .11);
  IP_LAY = { shaft: sh, key: IP_PROM_W + 'x' + IP_TW };

  const vg = ipCv(960, 600);
  const v = vg.getContext('2d');
  const q = v.createRadialGradient(480, 300, 210, 480, 300, 640);
  q.addColorStop(0, 'rgba(0,0,0,0)'); q.addColorStop(1, 'rgba(4,3,2,.62)');
  v.fillStyle = q; v.fillRect(0, 0, 960, 600);
  IP_LAY.vig = vg;
  return IP_LAY;
}

/* Bụi sáng trôi trong các trụ sáng — toạ độ THẾ GIỚI, gọi trong khung
   ctx.translate(-cam,0) nên không phải trừ camera ở đây. */
function ipDust(g, t) {
  const axes = ipDustAxes();
  for (let i = 0; i < 44; i++) {
    const ph = i * 1.37;
    const axis = axes[i % axes.length];
    const y = 120 + ((i * 61 + t * (6 + (i % 5) * 4)) % 400);
    const band = 34 + (y - 120) * .5;
    const x = axis + Math.sin(t * .21 + ph) * band;
    g.fillStyle = 'rgba(255,236,196,' + (.05 + .06 * Math.sin(t * .9 + ph)).toFixed(3) + ')';
    g.beginPath(); g.arc(x, y, 1.3 + (i % 3) * .5, 0, 6.2832); g.fill();
  }
}
/* Trục bụi = đúng trục trụ sáng của từng bản ghép + bàn thờ. */
function ipDustAxes() {
  const sx = Math.round(IP_TW * .749), A = [];
  for (let k = 0; k * IP_TW < IP_MAP_W; k++)
    A.push((k % 2) ? (k + 1) * IP_TW - sx : k * IP_TW + sx);
  A.push(IP_ALTAR_X);
  return A;
}

/* ---------- 6. HẠT ÁNH SÁNG (toạ độ THẾ GIỚI) ---------- */
function ipMote(x, y, up) {
  if (IP_MOTES.length > 150) return;
  IP_MOTES.push({
    x: x, y: y,
    vx: (Math.random() - .5) * 16,
    vy: up ? -(34 + Math.random() * 40) : -(14 + Math.random() * 22),
    r: 1.2 + Math.random() * 2.1, l: 1, d: .42 + Math.random() * .5, ph: Math.random() * 6.28
  });
}
function ipMotesStep(dt) {
  for (let i = IP_MOTES.length - 1; i >= 0; i--) {
    const m = IP_MOTES[i];
    m.l -= dt * m.d;
    if (m.l <= 0) { IP_MOTES.splice(i, 1); continue; }
    m.x += m.vx * dt + Math.sin(m.ph + (1 - m.l) * 5) * 9 * dt;
    m.y += m.vy * dt;
    m.vy *= 1 - .22 * dt;
  }
}
function ipMotesDraw(g) {
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < IP_MOTES.length; i++) {
    const m = IP_MOTES[i], a = Math.max(0, m.l);
    if (typeof hvGlow === 'function') hvGlow(g, m.x, m.y, 7 + m.r * 2, '255,214,140', a * .42);
    g.fillStyle = 'rgba(255,242,206,' + (a * .88).toFixed(3) + ')';
    g.beginPath(); g.arc(m.x, m.y, m.r * a + .4, 0, 6.2832); g.fill();
  }
  g.restore();
}

/* ---------- 6b. BỤI SÁNG & ĐỐM TÀN NẾN LƠ LỬNG (toạ độ THẾ GIỚI) ---------- */
/* Mảng RIÊNG, không trộn vào IP_MOTES: IP_MOTES là burst của lời nguyện
   (sống ~1 giây rồi tắt), còn lớp bụi này phải trôi liên tục nên không có
   tuổi thọ — hạt nào lên tới vòm thì tự quay lại sàn như khói nến.
   Hạt tái sinh NGAY TRONG KHUNG NHÌN đang mở (cam..cam+960) để mật độ không
   đổi khi người chơi đi hết 2400px đại lộ. */
const IP_AMB = [];
const IP_AMB_N = 84;
function ipAmbX() {
  const cam = window._camX || 0;
  return cam + 20 + Math.random() * (IP_VIEW_W - 40);
}
function ipAmbPush(x) {
  IP_AMB.push({
    x: x === undefined ? ipAmbX() : x,
    y: 150 + Math.random() * 430,
    r: .7 + Math.random() * 1.7,
    vy: -(2 + Math.random() * 6),
    sw: 3 + Math.random() * 9,               // biên độ dao động ngang
    sp: .25 + Math.random() * .5,            // tốc độ trôi pha
    ph: Math.random() * 6.2832,
    em: Math.random() < .28                  // đốm tàn nến: ấm và sáng hơn bụi
  });
}
function ipAmbInit() {
  if (IP_AMB.length) return;
  for (let i = 0; i < IP_AMB_N; i++) ipAmbPush();
}
function ipAmbStep(dt) {
  const cam = window._camX || 0;
  for (let i = 0; i < IP_AMB.length; i++) {
    const a = IP_AMB[i];
    a.ph += dt * a.sp;
    a.y += a.vy * dt;
    /* lên tới vòm HOẶC bị camera bỏ rơi (người chơi vừa đi qua đầu kia) → hồi sinh */
    if (a.y < 132 || a.x < cam - 40 || a.x > cam + IP_VIEW_W + 40) {
      a.y = 578; a.x = ipAmbX();
    }
  }
}
function ipAmbDraw(g) {
  ipAmbInit();
  const t = Date.now() / 1000, cam = window._camX || 0;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < IP_AMB.length; i++) {
    const a = IP_AMB[i];
    const x = a.x + Math.sin(a.ph) * a.sw;
    if (x < cam - 20 || x > cam + IP_VIEW_W + 20) continue;   // ngoài khung nhìn: bỏ qua
    const tw = .5 + .5 * Math.sin(t * .8 + a.ph * 2.1);
    const al = (a.em ? .3 : .16) * (.35 + .65 * tw);
    if (typeof hvGlow === 'function')
      hvGlow(g, x, a.y, a.r * 3.4 + 3, a.em ? '255,196,112' : '255,232,190', al);
    g.fillStyle = 'rgba(255,' + (a.em ? 226 : 244) + ',208,' + (al * 1.8).toFixed(3) + ')';
    g.beginPath(); g.arc(x, a.y, a.r, 0, 6.2832); g.fill();
  }
  g.restore();
}

/* ---------- 7. DÒNG CHỮ BAY LÊN TRẦN KÍNH MÀU (toạ độ THẾ GIỚI) ---------- */
function ipWrap(txt, max) {
  const w = txt.split(/\s+/), L = [];
  let cur = '';
  for (let i = 0; i < w.length; i++) {
    if ((cur + ' ' + w[i]).trim().length > max) { if (cur) L.push(cur); cur = w[i]; }
    else cur = (cur + ' ' + w[i]).trim();
  }
  if (cur) L.push(cur);
  return L.slice(0, 3);
}
function ipFlyDraw(g, now) {
  const f = IP_ST.fly;
  if (!f) return;
  const p = (now - f.t0) / 2600;
  if (p >= 1) { IP_ST.fly = null; return; }
  const lines = f.lines || (f.lines = ipWrap(f.txt, 26));
  const x = f.wx, y = 452 - p * 300, a = p < .12 ? p / .12 : 1 - (p - .12) / .88;
  g.save();
  g.textAlign = 'center';
  g.font = 'italic 400 15px ' + IP_SERIF;
  g.globalAlpha = Math.max(0, Math.min(1, a)) * .95;
  for (let i = 0; i < lines.length; i++) {
    const ly = y + i * 19;
    g.lineWidth = 3.2; g.strokeStyle = 'rgba(0,0,0,.75)';
    g.strokeText(lines[i], x, ly);
    g.fillStyle = 'rgba(255,244,214,.96)';
    g.fillText(lines[i], x, ly);
  }
  g.restore();
}

/* ---------- 8. FRAME CẢNH ---------- */
/* Hai lớp nền (đại lộ + trụ sáng) đã bake 2400px → mỗi lớp CHỈ MỘT drawImage
   theo Ô NGUỒN (cam,0,960,600). Nhanh hơn hẳn translate(-cam) rồi vẽ lại cả
   ảnh: trình duyệt không phải nội suy cả tấm 2400px mỗi frame. */
function ipScene() {
  const t = Date.now() / 1000, now = performance.now();
  /* ipProm TRƯỚC: nó quyết định IP_TW/IP_PROM_W rồi mới tới lượt trụ sáng.
     ipProm tự đặt IP_LAY = null khi ảnh đổi cỡ nên thứ tự này an toàn. */
  const prom = ipProm(), lay = ipLayers();
  const cam = Math.max(0, Math.min(IP_CAM_MAX, Math.round(window._camX || 0)));
  const px = S.p.x + cam;                              // nhân vật ở KHÔNG GIAN THẾ GIỚI
  const pfy = S.p.y + 30;                              // ĐIỂM CHÂN

  ctx.fillStyle = '#0a0805'; ctx.fillRect(0, 0, IP_VIEW_W, IP_VIEW_H);
  ctx.drawImage(prom, cam, 0, IP_VIEW_W, IP_VIEW_H, 0, 0, IP_VIEW_W, IP_VIEW_H);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = .9 + .14 * Math.sin(t * .7);
  ctx.drawImage(lay.shaft, cam, 0, IP_VIEW_W, IP_VIEW_H, 0, 0, IP_VIEW_W, IP_VIEW_H);
  ctx.restore();

  /* ===== mọi thứ bên trong khối này tính bằng toạ độ THẾ GIỚI ===== */
  ctx.save(); ctx.translate(-cam, 0);
  ipDust(ctx, t);
  ipAmbDraw(ctx);

  /* Trạm ngoài khung nhìn thì bỏ hẳn — đỡ tạo gradient vô ích. */
  const vis = x => x > cam - 260 && x < cam + IP_VIEW_W + 260;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  if (typeof hvGlow === 'function') {
    if (vis(IP_ALTAR_X)) {
      hvGlow(ctx, IP_ALTAR_X, IP_ALTAR.y - 96, 104, '255,220,158', .2 + .05 * Math.sin(t * 1.3));
      hvGlow(ctx, IP_ALTAR_X - 52, IP_ALTAR.y - 62, 34, '255,190,108', .18 + .06 * Math.sin(t * 3.1));
      hvGlow(ctx, IP_ALTAR_X + 52, IP_ALTAR.y - 62, 34, '255,190,108', .18 + .06 * Math.sin(t * 2.6 + 1));
    }
    if (vis(IP_PORTAL.x))
      hvGlow(ctx, IP_PORTAL.x, IP_PORTAL.y - 34, 78, '255,206,132', .1 + .035 * Math.sin(t * 2.3));
    for (let i = 0; i < IP_CANDLES.length; i++) {
      const c = IP_CANDLES[i];
      if (!c.lit || !vis(c.x)) continue;
      const k = .3 + .06 * Math.sin(t * 2.7 + i * 1.9);
      hvGlow(ctx, c.x, c.y - 40, 118, '255,196,112', k);
      hvGlow(ctx, c.x, c.y + 8, 96, '255,170,80', k * .5);
    }
    /* người NGỒI có quầng ấm riêng nhỏ hơn quầng người quỳ */
    if (IP_ST.si > .02) {
      hvGlow(ctx, px + 10, pfy - 30, 62, '255,226,166', .05 + .13 * IP_ST.si);
      hvGlow(ctx, px + 10, pfy - 58, 40, '255,240,196', .03 + .08 * IP_ST.si);
    }
    if (IP_ST.kn > .02) hvGlow(ctx, px + 10, pfy - 24, 54, '255,236,190', .12 + .34 * IP_ST.kn);
  }
  ctx.restore();

  /* Thứ tự trước-sau theo KHOÁ VẼ pk: mọi trạm của cảnh nhìn NGANG này đều là
     nội thất tựa tường nên pk của chúng CAO hơn mép trên dải đi bộ (500) —
     nhân vật luôn vẽ đè lên, không bao giờ bị ghế/cột nến che mất. */
  const list = [];
  if (vis(IP_PORTAL.x))
    list.push({ k: IP_PORTAL.pk, f: () => ipArchDraw(ctx, IP_PORTAL.x, IP_PORTAL.y + 2, .74, t,
      !(targetAct && targetAct.t === 'ip_world') ? '🏙 VỀ THÀNH PHỐ' : '') });
  for (let i = 0; i < IP_PEWS.length; i++) {
    const p = IP_PEWS[i];
    if (vis(p.x)) list.push({ k: p.pk, f: () => ipPewDraw(ctx, p, t) });
  }
  for (let i = 0; i < IP_CANDLES.length; i++) {
    const c = IP_CANDLES[i];
    if (vis(c.x)) list.push({ k: c.pk, f: () => ipCluster(ctx, c, t) });
  }
  if (vis(IP_ALTAR_X))
    list.push({ k: IP_ALTAR.pk, f: () => ipAltarDraw(ctx, IP_ALTAR_X, IP_ALTAR.y, t) });
  list.push({ k: pfy, f: () => drawSprite(px, S.p.y, 'p') });
  list.sort((a, b) => a.k - b.k);
  for (let i = 0; i < list.length; i++) { try { list[i].f(); } catch (e) {} }

  /* vòng sáng dưới chân khi quỳ / khi ngồi tịnh tâm */
  if (IP_ST.kn > .02 || IP_ST.si > .02) {
    const cx = px + 10, k = ipScale(Math.max(pfy, IP_FEET_TOP));
    const a = Math.max(IP_ST.kn, IP_ST.si);
    ctx.save();
    ctx.strokeStyle = 'rgba(255,238,196,' + (.1 + .45 * a).toFixed(3) + ')';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(cx, pfy + 2, 30 * k, 8 * k, 0, 0, 6.2832); ctx.stroke();
    ctx.restore();
  }

  ipMotesDraw(ctx);
  ipFlyDraw(ctx, now);
  ctx.restore();
  /* ===== hết toạ độ thế giới: từ đây là MÀN HÌNH ===== */

  ctx.globalAlpha = .9; ctx.drawImage(lay.vig, 0, 0); ctx.globalAlpha = 1;

  if (typeof hvCap === 'function')
    hvCap(ctx, 480, 22, '🕊 KHU 5 · ĐẠI LỘ TĨNH TÂM', { font: 'bold 13px ', h: 24, r: 12, blur: 16, olw: 4 });
  /* Nhãn [E] và thanh tiến trình camera đều theo MÀN HÌNH: hvLabel đọc S.p.x thô. */
  if (targetAct && typeof hvLabel === 'function') hvLabel(targetAct.txt || '');
  ipCamBar(ctx, cam);

  if (typeof sfxMuted === 'function' && sfxMuted()) {
    const bl = .25 + .5 * (.5 + .5 * Math.sin(t * 2.1));
    ctx.textAlign = 'center';
    ctx.font = 'italic 400 13px ' + IP_SERIF;
    ctx.fillStyle = 'rgba(238,224,196,' + bl.toFixed(3) + ')';
    ctx.fillText('🎧  Hãy bật âm thanh để nghe đàn organ nhé', 480, 592);
    ctx.textAlign = 'left';
  }
}

/* Mốc đường đi: một vạch mảnh dưới mép trên màn hình cho biết đã đi được bao
   xa trên đại lộ 2400px — cảnh không còn minimap (Zen mode) nên cần dấu này. */
function ipCamBar(g, cam) {
  const wx = S.p.x + 10 + cam;
  const w = 168, x0 = 480 - w / 2, y = 40;
  g.save();
  g.strokeStyle = 'rgba(214,178,110,.22)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(x0, y + .5); g.lineTo(x0 + w, y + .5); g.stroke();
  for (let i = 0; i < IP_CANDLES.length; i++) {
    const p = Math.max(0, Math.min(1, IP_CANDLES[i].x / IP_MAP_W));
    g.fillStyle = IP_CANDLES[i].lit ? 'rgba(255,206,132,.85)' : 'rgba(190,166,124,.4)';
    g.beginPath(); g.arc(x0 + p * w, y, 2.4, 0, 6.2832); g.fill();
  }
  /* ghế dài: vạch ngắn trên vạch mốc, phân biệt với chấm nến */
  g.fillStyle = 'rgba(198,164,116,.5)';
  for (let i = 0; i < IP_PEWS.length; i++) {
    const p = Math.max(0, Math.min(1, IP_PEWS[i].x / IP_MAP_W));
    g.fillRect(x0 + p * w - 1.2, y - 4.5, 2.4, 4);
  }
  g.fillStyle = 'rgba(255,236,196,.3)';
  g.beginPath(); g.arc(x0 + Math.max(0, Math.min(1, IP_ALTAR_X / IP_MAP_W)) * w, y, 3.4, 0, 6.2832); g.fill();
  g.fillStyle = '#f6e9cd';
  g.beginPath(); g.arc(x0 + Math.max(0, Math.min(1, wx / IP_MAP_W)) * w, y, 2.2, 0, 6.2832); g.fill();
  g.restore();
}

/* ---------- 9. HỘP NHẬP LỜI NGUYỆN (DOM) ---------- */
/* CSS nhét vào <style> riêng thay vì style="..." nội tuyến: họ font có dấu nháy
   sẽ đóng sớm thuộc tính HTML và làm rơi mọi khai báo phía sau. */
function ipCss() {
  if (document.getElementById('inpeace-style')) return;
  const s = document.createElement('style');
  s.id = 'inpeace-style';
  s.textContent =
    '#ip-pray{width:432px;padding:0;margin:0;border:1px solid rgba(214,178,110,.55);' +
    'border-radius:16px;background:linear-gradient(160deg,rgba(30,21,11,.97),rgba(14,10,6,.97));' +
    'box-shadow:0 22px 60px rgba(0,0,0,.72),0 0 0 4px rgba(8,6,3,.6);z-index:150;' +
    'font-family:' + IP_SERIF + ';color:#f0e3c8}' +
    '#ip-pray .ip-box{padding:18px 20px 16px}' +
    '#ip-pray .ip-title{font-size:19px;letter-spacing:.06em;text-align:center;color:#f6e9cd;' +
    'text-shadow:0 2px 10px rgba(255,206,132,.35)}' +
    '#ip-pray .ip-sub{font-size:12px;font-style:italic;text-align:center;color:rgba(214,196,164,.7);margin-top:3px}' +
    '#ip-pray .ip-line{height:1px;margin:12px 0;background:linear-gradient(90deg,transparent,rgba(214,178,110,.6),transparent)}' +
    '#ip-wish{width:100%;height:92px;resize:none;display:block;box-sizing:border-box;' +
    'background:rgba(6,4,2,.6);border:1px solid rgba(214,178,110,.35);border-radius:10px;' +
    'color:#f7ecd6;font-family:' + IP_SERIF + ';font-size:15px;font-style:italic;line-height:1.45;padding:10px 12px;outline:none}' +
    '#ip-wish:focus{border-color:rgba(255,222,164,.8);box-shadow:0 0 0 3px rgba(255,206,132,.12)}' +
    '#ip-wish::placeholder{color:rgba(214,196,164,.5)}' +
    '#ip-pray .ip-row{display:flex;gap:10px;margin-top:12px}' +
    '#ip-pray .ip-btn{flex:1;padding:9px 10px;border-radius:10px;cursor:pointer;font-family:' + IP_SERIF + ';' +
    'font-size:14px;background:rgba(46,33,17,.9);border:1px solid rgba(214,178,110,.45);color:#ecdcbb}' +
    '#ip-pray .ip-btn:hover{background:rgba(64,46,22,.95);color:#fff6e2}' +
    '#ip-pray .ip-btn.go{background:linear-gradient(180deg,#c79a4e,#8d6526);border:2px solid #f0d29a;' +
    'box-shadow:0 0 16px rgba(255,206,132,.28);color:#1a1206;font-weight:700;letter-spacing:.02em}' +
    '#ip-pray .ip-btn.go:hover{background:linear-gradient(180deg,#dcac5c,#9c7130);box-shadow:0 0 22px rgba(255,214,150,.42)}' +
    '#ip-pray .ip-btn.ghost{flex:0 0 108px;opacity:.72}' +
    '#ip-pray .ip-hint{font-size:11px;text-align:center;color:rgba(214,196,164,.5);margin-top:9px}' +
    '#ip-logsw{display:block;width:100%;margin-top:10px;padding:7px 8px;border-radius:9px;cursor:pointer;' +
    'background:rgba(0,0,0,.26);border:1px solid rgba(214,178,110,.22);color:rgba(226,206,170,.78);' +
    'font-family:' + IP_SERIF + ';font-size:12.5px;font-style:italic;text-align:center}' +
    '#ip-logsw:hover{color:#fff3da;border-color:rgba(255,222,164,.5)}' +
    '#ip-log{display:none;max-height:148px;overflow-y:auto;margin-top:8px;padding:4px 6px 2px;' +
    'border-top:1px solid rgba(214,178,110,.18);scrollbar-width:thin}' +
    '#ip-log.on{display:block}' +
    '#ip-log .ip-e{padding:7px 2px;border-bottom:1px dotted rgba(214,178,110,.16);font-size:13px;' +
    'line-height:1.42;color:#f2e5cb;font-style:italic;word-break:break-word}' +
    '#ip-log .ip-e:last-child{border-bottom:0}' +
    '#ip-log .ip-d{display:block;font-size:10px;color:rgba(200,180,146,.55);margin-bottom:2px;font-style:normal}' +
    '#ip-log .ip-none{padding:12px 2px;font-size:12px;font-style:italic;text-align:center;color:rgba(214,196,164,.48)}' +
    /* Nút rời Thánh Đường: KHÔNG mang class .modal — openModalEl() đếm mọi .modal
       đang display:flex và engine sẽ dừng update() luôn (người chơi đứng cứng). */
    '#ip-leave{position:absolute;right:10px;top:10px;z-index:120;display:none;padding:5px 11px;' +
    'border-radius:9px;cursor:pointer;background:rgba(10,8,5,.42);border:1px solid rgba(214,178,110,.26);' +
    'color:rgba(236,222,196,.5);font-family:' + IP_SERIF + ';font-size:11.5px;transition:opacity .25s,background .25s}' +
    '#ip-leave.on{display:block}' +
    '#ip-leave:hover{color:#fff4e0;border-color:rgba(255,222,164,.6);background:rgba(22,15,9,.72)}';
  document.head.appendChild(s);
}

/* ---------- Sổ nguyện ước ---------- */
/* Khoá RIÊNG, không đụng network_city_it_support_rpg_v1: tiến trình chính của
   người chơi giữ nguyên từng byte. localStorage có thể ném (chế độ ẩn danh,
   hết quota) → mọi thao tác bọc try/catch, mất log thì chỉ mất log. */
function ipPrayers() {
  try {
    const raw = localStorage.getItem(IP_PRAY_KEY);
    const a = raw ? JSON.parse(raw) : [];
    return Array.isArray(a) ? a : [];
  } catch (e) { return []; }
}
function ipPrayerAdd(txt) {
  if (!txt) return;
  try {
    const a = ipPrayers();
    a.push({ d: Date.now(), t: txt.slice(0, 140) });
    while (a.length > IP_PRAY_MAX) a.shift();
    localStorage.setItem(IP_PRAY_KEY, JSON.stringify(a));
  } catch (e) {}
}
function ipPrayDate(ms) {
  try {
    const d = new Date(ms), p = n => (n < 10 ? '0' : '') + n;
    return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear() + ' · ' +
      p(d.getHours()) + ':' + p(d.getMinutes());
  } catch (e) { return ''; }
}
/* Dựng bằng createElement + textContent: lời nguyện là chữ người chơi gõ ra,
   nhét thẳng vào innerHTML là mở cửa cho HTML/script chạy trong khung modal. */
function ipLogRender() {
  const box = document.getElementById('ip-log');
  if (!box) return;
  const a = ipPrayers();
  box.textContent = '';
  if (!a.length) {
    const n = document.createElement('div');
    n.className = 'ip-none';
    n.textContent = 'Chưa có lời nguyện nào được ghi lại nơi đây.';
    box.appendChild(n);
  }
  for (let i = a.length - 1; i >= 0; i--) {
    const e = a[i] || {};
    const row = document.createElement('div'); row.className = 'ip-e';
    const d = document.createElement('span'); d.className = 'ip-d';
    d.textContent = ipPrayDate(e.d);
    row.appendChild(d);
    row.appendChild(document.createTextNode(String(e.t || '')));
    box.appendChild(row);
  }
  const sw = document.getElementById('ip-logsw');
  if (sw) sw.textContent = '📖 Sổ nguyện ước của bạn (' + a.length + ')';
}

function ipPrayEl() {
  let ov = document.getElementById('ip-pray');
  if (ov) return ov;
  ipCss();
  ov = document.createElement('div');
  ov.id = 'ip-pray'; ov.className = 'modal';
  ov.innerHTML =
    '<div class="ip-box">' +
    '<div class="ip-title">🕊 Lời Nguyện Tĩnh Tâm</div>' +
    '<div class="ip-sub">Nơi đây không có ai đọc — chỉ có bạn và sự tĩnh lặng</div>' +
    '<div class="ip-line"></div>' +
    '<textarea id="ip-wish" maxlength="140" placeholder="Gửi gắm một tâm sự, lời nguyện ước hoặc điều bạn muốn buông bỏ hôm nay..."></textarea>' +
    '<div class="ip-row">' +
    '<button type="button" id="ip-send" class="ip-btn go">[ Thắp Nến &amp; Gửi Đi ]</button>' +
    '<button type="button" id="ip-end" class="ip-btn ghost">Kết thúc</button>' +
    '</div>' +
    '<button type="button" id="ip-logsw">📖 Sổ nguyện ước của bạn (0)</button>' +
    '<div id="ip-log"></div>' +
    '<div class="ip-hint">Enter = gửi · Esc = kết thúc</div>' +
    '</div>';
  document.getElementById('app').appendChild(ov);
  const ta = ov.querySelector('#ip-wish');
  ov.querySelector('#ip-send').addEventListener('click', ipSend);
  ov.querySelector('#ip-end').addEventListener('click', ipEnd);
  ov.querySelector('#ip-logsw').addEventListener('click', function () {
    const box = document.getElementById('ip-log');
    if (!box) return;
    box.classList.toggle('on');
    if (box.classList.contains('on')) ipLogRender();
  });
  /* keydown trong ô nhập không được nổi lên window: engine sẽ hiểu là phím
     điều khiển (engine đã nhường phím khi isTypingField, chặn thêm cho chắc). */
  ta.addEventListener('keydown', e => {
    if (e.code === 'Enter' && !e.shiftKey) { e.preventDefault(); ipSend(); }
    e.stopPropagation();
  });
  return ov;
}

function ipPrayOpen() {
  const ov = ipPrayEl();
  const box = document.getElementById('ip-log');
  if (box) box.classList.remove('on');
  ov.style.display = 'flex';
  const ta = ov.querySelector('#ip-wish');
  ta.value = '';
  ipLogCount();
  setTimeout(() => { try { ta.focus(); } catch (e) {} }, 60);
}
/* Chỉ cập nhật số đếm trên nhãn, không dựng cả danh sách (đỡ đọc localStorage
   khi mở hộp trong lúc ảnh/âm thanh đang bận). */
function ipLogCount() {
  const sw = document.getElementById('ip-logsw');
  if (sw) sw.textContent = '📖 Sổ nguyện ước của bạn (' + ipPrayers().length + ')';
}
function ipPrayClose() {
  const ov = document.getElementById('ip-pray');
  if (ov) ov.style.display = 'none';
  try { if (typeof releaseFocus === 'function') releaseFocus(); } catch (e) {}
}

/* ---------- 10. MÁY TRẠNG THÁI QUỲ ---------- */
const ipSmooth = p => p * p * (3 - 2 * p);

function ipKneel() {
  if (IP_ST.st) return;
  IP_ST.st = 'down'; IP_ST.kn = 0;
  IP_ST.kx = S.p.x; IP_ST.ky = S.p.y;
  IP_ST.t0 = performance.now();
  if (typeof sfxPlay === 'function') sfxPlay('pop', .7);
  beep(320, 'sine', .12, .025);
}

function ipSend() {
  if (IP_ST.st !== 'kneel') return;
  const ov = document.getElementById('ip-pray');
  const ta = ov && ov.querySelector('#ip-wish');
  const txt = ((ta && ta.value) || '').trim().slice(0, 140);
  ipPrayClose();
  IP_ST.st = 'rise'; IP_ST.kn = 1; IP_ST.t0 = performance.now();
  IP_ST.pray++;

  /* chỉ ghi vào Sổ khi thực sự có chữ — lời thầm lặng không để lại dòng trống */
  ipPrayerAdd(txt);

  /* dòng chữ hoá đốm sáng bay lên trần kính màu — TẤT CẢ theo thế giới,
     vì camera có thể trôi trong 2.6 giây chữ bay */
  const cam = window._camX || 0;
  IP_ST.fly = { txt: txt || 'Một lời thầm lặng', lines: null, t0: performance.now(), wx: IP_ALTAR_X };
  const cx = S.p.x + 10 + cam, fy = S.p.y + 30;
  for (let i = 0; i < 70; i++) ipMote(cx + (Math.random() - .5) * 46, fy - Math.random() * 46, true);
  for (let i = 0; i < 26; i++) ipMote(IP_ALTAR_X + (Math.random() - .5) * 90, 452 - Math.random() * 40, true);

  /* +100 EXP ngay, rồi 10 phút +10% EXP "Tâm Hồn Bình An". addXP() gọi TRƯỚC
     khi bật buff để phần thưởng đúng 100, không bị chính buff nhân lên. */
  try { if (typeof addXP === 'function') addXP(IP_XP); } catch (e) {}
  IP_PEACE.until = Date.now() + IP_PEACE_MS;
  try { if (typeof syncHUD === 'function') syncHUD(); } catch (e) {}
  if (typeof showBanner === 'function')
    showBanner('KHU 5 · THÁNH ĐƯỜNG', '🕊 Tâm Hồn Bình An',
      '+' + IP_XP + ' EXP · +10% EXP trong 10 phút', 'violet');
  /* Chuông ngân một tiếng rồi hợp âm sáng đuổi theo — tiếng "thánh thót"
     lúc lời nguyện bay lên. beep()/chord() vẫn tôn trọng nút 🔊. */
  ipBell(true);
  setTimeout(() => { try { chord([784, 1046, 1318]); } catch (e) {} }, 420);
  try { if (typeof saveGame === 'function') saveGame(); } catch (e) {}
}

function ipEnd() {
  if (IP_ST.st !== 'kneel') return;
  ipPrayClose();
  IP_ST.st = 'up'; IP_ST.t0 = performance.now();
  beep(300, 'sine', .1, .02);
}

function ipKneelTick(now) {
  if (IP_ST.st === 'down') {
    const p = Math.min(1, (now - IP_ST.t0) / IP_KNEEL_MS);
    IP_ST.kn = ipSmooth(p);
    if (p >= 1) { IP_ST.st = 'kneel'; IP_ST.kn = 1; ipPrayOpen(); }
  } else if (IP_ST.st === 'kneel') {
    /* closeAll() (ESC / bấm mở bảng khác / mở bản đồ) chỉ đặt display:none,
       engine không có callback → phải poll. Cùng cách heaven.js:958. */
    const ov = document.getElementById('ip-pray');
    if (!ov || ov.style.display !== 'flex') ipEnd();
  } else if (IP_ST.st === 'rise') {
    const p = Math.min(1, (now - IP_ST.t0) / (IP_RISE_HOLD + IP_RISE_MS));
    IP_ST.kn = p < .6 ? 1 : 1 - ipSmooth((p - .6) / .4);
    if (p >= 1) { IP_ST.st = ''; IP_ST.kn = 0; }
  } else if (IP_ST.st === 'up') {
    const p = Math.min(1, (now - IP_ST.t0) / IP_KNEEL_MS);
    IP_ST.kn = 1 - ipSmooth(p);
    if (p >= 1) { IP_ST.st = ''; IP_ST.kn = 0; }
  }
  /* hạt ánh sáng lơ lửng quanh người đang quỳ (thế giới) */
  if (IP_ST.kn > .5 && Math.random() < .5)
    ipMote(S.p.x + 10 + (window._camX || 0) + (Math.random() - .5) * 30,
      S.p.y + 30 - Math.random() * 26, false);
}

/* ---------- 10b. CHẾ ĐỘ ZEN — DỌN SẠCH HUD ---------- */
/* Chỉ đụng style.display NỘI TUYẾN và ghi lại giá trị cũ để trả lại y nguyên:
   không xoá class, không sửa stylesheet — panel nào đang mở/mờ sẵn thì về Khu 1
   vẫn đúng trạng thái đó. Code khác (syncHUD, updateBuffBar) có bật lại element
   giữa chừng thì ipZenSync re-assert mỗi frame; giá trị ghi nhớ lấy ở lần BẬT
   đầu tiên nên lúc khôi phục vẫn đúng như trước khi vào Thánh Đường. */
function ipLeaveEl() {
  let b = document.getElementById('ip-leave');
  if (b) return b;
  ipCss();
  b = document.createElement('button');
  b.type = 'button'; b.id = 'ip-leave';
  b.textContent = '✕ Rời khỏi Thánh Đường';
  b.addEventListener('click', ipLeave);
  (document.getElementById('app') || document.body).appendChild(b);
  return b;
}
function ipZenOn() {
  if (IP_ST.zen) return;
  IP_ST.zen = 1;
  for (let i = 0; i < IP_HUD_IDS.length; i++) {
    const id = IP_HUD_IDS[i], el = document.getElementById(id);
    if (!el) continue;
    IP_ST.hud[id] = el.style.display;
    el.style.display = 'none';
  }
  const b = ipLeaveEl();
  if (b) b.classList.add('on');
}
function ipZenOff() {
  if (!IP_ST.zen) return;
  IP_ST.zen = 0;
  for (const id in IP_ST.hud) {
    const el = document.getElementById(id);
    if (el) el.style.display = IP_ST.hud[id];
  }
  IP_ST.hud = {};
  const b = document.getElementById('ip-leave');
  if (b) b.classList.remove('on');
}
function ipZenSync() {
  if (S.scene === 'INPEACE') {
    if (!IP_ST.zen) ipZenOn();
    else for (let i = 0; i < IP_HUD_IDS.length; i++) {
      const el = document.getElementById(IP_HUD_IDS[i]);
      if (el && el.style.display !== 'none') el.style.display = 'none';
    }
  } else if (IP_ST.zen) ipZenOff();
}
/* Lối ra thứ hai (ngoài [E] ở mép dưới và phím Esc): một nút mờ duy nhất. */
function ipLeave() {
  if (IP_CUT || S.scene !== 'INPEACE') return;
  if (typeof openModalEl === 'function' && openModalEl()) return;  // hộp Lời Nguyện đang mở
  if (typeof sfxPlay === 'function') sfxPlay('pop', .8);
  ipFade('🕊 ĐANG RỜI THÁNH ĐƯỜNG', ipWorld);
}

/* Esc trong Thánh Đường: hộp Lời Nguyện đang mở → engine đóng hộp (closeAll),
   không rời cảnh. Vì listener của engine nổi bọt còn của ta BẮT Ở GIAI ĐOẠN
   THU GOM (capture) — chạy trước — nên lúc đọc openModalEl() hộp còn nguyên
   trạng thái và phân biệt được hai trường hợp. */
window.addEventListener('keydown', function (e) {
  try {
    if (e.code !== 'Escape' || e.repeat) return;
    if (S.scene !== 'INPEACE' || IP_CUT || IP_ST.st) return;
    if (typeof openModalEl === 'function' && openModalEl()) return;
    /* DEV MENU (F2) không phải .modal nên openModalEl không thấy: Esc đang
       đóng bảng nhảy ải thì đừng có luôn tay kéo người chơi ra khỏi Thánh Đường. */
    const dm = document.getElementById('dev-menu');
    if (dm && getComputedStyle(dm).display !== 'none') return;
    ipLeave();
  } catch (err) {}
}, true);

/* ---------- 11. DỜI CẢNH ---------- */
function ipEnter() {
  S.scene = 'INPEACE';
  window._camX = 0;                                  // đầu đại lộ, chưa cuộn
  S.p.x = IP_SPAWN.x - 10; S.p.y = IP_SPAWN.y - 30;
  S.p.moving = false;
  ipZenOn();
  setZone('5. THÁNH ĐƯỜNG', 'Tĩnh Tâm — In Peace');
  if (typeof sfxPlay === 'function') { sfxPlay('pop'); sfxPlay('coin', 1.6); }
  chord([392, 523, 659, 784]);
  if (typeof showBanner === 'function')
    showBanner('KHU 5 · ĐẠI LỘ TĨNH TÂM', '🕊 Tĩnh Tâm',
      'Đi hết 2400px đại lộ · Ngồi ghế [E] · Thắp nến · Bàn thờ cuối đường', 'violet');
  ipBgmLoad(); ipBgmStart();
  try { if (typeof saveGame === 'function') saveGame(); } catch (e) {}
}

function ipWorld() {
  S.scene = 'WORLD';
  window._camX = 0;
  S.p.x = IP_GATE.x - 10; S.p.y = IP_GATE.y - 18;
  S.p.moving = false;
  IP_ST.st = ''; IP_ST.kn = 0; IP_ST.fly = null; IP_MOTES.length = 0;
  IP_AMB.length = 0;
  ipPrayClose();
  ipZenOff();
  setZone('1. THÀNH PHỐ', 'Network City (World Map)');
  ipBgmStop();
  if (typeof sfxPlay === 'function') sfxPlay('pop', .8);
  beep(380);
  try { if (typeof saveGame === 'function') saveGame(); } catch (e) {}
}

/* ---------- 12. CẮT CẢNH TỐI MÀU NẾN ---------- */
function ipCutOv() {
  let ov = document.getElementById('ip-cut');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'ip-cut'; ov.className = 'modal';
    ov.innerHTML = '<canvas id="ip-cut-cv" width="960" height="600" style="width:100%;height:100%;display:block"></canvas>';
    document.getElementById('app').appendChild(ov);
  }
  ov.style.cssText = 'display:flex;position:absolute;inset:0;padding:0;margin:0;background:transparent;' +
    'border:0;border-radius:0;z-index:160;transform:none;animation:none;overflow:hidden';
  return ov;
}
function ipCutFrame(c, p, cap) {
  /* đường cong tam giác: 0 → 1 (nửa đầu) → 0 (nửa sau), làm mượt bằng cosine */
  const a = .5 - .5 * Math.cos(Math.PI * 2 * p);
  c.clearRect(0, 0, 960, 600);
  c.fillStyle = 'rgba(16,11,5,' + (a * .97).toFixed(3) + ')'; c.fillRect(0, 0, 960, 600);
  const cg = c.createRadialGradient(480, 300, 40, 480, 300, 520);
  cg.addColorStop(0, 'rgba(196,142,64,' + (a * .34).toFixed(3) + ')');
  cg.addColorStop(1, 'rgba(26,18,8,0)');
  c.fillStyle = cg; c.fillRect(0, 0, 960, 600);
  if (cap && a > .55) {
    c.globalAlpha = Math.min(1, (a - .55) / .3);
    c.textAlign = 'center';
    c.font = 'italic 400 22px ' + IP_SERIF;
    c.lineWidth = 6; c.strokeStyle = 'rgba(0,0,0,.9)'; c.strokeText(cap, 480, 296);
    c.fillStyle = '#f4e7c8'; c.fillText(cap, 480, 296);
    c.font = '400 13px ' + IP_SERIF; c.fillStyle = '#c9aa66';
    c.fillText('🕊      🕊', 480, 326);
    c.globalAlpha = 1; c.textAlign = 'left';
  }
}
function ipFade(cap, then) {
  if (IP_CUT) return;
  const ov = ipCutOv(), cv = document.getElementById('ip-cut-cv'), c = cv.getContext('2d');
  const t0 = performance.now();
  let fired = false;
  IP_CUT = { ov: ov };
  const finish = () => {
    IP_CUT = null;
    ov.style.cssText = 'display:none';
    c.clearRect(0, 0, 960, 600);
    if (!fired) { fired = true; try { then(); } catch (e) {} }
  };
  const step = () => {
    if (!IP_CUT) return;
    if (ov.style.display !== 'flex') { finish(); return; }        // người chơi bấm ESC
    const p = Math.min(1, (performance.now() - t0) / IP_FADE);
    ipCutFrame(c, p, cap);
    if (!fired && p >= .5) { fired = true; try { then(); } catch (e) {} }
    if (p < 1) requestAnimationFrame(step); else finish();
  };
  requestAnimationFrame(step);
}

/* ---------- 13. UPDATE ---------- */
/* Nhánh nến: tàn lửa bay đều đều từ cụm đã thắp (dt-biến, không phụ thuộc FPS). */
function ipCandleTick(dt) {
  for (let i = 0; i < IP_CANDLES.length; i++) {
    const c = IP_CANDLES[i];
    if (c.lit && Math.random() < dt * 7)
      ipMote(c.x + (Math.random() - .5) * 56, c.y - 26 - Math.random() * 34, true);
  }
}
function ipLight(c) {
  if (c.lit) return;
  c.lit = 1;
  if (typeof sfxPlay === 'function') sfxPlay('pop', .7);
  ipBell(false);
  for (let i = 0; i < 36; i++)
    ipMote(c.x + (Math.random() - .5) * 62, c.y - 20 - Math.random() * 44, true);
  if (typeof showBanner === 'function')
    showBanner('KHU 5 · ĐẠI LỘ TĨNH TÂM', '🕯 Đã thắp nến',
      'Lửa đã lên — cứ để nó cháy ở đây một lúc');
}
/* Chọn trạm gần nhất theo ĐIỂM VA CHẠM quy ra thế giới. */
function ipPrompt() {
  const wx = ipWx(), wy = S.p.y + 18;
  const near = (o, dy0, dy1) =>
    Math.abs(wx - o.x) < o.r && wy > o.y - dy0 && wy < o.y + dy1;
  if (near(IP_ALTAR, 96, 90)) { targetAct = { t: 'ip_pray', txt: '[E] 🕯 THẮP NẾN LỚN' }; return; }
  for (let i = 0; i < IP_CANDLES.length; i++) {
    const c = IP_CANDLES[i];
    if (!c.lit && near(c, 70, 60)) { targetAct = { t: 'ip_light', i: i, txt: '[E] 🕯 THẮP NẾN' }; return; }
  }
  for (let i = 0; i < IP_PEWS.length; i++) {
    const p = IP_PEWS[i];
    if (near(p, 62, 62)) { targetAct = { t: 'ip_sit', i: i, txt: '[E] 🪑 NGỒI TỊNH TÂM' }; return; }
  }
  if (near(IP_PORTAL, 70, 60)) { targetAct = { t: 'ip_world', txt: '[E] 🏙 VỀ LẠI THÀNH PHỐ' }; return; }
  targetAct = null;
}

/* ---------- 10c. MÁY TRẠNG THÁI NGỒI GHẾ ---------- */
/* Ngồi = khoá vị trí y hệt quỳ, nhưng điểm chân đặt LÊN MẶT GHẾ (ipSeatY) chứ
   không phải mặt sàn, và thân co 74% quanh chân để đọc là đang ngồi chứ không
   phải đang đứng còng. */
function ipSit(p) {
  if (IP_ST.st) return;
  const cam = window._camX || 0;
  IP_ST.st = 'sit'; IP_ST.si = 0; IP_ST.pew = p;
  IP_ST.kx = p.x - 10 - cam;
  IP_ST.ky = ipSeatY(p) - 30;
  IP_ST.t0 = performance.now(); IP_ST.tSit = 0;
  if (typeof sfxPlay === 'function') sfxPlay('pop', .6);
  beep(240, 'sine', .14, .02);
}

function ipStand() {
  if (IP_ST.st !== 'sit' && IP_ST.st !== 'seated') return;
  const p = IP_ST.pew, now = performance.now();
  const seated = IP_ST.tSit ? (now - IP_ST.tSit) : 0;
  IP_ST.st = 'stand'; IP_ST.t0 = now;
  beep(300, 'sine', .1, .018);
  if (!p || seated < IP_SEAT_MIN_MS || Date.now() < p.next) return;

  /* Ngồi đủ lâu + ghế này đã nguội cooldown → +10 Tâm Hồn, cộng thêm 5 phút
     cho buff 🕊 (không cộng dồn vô hạn, kẹp đúng trần IP_PEACE_MS). addXP() gọi
     TRƯỚC khi bật buff để phần thưởng đúng 10, không bị chính buff nhân lên. */
  p.next = Date.now() + IP_SEAT_COOL_MS;
  try { if (typeof addXP === 'function') addXP(IP_SOUL_XP); } catch (e) {}
  const left = Math.max(0, IP_PEACE.until - Date.now());
  IP_PEACE.until = Date.now() + Math.min(IP_PEACE_MS, left + IP_SEAT_PEACE_MS);
  try { if (typeof syncHUD === 'function') syncHUD(); } catch (e) {}
  if (typeof showBanner === 'function')
    showBanner('KHU 5 · ĐẠI LỘ TĨNH TÂM', '🕊 Tâm Hồn Bình Lặng',
      '+' + IP_SOUL_XP + ' EXP · buff 🕊 thêm 5 phút', 'violet');
  const cx = S.p.x + 10 + (window._camX || 0);
  for (let i = 0; i < 24; i++)
    ipMote(cx + (Math.random() - .5) * 40, S.p.y + 30 - Math.random() * 40, true);
  ipBell(false);
  try { if (typeof saveGame === 'function') saveGame(); } catch (e) {}
}

function ipSitTick(now) {
  if (IP_ST.st === 'sit') {
    const p = Math.min(1, (now - IP_ST.t0) / IP_SIT_MS);
    IP_ST.si = ipSmooth(p);
    if (p >= 1) { IP_ST.st = 'seated'; IP_ST.tSit = now; }
  } else if (IP_ST.st === 'seated') {
    IP_ST.si = 1;
    /* hạt vàng lơ lửng quanh người rồi bay lên trần kính màu. Mật độ PHẢI thưa
       và dải sinh PHẢI cao ~100px: hvGlow cộng sáng kiểu 'lighter' nên hàng chục
       quầng sinh ngay trong bụng người sẽ chồng thành quả cầu trắng nuốt mất
       nhân vật (nhìn thấy rõ trên khung hình chụp lúc thử). */
    if (Math.random() < .14) {
      const cx = S.p.x + 10 + (window._camX || 0);
      ipMote(cx + (Math.random() - .5) * 58, S.p.y + 24 - Math.random() * 96, true);
    }
  } else if (IP_ST.st === 'stand') {
    const p = Math.min(1, (now - IP_ST.t0) / IP_SIT_MS);
    IP_ST.si = 1 - ipSmooth(p);
    if (p >= 1) {
      IP_ST.st = ''; IP_ST.si = 0; IP_ST.pew = null;
      /* trả thân về MẶT SÀN sát mép trên dải đi bộ: mặt ghế cao hơn sàn ~30px,
         nếu để nguyên thì điểm va chạm rơi ngoài dải → propCollides chặn hết
         mọi hướng và nhân vật đứng chết tại chỗ. */
      S.p.y = IP_FEET_TOP - 30 + 4;
    }
  }
}

function ipUpdate(dt, now) {
  ipZenSync();
  /* Rời cảnh bằng đường vòng (fast-travel, ESC giữa cắt cảnh) → dọn tư thế */
  if (S.scene !== 'INPEACE' && (IP_ST.st || IP_ST.kn || IP_ST.si)) {
    IP_ST.st = ''; IP_ST.kn = 0; IP_ST.si = 0; IP_ST.pew = null;
    IP_ST.fly = null; IP_MOTES.length = 0; ipPrayClose();
  }
  ipMotesStep(dt);
  if (S.scene === 'INPEACE') { ipAmbStep(dt); ipKneelTick(now); ipSitTick(now); ipCandleTick(dt); }
  ipBgmSync();

  if (IP_CUT) return;
  if (S.scene === 'INPEACE') {
    if (IP_ST.st) {
      /* khoá di chuyển: engine vừa tính xong vị trí frame này → kẹp lại.
         KHÔNG chạy ipCamStep: camera phải đứng yên suốt lúc quỳ/ngồi, nếu không
         edge-scroll sẽ sửa lại S.p.x vừa khoá và người chơi trôi dần về mép. */
      S.p.x = IP_ST.kx; S.p.y = IP_ST.ky; S.p.moving = false;
    } else ipCamStep();
    if (IP_ST.st || openModalEl()) { targetAct = null; return; }
    ipPrompt();
    return;
  }
  /* KHÔNG đụng window._camX ở đây: STREET đang dùng nó và game.js tự cập nhật
     mỗi frame. ipEnter()/ipWorld() mới là nơi reset khi vào/ra Khu 5. */
  if (typeof HV_CUT !== 'undefined' && HV_CUT) return;      // Khu 4 đang cắt cảnh
  if (S.scene !== 'WORLD') return;
  if (typeof anyCtlModalOpen === 'function' && anyCtlModalOpen()) return;
  const cx = S.p.x + 10, cy = S.p.y + 18;
  /* Nhượng [E] cho cửa toà nhà: engine bật gợi ý 'bld' trong bán kính 40px quanh
     hộp ACADEMY (engine.js:1436-1440), tức là tới chân 187. Đứng cao trên bậc
     thì vào Học Viện, đứng ở bậc cuối/mặt thềm thì vào Thánh Đường — cả hai lối
     đi đều còn dùng được. Ngược lại cổng LUÔN thắng gợi ý của người đi dạo: bạn
     Khang tuần tra ngay trước thềm (bán kính 62px, game.js:7534) nên nếu nhường
     thì cổng gần như không bao giờ bấm được, trong khi NPC thì đi tiếp và theo
     lại được. */
  if (!(targetAct && targetAct.t === 'bld') &&
      Math.hypot(cx - IP_GATE.x, cy - IP_GATE.y) < IP_GATE.r)
    targetAct = { t: 'to_inpeace', txt: '[E] 🕊 VÀO THÁNH ĐƯỜNG TĨNH TÂM' };
}

/* ---------- 14. MÓC NỐI ---------- */
/* Tường của đại lộ = hai đầu khúc đường. nx/ny engine đưa vào là ĐIỂM NEO hệ
   MÀN HÌNH, phải cộng _camX mới ra thế giới. Biên RỘNG HƠN SCENE_WALK một chút
   để đúng hàng kẹp không bị tính là "ngoài" (chặn mọi hướng → kẹt đứng). */
const _ipOldProp = propCollides;
propCollides = function (sc, nx, ny) {
  if (sc !== 'INPEACE') return _ipOldProp(sc, nx, ny);
  const wx = nx + 10 + (window._camX || 0), wy = ny + 18;
  return !(wx > IP_X0 && wx < IP_X1 && wy > IP_FEET_TOP - 18 && wy < IP_FEET_BOT + 12);
};

const _ipOldUpd = update;
update = function () {
  _ipOldUpd.apply(this, arguments);
  const now = performance.now();
  const dt = Math.min(.05, (now - (IP_ST.last || now)) / 1000);
  IP_ST.last = now;
  try { ipUpdate(dt, now); } catch (e) {}
};

const _ipOldRnd = render;
render = function () {
  _ipOldRnd();
  if (S.scene === 'INPEACE' && !IP_CUT) { try { ipScene(); } catch (e) {} }
};

const _ipOldAct = doAction;
doAction = function () {
  if (IP_CUT) return;
  if (S.scene === 'INPEACE') {
    if (IP_ST.st || !targetAct) return;              // đang quỳ: [E] không làm gì khác
    if (targetAct.t === 'ip_pray') { ipKneel(); return; }
    if (targetAct.t === 'ip_light') { ipLight(IP_CANDLES[targetAct.i] || IP_CANDLES[0]); return; }
    if (targetAct.t === 'ip_sit') { ipSit(IP_PEWS[targetAct.i] || IP_PEWS[0]); return; }
    if (targetAct.t === 'ip_world') { ipFade('🕊 ĐANG RỜI THÁNH ĐƯỜNG', ipWorld); return; }
    return;
  }
  if (targetAct && targetAct.t === 'to_inpeace') {
    ipFade('🕊 ĐANG BƯỚC VÀO THÁNH ĐƯỜNG TĨNH TÂM', ipEnter); return;
  }
  _ipOldAct.apply(this, arguments);
};

/* Đàn thỏ thiên thần KHÔNG vào nhà thờ: Khu 5 là nơi tĩnh tâm tuyệt đối.
   bunnyHerd() = BUN.herd[S.scene] || spawnBunnies() → trả về mảng RỖNG
   (truthy) là cả bunnyStep lẫn hook vẽ trong bunnies.js:489 đều không sinh
   thỏ; hàm bị chặn nên BUN.herd.INPEACE không bao giờ bị ghi, còn mấy chỗ
   đọc trực tiếp `BUN.herd[S.scene]` (bunnies.js:414, 462) gặp undefined là
   tự về. Về Khu 1 thì bầy WORLD và bầy HEAVEN vẫn nguyên vẹn. */
const IP_NOHERD = [];
if (typeof bunnyHerd === 'function') {
  const _ipOldHerd = bunnyHerd;
  bunnyHerd = function () {
    return S.scene === 'INPEACE' ? IP_NOHERD : _ipOldHerd.apply(this, arguments);
  };
}

/* Phối cảnh + tư thế quỳ: co giãn quanh ĐIỂM CHÂN nên nhân vật không "bay"
   khi nhỏ lại, và bóng tiếp xúc + bụi chân của vfx.js (vẽ trong drawChibi)
   co theo đúng tỷ lệ. */
const _ipOldSpr = drawSprite;
drawSprite = function (x, y, r) {
  if (S.scene !== 'INPEACE' || r === 'amb') return _ipOldSpr(x, y, r);
  const cx = x + 10, fy = y + 30, k = ipScale(Math.max(fy, IP_FEET_TOP));
  const sq = 1 - .30 * IP_ST.kn - .26 * IP_ST.si;     // quỳ 70% · ngồi 74%
  ctx.save();
  ctx.translate(cx, fy); ctx.scale(k, k * sq); ctx.translate(-cx, -fy);
  try { _ipOldSpr(x, y, r); } finally { ctx.restore(); }
};

/* ĐỨNG DẬY bằng phím bất kỳ trong nhóm di chuyển (WASD / mũi tên / Space).
   Lắng nghe CAPTURE trước engine.js để nhân vật bật dậy ngay cùng frame;
   modal lời nguyện đang mở thì BỎ QUA — lúc đó phím là để gõ chữ. */
const IP_STAND_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
window.addEventListener('keydown', function (e) {
  try {
    if (S.scene !== 'INPEACE') return;
    if (IP_ST.st !== 'sit' && IP_ST.st !== 'seated') return;
    if (openModalEl()) return;
    if (IP_STAND_KEYS.indexOf(e.code) >= 0) ipStand();
  } catch (err) {}
}, true);

/* Nhạc thành phố IM HẲN trong Thánh Đường (không chỉ nhỏ lại mức duck .1).
   SFX.duck là memo của sfx.js — đặt nó về 0 thì lúc rời đi, hàm gốc tính lại
   thấy khác (vol .4) nên tự mở nhạc phố lên, không cần đụng sfx.js. */
const _ipOldDuck = sfxBgmDuck;
sfxBgmDuck = function () {
  if (S.scene !== 'INPEACE') { _ipOldDuck.apply(this, arguments); return; }
  try {
    if (typeof SFX !== 'undefined' && SFX.on && SFX.gain && SFX.duck !== 0) {
      SFX.duck = 0;
      SFX.gain.gain.setTargetAtTime(0, SFX.ctx.currentTime, SFX_BGM.tc);
    }
  } catch (e) {}
};

/* Bước chân trên đại lộ cuộn. sfx.js:175 chỉ cộng _camX khi S.scene==='STREET';
   ở Khu 5 người chơi đi giữa màn hình thì quãng đường đo được gần bằng 0 → im
   bặt. Mượn nguyên bộ đếm px đã tinh chỉnh của sfx.js bằng cách alias cảnh
   trong LÚC GỌI (finally trả lại ngay, sfxStep chỉ đọc S.scene để tính cam và
   so khung cảnh cũ/mới). Không sửa một dòng nào của sfx.js. */
const _ipOldStep = sfxStep;
sfxStep = function () {
  if (S.scene !== 'INPEACE') return _ipOldStep.apply(this, arguments);
  const sc = S.scene;
  S.scene = 'STREET';
  try { return _ipOldStep.apply(this, arguments); } finally { S.scene = sc; }
};

/* Buff 🕊 Tâm Hồn Bình An: +10% EXP mọi nguồn trong 10 phút. Chỉ sống trong
   phiên này — file save giữ nguyên từng byte. */
const _ipOldXP = addXP;
addXP = function (n) {
  if (n > 0 && IP_PEACE.until > Date.now()) n = Math.round(n * 1.1);
  return _ipOldXP(n);
};

/* Chip 🕊 trên dải buff HUD. Bản gốc rebuild innerHTML mỗi khi danh sách buff
   đổi nên phải kiểm tra chip còn tồn tại, không memo một lần. */
const _ipOldBuff = updateBuffBar;
updateBuffBar = function () {
  _ipOldBuff();
  try {
    const bar = document.getElementById('buff-bar');
    if (!bar) return;
    const left = Math.max(0, Math.ceil((IP_PEACE.until - Date.now()) / 1000));
    const chip = bar.querySelector('.buff-ip');
    if (!left) { if (chip) chip.remove(); return; }
    const tip = '🕊 Tâm Hồn Bình An · +10% EXP · còn ' + Math.floor(left / 60) + ' phút';
    if (chip) chip.setAttribute('data-tip', tip);
    else {
      const el = document.createElement('span');
      el.className = 'buff-chip buff-ip';
      el.setAttribute('data-tip', tip);
      el.textContent = '🕊';
      bar.appendChild(el);
      bar.classList.remove('hidden');
    }
  } catch (e) {}
};

/* Cổng đá ở thềm Học Viện CCNA — vẽ qua depth sort của engine (key = d.y): nhân
   vật đi sau thì bị cổng che, đứng dưới bậc (chân > 196) thì đè lên cổng, và
   biển tên không bị người đi đường che mất. */
decor.push({ t: 'ip_gate', x: IP_GATE.x, y: IP_GATE.y + IP_GATE.dy, s: IP_GATE.s });

const _ipOldDecor = drawDecor;
drawDecor = function (d) {
  if (d.t === 'ip_gate') { try { ipGateWorld(d); return; } catch (e) {} }
  _ipOldDecor(d);
};

/* ---------- 15. CỔNG ĐÁ WORLD + NGỌN NẾN ---------- */
/* Cổng ở chân cầu thang Học Viện CCNA — engine gọi qua depth sort của decor.
   Vẽ nhờ ipArchDraw, chỉ khác mỗi biển tên (ẩn khi đã có nhãn [E] để khỏi chồng). */
function ipGateWorld(d) {
  ipArchDraw(ctx, d.x, d.y, d.s || 1, Date.now() / 1000,
    (!(targetAct && targetAct.t === 'to_inpeace')) ? '🕯 THÁNH ĐƯỜNG TĨNH TÂM' : '');
}

/* Ngọn nến vẽ bằng vector — artist gửi ảnh thật thì thay mỗi hàm này.
   unlit = 1: nến chưa thắp (không quầng, không lửa, không tàn). */
function ipCandle(g, cx, cy, t, unlit) {
  /* dao động lửa: 3 sóng cộng pha → không ra nhịp tuần hoàn rõ rệt */
  const fl = Math.sin(t * 7.3) * .5 + Math.sin(t * 11.7) * .3 + Math.sin(t * 3.1) * .2;
  const fh = 21 + fl * 2.4, lean = fl * 1.7;
  const fy = cy - 30;                                   // mũi lửa gốc tại đây

  if (!unlit) {
    /* quầng sáng ấm quanh lửa */
    const gl = g.createRadialGradient(cx + lean, fy - fh * .4, 2, cx + lean, fy - fh * .4, 74);
    gl.addColorStop(0, 'rgba(255,224,160,.5)');
    gl.addColorStop(.35, 'rgba(255,176,80,.16)');
    gl.addColorStop(1, 'rgba(255,150,60,0)');
    g.fillStyle = gl;
    g.beginPath(); g.arc(cx + lean, fy - fh * .4, 74, 0, 6.2832); g.fill();
  }

  /* chân nến */
  g.fillStyle = '#8a6a34';
  g.beginPath(); g.ellipse(cx, cy + 40, 26, 7, 0, 0, 6.2832); g.fill();
  g.fillStyle = 'rgba(226,190,120,.85)';
  g.beginPath(); g.ellipse(cx, cy + 37, 22, 6, 0, 0, 6.2832); g.fill();

  /* thân nến: trụ + bóng hai bên */
  const bw = 9, top = cy - 24, bot = cy + 34;
  const wax = g.createLinearGradient(cx - bw, 0, cx + bw, 0);
  wax.addColorStop(0, '#bfa478'); wax.addColorStop(.35, '#f6ead0');
  wax.addColorStop(.62, '#efe0c2'); wax.addColorStop(1, '#a98d63');
  g.fillStyle = wax;
  g.fillRect(cx - bw, top, bw * 2, bot - top);
  g.beginPath(); g.ellipse(cx, top, bw, 3.2, 0, 0, 6.2832); g.fill();
  /* sáp chảy */
  g.fillStyle = 'rgba(250,240,220,.9)';
  g.beginPath(); g.ellipse(cx - 5, top + 12, 2.2, 7, 0, 0, 6.2832); g.fill();

  /* bấc */
  g.strokeStyle = unlit ? '#2a2118' : '#3a2a18'; g.lineWidth = 1.6;
  g.beginPath();
  if (unlit) { g.moveTo(cx, top); g.lineTo(cx, top - 7); }
  else { g.moveTo(cx, top); g.lineTo(cx + lean * .3, fy - 2); }
  g.stroke();
  if (unlit) return;

  /* lửa: ngoài cam, trong trắng-vàng */
  g.beginPath();
  g.moveTo(cx - 6.2, fy);
  g.quadraticCurveTo(cx - 7.4 + lean, fy - fh * .55, cx + lean, fy - fh);
  g.quadraticCurveTo(cx + 7.4 + lean, fy - fh * .55, cx + 6.2, fy);
  g.quadraticCurveTo(cx, fy + 3.4, cx - 6.2, fy);
  g.closePath();
  const fg = g.createLinearGradient(0, fy - fh, 0, fy + 2);
  fg.addColorStop(0, 'rgba(255,236,180,.95)');
  fg.addColorStop(.45, 'rgba(255,178,72,.95)');
  fg.addColorStop(1, 'rgba(255,120,40,.78)');
  g.fillStyle = fg; g.fill();

  g.beginPath();
  g.moveTo(cx - 2.6, fy - 1);
  g.quadraticCurveTo(cx - 3 + lean * .6, fy - fh * .5, cx + lean * .6, fy - fh * .72);
  g.quadraticCurveTo(cx + 3 + lean * .6, fy - fh * .5, cx + 2.6, fy - 1);
  g.closePath();
  g.fillStyle = 'rgba(255,252,238,.95)'; g.fill();

  /* tàn lửa bay lên */
  for (let i = 0; i < 5; i++) {
    const k = ((t * .22 + i / 5) % 1);
    const sx = cx + Math.sin(k * 5 + i * 1.7) * (5 + k * 12);
    const sy = fy - fh - k * 54;
    g.fillStyle = 'rgba(255,214,150,' + (.5 * (1 - k)).toFixed(3) + ')';
    g.beginPath(); g.arc(sx, sy, 1.5 - k, 0, 6.2832); g.fill();
  }
}

/* Vòm đá cửa Thánh Đường — dùng chung cho CỔNG VÀO ở WORLD (ipGateWorld) và
   CỔNG RA ở đầu đại lộ (ipScene). Mọi số đo là số đo gốc, co bằng s quanh
   CHÍNH CHÂN vòm (x, y) nên đổi s là đổi cả hình lẫn bóng.
   cap: biển tên vẽ NGOÀI phép co (chữ teo theo vòm 0.74 thì không đọc được). */
function ipArchDraw(g, x, y, s, t, cap) {
  const fl = .5 + Math.sin(t * 2.3) * .3 + Math.sin(t * 6.1) * .12;
  const H = 128, PW = 13, GAP = 30;                     // chiều cao / bề dày trụ / cửa
  g.save();
  g.translate(x, y); g.scale(s, s); g.translate(-x, -y);

  /* bóng đổ + quầng sáng ấm trên gạch */
  g.fillStyle = 'rgba(0,0,0,.2)';
  g.beginPath(); g.ellipse(x, y + 4, 50, 13, 0, 0, 6.2832); g.fill();
  const pool = g.createRadialGradient(x, y + 2, 4, x, y + 2, 74);
  pool.addColorStop(0, 'rgba(255,206,132,' + (.2 + fl * .1) + ')');
  pool.addColorStop(1, 'rgba(255,180,90,0)');
  g.fillStyle = pool;
  g.beginPath(); g.ellipse(x, y + 2, 74, 26, 0, 0, 6.2832); g.fill();

  /* lòng cửa: ánh nến từ trong hắt ra */
  const inner = g.createLinearGradient(0, y - H, 0, y);
  inner.addColorStop(0, 'rgba(255,214,150,.30)');
  inner.addColorStop(.6, 'rgba(255,190,110,.5)');
  inner.addColorStop(1, 'rgba(255,224,170,.72)');
  g.fillStyle = inner;
  g.beginPath();
  g.moveTo(x - GAP, y - 2); g.lineTo(x - GAP, y - H + GAP);
  g.quadraticCurveTo(x, y - H - 12, x + GAP, y - H + GAP);
  g.lineTo(x + GAP, y - 2); g.closePath(); g.fill();

  /* hai trụ đá */
  for (let p = -1; p <= 1; p += 2) {
    const px0 = x + p * (GAP + PW / 2) - PW / 2;
    const stone = g.createLinearGradient(px0, 0, px0 + PW, 0);
    stone.addColorStop(0, '#6b6055'); stone.addColorStop(.35, '#cbbfae');
    stone.addColorStop(.7, '#a89a88'); stone.addColorStop(1, '#5a5046');
    g.fillStyle = stone;
    g.fillRect(px0, y - H + GAP - 4, PW, H - GAP + 6);
    g.fillStyle = 'rgba(210,198,180,.9)';
    g.fillRect(px0 - 3, y - 2, PW + 6, 6);                 // bệ
    g.fillRect(px0 - 3, y - H + GAP - 10, PW + 6, 7);      // đầu trụ
  }

  /* vòm đá */
  g.strokeStyle = '#b3a695'; g.lineWidth = 13; g.lineCap = 'butt';
  g.beginPath(); g.arc(x, y - H + GAP, GAP + PW / 2, Math.PI, 0); g.stroke();
  g.strokeStyle = 'rgba(238,228,210,.75)'; g.lineWidth = 2.4;
  g.beginPath(); g.arc(x, y - H + GAP, GAP + PW / 2 + 6, Math.PI, 0); g.stroke();
  g.beginPath(); g.arc(x, y - H + GAP, GAP + PW / 2 - 6, Math.PI, 0); g.stroke();

  /* nến nhỏ giữa cửa + trụ sáng */
  const cg = g.createLinearGradient(0, y - 96, 0, y);
  cg.addColorStop(0, 'rgba(255,226,170,0)'); cg.addColorStop(1, 'rgba(255,226,170,' + (.2 + fl * .12) + ')');
  g.fillStyle = cg;
  g.fillRect(x - 16, y - 96, 32, 94);
  ipCandle(g, x, y - 26, t);
  g.restore();

  if (cap && typeof hvCap === 'function')
    hvCap(g, x, y + 8, cap, { h: 16, pad: 14 });
}

/* ---------- 8b. CỤM NẾN VÀNG GIỮA ĐẠI LỘ ---------- */
/* Chưa thắp: nến trắng nguội, bấc đen, chỉ một quầng rất mờ.
   Đã thắp: 7 ngọn so le cao thấp + quầng rực + tàn lửa (ipCluster mồi motes
   trong ipUpdate). Vẽ bằng toạ độ THẾ GIỚI — ipScene đã translate(-cam,0). */
function ipCluster(g, c, t) {
  const x = c.x, y = c.y, lit = !!c.lit;
  g.save();
  g.fillStyle = 'rgba(0,0,0,.3)';
  g.beginPath(); g.ellipse(x, y + 5, 46, 11, 0, 0, 6.2832); g.fill();

  /* chân gỗ + khay đồng */
  const base = g.createLinearGradient(0, y - 16, 0, y + 6);
  base.addColorStop(0, '#6f5326'); base.addColorStop(.55, '#3c2c12'); base.addColorStop(1, '#241a09');
  g.fillStyle = base;
  g.beginPath(); g.ellipse(x, y - 10, 44, 12, 0, 0, 6.2832); g.fill();
  g.fillRect(x - 44, y - 12, 88, 16);
  g.fillStyle = lit ? 'rgba(255,214,140,.5)' : 'rgba(190,166,124,.18)';
  g.beginPath(); g.ellipse(x, y - 14, 40, 9, 0, 0, 6.2832); g.fill();

  const N = 7;
  for (let i = 0; i < N; i++) {
    const dx = (i - (N - 1) / 2) * 13.5;
    const h = 1 - Math.abs(i - (N - 1) / 2) * .12;      // hàng giữa cao nhất
    const sc = .30 + h * .16;
    g.save();
    g.translate(x + dx, y - 16); g.scale(sc, sc); g.translate(-(x + dx), -(y - 16));
    ipCandle(g, x + dx, y - 16 - h * 26, t + i * .71, !lit);
    g.restore();
  }
  if (!lit) {
    g.fillStyle = 'rgba(226,206,170,.34)';
    g.font = 'italic 400 12px ' + IP_SERIF;
    g.textAlign = 'center';
    g.fillText('🕯', x, y - 62);
    g.textAlign = 'left';
  }
  g.restore();
}

/* ---------- 9b. GHẾ DÀI "NGỒI TỊNH TÂM" + BÀN THỜ LỚN ---------- */
/* Tỉ lệ vàng của chiếc ghế: 873x433 là ảnh BAKED (đã cắt sát khung), mặt ghế
   ở 49.5% chiều cao tính từ ĐỈNH — đo bằng Node trong bake-bench.cjs. */
const IP_PEW_AR = 433 / 873;
function ipPewH() { return IP_PEW_W * IP_PEW_AR; }
/* ĐIỂM CHÂN của người ngồi: mặt ghế + 6px để thân chìm xuống ghế một chút. */
function ipSeatY(p) { return p.y - ipPewH() * (1 - IP_PEW_SEAT) + 6; }

function ipPewDraw(g, p, t) {
  const dh = ipPewH(), dx = p.x - IP_PEW_W / 2, dy = p.y - dh;
  g.save();
  /* bóng_contact dưới hai hốc chân ghế */
  g.fillStyle = 'rgba(0,0,0,.34)';
  g.beginPath(); g.ellipse(p.x, p.y + 4, IP_PEW_W * .46, 8, 0, 0, 6.2832); g.fill();
  const im = (typeof IMG !== 'undefined' && IMG.ipBench) || null;
  if (im && (im.naturalWidth || im.width) > 1) {
    try {
      g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      g.drawImage(im, 0, 0, im.naturalWidth || im.width, im.naturalHeight || im.height,
        dx, dy, IP_PEW_W, dh);
    } catch (e) { ipPewVector(g, p, dh); }
  } else ipPewVector(g, p, dh);
  /* dải sáng nến từ cửa kính màu quét nhẹ lên thành ghế */
  const k = .05 + .03 * Math.sin(t * .9 + p.x * .01);
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = 'rgba(255,222,160,' + k.toFixed(3) + ')';
  g.fillRect(dx, dy + dh * .30, IP_PEW_W, dh * .22);
  g.restore();
}

/* Chưa tải kịp ảnh ghế → ghế gỗ vector cùng kích thước, để điểm ngồi không lệch. */
function ipPewVector(g, p, dh) {
  const dx = p.x - IP_PEW_W / 2, dy = p.y - dh, seat = dy + dh * IP_PEW_SEAT;
  const wood = g.createLinearGradient(0, dy, 0, p.y);
  wood.addColorStop(0, '#4a3218'); wood.addColorStop(.5, '#6b4a24'); wood.addColorStop(1, '#2e1f0d');
  g.fillStyle = wood;
  g.fillRect(dx, dy, 16, dh);                       // ốp đầu cao (trái)
  g.fillRect(dx + IP_PEW_W - 20, dy + 10, 20, dh - 10);
  g.fillRect(dx + 10, dy + 12, IP_PEW_W - 30, dh * .34);   // lưng ghế
  g.fillStyle = '#7a5628';
  g.fillRect(dx + 8, seat, IP_PEW_W - 24, 7);       // mặt ghế
  g.fillStyle = '#3a2810';
  g.fillRect(dx + 26, seat + 7, 10, dh - (seat - dy) - 7);
  g.fillRect(dx + IP_PEW_W - 46, seat + 7, 10, dh - (seat - dy) - 7);
}

/* Bàn thờ lớn cuối hành lang: khối đá + 4 nến chóp + thập giá, hào quang
   do hvGlow lo (nguồn sáng bake vào trụ sáng ở ipLayers). */
function ipAltarDraw(g, x, y, t) {
  const w = 132, h = 54;
  g.save();
  g.fillStyle = 'rgba(0,0,0,.35)';
  g.beginPath(); g.ellipse(x, y + 5, w * .58, 12, 0, 0, 6.2832); g.fill();
  /* bậc nền */
  const st = g.createLinearGradient(0, y - 12, 0, y + 4);
  st.addColorStop(0, '#6d6357'); st.addColorStop(1, '#2b2620');
  g.fillStyle = st; g.fillRect(x - w * .62, y - 12, w * 1.24, 16);
  /* bàn đá */
  const mt = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  mt.addColorStop(0, '#3a352e'); mt.addColorStop(.34, '#8d8172');
  mt.addColorStop(.62, '#a99c8a'); mt.addColorStop(1, '#403a31');
  g.fillStyle = mt; g.fillRect(x - w / 2, y - h, w, h - 10);
  g.fillStyle = 'rgba(255,238,200,.16)'; g.fillRect(x - w / 2 - 5, y - h - 6, w + 10, 8);
  /* phù điêu */
  g.strokeStyle = 'rgba(20,16,12,.5)'; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(x - w / 2 + 10, y - 14); g.lineTo(x + w / 2 - 10, y - 14); g.stroke();
  g.fillStyle = 'rgba(226,196,140,.3)';
  g.beginPath(); g.ellipse(x, y - h / 2 - 2, 13, 10, 0, 0, 6.2832); g.fill();
  /* thập giá */
  g.fillStyle = '#e8d6a8';
  g.fillRect(x - 2.5, y - h - 40, 5, 36); g.fillRect(x - 13, y - h - 30, 26, 5);
  /* 4 nến chóp — ipCandle vẽ cỡ "người" (cao ~90px, quầng 74px) nên phải co
     0.42 như trong cụm nến, không thì bàn thờ chìm sau hai cây nến. */
  for (let i = 0; i < 4; i++) {
    const cx = x + (i < 2 ? -1 : 1) * (34 + (i % 2) * 18);
    const cy = y - h - 4 - (i % 2) * 5;
    g.save();
    g.translate(cx, cy); g.scale(.42, .42); g.translate(-cx, -cy);
    ipCandle(g, cx, cy, t + i * 1.7, false);
    g.restore();
  }
  g.restore();
}
