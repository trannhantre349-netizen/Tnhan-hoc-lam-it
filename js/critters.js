/* ============================================================
   critters.js — V30 "SINH VẬT LANG THANG" · CHỈ THÊM MỚI (ADD-ONLY)

   File này KHÔNG sửa/xoá logic, giao diện, hệ thống lưu hay tiến trình nào đang
   có. Toàn bộ điểm nối là 6 lần BỌC theo đúng idiom "_old rồi gán lại" mà
   bunnies.js / heaven.js / inpeace.js đã dùng, cộng 1 listener pointerdown dán
   lên #cv. Không đụng S, không saveGame(), không localStorage: sinh vật chỉ là
   dân cư trang trí, phần thưởng đi qua addCoin()/addXP() của engine.

     update()     -> crtStep()       AI ba loài + nhặt hộp Packet Loss
     render()     -> crtSky()        bồ câu tầng trời, bong bóng, chữ nổi
     drawSprite() -> crtGround()     sinh vật mặt đất ở các cảnh vẽ theo screen
     bunnySort()  -> crtWorldSort()  mèo + hộp rơi ghép vào depth sort WORLD
     creRexSort() -> trả mục Rex lang thang THAY con Rex đứng yên cũ của game.js
     mgFrame()    -> crtMiniFrame()  cameo bồ câu / mèo bên trong ải

   Vì Rex cũ bị thay bằng bản đi lại, hai việc nhỏ được giữ nguyên: toạ độ
   CRE.rex (game.js:3514) mỗi khung được dán vào chân con Rex đang đi nên nút
   [E] "CON QUÁI 404" và tiếng gầm CRE.rexRoar vẫn hoạt động y hệt, chỉ khác là
   giờ nó đi theo con vật. Bồ câu + hộp rơi cũ của phố (creBird / crePkts) được
   bọc thành no-op vì module này làm lại cùng việc đó, có thêm nhặt được thưởng;
   để cả hai cùng chạy thì một khung hình sẽ có hai đàn bồ câu và hai loại hộp.

   ẢNH: assets/img/baked/creatures_sheet.png — PNG RGBA 1024x572, LƯỚI ĐỀU
   4 cột x 3 hàng, ô 256 x 190.67 (đo bbox alpha từng ô, 12/12 ô đều có hình):
     hàng 0  Cyber Dino : 0-1 bước đi · 2 đứng giật lag "404 ⚠" · 3 há mồm gầm
     hàng 1  Mèo Server : 0 ngủ zzz · 1 nằm quan sát · 2 cào tuột cáp · 3 kệ trống
     hàng 2  Bồ câu     : 0-1 vỗ cánh · 2 cắp hộp Packet Loss · 3 đậu ngậm cáp
   Art gốc luôn quay mặt sang PHẢI, đi sang trái thì lật ngang. Bàn chân / đáy
   hình trong ô nằm tại y 183 / 379 / 535 (CRT_FOOT) nên vẽ theo ĐẾ: đổi frame
   không bị nhún thấp hay trượt ngang. Riêng ô hàng 2 cột 2 có cả dòng chữ
   "Packet Loss" và hộp hàng treo dưới chân chim -> hộp rơi vẽ bằng ô cắt riêng
   CRT_PKT (đã đo sẵn trong SHEET của assets.js, không cắt lại).

   CAMERA: Phố Ngoài chỉ cuộn NGANG (window._camX). Toạ độ sinh vật luôn là
   TOẠ ĐỘ THẾ GIỚI; drawStreet đã mở ctx.translate(-camX) trước khi gọi
   drawSprite nên lớp vẽ KHÔNG tự cộng/trừ cam (cộng thừa là trôi tuột), chỉ
   cộng khi đo khoảng cách tới người chơi vì S.p.x là vị trí trong khung hình.
   ============================================================ */

/* ---------- 1. LƯỚI SHEET & KÍCH THƯỚC VẼ ---------- */
const CRT_CW = 256, CRT_CH = 572 / 3;
/* ĐẾ và đỉnh thân của từng hàng, tính theo ảnh gốc 1024x572 (đo alpha bbox). */
const CRT_FOOT = [183, 379, 535];
const CRT_TOP = [45, 237, 411];
/* Chiều cao Ô VẼ trên màn hình, chọn để THÂN (không tính chữ "404"/"Zzz") cao
   đúng 96 / 62 / 44 px: th = thân * CRT_CH / (đế - đỉnh). */
const CRT_TH = [
  Math.round(96 * CRT_CH / (CRT_FOOT[0] - CRT_TOP[0])),
  Math.round(62 * CRT_CH / (CRT_FOOT[1] - CRT_TOP[1])),
  Math.round(44 * CRT_CH / (CRT_FOOT[2] - CRT_TOP[2]))
];
const CRT_ROW = { DINO: 0, CAT: 1, BIRD: 2 };
const CRT_DINO = { W0: 0, W1: 1, GLITCH: 2, ROAR: 3 };
const CRT_CAT = { SLEEP: 0, LOOK: 1, PLAY: 2 };
const CRT_BIRD = { UP: 0, DN: 1, CARRY: 2, PERCH: 3 };
/* Hộp Packet Loss cắt riêng từ ô hàng 2 cột 2 (đúng toạ độ SHEET.cre_pkt). */
const CRT_PKT = { x: 682, y: 494, w: 54, h: 55 };

