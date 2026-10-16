/* ============================================================
   mg-art.js — Canvas art cho mini-game: đầu RJ45 trong suốt,
   lõi dây xoắn Twisted Pair, patch panel + dây nhảy, linh kiện PC.
   Vẽ hoàn toàn bằng lệnh, scale theo devicePixelRatio nên nét trên HiDPI.
   ============================================================ */

const MGX = { fx: [], t: 0, mouse: { x: 0, y: 0, in: false }, wf: { in: false }, tr: { k: -1, in: false }, bs: { k: -1, kind: '', in: false }, fw: [], fwWave: -1, fwT: 0 };

/* ---------- tiện ích canvas ---------- */
function mgFit(cv, W, H) {
  const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
  const cssW = cv.clientWidth || W;
  const cssH = Math.round(cssW * H / W);
  if (cv.style.height !== cssH + 'px') cv.style.height = cssH + 'px';
  const bw = Math.round(cssW * dpr), bh = Math.round(cssH * dpr);
  if (cv.width !== bw || cv.height !== bh) { cv.width = bw; cv.height = bh; }
  const g = cv.getContext('2d');
  const s = cssW / W * dpr;
  g.setTransform(s, 0, 0, s, 0, 0);
  g.clearRect(0, 0, W, H);
  return g;
}
function mgPoint(cv, ev, W, H) {
  const r = cv.getBoundingClientRect();
  const p = (ev.touches && ev.touches[0]) || ev;
  return { x: (p.clientX - r.left) * W / Math.max(1, r.width), y: (p.clientY - r.top) * H / Math.max(1, r.height) };
}
function mgVis(id) { const m = document.getElementById(id); return !!m && m.style.display === 'flex'; }
const MG_MONO = '"JetBrains Mono","Cascadia Mono",Consolas,monospace';
function mgTxt(g, s, x, y, o) {
  o = o || {};
  g.font = `${o.weight || 700} ${o.size || 10}px ${o.mono === false ? '"Baloo 2","Segoe UI",sans-serif' : MG_MONO}`;
  g.textAlign = o.align || 'left';
  g.fillStyle = o.color || '#cbd5e1';
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = o.glowSize || 8; }
  g.fillText(s, x, y);
  g.shadowBlur = 0; g.textAlign = 'left';
}
function fitTxt(g, s, maxW, size) {
  g.font = `700 ${size || 10}px ${MG_MONO}`;
  if (g.measureText(s).width <= maxW) return s;
  let i = s.length;
  while (i > 1 && g.measureText(s.slice(0, i) + '…').width > maxW) i--;
  return s.slice(0, i) + '…';
}
function mgPanel(g, x, y, w, h, top, bottom, rim) {
  const grd = g.createLinearGradient(0, y, 0, y + h);
  grd.addColorStop(0, top); grd.addColorStop(1, bottom);
  rr(g, x, y, w, h, 9); g.fillStyle = grd; g.fill();
  g.strokeStyle = rim || 'rgba(255,255,255,.14)'; g.lineWidth = 1.6; g.stroke();
}
function mgLED(g, x, y, r, col, on, pulse) {
  const p = on ? Math.max(0, Math.min(1, (pulse == null ? 1 : pulse))) : 0;
  if (on) {
    const hg = g.createRadialGradient(x, y, r * .4, x, y, r * 2.6);
    hg.addColorStop(0, alphaC(col, .42 + p * .3));
    hg.addColorStop(.55, alphaC(col, .14 + p * .12));
    hg.addColorStop(1, alphaC(col, 0));
    g.beginPath(); g.arc(x, y, r * 2.6, 0, 7); g.fillStyle = hg; g.fill();
  } else {
    g.beginPath(); g.arc(x, y, r * 1.7, 0, 7); g.fillStyle = 'rgba(255,255,255,.03)'; g.fill();
  }
  const grd = g.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r);
  grd.addColorStop(0, on ? lighten(col, .55) : '#22303f');
  grd.addColorStop(1, on ? col : '#101820');
  g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = grd; g.fill();
  if (on) { g.shadowColor = col; g.shadowBlur = Math.min(9, r * 2); g.beginPath(); g.arc(x, y, r * .78, 0, 7); g.fillStyle = col; g.fill(); g.shadowBlur = 0; }
  g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
}
function mgBurst(cvId, x, y, col, n) {
  for (let i = 0; i < (n || 10); i++)
    MGX.fx.push({ cv: cvId, x, y, c: col, t: MGX.t, a: Math.random() * Math.PI * 2, sp: 26 + Math.random() * 46 });
}
function mgDrawFx(g, cvId) {
  MGX.fx = MGX.fx.filter(f => {
    if (f.cv !== cvId) return true;
    const k = (MGX.t - f.t) / .55;
    if (k >= 1) return false;
    const d = 6 + k * f.sp;
    g.globalAlpha = 1 - k;
    g.strokeStyle = f.c; g.lineWidth = 2; g.shadowColor = f.c; g.shadowBlur = 8;
    g.beginPath(); g.arc(f.x, f.y, d, 0, 7); g.stroke();
    for (let i = 0; i < 6; i++) {
      const a = f.a + i * Math.PI / 3;
      g.beginPath(); g.moveTo(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d);
      g.lineTo(f.x + Math.cos(a) * (d + 5 * (1 - k)), f.y + Math.sin(a) * (d + 5 * (1 - k))); g.stroke();
    }
    g.shadowBlur = 0; g.globalAlpha = 1;
    return true;
  });
}

/* ---------- dây xoắn Twisted Pair ---------- */
function mgWire(g, x0, x1, cy, th, w, phase) {
  if (x1 - x0 < .5) return;
  const grd = g.createLinearGradient(0, cy - th / 2, 0, cy + th / 2);
  grd.addColorStop(0, lighten(w.main, .55));
  grd.addColorStop(.3, lighten(w.main, .12));
  grd.addColorStop(.72, w.main);
  grd.addColorStop(1, darken(w.main, .45));
  g.lineCap = 'butt';
  g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = th;
  g.beginPath(); g.moveTo(x0, cy + th * .26); g.lineTo(x1, cy + th * .26); g.stroke();
  g.strokeStyle = grd; g.lineWidth = th;
  g.beginPath(); g.moveTo(x0, cy); g.lineTo(x1, cy); g.stroke();
  const per = th * 2.05;
  g.save();
  g.setLineDash([per * .42, per * .58]); g.lineDashOffset = -(phase || 0);
  g.lineWidth = th;
  g.strokeStyle = w.stripe ? 'rgba(255,255,255,.94)' : 'rgba(0,0,0,.16)';
  g.beginPath(); g.moveTo(x0, cy); g.lineTo(x1, cy); g.stroke();
  g.restore();
  g.strokeStyle = 'rgba(255,255,255,.34)'; g.lineWidth = Math.max(1, th * .17);
  g.beginPath(); g.moveTo(x0, cy - th * .3); g.lineTo(x1, cy - th * .3); g.stroke();
}
function mgWireCurve(g, x0, y0, xm, ym, x1, y1, th, w, phase) {
  const path = () => { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(xm, ym, x1, y1); };
  const grd = g.createLinearGradient(0, y0 - th, 0, y1 + th);
  grd.addColorStop(0, lighten(w.main, .45)); grd.addColorStop(.55, w.main); grd.addColorStop(1, darken(w.main, .4));
  g.lineCap = 'round';
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = th; path(); g.stroke();
  g.strokeStyle = grd; g.lineWidth = th; path(); g.stroke();
  const per = th * 2.05;
  g.save();
  g.setLineDash([per * .42, per * .58]); g.lineDashOffset = -(phase || 0);
  g.lineWidth = th; g.strokeStyle = w.stripe ? 'rgba(255,255,255,.92)' : 'rgba(0,0,0,.15)';
  path(); g.stroke(); g.restore();
  g.lineCap = 'butt';
}

/* ============================================================
   1) ĐẦU BẤM RJ45 — canvas crimp
   ============================================================ */
const CR = {
  W: 500, H: 344,
  bodyX: 152, bodyX1: 416, ch0: 88, chP: 16, chN: 8, th: 11,
  swY: 240
};
CR.cy = i => CR.ch0 + i * CR.chP;

function crimpPinAt(cv, ev) {
  const p = mgPoint(cv, ev, CR.W, CR.H);
  if (p.x < CR.bodyX - 46 || p.x > CR.bodyX1 + 30) return -1;
  for (let i = 0; i < CR.chN; i++) if (Math.abs(p.y - CR.cy(i)) <= CR.chP / 2 + 1) return i;
  return -1;
}

function drawCrimp(cv, S) {
  const g = mgFit(cv, CR.W, CR.H), t = MGX.t;
  g.textBaseline = 'alphabetic';

  // --- áo cáp Cat6 ---
  mgPanel(g, 6, 110, 100, 66, '#3b4a5d', '#1b2431', 'rgba(255,255,255,.16)');
  g.save(); rr(g, 6, 110, 100, 66, 9); g.clip();
  for (let i = 0; i < 4; i++) { g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 3; g.beginPath(); g.moveTo(14 + i * 24, 110); g.lineTo(6 + i * 24, 176); g.stroke(); }
  g.restore();
  mgTxt(g, 'CAT6', 56, 138, { size: 10, color: '#9fb6cc', align: 'center' });
  mgTxt(g, 'U/UTP', 56, 151, { size: 8, color: '#6b8199', align: 'center' });
  // boot cao su
  mgPanel(g, 100, 118, 34, 50, '#5b6a7c', '#333e4b', 'rgba(255,255,255,.14)');
  for (let i = 0; i < 4; i++) { g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(106 + i * 8, 120); g.lineTo(106 + i * 8, 166); g.stroke(); }

  // --- lõi vỏ RJ45 (phần trong suốt) ---
  const bx = CR.bodyX, bw = CR.bodyX1 - CR.bodyX, by = CR.cy(0) - 20, bh = CR.chP * 8 + 22;
  const pcg = g.createLinearGradient(0, by, 0, by + bh);
  pcg.addColorStop(0, 'rgba(226,244,255,.52)');
  pcg.addColorStop(.45, 'rgba(178,214,240,.30)');
  pcg.addColorStop(1, 'rgba(140,180,214,.42)');
  rr(g, bx, by, bw, bh, 7); g.fillStyle = pcg; g.fill();
  // rãnh dẫn từng lõi
  for (let i = 0; i <= CR.chN; i++) {
    const yy = CR.cy(0) - CR.chP / 2 + i * CR.chP;
    g.strokeStyle = 'rgba(90,130,165,.34)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(bx + 4, yy); g.lineTo(CR.bodyX1 - 20, yy); g.stroke();
  }

  // --- 8 lõi đồng ---
  for (let i = 0; i < CR.chN; i++) {
    const cy = CR.cy(i), w = S.pins[i], target = (i === S.nextPin && !w);
    if (!w) {
      rr(g, bx + 3, cy - CR.th / 2 - 1, bw - 26, CR.th + 2, 3);
      g.fillStyle = 'rgba(4,10,18,.62)'; g.fill();
      g.strokeStyle = 'rgba(255,255,255,.13)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(bx + 6, cy - CR.th / 2); g.lineTo(CR.bodyX1 - 26, cy - CR.th / 2); g.stroke();
      g.setLineDash([3, 3]); g.strokeStyle = target ? '#facc15' : 'rgba(150,180,205,.4)';
      g.lineWidth = target ? 1.6 : 1; rr(g, bx + 3, cy - CR.th / 2 - 1, bw - 26, CR.th + 2, 3); g.stroke();
      g.setLineDash([]);
    }
    const ph = (t * 9 + i * 3) % 40;
    // đoạn xòe từ áo cáp vào hàng
    const jy = 143 + (i - 3.5) * 6.2;
    if (w) mgWireCurve(g, 104, jy, 128, (jy + cy) / 2, bx + 6, cy, CR.th, w, ph);
    else { g.strokeStyle = 'rgba(150,170,190,.22)'; g.lineWidth = 1; g.setLineDash([2, 4]); g.beginPath(); g.moveTo(104, jy); g.quadraticCurveTo(128, (jy + cy) / 2, bx + 6, cy); g.stroke(); g.setLineDash([]); }
    if (w) mgWire(g, bx + 4, CR.bodyX1 - 22, cy, CR.th, w, ph);
    // lưỡi đồng tiếp xúc
    const bladeOn = !!w;
    const bh2 = 8.4, bx2 = CR.bodyX1 - 22;
    const gg = g.createLinearGradient(0, cy - bh2 / 2, 0, cy + bh2 / 2);
    gg.addColorStop(0, bladeOn ? '#ffe9a8' : '#6b6250');
    gg.addColorStop(.5, bladeOn ? '#e8bc4b' : '#4d4739');
    gg.addColorStop(1, bladeOn ? '#a97c1c' : '#39352a');
    rr(g, bx2, cy - bh2 / 2, 26, bh2, 1.6); g.fillStyle = gg; g.fill();
    if (bladeOn) {
      g.shadowColor = '#ffd76a'; g.shadowBlur = 2.6 + Math.sin(t * 4 + i) * 1.2;
      rr(g, CR.bodyX1 - 1, cy - bh2 / 2 + 1.4, 3, bh2 - 2.8, 1); g.fillStyle = '#fff2c0'; g.fill();
      g.shadowBlur = 0;
    }
    g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = .8; rr(g, bx2, cy - bh2 / 2, 26, bh2, 1.6); g.stroke();
    // số pin
    mgTxt(g, String(i + 1), CR.bodyX1 + 12, cy + 3.6, { size: 10, color: w ? '#7dd3fc' : (target ? '#facc15' : '#5d7386'), glow: target ? '#facc15' : null, glowSize: 6 });
    if (target) {
      const k = (Math.sin(t * 5) * .5 + .5);
      g.strokeStyle = `rgba(250,204,21,${.55 + k * .45})`; g.lineWidth = 2;
      rr(g, bx + 1, cy - CR.chP / 2 + 1, bw - 18, CR.chP - 2, 4); g.stroke();
      g.fillStyle = `rgba(250,204,21,${.1 + k * .1})`; g.fill();
      g.beginPath(); g.moveTo(bx - 12, cy); g.lineTo(bx - 4, cy - 5); g.lineTo(bx - 4, cy + 5); g.closePath();
      g.fillStyle = '#facc15'; g.fill();
    }
  }

  // --- chốt nhựa (latch) + thành trước + bóng gương ---
  rr(g, 206, by + bh, 108, 17, 5);
  const lg = g.createLinearGradient(0, by + bh, 0, by + bh + 17);
  lg.addColorStop(0, 'rgba(205,228,246,.75)'); lg.addColorStop(1, 'rgba(150,186,214,.55)');
  g.fillStyle = lg; g.fill();
  g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1.3; g.stroke();
  rr(g, 216, by + bh + 4, 88, 5, 2); g.fillStyle = 'rgba(90,130,160,.45)'; g.fill();
  rr(g, CR.bodyX1 - 16, by, 16, bh, 4);
  g.fillStyle = 'rgba(215,238,252,.42)'; g.fill();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1; g.stroke();
  rr(g, bx, by, bw, bh, 7);
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 2; g.stroke();
  g.strokeStyle = 'rgba(96,140,176,.75)'; g.lineWidth = 1; rr(g, bx + 1.5, by + 1.5, bw - 3, bh - 3, 6); g.stroke();
  // ánh gương xiên
  g.save(); rr(g, bx, by, bw, bh, 7); g.clip();
  const sg = g.createLinearGradient(bx, by, bx + bw * .5, by + bh);
  sg.addColorStop(0, 'rgba(255,255,255,.24)'); sg.addColorStop(.5, 'rgba(255,255,255,.05)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = sg; g.fillRect(bx, by, bw, bh);
  g.fillStyle = 'rgba(255,255,255,.16)';
  g.beginPath(); g.moveTo(bx + 30, by); g.lineTo(bx + 66, by); g.lineTo(bx + 26, by + bh); g.lineTo(bx - 10, by + bh); g.closePath(); g.fill();
  g.restore();
  mgTxt(g, 'RJ45 CAT6', bx + bw / 2, by - 8, { size: 9, color: '#7f9ab1', align: 'center' });

  // --- mặt switch + LED cổng ---
  const done = S.pins.filter(Boolean).length;
  mgPanel(g, 16, CR.swY, 468, 88, '#1d2836', '#0c1420', 'rgba(120,170,220,.28)');
  mgTxt(g, 'SW01', 30, CR.swY + 18, { size: 10, color: '#7dd3fc', glow: '#0ea5e9', glowSize: 8 });
  mgTxt(g, 'CISCATALYST 2960 · 10/100/1000', 78, CR.swY + 18, { size: 8.5, color: '#5b7288' });
  mgLED(g, 462, CR.swY + 14, 4, '#22c55e', done > 0, Math.sin(t * 3));
  mgTxt(g, 'SYST', 430, CR.swY + 17, { size: 7.5, color: '#5b7288', align: 'right' });
  for (let i = 0; i < 8; i++) {
    const px = 30 + i * 55, py = CR.swY + 52;
    const linked = !!S.pins[i];
    const blink = linked && (done === 8 || ((t * 2.6 + i * .41) % 1) < .62);
    mgLED(g, px + 21, CR.swY + 30, 3.6, linked ? '#22c55e' : '#1e2b3a', blink, linked ? Math.sin(t * 6 + i) : 0);
    // cổng RJ45 thu nhỏ
    rr(g, px, py, 42, 26, 3);
    g.fillStyle = '#070d15'; g.fill();
    g.strokeStyle = linked ? 'rgba(34,197,94,.75)' : 'rgba(120,150,180,.35)'; g.lineWidth = 1.4; g.stroke();
    rr(g, px + 4, py + 4, 34, 13, 2); g.fillStyle = linked ? 'rgba(34,197,94,.14)' : 'rgba(255,255,255,.05)'; g.fill();
    g.fillStyle = linked ? '#c8952a' : '#2b3947';
    for (let k = 0; k < 8; k++) g.fillRect(px + 6 + k * 4, py + 5, 2.2, 9);
    rr(g, px + 15, py + 17, 12, 8, 1.5); g.fillStyle = '#070d15'; g.fill();
    g.strokeStyle = 'rgba(120,150,180,.3)'; g.lineWidth = 1; g.stroke();
    mgTxt(g, String(i + 1), px + 21, py - 8, { size: 8, color: linked ? '#93c5fd' : '#4d6172', align: 'center' });
  }
  if (done === 8) {
    const k = (t * 1.4) % 1;
    g.strokeStyle = `rgba(34,197,94,${.35 + .35 * Math.sin(t * 5)})`; g.lineWidth = 2;
    g.beginPath(); g.moveTo(CR.bodyX1 + 20, CR.cy(3)); g.quadraticCurveTo(CR.bodyX1 + 60, CR.swY - 10, 250, CR.swY - 4); g.stroke();
    mgTxt(g, '▲ LINK UP 1000M FULL DUPLEX', 250, CR.swY + 85, { size: 8.5, color: '#4ade80', align: 'center', glow: '#22c55e', glowSize: 10 });
  }

  // lỗi / chọn
  if (S.selFlash > 0) {
    g.strokeStyle = `rgba(239,68,68,${S.selFlash})`; g.lineWidth = 3;
    rr(g, bx - 2, by - 2, bw + 4, bh + 4, 8); g.stroke();
  }
  mgDrawFx(g, 'crimp-cv');
}

function drawCrimpPalette(cv, S) {
  const W = 246, H = 326, RH = 34, PITCH = 38;
  const g = mgFit(cv, W, H), t = MGX.t;
  for (let i = 0; i < 8; i++) {
    const w = S.order[i], y = 6 + i * PITCH, used = S.used[i];
    const sel = S.selected === i;
    rr(g, 4, y, W - 8, RH, 7);
    const bg = g.createLinearGradient(0, y, 0, y + RH);
    if (sel) { bg.addColorStop(0, '#12324f'); bg.addColorStop(1, '#0b1c30'); }
    else { bg.addColorStop(0, used ? '#0d151f' : '#141f2c'); bg.addColorStop(1, '#0b1219'); }
    g.fillStyle = bg; g.fill();
    g.strokeStyle = used ? 'rgba(90,110,130,.25)' : (sel ? '#facc15' : 'rgba(120,170,220,.35)');
    g.lineWidth = sel ? 2 : 1.3;
    if (sel) { g.shadowColor = '#facc15'; g.shadowBlur = 12; }
    g.stroke(); g.shadowBlur = 0;
    g.globalAlpha = used ? .34 : 1;
    mgWire(g, 12, 78, y + RH / 2, 12, w, (t * 12 + i * 5) % 31);
    // đầu lõi đồng
    rr(g, 78, y + RH / 2 - 6, 10, 12, 2);
    g.fillStyle = '#d9ad4b'; g.fill();
    g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = .8; g.stroke();
    mgTxt(g, `${i + 1}`, 96, y + 15, { size: 9, color: '#64ffda', glow: sel ? '#64ffda' : null, glowSize: 6 });
    mgTxt(g, w.name, 110, y + 15, { size: 9, color: used ? '#64748b' : '#dbeafe' });
    mgTxt(g, used ? 'đã bấm ✓' : (sel ? '◀ đang giữ' : `PIN ${i + 1}`), 110, y + 26, { size: 7.5, color: used ? '#475569' : (sel ? '#facc15' : '#5b7288') });
    g.globalAlpha = 1;
  }
  mgTxt(g, 'CHỌN DÂY → BẤM VÀO PIN', W / 2, H - 3, { size: 8.5, color: '#7f9ab1', align: 'center' });
}
function crimpPaletteAt(cv, ev) {
  const p = mgPoint(cv, ev, 246, 326);
  const i = Math.floor((p.y - 6) / 38);
  return (i >= 0 && i < 8 && p.x > 4) ? i : -1;
}

/* ============================================================
   2) PATCH PANEL — 2 rãnh rack + dây nhảy + LED
   ============================================================ */
const PP = { W: 820, H: 300, rowY: i => 96 + i * 38, srvX: 300, swX: 470, portW: 52, portH: 30 };
function ptRowAt(cv, ev) {
  const p = mgPoint(cv, ev, PP.W, PP.H);
  let row = -1;
  for (let i = 0; i < 5; i++) if (Math.abs(p.y - PP.rowY(i)) <= 18) row = i;
  if (row < 0) return null;
  if (p.x > 236 && p.x < 386) return { side: 'L', row };
  if (p.x > 430 && p.x < 580) return { side: 'R', row };
  return null;
}
const CORD_COL = ['#38bdf8', '#22c55e', '#f59e0b', '#a855f7', '#f43f5e'];

function drawRack(g, x, y, w, h, title, sub) {
  mgPanel(g, x, y, w, h, '#22303f', '#0b1219', 'rgba(125,211,252,.3)');
  // tai rack
  g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(x + 6, y + 6, 10, h - 12); g.fillRect(x + w - 16, y + 6, 10, h - 12);
  g.fillStyle = 'rgba(0,0,0,.5)';
  for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(x + 11, y + 18 + i * (h - 36) / 4, 2.6, 0, 7); g.fill(); g.beginPath(); g.arc(x + w - 11, y + 18 + i * (h - 36) / 4, 2.6, 0, 7); g.fill(); }
  mgTxt(g, title, x + 24, y + 22, { size: 10.5, color: '#7dd3fc', glow: '#0ea5e9', glowSize: 8 });
  mgTxt(g, sub, x + 24, y + 36, { size: 8, color: '#5b7288' });
}
function drawJackBox(g, x, y, lit, sel, col) {
  const w = PP.portW, h = PP.portH;
  rr(g, x, y - h / 2, w, h, 4);
  const bg = g.createLinearGradient(0, y - h / 2, 0, y + h / 2);
  bg.addColorStop(0, sel ? '#1e3a5f' : '#121a24'); bg.addColorStop(1, '#070c12');
  g.fillStyle = bg; g.fill();
  g.strokeStyle = sel ? '#facc15' : (lit ? alphaC(col || '#22c55e', .9) : 'rgba(120,150,180,.4)');
  g.lineWidth = sel ? 2 : 1.4;
  if (sel) { g.shadowColor = '#facc15'; g.shadowBlur = 12; }
  g.stroke(); g.shadowBlur = 0;
  // miệng jack
  rr(g, x + 8, y - h / 2 + 5, w - 16, h - 15, 2); g.fillStyle = '#03080d'; g.fill();
  g.fillStyle = lit ? '#d9ad4b' : '#3a4653';
  for (let k = 0; k < 8; k++) g.fillRect(x + 10 + k * 4, y - h / 2 + 7, 2.4, h - 20);
  rr(g, x + w / 2 - 7, y + h / 2 - 9, 14, 6, 1.5); g.fillStyle = '#03080d'; g.fill();
  g.strokeStyle = 'rgba(120,150,180,.25)'; g.lineWidth = .8; g.stroke();
}
function drawPatch(cv, S) {
  const g = mgFit(cv, PP.W, PP.H), t = MGX.t;
  drawRack(g, 16, 40, 384, 240, 'SERVER SIDE', 'PATCH PANEL · 5 PORT');
  drawRack(g, 420, 40, 384, 240, 'SW01 · Gi0/1-9', 'CISCATALYST 2960');

  // dây nhảy đã đấu
  S.linked.forEach((idx, k) => {
    const li = S.dispSrv.indexOf(idx), ri = S.dispSw.indexOf(idx);
    const col = CORD_COL[idx % CORD_COL.length];
    const y0 = PP.rowY(li), y1 = PP.rowY(ri);
    const x0 = 352, x1 = 470;
    g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 9;
    g.beginPath(); g.moveTo(x0, y0 + 2); g.bezierCurveTo(x0 + 46, y0 + 2, x1 - 46, y1 + 2, x1, y1 + 2); g.stroke();
    const grd = g.createLinearGradient(x0, 0, x1, 0);
    grd.addColorStop(0, darken(col, .25)); grd.addColorStop(.5, lighten(col, .2)); grd.addColorStop(1, darken(col, .25));
    g.strokeStyle = grd; g.lineWidth = 8; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x0, y0); g.bezierCurveTo(x0 + 46, y0, x1 - 46, y1, x1, y1); g.stroke();
    g.save(); g.setLineDash([4, 5]); g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 8;
    g.beginPath(); g.moveTo(x0, y0); g.bezierCurveTo(x0 + 46, y0, x1 - 46, y1, x1, y1); g.stroke(); g.restore();
    // đầu bấm 2 bên
    [ [x0, y0, -1], [x1, y1, 1] ].forEach(([px, py, d]) => {
      rr(g, px + (d < 0 ? -14 : 0), py - 6, 15, 12, 2);
      g.fillStyle = 'rgba(226,240,252,.6)'; g.fill();
      g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 1; g.stroke();
      g.fillStyle = '#d9ad4b';
      for (let q = 0; q < 4; q++) g.fillRect(px + (d < 0 ? -12 + q * 3 : 2 + q * 3), py - 3, 1.6, 6);
    });
    // pulse chạy trên dây
    const u = ((t * .55 + k * .2) % 1);
    const bx = x0 + (x1 - x0) * u, by = y0 + (y1 - y0) * (u * u * (3 - 2 * u));
    g.shadowColor = col; g.shadowBlur = 12; g.fillStyle = '#fff';
    g.beginPath(); g.arc(bx, by, 2.8, 0, 7); g.fill(); g.shadowBlur = 0;
  });

  // cáp đang cầm theo chuột
  if (S.sel !== null) {
    const li = S.dispSrv.indexOf(S.sel), y0 = PP.rowY(li), col = CORD_COL[S.sel % CORD_COL.length];
    const x0 = 352;
    const mx = MGX.mouse.in ? Math.max(x0 + 20, Math.min(PP.W - 30, MGX.mouse.x)) : x0 + 60;
    const my = MGX.mouse.in ? MGX.mouse.y : y0 + 26;
    g.strokeStyle = alphaC(col, .85); g.lineWidth = 8; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + mx) / 2, Math.max(y0, my) + 22, mx, my); g.stroke();
    rr(g, mx - 6, my - 7, 16, 14, 2); g.fillStyle = 'rgba(226,240,252,.7)'; g.fill();
    g.strokeStyle = '#facc15'; g.lineWidth = 1.4; g.stroke();
  }

  for (let r = 0; r < 5; r++) {
    const si = S.dispSrv[r], swi = S.dispSw[r], y = PP.rowY(r), col = CORD_COL[si % CORD_COL.length];
    const lk = S.linked.includes(si), sel = S.sel === si;
    // vạch chia đơn vị rack
    g.strokeStyle = 'rgba(125,160,195,.10)'; g.lineWidth = 1;
    [16, 420].forEach(rx => { g.beginPath(); g.moveTo(rx + 24, y + 20); g.lineTo(rx + 360, y + 20); g.stroke(); });
    mgTxt(g, S.plan[si].srv, 34, y + 4, { size: 10.5, color: lk ? '#4ade80' : '#e2e8f0', glow: lk ? '#22c55e' : null, glowSize: 6 });
    mgTxt(g, S.plan[si].note.toUpperCase(), 34, y + 17, { size: 8, color: '#5b7288' });
    drawJackBox(g, 300, y, lk, sel, col);
    mgLED(g, 296 - 8, y, 3.4, col, lk, Math.sin(t * 4 + r));

    mgLED(g, 448, y, 3.2, '#22c55e', lk, Math.sin(t * 5 + r * .8));
    drawJackBox(g, 470, y, lk, false, col);
    mgTxt(g, S.plan[swi].sw, 540, y + 1, { size: 10.5, color: S.linked.includes(swi) ? '#4ade80' : '#e2e8f0' });
    mgTxt(g, 'SW01', 540, y + 14, { size: 8, color: '#5b7288' });
    // cột trạng thái cổng bên phải
    const slk = S.linked.includes(swi);
    g.strokeStyle = 'rgba(125,160,195,.16)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(616, y + 1); g.lineTo(700, y + 1); g.stroke();
    mgTxt(g, slk ? '▲ LINK UP · 1000M FD' : '▫ NOTCONNECT · down', 786, y + 4,
      { size: 8.5, align: 'right', color: slk ? '#4ade80' : '#43586c', glow: slk ? '#22c55e' : null, glowSize: 7 });
  }
  if (S.wrongT > 0) {
    g.fillStyle = `rgba(239,68,68,${Math.min(.22, S.wrongT * .3)})`;
    g.fillRect(420, 40, 384, 240);
  }
  mgTxt(g, 'Click cổng Server bên trái → rồi click cổng Switch bên phải theo sơ đồ', PP.W / 2, PP.H - 6, { size: 8.5, color: '#7f9ab1', align: 'center' });
  mgDrawFx(g, 'pt-cv');
}

