#!/usr/bin/env node
/* Servidor estático simples, sem dependências. Uso: npm start  (PORT=8080 HOST=0.0.0.0 para abrir no tablet) */
const http = require('http'), fs = require('fs'), path = require('path');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };

function createServer(root) {
  return http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.normalize(path.join(root, p));
    if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); return res.end('não encontrado'); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(data);
    });
  });
}
module.exports = { createServer };

if (require.main === module) {
  const port = +process.env.PORT || 8080, host = process.env.HOST || '127.0.0.1';
  createServer(path.resolve(__dirname, '..')).listen(port, host, () => console.log(`Painel em http://${host}:${port}`));
}
