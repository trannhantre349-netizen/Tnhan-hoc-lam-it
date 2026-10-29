/* ============================================================
   V21 — MINIGAME LẬP TRÌNH "THIÊN ĐÀNG IT" (ADD-ONLY)   js/mg-coding.js

   Không sửa một dòng code cũ nào. Toàn bộ là móc nối:

     mgFrame()   → vẽ canvas hv-mini mỗi khung hình khi modal mở
     doAction()  → [E] ở trạm mây = mở minigame; [E]/Space khi đang chơi
                   = nút GỢI Ý (không lọt xuống world)
     update()    → nhận diện bấm ESC (closeAll ẩn modal) để gỡ trạng thái
     BUN_MINI_MODALS.push('hv-mini')  → thỏ ẩn đúng chỗ khi modal mở

   Hai module chơi:
     sort : "SẮP XẾP THUẬT TOÁN" — bấm dòng code lộn xộn để xếp lại đúng
            thứ tự chạy (khai báo TRƯỚC khi dùng). pc1 = 6 dòng,
            pc3 = 8 dòng (hard).
     bug  : "BẮT BUG" — bug bò ngang dòng code, bấm để sửa. Bấm nhầm dòng
            sạch hoặc để bug bò tới cuối dòng đều trừ tích hợp.

   Modal dùng chung hình học với lu-mini của Khu 3 (canvas trong 760x400,
   inset 14px 76px trong hộp #app 960x600 đã scale) nên không vỡ layout.
   Phần thưởng theo đúng tiền lệ ải Mặt Trăng: addXP + addCoin + cộng skill
   + saveGame + updateQuestHUD, kèm sfxPlay('coin') mà yêu cầu nêu tên.
   ============================================================ */

/* ---------- 1. HÌNH HỌC ---------- */
const HVM_W = 760, HVM_H = 400;

/* Bảng xếp code: 8 ô dọc phải nằm trọn trong panel (44..380). */
const HVM_SORT = {
  lpx: 18, rpx: 398, pw: 344,     // panel trái / panel phải
  top: 58, bh: 34, pitch: 40      // 8 ô: 58 .. 58+7*40+34 = 372
};

/* Màn hình code của BẮT BUG */
const HVM_BUG = {
  sx: 18, sy: 40, sw: 724, sh: 310,
  gut: 46,                         // cột số dòng
  lineTop: 70, lineH: 32, lines: 8,
  laneX0: 60, laneX1: 732, hitR: 18
};

/* ---------- 2. NGÂN HÀNG ĐỀ ---------- */
/* Thứ tự trong mảng = thứ tự chạy ĐÚNG (index chính là đáp án). */
const HVM_BANK = {
  easy: {
    head: 'SOI CHUOT NETWORK — khai báo TRƯỚC khi dùng',
    lines: [
      'import socket',
      'HOST = "192.168.1.10"',
      'PORT = 443',
      's = socket.socket()',
      's.connect((HOST, PORT))',
      'print("OK " + str(PORT))'
    ]
  },
  hard: {
    head: 'QUY TRINH SU CO MANG — thứ tự không thể đảo ngược',
    lines: [
      'ip = dhcp_lease("eth0")',
      'mask = netmask_for(ip)',
      'gw = router_for(mask)',
      'apply_ip(ip, mask, gw)',
      'if not ping(gw):',
      '    restart("eth0")',
      '    ping(gw)',
      'log("DHCP xong")'
    ]
  }
};

/* Mã nguồn để bug bò lên (module BẮT BUG) */
const HVM_SRC = [
  'function kiemTraMay(id) {',
  '  const may = danhSach[id];',
  '  if (!may) return false;',
  '  may.ping();',
  '  may.up = may.up + 1;',
  '  if (may.up > 999) log(may);',
  '  return may.ok;',
  '}'
];

