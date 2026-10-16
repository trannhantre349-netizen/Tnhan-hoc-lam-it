// Tải Google Fonts (Baloo 2 + JetBrains Mono) về assets/fonts/ để chạy offline 100%.
// Chạy: node tools/fetch-fonts.cjs  → sinh assets/fonts/*.woff2 và in ra CSS @font-face thay thế @import.
const fs = require('fs');
const path = require('path');

const CSS_URL = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const OUT_DIR = path.join(__dirname, '..', 'assets', 'fonts');

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const res = await fetch(CSS_URL, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error('CSS fetch failed: ' + res.status);
  const css = await res.text();

  // Tách từng block @font-face + comment subset đứng ngay trước
  const re = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([\s\S]*?)\}/g;
  let m, blocks = [];
  while ((m = re.exec(css))) blocks.push({ subset: m[1], body: m[2] });
  if (!blocks.length) throw new Error('No @font-face blocks parsed');

  const fonts = [];
  for (const b of blocks) {
    const family = /font-family:\s*'([^']+)'/.exec(b.body)[1];
    const weight = /font-weight:\s*([^;]+);/.exec(b.body)[1].trim();
    const url = /url\((https:\/\/[^)]+\.woff2)\)/.exec(b.body)[1];
    const range = /unicode-range:\s*([^;]+);/.exec(b.body)[1].trim();
    const slug = family.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + b.subset + '.woff2';
    const file = path.join(OUT_DIR, slug);
    if (!fs.existsSync(file)) {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!r.ok) throw new Error('woff2 fetch failed ' + url + ': ' + r.status);
      fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
      console.log('downloaded', slug, fs.statSync(file).size, 'bytes');
    } else {
      console.log('exists    ', slug, fs.statSync(file).size, 'bytes');
    }
    fonts.push({ family, weight, range, slug });
  }

  const out = fonts.map(f =>
    `@font-face {\n  font-family: '${f.family}';\n  font-style: normal;\n  font-weight: ${f.weight};\n  font-display: swap;\n  src: url('../assets/fonts/${f.slug}') format('woff2');\n  unicode-range: ${f.range};\n}`
  ).join('\n');
  fs.writeFileSync(path.join(OUT_DIR, '_fontfaces.css.txt'), out);
  console.log('\n=== ' + fonts.length + ' font files OK — CSS @font-face đã lưu ở assets/fonts/_fontfaces.css.txt ===');
}
main().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
