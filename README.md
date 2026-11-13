# Santa Clara — Odontologia e Estética

Website institucional estático, reformulado com a linguagem visual da referência Apple enviada: fundo branco, faixas em cinza suave, fotografia como elemento central, tipografia ampla, cartões de 28 px e animações discretas. A cor verde-escura e os detalhes dourados remetem à identidade da Santa Clara.

## Conteúdo e comportamento

- Dados, contato, endereço e informações sobre a clínica provenientes de `docs/informacoes.md`.
- Fotos originais armazenadas em `assets/`. Registros de resultados são apresentados como registros fotográficos, sem promessas de resultado clínico.
- Menu responsivo, carrossel horizontal acessível, galeria com ampliação nativa em `<dialog>`, links de WhatsApp e Google Maps.
- A página permanece legível se JavaScript ou animações não funcionarem; as imagens da galeria continuam como links normais.
- Suporte a `prefers-reduced-motion`, carregamento tardio de imagens fora do hero e SEO básico.

## Desenvolvimento

Requer Node.js 18+; não exige instalação de dependências de produção.

```sh
npm run dev       # http://127.0.0.1:4173
npm run build     # valida e cria dist/
npm run preview   # serve dist/
```

## Publicação na Hostinger

Se o projeto estiver conectado a uma implantação Git com etapa de build, configure `npm run build` e diretório de saída `dist`. Em hospedagem estática tradicional, envie **o conteúdo de `dist/`**, não a pasta `dist` inteira, para `public_html/`.

A raiz do repositório também contém `index.html`, `styles.css`, `app.js` e `assets/` para hosts que publicam a pasta raiz diretamente. **Não misture arquivos de commits anteriores na pasta publicada**: remova os antigos antes de enviar os arquivos da versão nova, ou force uma implantação limpa.

## Verificações

O script de build falha quando falta qualquer imagem referenciada no HTML. A integração com Google Maps necessita de conexão externa no navegador. O horário informado pela clínica deve ser confirmado via WhatsApp. O repositório contém as imagens originais, que devem ser conferidas na implantação final.

## Animações React Bits adaptadas ao site estático

A experiência inclui **AnimatedContent** (entradas suaves disparadas pelo scroll, com stagger, blur, wipe e suporte a movimento reduzido) em `animated-content.js`. O hero inclui **Aurora** em `aurora.js`, com fragment shader WebGL2 adaptado do código enviado. As cores foram harmonizadas com o verde-sálvia, champanhe e dourado da Santa Clara, em `lightMode`.

O HTML não usa React. A funcionalidade visual foi adaptada para Web Animations API + IntersectionObserver, sem CDN/npm em produção para reduzir problemas na Hostinger. O efeito de aurora mantém um fundo em CSS caso WebGL2 não esteja disponível. Todas as animações são opcionais e o conteúdo permanece visível quando os scripts falham ou quando `prefers-reduced-motion` está ativo.

**Deploy:** executar `npm run build` e publicar o conteúdo de `dist/` (inclusive `aurora.js` e `animated-content.js`).

## Dimensionamento por seção e rolagem magnética

A estrutura foi recalibrada com `svh`, valores `clamp()` e espaçamento vertical responsivo. Em monitores e notebooks, as seções tentam ocupar aproximadamente a altura útil da tela, descontada a navegação fixa. Em celulares, o conteúdo que excede essa altura continua livremente rolável — nenhum cartão, formulário, mapa ou bloco longo é cortado para caber artificialmente.

- `styles.css`: `scroll-snap-type: y proximity`, `scroll-snap-align` por seção e adequações específicas para 320 px, 390 px, tablet, desktop e alturas reduzidas.
- `section-flow.js`: em computadores com mouse e sem preferência por movimento reduzido, acumula aproximadamente dois pequenos movimentos de roda antes de avançar suavemente um capítulo. Um bloqueio curto durante a transição evita pular seções. **Não** intercepta a rolagem quando o bloco não cabe na janela, em dispositivos de toque, dentro de controles roláveis ou quando um modal está aberto.
- Navegação lateral discreta em telas largas, com indicação acessível da seção ativa. Todos os links internos funcionam mesmo com o efeito desativado.
- O `prefers-reduced-motion` desativa os encaixes automáticos e preserva a navegação nativa.

### Validação do ajuste de layout

Build com `npm run build`, sintaxe dos quatro scripts e testes reais no Chromium nos tamanhos 1440×900, 1280×720, 1024×768, 820×850, 390×844, 320×740 e 1366×600. Verificados ausência de rolagem horizontal, avanço magnético sob limiar de esforço no PC, rolagem natural no celular, menu, carrossel, galeria, modal, movimento reduzido e comportamento sem JavaScript. As capturas locais usam fotografias substitutas de proporções semelhantes; o enquadramento das imagens reais só poderá ser confirmado no domínio publicado.

**Para implantação na Hostinger:** o arquivo `section-flow.js` precisa ser enviado junto dos demais arquivos da pasta `dist/`. Como alternativa, configure o diretório de publicação `dist` no deploy automático.
