import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
const out = 'dist';
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const name of ['index.html', 'styles.css', 'app.js', 'favicon.svg', 'robots.txt', 'assets']) {
  await cp(name, join(out, name), { recursive: true });
}
const files = await readdir(join(out, 'assets'));
if (!files.length) throw new Error('Assets ausentes');
const { size } = await stat(join(out, 'index.html'));
console.log(`Build estático OK — ${files.length} imagens, index.html ${size} bytes. Publique a pasta dist/ na Hostinger.`);
