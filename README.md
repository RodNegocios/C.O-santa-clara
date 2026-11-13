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