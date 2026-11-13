import { cp, mkdir, readdir, readFile, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
const out = 'dist';
const html = await readFile('index.html', 'utf8');
const css = await readFile('styles.css', 'utf8');
const js = await readFile('app.js', 'utf8');
if (!html.includes(css) || !html.includes(js)) throw new Error('O CSS e o JS embutidos no HTML precisam estar sincronizados.');
const images = [...html.matchAll(/<img\b[^>]*?src=["'](assets\/[^"']+)["']/g)].map(m => m[1]);
if (!images.length) throw new Error('Nenhuma imagem encontrada no site.');
for (const name of images) {
  const file = await stat(name).catch(() => null);
  if (!file?.isFile() || file.size < 100) throw new Error(`Imagem ausente ou inválida: ${name}`);
}
await rm(out, {recursive: true, force:true});
await mkdir(out, {recursive: true});
for (const name of ['index.html', 'styles.css', 'app.js', 'favicon.svg', 'robots.txt', 'assets']) {
  await cp(name,join(out,name),{recursive:true});
}
const count = (await readdir(join(out,'assets'))).length;
console.log(`Build validado — ${images.length} referências visuais, ${count} arquivos de imagem, CSS e JS embutidos em index.html. Saída: dist/`);
