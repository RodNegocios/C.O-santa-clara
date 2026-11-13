# Santa Clara — Odontologia e Estética

Site institucional responsivo, em HTML, CSS e JavaScript nativos, sem dependências externas de execução. Conteúdo fundamentado no arquivo `docs/informacoes.md` e nas fotografias disponibilizadas no repositório.

## Desenvolvimento e validação

- `npm run dev` — servidor de desenvolvimento em `http://127.0.0.1:4173`.
- `npm run build` — verifica os arquivos e prepara `dist/` para publicação.
- `npm run preview` — visualiza o build de produção.

## Publicação na Hostinger

**Hospedagem de sites (hPanel):** rode `npm run build` e envie **o conteúdo** da pasta `dist/` para `public_html/`. `index.html` deve ficar diretamente em `public_html/`, junto de `app.js`, `styles.css`, `favicon.svg`, `robots.txt` e pasta `assets/`. Não é necessário servidor Node em produção.

**Hostinger com Git / build automatizado:** build `npm run build`; diretório de saída `dist`. Caso a integração publique o diretório raiz diretamente, os arquivos da raiz também constituem o site pronto para hospedagem estática.

A galeria de imagens usa arquivos reais fornecidos com o projeto. Não há envio de dados a servidor: todos os CTAs de agendamento abrem o WhatsApp da clínica. O mapa é incorporado do Google Maps e requer internet no navegador. Horários e avaliações foram fornecidos pela clínica e precisam de conferência periódica. Sem analytics, cookies de rastreamento ou dependências de CDN.