const CRT_SCENES = { WORLD: 1, STREET: 1, HEAVEN: 1 };
const CRT_SKY = [60, 140];            // tầng trời của bồ câu (đỉnh đầu -> chân)
const CRT_SPAN = { STREET: 2840 };    // phố 2880px trừ lề phải; camX tối đa = 2880 − khung nhìn

/* ---------- 2. THƯỞNG & NHỊP ---------- */
const CRT_REX_COIN = 25, CRT_REX_XP = 5;   // click trúng khủng long
const CRT_REX_CD = 3.5;                    // giây nghỉ giữa hai lần bị chọc
const CRT_PANIC = 2, CRT_PANIC_MUL = 3.6;  // chạy trốn 2s, nhanh gấp 3.6
const CRT_POSE_EVERY = [10, 15], CRT_POSE_T = 2;
const CRT_PKT_COIN = 15, CRT_PKT_SIT = 10, CRT_PKT_R = 30;
const CRT_DROP_CHANCE = .2;                // tỉ lệ rơi hộp mỗi chặng bay
const CRT_CAT_R = 96;                      // bán kính mèo "nói" với người chơi
const CRT_TAP_MS = 130;

const CRT_CAT_LINES = [
  'Meow~ Rút mạng ra cắm lại đi sếp!',
  'Mèo nằm lên switch thì Wifi yếu là đúng rồi.',
  'Meo. Cable này ta cắn. Không phải lỗi phần mềm.',
  'Aw... ai restart server lúc 2 giờ sáng vậy?'
];
let _crtLine = -1;
function crtLine() {
  let i = 0;
  do { i = (Math.random() * CRT_CAT_LINES.length) | 0; } while (i === _crtLine && CRT_CAT_LINES.length > 1);
  _crtLine = i;
  return CRT_CAT_LINES[i];
}

const CRT = { herd: {}, pkts: [], float: [], t: 0, ms: 16, tapT: 0, mini: null, miniT: 0 };

/* ---------- 3. TIỆN ÍCH TOẠ ĐỘ ---------- */
function crtOn(sc) { return !!CRT_SCENES[sc] && !!IMG.creatures; }
function crtSpan(sc) { return CRT_SPAN[sc] || 960; }
function crtCam() { return S.scene === 'STREET' ? (window._camX || 0) : 0; }
/* V31 widescreen: bề ngang khung nhìn thật của cảnh đang vẽ (Phố Ngoài cuộn
   theo VIRTUAL_W, các cảnh khác vẫn 960 rồi giãn bằng transform). Guard
   typeof vì crtStep chạy trong update() ngay lúc engine.js parse. */
function crtViewW() { return typeof vsLogicalW === 'function' ? vsLogicalW() : 960; }
function crtPlayer() { return { x: S.p.x + 10 + crtCam(), y: S.p.y + 30 }; }
function crtOnScreen(x) {
  if (S.scene !== 'STREET') return true;
  const c = window._camX || 0;
  return x > c - 180 && x < c + crtViewW() + 180;
}
/* Dải đi được tính theo CHÂN (engine neo góc trên-trái, chân = y + 30). */
function crtBand(sc) {
  if (sc === 'WORLD') return { x0: 40, x1: 920, y0: 186, y1: 540 };
  const w = SCENE_WALK[sc];
  const x1 = crtSpan(sc) - 26;
  const b = !w ? { x0: 26, x1: x1, y0: 170, y1: 540 }
    : { x0: 26, x1: x1, y0: w.minY + 40, y1: Math.min(w.maxY + 26, 588) };
  return b;
}
/* Mượn đúng hộp va chạm của người chơi: chân (x,y) == sprite tại (x-10, y-30).
   WORLD còn né thêm khúc sông: thỏ (bunInWater) đã có đa giác đo từ ảnh nền. */
function crtBlocked(sc, x, y) {
  try {
    if (sc === 'WORLD') {
      if (typeof bunInWater === 'function' && bunInWater(x, y)) return true;
      return boxCollides(x - 10, y - 30);
    }
    return propCollides(sc, x - 10, y - 30);
  } catch (e) { return false; }
}

/* ---------- 4. VẺ MỘT Ô LƯỚI, NEO ĐẾ ---------- */
function crtCell(g, row, col, bx, by, th, flip, alpha) {
  const sh = IMG.creatures; if (!sh) return;
  const dw = th * CRT_CW / CRT_CH;
  const dy = by - th * (CRT_FOOT[row] - row * CRT_CH) / CRT_CH;
  g.save();
  if (alpha != null) g.globalAlpha = alpha;
  if (flip) {
    g.translate(bx, 0); g.scale(-1, 1);
    g.drawImage(sh, col * CRT_CW, row * CRT_CH, CRT_CW, CRT_CH, -dw / 2, dy, dw, th);
  } else {
    g.drawImage(sh, col * CRT_CW, row * CRT_CH, CRT_CW, CRT_CH, bx - dw / 2, dy, dw, th);
  }
  g.restore();
}
function crtBox(g, bx, by, h, alpha) {
  const sh = IMG.creatures; if (!sh) return;
  const w = h * CRT_PKT.w / CRT_PKT.h;
  g.save(); if (alpha != null) g.globalAlpha = alpha;
  g.drawImage(sh, CRT_PKT.x, CRT_PKT.y, CRT_PKT.w, CRT_PKT.h, bx - w / 2, by - h, w, h);
  g.restore();
}
function crtShadow(g, x, y, w, a) {
  g.save(); g.globalAlpha = a == null ? 1 : a;
  g.fillStyle = 'rgba(0,0,0,.26)';
  g.beginPath(); g.ellipse(x, y - 1, w, w * .3, 0, 0, 6.2832); g.fill();
  g.restore();
}