/* ============================================================
   3) LINH KIỆN PC — sprite + viền LED glow
   ============================================================ */
const PW = 104, PH = 62;
function pcbBoard(g, x, y, w, h, c1, c2) {
  const grd = g.createLinearGradient(x, y, x + w, y + h);
  grd.addColorStop(0, c1); grd.addColorStop(1, c2);
  rr(g, x, y, w, h, 3); g.fillStyle = grd; g.fill();
  g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 1; g.stroke();
}
function cap(g, x, y, r) {
  const grd = g.createLinearGradient(x, y - r, x, y + r);
  grd.addColorStop(0, '#dbeafe'); grd.addColorStop(1, '#64748b');
  g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = grd; g.fill();
  g.strokeStyle = 'rgba(15,23,42,.8)'; g.lineWidth = .8; g.stroke();
}
function fanBlades(g, cx, cy, r, rot, col) {
  g.save(); g.translate(cx, cy); g.rotate(rot);
  g.fillStyle = col;
  for (let i = 0; i < 7; i++) {
    g.rotate(Math.PI * 2 / 7);
    g.beginPath(); g.moveTo(0, 0);
    g.quadraticCurveTo(r * .55, -r * .28, r * .94, -r * .1);
    g.quadraticCurveTo(r * .6, r * .18, 0, 0); g.fill();
  }
  g.restore();
  g.beginPath(); g.arc(cx, cy, r * .24, 0, 7); g.fillStyle = '#0b1220'; g.fill();
  g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1; g.stroke();
}
const PART_ART = {
  psu(g, t) {
    mgPanel(g, 8, 8, PW - 16, PH - 14, '#2b3441', '#111722', 'rgba(125,211,252,.25)');
    g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1;
    for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(14 + i * 4, 12); g.lineTo(14 + i * 4, PH - 12); g.stroke(); }
    const cx = PW * .62, cy = PH * .5, r = 15;
    g.beginPath(); g.arc(cx, cy, r + 3, 0, 7); g.fillStyle = '#0a0f17'; g.fill();
    g.strokeStyle = 'rgba(148,163,184,.4)'; g.lineWidth = 1; g.stroke();
    fanBlades(g, cx, cy, r, t * 1.6, 'rgba(56,189,248,.55)');
    rr(g, 14, PH - 22, 26, 9, 2); g.fillStyle = '#0f172a'; g.fill();
    g.strokeStyle = 'rgba(250,204,21,.5)'; g.stroke();
    mgLED(g, PW - 16, 16, 3, '#22c55e', true, Math.sin(t * 4));
  },
  mobo(g, t) {
    pcbBoard(g, 6, 6, PW - 12, PH - 10, '#12503a', '#08301f');
    g.strokeStyle = 'rgba(190,142,52,.55)'; g.lineWidth = .9;
    for (let i = 0; i < 6; i++) {
      g.beginPath(); g.moveTo(12 + i * 6, 10); g.lineTo(12 + i * 6, PH - 14); g.stroke();
    }
    g.beginPath(); g.moveTo(14, PH - 20); g.lineTo(PW - 16, PH - 20); g.stroke();
    // socket CPU
    rr(g, 30, 12, 26, 26, 2); g.fillStyle = '#0d1620'; g.fill();
    g.strokeStyle = '#c8952a'; g.lineWidth = 1.4; g.stroke();
    g.fillStyle = 'rgba(200,149,42,.5)';
    for (let i = 0; i < 5; i++) for (let k = 0; k < 5; k++) g.fillRect(33 + i * 4.6, 15 + k * 4.6, 2.2, 2.2);
    // DIMM
    for (let i = 0; i < 4; i++) { rr(g, 64, 10 + i * 7, 32, 4.5, 1); g.fillStyle = '#0b1d16'; g.fill(); g.strokeStyle = 'rgba(167,243,208,.35)'; g.lineWidth = .7; g.stroke(); }
    // PCIe x16
    rr(g, 14, PH - 30, 52, 7, 1.5); g.fillStyle = '#0b1d16'; g.fill();
    g.strokeStyle = '#a7f3d0'; g.lineWidth = 1; g.stroke();
    // chipset + tụ
    rr(g, 74, PH - 30, 16, 16, 2); g.fillStyle = '#1f2937'; g.fill();
    g.strokeStyle = 'rgba(125,211,252,.5)'; g.lineWidth = 1; g.stroke();
    cap(g, 20, 18, 3.4); cap(g, 20, 28, 3.4);
    mgTxt(g, 'LGA1700', 32, PH - 6, { size: 6.5, color: '#a7f3d0' });
    g.shadowColor = '#34d399'; g.shadowBlur = 8 + Math.sin(t * 2) * 4;
    g.strokeStyle = 'rgba(52,211,153,.6)'; g.lineWidth = 1.2; rr(g, 6, 6, PW - 12, PH - 10, 3); g.stroke(); g.shadowBlur = 0;
  },
  cpu(g, t) {
    rr(g, 22, 12, PW - 44, PH - 22, 3);
    const gd = g.createLinearGradient(22, 12, PW - 22, PH - 10);
    gd.addColorStop(0, '#b7c4d6'); gd.addColorStop(.5, '#7f8ea3'); gd.addColorStop(1, '#4b5768');
    g.fillStyle = gd; g.fill(); g.strokeStyle = '#cbd5e1'; g.lineWidth = 1.2; g.stroke();
    // nền mạch vàng
    rr(g, 18, 16, PW - 36, PH - 24, 2); g.strokeStyle = '#c8952a'; g.lineWidth = 2.4; g.stroke();
    g.fillStyle = 'rgba(200,149,42,.75)';
    for (let i = 0; i < 12; i++) g.fillRect(20 + i * 5.4, PH - 10, 3.4, 4);
    mgTxt(g, 'i9', PW / 2, PH / 2 + 2, { size: 11, color: 'rgba(226,232,240,.9)', align: 'center' });
    g.fillStyle = '#94a3b8'; g.beginPath(); g.moveTo(24, 18); g.lineTo(30, 18); g.lineTo(24, 24); g.closePath(); g.fill();
    g.shadowColor = '#38bdf8'; g.shadowBlur = 10 + Math.sin(t * 2.4) * 5;
    g.strokeStyle = 'rgba(56,189,248,.8)'; g.lineWidth = 1.4; rr(g, 18, 16, PW - 36, PH - 24, 2); g.stroke(); g.shadowBlur = 0;
  },
  paste(g, t) {
    rr(g, 14, 22, 62, 18, 8);
    const gd = g.createLinearGradient(0, 22, 0, 40);
    gd.addColorStop(0, '#e2e8f0'); gd.addColorStop(1, '#94a3b8');
    g.fillStyle = gd; g.fill(); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1; g.stroke();
    rr(g, 76, 26, 16, 10, 2); g.fillStyle = '#cbd5e1'; g.fill();
    g.beginPath(); g.moveTo(92, 31); g.lineTo(98, 29); g.lineTo(98, 33); g.closePath(); g.fillStyle = '#64748b'; g.fill();
    g.fillStyle = '#fca5a5'; rr(g, 20, 25, 30, 12, 5); g.fill();
    rr(g, 8, 18, 10, 26, 3); g.fillStyle = '#475569'; g.fill();
    mgTxt(g, 'TX-4', 34, 50, { size: 7, color: '#94a3b8', align: 'center' });
    g.shadowColor = '#f8fafc'; g.shadowBlur = 6;
    g.strokeStyle = 'rgba(248,250,252,.5)'; g.lineWidth = 1; rr(g, 14, 22, 62, 18, 8); g.stroke(); g.shadowBlur = 0;
  },
  cooler(g, t) {
    rr(g, 26, 8, 52, 40, 3); g.fillStyle = '#94a3b8'; g.fill();
    for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#c3cedb' : '#7c8a9b'; g.fillRect(27 + i * 4, 9, 3, 38); }
    g.strokeStyle = '#dbe4ee'; g.lineWidth = 1; rr(g, 26, 8, 52, 40, 3); g.stroke();
    // heatpipe
    g.strokeStyle = '#d9ad4b'; g.lineWidth = 3;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(30 + i * 18, 48); g.quadraticCurveTo(36 + i * 18, 56, 52 + i * 8, 56); g.stroke(); }
    const cx = 52, cy = 28, r = 17;
    g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fillStyle = 'rgba(15,23,42,.85)'; g.fill();
    fanBlades(g, cx, cy, r - 3, -t * 2.2, 'rgba(103,232,249,.7)');
    g.strokeStyle = `rgba(168,85,247,${.6 + .3 * Math.sin(t * 3)})`; g.lineWidth = 2;
    g.shadowColor = '#a855f7'; g.shadowBlur = 9; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); g.shadowBlur = 0;
  },
  ram(g, t) {
    pcbBoard(g, 8, 16, PW - 16, 30, '#0f3d2c', '#08251a');
    for (let i = 0; i < 6; i++) { rr(g, 14 + i * 13, 20, 10, 18, 1.4); g.fillStyle = '#0b1220'; g.fill(); g.strokeStyle = 'rgba(148,163,184,.35)'; g.lineWidth = .7; g.stroke(); }
    g.fillStyle = '#d9ad4b';
    for (let i = 0; i < 22; i++) g.fillRect(12 + i * 3.7, 46, 2.4, 5);
    rr(g, 8, 8, PW - 16, 9, 3);
    const hues = ['#f43f5e', '#f59e0b', '#22c55e', '#06b6d4', '#a855f7'];
    for (let i = 0; i < 10; i++) {
      const c = hues[(i + Math.floor(t * 3)) % hues.length];
      g.fillStyle = c; g.shadowColor = c; g.shadowBlur = 8;
      g.fillRect(11 + i * 8.2, 9.5, 7, 6);
    }
    g.shadowBlur = 0;
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; rr(g, 8, 8, PW - 16, 9, 3); g.stroke();
    // notch
    g.fillStyle = '#06110c'; g.fillRect(PW / 2 - 2, 44, 4, 8);
  },
  gpu(g, t) {
    rr(g, 6, 12, PW - 12, 38, 4);
    mgPanel(g, 6, 12, PW - 12, 38, '#2a3344', '#0e1520', 'rgba(56,189,248,.35)');
    // 2 quạt
    for (let i = 0; i < 2; i++) {
      const cx = 30 + i * 44, cy = 31, r = 16;
      g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fillStyle = '#080e16'; g.fill();
      fanBlades(g, cx, cy, r - 3, (i ? -1 : 1) * t * 2.4, 'rgba(148,163,184,.65)');
      g.strokeStyle = `rgba(34,211,238,${.5 + .35 * Math.sin(t * 3 + i)})`; g.lineWidth = 1.6;
      g.shadowColor = '#22d3ee'; g.shadowBlur = 8; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); g.shadowBlur = 0;
    }
    // backplate + giá đỡ
    g.fillStyle = '#1c2635'; g.fillRect(8, 50, PW - 16, 4);
    g.fillStyle = '#94a3b8'; g.fillRect(4, 14, 4, 34);
    g.fillStyle = '#0b1220'; for (let i = 0; i < 4; i++) g.fillRect(4, 18 + i * 7, 4, 3);
    // dải LED
    const grd = g.createLinearGradient(10, 0, PW - 10, 0);
    grd.addColorStop(0, '#a855f7'); grd.addColorStop(.5, '#22d3ee'); grd.addColorStop(1, '#22c55e');
    g.fillStyle = grd; g.shadowColor = '#22d3ee'; g.shadowBlur = 10; g.fillRect(10, 13, PW - 20, 2.6); g.shadowBlur = 0;
    mgTxt(g, 'RTX', 20, 47, { size: 7.5, color: '#67e8f9' });
  },
  storage(g, t) {
    pcbBoard(g, 10, 22, PW - 20, 18, '#132a44', '#0a1726');
    g.fillStyle = '#0b1220';
    for (let i = 0; i < 4; i++) { rr(g, 18 + i * 17, 25, 13, 12, 1.4); g.fill(); g.strokeStyle = 'rgba(125,211,252,.3)'; g.lineWidth = .7; g.stroke(); }
    g.fillStyle = '#d9ad4b';
    for (let i = 0; i < 16; i++) g.fillRect(14 + i * 4.7, 40, 3, 4);
    rr(g, 10, 22, 8, 18, 2); g.fillStyle = '#1f2937'; g.fill();
    g.strokeStyle = 'rgba(56,189,248,.7)'; g.lineWidth = 1.2;
    g.shadowColor = '#38bdf8'; g.shadowBlur = 7 + Math.sin(t * 4) * 4; g.stroke(); g.shadowBlur = 0;
    mgTxt(g, 'NVMe', 74, 18, { size: 7.5, color: '#7dd3fc' });
    g.fillStyle = '#22c55e'; g.fillRect(88, 26, 3, 3);
  }
};
function drawPartIcon(cv) {
  const id = cv.dataset.part;
  const art = PART_ART[id];
  if (!art) return;
  const g = mgFit(cv, PW, PH);
  g.save();
  if (cv.dataset.dim === '1') g.globalAlpha = .28;
  if (cv.dataset.ghost === '1') g.globalAlpha = .18;
  art(g, MGX.t);
  g.restore();
}

