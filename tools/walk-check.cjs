/* Kiểm tra hình học thuần: đi bộ trên lưới 2px từ điểm spawn, xem mọi điểm
   trigger [E] có tới được không và có ô nào kẹt trong vật thể không.
     node tools/walk-check.cjs  */
const fs = require('fs');
const src = fs.readFileSync('js/engine.js', 'utf8');
function literal(name) {
  const at = src.indexOf('const ' + name + ' = {');
  let i = src.indexOf('{', at), depth = 0, text = '';
  while (i < src.length) {
    const c = src[i];
    if (c === '"' || c === "'" || '`') {
      text += c; i++;
      while (i < src.length && src[i] !== c) { if (src[i] === '\\') { text += src[i] + src[i + 1]; i += 2; continue; } text += src[i++]; }
      text += src[i++]; continue;
    }
    if (c === '/') { text += src[i] + src[i + 1]; i += 2; continue; }
    if (c === '{') depth++; if (c === '}') depth--;
    text += c; i++; if (!depth) break;
  }
  return new Function('return ' + text)();
}
const BOXES = literal('SCENE_BOXES'), WALK = literal('SCENE_WALK');
const R = 8;
function blocked(sc, x, y) {
  const cx = x + 10, cy = y + 18;
  return (BOXES[sc] || []).some(b => b[0] - R < cx && b[0] + b[2] + R > cx && b[1] - R < cy && b[1] + b[3] + R > cy);
}
const TRIG = {
  NET_ROOM: [['tuan', 130, 215, 55], ['rack/CONSOLE', 250, 410, 65], ['to_office', 60, 520, 0]],
  HARDWARE_LAB: [['hw_workbench', 200, 250, 55], ['hw_crimp', 480, 250, 55], ['hw_diag', 760, 250, 55], ['to_world', 60, 520, 0]],
  // interior: nguong trigger do theo DIEM VA CHAM (x+10, y+18) nen goc sprite lech 10/18px
  ACADEMY: [['Thay Duc (npc)', 140, 322, 58], ['PHONG THI CCNA', 650, 282, 74], ['to_world', 60, 520, 0]],
  /* Khu 3 — 6 tram ải + tam ve trai dat. Toa do duoi day la DIEM VA CHAM
     (x+10, y+18) nhu engine, khong phai tam trigger cua LUNAR_STAGES. */
  LUNAR_BASE: [
    ['1 LAB DOME', 229, 335, 90], ['2 BIODOME', 452, 390, 88], ['3 SATELLITE', 655, 280, 90],
    ['4 SPACEPORT', 755, 403, 90], ['5 CABLE', 205, 558, 88], ['6 SECURITY', 610, 573, 90],
    ['ve trai dat', 595, 473, 90]
  ]
};
const SPAWN_X = { NET_ROOM: 100, LUNAR_BASE: 575 };
for (const sc of Object.keys(TRIG)) {
  const w = WALK[sc], STEP = 4, W = 960;
  const ok = (x, y) => y >= w.minY && y + 30 <= w.maxY + 30 && y <= w.maxY && x >= -6 && x <= 946 && !blocked(sc, x, y);
  const seen = new Set(), q = [];
  // mồi phải nằm đúng lưới 4px thì "vung toi spawn" mới so sánh được với "san"
  const gx = v => -6 + Math.round((v + 6) / STEP) * STEP;
  const sx = gx(SPAWN_X[sc] || 480), sy = w.minY + Math.round((w.spawnY - w.minY) / STEP) * STEP;
  if (!ok(sx, sy)) { console.log(sc, 'SPAWN KET'); continue; }
  q.push([sx, sy]); seen.add(sx + ',' + sy);
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of [[STEP, 0], [-STEP, 0], [0, STEP], [0, -STEP]]) {
      const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
      if (!seen.has(k) && ok(nx, ny)) { seen.add(k); q.push([nx, ny]); }
    }
  }
  let area = 0; for (let y = w.minY; y <= w.maxY; y += STEP) for (let x = -6; x <= 946; x += STEP) if (ok(x, y)) area++;
  console.log(`\n${sc}: san ${area} o (luoi ${STEP}px), vung toi spawn ${seen.size} o, di bo y ${w.minY}..${w.maxY}`);
  for (const [name, tx, ty, r] of TRIG[sc]) {
    let best = Infinity, at = null;
    for (const k of seen) {
      const [x, y] = k.split(',').map(Number);
      const d = r ? Math.hypot(x - tx, y - ty) : (x < (name === 'to_world' || name === 'to_office' ? 110 : 150) && y > 500 ? 0 : 999);
      if (d < best) { best = d; at = [x, y]; }
    }
    const need = r ? r - 0.5 : 0;
    console.log(`  ${name.padEnd(14)} ${best <= need ? 'OK  ' : 'KEN '} cach gan nhat ${best.toFixed(1)}px (nguong ${r || 'x<110,y>500'}) tai ${at}`);
  }
}
