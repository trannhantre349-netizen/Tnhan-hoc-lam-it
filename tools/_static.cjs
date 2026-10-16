const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const port = parseInt(process.argv[2] || '5601', 10);
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.json':'application/json', '.webmanifest':'application/manifest+json', '.woff2':'font/woff2' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(root, p);
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); res.end('404'); return; } res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); res.end(d); });
}).listen(port, () => console.log('static on ' + port));