/* ---------- 3. TIỆN ÍCH ---------- */
function hvmSfx(k, rate) {
  /* sfx.js luôn tồn tại vì nạp trước, nhưng guard để file âm thanh thiếu
     không bao giờ làm crash minigame (người chơi đang giữa ván). */
  try { if (typeof sfxPlay === 'function') sfxPlay(k, rate); } catch (e) {}
}
function hvmChord(freqs) {
  try { if (typeof chord === 'function') chord(freqs); } catch (e) {}
}
function hvmShuffle(n) {
  /* xáo trộn ít nhất 2 vị trí sai — tránh "mở ra đã thắng" */
  let a;
  for (let guard = 0; guard < 40; guard++) {
    a = [];
    for (let i = 0; i < n; i++) a.push(i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    let wrong = 0;
    for (let i = 0; i < n; i++) if (a[i] !== i) wrong++;
    if (wrong >= 2) return a;
  }
  return a;
}
function hvmCodeBg(g, t) {
  g.fillStyle = '#050b16'; g.fillRect(0, 0, HVM_W, HVM_H);
  g.strokeStyle = 'rgba(90,160,230,.08)'; g.lineWidth = 1;
  for (let x = 0; x <= HVM_W; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, HVM_H); g.stroke(); }
  for (let y = 0; y <= HVM_H; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(HVM_W, y); g.stroke(); }
  /* hai cột nhị phân trôi — nhắc "đang ở trên mây code" */
  g.save(); g.globalAlpha = .13; g.fillStyle = '#7dd3fc';
  g.font = '700 10px ' + MG_MONO;
  for (let c = 0; c < 10; c++) {
    const x = 24 + c * 78, sp = 26 + (c % 3) * 9;
    const off = (t * sp) % 22;
    for (let r = -1; r < 20; r++) {
      const v = (c * 7 + r * 13 + Math.floor(t * sp / 22)) % 3;
      g.fillText(v === 0 ? '010' : v === 1 ? '1011' : '10', x, off + r * 22);
    }
  }
  g.restore();
}
function hvmBlock(g, x, y, w, h, txt, o) {
  o = o || {};
  const shake = o.shake ? Math.sin(o.shake * 46) * 3 : 0;
  x += shake;
  const rim = o.rim || 'rgba(125,211,252,.45)';
  mgPanel(g, x, y, w, h, o.bg || '#101d33', o.bg2 || '#081022', rim);
  if (o.badge !== undefined) {
    g.beginPath(); g.arc(x + 16, y + h / 2, 9, 0, 7);
    g.fillStyle = o.badgeCol || '#38bdf8'; g.fill();
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 1.2; g.stroke();
    mgTxt(g, String(o.badge), x + 16, y + h / 2 + 3.6, { size: 9.5, color: '#04101f', align: 'center' });
  }
  mgTxt(g, fitTxt(g, txt, w - (o.badge !== undefined ? 48 : 24), o.size || 10.5),
    x + (o.badge !== undefined ? 30 : 12), y + h / 2 + 3.6,
    { size: o.size || 10.5, color: o.col || '#dbeafe' });
  if (o.mark) mgTxt(g, o.mark, x + w - 10, y + h / 2 + 4, { size: 12, color: o.markCol || '#4ade80', align: 'right' });
}
function hvmBar(g, x, y, w, h, v, col, txt) {
  g.fillStyle = 'rgba(255,255,255,.10)'; rr(g, x, y, w, h, h / 2); g.fill();
  const k = Math.max(0, Math.min(1, v));
  g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 7;
  rr(g, x, y, Math.max(h, w * k), h, h / 2); g.fill(); g.shadowBlur = 0;
  if (txt) mgTxt(g, txt, x + w + 8, y + h - 1, { size: 9.5, color: col });
}
function hvmWinOverlay(g, L) {
  g.fillStyle = 'rgba(3,10,22,.74)'; g.fillRect(0, 0, HVM_W, HVM_H);
  const st = '⭐'.repeat(L.stars) + '☆'.repeat(3 - L.stars);
  mgTxt(g, '✅ CHƯƠNG TRÌNH CHẠY ĐÚNG', HVM_W / 2, 176,
    { size: 23, color: '#4ade80', align: 'center', glow: '#22c55e', glowSize: 16, mono: false });
  mgTxt(g, st, HVM_W / 2, 216, { size: 22, color: '#fde047', align: 'center' });
  mgTxt(g, 'Bấm ✔ XONG TRẠM để nhận thưởng hoặc 🔄 CHƠI LẠI để lấy sao cao hơn',
    HVM_W / 2, 246, { size: 11.5, color: '#bae6fd', align: 'center', mono: false });
}
function hvmFailOverlay(g, S) {
  g.fillStyle = 'rgba(3,6,12,.74)'; g.fillRect(0, 0, HVM_W, HVM_H);
  mgTxt(g, '💥 BUG LAN TOÀN MẠCH', HVM_W / 2, 186,
    { size: 24, color: '#f97316', align: 'center', glow: '#ef4444', glowSize: 14, mono: false });
  mgTxt(g, 'Tích hợp về 0 — bắt lại ' + S.need + ' con bug để cứu đám mây',
    HVM_W / 2, 218, { size: 12, color: '#cbd5e1', align: 'center', mono: false });
}

/* ============================================================
   4. MODULE "SẮP XẾP THUẬT TOÁN"
   ============================================================ */
