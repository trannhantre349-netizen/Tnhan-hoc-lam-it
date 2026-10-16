/* Giải mã base64 do browser-use chụp lại thành PNG để mắt người xem được. */
const fs = require('fs');
const path = require('path');
for (const f of process.argv.slice(2)) {
  let s = fs.readFileSync(f, 'utf8').trim();
  const m = s.match(/"b64":\s*"([A-Za-z0-9+/=]+)"/);
  if (m) s = m[1];
  else if (s.startsWith('"')) s = s.replace(/^"|"[\s\S]*$/g, '');
  if (!/^[A-Za-z0-9+/=]+$/.test(s)) { console.log('SKIP', f); continue; }
  const out = path.join('tmp', path.basename(f).replace(/\.(txt|b64)$/, '') + '.png');
  fs.writeFileSync(out, Buffer.from(s, 'base64'));
  console.log(out, fs.statSync(out).size);
}
