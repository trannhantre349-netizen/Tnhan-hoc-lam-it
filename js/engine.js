
var touchDir = { up: false, down: false, left: false, right: false };
var SPEED_BOOST = 1.4;   // tốc độ chạy của nhân vật: tăng số này để chạy nhanh hơn
/* ============ AUDIO ============ */
const AC = window.AudioContext || window.webkitAudioContext;
let actx = null, soundOn = true;
function getAC() { if(!actx) actx = new AC(); if(actx.state==='suspended') actx.resume(); return actx; }
function beep(f, t='sine', d=0.08, v=0.03) {
  if(!soundOn) return;
  try {
    const a = getAC(), o = a.createOscillator(), g = a.createGain();
    o.type = t; o.frequency.setValueAtTime(f, a.currentTime);
    g.gain.setValueAtTime(v, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + d);
    o.connect(g); g.connect(a.destination);
    o.start(); o.stop(a.currentTime + d);
  } catch(e){}
}
function chord(notes) { notes.forEach((n, i) => setTimeout(() => beep(n, 'triangle', 0.15, 0.04), i*70)); }
function toggleAudio() { soundOn = !soundOn; document.getElementById('snd-btn').innerText = soundOn ? "🔊 Âm Thanh: BẬT" : "🔇 Âm Thanh: TẮT"; }

/* ============ GAME STATE ============ */
const S = {
  scene: 'WORLD',
  weather: 'sun',
  p: { x: 480, y: 392, spd: 2.6, moving: false, step: 0, dir: 1 },
  qStep: 1, isFixed: false, lastBld: null,
  /* 🚀 Phi thuyền: true sau lần bay đầu tiên (luLand) hoặc lần fast-travel lên
     Mặt Trăng ở Lv.4+. Bản đồ dịch chuyển nhanh dùng nó làm điều kiện phụ. */
  ship: false,
  // ===== RPG PROGRESS =====
  level: 5, xp: 230, xpMax: 300, coin: 2000, gem: 45,
  name: 'Nhân IT',
  title: 'Junior Network Engineer',
  skills: {
    networking: 2, hardware: 1, crimping: 1, troubleshooting: 1, wireless: 1, datacenter: 1
  },
  // ===== MISSION PROGRESS =====
  missionsDone: {
    nat: false, pcBuild: false, crimp: false, diag: false,
    quiz: false, helpdesk: false, patch: false, wifi: false, trace: false, boss: false
  },
  // ===== WEATHER ANIM =====
  rain: Array.from({length: 130}, () => ({x: Math.random()*1060, y: Math.random()*600, spd: 9+Math.random()*7, len: 10+Math.random()*10})),
  leaves: Array.from({length: 24}, () => ({
    x: Math.random()*960, y: Math.random()*600,
    vx: 0.3+Math.random()*0.6, vy: 0.2+Math.random()*0.4,
    s: 2+Math.random()*2, rot: Math.random()*Math.PI*2,
    rs: (Math.random()-0.5)*0.1,
    c: ['#f4a4c8','#e888b8','#5cb85c','#7cc85a','#f9d423'][Math.floor(Math.random()*5)]
  })),
  butterflies: Array.from({length: 6}, () => ({
    x: 300 + Math.random()*360, y: 220 + Math.random()*180,
    tx: 300 + Math.random()*360, ty: 220 + Math.random()*180,
    phase: Math.random()*Math.PI*2, hue: Math.random()*360
  })),
  ripples: [],
  fireflies: Array.from({length: 30}, () => ({
    x: Math.random()*960, y: Math.random()*600,
    phase: Math.random()*Math.PI*2, spd: 0.5+Math.random()
  }))
};

/* ----- Hiệu ứng phụ kiện Cửa hàng (S.inv) -----
   engine.js nạp TRƯỚC game.js và update()/addXP() được gọi ngay lúc parse (dòng KHỞI ĐỘNG GAME LOOP),
   nên 4 helper này phải sống ở đây. Đọc S.inv phải guard vì save cũ chưa có trường này. */
const invNum = k => (S.inv && S.inv[k]) || 0;
const invHas = k => invNum(k) > 0;
/* Buff "Thuốc Tăng Lực" mua ở Cửa hàng: mốc thời gian (epoch ms) hết hiệu lực.
   Không lưu vào save — buff là hiệu ứng tạm thời theo phiên chơi. */
const BOOST = { spd: 0, xp: 0 };
const boostSpdOn = () => Date.now() < BOOST.spd;
const boostXpOn = () => Date.now() < BOOST.xp;
const boostSpdMul = () => boostSpdOn() ? 1.2 : 1;   // ⚡ +20% tốc chạy
const boostXpMul = () => boostXpOn() ? 2 : 1;       // ☕ x2 EXP từ mọi nguồn
const shopSpd = () => (invHas('shoes') ? 1.4 : 1) * boostSpdMul();   // 👟 Giày + thuốc tăng lực
const shopXp = n => Math.round(n * (invHas('thinkpad') ? 1.1 : 1) * boostXpMul());   // 💼 ThinkPad + cà phê
/* Chuỗi HTML huy hiệu đồng xu (thay emoji U+1FA99 lỗi font). Dùng trong các template render DOM;
   chuỗi text thuần/toast/Canvas thì viết thẳng " Coin". */
const COIN_IC = '<span class="coin-ic" aria-hidden="true">C</span>';
function addXP(n) {
  n = shopXp(n);
  S.xp += n;
  while (S.xp >= S.xpMax) {
    S.xp -= S.xpMax; S.level++; S.xpMax = 300;   // ngưỡng phẳng 300 EXP/cấp cho nhịp lên cấp nhanh
    chord([660, 880, 1100]);
    const newTitle = rankFor(S.level);
    const up = newTitle !== S.title;
    S.title = newTitle;
    showBanner('LEVEL UP', '⭐ Lv.' + S.level + (up ? ' — ' + newTitle : ''), up ? '🎖️ Danh hiệu mới!' : 'Tiếp tục cố gắng nhé!', 'violet');
  }
  syncHUD();
}
function addCoin(n) { S.coin += n; syncHUD(); }
function syncHUD() {
  document.getElementById('hud-lv').innerText = S.level;
  document.getElementById('hud-xp').innerText = S.xp;
  document.getElementById('hud-xpmax').innerText = S.xpMax;
  document.getElementById('hud-xp-bar').style.width = Math.min(100, (S.xp / S.xpMax) * 100) + '%';
  document.getElementById('hud-coin').innerText = S.coin.toLocaleString();
  const gemEl = document.getElementById('hud-gem');
  if (gemEl) gemEl.innerText = (S.gem || 0).toLocaleString();
  document.getElementById('prof-lv').innerText = S.level;
  document.getElementById('prof-xp').innerText = S.xp;
  document.getElementById('prof-title').innerText = S.title;
  renderSkillsList();
  if (typeof updateBuffBar === 'function') updateBuffBar();
  if (typeof updateQuestHUD === 'function') updateQuestHUD();
  if (typeof saveGame === 'function') saveGame();
}
function renderSkillsList() {
  const el = document.getElementById('skills-list'); if (!el) return;
  const names = {
    networking: '🌐 Networking', hardware: '🔧 Hardware Assembly', crimping: '🔨 Cable Crimping',
    troubleshooting: '🩺 Troubleshooting', wireless: '📶 Wireless', datacenter: '🗄️ Data Center'
  };
  el.innerHTML = Object.entries(S.skills).map(([k, v]) => {
    const pct = Math.min(100, v * 20);
    const stars = '⭐'.repeat(Math.min(5, v)) + '☆'.repeat(Math.max(0, 5 - v));
    return `<div style="margin-bottom:7px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
        <span style="color:#dbe6f5;">${names[k]}</span>
        <span style="color:#fde047; font-weight:700;">Lv.${v} <span style="font-size:9px; letter-spacing:-1px;">${stars}</span></span>
      </div>
      <div style="height:6px; background:#0b1526; border:1px solid #1d2c46; border-radius:99px; overflow:hidden;">
        <div style="height:100%; width:${pct}%; background:linear-gradient(90deg,#0ea5e9,#4ade80); box-shadow:0 0 10px rgba(74,222,128,.5);"></div>
      </div>
    </div>`;
  }).join('');
}

function weatherIcon() {
  return S.weather === 'rain' ? '🌧️' : (S.weather === 'sun' ? '☀️' : '🌙');
}
function gameMinutes() {
  return (S.missionsDone && S.missionsDone.gmin != null) ? S.missionsDone.gmin : 510;
}
function clockLabel() {
  const g = gameMinutes();
  const hh = String(Math.floor((g % 1440) / 60)).padStart(2, '0');
  const mm = String(Math.floor(g % 60)).padStart(2, '0');
  return 'Ngày ' + (Math.floor(g / 1440) + 1) + ' · ' + hh + ':' + mm;
}
function syncWeatherBadge() {
  const el = document.getElementById('w-badge');
  if (!el) return;
  el.innerHTML = weatherIcon() + ' <b>' + clockLabel() + '</b>';
}
function toggleWeather() {
  S.weather = S.weather === 'sun' ? 'rain' : (S.weather === 'rain' ? 'night' : 'sun');
  syncWeatherBadge();
  beep(400);
}

/* ============ CANVAS ============ */
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;