/* ============================================================
   4) WIFI SPECTRUM ANALYZER — parabola phát sáng 2.4 GHz + thang 5 GHz
   ============================================================ */
const WF = {
  W: 856, H: 262,
  gx0: 110, x0: 118, x1: 842,
  laneTop: 24, laneH: 52, laneGap: 4,
  axisY: 194, b5y: 236, b5h: 18
};
WF.step = (WF.x1 - WF.x0) / 12;
WF.laneY = i => WF.laneTop + i * (WF.laneH + WF.laneGap);
WF.chX = ch => WF.x0 + (ch - 1) * WF.step;
WF.hw = () => WF.step * 2.2;                 // búp sóng 22 MHz = 2,2 bước kênh
WF.col = ['#38bdf8', '#c084fc', '#fbbf24'];
WF.f5 = f => WF.x0 + (f - 5.15) / 0.7 * (WF.x1 - WF.x0);

/* Vẽ búp sóng dạng parabol: v = 1 - (d/hw)^2 */
function wfBell(g, cx, base, h, hw) {
  const N = 44;
  g.beginPath();
  for (let i = 0; i <= N; i++) {
    const d = -hw + (2 * hw * i) / N;
    const v = Math.max(0, 1 - (d / hw) * (d / hw));
    const x = cx + d, y = base - h * v;
    if (i) g.lineTo(x, y); else g.moveTo(x, y);
  }
}
/* Vùng chồng lấn giữa 2 lane (theo trục tần số) */
function wfOverlaps(ch) {
  const hw = WF.hw(), res = [];
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) {
    if (!ch[i] || !ch[j]) continue;
    const d = Math.abs(ch[i] - ch[j]) * WF.step;
    if (d >= 2 * hw) continue;
    const mid = (WF.chX(ch[i]) + WF.chX(ch[j])) / 2, ow = (2 * hw - d) / 2;
    res.push({ i, j, x0: mid - ow, x1: mid + ow, mid, delta: Math.abs(ch[i] - ch[j]) });
  }
  return res;
}
function wfRssi(ch, conf, i) {
  if (!ch) return null;
  return Math.round(-40 - conf * 11 - Math.abs(ch - 7) * 0.8 - (i % 2) * 2);
}

function drawWifi(cv, S) {
  const g = mgFit(cv, WF.W, WF.H), t = MGX.t;
  const hw = WF.hw(), base = WF.laneH - 9;
  const ov = wfOverlaps(S.ch);
  const confN = [0, 0, 0];
  ov.forEach(o => { confN[o.i]++; confN[o.j]++; });

  // --- nền + khung dao động ký ---
  const bgg = g.createLinearGradient(0, 0, 0, WF.H);
  bgg.addColorStop(0, '#0a1420'); bgg.addColorStop(1, '#060c14');
  g.fillStyle = bgg; g.fillRect(0, 0, WF.W, WF.H);
  mgTxt(g, '2.4 GHz ISM · 802.11b/g/n · băng thông kênh 22 MHz', 14, 17, { size: 9.5, color: '#7dd3fc', glow: '#0ea5e9', glowSize: 7 });
  mgTxt(g, 'RSSI (dBm)', WF.x0 - 8, 17, { size: 8, color: '#4d6172', align: 'right' });
  mgTxt(g, S.clean ? '◉ SWEEP · CLEAN' : '◉ SWEEP · LIVE', WF.W - 14, 17, { size: 8.5, color: S.clean ? '#4ade80' : '#64748b', align: 'right', glow: S.clean ? '#22c55e' : null, glowSize: 8 });

  // --- 3 lane AP ---
  for (let i = 0; i < 3; i++) {
    const y = WF.laneY(i), ch = S.ch[i], col = WF.col[i];
    const bad = confN[i] > 0, lit = S.clean;
    rr(g, WF.gx0, y, WF.W - WF.gx0 - 12, WF.laneH, 8);
    const lg = g.createLinearGradient(0, y, 0, y + WF.laneH);
    lg.addColorStop(0, lit ? '#0c2018' : (bad ? '#1c1016' : '#0d1723'));
    lg.addColorStop(1, '#070d15');
    g.fillStyle = lg; g.fill();
    g.strokeStyle = lit ? 'rgba(34,197,94,.5)' : (bad ? 'rgba(239,68,68,.45)' : 'rgba(120,160,200,.2)');
    g.lineWidth = 1.1; g.stroke();

    // lưới kênh + thang dBm
    g.save(); rr(g, WF.gx0, y, WF.W - WF.gx0 - 12, WF.laneH, 8); g.clip();
    for (let c = 1; c <= 13; c++) {
      g.strokeStyle = c === ch ? 'rgba(125,211,252,.22)' : 'rgba(120,160,200,.08)';
      g.lineWidth = 1; g.beginPath(); g.moveTo(WF.chX(c), y + 3); g.lineTo(WF.chX(c), y + WF.laneH - 3); g.stroke();
    }
    [0.34, 0.66].forEach(k => {
      g.strokeStyle = 'rgba(120,160,200,.1)'; g.setLineDash([3, 5]); g.beginPath();
      g.moveTo(WF.gx0, y + base * (1 - k)); g.lineTo(WF.W - 14, y + base * (1 - k)); g.stroke(); g.setLineDash([]);
    });
    g.restore();

    // sàn nhiễu + đường quét
    g.strokeStyle = 'rgba(120,160,200,.25)'; g.lineWidth = 1;
    g.beginPath();
    for (let x = WF.gx0 + 2; x < WF.W - 14; x += 6)
      g.lineTo(x, y + base - Math.sin(x * .07 + i * 2) * 1.6 - Math.sin(x * .31) * 1.1);
    g.stroke();

    if (!ch) {
      // chưa phát sóng: đường flat + hướng dẫn
      g.setLineDash([7, 6]); g.strokeStyle = 'rgba(148,163,184,.4)'; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(WF.chX(1) - hw, y + base); g.lineTo(WF.chX(13) + hw, y + base); g.stroke(); g.setLineDash([]);
      mgTxt(g, 'CHƯA PHÁT SÓNG · click vào lane để chọn kênh', (WF.x0 + WF.x1) / 2, y + WF.laneH / 2 + 3, { size: 9.5, color: '#43586c', align: 'center' });
    } else {
      const cx = WF.chX(ch), h = base - 8, cc = lit ? '#22c55e' : col;
      // footprint 22 MHz
      rr(g, cx - hw, y + base - 3, hw * 2, 5, 2);
      g.fillStyle = alphaC(cc, .35); g.fill();
      g.strokeStyle = alphaC(cc, .6); g.lineWidth = 1; g.stroke();
      // búp sóng
      const draw = (color, fillA) => {
        wfBell(g, cx, y + base, h, hw);
        const fg = g.createLinearGradient(0, y + base - h, 0, y + base);
        fg.addColorStop(0, alphaC(color, fillA)); fg.addColorStop(.75, alphaC(color, fillA * .28)); fg.addColorStop(1, alphaC(color, .02));
        g.lineTo(cx + hw, y + base); g.lineTo(cx - hw, y + base); g.closePath();
        g.fillStyle = fg; g.fill();
        wfBell(g, cx, y + base, h, hw);
        g.strokeStyle = color; g.lineWidth = 2.3;
        g.shadowColor = color; g.shadowBlur = 12 + Math.sin(t * 2.4 + i) * 5; g.stroke(); g.shadowBlur = 0;
        wfBell(g, cx, y + base, h * .82, hw * .82);
        g.strokeStyle = alphaC(lighten(color, .5), .55); g.lineWidth = 1; g.stroke();
      };
      draw(lit ? '#22c55e' : col, .5);
      // phần chồng lấn → đỏ
      ov.filter(o => o.i === i || o.j === i).forEach(o => {
        g.save(); g.beginPath(); g.rect(o.x0, y, o.x1 - o.x0, WF.laneH); g.clip();
        draw('#ef4444', .55);
        g.restore();
        g.strokeStyle = 'rgba(239,68,68,.22)'; g.lineWidth = 1;
        for (let x = o.x0; x < o.x1; x += 7) { g.beginPath(); g.moveTo(x, y + 4); g.lineTo(x - 8, y + WF.laneH - 4); g.stroke(); }
      });
      // đỉnh + cờ kênh (nằm trong lane)
      const pk = { x: cx, y: y + base - h };
      rr(g, pk.x - 16, pk.y + 5, 32, 14, 4);
      g.fillStyle = lit ? '#0d2b1a' : '#0c1a2a'; g.fill();
      g.strokeStyle = lit ? '#22c55e' : (bad ? '#ef4444' : alphaC(col, .85)); g.lineWidth = 1.3; g.stroke();
      mgTxt(g, 'CH ' + ch, pk.x, pk.y + 15, { size: 9, color: lit ? '#4ade80' : (bad ? '#fca5a5' : lighten(col, .35)), align: 'center' });
      mgLED(g, pk.x, pk.y + 1, 3.2, lit ? '#22c55e' : col, true, Math.sin(t * 3 + i));
    }

    // con trỏ rê chuột
    const hv = MGX.wf && MGX.wf.in && MGX.wf.ap === i ? MGX.wf : null;
    if (hv && !S.clean) {
      const hx = WF.chX(hv.ch);
      g.fillStyle = 'rgba(250,204,21,.07)'; g.fillRect(hx - hw, y + 2, hw * 2, WF.laneH - 4);
      g.setLineDash([4, 4]); g.strokeStyle = 'rgba(250,204,21,.6)'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(hx, y + 3); g.lineTo(hx, y + WF.laneH - 3); g.stroke(); g.setLineDash([]);
      mgTxt(g, 'CH ' + hv.ch, hx, y + 12, { size: 8.5, color: '#facc15', align: 'center', glow: '#facc15', glowSize: 8 });
    }

    // --- gutter trái: AP + RSSI ---
    rr(g, 8, y + 3, 96, WF.laneH - 6, 7);
    g.fillStyle = '#0b1420'; g.fill();
    g.strokeStyle = alphaC(bad ? '#ef4444' : (lit ? '#22c55e' : col), .5); g.lineWidth = 1; g.stroke();
    g.fillStyle = bad ? '#ef4444' : (lit ? '#22c55e' : col);
    g.shadowColor = g.fillStyle; g.shadowBlur = 8; g.fillRect(11, y + 7, 3, WF.laneH - 14); g.shadowBlur = 0;
    const rssi = wfRssi(ch, confN[i], i);
    mgTxt(g, S.aps[i].name, 20, y + 16, { size: 10, color: '#dbeafe' });
    mgTxt(g, S.aps[i].loc, 20, y + 26, { size: 7.5, color: '#5b7288' });
    mgTxt(g, ch ? `CH ${ch}` : 'CH —', 20, y + 36, { size: 9, color: ch ? (bad ? '#fca5a5' : '#7dd3fc') : '#3d5064' });
    mgTxt(g, rssi == null ? '— dBm' : `${rssi} dBm`, 20, y + 45, { size: 8, color: rssi == null ? '#64748b' : (bad ? '#f87171' : (rssi < -65 ? '#fbbf24' : '#4ade80')) });
    // nhãn trạng thái phải (có nền để đọc được đè lên búp sóng)
    const st = bad ? '⚠ NHIỄU ' + confN[i] : (S.clean ? '✔ SẠCH' : (ch ? 'ỔN ĐỊNH' : '◌ CHỜ'));
    const sw = st.length * 5.6 + 14, sx2 = WF.W - 14 - sw;
    rr(g, sx2, y + 5, sw, 16, 5);
    g.fillStyle = 'rgba(6,12,20,.85)'; g.fill();
    g.strokeStyle = bad ? 'rgba(239,68,68,.6)' : (S.clean ? 'rgba(34,197,94,.6)' : 'rgba(120,150,180,.28)');
    g.lineWidth = 1; g.stroke();
    mgTxt(g, st, sx2 + sw / 2, y + 16, { size: 8, align: 'center', color: bad ? '#f87171' : (S.clean ? '#4ade80' : '#64748b'), glow: bad || S.clean ? (S.clean ? '#22c55e' : '#ef4444') : null, glowSize: 8 });
  }

  // --- nối 2 lane bị chồng kênh ---
  ov.forEach(o => {
    const ya = WF.laneY(o.i) + WF.laneH, yb = WF.laneY(o.j);
    g.strokeStyle = 'rgba(239,68,68,.75)'; g.lineWidth = 1.6; g.setLineDash([4, 3]);
    g.beginPath(); g.moveTo(o.mid, ya); g.lineTo(o.mid, yb); g.stroke(); g.setLineDash([]);
    mgTxt(g, `Δ${o.delta} CH · TRÙNG KÊNH`, o.mid, (ya + yb) / 2 + 3, { size: 7.5, color: '#fecaca', align: 'center', glow: '#ef4444', glowSize: 9 });
  });

  // --- đường quét phân tích ---
  const sx = WF.x0 - hw + ((t * 96) % (WF.x1 - WF.x0 + hw * 2));
  const sg = g.createLinearGradient(sx - 22, 0, sx, 0);
  sg.addColorStop(0, 'rgba(103,232,249,0)'); sg.addColorStop(1, 'rgba(103,232,249,.16)');
  g.fillStyle = sg; g.fillRect(sx - 22, WF.laneTop, 22, WF.laneY(2) + WF.laneH - WF.laneTop);
  g.strokeStyle = 'rgba(103,232,249,.5)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(sx, WF.laneTop); g.lineTo(sx, WF.laneY(2) + WF.laneH); g.stroke();

  // --- thang kênh 2.4 GHz ---
  g.strokeStyle = 'rgba(125,160,195,.35)'; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(8, WF.axisY); g.lineTo(WF.W - 8, WF.axisY); g.stroke();
  for (let c = 1; c <= 13; c++) {
    const x = WF.chX(c), rec = c === 1 || c === 6 || c === 11;
    const hv = MGX.wf && MGX.wf.in && MGX.wf.ch === c;
    g.strokeStyle = hv ? '#facc15' : (rec ? '#22c55e' : 'rgba(125,160,195,.4)');
    g.lineWidth = hv ? 2 : 1.2;
    g.beginPath(); g.moveTo(x, WF.axisY); g.lineTo(x, WF.axisY + (rec ? 7 : 5)); g.stroke();
    rr(g, x - 8, WF.axisY + 8, 16, 13, 3);
    g.fillStyle = hv ? 'rgba(250,204,21,.18)' : (rec ? 'rgba(34,197,94,.14)' : 'rgba(255,255,255,.03)'); g.fill();
    mgTxt(g, String(c), x, WF.axisY + 18, { size: 8.5, align: 'center', color: hv ? '#facc15' : (rec ? '#4ade80' : '#6b8199') });
  }
  mgTxt(g, '2412–2472 MHz', 10, WF.axisY + 9, { size: 7, color: '#4d6172' });
  mgTxt(g, '1·6·11 = sạch', 10, WF.axisY + 19, { size: 7, color: '#3f8f5f' });

  // --- thang 5 GHz (tham khảo) ---
  mgTxt(g, '5 GHz', 14, WF.b5y - 6, { size: 8.5, color: '#a78bfa', glow: '#8b5cf6', glowSize: 7 });
  mgTxt(g, '25 kênh 20 MHz · không chồng lấn · dải này chỉ tham khảo, ải này quy hoạch 2.4 GHz', WF.W - 14, WF.b5y - 6, { size: 7.5, color: '#4d6172', align: 'right' });
  [[5.17, 5.35, 'U-NII-1 · 36-64', 36], [5.47, 5.71, 'U-NII-2 · 100-144', 100], [5.735, 5.835, 'U-NII-3 · 149-165', 149]]
    .forEach(([a, b, nm, fc], k) => {
      const x = WF.f5(a), w = WF.f5(b) - x, y = WF.b5y, base = y + WF.b5h, cx = x + w * .62;
      rr(g, x, y, w, WF.b5h, 4);
      g.fillStyle = 'rgba(139,92,246,.1)'; g.fill();
      g.strokeStyle = 'rgba(139,92,246,.4)'; g.lineWidth = 1; g.stroke();
      g.save(); rr(g, x, y, w, WF.b5h, 4); g.clip();
      wfBell(g, cx, base, 11, 26);
      g.lineTo(cx + 26, base); g.lineTo(cx - 26, base); g.closePath();
      g.fillStyle = alphaC(WF.col[k], .3); g.fill();
      wfBell(g, cx, base, 11, 26);
      g.strokeStyle = WF.col[k]; g.lineWidth = 1.5; g.shadowColor = WF.col[k]; g.shadowBlur = 7; g.stroke(); g.shadowBlur = 0;
      g.restore();
      mgTxt(g, nm, x + 6, y + 8, { size: 6.5, color: '#8fa3ba' });
      mgTxt(g, `AP-0${k + 1} · CH ${fc}`, x + w - 6, base - 3, { size: 6.5, align: 'right', color: lighten(WF.col[k], .25) });
    });

  if (S.clean) {
    g.strokeStyle = `rgba(34,197,94,${.4 + .3 * Math.sin(t * 4)})`; g.lineWidth = 2;
    g.shadowColor = '#22c55e'; g.shadowBlur = 14;
    rr(g, WF.gx0 - 2, WF.laneTop - 4, WF.W - WF.gx0 - 8, WF.laneY(2) + WF.laneH - WF.laneTop + 8, 10); g.stroke();
    g.shadowBlur = 0;
  }
  mgDrawFx(g, 'wf-cv');
}
function wfHit(cv, ev) {
  const p = mgPoint(cv, ev, WF.W, WF.H);
  for (let i = 0; i < 3; i++) {
    if (p.y < WF.laneY(i) || p.y > WF.laneY(i) + WF.laneH) continue;
    if (p.x < WF.x0 - WF.hw() - 10 || p.x > WF.x1 + WF.hw() + 10) continue;
    const ch = Math.max(1, Math.min(13, Math.round((p.x - WF.x0) / WF.step) + 1));
    return { ap: i, ch };
  }
  return null;
}

