import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(process.argv[2] === 'dist' ? 'dist' : '.');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.txt':'text/plain; charset=utf-8'};
const server = createServer(async (req, res) => {
  let path;
  try { path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch {res.writeHead(400).end(); return;}
  const full = resolve(root, '.' + (path === '/' ? '/index.html' : path));
  if (full !== root && !full.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  try { const s = await stat(full); if (!s.isFile()) throw Error(); const data = await readFile(full); res.writeHead(200, {'content-type': types[extname(full)] || 'application/octet-stream', 'cache-control': full.includes('/assets/') ? 'public, max-age=86400' : 'no-cache'}).end(data); }
  catch { res.writeHead(404, {'content-type':'text/plain'}).end('Não encontrado'); }
});
server.listen(4173, '127.0.0.1', () => console.log(`Site disponível em http://127.0.0.1:4173 (${root})`));