/* ===== SPRITE KENNEY HOLIDAY KIT (nhung base64, khong can file ngoai) ===== */
const SPR_META = {"bld_office":{"w":174,"h":148,"ax":99.87000274658203,"ay":109.37000274658203},"bld_hardware":{"w":178,"h":121,"ax":89.02999877929688,"ay":94.98999786376953},"bld_academy":{"w":174,"h":139,"ax":99.87000274658203,"ay":99.5999984741211},"bld_it":{"w":149,"h":135,"ax":74.41000366210938,"ay":109.37000274658203},"bld_dc":{"w":189,"h":134,"ax":99.87000274658203,"ay":94.98999786376953},"bld_sales":{"w":149,"h":126,"ax":74.41000366210938,"ay":99.5999984741211},"bld_isp":{"w":178,"h":121,"ax":89.02999877929688,"ay":94.98999786376953},"p_tree":{"w":65,"h":89,"ax":32.77000045776367,"ay":77.45999908447266},"p_tree_snow_a":{"w":65,"h":89,"ax":32.77000045776367,"ay":77.45999908447266},"p_tree_snow_b":{"w":68,"h":92,"ax":34.11000061035156,"ay":79.73999786376953},"p_tree_snow_c":{"w":65,"h":89,"ax":32.77000045776367,"ay":77.45999908447266},"p_tree_decorated":{"w":68,"h":103,"ax":34.11000061035156,"ay":91.38999938964844},"p_snowman":{"w":49,"h":59,"ax":23.18000030517578,"ay":47.81999969482422},"p_reindeer":{"w":48,"h":61,"ax":27.049999237060547,"ay":51.59000015258789},"p_lantern":{"w":35,"h":83,"ax":17.40999984741211,"ay":71.73999786376953},"p_bench":{"w":62,"h":58,"ax":30.479999542236328,"ay":38.61000061035156},"p_present_a":{"w":36,"h":42,"ax":18.260000228881836,"ay":29.40999984741211},"p_present_b":{"w":43,"h":40,"ax":21.440000534057617,"ay":25.940000534057617},"p_present_c":{"w":37,"h":38,"ax":18.350000381469727,"ay":25.739999771118164},"p_rocks_small":{"w":79,"h":63,"ax":43.86000061035156,"ay":35.47999954223633},"p_rocks_medium":{"w":93,"h":78,"ax":47.720001220703125,"ay":47.65999984741211},"p_rocks_large":{"w":153,"h":117,"ax":71.18000030517578,"ay":75.69000244140625},"p_snow_pile":{"w":57,"h":40,"ax":25.90999984741211,"ay":21.049999237060547},"p_snow_flat":{"w":91,"h":54,"ax":51.869998931884766,"ay":26.15999984741211},"p_snow_flat_large":{"w":144,"h":83,"ax":61.810001373291016,"ay":43.529998779296875},"p_sled":{"w":64,"h":55,"ax":31.850000381469727,"ay":34.70000076293945},"p_candy_cane":{"w":21,"h":28,"ax":10.800000190734863,"ay":23.229999542236328},"p_candy_cane_g":{"w":21,"h":28,"ax":13.979999542236328,"ay":21.389999389648438},"p_wreath":{"w":37,"h":45,"ax":15.859999656677246,"ay":39.52000045776367},"p_fence":{"w":52,"h":48,"ax":73.62000274658203,"ay":39.529998779296875},"p_bunker":{"w":97,"h":58,"ax":48.04999923706055,"ay":28.139999389648438},"p_gingerbread":{"w":25,"h":28,"ax":12.789999961853027,"ay":20.81999969482422},"p_nutcracker":{"w":32,"h":57,"ax":15.859999656677246,"ay":48.83000183105469},"p_sock":{"w":25,"h":39,"ax":13.239999771118164,"ay":32.52000045776367},"p_train":{"w":39,"h":35,"ax":20.8700008392334,"ay":24.68000030517578}};
const SPR_DATA = {
  bld_office: "data:image/png;base64,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",
  bld_hardware: "data:image/png;base64,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",
  bld_academy: "data:image/png;base64,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",
  bld_it: "data:image/png;base64,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",
  bld_dc: "data:image/png;base64,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",
  bld_sales: "data:image/png;base64,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",
  bld_isp: "data:image/png;base64,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",
  p_tree: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAABZCAMAAABWrLmBAAABIFBMVEUfZVAjXUwfXUoSYSkpkG1XbVMjimowp3encFFlSzpTlG4MKh9Z5J4dYE0fspgVHx1Ip3eHTDlNMie8dVVIo3LXhF9/f38ZSz3KfltvRjZHo3OchmOPWkIaTj9AtYE/vz+q///QeVYkgWZ//3+GUzwZSz4AAAAdhWksh2YmZk8ld1wEBQgbWEjkjGMmWkYqlHEje2AcZlIAf38dfGIDVVJuRTXvlGgcdFwZTkCVW0MZSz48f3+KUj0A///HeVYBPDwA/wAQERGuZ0pqPC5EpXYAqlU5oXY1gF5VqlU/fz8ok3DSiWIegmdCmm7Wgl0ojG9VVVUijGsZTkAkjm0ZSjwtlXAAfz8jjm4USTwjjW0bd1+paU5Vqqojkm+bYUczZjMDPRFUAAAAYHRSTlObHFoVl/9bFv//8xIF0w5Fa/9ToSLyAmbEZJz/dZw7BAOx1wJuyAH+/v7+Lf7+/vz//gL+Bf/+/vr//QT/Af8GATf///0D//8DBNH52fvMEgNOzrIptgR2UjCtkAMZ/wXqWdq3AAAFBUlEQVR42tWYaVvbOBDH5SQknKXl6Lbd7r0ry4qJbCc4gSQQQggs93KVQqHf/1vsyPIhH4odeLM7Dw8vYs0vMyP9RxMj/FpD/wdC//UxXL6WsPaqGAbdxU8EaZcvJ9TwpxGlJfz3SwkHeG10RinV3pdfRoAc5kdnhwZFE4OYQOjit6OzM2rwPI5eQniP184YIQY37bI8PWHw7ddjABDKCWjCqVASvuG3HCAIRkmNUBGcwRsP4BOMsjMtYRFXYgT1oUCqMvohBARDK09H+CMIgfgAKObRNIQj/POY+ARbEBrawJmC0MW3IgQrSIIHoRUnfMc1AFBq26ZpW6AMUQl8V5TQwhrxvLnZALAsD6PBk0IEB9+Ygbvd1PVms+1ZU69hpxCh9f0q9IZc2jqYB2HX/W4Rwi5GZkd4Qyloo9EwDOpRdPYFekYuoQU5bNu6583NaHhmGMAg7Gs6D5Rq7mWzY8JiGicAAxDsuNvPIziQwzbEmyY0KA+ikjqaKAkomdttWEnThAbUhrFqMo90Hf6CIrBMAuTBbi+OcrO44d8UJkEkAkdcpK7BjL0oEZ9ghdoMEKSaPpYoQ1XXY2ZZvjRJJC0gZPV9lNEgK4GyQZl2m0qMklOAMMCLosP62rJ9WYHZxpIzyCcc4WroHWiThpSbAnVwtKXQG/zbTTCLCgy10JvcU72LfwqcbZuKvaAWx3BIGw7UwWTCLr4X3m2xGf558Clti7F/knmgxHkqm6BM4X146J2HhuGLEyhwUo5riWqixHG6MrdNRiSLtAlmMcKu8S9qQovrytQlAo0TDAgC8qipCBzQ2W4znyCyoIbMgNqyRJuJxwA52GzEAm/pVMuI4wsFocWbi0nGY7kMki4AA3+Q4/gL7mYS+rjVMZvjEVMSPIiujgGCuG8zGcCVZdM4o0FZTV2HLq7MM8lbUhaNgqjiN8rdrMH0JiKPpOHdm1SmlLstJeEO33JdmrLZYcf0BZocL1FMFCXDjBtcfb4yAwr8q2Llbmpxb7hrfWtaEoawJ8fJJrSuoq+OvFMULo1MAu8MHYV3SIGUQOFwAztpgieKjndpTzbCPGm0UgRH64CsbD3fOOL4qdVPELypAZStF0RUQmmgAPADz6FZkMCkbofCjewUyyFEBFvqx1BeUuRAlHnc+l0bidkLitAx9eIGfSwYqkQM2hVvbxkrrZkZMYZlBHEtE8T0lUpgptfrvdvfn6OZpXhy+hGBb0XGqud3va25zc39uYxqwGYcyJW8ww8kHcIsEDbB9mfS9EpwsH2C09fSi4ZbvS1BmEs9PO06/fiZPMClZAjWEACCsGklCV9hUknqAiOSSCIkbO4biSJUo34fEgZ3C0txwuwQAFu9jEKQijSiI+nejpeCzA6fh8Od5x5nJApxkdUfvHlWzsPamd0B8wLZihciNkPEb5xoS6EM4L6+vrFxsgPB9IxIIaDsXUWvXljYPY2+6McN31yXU6SNbC1MmIJKcLGKEEKAT5kXQRCmlydPYiWEPMD8RtIAQfRThO7zf2ct3KOH309ShJPTB7Rcr+dOpPW9OrdzN0Vwf/Oe7NXzCGLVagbhsb7sPS1CyArCPQ8e5dXBX7aSBGysZANUhL36o+u60V667mc/h3xCmMfn1XPh67on56t/KnLI3M16aCsfHz+sf3j8uBx9VOy3fz3IJLS9PSVA8QYjco2RpnoXVE/bC94NFnD/j7wr/hdVapVVX/wIegAAAABJRU5ErkJggg==",
  p_tree_snow_a: "data:image/png;base64,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",
  p_tree_snow_b: "data:image/png;base64,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",
  p_tree_snow_c: "data:image/png;base64,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",
  p_tree_decorated: "data:image/png;base64,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",
  p_snowman: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAA7CAMAAADl2ZJIAAABIFBMVEXnj2TabTrR5fDN3OSbm50eISeaZlDb5OtbWF35m164ztyPm6TR4++TUzOqb1b//wCQmJ+xajl6aRD/AABzn6BTXWepaUvkaF96fZ5sfIevr/ezclVseYObpq54h5FWX18bHCV/FRWxYDQA//9teIJtRTS1gGl/f/+1zNK4XTW7zdr/fwC6ydF7kJ0rMzamu8nGbziit8XSf1rCfGHwlGoAAP//qqprQjOnucV5SSrYoY1qPy3AurhhPzUwNEAAAACbrLdwfIXP5vTD3e6EjZSJkZiesLuPmqN6hpADBQb///+isryousaxxNHb9P1/f38QFBa81ufj+/+qVVW/v//MdU7R5/X2d0Ktak1pdX63dFS9vb3I1Nz/f39rRDSkqrBzhFYOAAAAYHRSTlP0+2bpERjxEP0W7KGX8CIBZhMMAQtLTRAMaQSq0tVzFP4CqgGbm/8CEUJTAqP9Rse+trL/fQED2mZlcP/VTD8B/v79/v39/v7+JgL+/v79Aij8/wME/dP9+/38BfoC/vr+ISZMAAADzklEQVR42sWW53LiSBSFBSKDSQacxmHsmd3Z2dmcYzet3EECtNhE8/5vsbdbshEizLpqq+aW7V/n87mpb0lDLw3t0xGUvoygc4Q6udMgCD5CNMLwdfsYoRxCp7kXeLwGj+zKrFabzVzuIPElan17+1u7jWjTXKwsB8KycijYT7TC20wmc3R09GfpZgViCNOpHiLC8m3mQTKzkrswQa6gbRMtkX8r8wDIOKMRLDMyIZzmAQKF6AtAHoBwXY5lyFJyAd3fqxNAgNEKfRfktm0zhkUWzQ909wT9Ph5rn/X7fWzjKAS5Ts0/SVBUxG5fhhsTNhajLPpnL3EXdF5FRB+z2MPw74vSI1iGu7IK0FlMOAyKsBnmhCiT9r4tCXLKxOEmzFyV4RP/fh6EqHfx126CXrlTSxjMlcMwLSwYN+6hwvpkPOvRcJu4Q8gUhmFgRbgrwswVu3z79pfCRNO08s9bBD1/l10wYVQcZeEyBi6lPx4fHwuTyayMllvEHNV46YYZIgJMt29hDvqjwmSmaT2YV4rIofekdFMyDA5yGaZr4RXIx+OCTCpspAhKz3VSAgBbaqksyTnMnP1w0aPlH8vwglLEHGVJBQxcOXIG44i4r7BOkRzicbq7lBZ1wxCOGrncQ1vtIsOVLOTbWC635iEtBAb51GLx/NT+YlLb2CxtbUF17k5hCxkR8v3JXwUS0qHBDqKDqs5UJrQgBJbEVI9WdXm4ub7a5hY6oDcEVq9W6eEvhvX9nG4Td7TzyoLSiW5NLW6z+NlKztgwSVb+QSdkIWt3WVy2rTosRjqiuyov6gSWVjbXfHpPkmPYIH4WnaeJRh3VdG5N40ebDEY20ooJmGdx4UT65GFQT52QZOlPHvVW1X0G3A2iQka1dOVl1JsdlfrrwMlCCESRbnqUw8KsUCisCYetLeA4kHQdx436xWSiLtsOAsqA64A2PVqoPhtr3z8dKyBsNY/oYsmsoL00STTa9YuxVj5bE/zZRCZFkrU/T7B+sjx9bpUgxnAoBOdRUrL0n2hqHku5i2/cyEBwI9IBmLZYe4TLa3Qd6zkfErhaEvN9Vfi7c7rriubzbxwsFGDEhK+I0Xt0uvPu5lFX6UXkIBFfIv59Pr/nUg9QVUj9ExAhxP8V7SM81OX2cK2PiJGetEhdam9wyXkCgFaNRnoT7ScG3hm3KyQB+P6HPHgf8PAuhZxZpDd8v9b1vMGhL5mB161+UxlGc4MmXXle3jv87eN58PN196r6XaVCmvD/Pe9jX0veYAAqFX9L4D99w4F4oLgd+k/6Lfq/Ev8C0da4lyFN7qIAAAAASUVORK5CYII=",
  p_reindeer: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAA9CAMAAADcQhprAAABIFBMVEWjYEUmHR6fYEdTMidlXmdSMytZNiqlZkhnaaB1XDWnYUSXUzVlX2XwllwyIB1sbXmETzrjZVKbVz2YVTzVflp7SzhvRTbPcFWTk6HT1efMeVT/fwBDLyqqqlXUuLObm6fdg1xpaXk8JiI/LikzOGE3Pk/gh2C2tsK/v8mamqjih1+/v7/Avc3M0eFpb4F4e4YrM0G/Pz8AAAB0SDawZ0iLUzyWW0IFBQdSNi2lXUFqanjKdVKDTThkPS99fX7CbkwICA14OzhQNCr//wB9UDz///91doKjWj5KMitQNix/AACqVVVVVQB5Sjf/AAC9clGdYEVVVVW/fz9/fwDZgFpyRTWHiJb/f39yRTOaVjyqY0U6OjrRelWVUzlwcX5NNS9jw6qyAAAAYHRSTlOXGNVTGhufHBILUhjnEl6mmCDVYMupVmP3/poC8AP6dqtZmf4PSkJcGK3/BJS33UbdBAH9/f79LPr9/Pz+/QT+RQWKAf4B/vrQLQIDA9YB/v4DBAL+jP4CcK00BBTU+m7zIFW4AAAEA0lEQVR42t2WZ0PjRhCGJVdsersD7nI9ufSyO7taWcUNYxtj+6gBjvL//0XeWQkbg5LAx2Q+IFnMs/NOWWkd8Uxz/pvAn88Diu6zInwVLeNUDp4ToSf1lTh+OlB4LXXp6ZIORN9IaTaPDp4M3Br5UVJ5IuoOiH+a6/xNzq8NOWKQFSGOk+vh9NG+6Bmjc/PH7VmgI+befv6er3d+d4q+GgNBcXnQvg90OoXa2dbWD7+JGL79VnESpJg3EVUfNS4W7/dqtdreTRzH+27P9PoiqUrfQBBcLp3qlWhPgbnC8k2NiWVR2Hdb8Coy0RR8S+sVhyjYuErycGwGhVpie3OoC+cJooIZKuLOX88RgGBx1JlG+LRwkwALblzs90GUbs2wOY8Q0ndIf6EfdxBwCojlvSTE2Vt0qschzEeV08OhxF/SdBJctduPkob/9s9HtyYxOQ60gu3usv/q3a5IgTSJre1fhHDzL/J5Mw4CgvOulFIR/AczfRBxqmj7zY6zubLiXG6cjAOS7M7EvPhjttOHsU1i4ewNkVZaa4myjPUEOO80ZwHWhDrlCL46hMeu1ISLNVzl/GRa0uED8WvNt/5YXqZLq9RCdfrp4bRWRBnl1hrrhZpXnQJhKGnh98IDoF22eqwnGkvJXcjuDNDCt+lApsA3onqnH1Xk+hPZIJrvQz/IufFMhCPhUCof6WppAJBKfvm+jx/z8fFs0lZRmC4qI9ZVt7zy0TgKnPuzxLsmRM5KhkmmaSJ10paoBxxiNJoCTXEOR7t+6NsiRWQJng9uIkK8g+4JMBAv4BtZBfBQ3GprAY+UBU42xOJMH1JAUWgzTaxOUsO7Djt5mcxrCrCmKIqg178PkDQySGKk/lOgaluAEnKe2GL1tEwRIUDwbjERNAEGwvG5qSDQsBB9gIrAdgI1db7j1t4H2mKRFGaICfLhhb0P6VwuQ8GlXXEGeCUulW0xCAqNQfphEGhuiqQdUV59+Lpv2rJCuUZf4c7i6mS7TnS1Gmd8H5q2pEQ+yuqzqSAFnMyPYlOcJl2rXuS6fpeJoM4PdPCyfZQBjEQFY2/MEPfrPJ9+iHKFYWR0WbgZALIOudORK7y8nQ09dNfwiF+aIltSxLVRJeGVEu25PCLitpUJHIoSWtBV6trzlpKCOSVUC/v/OvPDPhCbVjmteI0luzfHzgdbLf/aywJejaq8D8nPew1vqJCsXGqR3+126UJ4WUeHkVh3cmsX516j0bCDHn3wVrCGf+16mQB/SGAerGXTD4eNxlLpNM9Psg8nbuqPKimF9NVSo2F/e/9wmrH/byXpX0Nc498Ai+TXiN9Ep56XEeDxWYOJi7Uu0s9yzzycwMdzU3lPPPNZ9//XuXXG/gJ8n0b9Q5ghbQAAAABJRU5ErkJggg==",
  p_lantern: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAABTCAMAAAAiJU6qAAABIFBMVEV0kJ5cYHUeHyNvZWZ8ZhBPU2jjoUablavZmTxjYXY5PUpkaYGhai4camp1YDysjGuvlGa2kW2Id2uGfHWZmcw9QVOkby+GYjj/AADpmjd/hJx/g5z/fwDUhjjjljqDiJ9/Pz8A/wAAAABVWm9DR1ZzeZA3O0mndTNdYXh/f389QVA+Pj6HZjI/P3+sgz2GXSpjZntJTmF8gpk6PUtVVVV1e5EAAP9UWW9WW3I5PUpVWW5SV2t0eZAA//9kaX5HR1NmZnJwd497dHb///+BaU0AAH+RcjjOmkhqapR0eI/4tkuUhHiYeEvmqUh1eJBVVapTWG1VWnBJSWc7QEwzOUp1eY7unTc6PUtfY3lna4M/P1F/f7gXFzA2OkdOSkxOUGTQgApaAAAAYHRSTlMRmhXmBWDcC/8Gj+ESBf//rgf/SgVG/1sBgcR0AiRT/wQBAPz9+/z/+wL9BP0E//79/v9SA9EBUs+sq4ptAVISCBH+AfoC//wHWP3+//4sA3EWDq0ul/7OrEoQBAtpqDkpD3QeAAAC0UlEQVR42sXW+VPiMBQHcFTU9dz7vl/SkpQKpRSoHMutoKiouN76//8X+5JabTEtzLgz5gcGhg/fl7YvIQmYPBLPaDiA48QaFEeN+Jw2wFfmlisxhrcTX2xCCCtf9hq8rTD8EnoFW7MYoqE6B6eyX9D8cdLvN8fNAYoT8WWrJY1t29q++F0wp1nVbBQdM5VKDQZvUNrVkKnxPs5E0+ay2a2UHBkR1uS1B7PIBbGyOLYy0rx4GQhKeC/7MsXMmr5ZEEG9du1hPryHl9TCGDQS7f3dfQi6M1DFYvGmJoOwlGlKkxGm0A/ORwT1f2odz2RSHzJ721qVQy10f2rQPClIkxJB2zsLTXljHz3Tj6aXk0HzGV4rnukSrCJZ73QGAzQ/+KrCfIKkuU71HDYH2d75Dt9U/ZOGG0PXqTC7C8mkssccGOm6QSklTHsFDXUfdn+dYgqlBtHe/l5Tmw2oWITmSI6cgxPRz8WGS2UxVuJRBnOojoRaZXwftb7qhjBk7rAbvQbr3nXNhGLCxkkfS3NWjDZpOKaTcnxz9mSzOUUtNISSP7FmeQqTn9ZYUxg2nTmYOJ9FKD7JAIykScSaCzmfWMOvqGjoOMPhXMN1QQ7j9vBzXBeGYZyuJSNzGrh9i2VK83iJEeaQWRbFbrVuIteXc7mChlKdkOj5LM1ZOdFkdKbB1WYD5olcX5TOR61B7EKxt8huTcNkMwwGqQ2rRJrre1OKNPkpjfH/jDH25EPP60L3TI4cRZq67s05xvC62MKxXqQpYjtgFWEM8i7YQPcGd8nbMhH/FhQrbo6UOfUKkQRbUajl9Lhx4PZOeAPR6WjsnJCGGRIYjOR0/dqfk1/rgoQHFtz0m9o3dZexMFopj59JujAMIma5pavu43s4W7lXjFSU1z4LkC9LxUh5Vn5W7xvzrsWY+z7mXCd+OnRLAFdxZ0jHP5vFnkUPxsXznntV4x9MhKc8yqBJLQAAAABJRU5ErkJggg==",
  p_bench: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAAA6CAMAAADfjhpgAAABIFBMVEWfkaGcXTwXFx5XWmxUW2hiWmTFzvdqb6Css+hVWWyoYkinZ1N1ahOhXkScZ1gtL18nJiz//wCCTTiuud9zRTSZVztdOy6jWz+SjqSlpbitgn3qe3B/f//CyvNrNyLDdFLEdVK6wupLJyO9xe1vRjOfqMqjq84+QU/BdFA2S2d8gp4yN0V8hKBpQTK+xe7Ey/WXnr7MZjN3fZeafoIAAACzZUYEBgkHCQ9kZXhcYnaUVj1XXG+uttmaWkFnbIKjqcu6w+yRl7WZo8VwRTR/f3/FdlKpVVSjXUH/AAC9cU+yvONwdo7///9VVVVjPS+UYlXBa0m3YT17gZumWzytdGUnJyxmW2V/Pz+ZWkAAAP+XWECaW0FXW22DiaVQVGU9PT20+KnMAAAAYHRSTlP3HButGuz5Eg1jnhcGT+sbYQH7aZug/2BlEf8VAq5bnNRcItBizpiWci8tYP/Vj2iPBX7/Af4vS/79/f79+/79+/7+/AL9A/4B/f3+AQX8/v/6/vv+Df0EdgGqzs3+iQWg9ue0AAAD10lEQVR42u2XaXvaOBDHjY25c5CjudOkd3fbPccgWb4N5r5DmrZAvv+32JENxIQz7MvdgeeJXugn/Wc0f0UI8K9C+K/hZQ8a2+MRAA8KW+LeBfz5+uYdlLfBsxcAn26KivuuUXg5jrovXheLxQP365sX4x5AGuFKUWm61/DtBbj37fGxAd4nhCsVRXebmSD5jfBCUOedG04riuKqx3h4G+JlhE+Ojo5SYxi1NyMbVx5zjPzQXQyd05ViBYd7G7YN7hxJqbp6cOA2X7mKL0B1JchsgmcwwwddVUuoGQv2StVROo6S8LgeL6PunZ+quisQxQ8VJfCl7j/D3lrc40mrqi44Xxj1FyipKmagynIDvq/BedIPmHRPcJwapZS0FJSulNymzKTGGsfxY93RdQ7Yjk0oZZTet4IMZDaC1ZXnh/UTS4az7xzTpoQYDBfwM2jLLAnxFTju7GHSfr07547ZRdC0DeQpCmjds+gk9QV4JguZB9RdCqotOGaN0JpW1YY8A0IYGzQKyy4rP+mxbj9s00bErmpa1anxDBgdTU59DvcPKwRj6rg7I3cC8lrV5iUgSVi8u5eFyLE61Y3R+1vTrKpNOp1zky+g4SkQaXpThvGgQ8OwoqvnFoZ2p7Q7J4dVCwV0qSEVFuBB0roehrl6QRN6ipJKAyQ+aLaBxSNRqD/D+UWUmtm6FIw7+G2n8JITowB/EU7P42XsUL0X1v00bu+eBJP69SjfnBpPtRPGNHdWK6R7mkNbSYmQywWzo3zz53i5HDnW1V27Nu7qiW4/Um8Q5uFPl7l2Q5pp2jKkuS0dY9zVYd3XuacAUZQMvrscLcziPcVBY6Gz6K7ee9J9lMvl8+EFRgYz0ALxSe04noV0B401pMTv6mkJfuwj7McUTxpDzTKHUbgMlS6bPubOoNToTn2ptOR8KMa8+D5mWbG3v9Sf/YcVTMcgrGvZtfEC90zKz/MQPbSsQ5g1bB3OnMBY2NVDwnnG2Mf8Ih7icejPWiYOp6bZZYRwW1S1Li8BY/uL8JyI7fPscRKHP0wNcx+kBI37yuQZkP3Fu8+9ber1M5Mby0zC9el735cCdufHDXGoJw6tWOzt71FUljvV0JfoLEPK789rX/KySlz9luB/ccLeB7yVsHqD/Fp6gp/5hvCHYg4G6Ev8zNPLcLhMJCanIYojg+Nk0nShpt3gWYitSXxj/ZqbjU1flXsBPlpLL8b7soHuQVuLK9kluAgSobZtDGAVuRR/BMk2rZglbPeiLlzGr2IYt/3+Vg9ytOPt1S3PYrv3fNAC9e1/DiTqie///xRaGf8AJ0PjL+F6Gn0AAAAASUVORK5CYII=",
  p_present_a: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAqCAMAAADs1AnaAAABIFBMVEXg4OnV1uBxZm+kS0lqapiZXF5nl513X2Tx8fSaODKgKSVsLy+nQDy+Oiu/Pz+oX195e4d8eYKqVaqPj6N8cXeHh5BVVQB7NCyjSDYAAADz8/anqLN4eoNzc3z///9/f39vKSqJiZKmOTSvsbjq6u61t8Z2OTlvU1qcnaqdSkyanKqXMzJra3XExdS/v7+Ykpydoa719feklZ5yc3ypd3ry8vSmV1WnSEV/f/+whI2jo7BoGxuqqqqllqCRcnfMuLxzSU3/fwD/AAByPkJ7OTR7gIaWKCnr6+2enqrU1NTMzOJ/AADi4uPp6epub3rIrbZVVVW4uLuvsryztbymvMeqqv+nqLKtq7TCQDEVFRXBv9DHx92lnaWsjJKgfIezbnEx5mGFAAAAYHRSTlMg6hYXEv0Nm2aU4DP/egSO21QDJ15VA2EOAP7+/v4CAv7+/f7+/f3//v8m/P75BP//0v/J/a/+/gL/Jv4D//3//QIB/hHz/kIWMSMCY4nH/wMm2ooXA8lu7Qz/FyJg//+GVFDZAAAB+klEQVR42r3U53LaQBAAYIq7kzg9We3dSjpxIIrAEEoIobj32E7vef+3yEoGIYFM8ifZ0dyMpG92d+7mNgV/Eal/inZ3/4x2APbPFiLTXIHsc4Ds7Yg+8HL3s1rfvz3Ta4DvTx632x2Vf3YvGe0QHL9DWwghl1V58+zpPKKHcPXjrUYhGYlBZx0yNIu4Unajq9GVFcmPGJU3g49RRPB+S6kmokYOV8o9y1pdmc30STfV4UB/1X5PqGt5yyocPIggouOPjm5utDXnsf1ytu7v9UbCXs2YE2RCiWs0u5e/7G20pR+FZfw5klJkwAzRK0TH6yrVHyNR6OW7mpMuxZCnsaPuNEJkWZbNtaeZXsKphy4jFUV5WXG9Ev+coJTnulhUqoaOj0SAREWkT0NEjDAJ2elvRJN9CjrHYjlA/qncIHk/BQRTVHLRYdRwOFOIxBtYgnnUd7B2YAs5Ri/IjKFtH5UbTjrHgWGmOOLdLB6WhzkjiPSgF2SaRQ4W20MjjGHeEvYcQrw0opFrCDmDHqHHlXIRww/GEMFJzpgN/pK+2aYJShlGgqrHEFErQRlrRPHbclSfJa3xoUwRv57HSP0cJiZy7wiuL6bm4gtUKeEGVwFOxq21ruGqmjwL/DbXuLX60bRS0lQhLkJVIFo4nyhcFk063jP6v9N3Ln4D3Niuk/3j6Z0AAAAASUVORK5CYII=",
  p_present_b: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAoCAMAAABQF/NcAAABIFBMVEUAAAApcmIYODQbS0MZRT0cUkcPPDskVUp2aFN3V0UAVVWodVlSVUcnaFpVSTxSTkG0gmQiTUMGFhNQY1IcSEgAf38pcmIpc2MeTj6OclkA//8XNjE5QzpVVVUPLS0pcmImc1wqeGcpcWAVNzOzfmCqVVU/fz+DYU4eTkQZSkMdSkKCXEoZODYA/wAhXVIwPDwnTjoiTUUgTUUjT0Z6XExVqlUmWUwkJCR5bVVSTEEmZVYAfwB/f38dU0cfWk0bWUtidWD//wAfXz9WTEMmZ1gobV8eTEMdTUQugG4eS0GKYk8kbW0cRj8qc2U/cF8ZPTeygWYnc2NgY1IUMi2tgWMcOBwnbl4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7wHcZAAAAYHRSTlMA/vz9/PsL///+A/z+/P7///4T/xECqM4Q/wGo/gMMjRYYN5D+AwT/T67L/3QBaA0NhF86tQMUBxXLNQICrlIl/wEINZmxjHr/M1MHqmz/0G5NVzPPCW8AAAAAAAAAAADHUEoCAAABvUlEQVR42t3V53LCMAwAYMdyYichDWEVaCnQ0tK99957r/d/lMqGtHFICj971V04Al90ks4IQv5DWOrVGUCiKVgY4TPpUURyxSjGBNLJX+QJfj89aypL6Tx+sp9GMc3NDAfoWrpzS8hSoqwRsr0CAWMM8JLeb6+fJTVZrJHasyuTgmlKi5UM2e3RiaWk7l/fs5UAUAKoCgB82x7Fsh0nNtG1mXzWdQMwMXHHUj/DpaWx2RUuA8i0XMFlqaEdmsvwIG5PV4GjrfC8YLLe0NpzPt7TsQhdnsWOGPB8JStU2m9rZ7BsM2ot1bYJIistRPJKy8yyZkG1JFy0+A44BvzY5YgtyzmhF25LyMc8Q4bHOvbpSBuC2eleuK5gnBth5G3bp3REO2/KAle2mzTUPmUjxai1DkJbeTT08CCWl2yp5kAcG73h3eu2IGcK3EiMEpki2iBQesn0OmYtliYNo95c0E5OOVWWduOHt5kihw8J+dDp3l0pkS7mCMn1/tbGh3vk+Vva/nAedHkxnZizu0Ia9Uihi/1W03hY9ifmzPXTL7Ls+iYhY/22XnEDx9doDLYiO8hZGHD3VqvVP/zP8AWCZR2sTVuPIgAAAABJRU5ErkJggg==",
  p_present_c: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAmCAMAAAB01KKfAAABIFBMVEUAAAApcmIYODQZSkF1V0ZOWEmmdVoAPz8YRT0naFodU0gA//8LWFIqVkknTEIpc10/fz8eV0oAf382QDcocmIaODWXdVstbl62g2V3aFRVVVUodGEqc2KtfWEeTT5RYlEAfwA7OzsaOTQqdWhTTUAfT09VqlUiPDcpS0snTkYqdGWBWUcqdWRVST1yWkj//wAcSkN1c1x/f38qdGOCXUt/fwAgU0aNZFHHl3hOSz+FdmHGlndFRUWqVVWieV9OT0S3mXqpf2QdWUyke2P/AABCWkzChWHyrogbQz5Xcl5kVEaqqlVnYlL///8LLCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADlZRpzAAAAYHRSTlMA/f78/v7+BP3/9gEH/P4XBKsC/6ll/xD4/gMuUv8Q/wIErRf5EAPxCy/J/5H9MQGk/gJ9tgJlUfRU/8YLA7jJGVY82gF/FSlm/6MDzwEXAAAAAAAAAAAAAAAAAAAAAAC7JuigAAABRElEQVR42s3UaVODMBAG4IWwKSChii1C6YVVaw9t633X+9b//3OM7YhJoNhv9Z1hYOCZXRiyAfgX+bj/2+zx4zLnuVfgiQGuLwAOZ5hBPD0/nZ/cHQPEmegNoPNc5nk/C0Mc705bK80AHh+IqSdpnwJUFFSBwU3QILoQPODlmjLrXAUBmqLaMYzXT8lsD12fBkiEfCvUy+D8qjpxKQ2ZLRQjDHsb+joUhFrEDbHhu4JaNRgqqk5sNgqopHoG2qasbIK1mu8SsZZh6GRFVJu2ibRGU8pMK0pZvnJ4R0r9uRRlVhLbnaH8F01MI/X2zhHBkabEwrZ5K/9HpmXEGsKyiNa0zJS8uRQsVjUr1SzUjdQlXeynUDU1Q3xcopJk9ouTyVLCF3i1m5h+BLCVOf/8bqs4SasF8tcp5ZJLL2c/WfrJojfHL/IRGt7/veNuAAAAAElFTkSuQmCC",
  p_rocks_small: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAAA/CAMAAACWyGV1AAABIFBMVEUaICvW4ubN3ulVW2xXWWpHS1wfH13O2eG80t83O0hvdogmdnagrrOTmqKjq7GirbShoeWtvchITWC7zdo5PUs/QVJ0eI91fYu5xMx///94g4t3hIt7hYx7g4t0foUmKTSq//8+Qk+/f3//qv+mtcQ/QU4AAABYXXRdYnlER1ZhZ3p+fn7///9VVVVWW3F4g5BueIc+QU9WW3M5O0lXW3MFBglWWnEVFhdjaIFVVapXW3EAAP9SV2w6Ojo/P39XWnGPnKiap7JCRFJESFiqusYpKjRBRVO1xdFLS1a/v79bYHc1NkdHS1sQFBcA//9veIYvMz6qqqq6yNFdYXexwc1/v78nJ0rM1t1DRlJ1foc6PU4nJy2alJqAjJWIk53E1+MSOCmzAAAAYHRSTlMUIvP3EIMJXPeTqwMlWZfbBG5kltJkFnRgAma0xyHLSQOWBAOywgD+/v79AgMDz/z9+rH9biRTEf4DKgGIBgQX+/5Qc/0wtvgOBLEw0S0BkUcDsFDGBAqqMi9OCg7///83fNwiAAADt0lEQVR42uWY53LbOhCFqeKSxCXJTe/JvXcBEgQhkipUobpsxy3uLe393yILUolFGZREyjOZSfaHRHEGnw52zwIgNbjd0P4YnnlbPNNkHz+a92cjatNpw4vMB3j3PLiD9NQ8JomZpaXzo831VYDTUxb9l4Q8EzLn2ex6v9P5JjqbayvBvaVnX/DzMAWPsct256soBNFe/t5fe7a23v7aXz5aSaWPwSchApxhUCI2++1vAi+J6C+fryrrM5HHzCeFHIKG4VKBWAzi6kbn+5IqiRN5hyiPXIeuI04C8cp2jVVYScZjcCkKY7xQn47hGhm4n5D3VBhRHqW/eDrJPrjp8cm8N4KO8kiojoQ8V2T/0caBk3gc7o5OF3l0iM/ZtiS2syeZsaJosc4L5hvhRdiSKBXCvzPwgqZ6/sW8G6QvF0N0bVc8gNPpPAY8k8HvM08ONIitK3g4dd3Ve6Y/jceqcPmqs3lycvRfG+drGJ6hBAbE/zHLOITH83CuL4QgRqEg2gUajMJ+UGcR6/MQeN2coI/B65ciYjtpj7iyEM+BJkCtfBir74UoUEpmDbrrQ80ipAdcxePspZgdFmjvgoVtqO+o9OWB5ZLhiL6Brtdt/T344zz0cM1JRqPopa0nlm5vPA47b4R3D6BIEqqjaMEuXHS3btRXittOSJNhu48WcXidR3nNFOKGCXTvwNa4/+qYuVQ0nHIOgWP9UU8rbliTg1/AgMfyjkfmCb0S0VeFBp0HR+muxqLzteYCEq+Ioq55VSjPJ9DKs/pofavg0HnmWwMW9QtrpS8w8crSvxE/V6GY3jAN2atj/cZZ2pJQC9j+zf5NWxJqbfF7ivWepywJLYOv2j/2k5UkPMlQA52nqfdLaUIaHKCmovBMaAXhFIvwOX7/rZWLRcey5Bjj59lHEU7j8UEpwXl3sLPTayyEYEVYkjXkadokHj/ztQpUYBDcLpX2Dt4qcur1YK8EWrfb0KAyXV8F82jfGZRkwAJVOaSC6hbwKNKAs6k8H469AtEfob496BnKglzhv+KuS6zrhTmWl4dtD/dneyB/XKkL7OAkPlE8AV7A4jQeNoqFR7Sr8FeMx/E0kN/d2Fi4mKm+/nFjMMz0QxqzAvhR303i8bAq4adylfCsFjeBc39xtueF6s80f1YtY5Q6LZbyeZUvjhuQ0u1a+udpLgWOdB6lVhlrVp/jeb+FXe044YpikGOOeZvn/UF9hLrdaAHwOd9H7LNmk7PrVe123pfUkVqtNs2/5v3Q7+H9AJTxAlXOObg9AAAAAElFTkSuQmCC",
  p_rocks_medium: "data:image/png;base64,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",
  p_rocks_large: "data:image/png;base64,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",
  p_snow_pile: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADkAAAAoCAMAAABzTKKJAAABIFBMVEUAAADB3vHJ5/n///+/v//E4fTB3fHR8f/G5feqqv+q///L6Pu42/e/v7/B3vG92+7N/f/G5fZ/f//I5ffC3PC92uzMzP+72OoAAP+/3O7A3fDI2uwnJy2q1NSvzOI0NEpMUlnB3vGiudCqqqp///+NoKqftMV/f79IbW1fX3+qwtCwy90zMzPC3O+zztwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAOTzOAAAAYHRSTlMA/v0BBM6l/ysDA1gMBNVxB64CcTIwBVkB02oODQYRDAuQCwMCG0sEBwhIewVDJQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALW5skAAABfklEQVR42t2V13bCMAyG5e0sJ4EwCrSM0j3e//Fq4wDZEb1EF8k54O/ol6X8AriHYOx/FE8AEn4bzQIeunccu2fIAxTNEk+ti0gaI6Ni7elkjJ6cculpTmgZJJ/q+PJXf0Y4RGeKnOJMRwcYysqWWqgLdA37kxK/8NwP8lAo0hPKvH/s+sg5pL2gRb9g21vkrC20KvkVdtvvzi7GYgC06MPGHtu8daSUipBhNP18gdZFBceUkpGg9uJFCryecfJkRknfoEUDDaCgGNSyT43PgMNKERQqQ15Dl3yeo5IS1SyVg8SRlM5qQxzAAgdaVMQThp2ght59RW+QGTRI6cpKvIr9QeeksgK6C0oVtsysZk3u60SOQtHwB8Y0Sm+rnU4vpi9UNEYINQvOkKjucG/GHkXF91oUpSafzjpN0KI6kqLpmj6EjHQ2bLzZhXZZpHS1lZTtQJ/tsrL8uY72wvjzsYccxUb3mD9x2gpJ6NcNdqu5LbgstyA73rxIGdxV/AE49hCAPFnn1gAAAABJRU5ErkJggg==",
  p_snow_flat: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFsAAAA2CAMAAACfghUvAAABIFBMVEUAAADB3vHJ5/r+/v61///S8f/C3e/D3OzH4/V////B3fDJ5vi52O/G4/XE4fSqqv81OTnH5ft/f//B3vGpqaocHBy/v//H5PVRV1e82Ou81+m82OrB3vDH5Pe52OpKSk5/f3/C3O+/3PC+4vWzw89/f6omJiaqxuKwy9wAAP/MzMz/AP+huceRprWZzMwwRERUaG8A//+4v7+ds8Ovv9+QqruZmZng9Pu0z9+22tp/v79/mZm10N281+rBzMxtbZHG09ltbW1Vqqpff3/H0NdVVarA095ISG3C2vIzZmYqVVUAAD/r8/sqKlXo9/y/v78APz8AKioAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLT+2RAAAAYHRSTlMA/vwCA//JdMsCs2kXk7IDCRUCTAYIBEwIWGuvjS4rCgIn9BstBg0JdAEFASwxBQ0OASgvEB4FkEEHBAomwzIHXgcDCHMDlAcVBQYEQAZlBAQGAAAAAAAAAAAAAAAAAAAoM6LWAAACiUlEQVR42u2Y55KqQBCFewJDBlHBHHZ1c74555zv+7/M7UF3VcTFgbn/9lRJoWV91Zzpme4G4E7/R6w+rmsmJpw3wzBshuk3xrSR+RLqS+RFEh9qCVkGyVpuEDhShBJiuVGl4JkU57aN9z8eU2rQFfkN+R9VJD8+f/TxXXvxyy8LwWRVSLdcTwXe3Pt6c39vOn1jmqYQCN4lOUK8CVu6Xnv7U+JffTDNT0II9HXuQy55Rvfq42Jw+/MIr/e7iKTGDEkoKRJ1gBeGfImXh10rRaqINgrgoxp+On1VbsoWoX3beiL5zBRlyBLu3xJ4HMOTYD3HdLDjOHZKhjzLlAnYG9D7tbhnkPKiLxnfbHUlNKGd/K35vdaGU4tWQguW54j9Gi9TWglNcNOvWXIV4pO0h/2qaOJBds9Li3Zci1ZEI3wHmll02ApIZTDKyHrCoash5PlaPrUzaEMLON06w+UcZDChutDZc5BFgT50JgnZgaOTLZaLvQ2eTk+Ex1fWsmNoQ2OCZxLFmfca1fO7A88yHQi0Wn1fUJI2NFXQDiS55+uf56eNQ7+3S2hZP2gQrbdtR5wn10tw0StXJw3qD+BkQx0+an8b1fAIP6SlYvYnhe3g/t+zEp2DbAUhKWwG40tVw7EN3EszolAXoGg4xRo5TrZqYN9Dl6r58QLOt2yNmzCkSuhhcXt5o5MDhVpvBErDAofA2NpqH5SGHM4aWx4tFCuB4vzE4IGs+XkbZC5DCndiB45VJzJ5SraWyvOMh99EKssxpVzcL0mZoRefdODTBTTou62BBzl9TZnJ9yqli8BxG1F0/UCMzafMVPUK4y9ANA+1zn5zZut8JSAnlybnrK75PcMi9jvp0j9UnybXFaNN2wAAAABJRU5ErkJggg==",
  p_snow_flat_large: "data:image/png;base64,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",
  p_sled: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAA3CAMAAACLkLyVAAABIFBMVEUfGyJSTVkuHhtRVmuMUjk7S1CmYkVgOy+eXkRoNCKKUjycXEJWVGRlPS1fY3vyfXE9Q1CIUz59UDseHmYyN0WSVjxVVaqeXkIfX49kZ4FhZoBdQjxVVQBfP1/BbkxHLSX//wA/QlA/v/8AAABwRjayZkdVWW9LSFRkPC0FBghbYXqKUz2UWUEHCA1UVVU9PT15PTtjSEOCTjnGc1D/AADBbUtxSDdxSDdzSTduVFJFSFd/fwB/f3+hXkJVWnF1STVJTmGtZUd/AABDRVd0STh1SjhjPC9zSTm8cVEYFBBUWXFERk9aNipbUl1FR1RVWG8TEhRlWmZcOS1zWEVUWXCeYEQ9RFInKjdVWW2qVVVQNSUAAP9YNyyQVT1NR1FFSl2AxeTeAAAAYHRSTlMaHVqdaRabySESkNFoW+sKV9D3EVImA38QT/+qAwiaiAGZBAH8/f38/Sv8/v1NAwQG/P3+Af2SsC7/rgIC/tQU/s8CS89usk7+LLEScf/YjlT/8w5R9v4vLAM2AbGolm5IabpwAAADvElEQVR42uWXZ1vbMBSFHUjZu3uPK08pdoazIIMAgYRQKKts+P//ovdKdmLSmFLzrdXDw4dEen3uuceSosETh/YPA9wnAlyYdp+mYHO/DNnkgNSqaVbbcJEQ4MGmYZq5lZS/kVSBayKAlx5RRAzgGQJMrlxYSwTYRwDbOsblNfDdvwZ48JUAbGctBVDBitb+DKh591KwZJo/TVYCmCqx8s4DudJigtczpYSXrwXDUarEIvoKUnNRtzx3VRLydZ0zicjGWBEAerdmNR1pmgspJUHHIQlsZ7QVCtBD03PsGDYiNpKEHONEqDMLCVuIyPqjAart/dzULiiMpmmgBKHXOQ/qKI+wQhs8jqEEesCXRfz3we2tGuvr6IIQwmJ1PS8R7Sbi4wFNrMFHFRUSC28Mw1w3LcZPsQKqo2+F/ztgiQpeacsapm6w3go00zkEGDmLCa7MlB2lr6JWaP3sY24w+xtTE6dyYpmxfNXAkSMDmSgSYmDFMMDbJwDLbsCNLoJ5XAhJYBYhhC5HXuJKTfDvATy4lW3H6E4UgtajeZwHGnAV51whqKW87F0MJfGZyk3Tn/qkF5VYIjACGKYlEYEIQYh22HItmhtyASDd0oVE5PFPHBoDEULIj4m+1fTvAVzKDUmYx080UUdAEevAEKgqHOXEciVNLqAV2PLht3GVtDJ2CfZloJWs4GjEoSTIOvYuhaCWFGaba8Mbyrkhk8e60FarC0Hf8lz0EcziRC1OLPrDAA/uKHiMbcMMrZ6ZbxWoDi5FVA+dvgocL0dtaR6My66z61kCtO3MjELkCcGqhhNYgYjKYnbEnqj1GorAeKejj2Vw3FAdRfUWvN91nLClpWkIX/17m+pzInzHh+T1Fi7/kcmMzcpUyNbbLxqIUFZMzo/elc+Cph+xLRJAiL2WbCq6eW3bd413VAelYnu6Nmpb32yEMq3PAaIkW4JuTtq2rR1IK1Almu2NOhfOdp3wGZPShsyyamlB30OADUu7hqwjDgDYi8BuphDUE72lz4zRersLcLJAVizcxgBsEkEI8opdZ36c6npHz6jlqIDGieM4c9+exxxtOCli91GZCmjZ9gCgaZB6m3robMR5d0aYPEx+pzBhdwfPB6n91UOHK87Uxo2FMHm8k4ZuZH1keezxTogDmTzs2BHb7kJ0+aMuWTh/cze0wrL2kl005xr9VGxriW6q2pwTupkIgN+mQiumk92VsWPn45gb5+DjVbLL9hUexyeN8XO4Snxbr7lheBJf912o1f7HXyyPHb8ARsIImZ5XmMAAAAAASUVORK5CYII=",
  p_candy_cane: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAcCAMAAAC5xgRsAAABIFBMVEUAAABtKSv///8EBglzaHF1eYJVVVUGCg9/f39wKCz/AABVAACqPDKqqqq4uMuqVVWQlZuXODBmLChuZ2/GxtlzVFlpTld7MjB1eoTTx81/AADQ1NuGjJPCws9vc36zjY2hcnCpY2GuXV2ogYHT09ulMybY2N+np7esqKyFhYyEhI6De4OXcnOtoKSDVVWaTkqfQDi/v7+MOjSfPziMLymRJCSHJR769/zZ2eOytruxsdJrdX/b3uRuboXI9/+3t8wVFRVwZnANEBfVSj1rUVbMXVRjTVjYlZP/VRXpv7+Eam3Gx8xQVWPi4uJFRU+NgYUAqqoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAChuynPAAAAYHRSTlMA/AEt+/0DTQIyAQPzA/oD+/AXM/v8+v0yDQLv9DP6G///Jv+9FHAgyygZH/7/Xf07BKuI+wf8aoH/FzK2FyEyDBlM8TKmF4oMDP+dNglN2AMAAAAAAAAAAAAAAAAAAAAx2jW0AAAA10lEQVR42mNgoCpgwiLExMvAiy4uBcSe6Cr5GZjMbaS95Tk4UASVNCx1lRWNgCw44GAw4FEQEDUzETRFMpNLlYdHUMCLUVyck4Ebod+YR5DHVY+RkRFJlIHBX0ff2SOAhYVFmIENbqqmjIyAO4M2KyurBFyUl0FWWoTPjktLDlmUgcFXzUJFksERxQQI4GIQQrfNkIkJiyh2teBgdBMTE3VBM5eJwZZFjtUaQ9SKj4/PHuhOZMDM7MMnIiKLKsrMzu7kJ6wuiRrsQFF2Zsx4YwYCBw5qJQwAg4oQXtrDLoIAAAAASUVORK5CYII=",
  p_candy_cane_g: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAcCAMAAAC5xgRsAAABIFBMVEUAAAD///8EBglVVVVrdHh6fH47h2EDVVFvdnscU0IGCg+3uMsqZUp4d4KqqqrJyNgjWkZpbXdOZmMcVkIwdFSNiJGOmprCws9qlYMtY0zHzc1VqqqNoKCFhYyEhI739/yfqalvioJ/iouTwq97e4Pe3eKnp7f32Penqq5hYW95bnm/v79dqoREpXVVqlVdk3hAhWNKfmhSdWi1s7pHZmBNY2NQVWNHX1/i4uJFRU9VAAA//9SxsdK3t8w4dFc9fV8VFRUzf1kNEBe/1NTHxswkbUjY2N8hWEIhTUIA//8A/wAAf3/T09vU1d7Z2eMXUD4XTz4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACXcfrTAAAAYHRSTlMAAS0D+wX0BjL7Tfr9/gP0/fr9MvH1/jP/Mg0DGygZav/+2IoftiAhyzcXBKbxAyY7/V3/Mhc29glNAwwXMquIDBRMDJ0HcBcXAQECvf+B//YAAAAAAAAAAAAAAAAAAACkpkaMAAAA4ElEQVR42q3S11ICMRQG4D8xCWSz3d0FsSFFpdil2BWxAZb3fxozOsNmFy75Z3LzzZmTMycBVhqyhIgLN+9TfZ7zlZsgu01vvMW5gcc4ObyoJuV7rKXIcSrKcWhH0YtR+vEkhEiYbdsbKKRNH0Qkuue+bypQ2zs7urlmjBXnjTm24zipo8EcJ1UXpU9PHUx2MgoMX79mFfAgYKb+511KuW7e1iF6A2/S9zP6l8LPt8wrQW8Qhpe5vgTtIHCKC3qrlLrTc5qhtK88r5RValmjq9Z+JTuAVosuvhvVeeSr+hi/I84QTyzwADYAAAAASUVORK5CYII=",
  p_wreath: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAtCAMAAAAeE1JcAAABIFBMVEVcYmQiaVKVZ1IqblpoYI8KHR0JGxqVNjIsi2coaFmKXaBhYlojl28pX0tTj2wdYSuINC7WRUh/AAAA//9VqlXpX0sumHF8MitjTR5eV0SOdV12bqwA/wCyRSwE4oopjWuebc2bMjSsd9EAvwAAAP8dUj27hmi2gGG/O0VfiI9VqqrMMzPOQzfjUDx7Tp17ZqG+QzuRSEjUqtRYfXmscbf//wBrQDyTa6H///9/AH9DPjcZUT//37+RNkgAAAAoZ1Apdlklh2cDBQcqlHEaZU+RNTQpW0oYV0Ycc1p0KzCqPDkAf39PZ1GtN0R0NTUzpXi/Pz+1QjxNWkqqVVWoeVojemH/AABxalKHKjFWRj3ERTx4PDweiGt/f3+oPTRwZ46e6OryAAAAYHRSTlP9m+8c/lUeXdzn/gwcVf4anRgCAQPvl58cWm4TAQ0mcP/pqQQBeZr/zeIDBZj7hlefBwaKpAH/EwEC//8IDgD9/fsv/f79+/7+/v0C/f7//QT7/gP++gH3/v/+BP0Civ8JXMNmAAACfElEQVR42rWV13riMBCFJdsJLUB62ZRNtvfey0hCxcYYE3oJJO//FjsiDYjZ5Cbn85X1e+boeGQTuIvI/VKdzt1qNVdvp1b2b691/PNDuJXqrM6nmse51/C3rvUynNzS8XSA1Ne5VGc/hTrSdR1vwUmukkgdQyrUiOjB28FyDm9UionUKVJa98KNjQ3Hofk5tcZUWCaFguM8J4a6UEmikKmHsROJqBsxxowLTxJ81cMw1LGOOGcKIZaH9Rt7bH58MwjDXp9bMbwMhe1Zqgng1nW5HBvGo0aaEG6w5dpsrRVXfCuj+r6JNclmCWMUitPUn2ddLhqWKhufcUKyZ9i0eL5NctnugUPwboyQjn9xwT0vI6SksDRBjWC7ay03erparfaY4JiElDI9VQvfR9qucFK1iizEb1AjyBG7JGoWe8EshQ1rm/BqgjqBnSMS2MdrBWfFxayMpeTSVK11oJHBJjXUAdBA+b4SQqYrlYkk1vYeC4HPmzNS2+wss0K3YSnxENypvD6jd8OMl315kAojx2mxAKmLhufU6NMXG6Exfe/wEeQbjLRaJmiL9NLE5PyA74SkcVt9Tbz3eR6oqBUp0RablwM2rrUL7zw7CEHAVYZzpZSvpLy2dU5V9nYNdgxYYzw0CAUISXE5Ehfu1+Epzl1A4mA8fyqDha7Cut5jLpchPGCsnfWwVFsOhxI36M6cjhHORIR+DA6Msq9ZShcWZ89QE3acro/yDj1rXMr8BHSV6io4LYR+Z4hC20NJS4sJ53ER8sxXNgObuYVKpcTvBG3jusDQhoKWFkpzKCjSDKULVjPQJIVGSlYL42sehZx1c6H/f+VuIvf/V0jQPwkLfhHykE6RAAAAAElFTkSuQmCC",
  p_fence: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAAwCAMAAABpN6nPAAABIFBMVEUAAACuZEcEBgmZW0EHCQ+PVT1wRjWjXkL/AACqVVV/Pz/GcU6eYEapZEjAbEqtZkiTVj3xlWlrQzL//wCmY0l/f3+nZEinZEhtRTTljWSrYkbUg16sZUlVVVWVXEqRUzu/Pz/zlmpiPi+CTjk2IRR/XD+iXkF/fwBaNyt5Sjeye1UoFBSaZDb/qlWXWUC8dVV/AABoPS1wRzn/f3+aXD3skmiRSEiCTTX//3+YX0anX0d+UD2pX0N5TUKgX0ZxSDe/aj8XERG/fz9tQDHXhF3biGB/TDP/fwBjPS7hiWDpjmV/PwDoj2f4mmtfPS9fOCv7mW1VKipVAAA3Ihw/JR7qkGedYUg/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACpzrIvAAAAYHRSTlMB/S7+S/78/QEDBP39rvjSrP1WATQCb0+t+hn+iwMOmATO/voXDnkCRpIKDQkDqP8CWywCEGUHTARIIP+2F8jFDCsEd0dHCgKuPXYExSb/dkYMA2FElBUEAAAAAAAAAABINUYaAAACFUlEQVR42uXV53LbMAwAYIAUKcnakS3HM7Xd7KRpkqZ7773H+79JQSpxImv/bXE+26fDJwCURAH8E2FZ7YlNX9vtDJHNR/RzsznpWTDdWsgnJwCTpoTKJNyUFLsn0KiWdQ2g+5hzLnWsWZNGw3Q9zoWgj5zLB+vQqe0M4HeCKMgghZCyFtEyf+8viSmEj6IOqWECVJ2ZinA5X6DzUB2uGmbo6TKm6ozTUHJu+om+ysVxCvB6rFJTov6piTaGUHozxTZM+mlneB5Cox24XbnMuiMTl4grtBZ3Koe57OwqKl47+xQ2k3RwxGZoW91mQZ7QEbcMEelTZy7PdKbC5ViMiNwf685ypKxSrwfTRJ+T56s4yHE0cuVxrhJdGTpjAUHH6zrRYBCN7oGdeTbVlaEMc5VQmaAP8OlXFH38ejfO7DQHeolWCFcEt67rnHdneysPAdyisxYR39sBxihFycM8ypRyFUE/OGY6VNK3P6uVpuoxo7tfXBQh7+ALxoxLlds9n6JDzxmXnxcpUZ1tGGmUq+FYI8kvSPjDMGoURUjJIiW0zF8Mox4d2CFHjWiYYNcwmqAOhKZGehjWGOmdwPe9n1lSMVKKJAZ3dM6qqUTyLTxjVxhjFYbQDY3W91k+yrYgjY44bdYUzYhC3mgQDY5C2D8/Up2v4038chZF0exV/KHdm/Vs9n4P4rYv4+V3iziE5zH8t/EXddckAxShfcYAAAAASUVORK5CYII=",
  p_bunker: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGEAAAA6CAMAAACXkcelAAABIFBMVEVOW2SVoKianamr1drL5euRmaCkt8RTaXDR2d/Q2uGdoqfa4umiusurucIeKSwZcnI2Pkd4ipZ/v79/AAB9g4k7RE0AAADB3vHI5vkEBgj///8FBwu4xc691ue/v/+z///E3u/R8f8QExnF4/V/f/+qqv8RFRl/f3+qqqrE4vTB3e/ByM8SFxTM1NvD3O6VnaOEipC91+nA3fDG4/acpay/v7+52fDG5fYnJzB///+wytvH5fnI5/nF4vasxtcA//+92uyNk5q92+670N7C2unC3vIWGS2Uoay61efMzP+41OYzN0ervckAAP/KysqqxNZKSkpaXnPs9fywytx2hJR5jJjGys9ymZnG3PORmpq72uygrLOInao0Pz8iKDAXGyZsOkL5AAAAYHRSTlNfmxsPImhcGG+l3+myKCYDPVUEAv9WAf78LgFE/vgEA7L/SNACAzACA7NS+xH8Kvz+aZdq/gQSGhICkDSHS7IBjv5O/s5zEGqzBdMQ/QEdTgwRKc8ahjgHFgkx/ogIUSBkXJ75AAADgElEQVR42u2YaVPiQBCGwyXe7tkzGUgCEiDccisKKOB937f+/3+xM0NQCBAIxKqt2u0PBJS8T6a76elpAb7ahH+YUI9+ISGqyooCQGRFrdtEiGpFLao/Mwnr1zK/KPJGfVoCKRL9nfajqKgAP8/c2XwuhGJb8TL/l6KEyRQEdu/Z3azD49T4Z/dcCyEcxNToSyiWd5PO1yYjEFiaW0gkUoWdnXnHfiMfY9IY6cY/hAL5zRJoJBqdhKCRq1QqlfD7M2tra3722KjP+GLi7a9HLRPCEGD6nFDAA+Q7FJSe3XdOsAYFZhEH+DO/dtBwAEOknjPzDs+9RqwQ7uFqoQ3wF6iPEDJFZHYyhXkHPBILBC/MIaqeSDUlv2QOoAj/yXMhU/Cw/FbHJFzA3UKC3itJEsKjADyxJP/JycyjIXmHE9bBGaC6UrMpodH6n9krbWddsDEGIQnOFm5KzJAlY5QAfP7MhxCS6zDD/MNvQFYNB3MgjyCsQwUjaRJ1fR2Nj1gMJCSPoUJ/vhPKc0ToYUMdQth7PU4CzOAp5DkiAK4BBFK85NfLc2lKAEVk9VB0E3jdWopnYxhPDaChSEPYQNCgXM21esrzdH46NBCKkLNNna+halgDgfhIdSv04K4hDgQ2bXv8droqMukmnMokZisAP52Snmw9hO0gspPQ+Cgbgu6jJ+s+MkmLvrpEoBTC1tX5vmGktPuPQ9JbW8PugEUAWry9Fd7ehJfaUVeK87eBXDztjZLe/YG4rBIcoo+bKIrCfu2orU3Vt89vBnYC5BSseEnC175Vaj72KjL75qkcHFRmvLx0Hl+srPTtogpJjx1p1oEJvlVfZxGRSIQyOhvXcnJINyNDFo8ZAan2Ivg+9HWjmMj7nmlHpsBYocCLAvWLUZ/bqM5YVR9C43Qsv0Ufj4BBfjigu/I1RocCX4ur4iAb6/wgw/bo4uoQIxYB3TtQGEojEFhatqrfu4uW6BZhTqj1L8HaSVE2TyiMvxsIlk+7Kimb+QkfJS2q9/dLsqmfcAXep54JmPkJY68NUweiDi1QOHjwum7DXIMWqOCAvYv+qbV7A0k7JidhiG+FDD09raaxqtO22QxrmdO7n0dztinmy7zE2zX9IbzRcW22l4Lx1qbM5Imt86UNNt6hS8kHYtUSi86k8mbnOKLJ+nGPkDrAF83IVEWZ3Dv/J4l/F+EPC74UfmWh9ygAAAAASUVORK5CYII=",
  p_gingerbread: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAcCAMAAACj+uTiAAABIFBMVEUAAACoZUmPVDyWWkKhXUJ0SDcEBAd/fwB/f3//AACbZVCqVVWsg3KoZUWoaEtQNS3/f393SjpVVVWcc2ZyRzi4ejyreWN1RTWtcFViPDBRNiRCKSL//wCDTjpVAAADBQuPWj+dVz6NUjuXWT+fWkGASjX///+RWEF/fz+QVUCnUCujZEilZEaqd1ViPjJlPS9rPy2veGBmMzOxlYtVVQCqqlVRNSxKMCvHgmNFLiX/VVVCLCGfWkA/Pz8+LCU0JCEXFwAREREkJAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAChl4K5AAAAYHRSTlMA/Pz7+f0vAgIB/gP+Fkz8AtQD/7QF/ZH/Ng5NAfoDRCaXY9ldiQFiBN8jqtwP/6twwQX6AwOtail5Axc7BG5cCywHBwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4+ErrAAAA6UlEQVR42sWQV3PCMBCE9+4ky3ZccMG0EBzSe4M0SP///ykKL7E18JjJvmjmvtHe7QJ/paCzAfzMZ2Z7Hbh4HNo3d4GPhCgb1bELtiyoItHETwgcctOvIiYSvmoZ+vPTu6giIiW0i25rS0xRn0JRpOLD3/sC+ElybuekFC1hGgd3z6xPUTAz7Te9jLWyq8NQ6bSH21YWc3QiXISs04fgxckz7AmzcHqPnTY4BvYs4st04QQ1qIU1s9YD59MzpjLWYxYZNI9elXNgzbLXrMS7W+i1iJTexPPcrr8wKuVtDVjpY8Pcz/GJf9A37fgNOSE9rWkAAAAASUVORK5CYII=",
  p_nutcracker: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAA5CAMAAABgfdmVAAABIFBMVEVmWVuaaV4iJS7LaTLnkDNlZ24cGyEZJV6dNDaxjGGvXS7Qk16qn5auXlfpZi8tLzf3+f1xLy13eYHmlDLemlm/v782OUVaRzDS1eO3hjq7vcSafIM9QU2PZjNmTDI0O0mLZDJfTkyrq7Jvbx86PEbLh13IjU/AfUzSmD/ukC3dRES+wMXCo6uq//+4uLn//3+4kVOlh0s8S0u/Pz+eOkN/f4goMT27wc1BP0VQLzR/AAAAAAApKzQwMjs2OUSPNTJHREuRaE8/Pz89QUyTZy4DAwdxKixxVkp4NTVPPESwdjCndFF8PT2TlZpVVVW2t7r//wDHx8xuTTy1Qjg6PUqsqq5zVDbOimLRhzOtN0X/AACJiY+anKKJXCa/fz9ONjuHS2wPAAAAYHRSTlP1/Fr++BIXEv74/ff4CAueDKr4WBAEbf76////n6holihIWQXHk1D/NKoP+/8DrQKDEREM/xzdhb77AgD+/v3+/v4E/Pwv/f7+/f7+BP8D/gH+/vev//77/f8B////BP4Zx8WXAAACyUlEQVR42r2Vh3LiMBBAJRfAlEAIgfRervcuLEvYuOCAKaElEP7/L24FHGcDl8zN3NzO2Mx43+5qtQVEnhD0z4H4o0CjIpCK+pgHVX3Ew4fTg1uqZ4vxXGMtEKcgelnX9SxprAINAtYgZRBd+k2ghb7IFkC5HFvxUCG3IQBcVFYB8wngwHzag1DNzrAWoLSEuGb1SvofAKbt7u4mx5Zl9dYBzVu/VhPKHiAlKbcMPJBDxUrWanLNGo8tfkRuokDm7pkykAec+9e+rAUBUkkuAjyQK0VJ8TIXEuwF3bw6b40FsJXqY6b7IDwdBDutM7IdBm7IkcOxg7iPMd7ba+3s5Jqvw0CDSBPcZ9SBCOl0StO0E6IuVfOb45gm4z7XINvS2Dr5cRcCVPIZmZQxjjkeTJO1DmeZzoCcmkubzMH36bprDBQ5mZQHEWCbnLXyqNsdjequq8gJw7bl52QjDLxpvWy1RnUA7KRsGPDeIoUQcP61FQigjg3D7sBjbM4vewa8Je9StXQ3n0d2IpGYAc0QkGluQY3S9wjZE9dIrHhokgKkNsDIm4i5mHTcyXc3CrxXlGTH9mBuRMvBb1nfnLfMDNgQqcF36nnwNj3G6JdYqNxQS0iNmZ4L0W3G2j3OUXHmYgrckY9wMNMzEgLw2gD4+DgCbHQMl30yhsMh3kdOu419HNsgUcBwQZ3YD+r3qO1w/woCRwB34g6hWV4BgK/7/VQGzh4q9wuRGu7W8124LaSl+pcPmVAWFaKajLE6aBlMHz0uZKLj36gcMIjbHe0jWDCUsvhiLOYh4nByhyNapuImKTrPLC+QOGr3HOFdAHpxMZm/gGnXO8J4PvzLSyxDTvt9TwDTRSeRlR3VLFymhDVlJoi0dpHGhLFOIV9Tqq4HhLWezWal6jogRrJMCGirawEQ6fjiQqpKEf3ytq8u2UeBWOy//Gf9PfATq9CRLNgCuNEAAAAASUVORK5CYII=",
  p_sock: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAnCAMAAADNRxOMAAABIFBMVEWWOjJkaGtiKCXERTpXFhvgTz3rUEHUQkLjTj3/fwCYODDCv9YuFwB/g45/v797e4d9T1xqanD//wD0VEF/NCxYIB2fODgA///W3PcAAACRNTWmPDZuKi74V0EIBQi1QTnIRjx/AACop7bQRkL///+/Pz+0t8uYmaZpKCh/f3+KKS4CAgi4QTf/AACqqqp/Pz//f3/Ew9qRY3DqUT6qVVV/f/+WWmfTSD2XRE1xZ3BxOkLT2PJ1eYSJiZa8rsSrq7inqLaPkJykpLBvdHz/VVXH0ex+MDG9QjmQNTJrJyuqRDOlOjehODigODaxOji3QTW6QUOqAACmi52dm62fn6+kp7KTk5yqqv+EjZe/v7+ysr2XWWOdUlzTSD6QPEbFRT5OhQ8qAAAAYHRSTlMcExis/dAzZ0sCnVgLRgRA7oYBxIROWwHCAP79/f0v/fwC+f0BBP3+bgL+QmoBAwQC/vj9AwL/F/3+//7+8v7Wsf4t9gM2/8vOUA/evoJ2Vv8D/7wgXTQDGwT/wvo1/2rd/6xYAAABZklEQVR42q3T1XbDMAwA0MKYeZOdxA40KbcpM+OYGf7/L+akEOh6zh7qR90jy5ZlD8xbnkVIbJ4kp+QS0Qp4XBk3dMMnzkoonkeERiHwx27XJSTPSBbgeXuAbuU8iA7JQqihVYoFefU046jzBo/192a1Ukx5IWSXHWjVJUnVVa3d3gWvJQq0JEnSU6WcpDb3R0mmxJUnSZP0XJjjllJ6A+ITCcGrpqm1Qhj1GN2fWaKAt6rWvsMIIY7j9rrGBca7KfBQ/jTAEG7cb1NelM1ybipDyNjP1v1AEwlCwnafBAxZHKMecouo+FgcI0Qxcgl4MFtMiKvXATiZCP2CO4dcmYIpIc5XEOHSTCFU7h8k7b2OnV9gTFgKlf1gfx/zAIQgyqfln9EBpuJjgHGa5/kVWAdHnQGrQxkcdpLglCNEjAx+DTruSTzuGxCFLfeMCkIk6F8OCsLs9AoRIRKxwD6jgrEW/Of+Ib/3aXDOP7kELwAAAABJRU5ErkJggg==",
  p_train: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAjCAMAAAAg7OMRAAABIFBMVEVXU2RRUV8fJDcLGksfOETkYGMeIirKRT7VSj/DP0crLTW0QTugNUG9Pzy/Pz9iaIF1UFo3MDhPTVrDPkZVAFVAMDczQEx/Px8AAAA4O0ZSVmlFR1QEBQg8QUySNDYvMzxsKi1eYnlVVVX/AACqVVVma4RsMjasOzg/Pz8tKzPIQkRxO0KzRkiqOzVqRE2TRktiZXtPVGc2PUioPEILFxmLPUU5PEayQjyBLS9FO0ZNMDgyNDwpKS1uWGUICAtLLzUqLTgwNT4oN0N/f384O0fIPTz/VVVaUF1UWG8AAP9yLC1/OTmaNjyDMjJ3LTBnNDifPx9oKyl/AACHXmxMZn+JdZyqAFWCJCEAAH9SVmoQExpPVmVIW21gTFv///9JTWD52X6cAAAAYHRSTlOhHhIXUxZHh138gcAr3gSY/89jogOygggB/v79L/7+/v72AwED/v7+BPv+/v65//7+r7H+Dv/V//3w/o0U/0T9anJ7AoL/A/+TAacMgtrRjAh6Av8KDQNMAnxOUw41AfTcaX9lAAAB00lEQVR42tXU13KbUBAGYOSWHqfn7NlTQAgQxaDeZbnX2Om9vf9bZBGWR1iMk4tcJDvDMAMf/y4cwGB/VsY/5w7syl/Ms1/dvPP6ObN/4w7Yja7yTqpvCl31YqO41bOeiu6d2vaiK9O21Mr2JfYx6fsv2Wlh3k6n33/WYmXK/F5HrfWQLV9xFLLSiV3TRVyhOAOlr8H3Rwt5yw1sez3TNN345BHKgT+ZgIbti3lnbrTTbyvlKXK9Ziy16ymlTDd8yp7Mud2lRkzHMxdLmKggUqqpVO+cfZjPq3zb8JLamFyIMFD7QQjtJBw0bwUvWGXesY1ujR92lUst96O3YwDkoP1BM7ibrcmli7g+fIDgekGEkiNozoFk+zG7n8/jyDmqIAglaLSktDgg6oern/J5CU8rGdNZAG7RRVJK4KXp8sxcmRlT5iDNRTLNkkBDWu8rP3KuTsoiRo5kDUFSV+ms55/z1Dmc5gEyVJD2tIyjd8e5dTveLRlOioA0pEXM+Vz4Pn/tpE0tLtOW1Lx2xMSiK4/YFqXQTFnLzb0tIYryWtXt7BYxbWlsClHs6F3eozjs3G78tOriGsfYWmM4pNNrX4S4wha/NzGra77f1iX8D/5X+foFmrKXsMY82UYAAAAASUVORK5CYII=",
};