/* ============================================================
   5) TRACEROUTE TOPOLOGY — PC → router → BRAS → core → Internet
   ============================================================ */
const TR = {
  W: 856, H: 226,
  ny: 66, nx: k => 66 + k * 181,
  cardY: 132, cardH: 70, cardW: 154, cardX: k => 14 + k * 168
};
function trIcon(g, kind, cx, cy, s, lit, col) {
  const c = lit ? col : '#3c4d61';
  g.lineJoin = 'round';
  if (kind === 'pc') {
    rr(g, cx - s * 1.15, cy - s * .8, s * 2.3, s * 1.5, 3);
    g.fillStyle = lit ? '#132334' : '#0d151f'; g.fill();
    g.strokeStyle = c; g.lineWidth = 1.8; g.stroke();
    rr(g, cx - s * .88, cy - s * .6, s * 1.76, s * .95, 2);
    g.fillStyle = lit ? alphaC(col, .3) : 'rgba(255,255,255,.04)'; g.fill();
    g.fillStyle = c; g.fillRect(cx - s * .3, cy + s * .72, s * .6, s * .3);
    g.fillRect(cx - s * .6, cy + s * 1.0, s * 1.2, s * .18);
  } else if (kind === 'router' || kind === 'core') {
    const w = kind === 'core' ? s * 2.5 : s * 2.1;
    rr(g, cx - w / 2, cy - s * .35, w, s * 1.05, 4);
    const bg = g.createLinearGradient(0, cy - s * .35, 0, cy + s * .7);
    bg.addColorStop(0, lit ? '#1c3348' : '#111b26'); bg.addColorStop(1, '#080e15');
    g.fillStyle = bg; g.fill(); g.strokeStyle = c; g.lineWidth = 1.8; g.stroke();
    g.strokeStyle = c; g.lineWidth = 1.6;
    [-1, 1].forEach(d => {
      g.beginPath(); g.moveTo(cx + d * w * .3, cy - s * .35); g.lineTo(cx + d * w * .38, cy - s * 1.05); g.stroke();
      g.beginPath(); g.arc(cx + d * w * .38, cy - s * 1.15, 2.2, 0, 7); g.fillStyle = c; g.fill();
    });
    const n = kind === 'core' ? 5 : 3, pw = Math.max(3, w * .12), pad = w * .1;
    const step = (w - pad * 2 - pw) / (n - 1), ph = Math.max(3, s * .35);
    for (let i = 0; i < n; i++) {
      g.fillStyle = lit ? '#d9ad4b' : '#2b3947';
      g.fillRect(cx - w / 2 + pad + i * step, cy + s * .18, pw, ph);
    }
  } else if (kind === 'bras') {
    rr(g, cx - s * .95, cy - s * .95, s * 1.9, s * 1.9, 4);
    g.fillStyle = '#0c1520'; g.fill(); g.strokeStyle = c; g.lineWidth = 1.8; g.stroke();
    for (let i = 0; i < 3; i++) {
      rr(g, cx - s * .74, cy - s * .7 + i * s * .52, s * 1.48, s * .38, 2);
      g.fillStyle = lit ? 'rgba(56,189,248,.16)' : 'rgba(255,255,255,.04)'; g.fill();
      g.fillStyle = lit ? '#22c55e' : '#2b3947';
      g.fillRect(cx + s * .5, cy - s * .62 + i * s * .52, 4, 3);
    }
  } else {
    // đám mây Internet
    g.beginPath();
    g.arc(cx - s * .62, cy + s * .1, s * .55, Math.PI * .5, Math.PI * 1.5);
    g.arc(cx - s * .18, cy - s * .42, s * .6, Math.PI, Math.PI * 1.85);
    g.arc(cx + s * .5, cy - s * .12, s * .55, Math.PI * 1.3, Math.PI * .1);
    g.arc(cx + s * .62, cy + s * .28, s * .4, Math.PI * 1.75, Math.PI * .5);
    g.closePath();
    const cg = g.createLinearGradient(0, cy - s, 0, cy + s);
    cg.addColorStop(0, lit ? 'rgba(56,189,248,.32)' : 'rgba(148,163,184,.08)');
    cg.addColorStop(1, 'rgba(8,14,22,.9)');
    g.fillStyle = cg; g.fill(); g.strokeStyle = c; g.lineWidth = 1.8; g.stroke();
    g.strokeStyle = lit ? alphaC(col, .8) : 'rgba(255,255,255,.1)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(cx - s * .5, cy + s * .04); g.lineTo(cx + s * .35, cy + s * .04); g.stroke();
  }
}
function drawTrace(cv, S) {
  const g = mgFit(cv, TR.W, TR.H), t = MGX.t;
  const bgg = g.createLinearGradient(0, 0, 0, TR.H);
  bgg.addColorStop(0, '#0a1420'); bgg.addColorStop(1, '#060c14');
  g.fillStyle = bgg; g.fillRect(0, 0, TR.W, TR.H);

  const done = S.out.length, full = done === S.hops.length;
  mgTxt(g, 'tracert ' + S.hops[S.hops.length - 1].ip, 14, 16, { size: 9.5, color: '#7dd3fc', glow: '#0ea5e9', glowSize: 7 });
  mgTxt(g, `HOP ${done}/${S.hops.length} · TTL 255 · MTU 1500`, TR.W - 14, 16, { size: 8.5, color: '#64748b', align: 'right' });

  // khung Internet (ISP → WAN)
  const ix0 = TR.nx(2) - 46, ix1 = TR.nx(4) + 46;
  g.setLineDash([6, 5]); g.strokeStyle = 'rgba(125,211,252,.28)'; g.lineWidth = 1.2;
  rr(g, ix0, 22, ix1 - ix0, 96, 12); g.stroke(); g.setLineDash([]);
  mgTxt(g, 'ISP BACKBONE · INTERNET', ix0 + 8, 18, { size: 7.5, color: '#4d6172' });

  // --- liên kết + packet ---
  for (let k = 0; k < S.hops.length - 1; k++) {
    const xa = TR.nx(k) + 30, xb = TR.nx(k + 1) - 30;
    const litLink = done > k + 1, nxt = done === k + 1;
    g.strokeStyle = litLink ? 'rgba(34,197,94,.65)' : (nxt ? 'rgba(250,204,21,.35)' : 'rgba(120,150,180,.2)');
    g.lineWidth = litLink ? 2.6 : 1.6;
    if (!litLink) g.setLineDash([7, 6]);
    g.beginPath(); g.moveTo(xa, TR.ny); g.lineTo(xb, TR.ny); g.stroke(); g.setLineDash([]);
    if (litLink) {
      g.shadowColor = '#22c55e'; g.shadowBlur = 8;
      g.strokeStyle = 'rgba(74,222,128,.75)'; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(xa, TR.ny); g.lineTo(xb, TR.ny); g.stroke(); g.shadowBlur = 0;
      // 2 packet đi + 1 packet hồi đáp
      for (let p = 0; p < 3; p++) {
        const fwd = p < 2, u = ((t * .7 + k * .27 + p * .37) % 1);
        const px = fwd ? xa + (xb - xa) * u : xb - (xb - xa) * u;
        const col = fwd ? '#67e8f9' : '#4ade80';
        const tg = g.createLinearGradient(px - (fwd ? 16 : -16), 0, px, 0);
        tg.addColorStop(0, 'rgba(103,232,249,0)'); tg.addColorStop(1, alphaC(col, .7));
        g.strokeStyle = tg; g.lineWidth = 2.4;
        g.beginPath(); g.moveTo(px - (fwd ? 16 : -16), TR.ny); g.lineTo(px, TR.ny); g.stroke();
        g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 11;
        g.beginPath(); g.arc(px, TR.ny, 3, 0, 7); g.fill(); g.shadowBlur = 0;
      }
    } else if (nxt) {
      const u = (t * .5) % 1;
      const px = xa + (xb - xa) * u;
      g.globalAlpha = .8 - u * .8;
      g.fillStyle = '#facc15'; g.shadowColor = '#facc15'; g.shadowBlur = 10;
      g.beginPath(); g.arc(px, TR.ny, 2.6, 0, 7); g.fill(); g.shadowBlur = 0; g.globalAlpha = 1;
      g.fillStyle = 'rgba(250,204,21,.5)';
      g.beginPath(); g.moveTo(xb, TR.ny); g.lineTo(xb - 7, TR.ny - 4.5); g.lineTo(xb - 7, TR.ny + 4.5); g.closePath(); g.fill();
    }
  }

  // --- 5 node ---
  for (let k = 0; k < S.hops.length; k++) {
    const x = TR.nx(k), seated = k < done, next = k === done;
    const col = full ? '#22c55e' : '#38bdf8';
    if (seated || next) {
      const hg = g.createRadialGradient(x, TR.ny, 4, x, TR.ny, 40);
      hg.addColorStop(0, alphaC(seated ? col : '#facc15', .22)); hg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = hg; g.beginPath(); g.arc(x, TR.ny, 40, 0, 7); g.fill();
    }
    rr(g, x - 30, TR.ny - 24, 60, 48, 9);
    g.fillStyle = seated ? '#0f1e2c' : 'rgba(10,17,26,.75)'; g.fill();
    g.strokeStyle = seated ? alphaC(col, .85) : (next ? `rgba(250,204,21,${.55 + .35 * Math.sin(t * 4)})` : 'rgba(120,150,180,.28)');
    g.lineWidth = seated || next ? 1.8 : 1.2;
    if (seated) { g.shadowColor = col; g.shadowBlur = 12; }
    g.stroke(); g.shadowBlur = 0;
    trIcon(g, S.kinds[k], x, TR.ny, 13, seated, col);
    // badge hop
    g.beginPath(); g.arc(x - 30, TR.ny - 24, 10, 0, 7);
    g.fillStyle = seated ? col : '#16222f'; g.fill();
    g.strokeStyle = seated ? '#e6fff2' : 'rgba(120,150,180,.4)'; g.lineWidth = 1.4; g.stroke();
    mgTxt(g, seated ? String(k + 1) : '?', x - 30, TR.ny - 20.5, { size: 9.5, align: 'center', color: seated ? '#04120a' : '#64748b' });
    // tên + IP
    mgTxt(g, S.hops[k].n, x, TR.ny + 34, { size: 8.5, align: 'center', color: seated ? '#dbeafe' : '#3d5064' });
    mgTxt(g, seated ? S.hops[k].ip : '· · ·', x, TR.ny + 45, { size: 7.5, align: 'center', color: seated ? '#67e8f9' : '#33455a' });
    // chip ms
    rr(g, x - 22, TR.ny - 41, 44, 15, 4);
    g.fillStyle = seated ? 'rgba(245,158,11,.14)' : 'rgba(255,255,255,.03)'; g.fill();
    g.strokeStyle = seated ? 'rgba(245,158,11,.6)' : 'rgba(120,150,180,.2)'; g.lineWidth = 1; g.stroke();
    mgTxt(g, seated ? S.hops[k].ms : '-- ms', x, TR.ny - 30, { size: 8, align: 'center', color: seated ? '#fbbf24' : '#3d5064', glow: seated ? '#f59e0b' : null, glowSize: 6 });
    if (next) mgTxt(g, 'HOP KẾ TIẾP', x, TR.ny + 57, { size: 7.5, align: 'center', color: '#facc15', glow: '#facc15', glowSize: 8 });
  }

  // --- hàng thẻ thiết bị (thứ tự đảo) ---
  S.disp.forEach((idx, k) => {
    const x = TR.cardX(k), y = TR.cardY, w = TR.cardW, h = TR.cardH;
    const used = idx < done;
    const wrong = S.errIdx === idx && t - S.errT < .5;
    const shake = wrong ? Math.sin((t - S.errT) * 60) * 4 : 0;
    g.save(); g.translate(shake, 0);
    rr(g, x, y, w, h, 10);
    const cg = g.createLinearGradient(0, y, 0, y + h);
    cg.addColorStop(0, used ? '#0a121b' : '#141f2c'); cg.addColorStop(1, '#0a1017');
    g.fillStyle = cg; g.fill();
    g.strokeStyle = wrong ? '#ef4444' : (used ? 'rgba(34,197,94,.5)' : 'rgba(120,170,220,.32)');
    g.lineWidth = wrong ? 2 : 1.3;
    if (wrong) { g.shadowColor = '#ef4444'; g.shadowBlur = 14; }
    g.stroke(); g.shadowBlur = 0;
    g.globalAlpha = used ? .38 : 1;
    trIcon(g, S.kinds[idx], x + 24, y + h / 2 - 6, 9, !used, '#7dd3fc');
    mgTxt(g, String.fromCharCode(65 + k), x + 8, y + 12, { size: 7.5, color: used ? '#4ade80' : '#58a6ff' });
    mgTxt(g, fitTxt(g, S.hops[idx].n, w - 52, 9), x + 44, y + 24, { size: 9, color: used ? '#64748b' : '#e2e8f0' });
    mgTxt(g, S.hops[idx].ip, x + 44, y + 36, { size: 8, color: used ? '#475569' : '#67e8f9' });
    mgTxt(g, S.hops[idx].ms, x + 44, y + 47, { size: 8, color: used ? '#475569' : '#fbbf24' });
    if (used) mgTxt(g, '✔ ĐÃ ĐI QUA', x + 8, y + h - 8, { size: 7.5, color: '#4ade80' });
    else mgTxt(g, 'click để xác nhận', x + 8, y + h - 8, { size: 7.5, color: '#42586e' });
    g.restore();
  });

  // hover
  const hv = MGX.tr && MGX.tr.in ? MGX.tr.k : -1;
  if (hv >= 0 && hv < S.disp.length && S.disp[hv] >= done) {
    const x = TR.cardX(hv), y = TR.cardY;
    g.strokeStyle = '#facc15'; g.lineWidth = 1.6; rr(g, x - 2, y - 2, TR.cardW + 4, TR.cardH + 4, 12); g.stroke();
  }

  if (full) {
    mgTxt(g, '✔ ĐƯỜNG ĐI XÁC ĐỊNH — 5 hop, 0% mất gói, RTT ' + S.hops[4].ms, TR.W / 2, TR.H - 6,
      { size: 9, color: '#4ade80', align: 'center', glow: '#22c55e', glowSize: 12 });
  } else {
    mgTxt(g, 'Chọn đúng thẻ thiết bị kế tiếp trên đường ra Internet — vị trí 5 thẻ được xáo trộn ngẫu nhiên, không có số hop nào in sẵn.',
      TR.W / 2, TR.H - 6, { size: 8, color: '#5b7288', align: 'center' });
  }
  mgDrawFx(g, 'tr-cv');
}
function traceHit(cv, ev) {
  const p = mgPoint(cv, ev, TR.W, TR.H);
  if (p.y < TR.cardY || p.y > TR.cardY + TR.cardH) return null;
  for (let k = 0; k < 5; k++) {
    const x = TR.cardX(k);
    if (p.x >= x && p.x <= x + TR.cardW) return k;
  }
  return null;
}

/* ============================================================
   5) BOSS — ĐẠI SỰ CỐ: báo động đỏ Data Center, 3 pha liên hoàn
   ============================================================ */
const BS = {
  W: 856, H: 202,
  p1: { n: 24, cols: 12, x0: 32, pitch: 49, pw: 40, ph: 24, rowY: r => 84 + r * 46,
        panX: 14, panY: 30, panW: 634, panH: 148, infoX: 660 },
  p2: { chipX: k => 18 + k * 105, chipW: 98, chipY: 12, chipH: 42,
        chX: i => 44 + i * 42, chW: 34, chTop: 86, chBot: 158,
        headX: 28, headW: 348, testX: 400 },
  p3: { rowY: k => 88 + k * 21, destX: 26, slotX: 512, slotW: 306,
        chipX: k => 18 + k * 138, chipW: 130, chipY: 170, chipH: 26 }
};
const VIC = { W: 856, H: 246 };

/* --- khung báo động đỏ: đèn còi + vệt quét + viền đỏ --- */
function bsAlertFrame(g, t, level) {
  const beat = Math.pow(Math.max(0, Math.sin(t * 3.6)), 6);
  const hot = level > 0 ? level : 0;
  g.save();
  const vg = g.createLinearGradient(0, 0, 0, BS.H);
  vg.addColorStop(0, `rgba(239,68,68,${.1 + .12 * beat * (1 + hot)})`);
  vg.addColorStop(.45, 'rgba(239,68,68,0)');
  vg.addColorStop(1, `rgba(239,68,68,${.05 + .08 * beat})`);
  g.fillStyle = vg; g.fillRect(0, 0, BS.W, BS.H);
  for (let y = 6 + ((t * 26) % 8); y < BS.H; y += 8) {
    g.fillStyle = 'rgba(255,255,255,.018)'; g.fillRect(0, y, BS.W, 1.4);
  }
  g.restore();
  [16, BS.W - 16].forEach((x, i) => {
    const on = beat * (i ? .85 : 1);
    if (on > .04) {
      const rg = g.createRadialGradient(x, 12, 2, x, 12, 58);
      rg.addColorStop(0, `rgba(255,90,90,${.5 * on})`); rg.addColorStop(1, 'rgba(255,90,90,0)');
      g.fillStyle = rg; g.beginPath(); g.arc(x, 12, 58, 0, 7); g.fill();
      g.save(); g.translate(x, 12); g.rotate((i ? Math.PI : 0) + Math.sin(t * 1.6) * .5);
      const bg = g.createLinearGradient(0, 0, 190, 0);
      bg.addColorStop(0, `rgba(255,120,120,${.22 * on})`); bg.addColorStop(1, 'rgba(255,120,120,0)');
      g.fillStyle = bg; g.beginPath(); g.moveTo(0, 0); g.lineTo(190, -34); g.lineTo(190, 34); g.closePath(); g.fill();
      g.restore();
    }
    mgLED(g, x, 12, 4.4, '#ef4444', true, beat);
  });
  g.strokeStyle = `rgba(239,68,68,${.3 + .45 * beat})`; g.lineWidth = 2;
  rr(g, 1, 1, BS.W - 2, BS.H - 2, 9); g.stroke();
}