/* ---------- 5. CYBER DINO: đi lang thang, hay khựng lại giật lag ---------- */
class CrtRex {
  constructor(sc) {
    this.spd = 19 + Math.random() * 9;
    this.dir = Math.random() < .5 ? 1 : -1;
    this.ph = Math.random() * 6.28;
    this.state = 'walk'; this.rest = .8 + Math.random() * 2.4;
    this.poseT = CRT_POSE_EVERY[0] + Math.random() * (CRT_POSE_EVERY[1] - CRT_POSE_EVERY[0]);
    this.pose = 0; this.poseKind = CRT_DINO.GLITCH;
    this.panic = 0; this.lootCd = 0; this.bob = 0; this.tx = 0; this.ty = 0;
    this.place(sc);
  }
  place(sc) {
    const b = crtBand(sc);
    for (let k = 0; k < 30; k++) {
      const x = b.x0 + Math.random() * (b.x1 - b.x0), y = b.y0 + Math.random() * (b.y1 - b.y0);
      if (!crtBlocked(sc, x, y)) { this.fx = x; this.fy = y; this.tx = x; this.ty = y; return; }
    }
    this.fx = (b.x0 + b.x1) / 2; this.fy = (b.y0 + b.y1) / 2;
  }
  pick(sc, min, max) {
    const b = crtBand(sc);
    for (let k = 0; k < 14; k++) {
      const a = Math.random() * 6.2832, r = min + Math.random() * (max - min);
      const x = Math.max(b.x0, Math.min(b.x1, this.fx + Math.cos(a) * r));
      const y = Math.max(b.y0, Math.min(b.y1, this.fy + Math.sin(a) * r * .55));
      if (crtBlocked(sc, x, y)) continue;
      this.tx = x; this.ty = y; this.state = 'walk'; return true;
    }
    return false;
  }
  /* Bị chọc -> giật mình bỏ chạy: đi thật xa, nhanh gấp mấy lần. */
  flee(sc) { this.panic = CRT_PANIC; this.lootCd = CRT_REX_CD; this.pick(sc, 180, 340); }

  step(dt, sc) {
    this.lootCd -= dt;
    if (this.panic > 0) this.panic -= dt;
    /* Khựng lại 2s: hoặc đứng giật lag "404", hoặc há mồm gầm. */
    if (this.pose > 0) {
      this.pose -= dt; this.ph += dt * 1.2;
      if (this.pose <= 0) { this.state = 'rest'; this.rest = .6 + Math.random() * 2; }
      return;
    }
    this.poseT -= dt;
    if (this.poseT <= 0) {
      this.poseT = CRT_POSE_EVERY[0] + Math.random() * (CRT_POSE_EVERY[1] - CRT_POSE_EVERY[0]);
      this.pose = CRT_POSE_T;
      this.poseKind = Math.random() < .5 ? CRT_DINO.GLITCH : CRT_DINO.ROAR;
      if (typeof beep === 'function') beep(this.poseKind === CRT_DINO.ROAR ? 92 : 210, 'square', .12, .022);
      return;
    }
    if (this.state === 'rest') {
      this.rest -= dt; this.ph += dt * 1.6; this.bob = Math.sin(this.ph) * .8;
      if (this.rest > 0) return;
      if (this.pick(sc, 40, 150)) { this.bob = 0; return; }
      this.rest = 1 + Math.random() * 2; return;
    }
    const dx = this.tx - this.fx, dy = this.ty - this.fy, d = Math.hypot(dx, dy);
    const st = this.spd * dt * (this.panic > 0 ? CRT_PANIC_MUL : 1);
    if (d <= st) {
      this.fx = this.tx; this.fy = this.ty;
      if (this.panic > 0 && this.pick(sc, 150, 300)) return;
      this.state = 'rest'; this.rest = .8 + Math.random() * 2.6; this.bob = 0; return;
    }
    this.fx += dx / d * st; this.fy += dy / d * st;
    if (Math.abs(dx) > 1.2) this.dir = dx > 0 ? 1 : -1;
    this.ph += st / 15;
    this.bob = -Math.abs(Math.sin(this.ph * Math.PI)) * 3.2;
  }
  frame() {
    if (this.pose > 0) return this.poseKind;
    if (this.state !== 'walk') return CRT_DINO.W0;
    return Math.floor(this.ph * 1.1) % 2 ? CRT_DINO.W1 : CRT_DINO.W0;
  }
  /* Thân Rex ~96px cao, 66px rộng: hitbox ôm thân chứ không phải ô lưới 178px. */
  hit(wx, wy) {
    if (this.lootCd > 0 || !crtOnScreen(this.fx)) return false;
    const hw = 34, top = this.fy + this.bob - 104;
    return wx >= this.fx - hw && wx <= this.fx + hw && wy >= top && wy <= this.fy + 8;
  }
  draw(g, t) {
    if (!crtOnScreen(this.fx)) return;
    let f = this.frame();
    /* [E] "CON QUÁI 404" của game.js chọc là gầm (CRE.rexRoar) — giữ nguyên. */
    if (typeof CRE !== 'undefined' && CRE.rexRoar > t) f = CRT_DINO.ROAR;
    const glitch = f === CRT_DINO.GLITCH;
    const jx = glitch ? Math.round(Math.sin(t * 47) * 3) : 0;
    crtShadow(g, this.fx, this.fy, 30);
    crtCell(g, CRT_ROW.DINO, f, this.fx + jx, this.fy + this.bob, CRT_TH[0], this.dir < 0);
  }
}