const HVM_G1 = {
  key: 'sort',
  btn: '⚡ GỢI Ý',
  init(g, t, pc) {
    const bank = pc.hard ? HVM_BANK.hard : HVM_BANK.easy;
    g.head = bank.head;
    g.lines = bank.lines;
    g.n = bank.lines.length;
    g.order = hvmShuffle(g.n);                 // vị trí cố định ở panel trái
    g.taken = []; for (let i = 0; i < g.n; i++) g.taken.push(false);
    g.ans = [];
    g.bad = []; g.resolve = 0; g.hint = 0;
    g.mistakes = 0; g.t0 = t; g.win = false;
  },
  slotY(k) { return HVM_SORT.top + k * HVM_SORT.pitch; },
  place(g, i, t) {
    if (g.taken[i] || g.ans.length >= g.n) return;
    g.taken[i] = true; g.ans.push(i);
    beep(620, 'triangle', .06, .03);
    mgBurst('hv-mini', HVM_SORT.rpx + 20, this.slotY(g.ans.length - 1) + HVM_SORT.bh / 2, '#38bdf8', 5);
    if (g.ans.length === g.n) this.check(g, t);
  },
  pick(g, pos) {
    const i = g.ans[pos]; if (i === undefined) return;
    g.ans.splice(pos, 1); g.taken[i] = false; g.bad = [];
    beep(430, 'sine', .05, .025);
  },
  check(g, t) {
    const bad = [];
    for (let p = 0; p < g.n; p++) if (g.ans[p] !== p) bad.push(p);
    if (!bad.length) { g.win = true; return; }
    g.mistakes++; g.bad = bad; g.resolve = t + 1.1;
    beep(150, 'square', .18, .05);
  },
  tick(g, t, dt) {
    if (g.win) return;
    if (g.hint > 0) g.hint = Math.max(0, g.hint - dt);
    if (g.resolve && t >= g.resolve) {
      g.resolve = 0;
      for (let k = g.bad.length - 1; k >= 0; k--) {
        const p = g.bad[k], i = g.ans[p];
        if (i !== undefined) { g.taken[i] = false; }
      }
      g.ans = g.ans.filter((v, p) => g.bad.indexOf(p) < 0);
      g.bad = [];
    }
  },
  ptr(g, kind, p, t) {
    if (kind !== 'down' || g.win) return;
    for (let k = 0; k < g.n; k++) {
      const i = g.order[k];
      if (g.taken[i]) continue;
      const y = this.slotY(k);
      if (p.x >= HVM_SORT.lpx + 10 && p.x <= HVM_SORT.lpx + HVM_SORT.pw &&
        p.y >= y && p.y <= y + HVM_SORT.bh) { this.place(g, i, t); return; }
    }
    for (let pos = 0; pos < g.ans.length; pos++) {
      const y = this.slotY(pos);
      if (p.x >= HVM_SORT.rpx + 10 && p.x <= HVM_SORT.rpx + HVM_SORT.pw &&
        p.y >= y && p.y <= y + HVM_SORT.bh) { this.pick(g, pos); return; }
    }
  },
  pulse(g, t) {
    if (g.win) return;
    g.hint = 1.7;
    if (g.ans.length === g.n) this.check(g, t);
    beep(880, 'sine', .07, .03);
  },
  hintTxt(g) {
    if (g.win) return '🎉 Đoạn code đã chạy đúng!';
    if (g.bad.length) return '❌ Thứ tự sai — đang trả các dòng đỏ về bộ nhớ…';
    return '🖱 Bấm dòng code bên TRÁI để xếp vào ô chạy bên PHẢI · bấm lại một ô đã xếp để rút về · ' + g.ans.length + '/' + g.n + ' dòng';
  },
  stars(g) { return g.mistakes <= 1 ? 3 : g.mistakes <= 3 ? 2 : 1; },
  draw(g, S, t, L) {
    hvmCodeBg(g, t);
    mgTxt(g, S.head, HVM_W / 2, 24, { size: 11.5, color: '#bae6fd', align: 'center', mono: false });
    /* hai panel */
    mgPanel(g, HVM_SORT.lpx, 44, HVM_SORT.pw, 336, '#0c1526', '#060c17', 'rgba(125,211,252,.22)');
    mgPanel(g, HVM_SORT.rpx, 44, HVM_SORT.pw, 336, '#0c1a2e', '#060c17', 'rgba(125,211,252,.35)');
    mgTxt(g, 'BỘ NHỢ · CODE LỘN XỘN', HVM_SORT.lpx + HVM_SORT.pw / 2, 38, { size: 9.5, color: '#64a8d8', align: 'center', mono: false });
    mgTxt(g, 'THỨ TỰ CHẠY', HVM_SORT.rpx + HVM_SORT.pw / 2, 38, { size: 9.5, color: '#7dd3fc', align: 'center', mono: false });
    mgTxt(g, '→', 380, HVM_H / 2, { size: 20, color: 'rgba(125,211,252,.5)', align: 'center' });
    /* ô trống bên phải */
    for (let k = 0; k < S.n; k++) {
      const y = this.slotY(k);
      if (k < S.ans.length) continue;
      g.setLineDash([5, 4]);
      g.strokeStyle = 'rgba(125,211,252,.26)'; g.lineWidth = 1.4;
      rr(g, HVM_SORT.rpx + 10, y, HVM_SORT.pw - 20, HVM_SORT.bh, 9); g.stroke();
      g.setLineDash([]);
      mgTxt(g, 'dòng ' + (k + 1), HVM_SORT.rpx + 20, y + HVM_SORT.bh / 2 + 3.5, { size: 9, color: 'rgba(100,168,216,.45)', mono: false });
    }
    /* dòng trong bộ nhớ */
    for (let k = 0; k < S.n; k++) {
      const i = S.order[k]; if (S.taken[i]) continue;
      const y = this.slotY(k);
      hvmBlock(g, HVM_SORT.lpx + 10, y, HVM_SORT.pw - 20, HVM_SORT.bh, S.lines[i],
        { badge: '?', badgeCol: '#334f6d', col: '#cfe6ff' });
    }
    /* dòng đã xếp */
    for (let p = 0; p < S.ans.length; p++) {
      const i = S.ans[p], y = this.slotY(p);
      const isBad = S.bad.indexOf(p) >= 0;
      const goodMark = (S.hint > 0 || S.win) && i === p;
      hvmBlock(g, HVM_SORT.rpx + 10, y, HVM_SORT.pw - 20, HVM_SORT.bh, S.lines[i], {
        badge: p + 1,
        badgeCol: isBad ? '#ef4444' : goodMark ? '#4ade80' : '#38bdf8',
        rim: isBad ? '#ef4444' : goodMark ? '#22c55e' : 'rgba(125,211,252,.5)',
        bg: isBad ? '#2b1016' : goodMark ? '#0e2a1c' : '#101d33',
        col: isBad ? '#fecaca' : goodMark ? '#bbf7d0' : '#dbeafe',
        shake: isBad ? t : 0,
        mark: goodMark ? '✔' : (isBad ? '✕' : ''),
        markCol: isBad ? '#f87171' : '#4ade80'
      });
    }
    mgTxt(g, '⚠ Lỗi sắp xếp: ' + S.mistakes + '   ⏱ ' + Math.round(t - S.t0) + 's',
      HVM_W - 18, HVM_H - 12, { size: 10, color: S.mistakes ? '#fca5a5' : '#94a3b8', align: 'right' });
    if (L.done) hvmWinOverlay(g, L);
    mgDrawFx(g, 'hv-mini');
  }
};