/* --- PHA 1: bảng switch + broadcast storm, chọn cổng loop để shutdown --- */
function bsPort(g, x, y, st, sel, hov, t) {
  const w = BS.p1.pw, h = BS.p1.ph;
  rr(g, x - w / 2, y - h / 2, w, h, 3);
  const bgc = g.createLinearGradient(0, y - h / 2, 0, y + h / 2);
  bgc.addColorStop(0, st === 'down' ? '#160d10' : '#0a1219'); bgc.addColorStop(1, '#05090e');
  g.fillStyle = bgc; g.fill();
  g.strokeStyle = st === 'loop' ? `rgba(239,68,68,${.7 + .3 * Math.sin(t * 9)})`
    : st === 'busy' ? 'rgba(245,158,11,.65)'
      : st === 'down' ? 'rgba(120,130,150,.5)' : 'rgba(110,150,190,.34)';
  g.lineWidth = st === 'loop' ? 2 : 1.2;
  if (st === 'loop') { g.shadowColor = '#ef4444'; g.shadowBlur = 12; }
  g.stroke(); g.shadowBlur = 0;
  const pinCol = st === 'down' ? '#3a2f2f' : (st === 'loop' ? '#f87171' : '#c8952a');
  g.fillStyle = pinCol;
  for (let k = 0; k < 8; k++) g.fillRect(x - w / 2 + 5 + k * 4, y - h / 2 + 4, 2.2, 8);
  rr(g, x - 6, y + 2, 12, 7, 1.4); g.fillStyle = '#05090e'; g.fill();
  const led = st === 'down' ? '#1e2b3a' : st === 'loop' ? '#ef4444' : st === 'busy' ? '#f59e0b' : '#22c55e';
  mgLED(g, x, y - h / 2 - 6, 2.6, led, st !== 'down', st === 'loop' ? Math.sin(t * 12) : Math.sin(t * 3));
  if (sel) {
    g.strokeStyle = '#facc15'; g.lineWidth = 2.2; rr(g, x - w / 2 - 3, y - h / 2 - 10, w + 6, h + 13, 5); g.stroke();
  } else if (hov) {
    g.strokeStyle = 'rgba(250,204,21,.55)'; g.lineWidth = 1.4; g.setLineDash([4, 3]);
    rr(g, x - w / 2 - 3, y - h / 2 - 10, w + 6, h + 13, 5); g.stroke(); g.setLineDash([]);
  }
  if (st === 'down') {
    g.strokeStyle = 'rgba(248,113,113,.8)'; g.lineWidth = 1.8;
    g.beginPath(); g.moveTo(x - 7, y - 6); g.lineTo(x + 7, y + 6); g.moveTo(x + 7, y - 6); g.lineTo(x - 7, y + 6); g.stroke();
  }
}

function drawBossStorm(g, S, t) {
  const P = BS.p1;
  mgPanel(g, P.panX, P.panY, P.panW, P.panH, '#22303f', '#0a1219', 'rgba(239,68,68,.42)');
  mgTxt(g, 'SW-CORE-01', P.panX + 14, P.panY + 17, { size: 11, color: '#fecaca', glow: '#ef4444', glowSize: 9 });
  mgTxt(g, 'CATALYST 2960 · 24 PORT · VLAN 10', P.panX + 92, P.panY + 17, { size: 8, color: '#8fa3ba' });
  mgTxt(g, S.loop >= 0 && !S.down.includes(S.loop) ? '⚠ BROADCAST STORM ĐANG LAN' : '✓ STORM ĐÃ ĐƯỢC KHỐNG CHẾ',
    P.panX + 14, P.panY + 31, { size: 8.5, color: S.down.includes(S.loop) ? '#4ade80' : '#fca5a5' });

  const px = i => P.x0 + (i % P.cols) * P.pitch;
  const py = i => P.rowY(i < P.cols ? 0 : 1);

  for (let i = 0; i < P.n; i++) {
    let st = 'ok';
    if (S.down.includes(i)) st = 'down';
    else if (i === S.loop) st = 'loop';
    else if (S.storm.includes(i)) st = 'busy';
    bsPort(g, px(i), py(i), st, S.sel === i, MGX.bs.in && MGX.bs.k === i, t);
    mgTxt(g, 'Gi0/' + (i + 1), px(i), py(i) + P.ph / 2 + 11,
      { size: 6.6, align: 'center', color: st === 'loop' ? '#fca5a5' : st === 'down' ? '#6b7280' : '#5b7288' });
  }

  // hướng dẫn: nhấp nháy vàng quanh CỔNG LOOP cần cô lập
  if (S.hint && !S.down.includes(S.loop)) {
    const hx = px(S.loop), hy = py(S.loop);
    g.strokeStyle = `rgba(250,204,21,${.6 + .4 * Math.sin(t * 6)})`; g.lineWidth = 3;
    g.shadowColor = '#facc15'; g.shadowBlur = 14;
    rr(g, hx - P.pw / 2 - 6, hy - P.ph / 2 - 13, P.pw + 12, P.ph + 17, 7); g.stroke(); g.shadowBlur = 0;
    mgTxt(g, '👈 CỔNG LOOP — BẤM VÀO ĐÂY', hx, hy - P.ph / 2 - 18, { size: 8.5, align: 'center', color: '#facc15', glow: '#facc15', glowSize: 8 });
  }

  // cáp: cổng loop quay về chính switch (vòng lặp), cổng khác đi ra ngoài
  const lx = px(S.loop), ly = py(S.loop), dip = P.panY + P.panH + 8;
  const nb = (S.loop % P.cols === P.cols - 1) ? S.loop - 1 : S.loop + 1;
  const dead = S.down.includes(S.loop);
  g.lineCap = 'round';
  g.strokeStyle = dead ? 'rgba(148,163,184,.32)' : 'rgba(239,68,68,.85)'; g.lineWidth = 4;
  g.beginPath(); g.moveTo(lx, ly + P.ph / 2); g.lineTo(lx, dip); g.lineTo(px(nb), dip); g.lineTo(px(nb), ly + P.ph / 2); g.stroke();
  g.strokeStyle = dead ? 'rgba(205,220,235,.22)' : 'rgba(255,220,220,.5)'; g.lineWidth = 1.2; g.stroke();
  if (!dead) {
    const puls = (t * .9) % 1;
    [0, .5].forEach(o => {
      const k = (puls + o) % 1, seg = k < .5 ? k * 2 : (1 - k) * 2;
      const bx = lx + (px(nb) - lx) * (k < .5 ? seg : 1 - seg);
      g.beginPath(); g.arc(k < .5 ? bx : bx, dip, 2.8, 0, 7);
      g.fillStyle = '#fff1f1'; g.shadowColor = '#ef4444'; g.shadowBlur = 10; g.fill(); g.shadowBlur = 0;
    });
  }
  if (!S.down.includes(S.loop)) {
    rr(g, (lx + px(nb)) / 2 - 22, dip - 7, 44, 13, 4);
    g.fillStyle = 'rgba(127,29,29,.9)'; g.fill();
    g.strokeStyle = `rgba(248,113,113,${.6 + .4 * Math.sin(t * 6)})`; g.lineWidth = 1; g.stroke();
    mgTxt(g, 'LOOP!', (lx + px(nb)) / 2, dip + 2.5, { size: 7.5, align: 'center', color: '#fecaca' });
  }
  S.storm.filter(i => i !== S.loop).forEach(i => {
    g.strokeStyle = 'rgba(245,158,11,.5)'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(px(i), py(i) + P.ph / 2);
    g.quadraticCurveTo(px(i) + 10, P.panY + P.panH + 6, px(i) + 26, P.panY + P.panH + 4); g.stroke();
  });
  g.lineCap = 'butt';

  if (!S.down.includes(S.loop)) {
    const rings = 3;
    for (let k = 0; k < rings; k++) {
      const q = ((t * .55 + k / rings) % 1);
      g.strokeStyle = `rgba(239,68,68,${.45 * (1 - q)})`; g.lineWidth = 1.6;
      g.beginPath(); g.arc(lx, ly, 8 + q * 78, 0, 7); g.stroke();
    }
  }

  // panel thông số
  mgPanel(g, P.infoX, P.panY, BS.W - P.infoX - 14, P.panH, '#141f2c', '#080e16', 'rgba(120,170,220,.3)');
  mgTxt(g, 'MONITOR', P.infoX + 12, P.panY + 17, { size: 9, color: '#7dd3fc', glow: '#0ea5e9', glowSize: 7 });
  mgTxt(g, 'BCAST/s', P.infoX + 12, P.panY + 34, { size: 7.5, color: '#6b8199' });
  mgTxt(g, String(S.rate).padStart(6, ' '), BS.W - 26, P.panY + 46, { size: 15, align: 'right', color: S.rate > 8000 ? '#fca5a5' : '#4ade80', glow: S.rate > 8000 ? '#ef4444' : '#22c55e', glowSize: 10 });
  for (let i = 0; i < 12; i++) {
    const hgt = 3 + Math.abs(Math.sin(t * 6 + i * .8)) * (S.rate > 8000 ? 15 : 6);
    g.fillStyle = S.rate > 8000 ? `rgba(239,68,68,${.35 + i * .05})` : 'rgba(56,189,248,.45)';
    g.fillRect(P.infoX + 12 + i * 13, P.panY + 62 - hgt, 10, hgt);
  }
  const legend = [['loop', '#ef4444', 'LOOP · cổng cần shutdown'], ['busy', '#f59e0b', 'BẬN · lưu lượng cao hợp lệ'],
  ['ok', '#22c55e', 'BÌNH THƯỜNG'], ['down', '#6b7280', 'ADMIN-DOWN']];
  legend.forEach((L, i) => {
    const y = P.panY + 78 + i * 15;
    mgLED(g, P.infoX + 16, y - 2.6, 2.8, L[1], true, 1);
    mgTxt(g, L[2], P.infoX + 26, y, { size: 7.4, color: '#9fb6cc' });
  });
  if (S.hoverName) {
    mgTxt(g, S.hoverName, P.infoX + 12, P.panY + P.panH - 8, { size: 8, color: '#e2e8f0' });
  }
}

/* --- PHA 2: bấm lại dây cáp dự phòng (T568B) --- */
function bsWireV(g, x, y0, y1, th, w, phase) {
  const grd = g.createLinearGradient(x - th / 2, 0, x + th / 2, 0);
  grd.addColorStop(0, lighten(w.main, .5)); grd.addColorStop(.42, w.main); grd.addColorStop(1, darken(w.main, .45));
  g.strokeStyle = 'rgba(0,0,0,.42)'; g.lineWidth = th;
  g.beginPath(); g.moveTo(x + th * .22, y0); g.lineTo(x + th * .22, y1); g.stroke();
  g.strokeStyle = grd; g.lineWidth = th;
  g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke();
  const per = th * 2.05;
  g.save(); g.setLineDash([per * .42, per * .58]); g.lineDashOffset = -(phase || 0);
  g.lineWidth = th; g.strokeStyle = w.stripe ? 'rgba(255,255,255,.94)' : 'rgba(0,0,0,.16)';
  g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); g.restore();
  g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = Math.max(1, th * .16);
  g.beginPath(); g.moveTo(x - th * .3, y0); g.lineTo(x - th * .3, y1); g.stroke();
}

function drawBossCable(g, S, t) {
  const P = BS.p2;
  // --- 8 thẻ dây dự phòng (thứ tự xáo trộn) ---
  S.disp.forEach((idx, k) => {
    const w = S.order[idx], x = P.chipX(k), y = P.chipY, used = idx < S.filledN;
    const hov = MGX.bs.in && MGX.bs.kind === 'chip' && MGX.bs.k === k && !used;
    rr(g, x, y, P.chipW, P.chipH, 8);
    const cg = g.createLinearGradient(0, y, 0, y + P.chipH);
    cg.addColorStop(0, used ? '#0a121b' : hov ? '#1a2b3d' : '#141f2c'); cg.addColorStop(1, '#0a1017');
    g.fillStyle = cg; g.fill();
    g.strokeStyle = used ? 'rgba(90,110,130,.25)' : (S.sel === idx ? '#facc15' : 'rgba(120,170,220,.34)');
    g.lineWidth = S.sel === idx ? 2 : 1.2;
    if (S.sel === idx) { g.shadowColor = '#facc15'; g.shadowBlur = 11; }
    g.stroke(); g.shadowBlur = 0;
    g.globalAlpha = used ? .35 : 1;
    bsWireV(g, x + 13, y + 8, y + P.chipH - 8, 9, w, (t * 10 + k * 4) % 27);
    rr(g, x + 8, y + P.chipH - 10, 10, 5, 1.4); g.fillStyle = '#d9ad4b'; g.fill();
    const nm = w.name, dsh = nm.indexOf('-'), two = nm.length > 11 && dsh > 0, ncol = used ? '#64748b' : '#e2e8f0';
    if (two) {
      mgTxt(g, nm.slice(0, dsh + 1), x + 26, y + 16, { size: 8, color: ncol });
      mgTxt(g, nm.slice(dsh + 1), x + 26, y + 26, { size: 8, color: ncol });
    } else {
      mgTxt(g, fitTxt(g, nm, P.chipW - 30, 8.4), x + 26, y + 21, { size: 8.4, color: ncol });
    }
    mgTxt(g, used ? '✓ đã bấm' : 'kéo vào pin', x + 26, y + (two ? 37 : 33), { size: 7, color: used ? '#4ade80' : '#5b7288' });
    g.globalAlpha = 1;
    if (S.hint && !used && idx === S.nextPin) {
      g.strokeStyle = `rgba(250,204,21,${.55 + .45 * Math.sin(t * 6)})`; g.lineWidth = 2.6;
      g.shadowColor = '#facc15'; g.shadowBlur = 14; rr(g, x - 2, y - 2, P.chipW + 4, P.chipH + 4, 9); g.stroke(); g.shadowBlur = 0;
      mgTxt(g, '👈 BẤM', x + P.chipW / 2, y + P.chipH + 11, { size: 7.5, align: 'center', color: '#facc15', glow: '#facc15', glowSize: 7 });
    }
  });

  // --- đầu bấm RJ45 ---
  mgPanel(g, P.headX - 8, 60, P.headW + 16, 124, '#101a26', '#060c14', 'rgba(125,211,252,.28)');
  const headY = P.chTop - 12, headH = P.chBot - headY + 12;
  const hg = g.createLinearGradient(0, headY, 0, headY + headH);
  hg.addColorStop(0, 'rgba(226,244,255,.42)'); hg.addColorStop(.5, 'rgba(168,206,236,.22)'); hg.addColorStop(1, 'rgba(130,174,210,.36)');
  rr(g, P.headX, headY, P.headW, headH, 7); g.fillStyle = hg; g.fill();
  g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 1.8; g.stroke();
  mgTxt(g, 'RJ45 CAT6 · CHẤM ĐỒNG HƯỚNG LÊN', P.headX + P.headW / 2, headY - 4, { size: 7.6, align: 'center', color: '#8fa3ba' });

  for (let i = 0; i < 8; i++) {
    const x = P.chX(i), w = S.pins[i], target = i === S.nextPin && !S.done;
    if (!w) {
      rr(g, x - P.chW / 2 + 3, P.chTop, P.chW - 6, P.chBot - P.chTop, 3);
      g.fillStyle = 'rgba(4,10,18,.6)'; g.fill();
      g.strokeStyle = target ? `rgba(250,204,21,${.6 + .4 * Math.sin(t * 5)})` : 'rgba(150,180,205,.32)';
      g.lineWidth = target ? 1.8 : 1; g.setLineDash([3, 3]); g.stroke(); g.setLineDash([]);
      g.strokeStyle = 'rgba(150,170,190,.2)'; g.lineWidth = 1; g.setLineDash([2, 4]);
      g.beginPath(); g.moveTo(x, P.chBot + 4); g.lineTo(x, P.chBot + 9); g.stroke(); g.setLineDash([]);
    } else {
      bsWireV(g, x, P.chTop + 2, P.chBot - 2, 15, w, (t * 9 + i * 3) % 31);
    }
    if (target) {
      g.beginPath(); g.moveTo(x, P.chBot - 12); g.lineTo(x - 5.5, P.chBot - 21); g.lineTo(x + 5.5, P.chBot - 21); g.closePath();
      g.fillStyle = `rgba(250,204,21,${.55 + .45 * Math.sin(t * 6)})`; g.fill();
    }
    // lưỡi đồng
    const bh = 7, gg = g.createLinearGradient(0, headY + 3, 0, headY + 3 + bh);
    gg.addColorStop(0, w ? '#ffe9a8' : '#6b6250'); gg.addColorStop(.55, w ? '#e8bc4b' : '#4d4739'); gg.addColorStop(1, w ? '#a97c1c' : '#39352a');
    rr(g, x - P.chW / 2 + 4, headY + 3, P.chW - 8, bh, 1.6); g.fillStyle = gg; g.fill();
    if (w) { g.shadowColor = '#ffd76a'; g.shadowBlur = 3 + Math.sin(t * 4 + i); rr(g, x - 3, headY + 4, 6, bh - 2, 1); g.fillStyle = '#fff2c0'; g.fill(); g.shadowBlur = 0; }
    mgTxt(g, String(i + 1), x, P.chBot + 20, { size: 9, align: 'center', color: w ? '#7dd3fc' : target ? '#facc15' : '#5d7386', glow: target ? '#facc15' : null, glowSize: 6 });
  }
  if (S.errPin >= 0 && t - S.errT < .5) {
    const x = P.chX(S.errPin);
    g.strokeStyle = `rgba(239,68,68,${1 - (t - S.errT) * 2})`; g.lineWidth = 2.6;
    rr(g, x - P.chW / 2, headY - 2, P.chW, headH + 4, 6); g.stroke();
  }

  // --- cable tester ---
  mgPanel(g, P.testX, 60, BS.W - P.testX - 14, 124, '#141f2c', '#080e16', 'rgba(120,170,220,.3)');
  mgTxt(g, 'CABLE TESTER · T568B', P.testX + 12, 76, { size: 9, color: '#7dd3fc', glow: '#0ea5e9', glowSize: 7 });
  mgTxt(g, S.done ? 'PASS ✔ 8/8' : `${S.pins.filter(Boolean).length}/8`, BS.W - 26, 76, { size: 9.5, align: 'right', color: S.done ? '#4ade80' : '#fbbf24', glow: S.done ? '#22c55e' : null, glowSize: 8 });
  for (let i = 0; i < 8; i++) {
    const y = 88 + i * 12, w = S.pins[i], ok = w && w.name === S.order[i].name;
    mgLED(g, P.testX + 16, y - 2.6, 2.6, ok ? '#22c55e' : '#1e2b3a', ok, 1);
    bsWireV(g, P.testX + 30, y - 6, y + 3, 6, S.order[i], (t * 8 + i) % 21);
    mgTxt(g, `${i + 1} ${S.order[i].name}`, P.testX + 42, y, { size: 7.2, color: ok ? '#a7f3d0' : '#7f95ab' });
  }
  if (S.done) {
    const k = (Math.sin(t * 5) * .5 + .5);
    g.strokeStyle = `rgba(34,197,94,${.4 + .4 * k})`; g.lineWidth = 2;
    rr(g, P.headX - 10, 58, P.headW + 20, 128, 10); g.stroke();
    mgTxt(g, 'LINK UP · 1000Mb FULL DUPLEX', BS.W / 2, BS.H - 5, { size: 9, align: 'center', color: '#4ade80', glow: '#22c55e', glowSize: 11 });
  }
}