/* ---------- 6. MÈO SERVER: nằm gác trên kệ, thỉnh thoảng cào rớt cáp ---------- */
class CrtCat {
  constructor(x, y) {
    this.fx = x; this.fy = y;
    this.t = Math.random() * 12;
    this.bub = 0; this.bubCd = 2 + Math.random() * 9;
  }
  step(dt, px, py) {
    this.t += dt;
    this.bub -= dt; this.bubCd -= dt;
    if (this.bubCd <= 0 && Math.hypot(this.fx - px, this.fy - py) < CRT_CAT_R) {
      this.bub = 3.4; this.bubTxt = crtLine(); this.bubCd = 13 + Math.random() * 11;
      if (typeof beep === 'function') beep(680, 'sine', .1, .02);
    }
  }
  phase() { const c = this.t % 12; return c < 6.4 ? CRT_CAT.SLEEP : c < 8.6 ? CRT_CAT.LOOK : c < 10.6 ? CRT_CAT.PLAY : CRT_CAT.LOOK; }
  draw(g) {
    if (!crtOnScreen(this.fx)) return;
    const f = this.phase(), ph = this.t % 12;
    /* thân phập phồng khi ngủ, nhô lên khi với chân cào cáp */
    const bob = f === CRT_CAT.SLEEP ? Math.sin(this.t * 1.7) * .8 : f === CRT_CAT.PLAY ? -1.6 : 0;
    crtShadow(g, this.fx, this.fy, 26, .8);
    crtCell(g, CRT_ROW.CAT, f, this.fx, this.fy + bob, CRT_TH[1], 0);
    /* Chữ Z bay lên khi ngủ (ảnh đã có "Zzz" bake sẵn nên chỉ thêm nhịp thở) */
    if (f === CRT_CAT.SLEEP) {
      const k = (this.t % 3) / 3;
      g.save();
      g.globalAlpha = .85 * (1 - k);
      g.fillStyle = '#dbeafe';
      g.font = '700 ' + (10 + k * 4).toFixed(1) + 'px ' + (typeof IZF !== 'undefined' ? IZF : 'sans-serif');
      g.fillText('z', this.fx + 26 + k * 8, this.fy - 54 - k * 16);
      g.restore();
    }
    /* Đầu cáp tuột khỏi khay: tóe lửa 4 tia trong 0.4s cuối của nhịp cào. */
    if (f === CRT_CAT.PLAY && ph > 10.2) {
      const k = (ph - 10.2) / .4, sx = this.fx + 26, sy = this.fy - 12;
      g.save(); g.strokeStyle = 'rgba(253,224,71,' + (1 - k) + ')'; g.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const a = i * 1.57 + k * 2;
        g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + Math.cos(a) * 9, sy + Math.sin(a) * 9); g.stroke();
      }
      g.restore();
    }
  }
}

/* ---------- 7. BỒ CÂU CHUYỂN GÓI TIN: tầng trời, làm rơi Packet Loss ---------- */
class CrtBird {
  constructor(sc) {
    this.span = crtSpan(sc);
    this.dir = Math.random() < .5 ? 1 : -1;
    this.x = this.dir > 0 ? -140 : this.span + 140;
    /* this.y là CHÂN chim: thân cao 44px nên mép trên dao động trong dải
       trời 60..140 đúng như đặc tả, còn chân chạm tới 152 khi lượn xuống. */
    this.base = CRT_SKY[1] - 36 + Math.random() * 44;
    this.y = this.base;
    this.spd = 82 + Math.random() * 34;
    this.ph = Math.random() * 6.28;
    this.state = 'fly';
    this.drop = Math.random() < CRT_DROP_CHANCE;
    this.dropped = false;
    this.wait = 1 + Math.random() * 4;
    this.perch = null; this.sit = 0;
    this.sc = sc;
  }
  perchPoint() {
    const P = crtPerches(this.sc);
    if (!P.length || Math.random() > .45) return null;
    return P[(Math.random() * P.length) | 0];
  }
  step(dt, sc) {
    this.ph += dt * 8;
    if (this.state === 'wait') {
      this.wait -= dt;
      if (this.wait > 0) return;
      this.state = 'fly';
      this.dir = -this.dir;
      this.x = this.dir > 0 ? -140 : this.span + 140;
      this.drop = Math.random() < CRT_DROP_CHANCE;
      this.dropped = false;
      const p = this.perchPoint();
      if (p) { this.state = 'toPerch'; this.perch = p; }
      return;
    }
    if (this.state === 'perch') {
      this.sit -= dt;
      if (this.sit <= 0) { this.state = 'fly'; this.perch = null; this.drop = Math.random() < CRT_DROP_CHANCE; this.dropped = false; }
      return;
    }
    if (this.state === 'toPerch') {
      const p = this.perch, dx = p[0] - this.x, dy = p[1] - this.y, d = Math.hypot(dx, dy);
      const st = this.spd * dt;
      if (d <= st) { this.x = p[0]; this.y = p[1]; this.state = 'perch'; this.sit = 2.4 + Math.random() * 2.2; this.dir = p[2] || 1; return; }
      this.x += dx / d * st; this.y += dy / d * st;
      if (Math.abs(dx) > 1) this.dir = dx > 0 ? 1 : -1;
      return;
    }
    this.x += this.dir * this.spd * dt;
    this.y = this.base + Math.sin(this.ph * .35) * 12;
    /* Rơi hàng giữa chặng, không rơi ngay biên cho khỏi rơi ngoài map. */
    if (this.drop && !this.dropped && this.x > 90 && this.x < this.span - 90) {
      this.dropped = true;
      crtDrop(this.x, this.y, this.sc);
    }
    if (this.x > this.span + 140 || this.x < -140) {
      this.state = 'wait'; this.wait = 4 + Math.random() * 8;
    }
  }
  frame() {
    if (this.state === 'perch') return CRT_BIRD.PERCH;
    if (this.state === 'toPerch' || this.state === 'fly') {
      if (this.drop && !this.dropped) return CRT_BIRD.CARRY;
      return Math.floor(this.ph * .6) % 2 ? CRT_BIRD.UP : CRT_BIRD.DN;
    }
    return CRT_BIRD.DN;
  }
  draw(g) {
    if (this.state === 'wait') return;
    if (!crtOnScreen(this.x)) return;
    crtCell(g, CRT_ROW.BIRD, this.frame(), this.x, this.y, CRT_TH[2], this.dir < 0);
  }
}

