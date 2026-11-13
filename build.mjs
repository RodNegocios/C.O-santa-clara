import { cp, mkdir, readdir, readFile, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';

const html = await readFile('index.html', 'utf8');
const css = await readFile('styles.css', 'utf8');
const js = await readFile('app.js', 'utf8');
const motion = await readFile('animated-content.js', 'utf8');
const aurora = await readFile('aurora.js', 'utf8');
const flow = await readFile('section-flow.js', 'utf8');
for (const token of ['<main', 'id="cuidados"', 'id="resultados"', 'id="contato"', '</html>']) {
  if (!html.includes(token)) throw new Error(`HTML incompleto: ${token}`);
}
if (!css.includes('@media(max-width:680px)')) throw new Error('CSS responsivo ausente');
if (!js.includes('gallery-track')) throw new Error('Galeria sem controlador');
if (!html.includes('section-flow.js') || !flow.includes('deliberateWheel')) throw new Error('Navegação magnética ausente');
if (!html.includes('data-aurora') || !motion.includes('IntersectionObserver') || !aurora.includes('webgl2')) throw new Error('Efeitos de animacao/aurora ausentes');

const assetNames = new Set(await readdir('assets'));
const imagePaths = [...html.matchAll(/(?:src|href|data-fallback)="assets\/([^"]+)"/g)].map(m => m[1]);
for (const name of imagePaths) {
  if (!assetNames.has(name)) throw new Error(`Imagem ausente: assets/${name}`);
  const file = await stat(join('assets', name));
  if (!file.isFile() || file.size === 0) throw new Error(`Imagem inválida: assets/${name}`);
}
const dest = 'dist';
await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });
for (const name of ['index.html','styles.css','app.js','animated-content.js','aurora.js','section-flow.js','favicon.svg','robots.txt','assets']) {
  await cp(name,join(dest,name), { recursive:true });
}
console.log(`Build validado: ${imagePaths.length} referências de imagens, ${assetNames.size} arquivos em assets/. Publicar o conteúdo de dist/ na Hostinger.`);