/* ============================================================
   5. MODULE "BẮT BUG"
   ============================================================ */
const HVM_G2 = {
  key: 'bug',
  btn: '🐞 BẮT CON GẦN NHẤT',
  init(g, t, pc) {
    g.src = HVM_SRC;
    g.bugs = []; g.caught = 0; g.escaped = 0; g.clickB = 0;
    g.integ = 100; g.need = pc.hard ? 10 : 8; g.max = pc.hard ? 20 : 16;
    g.spawn = .7; g.t0 = t; g.id = 0; g.dead = false; g.win = false;
  },
  laneY(i) { return HVM_BUG.lineTop + i * HVM_BUG.lineH - 4; },
  spawnBug(g) {
    const dir = Math.random() < .72 ? 1 : -1;
    const line = Math.floor(Math.random() * HVM_BUG.lines);
    g.bugs.push({
      id: g.id++, line: line, dir: dir,
      x: dir > 0 ? HVM_BUG.laneX0 : HVM_BUG.laneX1,
      sp: 74 + Math.random() * 46 + g.caught * 3,
      wob: Math.random() * 6.28, sz: 9 + Math.random() * 3.5
    });
  },
  tick(g, t, dt) {
    if (g.win || g.dead) return;
    g.spawn -= dt;
    const seen = g.caught + g.escaped;
    if (g.spawn <= 0 && seen + g.bugs.length < g.max) {
      this.spawnBug(g); g.spawn = Math.max(.72, 1.55 - seen * .055);
    }
    for (let k = g.bugs.length - 1; k >= 0; k--) {
      const b = g.bugs[k];
      b.x += b.sp * dt * b.dir; b.wob += dt * 9;
      const out = b.dir > 0 ? b.x > HVM_BUG.laneX1 + 6 : b.x < HVM_BUG.laneX0 - 6;
      if (out) {
        g.bugs.splice(k, 1); g.escaped++; g.integ -= 12;
        beep(140, 'square', .2, .05);
        mgBurst('hv-mini', b.dir > 0 ? HVM_BUG.laneX1 : HVM_BUG.laneX0, this.laneY(b.line), '#f97316', 9);
        if (g.integ <= 0) { g.integ = 0; g.dead = true; beep(90, 'sawtooth', .35, .05); }
      }
    }
    if (g.caught >= g.need) g.win = true;
  },
  ptr(g, kind, p, t) {
    if (kind !== 'down' || g.win || g.dead) return;
    let best = -1, bd = HVM_BUG.hitR;
    for (let k = 0; k < g.bugs.length; k++) {
      const b = g.bugs[k], d = Math.hypot(p.x - b.x, p.y - (this.laneY(b.line) + Math.sin(b.wob) * 2));
      if (d <= bd) { bd = d; best = k; }
    }
    if (best >= 0) {
      const b = g.bugs[best];
      g.bugs.splice(best, 1); g.caught++;
      g.integ = Math.min(100, g.integ + 2);
      hvmSfx('pop');
      mgBurst('hv-mini', b.x, this.laneY(b.line), '#4ade80', 12);
      beep(780, 'triangle', .06, .035);
      return;
    }
    /* bấm nhầm vùng code sạch */
    if (p.x > HVM_BUG.sx && p.x < HVM_BUG.sx + HVM_BUG.sw && p.y > HVM_BUG.sy && p.y < HVM_BUG.sy + HVM_BUG.sh) {
      g.clickB++; g.integ -= 6;
      mgBurst('hv-mini', p.x, p.y, '#94a3b8', 6);
      beep(160, 'square', .1, .04);
      if (g.integ <= 0) { g.integ = 0; g.dead = true; mgBurst('hv-mini', HVM_W / 2, 200, '#f97316', 22); }
    }
  },
  pulse(g, t) {
    if (g.win || g.dead || !g.bugs.length) return;
    let best = g.bugs[0];
    for (const b of g.bugs) if (Math.abs(b.x - HVM_W / 2) < Math.abs(best.x - HVM_W / 2)) best = b;
    best.flash = t + .9;
    g.integ = Math.max(1, g.integ - 3);      // trợ giúp có giá của nó
    beep(900, 'sine', .06, .025);
  },
  hintTxt(g) {
    if (g.dead) return '💥 Hệ thống sập — bấm 🔄 CHẠY LẠI để bắt đầu ván mới.';
    if (g.win) return '🎉 Sạch bug! Đám mây đã chạy ổn định.';
    const left = Math.max(0, g.need - g.caught);
    return '🐞 Bấm ĐÚNG con bug đang bò trên dòng code · để nó bò tới cuối dòng: −12% · bấm nhầm dòng sạch: −6% · còn ' + left + ' con';
  },
  stars(g) { return g.integ >= 75 ? 3 : g.integ >= 45 ? 2 : 1; },
  draw(g, S, t, L) {
    hvmCodeBg(g, t);
    mgTxt(g, 'MÀN HÌNH DEBUG — BUG ĐANG BÒ TRÊN MÃ NGUỒN', 300, 24,
      { size: 11, color: '#bae6fd', align: 'center', mono: false });
    /* thanh tích hợp + đồng hồ */
    const ic = S.integ >= 60 ? '#4ade80' : S.integ >= 30 ? '#facc15' : '#ef4444';
    hvmBar(g, 470, 15, 150, 11, S.integ / 100, ic);
    mgTxt(g, '❤ ' + Math.round(S.integ) + '%', 628, 24, { size: 10, color: ic });
    mgTxt(g, '⏱ ' + Math.max(0, Math.round(t - S.t0)) + 's', 742, 24, { size: 10, color: '#64748b', align: 'right' });
    /* màn code */
    mgPanel(g, HVM_BUG.sx, HVM_BUG.sy, HVM_BUG.sw, HVM_BUG.sh, '#0b1424', '#050a13', 'rgba(125,211,252,.26)');
    g.fillStyle = 'rgba(56,189,248,.06)';
    g.fillRect(HVM_BUG.sx, HVM_BUG.sy, HVM_BUG.gut, HVM_BUG.sh);
    g.strokeStyle = 'rgba(125,211,252,.2)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(HVM_BUG.sx + HVM_BUG.gut, HVM_BUG.sy);
    g.lineTo(HVM_BUG.sx + HVM_BUG.gut, HVM_BUG.sy + HVM_BUG.sh); g.stroke();
    for (let i = 0; i < HVM_BUG.lines; i++) {
      const y = HVM_BUG.lineTop + i * HVM_BUG.lineH;
      mgTxt(g, String(i + 1).padStart(2, '0'), HVM_BUG.sx + 12, y, { size: 9.5, color: '#3f6f96' });
      mgTxt(g, S.src[i], 62, y, { size: 11, color: '#9fd3ff' });
    }
    /* vạch lỗi đỏ dưới dòng có bug */
    for (const b of S.bugs) {
      const y = HVM_BUG.lineTop + b.line * HVM_BUG.lineH + 6;
      g.strokeStyle = 'rgba(248,113,113,.5)'; g.lineWidth = 1.4;
      g.beginPath();
      for (let x = 62; x < 738; x += 8) g.lineTo(x, y + ((x / 8) % 2 ? 2 : 0));
      g.stroke();
    }
    /* bug */
    for (const b of S.bugs) this.drawBug(g, b, t);
    mgTxt(g, '✔ BẮT ĐƯỢC ' + S.caught + '/' + S.need + '   ✕ THOÁT ' + S.escaped + '   ⚠ BẤM NHẦM ' + S.clickB,
      HVM_W / 2, HVM_H - 12, { size: 10.5, color: '#94a3b8', align: 'center' });
    if (S.dead && !S.win) hvmFailOverlay(g, S);
    if (L.done) hvmWinOverlay(g, L);
    mgDrawFx(g, 'hv-mini');
  },
  drawBug(g, b, t) {
    const y = this.laneY(b.line) + Math.sin(b.wob) * 2, s = b.sz;
    const mark = b.flash && t < b.flash;
    g.save(); g.translate(b.x, y); g.scale(b.dir, 1);
    /* chân */
    g.strokeStyle = '#0b1220'; g.lineWidth = 1.6;
    for (let i = -1; i <= 1; i++) {
      const lx = i * s * .5, sw = Math.sin(b.wob * 2 + i) * 2;
      g.beginPath(); g.moveTo(lx, 0); g.lineTo(lx - s * .5, s + sw); g.stroke();
      g.beginPath(); g.moveTo(lx, 0); g.lineTo(lx + s * .5, s - sw); g.stroke();
      g.beginPath(); g.moveTo(lx, 0); g.lineTo(lx - s * .5, -s - sw); g.stroke();
      g.beginPath(); g.moveTo(lx, 0); g.lineTo(lx + s * .5, -s + sw); g.stroke();
    }
    /* râu */
    g.beginPath(); g.moveTo(s * .9, -2); g.lineTo(s * 1.5, -s * .8); g.stroke();
    g.beginPath(); g.moveTo(s * .9, 2); g.lineTo(s * 1.5, s * .8); g.stroke();
    /* cánh đỏ phát sáng */
    if (mark) { g.shadowColor = '#fde047'; g.shadowBlur = 16; }
    else { g.shadowColor = '#ef4444'; g.shadowBlur = 9; }
    const grd = g.createLinearGradient(-s, -s, s, s);
    grd.addColorStop(0, '#fca5a5'); grd.addColorStop(.5, '#dc2626'); grd.addColorStop(1, '#7f1d1d');
    g.beginPath(); g.ellipse(0, 0, s * 1.08, s * .78, 0, 0, 7);
    g.fillStyle = grd; g.fill(); g.shadowBlur = 0;
    g.strokeStyle = '#1f0505'; g.lineWidth = 1.2; g.stroke();
    /* vạch chia cánh + đốm */
    g.beginPath(); g.moveTo(-s * 1.05, 0); g.lineTo(s * 1.0, 0);
    g.strokeStyle = 'rgba(20,5,5,.85)'; g.lineWidth = 1.4; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.85)';
    for (let i = 0; i < 3; i++) {
      g.beginPath(); g.arc(-s * .5 + i * s * .5, -s * .34, 1.5, 0, 7); g.fill();
      g.beginPath(); g.arc(-s * .5 + i * s * .5, s * .34, 1.5, 0, 7); g.fill();
    }
    /* đầu */
    g.beginPath(); g.arc(s * 1.02, 0, s * .42, 0, 7); g.fillStyle = '#111827'; g.fill();
    if (mark) {
      g.strokeStyle = '#fde047'; g.lineWidth = 2;
      g.beginPath(); g.arc(0, 0, s * 1.7, 0, 7); g.stroke();
    }
    g.restore();
  }
};