/* ============ WORLD LAYOUT ============ */
const blds = [
  { id: 'OFFICE',   name: 'VP KẾ TOÁN',     x: 20,  y: 30,  w: 190, h: 105, c: '#f5a524', style: 'office' },
  { id: 'ACADEMY',  name: 'HỌC VIỆN CCNA',  x: 290, y: 30,  w: 200, h: 105, c: '#a855f7', style: 'academy' },
  { id: 'IT',       name: 'TRỤ SỞ IT',      x: 740, y: 30,  w: 200, h: 105, c: '#38bdf8', style: 'modern' },
  { id: 'HARDWARE', name: 'LAB PHẦN CỨNG',  x: 20,  y: 240, w: 190, h: 130, c: '#22c55e', style: 'hardware' },
  { id: 'DC',       name: 'DATA CENTER',    x: 740, y: 240, w: 200, h: 130, c: '#0ea5e9', style: 'datacenter' },
  { id: 'SALES',    name: 'VP KINH DOANH',  x: 20,  y: 490, w: 190, h: 90,  c: '#10b981', style: 'sales' },
  { id: 'ISP',      name: 'TRẠM MẠNG ISP',  x: 740, y: 490, w: 200, h: 90,  c: '#ef4444', style: 'isp' }
];

/* ============ PRE-RENDER WORLD BG ============ */
const bgCanvas = document.createElement('canvas');
bgCanvas.width = 960; bgCanvas.height = 600;
const bg = bgCanvas.getContext('2d');
/* ==================== TIỆN ÍCH MÀU & VẼ ==================== */
// Nhận cả '#rrggbb', '#rgb' và 'rgb(r,g,b)' → [r,g,b]
function hex2rgb(h) {
  h = String(h).trim();
  if (h.indexOf('rgb') === 0) {
    const m = h.match(/-?\d+(\.\d+)?/g) || ['0', '0', '0'];
    return [parseInt(m[0], 10) || 0, parseInt(m[1], 10) || 0, parseInt(m[2], 10) || 0];
  }
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return [
    parseInt(h.slice(0, 2), 16) || 0,
    parseInt(h.slice(2, 4), 16) || 0,
    parseInt(h.slice(4, 6), 16) || 0
  ];
}
function clamp255(v) { return v < 0 ? 0 : (v > 255 ? 255 : Math.round(v)); }
function mixColor(hex, target, t) {
  const a = hex2rgb(hex), b = hex2rgb(target);
  return `rgb(${clamp255(a[0] + (b[0] - a[0]) * t)},${clamp255(a[1] + (b[1] - a[1]) * t)},${clamp255(a[2] + (b[2] - a[2]) * t)})`;
}
function lighten(hex, t) { return mixColor(hex, '#ffffff', t); }
function darken(hex, t) { return mixColor(hex, '#000000', t); }
function alphaC(hex, a) { const c = hex2rgb(hex); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
// Bo góc (path only – nhớ gọi .fill() / .stroke())
function rr(c, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
function ellipsePath(c, x, y, rx, ry) {
  c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2); c.closePath();
}
// Random có seed → vẽ lại nền nhiều lần vẫn ra y hệt (không bị "nhảy" chi tiết)
function seeded(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/* ==================== THÔNG TIN TOÀ NHÀ ==================== */
const BLD_META = {
  OFFICE:   { icon: '🏢', accent: '#f5a524', open: true, desc: 'Xử lý sự cố NAT' },
  ACADEMY:  { icon: '🎓', accent: '#a855f7', open: true, desc: 'Thi thử chứng chỉ CCNA' },
  IT:       { icon: '🖥️', accent: '#38bdf8', open: true, desc: 'Helpdesk & Ticket' },
  HARDWARE: { icon: '🔧', accent: '#22c55e', open: true, desc: 'Lab phần cứng' },
  DC:       { icon: '🗄️', accent: '#0ea5e9', open: true, desc: 'Đấu cáp Patch Panel' },
  SALES:    { icon: '📈', accent: '#10b981', open: true, desc: 'Quy hoạch kênh Wifi' },
  ISP:      { icon: '📡', accent: '#ef4444', open: true, desc: 'Phân tích Traceroute' }
};

// Đài phun nước trung tâm (có va chạm – không đi xuyên qua được)
const FOUNTAIN = { x: 480, y: 300, rx: 68, ry: 44 };

/* ==================== SPRITE KENNEY (nạp ảnh) ==================== */
const SPR = {};
Object.keys(SPR_DATA).forEach(k => {
  const im = new Image();
  im.src = SPR_DATA[k];
  SPR[k] = im;
});
// vẽ sprite với anchor ở mặt đất
function drawSpr(name, x, y, s) {
  const m = SPR_META[name], im = SPR[name];
  if (!m || !im || !im.complete || !im.naturalWidth) return false;
  s = s || 1;
  ctx.drawImage(im, Math.round(x - m.ax * s), Math.round(y - m.ay * s), Math.round(m.w * s), Math.round(m.h * s));
  return true;
}

/* ==================== TRANG TRÍ (depth sort) ==================== */
// vị trí + sprite + tỉ lệ từng món
const decor = [
  // Cây trong quảng trường
  { t: 'p_tree_snow_a', x: 330, y: 208, s: 0.92 },
  { t: 'p_tree_snow_b', x: 630, y: 206, s: 0.86 },
  { t: 'p_tree_snow_c', x: 332, y: 400, s: 0.95 },
  { t: 'p_tree_snow_a', x: 628, y: 402, s: 0.9 },
  // Cây hai bên hẻm giữa các toà nhà
  { t: 'p_tree_snow_c', x: 254, y: 168, s: 0.78 },
  { t: 'p_tree_snow_b', x: 706, y: 166, s: 0.74 },
  { t: 'p_tree_snow_a', x: 250, y: 452, s: 0.8 },
  { t: 'p_tree_snow_c', x: 708, y: 450, s: 0.78 },
  // Cây lớn quanh rìa
  { t: 'p_tree_snow_b', x: 88, y: 168, s: 0.9 },
  { t: 'p_tree_snow_a', x: 872, y: 170, s: 0.86 },
  { t: 'p_tree_snow_c', x: 90, y: 448, s: 0.88 },
  { t: 'p_tree_snow_a', x: 874, y: 446, s: 0.84 },
  // Đèn lồng
  { t: 'p_lantern', x: 276, y: 196, s: 0.85 },
  { t: 'p_lantern', x: 684, y: 196, s: 0.85 },
  { t: 'p_lantern', x: 276, y: 414, s: 0.85 },
  { t: 'p_lantern', x: 684, y: 414, s: 0.85 },
  { t: 'p_lantern', x: 176, y: 210, s: 0.8 },
  { t: 'p_lantern', x: 784, y: 210, s: 0.8 },
  // Ghế đá
  { t: 'p_bench', x: 424, y: 376, s: 0.9 },
  { t: 'p_bench', x: 536, y: 376, s: 0.9 },
  // Đồ trang trí giữa quảng trường
  { t: 'p_snowman', x: 372, y: 250, s: 0.95 },
  { t: 'p_reindeer', x: 590, y: 252, s: 0.95 },
  { t: 'p_present_a', x: 372, y: 356, s: 0.95 },
  { t: 'p_present_b', x: 400, y: 366, s: 0.9 },
  { t: 'p_present_c', x: 588, y: 358, s: 0.95 },
  { t: 'p_sled', x: 616, y: 372, s: 0.95 },
  { t: 'p_candy_cane', x: 300, y: 300, s: 1 },
  { t: 'p_candy_cane_g', x: 660, y: 300, s: 1 },
  { t: 'p_candy_cane', x: 300, y: 262, s: 0.95 },
  { t: 'p_candy_cane_g', x: 660, y: 340, s: 0.95 },
  { t: 'p_gingerbread', x: 452, y: 200, s: 1.1 },
  { t: 'p_nutcracker', x: 508, y: 402, s: 0.95 },
  // Đống tuyết + đá quanh map
  { t: 'p_snow_pile', x: 226, y: 320, s: 0.9 },
  { t: 'p_snow_pile', x: 736, y: 320, s: 0.9 },
  { t: 'p_snow_pile', x: 480, y: 176, s: 0.85 },
  { t: 'p_snow_pile', x: 480, y: 452, s: 0.85 },
  { t: 'p_snow_pile', x: 196, y: 240, s: 0.75 },
  { t: 'p_snow_pile', x: 768, y: 238, s: 0.75 },
  { t: 'p_rocks_small', x: 126, y: 404, s: 0.55 },
  { t: 'p_bunker', x: 96, y: 300, s: 0.7 },
  { t: 'p_bunker', x: 866, y: 300, s: 0.7 },
  { t: 'p_snow_flat', x: 250, y: 130, s: 0.9 },
  { t: 'p_snow_flat', x: 700, y: 132, s: 0.9 },
  { t: 'p_snow_flat', x: 170, y: 500, s: 0.9 },
  { t: 'p_snow_flat', x: 800, y: 502, s: 0.9 },
  { t: 'p_fence', x: 232, y: 470, s: 0.95 },
  { t: 'p_fence', x: 742, y: 468, s: 0.95 }
];
const lampPositions = decor.filter(d => d.t === 'p_lantern').map(d => ({ x: d.x, y: d.y }));
function drawDecor(d) { drawSpr(d.t, d.x, d.y, d.s); }
/* ==================== VẼ TOÀ NHÀ ==================== */
function buildingStatus(id) {
  if (id === 'HARDWARE') {
    const n = [S.missionsDone.pcBuild, S.missionsDone.crimp, S.missionsDone.diag].filter(Boolean).length;
    return n === 0 ? 'todo' : (n === 3 ? 'done' : 'part:' + n);
  }
  const map = { OFFICE: 'nat', ACADEMY: 'quiz', IT: 'helpdesk', DC: 'patch', SALES: 'wifi', ISP: 'trace' };
  const k = map[id];
  if (!k) return null;
  return S.missionsDone[k] ? 'done' : 'todo';
}

function drawBuilding(b, active) {
  const m = BLD_META[b.id] || { icon: '🏢', accent: b.c, desc: '' };
  /* buildingOpen/buildingLock/STAGES sống ở game.js: frame đầu tiên có thể chạy trước khi
     game.js kịp nạp (rAF fired giữa lúc parser chờ script). Guard để không chết vòng lặp. */
  const hasBld = typeof buildingOpen === 'function' && typeof buildingLock === 'function';
  const bldOpen = !hasBld || buildingOpen(b.id);
  const bldLock = !hasBld || buildingLock(b.id) || { no: STAGES.length, need: STAGES[STAGES.length - 1] };
  const sprName = 'bld_' + b.id.toLowerCase();
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h - 4;               // mặt đất phía trước toà nhà
  const t = Date.now() / 1000;

  // bóng sàn khi ảnh chưa nạp xong
  if (!bldOpen) ctx.globalAlpha = 0.42;      // toà chưa mở khoá -> mờ đi
  const ok = drawSpr(sprName, cx, cy, 1);
  if (!bldOpen) ctx.globalAlpha = 1;
  if (!ok) {
    ctx.fillStyle = 'rgba(20,30,45,.35)';
    ellipsePath(ctx, cx, cy, b.w / 2, 16); ctx.fill();
  }
  // huy hiệu ổ khoá cho toà chưa mở
  if (!bldOpen) {
    const meta = SPR_META[sprName];
    const ly = cy - (meta ? meta.ay : 90) - 12;
    ctx.fillStyle = 'rgba(15,23,42,.92)';
    rr(ctx, cx - 24, ly - 13, 48, 26, 13); ctx.fill();
    ctx.strokeStyle = 'rgba(148,163,184,.75)'; ctx.lineWidth = 1.5;
    rr(ctx, cx - 24, ly - 13, 48, 26, 13); ctx.stroke();
    ctx.font = '15px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔒', cx, ly + 5);
    ctx.textAlign = 'left';
  }
  // viền sáng khi đứng gần
  if (active) {
    const puls = (Math.sin(t * 4.2) + 1) / 2;
    ctx.strokeStyle = `rgba(250,204,21,${0.35 + puls * 0.5})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 96, 26, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ==== BIỂN TÊN ====
  const sw = 172, sh = 26;
  const sx = cx - sw / 2, sy = cy + 6;
  ctx.fillStyle = 'rgba(10,16,28,.55)';
  rr(ctx, sx + 3, sy + 3, sw, sh, 8); ctx.fill();
  const wg = ctx.createLinearGradient(0, sy, 0, sy + sh);
  wg.addColorStop(0, '#8a5a30'); wg.addColorStop(1, '#5a3a1e');
  ctx.fillStyle = wg;
  rr(ctx, sx, sy, sw, sh, 8); ctx.fill();
  ctx.strokeStyle = bldOpen ? alphaC(m.accent, .95) : 'rgba(120,132,150,.75)';
  ctx.lineWidth = 2;
  rr(ctx, sx + 1, sy + 1, sw - 2, sh - 2, 7); ctx.stroke();

  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,.75)'; ctx.shadowBlur = 4;
  ctx.font = 'bold 11.5px "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${bldOpen ? m.icon : '🔒'} ${b.name}`, cx, sy + 17);
  ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';

  // ==== HUY HIỆU TRẠNG THÁI ====
  let badgeTxt = null, badgeBg = 'rgba(250,204,21,.95)', badgeFg = '#1a1206';
  if (!bldOpen) {
    badgeTxt = '🔒 ẢI ' + bldLock.no + ' — cần xong Ải ' + (bldLock.no - 1);
    badgeBg = 'rgba(30,41,59,.95)'; badgeFg = '#cbd5e1';
  } else {
    const st = buildingStatus(b.id);
    if (st === 'done') { badgeTxt = '✅ ĐÃ XONG'; badgeBg = 'rgba(22,163,74,.95)'; badgeFg = '#04120a'; }
    else if (st && st.indexOf('part:') === 0) { badgeTxt = '⏳ ' + st.split(':')[1] + '/3 trạm'; }
    else if (st) { badgeTxt = '❗ CÒN NHIỆM VỤ'; }
  }
  if (badgeTxt) {
    ctx.font = 'bold 9.5px "Segoe UI", system-ui, sans-serif';
    const bw = ctx.measureText(badgeTxt).width + 20;
    const by = sy + sh + 5;
    ctx.fillStyle = badgeBg;
    rr(ctx, cx - bw / 2, by, bw, 18, 9); ctx.fill();
    ctx.fillStyle = badgeFg;
    ctx.fillText(badgeTxt, cx, by + 12.5);
  }
  ctx.textAlign = 'left';
}
/* ==================== ĐÀI PHUN NƯỚC + HOLOGRAM ==================== */
/* ==================== CÂY THÔNG TRANG TRÍ TRUNG TÂM ==================== */
function drawCenterPiece() {
  const t = Date.now() / 1000;
  const x = FOUNTAIN.x, y = FOUNTAIN.y + 22;

  // vòng sáng + tuyết đã dẫm quanh gốc
  ctx.save();
  const puls = (Math.sin(t * 1.4) + 1) / 2;
  ctx.strokeStyle = `rgba(255,214,102,${0.16 + puls * 0.14})`;
  ctx.lineWidth = 2;
  ellipsePath(ctx, x, y + 2, 104, 52); ctx.stroke();
  ctx.setLineDash([7, 11]);
  ctx.strokeStyle = `rgba(120,190,255,${0.20 + puls * 0.12})`;
  ctx.lineWidth = 1.4;
  ellipsePath(ctx, x, y + 2, 124, 64); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // quà + đồ chơi quanh gốc cây
  drawSpr('p_present_a', x - 54, y + 12, 1.15);
  drawSpr('p_present_b', x - 26, y + 22, 1.05);
  drawSpr('p_present_c', x + 52, y + 14, 1.1);
  drawSpr('p_sled', x + 78, y + 26, 0.95);
  drawSpr('p_gingerbread', x - 78, y + 24, 1.15);

  // cây thông lớn
  drawSpr('p_tree_decorated', x, y, 2.05);

  // hạt sáng bay lên
  for (let i = 0; i < 9; i++) {
    const p = ((t * 0.24 + i / 9) % 1);
    const px = x + Math.sin(t * 1.6 + i * 2.3) * 34;
    const py = y - 20 - p * 150;
    ctx.fillStyle = `rgba(255,238,170,${(1 - p) * 0.85})`;
    ctx.beginPath(); ctx.arc(px, py, 1.7, 0, Math.PI * 2); ctx.fill();
  }
  // ngôi sao trên đỉnh nhấp nháy
  const starY = y - 216;
  const gl = 0.5 + Math.sin(t * 2.4) * 0.5;
  const g = ctx.createRadialGradient(x, starY, 1, x, starY, 26 + gl * 8);
  g.addColorStop(0, `rgba(255,236,150,${0.55 + gl * 0.35})`);
  g.addColorStop(1, 'rgba(255,236,150,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, starY, 26 + gl * 8, 0, Math.PI * 2); ctx.fill();
}
/* ==================== HOẠ TIẾT QUẢNG TRƯỜNG (động) ==================== */
function drawPlazaEmblem() {
  const t = Date.now() / 1000;
  const x = 480, y = 300;
  ctx.save();
  // vòng tròn năng lượng
  const puls = (Math.sin(t * 1.4) + 1) / 2;
  ctx.strokeStyle = `rgba(56,189,248,${.10 + puls * .10})`;
  ctx.lineWidth = 2;
  ellipsePath(ctx, x, y + 10, 128, 78); ctx.stroke();
  ctx.setLineDash([6, 10]);
  ctx.strokeStyle = `rgba(56,189,248,${.18 + puls * .12})`;
  ctx.lineWidth = 1.4;
  ellipsePath(ctx, x, y + 10, 146, 90); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/* ==================== BUILD NỀN THÀNH PHỐ ==================== */
/* ==================== BUILD NỀN THÀNH PHỐ (MÙA ĐÔNG) ==================== */
function buildWorldBG() {
  const rnd = seeded(20240613);
  bg.clearRect(0, 0, 960, 600);

  // 1. nền tuyết
  const g = bg.createLinearGradient(0, 0, 0, 600);
  g.addColorStop(0, '#eef4fb');
  g.addColorStop(.55, '#dfe8f4');
  g.addColorStop(1, '#c7d5e6');
  bg.fillStyle = g; bg.fillRect(0, 0, 960, 600);

  // 2. mảng tuyết sáng tối (địa hình gồ ghề)
  for (let i = 0; i < 110; i++) {
    const x = rnd() * 960, y = rnd() * 600, r = 40 + rnd() * 110;
    const rgd = bg.createRadialGradient(x, y, 0, x, y, r);
    rgd.addColorStop(0, rnd() > .5 ? 'rgba(255,255,255,.55)' : 'rgba(150,175,205,.22)');
    rgd.addColorStop(1, 'rgba(255,255,255,0)');
    bg.fillStyle = rgd; bg.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // 3. hạt tuyết lấm tấm
  for (let i = 0; i < 4200; i++) {
    bg.fillStyle = rnd() > .45 ? 'rgba(255,255,255,.75)' : 'rgba(160,185,215,.30)';
    bg.fillRect(Math.floor(rnd() * 960), Math.floor(rnd() * 600), 2, 2);
  }

  const path = (x, y, w, h, r) => {
    bg.fillStyle = '#b9c7da';
    rr(bg, x, y, w, h, r); bg.fill();
    bg.strokeStyle = 'rgba(255,255,255,.55)'; bg.lineWidth = 3;
    rr(bg, x + 1.5, y + 1.5, w - 3, h - 3, r); bg.stroke();
    bg.strokeStyle = 'rgba(130,152,182,.45)'; bg.lineWidth = 1.5;
    rr(bg, x, y, w, h, r); bg.stroke();
  };

  // 4. đường vành đai quanh quảng trường (tuyết đã dọn)
  bg.save();
  bg.strokeStyle = 'rgba(255,255,255,.5)'; bg.lineWidth = 48;
  rr(bg, 232, 144, 496, 314, 88); bg.stroke();
  bg.strokeStyle = '#b9c7da'; bg.lineWidth = 42;
  rr(bg, 232, 144, 496, 314, 88); bg.stroke();
  bg.strokeStyle = 'rgba(130,152,182,.35)'; bg.lineWidth = 2;
  rr(bg, 232, 144, 496, 314, 88); bg.stroke();
  bg.restore();

  // 5. nhánh đường nối tới các toà nhà
  path(56, 150, 200, 46, 16);
  path(700, 150, 210, 46, 16);
  path(56, 424, 850, 46, 16);

  // 6. vỉa hè + quảng trường trung tâm (đá lát)
  bg.strokeStyle = '#a8b8cd'; bg.lineWidth = 12;
  rr(bg, 266, 176, 428, 250, 72); bg.stroke();
  const pg = bg.createLinearGradient(0, 176, 0, 426);
  pg.addColorStop(0, '#dfe7f1');
  pg.addColorStop(1, '#c3d0e0');
  bg.fillStyle = pg;
  rr(bg, 272, 182, 416, 238, 66); bg.fill();
  bg.save();
  rr(bg, 272, 182, 416, 238, 66); bg.clip();
  bg.strokeStyle = 'rgba(150,170,196,.35)'; bg.lineWidth = 1;
  for (let x = 272; x < 688; x += 26) { bg.beginPath(); bg.moveTo(x, 182); bg.lineTo(x, 420); bg.stroke(); }
  for (let y = 182; y < 420; y += 26) { bg.beginPath(); bg.moveTo(272, y); bg.lineTo(688, y); bg.stroke(); }
  // vài vũng băng
  for (let i = 0; i < 7; i++) {
    const x = 300 + rnd() * 360, y = 200 + rnd() * 200, r = 12 + rnd() * 26;
    const ig = bg.createRadialGradient(x, y, 1, x, y, r);
    ig.addColorStop(0, 'rgba(190,225,255,.55)');
    ig.addColorStop(1, 'rgba(190,225,255,0)');
    bg.fillStyle = ig; bg.beginPath(); bg.arc(x, y, r, 0, Math.PI * 2); bg.fill();
  }
  bg.restore();
  bg.strokeStyle = 'rgba(255,255,255,.85)'; bg.lineWidth = 2;
  rr(bg, 272, 182, 416, 238, 66); bg.stroke();

  // 7. vệt bánh xe trượt tuyết quanh quảng trường
  bg.setLineDash([10, 14]);
  bg.strokeStyle = 'rgba(150,172,200,.45)'; bg.lineWidth = 2;
  rr(bg, 232, 144, 496, 314, 88); bg.stroke();
  bg.setLineDash([]);

  // 8. vạch sang đường mờ
  bg.fillStyle = 'rgba(255,255,255,.6)';
  for (let i = 0; i < 5; i++) {
    bg.fillRect(456 + i * 12, 148, 6, 14);
    bg.fillRect(456 + i * 12, 440, 6, 14);
  }
  for (let i = 0; i < 4; i++) {
    bg.fillRect(222, 254 + i * 12, 14, 6);
    bg.fillRect(730, 254 + i * 12, 14, 6);
  }

  bg.imageSmoothingEnabled = true;
}
/* ====================================================
   🏢 5 TOÀ NHÀ MỚI — PHÒNG TRONG NHÀ (interior)
   ==================================================== */
const INTERIORS = {
  ACADEMY: {
    id: 'ACADEMY', name: 'HỌC VIỆN CCNA', zone: '5. HỌC VIỆN CCNA', zoneName: 'Phòng Lab đào tạo CCNA',
    accent: '#a855f7', floorA: '#1d1830', floorB: '#141024', wallA: '#2a1d4a', wallB: '#1a1230',
    npc: {
      name: 'Thầy Đức', role: 'Giảng viên CCNA', sprite: 'duc', x: 150, y: 340,
      intro: '"Chào Nhân-IT! Đây là <b>Học viện CCNA</b>.\nEm muốn lấy chứng chỉ thì vào bàn thi làm <b>8 câu trắc nghiệm</b> nhé — đúng 6 câu là đạt!"',
      done: '"Bài thi của em đạt chuẩn rồi! Cố gắng giữ phong độ nhé, kỹ sư mạng tương lai!"'
    },
    station: { icon: '🎓', title: 'PHÒNG THI CCNA', sub: 'Bấm [E] để thi thử 200-301', x: 660, y: 300, game: 'QUIZ' },
    props: [
      { t: 'desk', x: 280, y: 160, w: 150, h: 46 },
      { t: 'desk', x: 460, y: 160, w: 150, h: 46 },
      { t: 'plant', x: 110, y: 250, s: 0.72 },
      { t: 'desk', x: 280, y: 460, w: 150, h: 46 },
      { t: 'plant', x: 780, y: 480, s: 0.85 }
    ]
  },
  IT: {
    id: 'IT', name: 'TRỤ SỞ IT', zone: '6. TRỤ SỞ IT', zoneName: 'Trung tâm Helpdesk',
    accent: '#38bdf8', floorA: '#101d31', floorB: '#0b1524', wallA: '#152741', wallB: '#0c1a2d',
    npc: {
      name: 'Chị Linh', role: 'IT Helpdesk Lead', sprite: 'linh', x: 100, y: 300,
      intro: '"Chào Nhân-IT! <b>Trụ sở IT</b> đây.\nHàng đợi ticket đang đầy, em vào bàn Helpdesk <b>phân loại 6 ticket</b> giúp chị nhé!"',
      done: '"Em phân loại ticket chuẩn đét! Đội Helpdesk mong có người như em hoài."'
    },
    station: { icon: '🎫', title: 'BÀN HELPDESK', sub: 'Bấm [E] để xử lý ticket', x: 648, y: 322, game: 'TICKET' },
    props: [
      { t: 'screen', x: 250, y: 150, w: 300, h: 64, label: 'TICKET ĐANG MỞ: 06' },
      { t: 'desk', x: 280, y: 460, w: 150, h: 46 },
      { t: 'desk', x: 790, y: 250, w: 140, h: 46 },
      { t: 'plant', x: 780, y: 480, s: 0.8 }
    ]
  },
  DC: {
    id: 'DC', name: 'DATA CENTER', zone: '7. DATA CENTER', zoneName: 'Phòng Server & Patch Panel',
    accent: '#0ea5e9', floorA: '#0c1a2b', floorB: '#081321', wallA: '#0f2740', wallB: '#0a1a2b',
    npc: {
      name: 'Anh Khoa', role: 'System Admin', sprite: 'khoa', x: 205, y: 455,
      intro: '"Nhân-IT hả? <b>Data Center</b> đây, lạnh teo người!\nCó 5 server chưa đấu cáp, em ra Patch Panel <b>nối đúng sơ đồ</b> giúp anh!"',
      done: '"Cáp đấu gọn gàng hết rồi. Uptime 99.99% là nhờ em đó!"'
    },
    /* station = tâm mặt bàn PATCH PANEL thật trong ảnh (x 548..788, y 262..412)
       → đứng phía trước bàn là trong bán kính 90px. exit = vùng thảm đỏ
       "RA THÀNH PHỐ" của ảnh này (thảm ở y 370..460, cao hơn các phòng khác). */
    station: { icon: '🔌', title: 'PATCH PANEL', sub: 'Bấm [E] để đấu cáp server', x: 665, y: 390, game: 'PATCH' },
    exit: { x: 145, y: 400 },
    props: [
      { t: 'rack', x: 200, y: 150, w: 100, h: 150, label: 'RACK A1' },
      { t: 'rack', x: 320, y: 150, w: 100, h: 150, label: 'RACK A2' },
      { t: 'rack', x: 440, y: 150, w: 100, h: 150, label: 'RACK A3' },
      { t: 'rack', x: 830, y: 240, w: 100, h: 150, label: 'RACK B1' },
      { t: 'plant', x: 300, y: 490, s: 0.7 }
    ]
  },
  SALES: {
    id: 'SALES', name: 'VP KINH DOANH', zone: '8. VP KINH DOANH', zoneName: 'Sàn mở & Wifi công ty',
    accent: '#10b981', floorA: '#102a24', floorB: '#0b1f1b', wallA: '#143a2f', wallB: '#0d2620',
    npc: {
      name: 'Chị Mai', role: 'Trưởng phòng KD', sprite: 'mai', x: 150, y: 340,
      intro: '"Nhân-IT ơi! Sàn bên chị <b>wifi chập chờn</b> quá, họp online cứ giật.\nEm xem lại <b>kênh 3 cục AP</b> giúp chị với!"',
      done: '"Sóng wifi giờ mượt cả sàn! Chị gửi lời cảm ơn tới phòng IT nhé!"'
    },
    station: { icon: '📶', title: 'BÀN QUY HOẠCH WIFI', sub: 'Bấm [E] để chọn kênh AP', x: 660, y: 300, game: 'WIFI' },
    props: [
      { t: 'table', x: 280, y: 165, w: 240, h: 88 },
      { t: 'desk', x: 280, y: 460, w: 150, h: 46 },
      { t: 'plant', x: 110, y: 250, s: 0.72 },
      { t: 'plant', x: 880, y: 470, s: 0.9 }
    ]
  },
  ISP: {
    id: 'ISP', name: 'TRẠM MẠNG ISP', zone: '9. TRẠM MẠNG ISP', zoneName: 'Trung tâm giám sát mạng',
    accent: '#ef4444', floorA: '#221312', floorB: '#180d0d', wallA: '#3a1a1a', wallB: '#261111',
    npc: {
      name: 'Anh Sơn', role: 'NOC Engineer', sprite: 'son', x: 255, y: 385,
      intro: '"Chào em! Đây là <b>trạm mạng ISP</b>.\nKhách phản ánh mạng chậm, em ra màn hình <b>phân tích traceroute</b> xem gói tin đi qua những đâu nhé!"',
      done: '"Em đọc traceroute chuẩn đấy! Có sự cố gì anh gọi em đầu tiên."'
    },
    /* station = mép TRƯỚC mặt bàn TRACEROUTE trong ảnh (thân bàn canvas
       x 497..705, y 330..450) → đứng trên sàn ngay trước bàn là vào bán kính.
       rad 95 theo yêu cầu (các phòng khác vẫn 90). exit = tâm thảm đỏ
       "RA THÀNH PHỐ" của ảnh này (thảm canvas x 67..227, y 372..460). */
    station: { icon: '🛰️', title: 'BÀN PHÂN TÍCH TRACEROUTE', sub: 'Bấm [E] để xem đường đi gói tin', x: 600, y: 420, game: 'TRACE', rad: 95 },
    exit: { x: 175, y: 400 },
    props: [
      { t: 'screen', x: 260, y: 150, w: 320, h: 70, label: 'LƯU LƯỢNG: 4.2 Gbps' },
      { t: 'rack', x: 830, y: 240, w: 100, h: 150, label: 'BRAS-01' },
      { t: 'rack', x: 830, y: 420, w: 100, h: 140, label: 'CORE-02' },
      { t: 'desk', x: 300, y: 460, w: 150, h: 46 }
    ]
  }
};
const INTERIOR_IDS = Object.keys(INTERIORS);
// map mini-game → nhiệm vụ (để gắn với ải tương ứng)
const GAME_MISSION = { QUIZ: 'quiz', TICKET: 'helpdesk', PATCH: 'patch', WIFI: 'wifi', TRACE: 'trace' };

/* ==================== VẼ ĐỒ ĐẠC TRONG PHÒNG ==================== */
function drawProp(p, acc, t) {
  if (p.t === 'desk') {
    ctx.fillStyle = 'rgba(0,0,0,.4)';
    ellipsePath(ctx, p.x + p.w / 2, p.y + p.h + 5, p.w / 2 + 5, 8); ctx.fill();
    ctx.fillStyle = '#3b2413'; rr(ctx, p.x, p.y, p.w, p.h, 7); ctx.fill();
    ctx.fillStyle = '#55341c'; rr(ctx, p.x + 3, p.y + 3, p.w - 6, p.h - 9, 6); ctx.fill();
    // màn hình
    const mx = p.x + p.w / 2 - 27, my = p.y - 48;
    ctx.fillStyle = '#0d1424'; rr(ctx, mx, my, 54, 36, 5); ctx.fill();
    ctx.fillStyle = alphaC(acc, .45 + Math.sin(t * 1.6 + p.x * 0.03) * 0.12);
    rr(ctx, mx + 3, my + 3, 48, 30, 3); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    for (let i = 0; i < 4; i++) ctx.fillRect(mx + 7, my + 8 + i * 5, 36 - i * 7, 2);
    ctx.fillStyle = '#1b2532'; ctx.fillRect(p.x + p.w / 2 - 4, my + 36, 8, 12);
    ctx.fillRect(p.x + p.w / 2 - 13, p.y - 4, 26, 4);
  } else if (p.t === 'rack') {
    ctx.fillStyle = 'rgba(0,0,0,.45)';
    ellipsePath(ctx, p.x + p.w / 2, p.y + p.h + 5, p.w / 2 + 5, 8); ctx.fill();
    ctx.fillStyle = '#05090f'; rr(ctx, p.x, p.y, p.w, p.h, 7); ctx.fill();
    ctx.strokeStyle = alphaC(acc, .5); ctx.lineWidth = 1.5;
    rr(ctx, p.x + 0.8, p.y + 0.8, p.w - 1.6, p.h - 1.6, 7); ctx.stroke();
    const units = Math.max(3, Math.floor((p.h - 16) / 26));
    for (let i = 0; i < units; i++) {
      const uy = p.y + 10 + i * 26;
      ctx.fillStyle = '#16202f'; rr(ctx, p.x + 7, uy, p.w - 14, 20, 3); ctx.fill();
      const blink = Math.sin(t * 2.4 + i * 1.7 + p.x * 0.05) > 0;
      ctx.fillStyle = blink ? '#22c55e' : '#14532d';
      ctx.fillRect(p.x + 12, uy + 8, 4, 4);
      ctx.fillStyle = blink ? '#0ea5e9' : '#0c4a6e';
      ctx.fillRect(p.x + 20, uy + 8, 4, 4);
      ctx.fillStyle = '#243447';
      for (let k = 0; k < 5; k++) ctx.fillRect(p.x + 30 + k * 8, uy + 6, 6, 9);
    }
    if (p.label) {
      ctx.fillStyle = alphaC(acc, .9);
      ctx.font = 'bold 9.5px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, p.x + p.w / 2, p.y - 6);
      ctx.textAlign = 'left';
    }
  } else if (p.t === 'screen') {
    ctx.fillStyle = 'rgba(0,0,0,.45)'; rr(ctx, p.x + 5, p.y + 5, p.w, p.h, 8); ctx.fill();
    ctx.fillStyle = '#060b14'; rr(ctx, p.x, p.y, p.w, p.h, 8); ctx.fill();
    ctx.strokeStyle = alphaC(acc, .55); ctx.lineWidth = 2;
    rr(ctx, p.x + 1, p.y + 1, p.w - 2, p.h - 2, 8); ctx.stroke();
    ctx.fillStyle = alphaC(acc, .10); rr(ctx, p.x + 4, p.y + 4, p.w - 8, p.h - 8, 6); ctx.fill();
    const bars = Math.floor((p.w - 30) / 14);
    for (let i = 0; i < bars; i++) {
      const hgt = 8 + (Math.sin(t * 1.5 + i * 0.8) * 0.5 + 0.5) * (p.h - 34);
      ctx.fillStyle = alphaC(acc, .55);
      ctx.fillRect(p.x + 14 + i * 14, p.y + p.h - 10 - hgt, 8, hgt);
    }
    if (p.label) {
      ctx.fillStyle = '#dbeafe';
      ctx.font = 'bold 10px Consolas, monospace';
      ctx.fillText(p.label, p.x + 14, p.y + 18);
    }
  } else if (p.t === 'table') {
    ctx.fillStyle = 'rgba(0,0,0,.4)';
    ellipsePath(ctx, p.x + p.w / 2, p.y + p.h + 5, p.w / 2 + 6, 10); ctx.fill();
    ctx.fillStyle = '#3b2413'; rr(ctx, p.x, p.y, p.w, p.h, 14); ctx.fill();
    ctx.fillStyle = '#6b4423'; rr(ctx, p.x + 4, p.y + 4, p.w - 8, p.h - 10, 12); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.06)'; rr(ctx, p.x + 10, p.y + 10, p.w - 20, 12, 6); ctx.fill();
    ctx.fillStyle = '#25344a';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(p.x + 20 + i * (p.w - 60) / 3, p.y - 16, 26, 12);
      ctx.fillRect(p.x + 20 + i * (p.w - 60) / 3, p.y + p.h - 2, 26, 12);
    }
  } else if (p.t === 'plant') {
    drawSpr('p_tree_snow_a', p.x, p.y + 10, (p.s || 0.8) * 1.1);
  }
}

/* ==================== VẼ TRẠM LÀM VIỆC ==================== */
function drawStation(cfg, acc, t) {
  const st = cfg.station, x = st.x, y = st.y;
  ctx.fillStyle = 'rgba(0,0,0,.45)';
  ellipsePath(ctx, x + 6, y + 62, 82, 14); ctx.fill();
  ctx.fillStyle = '#2b3646'; rr(ctx, x - 76, y + 14, 152, 36, 9); ctx.fill();
  ctx.fillStyle = '#3d4d63'; rr(ctx, x - 72, y + 18, 144, 28, 7); ctx.fill();
  ctx.fillStyle = '#1b2532'; ctx.fillRect(x - 62, y + 50, 11, 34); ctx.fillRect(x + 51, y + 50, 11, 34);
  ctx.fillStyle = '#0d1424'; rr(ctx, x - 36, y - 26, 72, 42, 6); ctx.fill();
  ctx.strokeStyle = alphaC(acc, .75); ctx.lineWidth = 1.5;
  rr(ctx, x - 36, y - 26, 72, 42, 6); ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const on = Math.sin(t * 2 + i * 1.7) > 0;
    ctx.fillStyle = on ? '#22c55e' : '#14532d';
    ctx.fillRect(x - 28 + i * 10, y - 18, 5, 5);
  }
  ctx.fillStyle = alphaC(acc, .35); rr(ctx, x - 26, y - 6, 52, 16, 4); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.15)';
  for (let i = 0; i < 3; i++) ctx.fillRect(x - 22, y - 2 + i * 4, 44 - i * 12, 2);
  ctx.fillStyle = alphaC(acc, .95); rr(ctx, x - 108, y - 84, 216, 44, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1;
  rr(ctx, x - 107.5, y - 83.5, 215, 43, 10); ctx.stroke();
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 5;
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12.5px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(`${st.icon} ${st.title}`, x, y - 66);
  ctx.font = '9.5px "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.fillText(st.sub, x, y - 51);
  ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
  ctx.textAlign = 'left';
  if (buildingStatus(cfg.id) === 'done') {
    ctx.fillStyle = 'rgba(22,163,74,.96)';
    rr(ctx, x + 62, y - 34, 62, 20, 10); ctx.fill();
    ctx.fillStyle = '#04120a';
    ctx.font = 'bold 9.5px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✅ XONG', x + 93, y - 20);
    ctx.textAlign = 'left';
  }
}

