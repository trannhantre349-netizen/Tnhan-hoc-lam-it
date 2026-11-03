#!/usr/bin/env node
/* ============================================================
   tools/make-inpeace-bgm.cjs — SINH NHẠCH TĨNH TÂM cho Khu 5
   ------------------------------------------------------------
   File nhạc tự TỔNG HỢP bằng code (không tải từ đâu về), nên bản quyền
   sạch tuyệt đối: tổ hợp sóng hài + chuông + ồn nền + reverb Schroeder.
   Có seed nên chạy lại ra y hệt; ghi đè được file cũ.

     node tools/make-inpeace-bgm.cjs              -> assets/sfx/inpeace_bgm.mp3
     node tools/make-inpeace-bgm.cjs --secs 20    -> bản ngắn để thử nhanh
     node tools/make-inpeace-bgm.cjs --dry        -> tính thôi, không ghi

   Muốn đổi không khí: sửa CHORDS (hợp âm), PAD_HARM (độ sáng của đàn
   organ), số chuông ở mục 7, hoặc SECS (độ dài một vòng lặp).
   ------------------------------------------------------------
   VÒNG LẶP KHÍT: mọi nốt ghi vào bộ đệm theo toạ độ % N, nên đuôi vang
   của hợp âm cuối tự tràn sang đầu file — phát loop không có "khớp nối".
   ============================================================ */
const fs = require('fs');
const path = require('path');
/* lamejs 1.2.1 trên npm bị hỏng bản CommonJS (thiếu require vòng lặp), nên
   dùng bản fork ESM và nạp bằng dynamic import — chạy từ .cjs vẫn được. */
const LAME = '@breezystack/lamejs';

const SR = 44100, KBPS = 96, CH = 2;
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : +process.argv[i + 1]; };
const SECS = arg('--secs', 120), DRY = process.argv.includes('--dry');
const N = SR * SECS;
const OUT = path.join(__dirname, '..', 'assets', 'sfx', 'inpeace_bgm.mp3');

/* ---------- 1. Hợp âm (MIDI): C · Am · F · G · Em · Dm · F · G ----------
   Mỗi hợp âm 15s, 5 giọng rải từ trầm tới cao. Vòng kết bằng G nên khi
   lặp về C nghe như một câu chuyện trọn vẹn. */
const CHORDS = [
  [48, 55, 60, 64, 67],   // C
  [45, 52, 57, 60, 64],   // Am
  [41, 48, 53, 57, 60],   // F
  [43, 50, 55, 59, 62],   // G
  [40, 47, 52, 55, 59],   // Em
  [38, 45, 50, 57, 62],   // Dm
  [41, 48, 53, 57, 65],   // F (đảo)
  [43, 50, 55, 59, 67]    // G (mở về C)
];
const BAR = SECS / CHORDS.length;
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

/* ---------- 2. Ồn giả-random có seed ---------- */
function rnd(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- 3. Bảng sin (65536 điểm) — nhanh hơn Math.sin nhiều ---------- */
const TAB = new Float32Array(65536);
for (let i = 0; i < 65536; i++) TAB[i] = Math.sin(6.283185307 * i / 65536);
function osc(ph) { return TAB[(ph & 65535)]; }

/* ---------- 4. Tiếng đàn organ (pad) ----------
   Harmonics 1..8 biên độ giảm dần = ống sáo/organ ấm; hai lớp lệch cao độ
   ±0.08% tạo độ rộng tự nhiên; runnner tremolo 0.13Hz rất chậm. */
const PAD_HARM = [[1, 1], [2, .48], [3, .26], [4, .13], [6, .07], [8, .035]];
const PAD_ATK = 3.6, PAD_REL = 4.2;
function pad(buf, from, dur, f, amp, detune, seed) {
  const R = rnd(seed), ph = PAD_HARM.map(() => R() * 6.283);
  const a0 = Math.round(from * SR), len = Math.round(dur * SR);
  const dL = detune * 1.0008, dR = detune * .9992;
  const inc = [];
  for (let h = 0; h < PAD_HARM.length; h++) {
    const w = f * PAD_HARM[h][0] / SR * 65536;      // bước pha theo chỉ số bảng sin
    inc[h] = [w * dL, w * dR];
  }
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    let e;
    if (t < PAD_ATK) e = .5 - .5 * Math.cos(Math.PI * t / PAD_ATK);
    else if (t > dur - PAD_REL) e = .5 + .5 * Math.cos(Math.PI * Math.min(1, (t - (dur - PAD_REL)) / PAD_REL));
    else e = 1;
    e *= 1 + .05 * Math.sin(6.283 * .13 * t + ph[0]);
    let sL = 0, sR = 0;
    for (let h = 0; h < PAD_HARM.length; h++) {
      const a = PAD_HARM[h][1];
      sL += a * osc((inc[h][0] * i + ph[h] * 10430.378) | 0);
      sR += a * osc((inc[h][1] * i + ph[h] * 10430.378 + 4096) | 0);
    }
    const o = (a0 + i) % N;
    buf[o * 2] += sL * e * amp;
    buf[o * 2 + 1] += sR * e * amp;
  }
}

/* ---------- 5. Chuông nhà thờ ----------
   Tỷ lệ chuông ống (tubular bell) 1 / 2 / 3 / 4.2 / 5.4 — méo một chút
   ra tiếng "khan" rất hợp không gian đá. Đuôi ngắn hơn pad nhiều. */
