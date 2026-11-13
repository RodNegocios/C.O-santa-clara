# Santa Clara — Odontologia e Estética

Site institucional estático e responsivo da Santa Clara Odontologia e Estética, em Sapezal/MT. Conteúdo fundamentado em `docs/informacoes.md`, com fotos e identidade visual do repositório.

## Identidade e experiência

Reformulação editorial inspirada em páginas de produto com estética clara: tipografia de destaque, muito espaço em branco, faixas cinza `#f5f5f7`, superfícies brancas com cantos de 28px, ausência de sombras e botões verdes em harmonia com a marca. Inclui hero de fotografia central, seção institucional, carrossel de cuidados com swipe e autoplay, galeria circular de registros com modal, apresentação do Dr. Leonardo, dados da clínica e mapa.

As animações de títulos acompanham a rolagem e respeitam `prefers-reduced-motion`. A página conta com navegação por teclado, menu mobile, descrições alternativas das imagens e metadados de SEO.

## Executar e publicar

Requer Node.js >=18 apenas para as tarefas locais (sem dependências externas):

- `npm run dev` — servidor local de desenvolvimento.
- `npm run build` — gera `dist/`, incluindo HTML, CSS, JS, favicon, robots e fotos.
- `npm run preview` — prévia do build de produção.

**Hostinger hPanel:** envie **o conteúdo** da pasta `dist/` para `public_html/`. Coloque `index.html` diretamente em `public_html/` com `styles.css`, `app.js`, `favicon.svg`, `robots.txt` e `assets/`. Não há backend nem necessidade de servidor Node em produção.

**Hostinger com integração Git:** configure comando de build `npm run build`, diretório publicado `dist`. Alterações enviadas ao GitHub só aparecem no domínio quando o deploy correspondente for executado.

## Informações e atenção

Telefone/WhatsApp: (65) 99953-2460. Endereço e horários vêm de `docs/informacoes.md`; confirme especialmente o funcionamento de quinta-feira. Nota e número de avaliações Google são informações fornecidas pela clínica e podem variar.

Os resultados exibidos são registros visuais fornecidos pela clínica; casos individuais podem variar. Não foram adicionados depoimentos fictícios. O agendamento direciona ao WhatsApp, sem formulário ou envio de dados a um servidor. O Google Maps incorporado necessita de internet.