/* --- PHA 3: bảng định tuyến khẩn cấp --- */
function drawBossRoute(g, S, t) {
  const P = BS.p3;
  // dải topology
  mgPanel(g, 14, 6, BS.W - 28, 36, '#111c28', '#080e16', 'rgba(120,170,220,.26)');
  const nodes = [['LAN', '10.10.0.0/16', '#38bdf8'], ['R1-EMG', 'Core router', '#a855f7'], ['ISP', '203.0.113.1', '#f59e0b'], ['WAN-BKP', '10.0.0.14', '#22c55e']];
  nodes.forEach((nd, k) => {
    const x = 90 + k * 226;
    const lit = S.filledN > k || k < 2;
    rr(g, x - 58, 10, 116, 28, 8);
    g.fillStyle = lit ? 'rgba(56,189,248,.1)' : 'rgba(255,255,255,.03)'; g.fill();
    g.strokeStyle = lit ? alphaC(nd[2], .8) : 'rgba(120,150,180,.28)'; g.lineWidth = 1.3; g.stroke();
    mgLED(g, x - 48, 24, 3, nd[2], lit, Math.sin(t * 3 + k));
    mgTxt(g, nd[0], x + 4, 21, { size: 8.6, align: 'center', color: lit ? '#e2e8f0' : '#5b7288' });
    mgTxt(g, nd[1], x + 4, 32, { size: 6.8, align: 'center', color: lit ? nd[2] : '#42586e' });
    if (k < 3) {
      g.strokeStyle = 'rgba(120,170,220,.4)'; g.lineWidth = 1.6; g.setLineDash([6, 5]); g.lineDashOffset = -(t * 22) % 11;
      g.beginPath(); g.moveTo(x + 60, 24); g.lineTo(x + 166, 24); g.stroke(); g.setLineDash([]); g.lineDashOffset = 0;
    }
  });

  // bảng route
  mgPanel(g, 14, 46, BS.W - 28, 118, '#141f2c', '#080e16', 'rgba(125,211,252,.3)');
  mgTxt(g, 'R1-EMG(config)# ip route  ·  BẢNG ĐỊNH TUYẾN KHẨN CẤP', 26, 58, { size: 8.6, color: '#7dd3fc', glow: '#0ea5e9', glowSize: 7 });
  mgTxt(g, S.done ? '✔ BẢNG ĐỊNH TUYẾN ĐÃ HOÀN CHỈNH — ĐƯỜNG RA INTERNET THÔNG'
    : 'Bấm 1 dòng đích → rồi bấm thẻ next-hop đúng (A–F xáo trộn ngẫu nhiên).',
    BS.W - 26, 58, { size: 8.2, align: 'right', color: S.done ? '#4ade80' : '#5b7288', glow: S.done ? '#22c55e' : null, glowSize: S.done ? 10 : 0 });
  mgTxt(g, 'ĐÍCH / MASK', P.destX, 70, { size: 7.4, color: '#5b7288' });
  mgTxt(g, 'NEXT-HOP', P.slotX, 70, { size: 7.4, color: '#5b7288' });
  S.routes.forEach((r, k) => {
    const y = P.rowY(k), cand = S.filled[k], done = cand != null;
    const sel = S.selRow === k && !done;
    const err = S.errRow === k && t - S.errT < .55;
    rr(g, P.destX - 4, y - 9, BS.W - 44, 20, 5);
    g.fillStyle = done ? 'rgba(34,197,94,.07)' : sel ? 'rgba(250,204,21,.09)' : 'rgba(255,255,255,.025)';
    g.fill();
    g.strokeStyle = err ? '#ef4444' : done ? 'rgba(34,197,94,.45)' : sel ? '#facc15' : 'rgba(120,150,180,.22)';
    g.lineWidth = sel || err ? 1.6 : 1; g.stroke();
    if (S.hint && !done && !sel && S.selRow < 0) {
      g.strokeStyle = `rgba(250,204,21,${.4 + .4 * Math.sin(t * 5)})`; g.lineWidth = 1.8; g.setLineDash([4, 3]);
      rr(g, P.destX - 4, y - 9, BS.W - 44, 20, 5); g.stroke(); g.setLineDash([]);
    }
    g.fillStyle = done ? '#4ade80' : sel ? '#facc15' : '#42586e';
    g.beginPath(); g.moveTo(P.destX + 2, y - 4); g.lineTo(P.destX + 2, y + 4); g.lineTo(P.destX + 8, y); g.closePath(); g.fill();
    mgTxt(g, `${r.dest}/${r.len}`, P.destX + 16, y + 3.4, { size: 9, color: done ? '#a7f3d0' : '#dbeafe' });
    mgTxt(g, r.note, P.destX + 210, y + 3.4, { size: 7.6, color: '#5b7288' });
    rr(g, P.slotX, y - 8, P.slotW, 18, 4);
    if (done) {
      g.fillStyle = 'rgba(34,197,94,.12)'; g.fill();
      g.strokeStyle = 'rgba(34,197,94,.6)'; g.lineWidth = 1.2; g.stroke();
      mgTxt(g, '✔ ' + S.cands[cand], P.slotX + 10, y + 3.4, { size: 8.6, color: '#86efac', glow: '#22c55e', glowSize: 6 });
    } else {
      g.fillStyle = 'rgba(4,10,18,.55)'; g.fill();
      g.strokeStyle = err ? '#ef4444' : sel ? `rgba(250,204,21,${.6 + .4 * Math.sin(t * 5)})` : 'rgba(120,150,180,.3)';
      g.lineWidth = sel ? 1.8 : 1; g.setLineDash([4, 4]); g.stroke(); g.setLineDash([]);
      mgTxt(g, sel ? '◀ chọn next-hop bên dưới' : 'trống — chưa có đường đi', P.slotX + 10, y + 3.4, { size: 8, color: sel ? '#facc15' : '#42586e' });
    }
  });

  // thẻ next-hop
  S.disp.forEach((idx, k) => {
    const x = P.chipX(k), y = P.chipY, used = S.usedCols.includes(k);
    const hov = MGX.bs.in && MGX.bs.k === k && !used;
    rr(g, x, y, P.chipW, P.chipH, 7);
    const cg = g.createLinearGradient(0, y, 0, y + P.chipH);
    cg.addColorStop(0, used ? '#0a121b' : hov ? '#1a2b3d' : '#141f2c'); cg.addColorStop(1, '#0a1017');
    g.fillStyle = cg; g.fill();
    g.strokeStyle = used ? 'rgba(34,197,94,.4)' : hov ? '#facc15' : 'rgba(120,170,220,.34)';
    g.lineWidth = hov ? 1.7 : 1.2; g.stroke();
    g.globalAlpha = used ? .4 : 1;
    mgTxt(g, used ? '✔' : String.fromCharCode(65 + k), x + 9, y + P.chipH / 2 + 3, { size: 8.6, color: used ? '#4ade80' : '#58a6ff' });
    mgTxt(g, fitTxt(g, S.cands[idx], P.chipW - 34, 7.6), x + 24, y + P.chipH / 2 + 3, { size: 7.6, color: '#dbeafe' });
    g.globalAlpha = 1;
  });
}

function drawBoss(cv, S) {
  const g = mgFit(cv, BS.W, BS.H), t = MGX.t;
  const bgg = g.createLinearGradient(0, 0, 0, BS.H);
  bgg.addColorStop(0, '#160d13'); bgg.addColorStop(.5, '#0a121c'); bgg.addColorStop(1, '#070d15');
  g.fillStyle = bgg; g.fillRect(0, 0, BS.W, BS.H);
  if (S.phase === 1) drawBossStorm(g, S, t);
  else if (S.phase === 2) drawBossCable(g, S, t);
  else if (S.phase === 3) drawBossRoute(g, S, t);
  else {
    mgTxt(g, S.done ? 'TOÀN THÀNH 3 PHA' : 'SẴN SÀNG', BS.W / 2, BS.H / 2, { size: 14, align: 'center', color: '#4ade80', glow: '#22c55e', glowSize: 14 });
  }
  bsAlertFrame(g, t, S.heat || 0);
  mgDrawFx(g, 'boss-cv');
}

function bossHit(cv, ev, S) {
  const p = mgPoint(cv, ev, BS.W, BS.H);
  if (!S) return null;
  if (S.phase === 1) {
    for (let i = 0; i < BS.p1.n; i++) {
      const x = BS.p1.x0 + (i % BS.p1.cols) * BS.p1.pitch, y = BS.p1.rowY(i < BS.p1.cols ? 0 : 1);
      if (Math.abs(p.x - x) <= BS.p1.pw / 2 + 3 && Math.abs(p.y - y) <= BS.p1.ph / 2 + 8) return { kind: 'port', k: i };
    }
    return null;
  }
  if (S.phase === 2) {
    for (let k = 0; k < 8; k++) {
      if (p.x >= BS.p2.chipX(k) && p.x <= BS.p2.chipX(k) + BS.p2.chipW && p.y >= BS.p2.chipY && p.y <= BS.p2.chipY + BS.p2.chipH) return { kind: 'chip', k };
    }
    for (let i = 0; i < 8; i++) {
      if (Math.abs(p.x - BS.p2.chX(i)) <= BS.p2.chW / 2 + 2 && p.y > BS.p2.chTop - 18 && p.y < BS.p2.chBot + 8) return { kind: 'pin', k: i };
    }
    return null;
  }
  if (S.phase === 3) {
    for (let k = 0; k < S.routes.length; k++) {
      if (p.y >= BS.p3.rowY(k) - 10 && p.y <= BS.p3.rowY(k) + 10 && p.x >= 16 && p.x <= BS.W - 16) return { kind: 'row', k };
    }
    for (let k = 0; k < S.disp.length; k++) {
      if (p.x >= BS.p3.chipX(k) && p.x <= BS.p3.chipX(k) + BS.p3.chipW && p.y >= BS.p3.chipY && p.y <= BS.p3.chipY + BS.p3.chipH) return { kind: 'cand', k };
    }
    return null;
  }
  return null;
}

/* ============================================================
   6) MÀN KẾT THÚC — pháo hoa trên bầu trời Network City
   ============================================================ */
function vicSkyline(g, t) {
  const baseY = VIC.H - 26;
  const sil = [[10, 70], [46, 108], [92, 62], [140, 128], [196, 84], [250, 112], [312, 66],
  [368, 122], [430, 92], [486, 138], [548, 74], [604, 110], [664, 64], [722, 118], [786, 86]];
  sil.forEach(([x, h], i) => {
    const w = 40 + (i % 3) * 8;
    rr(g, x, baseY - h, w, h, 2);
    g.fillStyle = '#0b1524'; g.fill();
    g.strokeStyle = 'rgba(56,189,248,.22)'; g.lineWidth = 1; g.stroke();
    for (let c = 0; c < 3; c++) for (let r = 0; r < Math.floor(h / 18); r++) {
      const on = ((i * 7 + c * 3 + r) % 5) < 2 || Math.sin(t * 1.2 + i + c + r) > .78;
      g.fillStyle = on ? 'rgba(255,214,102,.85)' : 'rgba(90,120,150,.16)';
      g.fillRect(x + 6 + c * 11, baseY - h + 8 + r * 18, 5, 7);
    }
  });
  g.fillStyle = 'rgba(6,12,20,.9)'; g.fillRect(0, baseY, VIC.W, 26);
  g.strokeStyle = 'rgba(56,189,248,.5)'; g.lineWidth = 1.4; g.setLineDash([9, 7]); g.lineDashOffset = -(t * 26) % 16;
  g.beginPath(); g.moveTo(0, baseY + 13); g.lineTo(VIC.W, baseY + 13); g.stroke(); g.setLineDash([]); g.lineDashOffset = 0;
}

function drawVictory(cv, S) {
  const g = mgFit(cv, VIC.W, VIC.H), t = MGX.t;
  const dt = Math.min(.05, Math.max(0, t - (MGX.fwT || t))); MGX.fwT = t;
  const sky = g.createLinearGradient(0, 0, 0, VIC.H);
  sky.addColorStop(0, '#0a1424'); sky.addColorStop(.55, '#0c1c33'); sky.addColorStop(1, '#061020');
  g.fillStyle = sky; g.fillRect(0, 0, VIC.W, VIC.H);
  for (let i = 0; i < 46; i++) {
    const x = (i * 197 % VIC.W), y = (i * 83 % 140), tw = .4 + .6 * Math.abs(Math.sin(t * 2 + i));
    g.fillStyle = `rgba(220,240,255,${.16 * tw})`; g.fillRect(x, y, 1.6, 1.6);
  }
  vicSkyline(g, t);

  const PAL = ['#fca5a5', '#fde047', '#67e8f9', '#4ade80', '#c084fc', '#fb923c', '#f472b6'];
  const wave = Math.floor(t * 1.7);
  if (MGX.fwWave !== wave) {
    MGX.fwWave = wave;
    for (let n = 0; n < (S && S.grand ? 3 : 2); n++) {
      MGX.fw.push({
        x: 60 + Math.random() * (VIC.W - 120), y: VIC.H - 40, tx: 90 + Math.random() * (VIC.W - 180),
        ty: 34 + Math.random() * 110, c: PAL[Math.floor(Math.random() * PAL.length)], born: t, phase: 'fly'
      });
    }
  }
  MGX.fw = MGX.fw.filter(f => {
    if (f.phase === 'fly') {
      const k = Math.min(1, (t - f.born) / .9);
      const y = f.y + (f.ty - f.y) * k;
      const x = f.x + (f.tx - f.x) * k;
      g.strokeStyle = f.c; g.lineWidth = 2.2; g.shadowColor = f.c; g.shadowBlur = 9;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (f.tx - f.x) * .04, y + 12); g.stroke(); g.shadowBlur = 0;
      if (k >= 1) {
        f.phase = 'burst'; f.born = t;
        f.seeds = Array.from({ length: 22 }, (_, i) => ({ a: i * Math.PI * 2 / 22 + Math.random() * .2, sp: 46 + Math.random() * 52 }));
      }
      return true;
    }
    const k = (t - f.born) / 1.25;
    if (k >= 1) return false;
    g.globalAlpha = 1 - k * k;
    f.seeds.forEach(sd => {
      const d = sd.sp * k * (1 - k * .35), x = f.tx + Math.cos(sd.a) * d, y = f.ty + Math.sin(sd.a) * d + 34 * k * k;
      g.fillStyle = k < .3 ? '#fffbe8' : f.c;
      g.shadowColor = f.c; g.shadowBlur = 8;
      g.beginPath(); g.arc(x, y, 2.4 * (1 - k * .6), 0, 7); g.fill();
    });
    if (k < .45) {
      g.strokeStyle = alphaC(f.c, .5 * (1 - k * 2)); g.lineWidth = 1.4;
      g.beginPath(); g.arc(f.tx, f.ty, 30 + k * 90, 0, 7); g.stroke();
    }
    g.shadowBlur = 0; g.globalAlpha = 1;
    return true;
  });

  const beam = (t * .5) % 1;
  [0, 1].forEach(i => {
    const x = i ? VIC.W - 40 : 40, a = -Math.PI / 2 + Math.sin(t * .7 + i * 2) * .5;
    g.save(); g.translate(x, VIC.H - 30); g.rotate(a);
    const bg = g.createLinearGradient(0, 0, 0, -300);
    bg.addColorStop(0, `rgba(125,211,252,${.22 * (1 - beam * .4)})`); bg.addColorStop(1, 'rgba(125,211,252,0)');
    g.fillStyle = bg; g.beginPath(); g.moveTo(-5, 0); g.lineTo(-46, -300); g.lineTo(46, -300); g.lineTo(5, 0); g.closePath(); g.fill();
    g.restore();
  });
  g.strokeStyle = 'rgba(125,211,252,.28)'; g.lineWidth = 1.4; rr(g, 1, 1, VIC.W - 2, VIC.H - 2, 12); g.stroke();
}

/* ============================================================
   7) CHỨNG CHỈ CCNA — giấy 800x600 (bằng khen nằm ngang)
   Vẽ 100% bằng lệnh Canvas 2D, không drawImage ảnh ngoài → canvas
   không bị taint nên toBlob()/toDataURL() tải xuống chạy được cả file://
   ============================================================ */
const CERT = {
  W: 800, H: 600,
  SERIF: "'Times New Roman','Liberation Serif','Palatino Linotype',serif",
  SANS: "'Baloo 2','Segoe UI',sans-serif",
  NAVY: '#163a5f', GOLD: '#b08a2e', RED: '#c8102e'
};