/* Chỗ đậu trên cao theo từng cảnh. Phố: mép phải bảng hiệu từng căn (y=62 như
   hệ cũ). Thành phố: góc mái dãy tòa nhà trên cùng. Thiên Đàng: đỉnh trạm mây. */
function crtPerches(sc) {
  if (CRT._perch && CRT._perch.sc === sc) return CRT._perch.list;
  const out = [];
  try {
    if (sc === 'STREET' && typeof ST_HOUSE_X !== 'undefined') {
      ST_HOUSE_X.forEach(x => out.push([x + 78, 62, -1]));
    } else if (sc === 'WORLD' && typeof blds !== 'undefined') {
      blds.forEach(b => { if (b.y < 140) out.push([b.x + b.w - 26, b.y + 12, -1]); });
    } else if (sc === 'HEAVEN' && typeof HV_SPR !== 'undefined') {
      HV_SPR.forEach(s => out.push([s.dx + s.dw - 18, s.dy + 16, -1]));
    }
  } catch (e) {}
  CRT._perch = { sc: sc, list: out };
  return out;
}

/* ---------- 8. HỘP PACKET LOSS RƠI XUỐNG SÀN ---------- */
function crtDrop(x, y, sc) {
  const b = crtBand(sc);
  /* Điểm chạm sàn luôn ở DƯỚI chỗ thả (y tăng dần xuống dưới) — nếu không, hộp
     thả sát đất sẽ bị coi là "đã landing" và vẽ ở y khác với y dùng để đo nhặt. */
  const land = Math.max(y + 26, Math.min(b.y1, b.y0 + 30 + Math.random() * (b.y1 - b.y0 - 40)));
  CRT.pkts.push({ sc: sc, x: x, y: y + 4, y0: y + 4, land: land, t: 0, sit: CRT_PKT_SIT, gone: 0 });
  if (CRT.pkts.length > 6) CRT.pkts.shift();
}
function crtPktsStep(dt, sc, px, py) {
  for (let i = CRT.pkts.length - 1; i >= 0; i--) {
    const p = CRT.pkts[i];
    if (p.sc !== sc) continue;
    p.t += dt;
    if (p.y < p.land) {                       // rơi có giảm dần + chao nhẹ
      const k = Math.min(1, (p.t - 0) / 1.15);
      p.y = p.y0 + (p.land - p.y0) * (1 - Math.pow(1 - k, 3));
      if (p.t > 1.15) { p.y = p.land; if (typeof beep === 'function') beep(150, 'triangle', .08, .02); }
    } else {
      p.sit -= dt;
      /* Người chơi bước tới là nhặt được luôn, không cần bấm nút. */
      if (!p.gone && Math.hypot(p.x - px, p.land - py) < CRT_PKT_R) {
        p.gone = 1;
        if (typeof addCoin === 'function') addCoin(CRT_PKT_COIN);
        if (typeof beep === 'function') beep(880, 'triangle', .1, .03);
        if (CRT.float.length > 12) CRT.float.shift();
        CRT.float.push({ sc: sc, x: p.x, y: p.land - 34, t: 1.25, txt: '+' + CRT_PKT_COIN + ' Coin · Sửa Gói Tin', col: '#fde047' });
        CRT.pkts.splice(i, 1); continue;
      }
      if (p.sit <= 0) { CRT.pkts.splice(i, 1); continue; }
    }
  }
}
function crtPktDraw(g, p) {
  if (!crtOnScreen(p.x)) return;
  const a = p.sit < 1.6 ? Math.max(0, p.sit / 1.6) : 1;
  const sway = p.y < p.land ? Math.sin(p.t * 9) * 5 : 0;
  if (p.y >= p.land) crtShadow(g, p.x, p.land, 12, .55 * a);
  crtBox(g, p.x + sway, p.y, 30, a);
}

