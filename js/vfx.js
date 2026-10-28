/* ============================================================
   V18 — VFX CHO NHÂN VẬT CHÍNH (ADD-ONLY)          js/vfx.js
   Nạp CUỐI cùng (sau bunnies.js) để bọc được chuỗi hàm mà
   engine.js / game.js / reskin.js / bunnies.js đã gán lại.
   KHÔNG sửa file nào khác: 2 hiệu ứng tự dựng bằng hook bọc.

   ---------- 1. BÓNG ĐỔ (drop shadow) ----------
   Hook  : drawChibi() (reskin.js:37) — đây là hàm tô thân nhân
           vật và nó nằm ĐÚNG slot depth-sort của người chơi:
           bunnies.js:504 + reskin.js:103 vẽ NPC ở xa (fy nhỏ hơn)
           TRƯỚC, NPC đứng chắn trước lưng (fy lớn hơn) vẽ SAU lệnh
           gọi này. Nên bóng sinh ra lót ngay dưới giày, không bao
           giờ đè lên người.
   Mềm   : 3 ellipse lồng nhau (ngoài mờ -> trong đậm) chứ không
           dùng 1 ellipse đặc vì reskin.js:49 đã có một bóng tiếp
           xúc nhỏ rgba(23,63,102,.22) — lồng thêm lớp loe để tổng
           thể là vùng tối chuyển dần tự nhiên, không thành "2 cái đĩa".
   Theo  : bóng tính thẳng từ (x, y) mà drawChibi nhận được, nên
           nó dán chân người chơi ở MỌI cảnh, mọi độ lệch camera.

   ---------- 2. BỤI CHẠY (running dust trails) ----------
   Toạ độ : hạt bụi lưu trong "sprite space" — hệ toạ độ mà
           drawChibi đang vẽ tới. Ở Phố Ngoài hệ này là WORLD
           (game.js:3424 gọi drawSprite(S.p.x + camX, ...)), còn
           các cảnh khác là screen thuần (cam = 0). Vì bụi vừa
           sinh vừa vẽ trong CÙNG một lệnh translate(-camX, 0) mà
           drawStreet đã mở, camera cuộn tới đâu bụi bám đất tới
           đó — không cần (và không được) tự cộng _camX ở đây,
           cộng thừa là bụi trôi tuột.
   Sinh   : chỉ khi S.p.moving && vị trí neo thật sự đổi (> .12px)
           -> đứng yên / đi tại chỗ không ra bụi.
   Vật lý : update() bọc — trôi ngược hướng đi + bay nhẹ lên,
           damping, nhỏ dần, mờ dần, alpha <= 0 là xoá.
   Vẽ     : tròn rgba(200,200,200,a), ARC thường, trần 30 hạt.
   ============================================================ */

const VFX_DUST_MAX = 30;      // trần hạt bụi trên màn hình
const VFX_DUST_STEP = 5;      // cứ mỗi 5px đường đi = 1 hạt
const VFX_DUST_LIFE = [.38, .66];
const VFX_DUST_MIN_D = .12;   // px/frame: ngưỡng "đang thực sự đi"

const VFX = { dust: [], anchor: null, prev: null, acc: 0, t: 0 };

/* ---------- bóng đổ ---------- */
function vfxShadow(x, y) {
  const cx = x + 10, fy = y + 32;
  /* nhát chân: khi người chơi giơ lên (bob) bóng co và nhạt đi một
     chút — chi tiết nhỏ nhưng làm bóng "dính" vào bước chạy. */
  const bob = S.p.moving ? Math.abs(Math.sin(S.p.step * .32)) * 2.2 : 0;
  const k = 1 - Math.min(.16, bob / 14);
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.1)';
  ellipsePath(ctx, cx, fy, 18 * k, 6.6 * k); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.14)';
  ellipsePath(ctx, cx, fy, 12.5 * k, 5.2 * k); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.26)';
  ellipsePath(ctx, cx, fy, 8.5 * k, 3.6 * k); ctx.fill();
  ctx.restore();
}

/* ---------- bụi ---------- */
function vfxUiOpen() {
  try {
    if (typeof anyCtlModalOpen === 'function' && anyCtlModalOpen()) return true;
    if (typeof openModalEl === 'function' && openModalEl()) return true;
  } catch (e) {}
  return false;
}