/* ==================== NHÃN KHOÁ ẢI TRÊN TRẠM ==================== */
function drawLockChip(cx, cy, mid) {
  if (!lockedBy(mid)) return;
  const txt = '🔒 ẢI ' + stageIndexOf(mid);
  ctx.font = 'bold 9.5px "Segoe UI", system-ui, sans-serif';
  const w = ctx.measureText(txt).width + 22;
  ctx.fillStyle = 'rgba(8,13,22,.94)';
  rr(ctx, cx - w / 2, cy - 11, w, 22, 11); ctx.fill();
  ctx.strokeStyle = 'rgba(148,163,184,.6)'; ctx.lineWidth = 1;
  rr(ctx, cx - w / 2, cy - 11, w, 22, 11); ctx.stroke();
  ctx.fillStyle = '#cbd5e1'; ctx.textAlign = 'center';
  ctx.fillText(txt, cx, cy + 3.5);
  ctx.textAlign = 'left';
}

/* ==================== VẼ TOÀN BỘ PHÒNG ==================== */
function drawInterior(id) {
  const cfg = INTERIORS[id];
  const acc = cfg.accent;
  const t = Date.now() / 1000;

  const fg = ctx.createLinearGradient(0, 0, 0, 600);
  fg.addColorStop(0, cfg.floorA); fg.addColorStop(1, cfg.floorB);
  ctx.fillStyle = fg; ctx.fillRect(0, 0, 960, 600);
  ctx.strokeStyle = alphaC(acc, .07); ctx.lineWidth = 1;
  for (let x = 0; x < 960; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 600); ctx.stroke(); }
  for (let y = 0; y < 600; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(960, y); ctx.stroke(); }

  const wg = ctx.createLinearGradient(0, 0, 0, 134);
  wg.addColorStop(0, cfg.wallA); wg.addColorStop(1, cfg.wallB);
  ctx.fillStyle = wg; ctx.fillRect(0, 0, 960, 134);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 126, 960, 8);
  ctx.fillStyle = alphaC(acc, .85); ctx.fillRect(0, 130, 960, 4);
  for (let i = 0; i < 6; i++) {
    const wx = 90 + i * 140;
    ctx.fillStyle = '#091120'; ctx.fillRect(wx, 26, 74, 56);
    const lit = 0.5 + Math.sin(t * 1.2 + i) * 0.5;
    ctx.fillStyle = alphaC(acc, .10 + lit * .14); ctx.fillRect(wx + 3, 29, 68, 50);
    ctx.strokeStyle = alphaC(acc, .3); ctx.lineWidth = 1;
    ctx.strokeRect(wx + 3.5, 29.5, 67, 49);
    ctx.fillStyle = 'rgba(6,11,20,.65)';
    ctx.fillRect(wx + 37, 29, 2, 50); ctx.fillRect(wx + 3, 52, 68, 2);
  }
  ctx.fillStyle = alphaC(acc, .92);
  rr(ctx, 26, 96, 250, 28, 9); ctx.fill();
  ctx.fillStyle = '#04121f';
  ctx.font = 'bold 11.5px "Segoe UI", system-ui, sans-serif';
  ctx.fillText(cfg.name, 40, 115);

  const cg = ctx.createRadialGradient(480, 0, 20, 480, 0, 520);
  cg.addColorStop(0, alphaC(acc, .07)); cg.addColorStop(1, alphaC(acc, 0));
  ctx.fillStyle = cg; ctx.fillRect(0, 0, 960, 420);

  (cfg.props || []).forEach(p => drawProp(p, acc, t));
  drawStation(cfg, acc, t);
  drawLockChip(cfg.station.x, cfg.station.y - 98, GAME_MISSION[cfg.station.game]);

  ctx.fillStyle = '#7f1d1d'; ctx.fillRect(20, 512, 140, 66);
  ctx.fillStyle = '#991b1b'; ctx.fillRect(24, 516, 132, 58);
  ctx.fillStyle = '#ef4444'; ctx.fillRect(30, 556, 120, 22);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace';
  ctx.fillText('🚪 RA THÀNH PHỐ', 32, 571);

  [cfg.npc, { x: S.p.x, y: S.p.y, sprite: 'p' }]
    .map(o => ({ k: o.y, f: () => drawSprite(o.x, o.y, o.sprite) }))
    .sort((a, b) => a.k - b.k)
    .forEach(o => o.f());
}