/* ---------- 9. DÀN SINH VẬT MỖI CẢNH ---------- */
const CRT_CAT_SPOTS = {
  /* WORLD: taken from blds at runtime (mặt tiền TRẠM MẠNG ISP + HỌC VIỆN CCNA).
     STREET: taken from ST_HOUSE_X (bậc thềm trước hai căn tiệm). */
  WORLD: [[800, 585], [350, 141]],
  STREET: [[860, 316], [2070, 316]]
};
/* Mèo NGỦ nên kê sát tường/cây: lấy chân đế toà nhà làm mốc, thụt vào 60px so
   với mép trái để không chắn ngay cửa (cửa nằm ở giữa hộp theo engine.js:1436). */
function crtWorldSpots() {
  try {
    if (typeof blds === 'undefined' || !blds) return null;
    const out = [];
    ['ISP', 'ACADEMY'].forEach(id => {
      const b = blds.filter(v => v.id === id)[0];
      if (b) out.push([b.x + 60, b.y + b.h + 5]);
    });
    return out.length ? out : null;
  } catch (e) { return null; }
}
function crtStreetSpots() {
  try {
    if (typeof ST_HOUSE_X === 'undefined' || !ST_HOUSE_X) return null;
    /* 312 = vỉa hè trước cửa (ngưỡng EMG dùng ở game.js:6355) */
    return [[ST_HOUSE_X[2] + 92, 316], [ST_HOUSE_X[6] - 92, 316]];
  } catch (e) { return null; }
}
function crtSpots(sc) {
  if (sc === 'HEAVEN') {
    const out = [];
    try {
      if (typeof HV_SPR !== 'undefined') HV_SPR.forEach((s, i) => {
        /* bên phải trạm 1, bên trái trạm 2-3 cho không đè lên bảng hiệu */
        out.push(i % 2 ? [s.dx - 24, s.dy + s.dh * .933 + 6] : [s.dx + s.dw + 24, s.dy + s.dh * .933 + 6]);
      });
    } catch (e) {}
    return out;
  }
  if (sc === 'WORLD') { const w = crtWorldSpots(); if (w) return w; }
  if (sc === 'STREET') { const st = crtStreetSpots(); if (st) return st; }
  return CRT_CAT_SPOTS[sc] || [];
}
function crtHerd(sc) {
  if (CRT.herd[sc]) return CRT.herd[sc];
  const h = { rex: new CrtRex(sc), cats: [], bird: new CrtBird(sc) };
  crtSpots(sc).forEach(s => h.cats.push(new CrtCat(s[0], s[1])));
  CRT.herd[sc] = h;
  return h;
}

/* ---------- 10. BƯỚC CHUNG ---------- */
function crtStep() {
  const now = performance.now(), dt = Math.min(.05, (now - (CRT.t || now)) / 1000);
  CRT.t = now;
  CRT.ms += (dt * 1000 - CRT.ms) * .06;
  /* Chữ nổi vẫn trôi khi bảng đang mở (chỉ đứng lại phần AI). */
  for (let i = CRT.float.length - 1; i >= 0; i--) {
    const f = CRT.float[i];
    if (f.t <= 0 || f.sc !== S.scene) { CRT.float.splice(i, 1); continue; }
    f.t -= dt; f.y -= dt * 24;
  }
  if (!IMG.creatures || dt <= 0) return;
  if (typeof openModalEl === 'function' && openModalEl()) return;
  const sc = S.scene;
  if (!CRT_SCENES[sc]) return;
  const h = crtHerd(sc), P = crtPlayer();
  h.rex.step(dt, sc);
  /* Dán chân Rex vào CRE.rex để nhãn [E] "CON QUÁI 404" cũ đi theo nó. */
  try { if (sc === 'WORLD' && typeof CRE !== 'undefined') { CRE.rex.x = h.rex.fx; CRE.rex.y = h.rex.fy; } } catch (e) {}
  for (const c of h.cats) c.step(dt, P.x, P.y);
  h.bird.step(dt, sc);
  crtPktsStep(dt, sc, P.x, P.y);
}

/* ---------- 11. CLICK / CHẠM: chọc khủng long ---------- */
function crtTap(ev) {
  try {
    if (ev.pointerType === 'mouse' && ev.button !== 0) return;
    if (!IMG.creatures || typeof cv === 'undefined' || !cv) return;
    if (typeof anyCtlModalOpen === 'function' && anyCtlModalOpen()) return;
    if (typeof openModalEl === 'function' && openModalEl()) return;
    const now = performance.now();
    if (now - (CRT.tapT || 0) < CRT_TAP_MS) return;
    const r = cv.getBoundingClientRect();
    if (r.width < 60 || r.height < 40) return;
    const p = (ev.touches && ev.touches[0]) || ev;
    const lw = crtViewW();
    const sx = (p.clientX - r.left) * lw / r.width;
    const sy = (p.clientY - r.top) * 600 / r.height;
    if (sx < 0 || sy < 0 || sx > lw || sy > 600) return;
    CRT.tapT = now;
    const sc = S.scene;
    if (!CRT_SCENES[sc]) return;
    const h = CRT.herd[sc]; if (!h) return;
    const wx = sx + crtCam(), wy = sy;
    if (!h.rex.hit(wx, wy)) return;
    h.rex.flee(sc);
    if (typeof addCoin === 'function') addCoin(CRT_REX_COIN);
    if (typeof addXP === 'function') addXP(CRT_REX_XP);
    if (CRT.float.length > 12) CRT.float.shift();
    CRT.float.push({ sc: sc, x: h.rex.fx, y: h.rex.fy - 108, t: 1.4, txt: '+' + CRT_REX_COIN + ' Coin · +' + CRT_REX_XP + ' XP', col: '#fca5a5' });
    if (typeof beep === 'function') beep(120, 'sawtooth', .18, .04);
    if (typeof showToast === 'function') showToast('🦖 Cyber Dino giật mình chạy mất!');
  } catch (e) {}
}
if (typeof cv !== 'undefined' && cv) cv.addEventListener('pointerdown', crtTap);

