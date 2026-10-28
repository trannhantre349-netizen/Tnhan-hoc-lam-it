/* ============================================================
   bunnies.js — V16 "BẦY THỎ SINH ĐỘNG"  ·  CHỈ THÊM MỚI (ADD-ONLY)
   File này KHÔNG sửa/xoá bất kỳ logic, giao diện, NPC hay hệ thống nào đang
   có. Toàn bộ điểm nối: (1) một dòng guard trong depth-sort của engine.js,
   (2) bọc update()/drawSprite()/ambList()/mgFrame() theo đúng idiom
   "_old rồi gán lại" mà game đã dùng ở game.js:2914 và reskin.js:103,
   (3) ba dòng manifest trong assets.js.
   Không đụng S, không saveGame(), không localStorage: thỏ chỉ là trang trí,
   file lưu của người chơi giữ nguyên 100%.

   ẢNH: assets/bunny.png là JPEG đổi tên (1024x633, không kênh alpha, 29 chú
   thỏ trên nền xám rgb(224,226,226)) -> tools/bake-bunnies.cjs tẩy nền và
   đóng gói ngoại tuyến ra assets/img/baked/bunny_sheet.png: lưới 8 cột, ô
   152px, ĐÁY Ô = chân thỏ. Game chỉ drawImage, không đọc pixel (file:// chặn).

   HOÀNG MỤC SÂU (z-index):
   · WORLD  -> bunnySort(list) ghép từng con vào đúng danh sách depth-sort sẵn
               có của engine (toà nhà / cây / đài phun / người chơi).
   · còn lại-> bọc drawSprite('p'): thỏ + NPC đi bộ gộp lại sắp theo fy (chân),
               vẽ trước người chơi nếu xa hơn, sau nếu gần hơn. Phố Ngoài đã có
               ctx.translate(-camX) từ trước nên toạ độ thế giới dùng thẳng.
   · Ải     -> bọc mgFrame(): đàn thỏ chạy trên canvas dán ở mép dưới hộp thoại.

   FPS: mỗi con đúng 1 drawImage từ một sheet duy nhất + 1 bóng ellipse; AI
   tính theo dt nên không đổi tốc độ khi khung hình tụt; bunnyBudget() tự ẩn
   bớt thỏ khi thời gian khung trung bình vượt ~22ms và thả dần khi mượt lại.
   ============================================================ */

const MAX_BUNNIES = 40;                        // trần tuyệt đối của một bầy
const BUN_MIN = 15, BUN_MAX = 40;              // số thỏ ngẫu nhiên mỗi lần dựng bầy
const BUN_CELL = 152, BUN_COLS = 8;            // phải khớp lưới của tools/bake-bunnies.cjs

/* Bảng tư thế — chỉ số ô theo đúng thứ tự đọc của sheet (trái->phải, trên->xuống):
   0/12/16 trắng ngồi · 8 kem ngồi · 9 nâu ngồi · 6/13 hồng ngồi
   3 trắng chạy · 1 kem chạy · 2 nâu chạy · 10 hồng nhảy
   22 trắng quay lưng · 23 nâu quay lưng · 24 hồng quay lưng
   4/19 tai nghe · 5 đeo kính · 20/26 ôm laptop · 21/25 bó cáp · 27/28 ôm cà rốt
   -> thỏ "IT" (geek) chỉ ngồi nghỉ rất lâu rồi nhích một đoạn ngắn. */
const BUN_LOOKS = [
  { sit: [0, 12, 16], run: 3, away: 22 },   // trắng
  { sit: [8, 0], run: 1, away: 22 },        // kem
  { sit: [9], run: 2, away: 23 },           // nâu
  { sit: [6, 13], run: 10, away: 24 }       // hồng
];
const BUN_GEEKS = [4, 19, 5, 20, 26, 21, 25, 27, 28];
const BUN_FACE_L = { 10: 1, 17: 1 };        // ô nghệ thuật vẽ quay mặt sang TRÁI

const BUN = { herd: {}, t: 0, ms: 16, eff: 1, mini: [], miniT: 0 };