/* ============ INPUT ============ */
let targetAct = null;
let keys = {};
/* Dùng event.code (KeyW/ArrowUp/…) thay vì event.key:
   Caps Lock, Shift hay bàn phím Telex/VNI cũng không làm đổi "vị trí phím",
   nên nhân vật không bị loạn hướng — và phím không bao giờ mang nhãn chữ hoa. */
const KEY_MOVE = { up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'] };
const KEY_BLOCK = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'F2'];  // phím cuộn trang → chặn mặc định
const held = dir => KEY_MOVE[dir].some(c => keys[c]);

/* KHÔNG còn đồng hồ hẹn giờ cắt phím: đang đè phím thì keys[code] sống
   liên tục từ keydown tới đúng keyup. Timer 150ms cũ tự cắt phím đang đè
   thật vì repeat delay của Windows (250–500ms) luôn vượt ngưỡng — nhân vật
   đi một nhịp lại khựng giữa đường. Chống dính phím chỉ bằng sự kiện thật:
   blur / ẩn tab / chuột phải, xả khi đổi cảnh và khi mở bảng (xem update). */

window.addEventListener('keydown', e => {
  // Chỉ nhường phím khi phần tử đang focus là ô nhập liệu THỰC SỰ hiển thị
  // (Esc vẫn chạy để đóng modal). Input kẹt trong modal đã ẩn sẽ không chặn.
  if (isTypingField(document.activeElement) && e.code !== 'Escape') return;
  const c = e.code;
  if (KEY_BLOCK.indexOf(c) >= 0) e.preventDefault();   // chỉ phím cuộn trang, không chặn bừa
  keys[c] = true;
  if (e.repeat) return;                              // bỏ qua OS key-repeat
  if (c === 'F2') { toggleDevMenu(); return; }
  if (c === 'KeyE' || c === 'Space') {
    const dlg = document.getElementById('dialog');
    // Nếu dialog đang mở → E để đóng, ngược lại mới tương tác
    if (getComputedStyle(dlg).display !== 'none') { dlg.style.display = 'none'; releaseFocus(); return; }
    doAction();
  }
  if (c === 'KeyM') openMissions();
  if (c === 'KeyI') openInventory();
  if (c === 'Escape') closeAll();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });
/* Chống dính phím chỉ ở các thời điểm an toàn — mất focus (Alt+Tab, click ra
   ngoài), ẩn tab, hoặc mở menu chuột phải. KHÔNG dùng document.hasFocus()
   từng frame: trong webview nhúng nó trả kết quả chập chờn khi click vào UI,
   đủ để xoá phím đang đè thật và làm nhân vật khựng giữa đường. */
window.addEventListener('blur', resetInput);
document.addEventListener('visibilitychange', () => { if (document.hidden) resetInput(); });
window.addEventListener('contextmenu', resetInput);

/* Xoá sạch trạng thái điều khiển: bàn phím + joystick + nút cảm ứng.
   Một phím/touchDir còn sticky qua cơn đổi cảnh là nguyên nhân nhân vật
   tự trôi (ở Phố Ngoài thì trôi xuống góc dưới phải, lọt ra ngoài đường). */
function resetInput() {
  keys = {};
  touchDir.up = touchDir.down = touchDir.left = touchDir.right = false;
  if (typeof joyReset === 'function') joyReset();   // ui.js: gỡ pointer capture, trả núm về giữa
  if (typeof joy !== 'undefined' && joy) { joy.active = false; joy.dx = 0; joy.dy = 0; }
}

/* ============ CAN WALK: GIỚI HẠN VÙNG ĐI LẠI THEO CẢNH ============
   Neo sprite là góc trên-trái, chân tiếp đất tại y + 30.
   Phố Ngoài (vẽ ở game.js): vỉa hè 270..352, nhựa 352..447, cỏ 458..600.
   Hộ lan đã gỡ nên đi thông từ vỉa hè xuống tận bãi cỏ: thân trên
   240..545, chân tới 575 vẫn còn trên mặt cỏ (600). */
const SCENE_WALK = {
  STREET: { minY: 240, maxY: 545, spawnY: 282 },
  // Văn phòng: dải tường + cửa kính chiếm 0..62 của ảnh nền → thân trên không dưới 56
  OFFICE: { minY: 56, maxY: 552, spawnY: 520 },
  // Phòng Server: tường + khay cáp 0..128, dãy rack áp tường → chỉ đi từ 140 trở xuống
  NET_ROOM: { minY: 140, maxY: 548, spawnY: 480 },
  // Lab phần cứng: tường + kệ linh kiện + bàn kỹ thuật chiếm 0..218 của ảnh nền
  HARDWARE_LAB: { minY: 218, maxY: 548, spawnY: 480 },
  // Học viện CCNA: tường + cửa sổ + áp-phích chiếm 0..128 của ảnh nền
  ACADEMY: { minY: 130, maxY: 548, spawnY: 430 },
  /* Phòng 6 — TRỤ SỞ IT / HELPDESK (interior_helpdesk_isometric.png, ảnh JPEG
     1024x572 lát full khung 960x600). Dải tường + kệ màn hình "TICKET ĐANG MỞ"
     chiếm 0..~150, sàn gỗ rộng bắt đầu từ đó → thân trên không dưới 155, chân
     tới 565 vẫn còn trên sàn (thảm "RA THÀNH PHỐ" góc trái dưới đi được).
     spawnY 420 = khoảng sàn trống giữa phòng. */
  IT: { minY: 155, maxY: 565, spawnY: 420 },
  /* Cảnh 7 — DATA CENTER (interior_datacenter_isometric.png, JPEG 1024x572 lát
     full khung 960x600, cùng hệ số với Phòng 6). Dải tường + máng cáp + rack
     treo cao nhất chiếm 0..~230 ở giữa phòng → thân trên bắt đầu từ 160, mép
     sàn gần nhất bên trái ~455 nên chân tới 565 vẫn còn trong khung hình.
     spawnY 430 = mặt sàn trống ngay trước 3 tủ RACK A1-A3. */
  DC: { minY: 160, maxY: 565, spawnY: 430 },
  /* Cảnh 9 — TRẠM MẠNG ISP (interior_isp_isometric.png, JPEG 1024x572 lát full
     khung 960x600, cùng hệ số với Phòng 6/7). Dải tường + bảng "LƯU LƯỢNG" +
     máng cáp nổi cao nhất chiếm tới ~y=225 ở góc xa → thân trên bắt đầu từ 150.
     Mép sàn gần nhất bên trái ~455 nên chân tới 565 vẫn còn trong khung gỗ.
     spawnY 520 = mặt sàn trống ngay trước bàn phụ cam (x 480 — điểm vào phòng
     cố định của engine), cạnh bên trái cụm bàn nên không rơi vào hộp va chạm. */
  ISP: { minY: 150, maxY: 565, spawnY: 520 },
  /* Căn cứ Mặt Trăng: ảnh lunar_base_bg 1024x572 giữ tỉ lệ khung, vẽ tại
     y=64..600 (960x536). Dải 0..64 là vũ trụ vector vẽ thêm, mặt cát bắt đầu
     sớm nên nới biên đi bộ thật thoáng (minY 115, maxY 575) để không bị chặn
     sớm ở rìa trên/dưới. spawnY = tâm thảm đáp LU_MAT trừ 18. */
  LUNAR_BASE: { minY: 115, maxY: 575, spawnY: 437 }
};
function canWalk(sc, y) {
  const b = SCENE_WALK[sc];
  return !b || (y >= b.minY && y <= b.maxY);
}
function clampWalkY(sc, y) {
  const b = SCENE_WALK[sc];
  return b ? Math.max(b.minY, Math.min(b.maxY, y)) : y;
}

/* ---- Va chạm đồ vật theo cảnh, đo từ ảnh nền AI (khung 960x600).
   Mỗi ô là [x, y, rộng, cao] tính theo mặt sàn của vật, KHÔNG tính bóng.
   Điểm va chạm của nhân vật là tâm (x+10, y+18) nới lề 8px.
   Phòng Máy Chủ trong VP Kế Toán phủ kín cả khối tường + lồng sắt: lối duy
   nhất vào trong là cánh cửa kính, và cửa này chỉ mở qua tương tác [E]
   (targetAct 'to_net'). ---- */
const SCENE_BOXES = {
  OFFICE: [
    [92, 148, 156, 60],    // quầy Lễ tân
    [206, 78, 46, 54],     // kệ hồ sơ sau quầy Lễ tân
    [100, 248, 118, 46],   // sofa chờ
    [300, 132, 366, 130],  // cụm 6 bàn Phòng Kế Toán
    [476, 56, 70, 94],     // tủ sắt giữa phòng
    [626, 76, 62, 76],     // tủ phụ + máy in
    [112, 348, 272, 146],  // bàn họp lớn + dàn ghế
    [516, 340, 200, 90],   // quầy bếp, tủ lạnh, cây nước nóng lạnh
    [528, 424, 120, 74],   // bàn tròn + 2 ghế pantry
    [723, 46, 226, 280]    // Network Room (kín hoàn toàn)
  ],
  /* Phòng 6 — TRỤ SỞ IT / HELPDESK, lõi va chạm đo từ ảnh nền isometric mới.
     CHỈ chặn tường trên + đúng 3 chiếc bàn (Helpdesk 2 màn giữa-phải, bàn kỹ
     thuật góc trên-phải, bàn cam cạnh dưới). Toàn bộ mặt sàn gỗ ở giữa để trống
     100% → đi thẳng từ thảm đỏ "RA THÀNH PHỐ" góc dưới-trái lên mọi vị trí.
     Điểm va chạm nhân vật là tâm (x+10, y+18) lề 8px. Ảnh 1024x572 lát full
     khung 960x600 → canvas = native × (960/1024, 600/572). */
  IT: [
    [0, 0, 960, 246],      // tường trên + cửa sổ + bảng "TICKET ĐANG MỞ: 06"
    [562, 298, 172, 148],  // bàn HELPDESK 2 màn hình + ghế xoay (giữa-phải)
    [783, 240, 132, 98],   // bàn kỹ thuật + máy tính góc trên-phải
    [295, 466, 152, 76]    // bàn cam nhỏ cạnh dưới
  ],
  /* Cảnh 7 — DATA CENTER, lõi va chạm đo trực tiếp trên ảnh isometric mới
     (grid 50px canvas, cùng tỉ lệ 1024x572 → 960x600 với Phòng 6).
     CHỈ 3 CỤM: ① tường trên + 3 tủ RACK A1-A2-A3 (dừng ở y=262 đúng theo yêu
     cầu "y < 265" để lối đi trước mặt dãy rack thoáng), ② lõi trên bàn PATCH
     PANEL (mặt bàn + 2 màn hình + patch panel, chạm mép dưới cụm ① nên không
     sinh khe kẹt góc), ③ RACK B1 áp tường phải. Hai hộp tường trái/phải chỉ
     để nhân vật không đứng leo lên vách kính/cửa và bảng sơ đồ — thảm đỏ
     "RA THÀNH PHỐ" (x 60..200, y 370..460) và 2 thảm xám dưới vẫn đi được.
     Đã xoá sạch va chạm chậu cây, cuộn cáp, ghế xoay. Điểm va chạm (x+10,y+18) lề 8px. */
  DC: [
    [0, 0, 168, 372],      // tường trái: đồng hồ + bàn phím ra vào + cửa kính (chừa thảm đỏ)
    [168, 0, 522, 262],    // ① RACK A1 + A2 + A3 áp tường trên + máng cáp
    [548, 262, 240, 150],  // ② lõi bàn PATCH PANEL: 2 màn hình + mặt bàn
    [690, 0, 122, 392],    // ③ RACK B1 sát mép phải
    [812, 0, 148, 415]     // tường phải: bảng sơ đồ + đèn trần (cuộn cáp/chậu cây không chặn)
  ],
  /* Cảnh 9 — TRẠM MẠNG ISP, lõi va chạm đo trực tiếp trên ảnh isometric mới
     (interior_isp_isometric.png, JPEG 1024x572 lát full khung 960x600 — cùng hệ
     số với Phòng 6/7). Tường trái là dốc chéo nên phải THANG 3 BẬC (chân tường
     canvas: x0→y450, x170→y386, x340→y322, x612→y225) mới ôm sát mà không ăn
     sàn. Cụm rack BRAS-01/BRAS-01/CORE-02 + bàn TRACEROUTE + bảng topo áp hết
     góc phải; bàn phụ cam chỉ chặn PHẦN MẶT BÀN (y 462..514) để nhân vật đi
     vòng hai bên. Bốn hộp cuối là vùng ĐEN ngoài phòng (sàn cắt chéo ngay góc
     dưới) — không chặn thì nhân vật đứng lơ lửng trên nền đen.
     Sàn gỗ chính giữa (x 180..470, y 300..565) trống hoàn toàn. Điểm va chạm
     (x+10,y+18) lề 8px; đã kiểm tra liên thông: 1 thành phần, không pocket. */
  ISP: [
    [0, 0, 170, 386],      // tường trái ①: cửa kính trượt + bảng từ (chừa thảm đỏ)
    [170, 0, 170, 322],    // tường trái ②: ống gen cáp + hộp kỹ thuật + đồng hồ
    [340, 0, 272, 268],    // tường trái ③: chân bảng "LƯU LƯỢNG 4.2 Gbps"
    [612, 0, 268, 360],    // cụm rack BRAS-01 + BRAS-01 + CORE-02 áp tường phải
    [880, 0, 80, 430],     // tường phải: poster sơ đồ + chậu cây
    [780, 300, 100, 130],  // bảng ghim topo (2 chân sắt trên sàn)
    [497, 330, 208, 120],  // thân bàn TRACEROUTE: mặt bàn + 2 màn hình + ghế
    [445, 445, 120, 69],   // mặt bàn phụ cam + màn hình (nắp lên hộp bàn chính 13px
                           // để hai mép lề 8px không hở khe 1px gây kẹt góc)
    [0, 480, 110, 120],    // vùng đen ngoài sàn ① dưới-trái
    [0, 545, 200, 55],     // vùng đen ngoài sàn ② dưới-trái
    [850, 470, 110, 130],  // vùng đen ngoài sàn ③ dưới-phải
    [760, 545, 200, 55]    // vùng đen ngoài sàn ④ dưới-phải
  ],
  /* Phòng Server — đo từ lưới 50px của interior_network_bg_revamp.png.
     Dãy rack + tủ làm mát áp tường chỉ chặn tới y≈400, chừa lối đi dọc
     đáy phòng (thảm VỀ VĂN PHÒNG) và hành lang trái dẫn tới Tuấn (Net). */
  NET_ROOM: [
    [0, 128, 106, 122],     // bảng điều khiển áp tường góc trái
    [26, 252, 84, 88],      // xe đẩy thùng cáp sườn trái
    [186, 128, 142, 274],   // RACK01
    [328, 150, 100, 200],   // tủ làm mát giữa RACK01 và RACK02
    [428, 128, 142, 274],   // RACK02
    [570, 150, 98, 200],    // tủ làm mát giữa RACK02 và RACK03
    [668, 128, 142, 274],   // RACK03
    [820, 128, 140, 224],   // cụm tủ phải + bảng sơ đồ mạng
    [12, 392, 84, 78],      // tủ cuộn cáp góc trái
    [205, 380, 100, 82],    // bàn CONSOLE
    [850, 318, 110, 182]    // cuộn cáp + tủ thấp trục phải
  ],
  /* Lab phần cứng — interior_hardware_bg_revamp.png, đo từ lưới 50px.
     Ba bàn kỹ thuật chặn tới y≈296: sâu hơn nữa thì trigger [E] (bán kính 55
     tính theo gốc sprite) không với tới được từ phía trước mặt bàn. */
  HARDWARE_LAB: [
    [0, 88, 136, 130],     // tủ sắt locker góc trái
    [192, 82, 100, 62],    // bảng dụng cụ treo tường
    [300, 138, 66, 78],    // xe dụng cụ nhỏ
    [368, 45, 462, 180],   // kệ KHO LINH KIỆN chạy dọc tường trên
    [828, 52, 132, 68],    // bảng SƠ ĐỒ NGUỒN ĐIỆN góc phải
    [852, 158, 50, 62],    // ghế xoay + kệ góc phải
    [128, 218, 152, 78],   // bàn LẮP RÁP PC
    [406, 220, 158, 76],   // bàn LẮP NÂNG CẤP / bấm cáp
    [688, 222, 158, 74],   // bàn CHẨN ĐOÁN PC
    [4, 328, 44, 54],      // chậu cây góc trái
    [8, 382, 96, 50],      // rào chắn vàng-đen trái
    [172, 382, 80, 50],    // rào chắn vàng-đen giữa
    [288, 352, 64, 92],    // thùng carton + case PC dựng đứng
    [418, 350, 166, 126],  // đống case máy tính cũ giữa phòng
    [592, 412, 54, 70],    // thùng rác đựng cáp
    [730, 418, 64, 64],    // thùng carton phải
    [838, 376, 66, 98],    // xe đẩy dụng cụ đỏ
    [908, 396, 50, 78]     // chậu cây + kệ góc phải
  ],
  /* Học viện CCNA — interior_ccna_bg_revamp.png, đo từ lưới 50px.
     Buồng thi chỉ chặn tới y≈340: ghế ngồi thi và sàn trong buồng để trống cho
     nhân vật bước vào, nếu không trigger [E] (bán kính 74 tính theo điểm va chạm
     của INTERIORS.ACADEMY.station 660,300) không với tới được. */
  ACADEMY: [
    [18, 88, 100, 84],     // kệ router/switch + cuộn cáp góc trái
    [16, 130, 240, 226],   // bục giảng + bảng đen + đài giảng viên
    [198, 105, 92, 70],    // xe đẩy cuộn cáp áp tường
    [300, 132, 160, 138],  // cụm bàn LAB 1 (case + màn + ghế)
    [478, 127, 152, 143],  // cụm bàn LAB 2
    [636, 132, 50, 84],    // tủ patch panel giữa hai bàn LAB
    [700, 92, 52, 78],     // chậu cây lớn chân tường
    [746, 68, 100, 102],   // tủ sách
    [846, 112, 100, 58],   // tủ thấp + chồng sách góc phải
    [884, 190, 46, 164],   // kệ hộp hồ sơ sát tường phải
    [822, 252, 60, 70],    // ghế xoay góc phải
    [583, 220, 182, 120],  // PHÒNG THI CCNA: biển + vách + bàn + màn hình
    [215, 296, 165, 108],  // bàn giáo viên gỗ + ghế
    [20, 300, 52, 52],     // chậu cây góc trái
    [25, 437, 92, 50],     // rào chắn sắt A
    [152, 437, 86, 50],    // rào chắn sắt B
    [330, 462, 212, 126],  // kệ thiết bị + cuộn cáp mép dưới
    [283, 502, 40, 78],    // xe đẩy hộp xanh
    [798, 438, 48, 38],    // hộp nối cáp dưới sàn
    [876, 430, 56, 118],   // xe đẩy dụng cụ góc phải
    [568, 516, 40, 60],    // thùng rác
    [616, 502, 46, 68]     // rổ nhựa xanh
  ],
  /* Căn cứ Mặt Trăng — lunar_base_bg.png, khung canvas 960x536 (ảnh tại y=64).
     Gỡ sạch va chạm vụn để đi lại thoáng: xoá toàn bộ hố thiên thạch, ống nối
     áp lực, cáp cuộn, xe rover, cần cẩu, cột thu phát nhỏ và MẶT SÀN BÃI ĐÁP.
     Nhân vật đi xuyên cát, cáp và bệ phóng tự do. Chỉ giữ 6 lõi gọn nằm sâu ở
     PHẦN TRÊN của 6 công trình lớn (① Lab ② Biodome ③ Satellite ④ thân phi
     thuyền ⑤ trạm cáp ⑥ an ninh), mỗi lõi đã thu hẹp ≥40% để mọi hành lang
     giữa các công trình rộng ≥100–140px. */
  LUNAR_BASE: [
    [176, 262, 84, 26],     // ① Lab Dome — lõi trên
    [382, 306, 116, 30],    // ② Server Biodome — lõi trên
    [585, 210, 120, 26],    // ③ Cụm chảo Satellite — lõi trên
    [690, 300, 110, 30],    // ④ Thân giữa phi thuyền (sàn bệ đáp đã bỏ chặn)
    [120, 482, 150, 26],    // ⑤ Nhà trạm cáp — lõi trên
    [548, 496, 74, 24]      // ⑥ Vòm an ninh — lõi trên
  ]
};
function propCollides(sc, nx, ny) {
  const boxes = SCENE_BOXES[sc];
  if (!boxes) return false;
  const cx = nx + 10, cy = ny + 18, r = 8;
  for (const b of boxes) if (b[0] - r < cx && b[0] + b[2] + r > cx && b[1] - r < cy && b[1] + b[3] + r > cy) return true;
  return false;
}

/* Trượt góc: đi thẳng 1 trục mà vướng sát mép hộp (≤ SLIDE_SNAG px) thì lách
   nhẹ theo trục vuông góc để vòng qua góc thay vì đứng khựng. */
const SLIDE_SNAG = 18;
function cornerSlidePush(sc, pcx, pcy, axis) {
  const boxes = SCENE_BOXES[sc];
  if (!boxes) return null;
  const r = 8;
  let best = null, bestD = SLIDE_SNAG + 1;
  for (const b of boxes) {
    if (!(b[0] - r < pcx && b[0] + b[2] + r > pcx && b[1] - r < pcy && b[1] + b[3] + r > pcy)) continue;
    let push;
    if (axis === 'x') {         // đang tiến theo X → trượt Y ra mép gần nhất
      const dTop = pcy - (b[1] - r), dBot = (b[1] + b[3] + r) - pcy;
      push = dTop < dBot ? -dTop : dBot;
    } else {                     // đang tiến theo Y → trượt X ra mép gần nhất
      const dL = pcx - (b[0] - r), dR = (b[0] + b[2] + r) - pcx;
      push = dL < dR ? -dL : dR;
    }
    const ad = Math.abs(push);
    if (ad <= SLIDE_SNAG && ad < bestD) { bestD = ad; best = push; }
  }
  return best;
}

function boxCollides(nx, ny) {
  const cx = nx + 10, cy = ny + 18, r = 8;
  for (const b of blds) if (b.x - r < cx && b.x + b.w + r > cx && b.y - r < cy && b.y + b.h + r > cy) return true;
  // đài phun nước trung tâm (va chạm hình elip)
  const dx = (cx - FOUNTAIN.x) / (FOUNTAIN.rx + r);
  const dy = (cy - FOUNTAIN.y) / (FOUNTAIN.ry + r);
  if (dx * dx + dy * dy < 1) return true;
  return false;
}

/* ============ UPDATE LOOP ============ */
let lastScene = null;      // cảnh của frame trước, để phát hiện vừa đổi cảnh
let uiWasOpen = false;     // frame trước có modal/bảng hội thoại mở không
function update() {
  const _n = performance.now(), _k = Math.min(3, (_n - (window._lt || _n)) / 16.667) || 1; window._lt = _n;
  // ĐỔI CẢNH: buông hết phím + neo lại nhân vật vào dải đi bộ của cảnh mới
  if (S.scene !== lastScene) {
    lastScene = S.scene;
    resetInput();
    S.p.y = clampWalkY(S.scene, S.p.y);
  }
  /* Vừa mở modal / bảng hội thoại → buông hết phím đang đè (chỉ một lần,
     lúc mở), để khi bảng đóng lại nhân vật đứng yên chứ không trôi tiếp. */
  const uiOpen = getComputedStyle(document.getElementById('dialog')).display !== 'none' ||
                 !!openModalEl();
  if (uiOpen && !uiWasOpen) resetInput();
  uiWasOpen = uiOpen;
  if (S.weather === 'rain' && S.scene === 'WORLD') {
    S.rain.forEach(r => {
      r.y += r.spd; r.x -= 2.5;
      if (r.y > 610) { r.y = -20; r.x = Math.random()*1060 + 60; }
    });
  }
  if (S.scene === 'WORLD') {
    S.leaves.forEach(l => {
      l.x += l.vx + Math.sin(Date.now()*0.001 + l.x*0.01) * 0.3;
      l.y += l.vy; l.rot += l.rs;
      if (l.x > 980) l.x = -20;
      if (l.y > 620) { l.y = -20; l.x = Math.random()*960; }
    });
    S.butterflies.forEach(bf => {
      bf.phase += 0.05;
      const dx = bf.tx - bf.x, dy = bf.ty - bf.y, d = Math.hypot(dx, dy);
      if (d < 5) { bf.tx = 300 + Math.random()*360; bf.ty = 220 + Math.random()*180; }
      else { bf.x += (dx/d) * 0.7; bf.y += (dy/d) * 0.7; }
    });
    S.fireflies.forEach(f => {
      f.phase += 0.03 * f.spd;
      f.x += Math.cos(f.phase * 0.7) * 0.3;
      f.y += Math.sin(f.phase * 0.5) * 0.2;
    });
    S.ripples = S.ripples.filter(r => { r.r += 0.6; r.a -= 0.012; return r.a > 0; });
    if (Math.random() < 0.02 && S.weather === 'rain') S.ripples.push({x: 420 + Math.random()*130, y: 270 + Math.random()*70, r: 2, a: 0.7});
  }

  if (openModalEl()) {
    requestAnimationFrame(() => { update(); render(); });
    return;
  }

  let mx = 0, my = 0;
  if (held('up') || touchDir.up)       my -= 1;
  if (held('down') || touchDir.down)   my += 1;
  if (held('left') || touchDir.left)   mx -= 1;
  if (held('right') || touchDir.right) mx += 1;
  S.p.moving = (mx !== 0 || my !== 0);
  if (mx !== 0) S.p.dir = mx > 0 ? 1 : -1;
  if (S.p.moving) {
    S.p.step++;
    if (S.p.step % 16 === 0) beep(180, 'triangle', 0.03, 0.012);
  }
  const _v = S.p.spd * _k * SPEED_BOOST * shopSpd() * ((mx && my) ? 0.7071 : 1);
  const _wb = SCENE_WALK[S.scene];
  const _yLo = _wb ? _wb.minY : 30, _yHi = _wb ? _wb.maxY : 552;
  const nx = Math.max(15, Math.min(925, S.p.x + mx * _v));
  const ny = Math.max(_yLo, Math.min(_yHi, S.p.y + my * _v));
  if (S.scene === 'WORLD') {
    if (!boxCollides(nx, S.p.y)) S.p.x = nx;
    if (!boxCollides(S.p.x, ny)) S.p.y = ny;
  } else {
    // các cảnh khác: dải đi bộ của cảnh (STREET = vỉa hè) + đồ vật trong phòng
    const sc = S.scene;
    const okX = !propCollides(sc, nx, S.p.y);
    const okY = canWalk(sc, ny) && !propCollides(sc, S.p.x, ny);
    if (okX) S.p.x = nx;
    if (okY) S.p.y = ny;
    // Trượt góc: đi thẳng 1 trục vướng mép hộp thì lách qua góc thay vì khựng
    if (!okX && mx !== 0 && my === 0) {
      const push = cornerSlidePush(sc, nx + 10, S.p.y + 18, 'x');
      if (push !== null) {
        const sy = Math.max(_yLo, Math.min(_yHi, S.p.y + push));
        if (canWalk(sc, sy) && !propCollides(sc, nx, sy)) { S.p.x = nx; S.p.y = sy; }
      }
    } else if (!okY && my !== 0 && mx === 0) {
      const push = cornerSlidePush(sc, S.p.x + 10, ny + 18, 'y');
      if (push !== null) {
        const sx = Math.max(15, Math.min(925, S.p.x + push));
        if (!propCollides(sc, sx, ny)) { S.p.x = sx; S.p.y = ny; }
      }
    }
  }

  targetAct = null;
  if (S.scene === 'WORLD') {
    const cx = S.p.x + 10, cy = S.p.y + 18;
    blds.forEach(b => {
      const dx = Math.max(b.x - cx, 0, cx - (b.x + b.w));
      const dy = Math.max(b.y - cy, 0, cy - (b.y + b.h));
      if (Math.hypot(dx, dy) < 40) targetAct = { t: 'bld', d: b };
    });
  } else if (S.scene === 'OFFICE') {
    if (Math.hypot(S.p.x - 290, S.p.y - 175) < 55) targetAct = { t: 'lan' };
    if (S.p.x > 740 && S.p.y < 120) targetAct = { t: 'to_net' };
    // cửa kính Network Room nằm ở mép dưới khối phòng máy (ngưỡng y≈326) — phòng đã
    // đóng kín bằng va chạm nên đây là lối duy nhất, và chỉ mở khi bấm [E].
    if (S.p.x > 700 && S.p.x < 830 && S.p.y > 300 && S.p.y < 400) targetAct = { t: 'to_net' };
    if (S.p.x < 110 && S.p.y > 500) targetAct = { t: 'to_world' };
  } else if (S.scene === 'NET_ROOM') {
    if (Math.hypot(S.p.x - 130, S.p.y - 215) < 55) targetAct = { t: 'tuan' };
    if (Math.hypot(S.p.x - 250, S.p.y - 410) < 65) targetAct = { t: 'rack' };
    if (S.p.x < 150 && S.p.y > 505) targetAct = { t: 'to_office' };
  } else if (S.scene === 'HARDWARE_LAB') {
    if (Math.hypot(S.p.x - 200, S.p.y - 250) < 55) targetAct = { t: 'hw_workbench' };
    if (Math.hypot(S.p.x - 480, S.p.y - 250) < 55) targetAct = { t: 'hw_crimp' };
    if (Math.hypot(S.p.x - 760, S.p.y - 250) < 55) targetAct = { t: 'hw_diag' };
    if (S.p.x < 110 && S.p.y > 500) targetAct = { t: 'to_world' };
  } else if (INTERIORS[S.scene]) {
    const cfg = INTERIORS[S.scene];
    // Cảnh 9 cần bán kính [E] riêng 95px → station.rad, các phòng khác vẫn 90.
    if (Math.hypot(S.p.x + 10 - cfg.station.x, S.p.y + 18 - cfg.station.y) < (cfg.station.rad || 90)) targetAct = { t: 'ig_station', id: S.scene };
    if (Math.hypot(S.p.x + 10 - cfg.npc.x, S.p.y + 18 - cfg.npc.y) < 90) targetAct = { t: 'ig_npc', id: S.scene };
    // Cảnh 7 và 9 có thảm đỏ "RA THÀNH PHỐ" nằm cao hơn (y≈370..460) nên vùng exit
    // đặt trong INTERIORS; các phòng khác vẫn dùng góc dưới-trái mặc định.
    const ex = cfg.exit || { x: 130, y: 500 };
    if (S.p.x < ex.x && S.p.y > ex.y) targetAct = { t: 'to_world' };
  }

  requestAnimationFrame(() => { update(); render(); });
}