/* ---------- 12. VẼ MẶT ĐẤT: WORLD dùng depth sort sẵn có ----------
   Riêng con Rex KHÔNG đẩy ở đây: creRexSort (mục 15) đã trả nó về đúng một
   slot của engine.js:1869 — đẩy hai nơi là nó bị vẽ đè lên chính nó. */
function crtWorldSort(list) {
  if (!crtOn('WORLD')) return;
  const h = CRT.herd.WORLD; if (!h) return;
  const t = Date.now() / 1000;
  h.cats.forEach(c => list.push({ k: c.fy, f: () => c.draw(ctx, t) }));
  CRT.pkts.forEach(p => { if (p.sc === 'WORLD') list.push({ k: p.land + 2, f: () => crtPktDraw(ctx, p) }); });
}

/* Các cảnh còn lại (STREET đã dịch -camX, HEAVEN/screen thuần): gộp quanh
   chân người chơi y hệt cách bầy thỏ xếp lớp. */
function crtGroundList(sc) {
  const h = CRT.herd[sc]; if (!h) return null;
  const t = Date.now() / 1000, A = [];
  A.push({ k: h.rex.fy, f: () => h.rex.draw(ctx, t) });
  h.cats.forEach(c => A.push({ k: c.fy, f: () => c.draw(ctx, t) }));
  CRT.pkts.forEach(p => { if (p.sc === sc) A.push({ k: p.land + 2, f: () => crtPktDraw(ctx, p) }); });
  return A;
}

/* ---------- 13. TẦNG TRỜI: bồ câu + bong bóng mèo + chữ nổi ---------- */
function crtBubble(c) {
  if (c.bub <= 0 || !crtOnScreen(c.fx)) return;
  ctx.save();
  ctx.font = '700 10.5px ' + (typeof IZF !== 'undefined' ? IZF : 'sans-serif');
  const txt = c.bubTxt || crtLine();
  const L = (typeof sayLines === 'function' ? sayLines(txt, 140) : [txt]).slice(0, 3);
  let tw = 0;
  for (const s of L) tw = Math.max(tw, ctx.measureText(s).width);
  const w = Math.min(176, tw + 16), hh = 8 + L.length * 12;
  const cam = crtCam();
  const bx = Math.max(cam + 6, Math.min(cam + crtViewW() - 6 - w, c.fx - w / 2));
  const by = Math.max(2, c.fy - 78 - hh);
  ctx.globalAlpha = Math.min(1, c.bub * 3);
  if (typeof izb === 'function') izb(bx, by, w, hh, 8, '#fffdf4');
  ctx.fillStyle = '#fffdf4';
  ctx.beginPath();
  ctx.moveTo(c.fx - 5, by + hh - 1); ctx.lineTo(c.fx + 5, by + hh - 1); ctx.lineTo(c.fx, by + hh + 6);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1e293b'; ctx.textAlign = 'center';
  for (let i = 0; i < L.length; i++) ctx.fillText(L[i], bx + w / 2, by + 14 + i * 12);
  ctx.textAlign = 'left';
  ctx.restore();
}
function crtFloat(f) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, f.t * 2.4));
  ctx.font = '800 14px ' + (typeof IZF !== 'undefined' ? IZF : 'sans-serif');
  ctx.textAlign = 'center'; ctx.lineWidth = 3.5;
  ctx.strokeStyle = 'rgba(10,16,34,.8)'; ctx.strokeText(f.txt, f.x, f.y);
  ctx.fillStyle = f.col; ctx.fillText(f.txt, f.x, f.y);
  ctx.textAlign = 'left';
  ctx.restore();
}
function crtSky() {
  const sc = S.scene;
  if (!crtOn(sc)) return;
  const h = CRT.herd[sc]; if (!h) return;
  const cam = crtCam();
  ctx.save();
  if (cam) ctx.translate(-cam, 0);
  h.bird.draw(ctx);
  for (const c of h.cats) crtBubble(c);
  for (const f of CRT.float) if (f.sc === sc) crtFloat(f);
  ctx.restore();
}

/* ---------- 14. CAMEO TRONG ẢI: bồ câu góc trên, mèo góc dưới trái ---------- */
const CRT_MG = [
  ['crimp-modal', 'crimp-cv'], ['pt-modal', 'pt-cv'], ['wf-modal', 'wf-cv'],
  ['tr-modal', 'tr-cv'], ['boss-modal', 'boss-cv'], ['lu-mini', 'lu-mini-cv']
];
/* Trục ảo -140..1140 (CSS px) rồi ánh xạ ra chiều ngang canvas thật của ải,
   nên một con chim bay dùng chung cho mọi khổ bảng (500..856 CSS px). */