const HVM_MODS = { sort: HVM_G1, bug: HVM_G2 };

/* ============================================================
   6. MODAL hv-mini
   ============================================================ */
let HVM = null;                                    // { pc, mod, g, done, stars, t, _hint }

function hvmVisible() { return mgVis('hv-mini'); }
function hvmCut() { try { return typeof HV_CUT !== 'undefined' && !!HV_CUT; } catch (e) { return false; } }

function hvMiniEl() {
  let m = document.getElementById('hv-mini');
  if (!m) {
    m = document.createElement('div');
    m.id = 'hv-mini'; m.className = 'modal';
    document.getElementById('app').appendChild(m);
  }
  return m;
}
function hvMiniLayout() {
  const m = hvMiniEl();
  m.style.cssText = 'display:flex;flex-direction:column;gap:8px;position:absolute;inset:14px 76px;transform:none;animation:none;padding:14px 20px 12px;background:linear-gradient(160deg,#0b2a55,#04101f);border:2px solid #7dd3fc;border-radius:18px;color:#e6f2ff;font:13px "Segoe UI",sans-serif;z-index:120;box-shadow:0 20px 60px #000c';
  m.innerHTML =
    '<div id="hv-mini-hd" style="display:flex;justify-content:space-between;align-items:center"></div>' +
    '<div id="hv-mini-hint" style="font-size:12px;color:#bae6fd;min-height:16px"></div>' +
    '<div style="display:flex;justify-content:center"><canvas id="hv-mini-cv" style="width:760px;max-width:100%;display:block;border-radius:12px;background:#050b16;touch-action:none;cursor:crosshair"></canvas></div>' +
    '<div id="hv-mini-foot" style="display:flex;justify-content:center;align-items:center;gap:10px;min-height:38px"></div>';
  const cv = document.getElementById('hv-mini-cv');
  const pos = ev => mgPoint(cv, ev, HVM_W, HVM_H);
  cv.addEventListener('pointerdown', ev => {
    try { cv.setPointerCapture(ev.pointerId); } catch (e) {}
    hvMiniPtr('down', pos(ev));
  });
  cv.addEventListener('pointermove', ev => hvMiniPtr('move', pos(ev)));
  cv.addEventListener('pointerup', ev => hvMiniPtr('up', pos(ev)));
  cv.addEventListener('pointercancel', () => hvMiniPtr('up', { x: -99, y: -99 }));
  return m;
}
function hvMiniPtr(kind, p) {
  if (!HVM || HVM.done) return;
  HVM.mod.ptr(HVM.g, kind, p, MGX.t);
}
function hvMiniPulse() {
  if (!HVM || HVM.done) return;
  if (HVM.mod.pulse) HVM.mod.pulse(HVM.g, MGX.t);
}
function hvMiniFoot() {
  const f = document.getElementById('hv-mini-foot');
  if (!f || !HVM) return;
  const mod = HVM.mod;
  f.innerHTML =
    (mod.btn && !HVM.g.dead ? '<button onclick="hvMiniPulse()" style="padding:9px 22px;border:0;border-radius:12px;background:linear-gradient(160deg,#38bdf8,#1d4ed8);color:#04101f;font-weight:800;cursor:pointer;font-size:14px">' + mod.btn + '</button>' : '') +
    '<button onclick="hvMiniReplay()" style="padding:8px 16px;border:1px solid #475569;border-radius:12px;background:#161f3a;color:#cbd5e1;cursor:pointer;font-size:12px">🔄 CHẠY LẠI</button>' +
    '<button onclick="hvMiniClose()" style="padding:8px 16px;border:1px solid #475569;border-radius:12px;background:#161f3a;color:#cbd5e1;cursor:pointer;font-size:12px">✖ THOÁT</button>';
}
function hvMiniDone() { return HV_PCS.filter(p => !!S.missionsDone[p.id]).length; }