/* ============ SPRITES ============ */
function drawSprite(x, y, r='p') {
  const moving = (r === 'p') ? S.p.moving : false;
  const ph = S.p.step * 0.32;
  const bob = moving ? Math.abs(Math.sin(ph)) * 1.3 : 0;
  const legA = moving ? Math.max(0, Math.sin(ph)) * 3 : 0;
  const legB = moving ? Math.max(0, Math.sin(ph + Math.PI)) * 3 : 0;
  const armA = moving ? Math.sin(ph) * 2 : 0;

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(x + 10, y + 30, 11, 4.5, 0, 0, Math.PI*2); ctx.fill();

  let hair, hair2, skin, skinD, shirt, shirtD, pants, shoe;
  if (r === 'p') { hair='#1e293b'; hair2='#0f172a'; skin='#fcd0a3'; skinD='#e2a878'; shirt='#0284c7'; shirtD='#0369a1'; pants='#1e293b'; shoe='#0b1220'; }
  else if (r === 'lan') { hair='#4a2c14'; hair2='#2f1a0a'; skin='#fcd0a3'; skinD='#e2a878'; shirt='#ec4899'; shirtD='#be185d'; pants='#7c2d12'; shoe='#3b1d0b'; }
  else if (r === 'tuan') { hair='#0f172a'; hair2='#020617'; skin='#fcd0a3'; skinD='#e2a878'; shirt='#16a34a'; shirtD='#15803d'; pants='#1e293b'; shoe='#0b1220'; }
  else if (r === 'huong') { hair='#7c2d12'; hair2='#4a1a08'; skin='#fcd0a3'; skinD='#e2a878'; shirt='#f59e0b'; shirtD='#b45309'; pants='#1e293b'; shoe='#0b1220'; }
  else if (r === 'duc')  { hair='#1e1b4b'; hair2='#0f0d2e'; skin='#fcd0a3'; skinD='#e2a878'; shirt='#7c3aed'; shirtD='#5b21b6'; pants='#1e293b'; shoe='#0b1220'; }
  else if (r === 'linh') { hair='#312e81'; hair2='#1e1b4b'; skin='#fcd0a3'; skinD='#e2a878'; shirt='#0891b2'; shirtD='#0e7490'; pants='#1e293b'; shoe='#0b1220'; }
  else if (r === 'khoa') { hair='#0f172a'; hair2='#020617'; skin='#fcd0a3'; skinD='#e2a878'; shirt='#0ea5e9'; shirtD='#0369a1'; pants='#1e293b'; shoe='#0b1220'; }
  else if (r === 'mai')  { hair='#78350f'; hair2='#451a03'; skin='#fcd0a3'; skinD='#e2a878'; shirt='#10b981'; shirtD='#047857'; pants='#1e293b'; shoe='#0b1220'; }
  else if (r === 'son')  { hair='#1c1917'; hair2='#0c0a09'; skin='#fcd0a3'; skinD='#e2a878'; shirt='#ef4444'; shirtD='#b91c1c'; pants='#1e293b'; shoe='#0b1220'; }
  else { hair='#1e293b'; hair2='#0f172a'; skin='#fcd0a3'; skinD='#e2a878'; shirt='#0284c7'; shirtD='#0369a1'; pants='#1e293b'; shoe='#0b1220'; }

  const ty = y - bob;
  ctx.fillStyle = pants;
  ctx.fillRect(x + 4, ty + 22, 5, 8 - legA); ctx.fillRect(x + 11, ty + 22, 5, 8 - legB);
  ctx.fillStyle = shoe;
  ctx.fillRect(x + 3, ty + 29 - legA, 7, 3); ctx.fillRect(x + 10, ty + 29 - legB, 7, 3);
  ctx.fillStyle = shirt; ctx.fillRect(x + 3, ty + 16, 14, 11);
  ctx.fillStyle = shirtD; ctx.fillRect(x + 3, ty + 16, 14, 2); ctx.fillRect(x + 3, ty + 25, 14, 2);
  ctx.fillStyle = skin; ctx.fillRect(x + 8, ty + 16, 4, 3);
  ctx.fillStyle = shirt;
  ctx.fillRect(x + 1, ty + 17 + armA, 3, 8); ctx.fillRect(x + 16, ty + 17 - armA, 3, 8);
  ctx.fillStyle = skin;
  ctx.fillRect(x + 1, ty + 24 + armA, 3, 3); ctx.fillRect(x + 16, ty + 24 - armA, 3, 3);
  ctx.fillStyle = skin; ctx.fillRect(x + 4, ty + 5, 12, 12);
  ctx.fillStyle = skinD; ctx.fillRect(x + 4, ty + 14, 12, 3);
  ctx.fillStyle = hair; ctx.fillRect(x + 3, ty + 2, 14, 6);
  ctx.fillRect(x + 3, ty + 2, 3, 10); ctx.fillRect(x + 14, ty + 2, 3, 10);
  ctx.fillStyle = hair2; ctx.fillRect(x + 3, ty + 2, 14, 2);
  ctx.fillStyle = '#0f172a';
  const eyeShift = S.p.dir > 0 ? 1 : -1;
  if (r === 'p') { ctx.fillRect(x + 7 + eyeShift, ty + 10, 2, 2); ctx.fillRect(x + 11 + eyeShift, ty + 10, 2, 2); }
  else { ctx.fillRect(x + 7, ty + 10, 2, 2); ctx.fillRect(x + 11, ty + 10, 2, 2); }
  ctx.fillStyle = 'rgba(244,114,182,0.35)';
  ctx.fillRect(x + 5, ty + 13, 2, 2); ctx.fillRect(x + 13, ty + 13, 2, 2);

  const names = {
    p: ['Nhân (IT)', '#38bdf8'], lan: ['Chị Lan', '#facc15'], tuan: ['Tuấn (Net)', '#22c55e'], huong: ['Chị Hương', '#f59e0b'],
    duc: ['Thầy Đức', '#a855f7'], linh: ['Chị Linh', '#38bdf8'], khoa: ['Anh Khoa', '#0ea5e9'],
    mai: ['Chị Mai', '#10b981'], son: ['Anh Sơn', '#ef4444']
  };
  const [nm, col] = names[r] || ['???', '#94a3b8'];
  ctx.font = 'bold 9px monospace';
  const tw = ctx.measureText(nm).width;
  ctx.fillStyle = 'rgba(2,6,23,0.75)';
  ctx.fillRect(x + 10 - tw/2 - 4, y - 17, tw + 8, 13);
  ctx.fillStyle = col; ctx.textAlign = 'center';
  ctx.fillText(nm, x + 10, y - 7); ctx.textAlign = 'left';
}

/* ============ OFFICE ============ */
function drawOffice() {
  for (let y = 0; y < 600; y += 26) {
    ctx.fillStyle = (y / 26) % 2 ? '#a9743d' : '#9c6a37';
    ctx.fillRect(0, y, 960, 24);
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(0, y + 24, 960, 2);
  }
  ctx.fillStyle = '#334155'; ctx.fillRect(0, 0, 960, 50);
  ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 48, 960, 6);
  for (let i = 0; i < 5; i++) {
    const wx = 140 + i * 150;
    ctx.fillStyle = '#0f172a'; ctx.fillRect(wx, 12, 46, 28);
    ctx.fillStyle = S.weather === 'night' ? '#fde68a' : '#7dd3fc';
    ctx.fillRect(wx + 2, 14, 42, 24);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(wx + 2, 14, 42, 8);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(wx + 22, 14, 2, 24); ctx.fillRect(wx + 2, 25, 42, 2);
  }
  ctx.fillStyle = 'rgba(15, 23, 42, 0.16)'; ctx.fillRect(20, 62, 180, 140);
  ctx.strokeStyle = 'rgba(56,189,248,0.35)'; ctx.lineWidth = 1.5; ctx.strokeRect(20, 62, 180, 140);
  ctx.fillStyle = '#1e293b'; ctx.fillRect(30, 82, 140, 26);
  ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 9px monospace'; ctx.fillText("1. RECEPTION", 38, 98);
  ctx.fillStyle = '#451a03'; ctx.fillRect(40, 118, 120, 30);
  ctx.fillStyle = '#78350f'; ctx.fillRect(42, 120, 116, 26);
  ctx.fillStyle = '#f43f5e'; ctx.beginPath(); ctx.arc(132, 130, 7, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = 'rgba(2, 132, 199, 0.14)'; ctx.fillRect(230, 62, 200, 195);
  ctx.strokeStyle = 'rgba(56,189,248,0.4)'; ctx.strokeRect(230, 62, 200, 195);
  ctx.fillStyle = '#0369a1'; ctx.fillRect(240, 72, 140, 22);
  ctx.fillStyle = '#fff'; ctx.fillText("2. PHÒNG KẾ TOÁN", 250, 87);
  ctx.fillStyle = '#3b2413'; ctx.fillRect(238, 132, 154, 72);
  ctx.fillStyle = '#78350f'; ctx.fillRect(242, 136, 146, 64);
  ctx.fillStyle = '#0f172a'; ctx.fillRect(270, 116, 42, 26);
  ctx.fillStyle = S.isFixed ? '#22c55e' : '#ef4444'; ctx.fillRect(273, 119, 36, 20);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  for (let i = 0; i < 4; i++) ctx.fillRect(276, 122 + i*4, 30, 1.5);
  ctx.fillStyle = '#334155'; ctx.fillRect(284, 142, 14, 5);

  ctx.fillStyle = '#0f172a'; ctx.fillRect(40, 312, 150, 22);
  ctx.fillStyle = '#facc15'; ctx.fillText("3. PHÒNG HỌP LỚN", 50, 327);
  ctx.fillStyle = '#3b2413'; ctx.fillRect(48, 352, 174, 74);
  ctx.fillStyle = '#78350f'; ctx.fillRect(52, 356, 166, 66);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(72 + i * 50, 336, 26, 14); ctx.fillRect(72 + i * 50, 426, 26, 14);
  }

  ctx.fillStyle = '#0f172a'; ctx.fillRect(490, 312, 130, 22);
  ctx.fillStyle = '#22c55e'; ctx.fillText("5. PANTRY & TRÀ", 500, 327);
  ctx.fillStyle = '#475569'; ctx.fillRect(490, 348, 150, 40);
  ctx.fillStyle = '#e2e8f0'; ctx.fillRect(660, 330, 36, 68);
  ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(678, 322, 12, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#78350f'; ctx.beginPath(); ctx.arc(560, 445, 28, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = '#0a1220'; ctx.fillRect(710, 50, 250, 230);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.14)'; ctx.fillRect(710, 50, 250, 230);
  ctx.fillStyle = '#475569'; ctx.fillRect(710, 50, 6, 230); ctx.fillRect(710, 274, 250, 6);
  ctx.fillStyle = '#0284c7'; ctx.fillRect(726, 62, 200, 28);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.fillText("🔒 NETWORK ROOM ➔", 736, 80);

  ctx.fillStyle = '#7f1d1d'; ctx.fillRect(20, 512, 120, 66);
  ctx.fillStyle = '#991b1b'; ctx.fillRect(24, 516, 112, 58);
  ctx.fillStyle = '#ef4444'; ctx.fillRect(30, 556, 100, 22);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace';
  ctx.fillText("🚪 RA THÀNH PHỐ", 32, 571);

  drawSprite(282, 152, 'lan');
  drawSprite(S.p.x, S.p.y, 'p');
}

/* ============ NETWORK ROOM ============ */
function drawNetworkRoom() {
  ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, 960, 600);
  ctx.strokeStyle = 'rgba(56,189,248,0.08)'; ctx.lineWidth = 1;
  for (let y = 0; y < 600; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(960, y); ctx.stroke(); }
  for (let x = 0; x < 960; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 600); ctx.stroke(); }
  const cg = ctx.createRadialGradient(480, 0, 20, 480, 0, 480);
  cg.addColorStop(0, 'rgba(56,189,248,0.10)'); cg.addColorStop(1, 'rgba(56,189,248,0)');
  ctx.fillStyle = cg; ctx.fillRect(0, 0, 960, 400);
  ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 13px monospace';
  ctx.fillText("🔒 3. NETWORK ROOM - RACK & THIẾT BỊ", 30, 30);

  ['RACK01', 'RACK02', 'RACK03'].forEach((name, i) => {
    const rx = 180 + i * 240;
    const isMain = i === 0;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(rx + 6, 138, 140, 250);
    ctx.fillStyle = '#060a12'; ctx.fillRect(rx, 130, 140, 250);
    ctx.strokeStyle = isMain ? '#38bdf8' : '#475569'; ctx.lineWidth = 2; ctx.strokeRect(rx, 130, 140, 250);
    ctx.fillStyle = isMain ? 'rgba(56,189,248,0.25)' : 'rgba(71,85,105,0.3)'; ctx.fillRect(rx + 2, 132, 136, 14);
    for (let u = 0; u < 6; u++) {
      const uy = 152 + u * 36;
      ctx.fillStyle = '#1e293b'; ctx.fillRect(rx + 8, uy, 124, 28);
      const p1 = Math.sin(S.p.step * 0.2 + u) > 0;
      ctx.fillStyle = p1 ? '#22c55e' : '#14532d'; ctx.fillRect(rx + 14, uy + 11, 5, 5);
      const fixedNow = S.isFixed || i > 0;
      ctx.fillStyle = fixedNow ? '#22c55e' : '#ef4444'; ctx.fillRect(rx + 24, uy + 11, 5, 5);
      ctx.fillStyle = '#0f172a'; ctx.fillRect(rx + 46, uy + 8, 62, 14);
      for (let p = 0; p < 8; p++) {
        ctx.fillStyle = '#334155'; ctx.fillRect(rx + 48 + p * 7.5, uy + 10, 5, 10);
      }
    }
    ctx.fillStyle = isMain ? '#facc15' : '#94a3b8'; ctx.font = 'bold 11px monospace';
    ctx.fillText(name, rx + 12, 122);
  });
  ctx.fillStyle = '#0284c7'; ctx.fillRect(30, 528, 140, 26);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace'; ctx.fillText("⬅ VỀ VĂN PHÒNG", 40, 546);
  drawSprite(120, 200, 'tuan');
  drawSprite(S.p.x, S.p.y, 'p');
}

/* ============ HARDWARE LAB ============ */
function drawHardwareLab() {
  // floor - industrial gray tile
  ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, 960, 600);
  ctx.strokeStyle = 'rgba(100,116,139,0.25)'; ctx.lineWidth = 1;
  for (let y = 0; y < 600; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(960, y); ctx.stroke(); }
  for (let x = 0; x < 960; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 600); ctx.stroke(); }
  // ceiling light glow
  const cg = ctx.createRadialGradient(480, 0, 20, 480, 0, 500);
  cg.addColorStop(0, 'rgba(250,204,21,0.08)'); cg.addColorStop(1, 'rgba(250,204,21,0)');
  ctx.fillStyle = cg; ctx.fillRect(0, 0, 960, 400);

  // title
  ctx.fillStyle = '#22c55e'; ctx.font = 'bold 13px monospace';
  ctx.fillText("🔧 4. LAB PHẦN CỨNG & IT SUPPORT", 30, 30);

  // ===== STATION 1: PC BUILD WORKBENCH =====
  drawWorkbench(200, 250, '🛠️', 'LẮP RÁP PC', 'Bấm [E] để lắp máy', '#0284c7', S.missionsDone.pcBuild);
  drawLockChip(200, 168, 'pcBuild');

  // ===== STATION 2: CRIMPING STATION =====
  drawCrimpStation(480, 250, S.missionsDone.crimp);
  drawLockChip(480, 168, 'crimp');

  // ===== STATION 3: DIAGNOSTIC PC =====
  drawDiagStation(760, 250, S.missionsDone.diag);
  drawLockChip(760, 168, 'diag');

  // ===== PARTS SHELF (decorative) =====
  ctx.fillStyle = '#0f172a'; ctx.fillRect(380, 60, 400, 50);
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.strokeRect(380, 60, 400, 50);
  ctx.fillStyle = '#22c55e'; ctx.font = 'bold 10px monospace';
  ctx.fillText("📦 KHO LINH KIỆN (CPU / RAM / GPU / SSD / PSU...)", 400, 90);
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = ['#0284c7','#16a34a','#f59e0b','#ef4444','#a855f7','#38bdf8'][i % 6];
    ctx.fillRect(392 + i * 48, 70, 36, 14);
  }

  // ===== EXIT DOOR =====
  ctx.fillStyle = '#7f1d1d'; ctx.fillRect(20, 512, 140, 66);
  ctx.fillStyle = '#991b1b'; ctx.fillRect(24, 516, 132, 58);
  ctx.fillStyle = '#ef4444'; ctx.fillRect(30, 556, 120, 22);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace';
  ctx.fillText("🚪 RA THÀNH PHỐ", 32, 571);

  // NPC Hương
  drawSprite(680, 470, 'huong');
  // player
  drawSprite(S.p.x, S.p.y, 'p');
}

function drawWorkbench(x, y, icon, title, sub, color, done) {
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x - 70 + 6, y + 50 + 4, 140, 40);
  // bench surface
  ctx.fillStyle = '#451a03'; ctx.fillRect(x - 70, y + 20, 140, 30);
  ctx.fillStyle = '#78350f'; ctx.fillRect(x - 66, y + 24, 132, 22);
  // legs
  ctx.fillStyle = '#3a1a08'; ctx.fillRect(x - 62, y + 50, 10, 40); ctx.fillRect(x + 52, y + 50, 10, 40);
  // PC case on top
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x - 40, y - 30, 80, 55);
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.5; ctx.strokeRect(x - 40, y - 30, 80, 55);
  // PC internals visual
  ctx.fillStyle = done ? '#22c55e' : '#ef4444'; ctx.fillRect(x - 33, y - 24, 66, 6);
  ctx.fillStyle = '#334155';
  ctx.fillRect(x - 33, y - 14, 30, 8);
  ctx.fillRect(x - 33, y - 2, 30, 8);
  ctx.fillRect(x + 3, y - 14, 30, 8);
  ctx.fillRect(x + 3, y - 2, 30, 8);
  // power button glow
  const pulse = (Math.sin(Date.now() * 0.005) + 1) * 0.5;
  ctx.fillStyle = done ? `rgba(34,197,94,${0.7 + pulse*0.3})` : `rgba(239,68,68,${0.7 + pulse*0.3})`;
  ctx.beginPath(); ctx.arc(x + 30, y - 26, 3, 0, Math.PI*2); ctx.fill();

  // Sign
  ctx.fillStyle = color; ctx.fillRect(x - 60, y - 70, 120, 22);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
  ctx.fillText(`${icon} ${title}`, x, y - 55);
  ctx.font = '9px monospace'; ctx.fillStyle = '#cbd5e1';
  ctx.fillText(sub, x, y - 40);
  ctx.textAlign = 'left';
}

function drawCrimpStation(x, y, done) {
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x - 70 + 6, y + 50 + 4, 140, 40);
  ctx.fillStyle = '#451a03'; ctx.fillRect(x - 70, y + 20, 140, 30);
  ctx.fillStyle = '#78350f'; ctx.fillRect(x - 66, y + 24, 132, 22);
  ctx.fillStyle = '#3a1a08'; ctx.fillRect(x - 62, y + 50, 10, 40); ctx.fillRect(x + 52, y + 50, 10, 40);
  // Crimping tool
  ctx.fillStyle = '#4a4a4a'; ctx.fillRect(x - 30, y - 22, 60, 8);
  ctx.fillStyle = '#6a6a6a'; ctx.fillRect(x - 30, y - 22, 60, 3);
  ctx.fillStyle = '#8a8a8a'; ctx.fillRect(x + 30, y - 24, 12, 12);
  ctx.fillStyle = '#5a5a5a'; ctx.fillRect(x - 42, y - 20, 12, 10);
  // RJ45 connectors around
  for (let i = 0; i < 5; i++) {
    const cx = x - 30 + i * 15, cy = y + 2;
    ctx.fillStyle = '#e8e8e8'; ctx.fillRect(cx, cy, 8, 12);
    ctx.fillStyle = '#a0a0a0'; ctx.fillRect(cx, cy + 10, 8, 2);
    ctx.fillStyle = ['#f59e0b','#22c55e','#38bdf8','#ef4444','#a855f7'][i];
    ctx.fillRect(cx + 1, cy + 1, 6, 3);
  }
  // Cable coil (decorative)
  ctx.strokeStyle = '#0ea5e9'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x + 45, y - 5, 14, 0, Math.PI*1.8); ctx.stroke();
  ctx.strokeStyle = '#f59e0b';
  ctx.beginPath(); ctx.arc(x + 45, y - 5, 8, 0, Math.PI*1.8); ctx.stroke();

  ctx.fillStyle = done ? '#16a34a' : '#f59e0b'; ctx.fillRect(x - 60, y - 70, 120, 22);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
  ctx.fillText('🔨 BẤM CÁP RJ45', x, y - 55);
  ctx.font = '9px monospace'; ctx.fillStyle = '#cbd5e1';
  ctx.fillText('Bấm [E] để thực hành T568B', x, y - 40);
  ctx.textAlign = 'left';
}

