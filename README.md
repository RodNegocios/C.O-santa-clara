# Santa Clara — Odontologia e Estética

Site institucional responsivo, em HTML, CSS e JavaScript nativos, sem dependências externas de execução. Conteúdo fundamentado no arquivo `informações` e nas fotografias disponibilizadas no repositório.

## Desenvolvimento e validação

- `npm run dev` — servidor de desenvolvimento em `http://127.0.0.1:4173`.
- `npm run build` — verifica os arquivos e prepara `dist/` para publicação.
- `npm run preview` — visualiza o build de produção.

## Publicação na Hostinger

**Hospedagem de sites (hPanel):** rode `npm run build` e envie **o conteúdo** da pasta `dist/` para `public_html/`. `index.html` deve ficar diretamente em `public_html/`, junto de `app.js`, `styles.css`, `favicon.svg`, `robots.txt` e pasta `assets/`. Não é necessário servidor Node em produção.

**Hostinger com Git / build automatizado:** build `npm run build`; diretório de saída `dist`. Caso a integração publique o diretório raiz diretamente, os arquivos da raiz também constituem o site pronto para hospedagem estática.

A galeria de imagens usa arquivos reais fornecidos com o projeto. Não há envio de dados a servidor: todos os CTAs de agendamento abrem o WhatsApp da clínica. O mapa é incorporado do Google Maps e requer internet no navegador. Horários e avaliações foram fornecidos pela clínica e precisam de conferência periódica. Sem analytics, cookies de rastreamento ou dependências de CDN.

## Edição Galeria — design inspirado na Apple

A edição visual mais recente segue o guia anexado: canvas branco, faixas Studio Mist `#f5f5f7`, headlines amplos, fotografias em destaque, cartões de 28 px sem sombras, navegação por capítulos e controles discretos em verde Santa Clara. Foi mantida a identidade dourada do logotipo, evitando a utilização da marca ou de recursos proprietários da Apple.

As seções usam as fotografias originais da clínica e os registros de antes/depois fornecidos no repositório; sem gerar resultados clínicos ou testemunhos fictícios. Todos os links de agendamento direcionam ao WhatsApp oficial informado.

### Testes executados

- Build estático: `npm run build`.
- Navegador Chromium, tamanhos 1440, 1024, 820, 390 e 320 pixels, com conferência de rolagem horizontal, header, menu mobile, carrossel, galeria, modal e teclas.
- Preferência de acessibilidade `prefers-reduced-motion: reduce`.

**Observação:** testes visuais locais usaram arquivos substitutos de proporções semelhantes, por restrição de download no ambiente; o repositório continua contendo as imagens originais. O enquadramento preciso das imagens originais precisa ser inspecionado após publicação. A implantação na Hostinger não é executada pela edição do GitHub: confirme que a integração construiu/publicou o commit novo ou envie `dist/` pelo gerenciador de arquivos.
