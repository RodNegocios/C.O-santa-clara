# Santa Clara — Odontologia & Estética

Site institucional estático, em português, da Santa Clara Odontologia e Estética — Sapezal/MT. O conteúdo de contato e endereço vem de `docs/informacoes.md`; fotos e registros de tratamentos pertencem ao acervo `assets/`.

## Publicação na Hostinger

### Hospedagem de sites (hPanel / public_html)

- Execute `npm run build` em Node.js 18 ou superior.
- Envie **o conteúdo** de `dist/` diretamente para `public_html/` (e não a pasta `dist` em si).
- Verifique se `public_html/index.html` e `public_html/assets/` estão presentes. As 16 imagens precisam estar nessa pasta.
- Limpe o cache da Hostinger/CDN após a implantação; valide em janela anônima.

### Implantação Git automática

- Branch de origem: `main`.
- Comando de build: `npm run build`.
- Diretório de saída: `dist`.
- Se a integração fizer deploy direto dos arquivos da raiz, `index.html`, `assets/`, `styles.css` e `app.js` também formam um site estático funcional.

## Correções de confiabilidade

A página contém CSS e JavaScript essenciais embutidos no `index.html`. Os arquivos `styles.css` e `app.js` continuam separados e são carregados como alternativa para ambientes com política de segurança que bloqueie scripts/estilos embutidos. O JS possui proteção contra inicialização duplicada.

Se a hospedagem não disponibilizar uma imagem de `/assets/`, há uma tentativa de recuperação por URL pública da **mesma imagem** no GitHub. Se a recuperação também falhar, o layout mantém um bloco informativo, sem ficar vazio. Há uma versão navegável da galeria e do carrossel mesmo sem JavaScript, com rolagem horizontal acessível.

O build verifica a presença das imagens referenciadas e se o CSS e o JavaScript embutidos estão sincronizados com os respectivos arquivos. Não há dependências externas de execução: apenas o carregamento opcional de fontes do Google e o mapa incorporado necessitam internet.

### Comandos

```bash
npm run dev
npm run build
npm run preview
```

## Limites de validação

O HTML, CSS, JavaScript, referências locais e a resposta HTTP do preview de produção foram verificados. O ambiente de execução bloqueia a navegação pelo Chromium e o acesso ao domínio Hostinger informado; portanto, a experiência **ao vivo**, o recorte final das fotografias originais e eventual falha na configuração de deploy não puderam ser inspecionados daqui. Os arquivos originais do GitHub foram preservados, sem substituir imagens clínicas.

O agendamento usa o WhatsApp informado pela clínica. Horários e outros dados operacionais devem ser validados periodicamente pela clínica.