function drawDiagStation(x, y, done) {
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x - 70 + 6, y + 50 + 4, 140, 40);
  ctx.fillStyle = '#451a03'; ctx.fillRect(x - 70, y + 20, 140, 30);
  ctx.fillStyle = '#78350f'; ctx.fillRect(x - 66, y + 24, 132, 22);
  ctx.fillStyle = '#3a1a08'; ctx.fillRect(x - 62, y + 50, 10, 40); ctx.fillRect(x + 52, y + 50, 10, 40);
  // Broken PC on bench
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x - 40, y - 30, 80, 55);
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.5; ctx.strokeRect(x - 40, y - 30, 80, 55);
  // error screen
  ctx.fillStyle = done ? '#22c55e' : '#3a0d0d'; ctx.fillRect(x - 33, y - 24, 66, 40);
  ctx.fillStyle = done ? '#fff' : '#ef4444'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
  ctx.fillText(done ? '✔ OK' : '✖ NO POST', x, y + 2);
  ctx.textAlign = 'left';
  // Warning triangle float
  if (!done) {
    const bob = Math.sin(Date.now()*0.005) * 3;
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(x + 50, y - 42 + bob); ctx.lineTo(x + 60, y - 22 + bob); ctx.lineTo(x + 40, y - 22 + bob);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#0f172a'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
    ctx.fillText('!', x + 50, y - 28 + bob); ctx.textAlign = 'left';
  }
  ctx.fillStyle = done ? '#16a34a' : '#dc2626'; ctx.fillRect(x - 60, y - 70, 120, 22);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
  ctx.fillText('🩺 CHẨN ĐOÁN PC', x, y - 55);
  ctx.font = '9px monospace'; ctx.fillStyle = '#cbd5e1';
  ctx.fillText('Bấm [E] để sửa máy', x, y - 40);
  ctx.textAlign = 'left';
}

/* ==================== MŨI TÊN CHỈ ĐƯỜNG TỚI ẢI ==================== */
function drawQuestArrow() {
  const cur = typeof currentStage === 'function' ? currentStage() : null;
  if (!cur || !cur.s.bld || cur.s.boss) return;
  let b = null;
  for (let i = 0; i < blds.length; i++) if (blds[i].id === cur.s.bld) b = blds[i];
  if (!b) return;
  const px = S.p.x + 10, py = S.p.y - 8;
  const tx = b.x + b.w / 2, ty = b.y + b.h / 2;
  const dx = tx - px, dy = ty - py;
  const d = Math.hypot(dx, dy);
  if (d < 150) return;
  const a = Math.atan2(dy, dx);
  const puls = 0.62 + (Math.sin(Date.now() * 0.006) + 1) * 0.18;
  ctx.save();
  ctx.translate(px + Math.cos(a) * 52, py + Math.sin(a) * 52);
  ctx.rotate(a);
  ctx.fillStyle = `rgba(250,204,21,${puls})`;
  ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(-8, -9); ctx.lineTo(-3, 0); ctx.lineTo(-8, 9); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
  ctx.fillStyle = 'rgba(250,204,21,.95)';
  ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
  ctx.fillText(Math.round(d / 10) + 'm', px + Math.cos(a) * 76, py + Math.sin(a) * 76 + 3);
  ctx.textAlign = 'left';
}

/* ============ RENDER ============ */
// Ánh sáng + vignette cho các phòng trong nhà (đồng bộ tông với bản đồ)
function drawInteriorVignette() {
  const vg = ctx.createRadialGradient(480, 300, 170, 480, 300, 610);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(.65, 'rgba(2,6,14,.22)');
  vg.addColorStop(1, 'rgba(2,6,14,.6)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, 960, 600);
  const lg = ctx.createLinearGradient(0, 0, 0, 280);
  lg.addColorStop(0, 'rgba(186,230,253,.07)');
  lg.addColorStop(1, 'rgba(186,230,253,0)');
  ctx.fillStyle = lg; ctx.fillRect(0, 0, 960, 280);
}

function render() {
  ctx.clearRect(0, 0, 960, 600);

  if (S.scene === 'WORLD') {
    ctx.drawImage(bgCanvas, 0, 0);
    drawPlazaEmblem();
    function drawPackets() {
  const t = Date.now() / 1000;
  [[56, 173, 200], [704, 173, 206], [56, 447, 850]].forEach(([x, y, w], i) => {
    for (let k = 0; k < 3; k++) {
      const px = x + ((t * 60 + k * w / 3 + i * 40) % w);
      ctx.fillStyle = 'rgba(56,189,248,.28)'; ctx.beginPath(); ctx.arc(px, y, 7, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(224,247,255,.95)'; ctx.beginPath(); ctx.arc(px, y, 3, 0, 7); ctx.fill();
    }
  });
}
    drawPackets();

    // gợn nước mưa rơi trên mặt hồ
    S.ripples.forEach(r => {
      ctx.strokeStyle = `rgba(186,230,253,${r.a})`; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI*2); ctx.stroke();
    });

    // ==== depth sort: hồ nước / toà nhà / cây cối / người chơi ====
    const list = [];
    blds.forEach(b => list.push({
      k: b.y + b.h,
      f: () => drawBuilding(b, !!targetAct && targetAct.t === 'bld' && targetAct.d === b)
    }));
    decor.forEach(d => list.push({ k: d.y, f: () => drawDecor(d) }));
    list.push({ k: FOUNTAIN.y + 30, f: drawCenterPiece });
    list.push({ k: S.p.y + 30, f: () => drawSprite(S.p.x, S.p.y, 'p') });
    list.sort((a, b) => a.k - b.k).forEach(o => o.f());

    // bướm (trời nắng)
    if (S.weather === 'sun') {
      S.butterflies.forEach(bf => {
        const flap = Math.abs(Math.sin(bf.phase * 4)) * 0.7 + 0.3;
        ctx.fillStyle = `hsl(${bf.hue}, 80%, 65%)`;
        ctx.save(); ctx.translate(bf.x, bf.y + Math.sin(bf.phase) * 2);
        ctx.beginPath(); ctx.ellipse(-3, 0, 3*flap, 2, 0, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(3, 0, 3*flap, 2, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-0.5, -1, 1, 3);
        ctx.restore();
      });
    }

    // đom đóm (ban đêm)
    if (S.weather === 'night') {
      S.fireflies.forEach(f => {
        const alpha = Math.max(0, Math.min(1, 0.4 + Math.sin(f.phase * 3) * 0.5));
        ctx.fillStyle = `rgba(253, 224, 71, ${alpha})`;
        ctx.beginPath(); ctx.arc(f.x, f.y, 2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = `rgba(253, 224, 71, ${alpha*0.3})`;
        ctx.beginPath(); ctx.arc(f.x, f.y, 5, 0, Math.PI*2); ctx.fill();
      });
    }

    // TUYẾT RƠI
    if (S.weather === 'rain') {
      ctx.fillStyle = 'rgba(255,255,255,.92)';
      S.rain.forEach(r => { ctx.beginPath(); ctx.arc(r.x, r.y, 1.4 + (r.len % 3) * 0.35, 0, Math.PI*2); ctx.fill(); });
      ctx.fillStyle = 'rgba(120,150,200,0.14)'; ctx.fillRect(0, 0, 960, 600);
    }

    // ban đêm: làm tối + quầng sáng đèn lồng
    if (S.weather === 'night') {
      ctx.fillStyle = 'rgba(8, 16, 40, 0.52)'; ctx.fillRect(0, 0, 960, 600);
      lampPositions.forEach(l => {
        const ly = l.y - 58;
        const grd = ctx.createRadialGradient(l.x, ly, 2, l.x, ly, 74);
        grd.addColorStop(0, 'rgba(255,214,110,0.42)'); grd.addColorStop(1, 'rgba(255,214,110,0)');
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(l.x, ly, 74, 0, Math.PI*2); ctx.fill();
      });
    }
  } else if (S.scene === 'OFFICE') {
    drawOffice();
    drawInteriorVignette();
  } else if (S.scene === 'NET_ROOM') {
    drawNetworkRoom();
    drawInteriorVignette();
  } else if (S.scene === 'HARDWARE_LAB') {
    drawHardwareLab();
    drawInteriorVignette();
  } else if (S.scene === 'LUNAR_BASE') {
    // drawLunarBase sống ở game.js — frame đầu tiên có thể chạy trước khi script kịp nạp
    if (typeof drawLunarBase === 'function') drawLunarBase();
    drawInteriorVignette();
  } else if (INTERIORS[S.scene]) {
    drawInterior(S.scene);
    drawInteriorVignette();
  }

  if (targetAct) {
    // nhãn gợi ý theo ngữ cảnh
    const ST_SHORT = { ACADEMY: 'THI CCNA', IT: 'XỬ LÝ TICKET', DC: 'ĐẤU CÁP', SALES: 'CHỌN KÊNH WIFI', ISP: 'TRACEROUTE' };
    let label = 'BẤM [E] VÀO';
    if (targetAct.t === 'hw_workbench') label = '[E] LẮP RÁP PC';
    else if (targetAct.t === 'hw_crimp') label = '[E] BẤM CÁP';
    else if (targetAct.t === 'hw_diag') label = '[E] CHẨN ĐOÁN';
    else if (targetAct.t === 'ig_station') label = '[E] ' + (ST_SHORT[targetAct.id] || 'LÀM VIỆC');
    else if (targetAct.t === 'ig_npc') label = '[E] NÓI CHUYỆN';
    else if (targetAct.t === 'to_world') label = '[E] RA THÀNH PHỐ';
    // Khu 3 tự cung cấp nhãn (đặt trong targetAct.txt ở game.js)
    else if (targetAct.txt) label = targetAct.txt;

    const bx = S.p.x + 10, by = S.p.y - 36;
    const bounce = Math.sin(Date.now() * 0.006) * 2;
    ctx.font = 'bold 10px monospace';
    const w = Math.max(100, ctx.measureText(label).width + 26), h = 20, r = 6;
    const x0 = bx - w/2, y0 = by + bounce;
    ctx.fillStyle = 'rgba(250,204,21,0.95)';
    ctx.beginPath();
    ctx.moveTo(x0 + r, y0); ctx.lineTo(x0 + w - r, y0);
    ctx.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
    ctx.lineTo(x0 + w, y0 + h - r); ctx.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
    ctx.lineTo(x0 + r, y0 + h); ctx.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
    ctx.lineTo(x0, y0 + r); ctx.quadraticCurveTo(x0, y0, x0 + r, y0);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bx - 5, y0 + h); ctx.lineTo(bx + 5, y0 + h); ctx.lineTo(bx, y0 + h + 6); ctx.fill();
    ctx.fillStyle = '#0f172a'; ctx.textAlign = 'center';
    ctx.fillText(label, bx, y0 + 14); ctx.textAlign = 'left';
  }

  // mũi tên chỉ tới toà nhà của ải hiện tại
  if (S.scene === 'WORLD') drawQuestArrow();
}
// ===== KHỞI ĐỘNG GAME LOOP =====
update();

/* ============ DIALOG ============ */
function drawAvatar(spk) {
  const acv = document.getElementById('av-cv'), a = acv.getContext('2d');
  a.clearRect(0, 0, 56, 56);
  const bg = a.createLinearGradient(0, 0, 0, 56);
  bg.addColorStop(0, '#0f172a'); bg.addColorStop(1, '#020617');
  a.fillStyle = bg; a.fillRect(0, 0, 56, 56);
  let shirtC = '#16a34a', hairC = '#0f172a';
  if (spk.includes('Lan')) { shirtC = '#ec4899'; hairC = '#4a2c14'; }
  else if (spk.includes('Hương')) { shirtC = '#f59e0b'; hairC = '#7c2d12'; }
  else if (spk.includes('Tuấn')) { shirtC = '#16a34a'; hairC = '#0f172a'; }
  else if (spk.includes('Bảo vệ')) { shirtC = '#334155'; hairC = '#0f172a'; }
  else if (spk.includes('Đức')) { shirtC = '#7c3aed'; hairC = '#1e1b4b'; }
  else if (spk.includes('Linh')) { shirtC = '#0891b2'; hairC = '#312e81'; }
  else if (spk.includes('Khoa')) { shirtC = '#0ea5e9'; hairC = '#0f172a'; }
  else if (spk.includes('Mai')) { shirtC = '#10b981'; hairC = '#78350f'; }
  else if (spk.includes('Sơn')) { shirtC = '#ef4444'; hairC = '#1c1917'; }
  a.fillStyle = shirtC; a.fillRect(6, 38, 44, 18);
  a.fillStyle = '#fcd0a3'; a.fillRect(24, 34, 8, 8);
  a.fillRect(14, 14, 28, 24);
  a.fillStyle = '#e2a878'; a.fillRect(14, 34, 28, 4);
  a.fillStyle = hairC; a.fillRect(12, 8, 32, 10);
  a.fillRect(12, 8, 6, 22); a.fillRect(38, 8, 6, 22);
  a.fillStyle = '#0f172a';
  a.fillRect(20, 24, 4, 4); a.fillRect(32, 24, 4, 4);
  a.fillStyle = '#fff';
  a.fillRect(21, 25, 1.5, 1.5); a.fillRect(33, 25, 1.5, 1.5);
  a.fillStyle = '#9a3412'; a.fillRect(24, 32, 8, 1.5);
}
function showDlg(spk, role, txt) {
  const d = document.getElementById('dialog');
  document.getElementById('dlg-name').innerText = spk;
  document.getElementById('dlg-role').innerText = role;
  document.getElementById('dlg-txt').innerHTML = txt;
  d.style.display = 'flex';
  beep(500, 'sine', 0.08, 0.03);
  drawAvatar(spk);
}
document.getElementById('dialog').onclick = () => { document.getElementById('dialog').style.display = 'none'; releaseFocus(); };

/* ============ ACTION ============ */
function doAction() {
  if (!targetAct) return;
  if (targetAct.t === 'bld') {
    const id = targetAct.d.id;
    const lk = typeof buildingLock === 'function' ? buildingLock(id) : null;
    if (lk) {
      showDlg('Bảo vệ', 'An ninh',
        `🔒 <b>${targetAct.d.name}</b> chưa mở khoá!\nCần hoàn thành <b>Ải ${lk.no - 1} — ${lk.need.name}</b> trước đã nhé.\n<i>(Đang ở Ải ${currentStage() ? currentStage().i + 1 : STAGES.length}: ${currentStage() ? currentStage().s.name : 'xong hết'})</i>`);
      beep(200, 'square', 0.16, 0.035);
      return;
    }
    if (id === 'OFFICE') {
      S.scene = 'OFFICE'; S.p.x = 140; S.p.y = SCENE_WALK.OFFICE.spawnY; S.lastBld = 'OFFICE';
      setZone('2. INTERIOR', 'VP Kế Toán - Tầng 1'); beep(440);
    } else if (id === 'HARDWARE') {
      S.scene = 'HARDWARE_LAB'; S.p.x = 480; S.p.y = 480; S.lastBld = 'HARDWARE';
      setZone('4. HARDWARE LAB', 'Lab Phần Cứng & IT Support'); beep(520);
      if (!S.missionsDone.pcBuild && !S.missionsDone.crimp && !S.missionsDone.diag) {
        setTimeout(() => showDlg("Chị Hương", "IT Support Lead",
          `"Chào Nhân-IT! Chào mừng em đến <b>Lab Phần Cứng</b>.\nỞ đây có 3 trạm:<br>🛠️ <b>Lắp ráp PC</b> - 🩺 <b>Chẩn đoán sự cố</b> - 🔨 <b>Bấm cáp RJ45</b>\nEm cứ thử từng trạm để nâng cao tay nghề nhé!"`), 400);
      }
    } else if (INTERIORS[id]) {
      const cfg = INTERIORS[id];
      // Học viện CCNA vẽ bằng ảnh nền nên phải spawn tránh các ô SCENE_BOXES
      S.scene = id; S.p.x = 480; S.p.y = SCENE_WALK[id] ? SCENE_WALK[id].spawnY : 470; S.lastBld = id;
      setZone(cfg.zone, cfg.zoneName); beep(520);
      if (buildingStatus(id) !== 'done') {
        setTimeout(() => showDlg(cfg.npc.name, cfg.npc.role, cfg.npc.intro), 400);
      }
    } else {
      showDlg("Bảo vệ", "An ninh", `Tòa nhà <b>${targetAct.d.name}</b> đang bảo trì.`);
    }
  } else if (targetAct.t === 'to_world') {
    S.scene = 'WORLD'; beep(380);
    const b = blds.filter(x => x.id === S.lastBld)[0];
    if (b) {
      let ex = Math.max(30, Math.min(890, b.x + b.w / 2 - 10));
      let ey = Math.min(548, b.y + b.h + 30);
      if (boxCollides(ex, ey)) ey = Math.max(45, b.y - 36);
      if (boxCollides(ex, ey)) { ex = 480; ey = 392; }
      S.p.x = ex; S.p.y = ey;
    } else if (S.p.x < 200) { S.p.x = 130; S.p.y = 370; } else { S.p.x = 130; S.p.y = 175; }
    setZone('1. THÀNH PHỐ', 'Network City (World Map)');
  } else if (targetAct.t === 'ig_station') {
    const g = INTERIORS[targetAct.id].station.game;
    gateMission(GAME_MISSION[g], () => openBuildingGame(targetAct.id));
  } else if (targetAct.t === 'ig_npc') {
    npcDialog(targetAct.id);
  } else if (targetAct.t === 'to_net') {
    S.scene = 'NET_ROOM'; S.p.x = 100; S.p.y = 480;
    setZone('3. NETWORK ROOM', 'Phòng Server RACK01'); beep(500);
  } else if (targetAct.t === 'to_office') {
    S.scene = 'OFFICE'; S.p.x = 755; S.p.y = 340; S.lastBld = 'OFFICE';
    setZone('2. INTERIOR', 'VP Kế Toán - Tầng 1'); beep(440);
  } else if (targetAct.t === 'lan') {
    if (S.qStep === 1) {
      S.qStep = 2;
      document.getElementById('chk1') && (document.getElementById('chk1').innerHTML = '✔ 1. Đã nói chuyện với Chị Lan');
      showDlg("Chị Lan", "Kế toán",
        `"Máy tính của chị ping gateway 192.168.10.1 thì mượt, nhưng không vào mạng thuế được!\nEm qua <b>Network Room</b> (góc trên phải văn phòng) kiểm tra R1 giúp chị nhé!"`);
    } else if (S.qStep >= 4 && S.isFixed && !S.missionsDone.nat) {
      S.qStep = 5; S.missionsDone.nat = true;
      addXP(300); addCoin(2000);
      showDlg("Chị Lan", "Kế toán",
        `🎉 Mạng mượt rồi em ơi! Cảm ơn Nhân-IT nhiều nhé!\n🎁 Nhận: +100 EXP | +2,000 Coin | Danh hiệu <b>Junior Network Engineer</b>!`);
      setTimeout(() => announceStage('nat'), 750);
      saveGame();
    } else if (S.missionsDone.nat) {
      showDlg("Chị Lan", "Kế toán", `"Cảm ơn em, mạng văn phòng giờ ổn định lắm!"`);
    } else {
      showDlg("Chị Lan", "Kế toán", `"Em kiểm tra câu lệnh NAT Overload trên R1 chưa? Chị vẫn chưa vào được mạng!"`);
    }
  } else if (targetAct.t === 'tuan') {
    showDlg("Tuấn", "Net Admin", `"Chào Nhân-IT! Đây là RACK01.\nRouter R1 và Switch SW01 ở đây. Bấm [E] vào Rack để cấu hình nhé!"`);
  } else if (targetAct.t === 'rack') {
    gateMission('nat', openCLI);
  } else if (targetAct.t === 'hw_workbench') {
    gateMission('pcBuild', openPCBuild);
  } else if (targetAct.t === 'hw_crimp') {
    gateMission('crimp', openCrimp);
  } else if (targetAct.t === 'hw_diag') {
    gateMission('diag', openDiag);
  }
}
function setZone(tag, name) {
  document.getElementById('zone-tag').innerText = tag;
  document.getElementById('loc-name').innerText = name;
}

/* ============ MODALS ============ */
/* Phát hiện modal ĐANG THỰC SỰ HIỂN THỊ. Selector cũ '.modal[style*="flex"]'
   chỉ so khớp chuỗi con trong attribute style → các modal dựng bằng cssText
   có "flex-direction"/"flex:1"/"flex-wrap" (win-modal, lu-mini, shop-modal)
   vẫn khớp sau khi closeAll() đổi display:none → update() trả về sớm mãi →
   nhân vật đứng cứng tới lúc F5. Đọc getComputedStyle + kích thước thật để
   hết phụ thuộc vào chữ "flex" trong attribute. */
function openModalEl() {
  const ms = document.querySelectorAll('.modal');
  for (let i = 0; i < ms.length; i++) {
    const m = ms[i];
    if (m.style.display !== 'flex') continue;   // chỉ modal được mở bằng display:flex
    const cs = getComputedStyle(m);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = m.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return m;
  }
  return null;
}
/* Ô nhập liệu ĐANG NHÌN THẤY (đang mở) — chỉ khi đó mới nhường phím cho nó.
   Input nằm trong modal đã display:none offsetParent = null → không chặn. */
function isTypingField(el) {
  if (!el) return false;
  const tn = el.tagName;
  if (!(tn === 'INPUT' || tn === 'TEXTAREA' || tn === 'SELECT' || el.isContentEditable)) return false;
  return el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden';
}
/* Trả focus về màn hình game ngay khi đóng modal, để keydown điều khiển ăn liền. */
function releaseFocus() {
  const el = document.activeElement;
  if (el && el !== document.body && typeof el.blur === 'function') el.blur();
  if (window.focus) window.focus();
}
function closeAll() {
  document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
  const dm = document.getElementById('dev-menu'); if (dm) dm.style.display = 'none';
  document.getElementById('dialog').style.display = 'none';
  if (window.bossLeave) bossLeave();
  if (bannerTimer) { clearTimeout(bannerTimer); }
  releaseFocus();
}
function openCLI() { closeAll(); document.getElementById('cli-modal').style.display = 'flex'; setTimeout(()=>document.getElementById('term-in').focus(),50); beep(600); }
function openMissions() { closeAll(); document.getElementById('mis-modal').style.display = 'flex'; renderMissions(); beep(500); }

/* ============ BẢN ĐỒ DỊCH CHUYỂN NHANH (WORLD MAP) ============
   Nút bản đồ = vòng tròn minimap góc trên-phải. engine giữ lớp vỏ modal và
   việc mở/đóng (ESC đã chạy closeAll cho mọi .modal nên bản đồ tự đóng), còn
   nội dung 3 địa danh + ảnh thumbnail + điều kiện bay do game.js vẽ qua
   renderWorldMap(body). Guard typeof vì engine.js được nạp TRƯỚC game.js. */
function wmShell() {
  let m = document.getElementById('wm-modal');
  if (m) return m;
  m = document.createElement('div');
  m.id = 'wm-modal'; m.className = 'modal';
  m.style.cssText = 'width:780px;max-width:calc(100% - 26px);height:520px;' +
    'background:linear-gradient(180deg,#0d1830,#060b16);border:3px solid #8b5cf6;' +
    'box-shadow:0 26px 70px rgba(4,10,24,.85),0 0 0 2px #2a3a66;color:#e6edf7';
  m.innerHTML =
    '<div class="m-head" style="background:linear-gradient(180deg,#8b5cf6,#5b34d0);color:#fff">' +
      '<span>🗺️ BẢN ĐỒ NETWORK CITY — DỊCH CHUYỂN NHANH</span>' +
      '<span class="m-close" onclick="closeWorldMap()">[✕ Đóng ESC]</span>' +
    '</div>' +
    '<div id="wm-body" style="flex:1;overflow-y:auto;padding:14px 16px 16px"></div>';
  document.getElementById('app').appendChild(m);
  return m;
}
function openWorldMap() {
  if (typeof wmBusy === 'function' && wmBusy()) return;   // đang chiếu phim phóng tàu
  closeAll();
  wmShell().style.display = 'flex';
  const body = document.getElementById('wm-body');
  if (typeof renderWorldMap === 'function') renderWorldMap(body);
  else if (body) body.innerHTML = '<p style="color:#93a4bd;font-size:12px">Chưa nạp xong bản đồ — thử lại sau nhé.</p>';
  beep(620);
}
function closeWorldMap() {
  const m = document.getElementById('wm-modal');
  if (m) m.style.display = 'none';
}

/* Gắn tay bấm: minimap + badge 🗺️ = nút bản đồ. DOM đã có vì script nằm
   cuối body; không có element (bản cut-down) thì lặng lẽ bỏ qua. Badge ghim
   TRÁI-thảm tròn (left:-25) — mép phải của nó khớp đúng cạnh trái minimap-box,
   nên không che chữ "1. THÀNH PHỐ", không đè nút thu gọn "–", và vẫn nằm ngoài
   #dock-tr (kết thúc ở x=828) lẫn #settings-menu (kết thúc ở x=832). */
(function wmWire() {
  const mm = document.getElementById('minimap'), box = document.getElementById('minimap-box');
  if (!mm) return;
  mm.style.cursor = 'pointer';
  mm.title = 'Bấm để mở Bản đồ dịch chuyển nhanh';
  mm.addEventListener('click', openWorldMap);
  if (box && !document.getElementById('wm-badge')) {
    const b = document.createElement('span');
    b.id = 'wm-badge'; b.textContent = '🗺️'; b.title = mm.title;
    b.style.cssText = 'position:absolute;left:-25px;top:47px;width:25px;height:25px;' +
      'border-radius:50%;background:#fff;border:2px solid #8b5cf6;font-size:13px;' +
      'line-height:21px;text-align:center;cursor:pointer;z-index:13;' +
      'box-shadow:0 3px 8px rgba(23,63,102,.32)';
    b.addEventListener('click', openWorldMap);
    box.appendChild(b);
  }
})();

/* ============ MISSION SYSTEM ============ */