function hvMiniEnter(i) {
  const pc = HV_PCS[i];
  if (!pc || hvmCut()) return;
  const mod = HVM_MODS[pc.kind] || HVM_G1;
  hvMiniLayout();
  HVM = { pc: pc, mod: mod, g: {}, done: false, stars: 0, t: MGX.t, _hint: null, _dead: false };
  mod.init(HVM.g, MGX.t, pc);
  document.getElementById('hv-mini-hd').innerHTML =
    '<b style="font-size:16px">' + pc.icon + ' ' + pc.name + ' — TRẠM MÂY ' + (i + 1) + '/' + HV_PCS.length + '</b>' +
    '<span style="display:flex;gap:8px;align-items:center;font-size:12px;color:#9fc7ea">☁️ Khu 4: ' + hvMiniDone() + '/' + HV_PCS.length +
    '<button onclick="hvMiniClose()" style="background:#0f2742;color:#fff;border:1px solid #3b6f9f;border-radius:8px;padding:2px 10px;cursor:pointer">✖</button></span>';
  hvMiniFoot();
  hvmSfx('pop');
  try { if (typeof beep === 'function') beep(660, 'triangle', .1, .04); } catch (e) {}
}
function hvMiniReplay() {
  if (!HVM) return;
  HVM.done = false; HVM.stars = 0; HVM._hint = null; HVM._dead = false;
  HVM.g = {};
  const el = document.getElementById('hv-mini-hint');
  if (el) el.style.color = '#bae6fd';
  HVM.mod.init(HVM.g, MGX.t, HVM.pc);
  hvMiniFoot();
  try { if (typeof beep === 'function') beep(520, 'triangle', .1, .04); } catch (e) {}
}
function hvMiniClose() {
  const m = document.getElementById('hv-mini');
  if (m) m.style.display = 'none';
  HVM = null;
}
function hvMiniWin() {
  const pc = HVM.pc, mod = HVM.mod;
  HVM.done = true;
  HVM.stars = mod.stars(HVM.g);
  const st = '⭐'.repeat(HVM.stars) + '☆'.repeat(3 - HVM.stars);
  const first = !S.missionsDone[pc.id];
  S.missionsDone[pc.id] = true;
  const xp = pc.xp * HVM.stars, coin = pc.coin * HVM.stars;
  addXP(xp); addCoin(coin);
  if (pc.skill && S.skills[pc.skill] !== undefined) S.skills[pc.skill] = Math.min(5, S.skills[pc.skill] + 1);
  hvmSfx('coin');                              // đúng yêu cầu: thắng = sfxPlay('coin')
  hvmChord([660, 880, 1100]);
  saveGame(); updateQuestHUD();
  const msg = '🎁 +' + xp + ' EXP | +' + coin.toLocaleString() + ' Coin' +
    (pc.skill ? ' | +' + pc.skill.toUpperCase() + ' Skill' : '') +
    (first ? '' : ' <span style="opacity:.7">(cày lại — đủ 100%)</span>');
  showToast('☁️ ' + pc.name + ' hoàn thành!');
  if (first && hvMiniDone() === HV_PCS.length) {
    showBanner('KHU 4 · THIÊN ĐÀNG IT', '☁️ SẠCH 3/3 TRẠM MÂY', 'Toàn bộ đám mây lập trình đã online — ' + S.title + '!', 'violet');
  }
  const nx = HV_PCS.filter(z => !S.missionsDone[z.id])[0];
  const el = document.getElementById('hv-mini-hint');
  if (el) {
    el.style.color = '#4ade80';
    el.innerHTML = '🎉 <b>CHƯƠNG TRÌNH CHẠY ĐÚNG!</b> ' + st + ' — ' + msg +
      ' · ☁️ Khu 4: ' + hvMiniDone() + '/' + HV_PCS.length +
      (nx ? ' · Trạm tiếp: ' + nx.icon + ' ' + nx.name : ' · <b>Cả 3 trạm mây đã sáng!</b>');
  }
  const f = document.getElementById('hv-mini-foot');
  if (f) f.innerHTML =
    '<button onclick="hvMiniClose()" style="padding:9px 30px;border:0;border-radius:12px;background:#22c55e;color:#04120a;font-weight:800;cursor:pointer;font-size:14px">✔ XONG TRẠM</button>' +
    '<button onclick="hvMiniReplay()" style="padding:9px 18px;border:1px solid #475569;border-radius:12px;background:#161f3a;color:#cbd5e1;cursor:pointer">🔄 CHƠI LẠI</button>';
}
function hvMiniDead() {
  HVM._dead = true;
  const f = document.getElementById('hv-mini-foot');
  if (f) f.innerHTML =
    '<button onclick="hvMiniReplay()" style="padding:9px 26px;border:0;border-radius:12px;background:#f97316;color:#160603;font-weight:800;cursor:pointer;font-size:14px">🔄 CHẠY LẠI</button>' +
    '<button onclick="hvMiniClose()" style="padding:9px 18px;border:1px solid #475569;border-radius:12px;background:#161f3a;color:#cbd5e1;cursor:pointer">✖ THOÁT</button>';
}
/* Mỗi khung hình khi modal mở (mgFrame bên dưới gọi) */
function hvMiniFrame(cv, t) {
  if (!HVM) return;
  const dt = Math.min(0.05, Math.max(0, t - (HVM.t || t)));
  HVM.t = t;
  const g = mgFit(cv, HVM_W, HVM_H);
  if (!HVM.done) {
    HVM.mod.tick(HVM.g, t, dt);
    const hint = HVM.mod.hint ? HVM.mod.hint(HVM.g, t) : '';
    if (hint !== HVM._hint) {
      HVM._hint = hint;
      const el = document.getElementById('hv-mini-hint');
      if (el) el.innerHTML = hint;
    }
    if (HVM.g.win) hvMiniWin();
    else if (HVM.g.dead && !HVM._dead) hvMiniDead();
  }
  HVM.mod.draw(g, HVM.g, t, HVM);
}