/* ---------- vùng đi được, tính theo CHÂN (engine tính theo góc trên-trái) ---------- */
/* Móng trăng của lunar_base_bg cong: dải SCENE_WALK cho phép tới y=151 nhưng từ
   ~y=215 đổ lên là khoảng không đen. Thỏ đứng giữa nền sao nhìn như trôi trong
   vũ trụ, nên hạ hẳn mép trên của dải xuống sát mặt trăng. */
const BUN_HORIZON = { LUNAR_BASE: 222 };
function bunBand(sc) {
  if (sc === 'WORLD') return { x0: 26, x1: 934, y0: 152, y1: 556 };
  const x1 = sc === 'STREET' ? 2840 : 934;      // phố cuộn tới camX 1920 + khung 960
  const w = SCENE_WALK[sc];
  const band = !w ? { x0: 26, x1: x1, y0: 160, y1: 540 }
    : { x0: 26, x1: x1, y0: w.minY + 36, y1: Math.min(w.maxY + 30, 592) };
  const hz = BUN_HORIZON[sc]; if (hz) band.y0 = Math.max(band.y0, hz);
  return band;
}
/* Dòng sông góc dưới-trái của WORLD: ảnh nền AI không có collider nước nên
   người chơi đi lên sông bình thường, còn thỏ đứng trên mặt nước thì rất khập
   khiễng. Đa giác khoanh vùng nước đo trực tiếp từ ảnh mask của bg_city.png
   (1536x960 -> 960x600 nên nhân 0.625), tính theo CHÂN thỏ. */