function certText(g, s, x, y, o) {
  o = o || {};
  const sp = o.spacing || 0, size = o.size || 12;
  g.save();
  g.font = `${o.italic ? 'italic ' : ''}${o.weight || 700} ${size}px ${o.serif ? CERT.SERIF : o.sans ? CERT.SANS : MG_MONO}`;
  g.fillStyle = o.color || CERT.NAVY;
  g.textBaseline = 'alphabetic';
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = o.glowSize || 10; }
  if (o.alpha != null) g.globalAlpha = o.alpha;
  // không tách từng ký tự khi không giãn chữ: Georgia ghép dấu thấp (ấ, ơ, ợ)
  // bằng GPOS, tách ra là dấu bung khỏi nguyên âm
  if (!sp) {
    g.textAlign = o.align || 'center';
    const w = g.measureText(String(s)).width;
    g.fillText(String(s), x, y);
    g.restore();
    return w;
  }
  g.textAlign = 'left';
  const ch = Array.from(String(s));
  const ws = ch.map(c => g.measureText(c).width);
  const tot = ws.reduce((a, b) => a + b, 0) + sp * (ch.length - 1);
  let cx = o.align === 'left' ? x : o.align === 'right' ? x - tot : x - tot / 2;
  ch.forEach((c, i) => { g.fillText(c, cx, y); cx += ws[i] + sp; });
  g.restore();
  return tot;
}
function certWrap(g, s, maxW, font) {
  g.save(); g.font = font;
  const out = []; let line = '';
  String(s).split(' ').forEach(w => {
    const t = line ? line + ' ' + w : w;
    if (g.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
  });
  if (line) out.push(line);
  g.restore();
  return out;
}
function certHex(g, cx, cy, r) {
  g.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 3;
    i ? g.lineTo(cx + r * Math.cos(a), cy + r * 1.04 * Math.sin(a)) : g.moveTo(cx + r * Math.cos(a), cy + r * 1.04 * Math.sin(a));
  }
  g.closePath();
}
/* đường hoa văn guilloche (hypotrochoid) — nền bảo mật */
function certGuilloche(g, cx, cy, R, k, col, lw) {
  g.save(); g.strokeStyle = col; g.lineWidth = lw || .8;
  for (let m = 0; m < 3; m++) {
    g.beginPath();
    for (let a = 0; a <= Math.PI * 2 + .02; a += .02) {
      const d = R - R * .42 * Math.cos(a * k + m * .5);
      const x = cx + d * Math.cos(a), y = cy + d * Math.sin(a) * .82;
      a === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
  }
  g.restore();
}
function certCorner(g, x, y, sx, sy) {
  g.save(); g.translate(x, y); g.scale(sx, sy);
  g.strokeStyle = 'rgba(22,58,95,.45)'; g.lineWidth = 1.5; g.lineCap = 'round';
  [[[10, 46], [10, 16], [42, 16]], [[20, 46], [20, 26], [48, 26]], [[30, 46], [30, 36], [54, 36]]]
    .forEach(p => { g.beginPath(); g.moveTo(p[0][0], p[0][1]); g.lineTo(p[1][0], p[1][1]); g.lineTo(p[2][0], p[2][1]); g.stroke(); });
  [[42, 16], [48, 26], [54, 36]].forEach(p => {
    g.beginPath(); g.arc(p[0], p[1], 3.1, 0, 7);
    g.fillStyle = CERT.GOLD; g.fill();
    g.strokeStyle = 'rgba(22,58,95,.55)'; g.lineWidth = .9; g.stroke();
  });
  g.beginPath(); g.arc(10, 46, 2, 0, 7); g.fillStyle = 'rgba(22,58,95,.45)'; g.fill();
  g.restore();
}
/* logo Network City: huy lục giác + skyline + lưới node */
function certLogo(g, cx, cy, r) {
  g.save();
  certHex(g, cx, cy, r);
  const lg = g.createLinearGradient(cx, cy - r, cx, cy + r);
  lg.addColorStop(0, '#3a8ed0'); lg.addColorStop(.5, '#17518c'); lg.addColorStop(1, '#0c2543');
  g.fillStyle = lg; g.fill();
  g.save(); g.clip();
  [[-24, 14], [-13, 22], [-2, 17], [9, 25], [20, 15]].forEach(([ox, h], i) => {
    g.fillStyle = '#0a1e33'; g.fillRect(cx + ox, cy + 18 - h, 10, h);
    g.fillStyle = 'rgba(255,214,102,.8)';
    for (let k = 0; k < 3; k++) g.fillRect(cx + ox + 2 + (k % 2) * 5, cy + 18 - h + 4 + k * 5, 2, 3);
  });
  const nd = [[-19, -6], [-4, -14], [14, -5], [5, 3], [-9, 2]].map(([ox, oy]) => [cx + ox, cy + oy]);
  g.strokeStyle = 'rgba(140,220,255,.9)'; g.lineWidth = 1;
  [[0, 1], [1, 2], [1, 3], [3, 4], [0, 4], [2, 3]].forEach(([a, b]) => {
    g.beginPath(); g.moveTo(nd[a][0], nd[a][1]); g.lineTo(nd[b][0], nd[b][1]); g.stroke();
  });
  nd.forEach(n => mgLED(g, n[0], n[1], 2.2, '#7dd3fc', true, 1));
  g.restore();
  certHex(g, cx, cy, r);
  g.strokeStyle = CERT.GOLD; g.lineWidth = 2.3; g.stroke();
  certHex(g, cx, cy, r - 4);
  g.strokeStyle = 'rgba(253,230,138,.5)'; g.lineWidth = .8; g.stroke();
  g.restore();
}
/* chữ chạy theo cung tròn */
function certArc(g, s, cx, cy, r, center, size, color, flip) {
  const ch = Array.from(String(s));
  g.save();
  g.font = `800 ${size}px ${CERT.SANS}`;
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = color;
  const gap = size * .2;
  const ws = ch.map(c => g.measureText(c).width + gap);
  const tot = ws.reduce((a, b) => a + b, 0);
  const dir = flip ? -1 : 1;
  let a = center - dir * (tot / 2) / r;
  ch.forEach((c, i) => {
    const da = ws[i] / r, mid = a + dir * da / 2;
    g.save();
    g.translate(cx + Math.cos(mid) * r, cy + Math.sin(mid) * r);
    g.rotate(mid + dir * Math.PI / 2);
    g.fillText(c, 0, 0);
    g.restore();
    a += dir * da;
  });
  g.restore();
}
/* con dấu tròn đỏ */
function certSeal(g, cx, cy, r, year) {
  g.save();
  g.translate(cx, cy); g.rotate(-.13);
  g.globalAlpha = .1;
  g.beginPath(); g.arc(0, 0, r + 3, 0, 7); g.fillStyle = CERT.RED; g.fill();
  g.globalAlpha = .88;
  g.strokeStyle = CERT.RED;
  g.lineWidth = 3.2; g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke();
  g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, r - 5, 0, 7); g.stroke();
  g.lineWidth = 1.8; g.beginPath(); g.arc(0, 0, r * .56, 0, 7); g.stroke();
  for (let i = 0; i < 48; i++) {
    const a = i * Math.PI / 24;
    g.beginPath(); g.arc(Math.cos(a) * (r - 2.4), Math.sin(a) * (r - 2.4), .8, 0, 7);
    g.fillStyle = CERT.RED; g.fill();
  }
  certArc(g, 'NETWORK CITY', 0, 0, r - 14, -Math.PI / 2, 10, CERT.RED, false);
  certArc(g, 'CHỨNG NHẬN CCNA', 0, 0, r - 13, Math.PI / 2, 8.6, CERT.RED, true);
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, d = i % 2 ? r * .15 : r * .34;
    const x = Math.cos(a) * d, y = Math.sin(a) * d - r * .12;
    i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.closePath(); g.fillStyle = CERT.RED; g.fill();
  certText(g, String(year), 0, r * .48, { size: 9.5, spacing: 1.2, color: CERT.RED });
  g.restore();
}
function certPaper(g) {
  const W = CERT.W, H = CERT.H;
  const pg = g.createLinearGradient(0, 0, W, H);
  pg.addColorStop(0, '#fdfbf3'); pg.addColorStop(.45, '#f8f3e7'); pg.addColorStop(1, '#eee6d3');
  g.fillStyle = pg; g.fillRect(0, 0, W, H);
  const vg = g.createRadialGradient(W / 2, H / 2, 150, W / 2, H / 2, 520);
  vg.addColorStop(0, 'rgba(255,255,255,0)'); vg.addColorStop(1, 'rgba(126,100,52,.15)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  /* dải foil bảo mật viền trên */
  const fo = g.createLinearGradient(0, 0, W, 0);
  ['#7dd3fc', '#a7f3d0', '#fde68a', '#f9a8d4', '#c4b5fd', '#7dd3fc'].forEach((c, i, a) =>
    fo.addColorStop(i / (a.length - 1), c));
  g.globalAlpha = .5; g.fillStyle = fo; g.fillRect(0, 0, W, 10); g.globalAlpha = 1;
  g.fillStyle = 'rgba(126,100,52,.35)'; g.fillRect(0, 10, W, 1);
  /* hoa văn guilloche */
  g.save(); rr(g, 38, 38, W - 76, H - 76, 6); g.clip();
  certGuilloche(g, W / 2, 300, 190, 9, 'rgba(30,90,150,.055)', .8);
  certGuilloche(g, 150, 470, 84, 7, 'rgba(30,90,150,.05)', .7);
  certGuilloche(g, 650, 470, 84, 7, 'rgba(30,90,150,.05)', .7);
  certGuilloche(g, 150, 130, 70, 6, 'rgba(176,138,46,.07)', .7);
  certGuilloche(g, 650, 130, 70, 6, 'rgba(176,138,46,.07)', .7);
  g.restore();
  /* khung 3 lớp + mạchCorner */
  g.strokeStyle = CERT.NAVY; g.lineWidth = 3; rr(g, 20, 20, W - 40, H - 40, 8); g.stroke();
  g.strokeStyle = CERT.GOLD; g.lineWidth = 1.5; rr(g, 28, 28, W - 56, H - 56, 6); g.stroke();
  g.strokeStyle = 'rgba(176,138,46,.42)'; g.lineWidth = .8; rr(g, 34, 34, W - 68, H - 68, 4); g.stroke();
  certCorner(g, 46, 46, 1, 1); certCorner(g, W - 46, 46, -1, 1);
  certCorner(g, 46, H - 46, 1, -1); certCorner(g, W - 46, H - 46, -1, -1);
}
function certOrnament(g, cx, y, half) {
  g.strokeStyle = CERT.GOLD; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(cx - half, y); g.lineTo(cx - 12, y); g.stroke();
  g.beginPath(); g.moveTo(cx + 12, y); g.lineTo(cx + half, y); g.stroke();
  g.save(); g.translate(cx, y); g.rotate(Math.PI / 4);
  g.fillStyle = CERT.GOLD; g.fillRect(-4, -4, 8, 8);
  g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = .8; g.strokeRect(-4, -4, 8, 8);
  g.restore();
  [[-1, 0], [1, 0]].forEach(([s]) => { g.beginPath(); g.arc(cx + s * 9, y, 1.6, 0, 7); g.fillStyle = CERT.GOLD; g.fill(); });
}
function certSig(g, cx, y, name, role) {
  g.save();
  g.strokeStyle = 'rgba(20,45,80,.78)'; g.lineWidth = 1.6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(cx - 54, y - 12);
  g.bezierCurveTo(cx - 34, y - 32, cx - 16, y - 2, cx + 4, y - 20);
  g.bezierCurveTo(cx + 18, y - 32, cx + 32, y - 6, cx + 52, y - 16);
  g.stroke();
  g.restore();
  g.strokeStyle = 'rgba(22,58,95,.55)'; g.lineWidth = 1.1;
  g.beginPath(); g.moveTo(cx - 82, y); g.lineTo(cx + 82, y); g.stroke();
  certText(g, name, cx, y + 19, { size: 17, serif: true, italic: true, color: CERT.NAVY });
  certText(g, role, cx, y + 33, { size: 8.2, color: 'rgba(40,70,104,.75)' });
}

/* toàn bộ nội dung chứng chỉ vẽ trong hệ tọa độ thiết kế 800x600 */
function certPaint(g, sc) {
  certPaper(g);
  certLogo(g, 400, 82, 29);
  certText(g, 'NETWORK CITY', 400, 128, { size: 14, sans: true, weight: 800, spacing: 6, color: CERT.NAVY });
  certText(g, 'HỌC VIỆN CCNA · TRẠM MẠNG ISP · DATA CENTER', 400, 144, { size: 7.6, spacing: 1.8, color: 'rgba(40,70,104,.62)' });
  certText(g, 'CHỨNG NHẬN', 400, 192, { size: 41, serif: true, weight: 700, spacing: 7, color: CERT.NAVY, glow: 'rgba(176,138,46,.55)', glowSize: 14 });
  certOrnament(g, 400, 206, 176);
  certText(g, 'HOÀN THÀNH KHÓA HUẤN LUYỆN & THỰC CHIẾN — CCNA NETWORK ASSOCIATE', 400, 228, { size: 9.4, spacing: 1.9, color: '#8a6a1f' });
  certText(g, 'TRÂN TRỌNG CẤP CHO', 400, 256, { size: 8.4, spacing: 3.4, color: 'rgba(40,70,104,.6)' });
  const nw = certText(g, sc.name, 400, 298, { size: 40, serif: true, italic: true, weight: 700, color: '#123a63' });
  const nl = Math.max(180, Math.min(620, nw + 40));
  g.strokeStyle = 'rgba(176,138,46,.85)'; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(400 - nl / 2, 310); g.lineTo(400 + nl / 2, 310); g.stroke();
  certOrnament(g, 400, 310, nl / 2);

  /* pill danh hiệu */
  const pill = sc.rankLine;
  g.save();
  g.font = `700 11px ${MG_MONO}`;
  const pw = g.measureText(pill).width + 58;
  const px = 400 - pw / 2;
  const pg2 = g.createLinearGradient(0, 320, 0, 346);
  pg2.addColorStop(0, '#fdf1cf'); pg2.addColorStop(1, '#f2e0b6');
  rr(g, px, 320, pw, 26, 13); g.fillStyle = pg2; g.fill();
  g.strokeStyle = CERT.GOLD; g.lineWidth = 1.3; g.stroke();
  g.restore();
  [[px + 17, 333], [px + pw - 17, 333]].forEach(p => mgLED(g, p[0], p[1], 3.4, '#f59e0b', true, 1));
  certText(g, pill, 400, 337, { size: 11, color: '#6b4a12' });

  /* đoạn mô tả */
  const font = `italic 400 12px ${CERT.SERIF}`;
  certWrap(g, sc.body, 636, font).slice(0, 3).forEach((ln, i) =>
    certText(g, ln, 400, 370 + i * 17.5, { size: 12, serif: true, italic: true, weight: 400, color: '#3a5570' }));

  /* bảng kỹ năng */
  certText(g, 'BẢNG KỸ NĂNG CCNA — THANG 5 BẬC', 400, 426, { size: 7.8, spacing: 2.4, color: 'rgba(40,70,104,.6)' });
  sc.skills.forEach((s, i) => {
    const cx = 120 + i * 112;
    certText(g, s.label, cx, 444, { size: 8, spacing: .8, color: CERT.NAVY });
    for (let k = 0; k < 5; k++) {
      const x = cx - 20 + k * 10, on = k < s.v;
      g.beginPath(); g.arc(x, 454, 3.4, 0, 7);
      g.fillStyle = on ? CERT.GOLD : 'rgba(22,58,95,.13)'; g.fill();
      g.strokeStyle = on ? 'rgba(122,90,20,.75)' : 'rgba(22,58,95,.25)'; g.lineWidth = .8; g.stroke();
    }
  });

  /* số hiệu + ngày cấp */
  certText(g, 'SỐ HIỆU: ' + sc.id, 64, 478, { size: 8.6, spacing: .6, color: 'rgba(40,70,104,.8)', align: 'left' });
  certText(g, sc.placeDate, 736, 478, { size: 10, serif: true, italic: true, color: CERT.NAVY, align: 'right' });

  certSeal(g, 400, 508, 42, sc.year);
  certSig(g, 190, 524, sc.left.name, sc.left.role);
  certSig(g, 610, 524, sc.right.name, sc.right.role);
}
function drawCert(cv, sc) {
  if (!cv) return null;
  certPaint(mgFit(cv, CERT.W, CERT.H), sc);
  return cv;
}
/* mặt xuất file: canvas ngoài, đúng 800x600 device px */
function certCanvas(sc) {
  const cv = document.createElement('canvas');
  cv.width = CERT.W; cv.height = CERT.H;
  const g = cv.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0);
  certPaint(g, sc);
  return cv;
}

/* ============================================================
   MINIGAME KHU 3 — vẽ 6 trạm tương tác (state do game.js cấp)
   Toạ độ nội bộ 760x400, khớp hit-test trong LQM_GAMES.
   ============================================================ */
function drawLqm(cv, t, L) {
  const g = mgFit(cv, 760, 400);
  g.textBaseline = 'alphabetic';
  const S = L.g;
  if (L.i === 0) lqDrawCircuit(g, S, t, L);
  else if (L.i === 1) lqDrawThermal(g, S, t, L);
  else if (L.i === 2) lqDrawSat(g, S, t, L);
  else if (L.i === 3) lqDrawShip(g, S, t, L);
  else if (L.i === 4) lqDrawCable(g, S, t, L);
  else lqDrawRadar(g, S, t, L);
  mgDrawFx(g, 'lu-mini');
}
function lqGridBg(g, t) {
  g.fillStyle = '#050a13'; g.fillRect(0, 0, 760, 400);
  g.strokeStyle = 'rgba(56,120,180,.10)'; g.lineWidth = 1;
  for (let x = 0; x <= 760; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 400); g.stroke(); }
  for (let y = 0; y <= 400; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(760, y); g.stroke(); }
}
function lqTimeTag(g, S, t) {
  mgTxt(g, '⏱ ' + Math.round(t - S.t0) + 's', 744, 24, { size: 10, color: '#64748b', align: 'right' });
}
function lqSlider(g, x, y, w, v, v0, v1, label, val, col) {
  col = col || '#f472b6';
  mgPanel(g, x, y - 9, w, 18, '#0e1a2e', '#081020', 'rgba(120,160,220,.3)');
  const k = Math.max(0, Math.min(1, (v - v0) / (v1 - v0)));
  const hx = x + k * w;
  g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 8;
  rr(g, hx - 7, y - 15, 14, 30, 6); g.fill(); g.shadowBlur = 0;
  g.strokeStyle = '#f1f5f9'; g.lineWidth = 1.5; rr(g, hx - 7, y - 15, 14, 30, 6); g.stroke();
  mgTxt(g, label, x, y - 20, { size: 10, color: '#cbd5e1' });
  mgTxt(g, val, x + w, y - 20, { size: 10, color: col, align: 'right' });
  mgTxt(g, String(v0), x, y + 24, { size: 8.5, color: '#64748b' });
  mgTxt(g, String(v1), x + w, y + 24, { size: 8.5, color: '#64748b', align: 'right' });
}

/* ① NỐI MẠCH LƯỢNG TỬ */
function lqDrawCircuit(g, S, t) {
  lqGridBg(g, t);
  mgTxt(g, 'LƯỚI MẠCH LƯỢNG TỬ 4×4 — XOAY Ô DẪN ĐIỆN', 380, 24, { size: 11.5, color: '#7dd3fc', align: 'center' });
  lqTimeTag(g, S, t);
  const dirs = [[0, -1, 1], [1, 0, 2], [0, 1, 4], [-1, 0, 8]];
  const sy = 37 + S.sr * 84 + 37, ey = 37 + S.er * 84 + 37;
  const liveIn = S.pw[S.sr * 4] && (S.mask[S.sr * 4] & 8);
  const liveOut = S.pw[S.er * 4 + 3] && (S.mask[S.er * 4 + 3] & 2);
  /* dây nối từ NGUỒN vào lưới + từ lưới ra ĐÍCH */
  g.lineCap = 'round';
  g.strokeStyle = liveIn ? '#4ade80' : '#334155'; g.lineWidth = 6;
  g.beginPath(); g.moveTo(129, sy); g.lineTo(217, sy); g.stroke();
  g.strokeStyle = liveOut ? '#4ade80' : '#334155';
  g.beginPath(); g.moveTo(543, ey); g.lineTo(631, ey); g.stroke();
  /* hộp NGUỒN */
  mgPanel(g, 51, sy - 28, 78, 56, '#0a2318', '#06140e', liveIn ? 'rgba(74,222,128,.75)' : 'rgba(90,130,190,.3)');
  mgTxt(g, '⚡', 90, sy + 2, { size: 20, align: 'center', color: liveIn ? '#4ade80' : '#475569', glow: liveIn ? '#22c55e' : null });
  mgTxt(g, 'NGUỒN', 90, sy + 22, { size: 9, align: 'center', color: liveIn ? '#bbf7d0' : '#64748b' });
  /* hộp ĐÍCH */
  mgPanel(g, 631, ey - 28, 78, 56, liveOut ? '#0a2318' : '#141d31', liveOut ? '#06140e' : '#0a1120', liveOut ? 'rgba(74,222,128,.85)' : 'rgba(90,130,190,.3)');
  mgTxt(g, liveOut ? '✔' : '◎', 670, ey + 2, { size: 20, align: 'center', color: liveOut ? '#4ade80' : '#475569', glow: liveOut ? '#22c55e' : null });
  mgTxt(g, 'ĐÍCH', 670, ey + 22, { size: 9, align: 'center', color: liveOut ? '#bbf7d0' : '#64748b' });
  /* 16 ô mạch */
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    const i = r * 4 + c, x = 217 + c * 84, y = 37 + r * 84;
    const p = S.pw[i], m = S.mask[i];
    mgPanel(g, x, y, 74, 74, p ? '#0c2b25' : '#111a2b', p ? '#071a16' : '#0a1120', p ? 'rgba(74,222,128,.55)' : 'rgba(90,130,190,.28)');
    const cx = x + 37, cy = y + 37;
    for (const d of dirs) {
      if (!(m & d[2])) continue;
      // chỉ xem đoạn ống là "dẫn điện" khi ô kề đúng hướng có cổng đối diện khớp
      const nc = c + d[0], nr = r + d[1];
      let joined = false;
      if (nc >= 0 && nc <= 3 && nr >= 0 && nr <= 3) {
        const opp = ((d[2] << 2) | (d[2] >> 2)) & 15;
        joined = p === 1 && S.pw[nr * 4 + nc] === 1 && (S.mask[nr * 4 + nc] & opp) !== 0;
      }
      const ex = cx + d[0] * 37, eyy = cy + d[1] * 37;
      g.strokeStyle = joined ? '#4ade80' : (p ? '#7c5c22' : '#334155'); g.lineWidth = 6; g.lineCap = 'round';
      if (joined) { g.shadowColor = '#4ade80'; g.shadowBlur = 10; }
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(ex, eyy); g.stroke(); g.shadowBlur = 0;
      if (joined) {
        const k = (t * 1.7 + (r * 4 + c) * 0.13) % 1;
        g.fillStyle = '#eafff3';
        g.beginPath(); g.arc(cx + d[0] * 37 * k, cy + d[1] * 37 * k, 2.6, 0, 7); g.fill();
      }
    }
    g.fillStyle = p ? '#bbf7d0' : '#5b6b84';
    g.beginPath(); g.arc(cx, cy, 4, 0, 7); g.fill();
  }
  mgTxt(g, 'Click vào ô để xoay 90° · đưa dòng ⚡ chạm được hộp ĐÍCH', 380, 390, { size: 10.5, color: '#94a3b8', align: 'center' });
}

