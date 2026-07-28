// Static server with SPA fallback. Serves public/ plus agentation-glue.js.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const PORT = Number(process.argv[2] || 8961);

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
                '.css': 'text/css', '.json': 'application/json' };

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let p = decodeURIComponent(url.pathname);

  const candidates = [
    path.join(PUBLIC, p),
    path.join(ROOT, p),                 // /agentation-glue.js
  ];
  for (const c of candidates) {
    if (!c.startsWith(ROOT)) continue;
    if (fs.existsSync(c) && fs.statSync(c).isFile()) {
      res.writeHead(200, {
        'Content-Type': TYPES[path.extname(c)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      return res.end(fs.readFileSync(c));
    }
  }
  // SPA fallback
  res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' });
  res.end(fs.readFileSync(path.join(PUBLIC, 'index.html')));
}).listen(PORT, () => console.log('listening on http://localhost:' + PORT));