function vfxSpawn(px, py, dx, dy) {
  if (VFX.dust.length >= VFX_DUST_MAX) return;
  const d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
  const life = VFX_DUST_LIFE[0] + Math.random() * (VFX_DUST_LIFE[1] - VFX_DUST_LIFE[0]);
  VFX.dust.push({
    /* sinh sau gót chân, tản ±2.5px ngang / ±2px dọc cho tự nhiên */
    x: px - ux * 3.5 + (Math.random() - .5) * 5,
    y: py + (Math.random() - .5) * 4,
    vx: -ux * (16 + Math.random() * 20) + (Math.random() - .5) * 7,
    vy: -uy * 6 - (5 + Math.random() * 10),
    r: 2.2 + Math.random() * 2.3,
    a: .34 + Math.random() * .2,
    t: life, w: Math.random() * 6.28
  });
}

function vfxStep() {
  const now = performance.now(), dt = Math.min(.05, (now - (VFX.t || now)) / 1000);
  VFX.t = now;
  const A = VFX.anchor;
  /* đổi cảnh = đổi hệ toạ độ: buông hết bụi cũ, neo lại từ đầu */
  if (!A || A.sc !== S.scene) {
    VFX.dust.length = 0; VFX.prev = null; VFX.acc = 0; return;
  }
  const P = VFX.prev;
  VFX.prev = { x: A.x, y: A.y };
  if (P) {
    const dx = A.x - P.x, dy = A.y - P.y, d = Math.hypot(dx, dy);
    if (S.p.moving && d > VFX_DUST_MIN_D && !vfxUiOpen()) {
      VFX.acc += d;
      for (let n = 0; n < 2 && VFX.acc >= VFX_DUST_STEP; n++) {
        VFX.acc -= VFX_DUST_STEP; vfxSpawn(A.x, A.y, dx, dy);
      }
      if (VFX.acc > VFX_DUST_STEP * 2) VFX.acc = 0;   // teleported / lag spike: bỏ trôi
    } else VFX.acc = 0;
  }
  /* vòng đời: trôi ngược hướng -> dừng, bay nhẹ lên, nhỏ + mờ dần */
  for (let i = VFX.dust.length - 1; i >= 0; i--) {
    const p = VFX.dust[i];
    p.t -= dt;
    if (p.t <= 0 || p.a <= 0) { VFX.dust.splice(i, 1); continue; }
    p.w += dt * 7;
    p.vx *= 1 - Math.min(1, dt * 2.6);
    p.vy *= 1 - Math.min(1, dt * 1.6);
    p.x += p.vx * dt + Math.sin(p.w) * .18;
    p.y += p.vy * dt;
    p.a = Math.max(0, p.a - dt * .55);
    p.r = Math.max(0, p.r - dt * 1.5);
    if (p.a <= 0 || p.r <= .25) VFX.dust.splice(i, 1);
  }
}

function vfxDrawDust() {
  const L = VFX.dust;
  for (let i = 0; i < L.length; i++) {
    const p = L[i];
    ctx.fillStyle = 'rgba(200,200,200,' + p.a.toFixed(3) + ')';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
  }
}

/* ---------- hook ---------- */
/* 1) update(): bụi chạy theo đồng hồ frame kế tiếp, kể cả khi modal
      mở (engine tự gọi lại update ở engine.js:1385) nên hạt không bị
      đóng băng giữa không trung. */
const _updVfx = update;
update = function () { _updVfx(); try { vfxStep(); } catch (e) {} };

/* 2) drawChibi(): vẽ bóng + bụi NGAY TRƯỚC khi tô thân nhân vật.
      Neo vị trí bàn chân cho vfxStep đọc lại — đây chính là toạ độ
      đã có sẵn độ lệch camera của Phố Ngoài, không cộng gì thêm. */
const _chiVfx = drawChibi;
drawChibi = function (x, y, r) {
  if (r === 'p') {
    try {
      VFX.anchor = { x: x + 10, y: y + 30, sc: S.scene };
      vfxShadow(x, y);
      vfxDrawDust();
    } catch (e) {}
  }
  return _chiVfx(x, y, r);
};