/* mod.hint() trả chuỗi — gắn vào cho hai module */
HVM_G1.hint = function (g) { return this.hintTxt(g); };
HVM_G2.hint = function (g) { return this.hintTxt(g); };

/* ============================================================
   7. MÓC NỐI (wrapper — không sửa hàm cũ)
   ============================================================ */
/* Thỏ ẩn sau modal hv-mini giống các minigame khác */
try { if (typeof BUN_MINI_MODALS !== 'undefined') BUN_MINI_MODALS.push('hv-mini'); } catch (e) {}

const _hvmOldFrame = mgFrame;
mgFrame = function () {
  _hvmOldFrame();                       // đã cập nhật MGX.t và vẽ các modal khác
  if (HVM && hvmVisible()) {
    const cv = document.getElementById('hv-mini-cv');
    if (cv) hvMiniFrame(cv, MGX.t);
  }
};

const _hvmOldUpd = update;
update = function () {
  _hvmOldUpd.apply(this, arguments);
  if (HVM && !hvmVisible()) HVM = null;   // bấm ESC → closeAll() ẩn modal
};

const _hvmOldAct = doAction;
doAction = function () {
  if (HVM) { hvMiniPulse(); return; }     // [E]/Space = nút hành động trong game
  if (targetAct && targetAct.t === 'hv_pc' && !hvmCut()) { hvMiniEnter(targetAct.i); return; }
  _hvmOldAct();
};