function crtMini(dt) {
  const M = CRT.mini || (CRT.mini = {
    x: -140, dir: 1, fly: false, wait: 2 + Math.random() * 4,
    cat: Math.random() * 12, ph: 0
  });
  M.cat += dt; M.ph += dt * 8;
  if (!M.fly) {
    M.wait -= dt;
    if (M.wait <= 0) { M.fly = true; M.dir = -M.dir; M.x = M.dir > 0 ? -140 : 1140; }
    return;
  }
  M.x += M.dir * 150 * dt;
  if (M.x > 1140 || M.x < -140) { M.fly = false; M.wait = 9 + Math.random() * 8; }
}
function crtMiniFrame() {
  if (!IMG.creatures) return;
  const now = performance.now(), dt = Math.min(.05, (now - (CRT.miniT || now)) / 1000);
  CRT.miniT = now;
  crtMini(dt);
  const M = CRT.mini;
  for (const pair of CRT_MG) {
    if (!mgVis(pair[0])) continue;
    const el = document.getElementById(pair[1]);
    if (!el || !el.width || !el.clientHeight) continue;
    const g = el.getContext('2d'); if (!g) continue;
    /* Vẽ thẳng lên canvas của ải, SAU khi ải vừa vẽ xong khung hình đó
       (mgFrame đã bị bọc nên thứ tự là ải -> cameo). Dùng KHÔNG GIAN DEVICE
       PIXEL (setTransform 1) nên không phải biết W/H logic riêng của từng ải;
       k = cv.width/clientWidth quy CSS px về device px để con vật to như nhau
       trên mọi DPI. Chim bay ở dải 36px trên cùng, mèo nằm sát góc dưới-trái
       là hai vùng trống của mọi bảng (chữ hướng dẫn nằm giữa đáy, tên lệnh
       nằm góc trên-trái chỉ bị lướt qua vài giây mỗi 9-17s). */
    const k = el.width / Math.max(1, el.clientWidth);
    const W = el.width, H = el.height;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    if (M.fly) {
      const bx = ((M.x + 140) / 1280) * (W + 280 * k) - 140 * k;
      crtCell(g, CRT_ROW.BIRD, Math.floor(M.ph * .6) % 2 ? CRT_BIRD.UP : CRT_BIRD.DN,
        bx, 36 * k, 46 * k, M.dir < 0, .95);
    }
    const cph = M.cat % 12;
    const cf = cph < 6.4 ? CRT_CAT.SLEEP : cph < 8.6 ? CRT_CAT.LOOK : cph < 10.6 ? CRT_CAT.PLAY : CRT_CAT.LOOK;
    crtCell(g, CRT_ROW.CAT, cf, 52 * k, H - 5 * k, 62 * k, 0, .96);
    g.restore();
  }
}

/* ---------- 15. ĐIỂM NỐI ---------- */
const _crtUpd = update;
update = function () { try { crtStep(); } catch (e) {} _crtUpd.apply(this, arguments); };

const _crtRnd = render;
render = function () { _crtRnd.apply(this, arguments); try { crtSky(); } catch (e) {} };

const _crtMgF = mgFrame;
mgFrame = function () { _crtMgF.apply(this, arguments); try { crtMiniFrame(); } catch (e) {} };

/* WORLD: mèo + hộp rơi đi qua depth sort của engine (engine gọi bunnySort
   ngay sau mục Rex). Guard typeof: bunnies.js chẳng may bị gỡ thì chỉ mất
   phần xếp lớp của mèo/hộp, Rex và bồ câu vẫn chạy. */
if (typeof bunnySort === 'function') {
  const _crtBS = bunnySort;
  bunnySort = function (list) { _crtBS(list); try { crtWorldSort(list); } catch (e) {} };
}

/* Rex cũ đứng chết chân ở quảng trường -> bản đi lang thang. engine.js:1869 vẫn
   gọi creRexSort() y hệt, chỉ khác mục trả về giờ là con Rex đang bước đi. */
if (typeof creRexSort === 'function') {
  creRexSort = function () {
    if (!crtOn('WORLD')) return null;
    const h = CRT.herd.WORLD; if (!h) return null;
    const t = Date.now() / 1000;
    return { k: h.rex.fy, f: () => h.rex.draw(ctx, t) };
  };
}

/* Bồ câu + hộp rơi cũ của Phố Ngoài: module này làm lại cùng việc đó (có thêm
   nhặt được thưởng), nên hai hàm cũ được bọc thành no-op để một khung hình
   không có hai đàn chim và hai loại hộp rơi chồng nhau. */
if (typeof creBird === 'function') creBird = function () {};
if (typeof crePkts === 'function') crePkts = function () {};

/* Các cảnh screen-space: chèn sinh vật mặt đất TRƯỚC/SAU người chơi theo chân,
   đúng kiểu bầy thỏ. WORLD đã có depth sort riêng nên bỏ qua ở đây. */
const _crtSpr = drawSprite;
drawSprite = function (x, y, r) {
  const sc = S.scene;
  if (r !== undefined && r !== 'p') return _crtSpr(x, y, r);
  if (!crtOn(sc) || sc === 'WORLD') return _crtSpr(x, y, r);
  const A = crtGroundList(sc);
  if (!A) return _crtSpr(x, y, r);
  const pf = y + 30;
  A.sort((p, q) => p.k - q.k);
  /* Rút khỏi danh sách ngay khi vẽ: hai lần till() trên cùng một mảng sẽ vẽ lại
     con vật đã vẽ ở lần trước (và là lý do mèo/bò sát chân người chơi bị tô đè
     hai lớp trong STREET + HEAVEN). */
  const till = lim => { while (A.length && A[0].k <= lim) { const o = A.shift(); try { o.f(); } catch (e) {} } };
  till(pf);
  try { _crtSpr(x, y, r); } finally { till(Infinity); }
};