/* ② ĐIỀU ÁP LÀM MÁT */
function lqDrawThermal(g, S, t) {
  lqGridBg(g, t);
  mgTxt(g, 'ĐIỀU ÁP LÀM MÁT LÕI SERVER — GIỮ 40–65°C', 380, 24, { size: 11.5, color: '#7dd3fc', align: 'center' });
  lqTimeTag(g, S, t);
  mgPanel(g, 50, 36, 660, 16, '#0b1526', '#070d18');
  g.fillStyle = S.inb ? '#22c55e' : '#f97316';
  if (S.prog > 0) g.fillRect(52, 38, 656 * S.prog / 100, 12);
  mgTxt(g, 'TIẾN ĐỘ ĐIỀU ÁP ' + Math.round(S.prog) + '%', 380, 48, { size: 9.5, color: '#e2e8f0', align: 'center' });
  const yOf = T => 288 - (T - 20) * (218 / 70);
  const zt = yOf(65), zb = yOf(40);
  for (let i = 0; i < 4; i++) {
    const gx = 50 + i * 170, bx = gx + 40, bw = 56;
    mgPanel(g, bx, 70, bw, 218, '#0b1526', '#070d18');
    g.fillStyle = 'rgba(34,197,94,.16)'; g.fillRect(bx + 2, zt, bw - 4, zb - zt);
    g.strokeStyle = 'rgba(34,197,94,.5)'; g.setLineDash([4, 3]); g.lineWidth = 1;
    g.beginPath(); g.moveTo(bx, zt); g.lineTo(bx + bw, zt); g.moveTo(bx, zb); g.lineTo(bx + bw, zb); g.stroke(); g.setLineDash([]);
    const T = S.T[i], yT = Math.max(70, Math.min(288, yOf(T)));
    const inb = T >= 40 && T <= 65;
    const col = inb ? '#22c55e' : (T > 65 ? '#ef4444' : '#38bdf8');
    const grd = g.createLinearGradient(0, 288, 0, 70);
    grd.addColorStop(0, alphaC(col, .22)); grd.addColorStop(1, alphaC(col, .92));
    g.fillStyle = grd; g.fillRect(bx + 4, yT, bw - 8, 288 - yT);
    g.strokeStyle = col; g.lineWidth = 2; g.strokeRect(bx + 4.5, yT + .5, bw - 9, 288 - yT);
    mgTxt(g, Math.round(T) + '°C', gx + 68, 64, { size: 13, align: 'center', color: col, glow: inb ? '#22c55e' : col, glowSize: 6 });
    mgTxt(g, 'MÁY ' + (i + 1), gx + 68, 304, { size: 10, align: 'center', color: '#cbd5e1' });
    mgPanel(g, gx, 312, 140, 20, '#0e1a2e', '#081020', 'rgba(120,160,220,.3)');
    for (let k = 0; k <= 5; k++) { g.fillStyle = 'rgba(148,163,184,.45)'; g.fillRect(gx + k * 28 - .5, 316, 1, 12); }
    const hx = gx + (S.s[i] / 5) * 140;
    g.fillStyle = '#67e8f9'; g.shadowColor = '#22d3ee'; g.shadowBlur = 10;
    rr(g, hx - 7, 308, 14, 28, 6); g.fill(); g.shadowBlur = 0;
    g.strokeStyle = '#e0f2fe'; g.lineWidth = 1.5; rr(g, hx - 7, 308, 14, 28, 6); g.stroke();
  }
  const cd = Math.max(0, 8 - (t - S.lastVent));
  mgPanel(g, 320, 348, 260, 40, cd > 0 ? '#1a2333' : '#0f2f3e', '#0a1420', cd > 0 ? 'rgba(100,116,139,.4)' : 'rgba(103,232,249,.6)');
  mgTxt(g, cd > 0 ? '💨 XẢ ÁP — hồi ' + cd.toFixed(1) + 's' : '💨 XẢ ÁP  (−10°C toàn dàn)',
    450, 373, { size: 12, align: 'center', color: cd > 0 ? '#64748b' : '#a5f3fc', glow: cd > 0 ? null : '#22d3ee' });
}

/* ③ BẮT SÓNG LASER */
function lqDrawSat(g, S, t) {
  lqGridBg(g, t);
  lqTimeTag(g, S, t);
  if (S.ph === 0) {
    mgPanel(g, 60, 30, 640, 216, '#081326', '#050b16', 'rgba(56,189,248,.3)');
    g.strokeStyle = 'rgba(56,189,248,.13)'; g.lineWidth = 1;
    for (let x = 60; x <= 700; x += 40) { g.beginPath(); g.moveTo(x, 30); g.lineTo(x, 246); g.stroke(); }
    for (let y = 30; y <= 246; y += 36) { g.beginPath(); g.moveTo(60, y); g.lineTo(700, y); g.stroke(); }
    const pl = .5 + .5 * Math.sin(t * 5);
    g.strokeStyle = alphaC('#fde047', .25 + .35 * pl); g.lineWidth = 2;
    g.beginPath(); g.arc(S.bx, S.by, 16 + pl * 10, 0, 7); g.stroke();
    mgLED(g, S.bx, S.by, 7, '#fde047', true, .6 + .4 * pl);
    mgTxt(g, 'TÍN HIỆU TRÁI ĐẤT', S.bx, S.by - 30, { size: 9.5, color: '#fde047', align: 'center' });
    const near = Math.hypot(S.rx - S.bx, S.ry - S.by) <= 30;
    const col = near ? '#4ade80' : '#f472b6';
    g.strokeStyle = col; g.lineWidth = 2; g.shadowColor = col; g.shadowBlur = 8;
    g.beginPath(); g.arc(S.rx, S.ry, 30, 0, 7); g.stroke(); g.shadowBlur = 0;
    g.beginPath();
    g.moveTo(S.rx - 42, S.ry); g.lineTo(S.rx - 12, S.ry); g.moveTo(S.rx + 12, S.ry); g.lineTo(S.rx + 42, S.ry);
    g.moveTo(S.rx, S.ry - 42); g.lineTo(S.rx, S.ry - 12); g.moveTo(S.rx, S.ry + 12); g.lineTo(S.rx, S.ry + 42); g.stroke();
    if (S.hold > 0) {
      g.strokeStyle = '#fde047'; g.lineWidth = 4;
      g.beginPath(); g.arc(S.rx, S.ry, 40, -Math.PI / 2, -Math.PI / 2 + 6.283 * (S.hold / 1.6)); g.stroke();
    }
    mgTxt(g, 'PHA 1/2 — KÉO Ô NGẮM TRÙNG TÍN HIỆU (giữ 1.6s)', 380, 268, { size: 11, color: '#7dd3fc', align: 'center' });
    mgTxt(g, 'Chảo parabol đang quay theo tay bạn…', 380, 292, { size: 10, color: '#64748b', align: 'center' });
    mgTxt(g, 'Tọa độ tín hiệu: ' + Math.round(S.bx) + ' · ' + Math.round(S.by), 380, 386, { size: 10, color: '#475569', align: 'center' });
  } else {
    mgPanel(g, 60, 30, 640, 216, '#07101f', '#04080f', 'rgba(56,189,248,.3)');
    const midY = 138, u0 = 60, W = 640;
    g.strokeStyle = 'rgba(56,189,248,.12)';
    g.beginPath(); g.moveTo(u0, midY); g.lineTo(u0 + W, midY); g.stroke();
    g.setLineDash([6, 5]); g.strokeStyle = '#fde047'; g.lineWidth = 2; g.beginPath();
    for (let px = 0; px <= W; px += 3) {
      const y = midY - S.at * Math.sin(px / W * S.ft * Math.PI * 2);
      if (px === 0) g.moveTo(u0 + px, y); else g.lineTo(u0 + px, y);
    }
    g.stroke(); g.setLineDash([]);
    const good = Math.abs(S.f0 - S.ft) <= 0.10 && Math.abs(S.a0 - S.at) <= 5;
    g.strokeStyle = good ? '#4ade80' : '#f472b6'; g.lineWidth = 2.4;
    if (good) { g.shadowColor = '#4ade80'; g.shadowBlur = 10; }
    g.beginPath();
    for (let px = 0; px <= W; px += 3) {
      const y = midY - S.a0 * Math.sin(px / W * S.f0 * Math.PI * 2);
      if (px === 0) g.moveTo(u0 + px, y); else g.lineTo(u0 + px, y);
    }
    g.stroke(); g.shadowBlur = 0;
    mgTxt(g, 'WAVE TRẠM', 68, 46, { size: 9.5, color: '#f472b6' });
    mgTxt(g, 'WAVE TRÁI ĐẤT', 692, 46, { size: 9.5, color: '#fde047', align: 'right' });
    mgPanel(g, 60, 256, 640, 16, '#0b1526', '#070d18');
    g.fillStyle = good ? '#22c55e' : '#f472b6';
    if (S.lock > 0) g.fillRect(62, 258, 636 * S.lock / 1.4, 12);
    mgTxt(g, 'ĐỒNG BỘ ' + Math.round(S.lock / 1.4 * 100) + '%', 380, 268, { size: 10, color: '#f1f5f9', align: 'center' });
    lqSlider(g, 200, 300, 360, S.f0, 2.2, 4.2, 'TẦN SỐ', S.f0.toFixed(2), '#38bdf8');
    lqSlider(g, 200, 352, 360, S.a0, 42, 66, 'BIÊN ĐỘ', String(Math.round(S.a0)), '#f472b6');
    mgTxt(g, 'PHA 2/2 — TINH CHỈNH CHO 2 SÓNG TRÙNG NHAU (giữ 1.4s)', 380, 390, { size: 11, color: '#7dd3fc', align: 'center' });
  }
}

/* ④ HIỆU CHUẨN BUỒNG LÁI */
function lqDrawShip(g, S, t) {
  lqGridBg(g, t);
  lqTimeTag(g, S, t);
  if (S.ph === 0) {
    mgTxt(g, 'MA TRẬN GHI NHỚ — PHA 1/2', 380, 22, { size: 11.5, color: '#a78bfa', align: 'center' });
    const pl = S.ready ? .5 : .5 + .5 * Math.sin(t * 6);
    for (let i = 0; i < 9; i++) {
      const x = 236 + (i % 3) * 100, y = 30 + ((i / 3) | 0) * 100;
      const lit = S.lit === i;
      const fl = S.flash === i && t - S.flashT < .45;
      mgPanel(g, x, y, 88, 88, lit ? lighten('#0891b2', .3) : '#141d31', '#0a1120',
        lit ? 'rgba(125,211,252,.9)' : (fl ? alphaC(S.flashOk ? '#22c55e' : '#ef4444', .8) : 'rgba(90,130,190,.3)'));
      mgLED(g, x + 44, y + 44, lit ? 14 : 8, lit ? '#38bdf8' : '#334155', lit, lit ? pl : .8);
    }
    mgTxt(g, S.ready ? '⬢ TỚI LƯỢT BẠN — bấm lại 5 ô theo thứ tự (' + S.idx + '/5)' : '⬢ Đang phát chuỗi khởi động…',
      380, 362, { size: 12, color: S.ready ? '#bbf7d0' : '#94a3b8', align: 'center' });
    mgTxt(g, 'Ô nhớ bấm sai: ' + S.err, 380, 386, { size: 10, color: '#fca5a5', align: 'center' });
  } else {
    g.globalAlpha = .16;
    for (let i = 0; i < 9; i++) mgPanel(g, 236 + (i % 3) * 100, 30 + ((i / 3) | 0) * 100, 88, 88, '#141d31', '#0a1120');
    g.globalAlpha = 1;
    mgTxt(g, 'ĐỒNG BỘ XUNG NĂNG LƯỢNG — PHA 2/2', 380, 22, { size: 11.5, color: '#a78bfa', align: 'center' });
    const bx = 80, bw = 600, by = 190, bh = 32, zc = 380;
    mgPanel(g, bx, by, bw, bh, '#0b1526', '#070d18', 'rgba(120,160,220,.35)');
    const zh = [70, 56, 46][Math.min(2, S.level)];
    g.fillStyle = 'rgba(34,197,94,.35)'; g.fillRect(zc - zh / 2, by + 2, zh, bh - 4);
    g.strokeStyle = '#4ade80'; g.setLineDash([5, 4]); g.lineWidth = 1.5;
    g.strokeRect(zc - zh / 2 + .5, by + 2.5, zh - 1, bh - 5); g.setLineDash([]);
    const nx = Math.max(80, Math.min(680, S.needle));
    g.fillStyle = '#fde047'; g.shadowColor = '#fde047'; g.shadowBlur = 10;
    g.beginPath(); g.moveTo(nx, by - 6); g.lineTo(nx - 9, by - 20); g.lineTo(nx + 9, by - 20); g.closePath(); g.fill();
    g.fillRect(nx - 1.5, by, 3, bh); g.shadowBlur = 0;
    if (t - S.hitT < .4) { g.fillStyle = alphaC(S.hitOk ? '#22c55e' : '#ef4444', .35 - (t - S.hitT) * .8); g.fillRect(bx, by, bw, bh); }
    for (let i = 0; i < 3; i++) mgLED(g, 348 + i * 32, 250, 9, '#4ade80', i < S.level, 1);
    mgTxt(g, 'CHUỖI XUNG LIÊN TIẾP: ' + S.level + '/3', 380, 292, { size: 12, color: '#bbf7d0', align: 'center' });
    mgTxt(g, 'Trượt xung: ' + S.miss + ' · Ô nhớ sai: ' + S.err, 380, 322, { size: 10, color: '#94a3b8', align: 'center' });
    mgTxt(g, 'Bấm nút [⚡ KHOÁ XUNG] (hoặc Space) đúng lúc kim vào vùng xanh', 380, 356, { size: 11, color: '#7dd3fc', align: 'center' });
  }
}

/* ⑤ ĐẤU CÁP QUANG */
function lqDrawCable(g, S, t) {
  lqGridBg(g, t);
  mgTxt(g, 'ĐẤU CÁP QUANG — NỐI CÙNG MÀU, KHÔNG GIAO CẮT', 380, 24, { size: 11.5, color: '#7dd3fc', align: 'center' });
  lqTimeTag(g, S, t);
  mgPanel(g, 50, 36, 660, 330, '#0a1424', '#060c16', 'rgba(90,130,190,.35)');
  g.strokeStyle = 'rgba(56,120,180,.25)'; g.setLineDash([6, 6]);
  g.strokeRect(78.5, 64.5, 604, 274); g.setLineDash([]);
  const cols = ['#ef4444', '#22c55e', '#facc15', '#a855f7'];
  for (let i = 0; i < 4; i++) {
    const a = S.nodes[i], b = S.nodes[i + 4];
    if (!a || !b) continue;
    g.strokeStyle = alphaC(cols[i], .85); g.lineWidth = 6; g.lineCap = 'round';
    g.shadowColor = cols[i]; g.shadowBlur = 8;
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.shadowBlur = 0;
  }
  (S.crossP || []).forEach(p => {
    g.strokeStyle = '#f87171'; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(p.x - 7, p.y - 7); g.lineTo(p.x + 7, p.y + 7);
    g.moveTo(p.x + 7, p.y - 7); g.lineTo(p.x - 7, p.y + 7); g.stroke();
  });
  S.nodes.forEach((n, i) => {
    const c = cols[i % 4];
    g.fillStyle = '#0b1526'; g.beginPath(); g.arc(n.x, n.y, 16, 0, 7); g.fill();
    g.strokeStyle = c; g.lineWidth = 3; g.shadowColor = c; g.shadowBlur = 10;
    g.beginPath(); g.arc(n.x, n.y, 16, 0, 7); g.stroke(); g.shadowBlur = 0;
    g.fillStyle = c; g.beginPath(); g.arc(n.x, n.y, 7, 0, 7); g.fill();
    if (S.drag === i) { g.strokeStyle = '#e2e8f0'; g.lineWidth = 1.5; g.beginPath(); g.arc(n.x, n.y, 23, 0, 7); g.stroke(); }
  });
  mgTxt(g, (S.cross ? '⚠ GIAO CẮT: ' + S.cross : '✔ SẠCH GIAO CẮT'), 380, 388,
    { size: 13, align: 'center', color: S.cross ? '#f87171' : '#4ade80', glow: S.cross ? '#ef4444' : '#22c55e', glowSize: 8 });
}

/* ⑥ KHIÊN CHẮN BÃO DDoS */
function lqDrawRadar(g, S, t) {
  lqGridBg(g, t);
  const cx = 380, cy = 205;
  for (let r = 60; r <= 240; r += 60) { g.strokeStyle = 'rgba(56,189,248,.12)'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); }
  g.strokeStyle = 'rgba(56,189,248,.12)';
  g.beginPath(); g.moveTo(60, cy); g.lineTo(700, cy); g.moveTo(cx, 20); g.lineTo(cx, 390); g.stroke();
  const sw = (t * 1.4) % 6.2832;
  const grd = g.createLinearGradient(cx, cy, cx + Math.cos(sw) * 240, cy + Math.sin(sw) * 240);
  grd.addColorStop(0, 'rgba(34,211,238,.20)'); grd.addColorStop(1, 'rgba(34,211,238,0)');
  g.fillStyle = grd; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, 240, sw - .5, sw); g.closePath(); g.fill();
  const integ = Math.max(0, S.integ);
  const ic = integ >= 75 ? '#22c55e' : integ >= 45 ? '#facc15' : '#ef4444';
  mgLED(g, cx, cy, 24, ic, true, .7 + .3 * Math.sin(t * 4));
  g.fillStyle = '#081018'; g.beginPath(); g.arc(cx, cy, 34, 0, 7); g.fill();
  g.strokeStyle = ic; g.lineWidth = 4;
  g.beginPath(); g.arc(cx, cy, 38, -Math.PI / 2, -Math.PI / 2 + 6.283 * (integ / 100)); g.stroke();
  mgTxt(g, 'LÕI', cx, cy + 5, { size: 12, color: ic, align: 'center' });
  S.pk.forEach(p => {
    const col = p.red ? '#ef4444' : '#22c55e';
    g.save(); g.translate(p.x, p.y); g.rotate(p.a);
    g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 10;
    g.beginPath(); g.moveTo(10, 0); g.lineTo(-6, -6); g.lineTo(-6, 6); g.closePath(); g.fill();
    g.restore(); g.shadowBlur = 0;
  });
  const left = Math.max(0, 20 - S.el);
  mgPanel(g, 60, 14, 300, 16, '#0b1526', '#070d18');
  g.fillStyle = '#38bdf8'; g.fillRect(62, 16, 296 * (left / 20), 12);
  mgTxt(g, 'ĐỢT DDoS: ' + left.toFixed(1) + 's', 210, 27, { size: 10, color: '#e2e8f0', align: 'center' });
  mgTxt(g, '❤ TÍCH HỢP LÕI: ' + Math.round(integ) + '%', 700, 27, { size: 11, color: ic, align: 'right' });
  mgTxt(g, '✕ ĐÃ BẮN GÓI ĐỎ: ' + S.kill + '   ✔ CHO QUA: ' + S.pass + '   ⚠ BẮN NHẦM XANH: ' + S.clickB,
    380, 388, { size: 10.5, color: '#94a3b8', align: 'center' });
  if (S.dead) {
    g.fillStyle = 'rgba(3,6,12,.72)'; g.fillRect(0, 0, 760, 400);
    mgTxt(g, '💥 LÕI QUÁ TẢI', 380, 196, { size: 24, color: '#f97316', align: 'center', glow: '#ef4444', glowSize: 14 });
    mgTxt(g, 'Đang khởi động lại hệ thống phòng thủ…', 380, 228, { size: 13, color: '#cbd5e1', align: 'center' });
  }
}

/* ============================================================
   Loop hoạt hình: chỉ vẽ khi modal tương ứng đang mở
   ============================================================ */
function mgFrame() {
  requestAnimationFrame(mgFrame);
  MGX.t = performance.now() / 1000;
  if (mgVis('crimp-modal')) {
    const cv = document.getElementById('crimp-cv');
    if (cv && window.crimpScene) drawCrimp(cv, crimpScene());
    const pw = document.getElementById('crimp-palette');
    if (pw && window.crimpScene) drawCrimpPalette(pw, crimpScene());
  }
  if (mgVis('pt-modal')) {
    const cv = document.getElementById('pt-cv');
    if (cv && window.patchScene) drawPatch(cv, patchScene());
  }
  if (mgVis('pc-modal')) document.querySelectorAll('.part-cv').forEach(drawPartIcon);
  if (mgVis('wf-modal')) {
    const cv = document.getElementById('wf-cv');
    if (cv && window.wfScene) drawWifi(cv, wfScene());
  }
  if (mgVis('tr-modal')) {
    const cv = document.getElementById('tr-cv');
    if (cv && window.trScene) drawTrace(cv, trScene());
  }
  if (mgVis('quiz-modal') && window.quizTick) quizTick();
  if (mgVis('lu-mini')) {
    const cv = document.getElementById('lu-mini-cv');
    if (cv && window.lqmFrame) lqmFrame(cv, MGX.t);
  }
  if (mgVis('boss-modal')) {
    const cv = document.getElementById('boss-cv');
    if (cv && window.bossScene) drawBoss(cv, bossScene());
    if (window.bossTick) bossTick();
  }
  if (mgVis('victory-modal')) {
    const cv = document.getElementById('vic-cv');
    if (cv) drawVictory(cv, { grand: true });
  }
}
if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(mgFrame);