const BELL_HARM = [[1, 1, 3.2], [2.0, .45, 2.4], [3.0, .3, 1.9], [4.2, .18, 1.4], [5.4, .1, 1.0]];
function bell(buf, at, f, amp) {
  const a0 = Math.round(at * SR), len = Math.round(6.5 * SR);
  const inc = BELL_HARM.map(B => 6.283185307 * f * B[0] / SR);
  for (let i = 0; i < len; i++) {
    const t = i / SR, o = (a0 + i) % N;
    const a = Math.min(1, t / .006);
    let s = 0;
    for (let h = 0; h < BELL_HARM.length; h++)
      s += BELL_HARM[h][1] * Math.exp(-t / BELL_HARM[h][2]) * osc((inc[h] * i) | 0);
    s *= a * amp;
    buf[o * 2] += s;
    buf[o * 2 + 1] += s * .82;
  }
}

/* ---------- 6. Ồn nền "không khí trong gian điện" ---------- */
function air(buf, seed) {
  const R = rnd(seed);
  let lp = 0;
  for (let i = 0; i < N; i++) {
    const w = R() * 2 - 1;
    lp += .012 * (w - lp);                  // one-pole ~84Hz: tối, không rè
    const m = .0075 * (1 + .5 * Math.sin(6.283 * .05 * i / SR));
    buf[i * 2] += lp * m;
    buf[i * 2 + 1] += lp * m * .9;
  }
}

/* ---------- 7. Reverb Schroeder: 6 comb + 2 allpass ---------- */
function reverb(dry, mix) {
  const COMB = [1580, 1913, 2399, 2731, 3169, 3761], FB = .72, DAMP = .32;
  const out = new Float32Array(dry), acc = new Float32Array(N);
  for (let c = 0; c < 2; c++) {
    acc.fill(0);
    for (const d of COMB) {
      const buf = new Float32Array(N);
      let s = 0;
      for (let i = d; i < N; i++) {
        buf[i] = dry[i * 2 + c] + buf[i - d] * FB;
        s = buf[i] * (1 - DAMP) + s * DAMP;
        acc[i] += s;
      }
    }
    for (let i = 0; i < N; i++) out[i * 2 + c] = dry[i * 2 + c] * (1 - mix) + (acc[i] / COMB.length) * mix;
  }
  for (let c = 0; c < 2; c++) {
    for (const spec of [[225, .5], [556, .5]]) {
      const d = spec[0], g = spec[1], v = new Float32Array(N);
      for (let i = d; i < N; i++) {
        v[i] = out[i * 2 + c] + g * v[i - d];
        out[i * 2 + c] = -g * v[i] + v[i - d];
      }
    }
  }
  return out;
}

/* ---------- 8. Dựng bản khô ---------- */
const t0 = Date.now();
const dry = new Float32Array(N * 2);
CHORDS.forEach((ch, ci) => {
  const start = (ci * BAR) % SECS;
  ch.forEach((m, vi) => {
    /* mỗi giọng vào lệch nhau 0.9s -> hợp âm "nở" ra thay vì bật cùng lúc */
    pad(dry, start + vi * .9, BAR + PAD_REL + .9, mtof(m), .052 / (1 + vi * .18),
      1 + (vi % 2 ? .0004 : -.0004), ci * 97 + m);
  });
  /* giọng cao ngân hai quãng tám trên, rất nhỏ: lớp "thiên thần" */
  pad(dry, start + 3, BAR - 1, mtof(ch[ch.length - 1] + 24), .012, 1, 500 + ci);
});
const RB = rnd(20261102);
for (let k = 0; k < Math.floor(SECS / 11); k++) {
  const at = 6 + k * 11 + RB() * 5;
  const ci = Math.floor(at / BAR) % CHORDS.length, ch = CHORDS[ci];
  const m = ch[Math.floor(RB() * ch.length)] + 12 + (RB() < .35 ? 12 : 0);
  bell(dry, at % SECS, mtof(m), .05 + RB() * .03);
}
air(dry, 777);
console.log('dry ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');

/* ---------- 9. Vang + chuẩn hoá + mã hoá ---------- */
(async () => {
  const { Mp3Encoder } = await import(LAME);
  const wet = reverb(dry, .3);
  let peak = 0;
  for (let i = 0; i < N * 2; i++) { const a = Math.abs(wet[i]); if (a > peak) peak = a; }
  const g = .62 / (peak || 1);
  const L = new Int16Array(N), Rr = new Int16Array(N);
  for (let i = 0; i < N; i++) {
    L[i] = Math.round(Math.max(-1, Math.min(1, wet[i * 2] * g)) * 32767);
    Rr[i] = Math.round(Math.max(-1, Math.min(1, wet[i * 2 + 1] * g)) * 32767);
  }
  const enc = new Mp3Encoder(CH, SR, KBPS), mp3 = [], block = 1152;
  for (let i = 0; i < N; i += block) {
    const o = enc.encodeBuffer(L.subarray(i, i + block), Rr.subarray(i, i + block));
    if (o.length) mp3.push(Buffer.from(o));
  }
  const fin = enc.flush();
  if (fin.length) mp3.push(Buffer.from(fin));
  const data = Buffer.concat(mp3);
  console.log(SECS + 's -> ' + (data.length / 1048576).toFixed(2) + ' MB, tổng ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
  if (!DRY) {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, data);
    console.log('ghi ' + path.relative(process.cwd(), OUT));
  }
})();