const BUN_WATER = [[-4, 396], [196, 396], [252, 448], [326, 500], [296, 552], [232, 590], [-4, 604]];
function bunInWater(x, y) {
  let inside = false;
  for (let i = 0, j = BUN_WATER.length - 1; i < BUN_WATER.length; j = i++) {
    const xi = BUN_WATER[i][0], yi = BUN_WATER[i][1], xj = BUN_WATER[j][0], yj = BUN_WATER[j][1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
/* Biển trạm Mặt Trăng vẽ lên nền đất nên thỏ đứng phía trước sẽ che mất dòng
   "vào bằng [E]". Ô biển tính lại đúng công thức của luSign() (game.js:5011),
   nới thêm 40px phía dưới vì thân thỏ cao ~32px tính từ chân trở lên. */
function bunSigns() {
  if (BUN._signs) return BUN._signs;
  const r = [];
  try {
    for (const s of LUNAR_STAGES) {
      const name = s.icon + ' ' + s.name;
      ctx.font = 'bold 11px ' + IZF;
      const w = Math.max(s.cw || 0, 46 + ctx.measureText(name).width, 150);
      r.push([Math.max(4, Math.min(956 - w, s.px)) - 12, s.py - 8, w + 24, 44 + 44]);
    }
  } catch (e) {}
  BUN._signs = r; return r;
}
function bunOnSign(sc, x, y) {
  if (sc !== 'LUNAR_BASE') return false;
  for (const b of bunSigns()) if (x > b[0] && x < b[0] + b[2] && y > b[1] && y < b[1] + b[3]) return true;
  return false;
}
/* Mượn đúng hộp va chạm của người chơi: chân (x,y) == sprite đặt tại (x-10, y-30). */
function bunBlocked(sc, x, y) {
  if (bunOnSign(sc, x, y)) return true;
  try {
    if (sc === 'WORLD') return boxCollides(x - 10, y - 30) || bunInWater(x, y);
    return propCollides(sc, x - 10, y - 30);
  } catch (e) { return false; }
}
/* Phố Ngoài cuộn theo camX: thỏ ngoài tầm nhìn không vẽ (vẫn đi bình thường). */
function bunOnScreen(b) {
  if (S.scene !== 'STREET') return true;
  const cam = window._camX || 0;
  return b.fx > cam - 60 && b.fx < cam + 1020;
}

class BunnyNPC {
  constructor(sc, mini) { this.mini = !!mini; this.spawn(sc); }

  spawn(sc) {
    const L = BUN_LOOKS[(Math.random() * BUN_LOOKS.length) | 0];
    this.geek = !this.mini && Math.random() < .1;
    this.look = L;
    this.scell = L.sit[(Math.random() * L.sit.length) | 0];
    this.gcell = BUN_GEEKS[(Math.random() * BUN_GEEKS.length) | 0];
    this.h = 28 + Math.random() * 8;          // ô 28..36px -> thân thỏ ~26..33px
    this.spd = 26 + Math.random() * 24;
    this.dir = Math.random() < .5 ? 1 : -1;
    this.ph = Math.random() * 6.28;
    this.bounce = 0; this.tvy = 0;
    this.state = 'rest';
    this.rest = .3 + Math.random() * 2.6;
    this.scared = 0; this.fleeCd = Math.random() * 3;
    this.lod = Math.random();                 // con nào có lod trên bunnyBudget() sẽ bị ẩn
    this.place(sc);
  }

  place(sc) {
    const b = bunBand(sc);
    for (let k = 0; k < 26; k++) {
      const x = b.x0 + Math.random() * (b.x1 - b.x0), y = b.y0 + Math.random() * (b.y1 - b.y0);
      if (!bunBlocked(sc, x, y)) { this.fx = x; this.fy = y; return; }
    }
    this.fx = (b.x0 + b.x1) / 2; this.fy = (b.y0 + b.y1) / 2;
  }

  /* Người chơi lại gần -> giật mình nhảy tránh ra xa (trang trí, không chặn đường) */
  react(px, py, sc, dt) {
    this.fleeCd -= dt;
    if (this.scared > 0 || this.fleeCd > 0) return;
    const d = Math.hypot(this.fx - px, this.fy - py);
    if (d > 42 || d < .001) return;
    const b = bunBand(sc), k = 90 / d;
    const x = Math.max(b.x0, Math.min(b.x1, this.fx + (this.fx - px) * k));
    const y = Math.max(b.y0, Math.min(b.y1, this.fy + (this.fy - py) * k));
    if (bunBlocked(sc, x, y)) return;
    this.tx = x; this.ty = y; this.state = 'hop'; this.scared = 1.1; this.fleeCd = 4 + Math.random() * 4;
  }

  step(dt, sc) {
    this.scared -= dt;
    if (this.state === 'rest') {
      this.rest -= dt;
      this.ph += dt * 2.4;
      this.bounce = Math.sin(this.ph) * .9;              // thở nhẹ khi ngồi nghỉ
      if (this.rest > 0) return;
      const b = bunBand(sc), a = Math.random() * 6.2832, r = 30 + Math.random() * 110;
      const x = Math.max(b.x0, Math.min(b.x1, this.fx + Math.cos(a) * r));
      const y = Math.max(b.y0, Math.min(b.y1, this.fy + Math.sin(a) * r * .6));
      if (bunBlocked(sc, x, y)) { this.rest = .5 + Math.random() * 2; return; }
      this.tx = x; this.ty = y; this.state = 'hop';
      return;
    }
    const dx = this.tx - this.fx, dy = this.ty - this.fy, d = Math.hypot(dx, dy);
    const st = this.spd * dt * (this.scared > 0 ? 2.2 : 1);
    if (d <= st) {
      this.fx = this.tx; this.fy = this.ty;
      this.state = 'rest'; this.bounce = 0; this.tvy = 0;
      this.rest = (this.geek ? 5 : .4) + Math.random() * (this.geek ? 9 : 2.8);
      return;
    }
    this.fx += dx / d * st; this.fy += dy / d * st;
    this.tvy = dy / d;
    if (Math.abs(dx) > 1.2) this.dir = dx > 0 ? 1 : -1;
    this.ph += st / 13;                                  // 13px đường bộ = một nhịp nhảy
    this.bounce = -Math.abs(Math.sin(this.ph * Math.PI)) * this.h * .17;
  }

  cell() {
    if (this.geek) return this.gcell;
    if (this.state !== 'rest') return this.tvy < -.55 ? this.look.away : this.look.run;
    return this.scell;
  }

  /* (x, y) là vị trí CHÂN. Phố Ngoài đã dịch ctx theo -camX nên đưa toạ độ thế giới thẳng vào. */
  draw(g, x, y, hh) {
    const sh = IMG.bunny; if (!sh) return;
    const c = this.cell(), h = hh || this.h;
    const sx = (c % BUN_COLS) * BUN_CELL, sy = ((c - c % BUN_COLS) / BUN_COLS) * BUN_CELL;
    const by = y + this.bounce, lift = 1 + this.bounce / h * 1.6;
    g.fillStyle = 'rgba(0,0,0,.18)';
    g.beginPath(); g.ellipse(x, y - 1, h * .27 * lift, h * .065 * lift, 0, 0, 6.2832); g.fill();
    if ((this.dir < 0) !== !!BUN_FACE_L[c]) {
      g.save(); g.translate(x, 0); g.scale(-1, 1);
      g.drawImage(sh, sx, sy, BUN_CELL, BUN_CELL, -h / 2, by - h, h, h);
      g.restore();
    } else g.drawImage(sh, sx, sy, BUN_CELL, BUN_CELL, x - h / 2, by - h, h, h);
  }
}

/* ---------- dựng bầy: cảnh nào nạp xong là tự có thỏ, quay lại giữ nguyên bầy cũ ---------- */
function spawnBunnies(count) {
  const sc = S.scene;
  const n = Math.max(0, Math.min(MAX_BUNNIES, count == null
    ? BUN_MIN + ((Math.random() * (BUN_MAX - BUN_MIN + 1)) | 0) : count | 0));
  const herd = [];
  for (let i = 0; i < n; i++) herd.push(new BunnyNPC(sc));
  BUN.herd[sc] = herd;
  return herd;
}
function bunnyHerd() { return BUN.herd[S.scene] || spawnBunnies(); }

/* ---------- FPS guard: khung tụt thì ẩn bớt đuôi bầy, mượt lại thì thả dần ---------- */
function bunnyBudget() { return BUN.eff; }

function bunnyStep() {
  const now = performance.now(), dt = Math.min(.05, (now - (BUN.t || now)) / 1000);
  BUN.t = now;
  BUN.ms += (dt * 1000 - BUN.ms) * .06;
  /* Vùng chết 20..24ms: dưới 20ms (~50fps) thì thả thêm thỏ, trên 24ms thì ẩn
     bớt. Ngưỡng hồi phục phải CAO HƠN 16.7ms — máy 60fps chạy đúng 16.7ms mỗi
     khung, đặt 15ms là bầy đã tụt xuống đáy rồi không bao giờ trở lại. */
  BUN.eff = Math.max(.25, Math.min(1, BUN.ms > 24 ? BUN.eff - .02 : BUN.ms < 20 ? BUN.eff + .012 : BUN.eff));
  if (!IMG.bunny || dt <= 0) return;
  if (typeof openModalEl === 'function' && openModalEl()) return;   // bảng đang mở: engine cũng đang dừng người chơi
  const sc = S.scene, herd = bunnyHerd();
  const px = S.p.x + 10, py = S.p.y + 30;
  for (let i = 0; i < herd.length; i++) { herd[i].react(px, py, sc, dt); herd[i].step(dt, sc); }
}

/* ---------- WORLD: ghép từng con vào depth sort thật của engine.js ---------- */
function bunnySort(list) {
  if (!IMG.bunny || S.scene !== 'WORLD') return;
  const eff = bunnyBudget();
  bunnyHerd().forEach(b => {
    if (b.lod > eff || b.fx < -40 || b.fx > 1000) return;
    list.push({ k: b.fy, f: () => b.draw(ctx, b.fx, b.fy) });
  });
}

/* ---------- các cảnh còn lại: gộp thỏ + NPC đi bộ, sắp theo chân quanh người chơi ----------
   ambList() được bọc để TRẢ RỖNG đúng trong lúc vẽ (cờ _bunHideAmb): bản bọc ở
   reskin.js:103 cũng tự chèn NPC quanh người chơi, không chặn là NPC bị vẽ hai lần.
   Danh sách thật ta đọc thẳng bằng _ambListBun() rồi tự gộp theo fy. */
const _ambListBun = ambList;
let _bunHideAmb = false;
ambList = function () { return _bunHideAmb ? [] : _ambListBun(); };

const _sprBun = drawSprite;
drawSprite = function (x, y, r = 'p') {
  if (r !== 'p' || !IMG.bunny || S.scene === 'WORLD') return _sprBun(x, y, r);
  const pf = y + 30, eff = bunnyBudget(), B = [], A = [], herd = bunnyHerd();
  for (let i = 0; i < herd.length; i++) if (herd[i].lod <= eff && bunOnScreen(herd[i])) B.push(herd[i]);
  try { _ambListBun().forEach(n => A.push(n)); } catch (e) {}
  B.sort((p, q) => p.fy - q.fy);
  A.sort((p, q) => p.fy - q.fy);
  let i = 0, j = 0;
  const till = lim => {
    while (i < B.length || j < A.length) {
      const kb = i < B.length ? B[i].fy : 1e9, ka = j < A.length ? A[j].fy : 1e9;
      if (Math.min(kb, ka) > lim) return;
      if (kb <= ka) { try { B[i].draw(ctx, B[i].fx, B[i].fy); } catch (e) {} i++; }
      else { try { ambDraw(A[j]); } catch (e) {} j++; }
    }
  };
  _bunHideAmb = true;
  try { till(pf); _sprBun(x, y, 'p'); till(1e9); }
  finally { _bunHideAmb = false; }
};

/* ---------- bên trong Ải / minigame: đàn thỏ chạy dọc ĐÁY HỘP THOẠI ----------
   Vẽ lên canvas riêng dán ở mép dưới của modal (vùng padding 16px của .mg-body),
   KHÔNG vẽ lên canvas của ải vì sát mép dưới luôn có dòng chữ hướng dẫn. */
const BUN_MINI_MODALS = ['crimp-modal', 'pt-modal', 'wf-modal', 'tr-modal', 'boss-modal', 'victory-modal', 'lu-mini'];
const BUN_STRIP_H = 18;
function bunStrip(m) {
  let cv = document.getElementById('bun-strip-' + m.id);
  if (!cv) {
    cv = document.createElement('canvas');
    cv.id = 'bun-strip-' + m.id;
    cv.style.cssText = 'position:absolute;left:0;bottom:0;width:100%;height:' + BUN_STRIP_H +
      'px;pointer-events:none;z-index:6';
    m.appendChild(cv);
  }
  const w = m.clientWidth | 0; if (w < 60) return null;
  if (cv.width !== w) { cv.width = w; cv.height = BUN_STRIP_H; }
  return cv;
}
function bunnyMini(dt) {
  if (!BUN.mini.length) {
    for (let i = 0; i < 8; i++) {
      const b = new BunnyNPC(null, true);
      b.spd = 34 + Math.random() * 26; b.state = 'hop'; b.dir = i % 2 ? 1 : -1;
      BUN.mini.push(b);
    }
  }
  for (const b of BUN.mini) {
    b.fx += b.dir * b.spd * dt;
    if (b.fx > 2900) { b.fx = 2900; b.dir = -1; }
    if (b.fx < -100) { b.fx = -100; b.dir = 1; }
    b.ph += b.spd * dt / 13;
    b.bounce = -Math.abs(Math.sin(b.ph * Math.PI)) * b.h * .17;
  }
}
function bunnyMiniFrame() {
  if (!IMG.bunny) return;
  const now = performance.now(), dt = Math.min(.05, (now - (BUN.miniT || now)) / 1000);
  BUN.miniT = now;
  bunnyMini(dt);
  for (const mid of BUN_MINI_MODALS) {
    if (!mgVis(mid)) continue;
    const m = document.getElementById(mid); if (!m) continue;
    const cv = bunStrip(m); if (!cv) continue;
    const g = cv.getContext('2d'); if (!g) continue;
    g.clearRect(0, 0, cv.width, cv.height);
    const W = cv.width, span = W + 140;
    for (const b of BUN.mini) b.draw(g, ((b.fx % span) + span) % span - 70, BUN_STRIP_H - 1, BUN_STRIP_H - 3);
  }
}

/* ---------- điểm nối vào hai vòng lặp dùng chung của game ---------- */
const _updBun = update;
update = function () { try { bunnyStep(); } catch (e) {} _updBun(); };
const _mgFrmBun = mgFrame;
mgFrame = function () { _mgFrmBun(); try { bunnyMiniFrame(); } catch (e) {} };
