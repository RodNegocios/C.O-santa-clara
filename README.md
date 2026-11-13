# Santa Clara — Odontologia & Estética

Site institucional em português, com estética editorial inspirada na composição arquitetônica da referência enviada: fundo marfim, tipografia serifada, desenhos de construção geométrica, linhas finas, imagem do profissional como protagonista e seções visuais amplas. Cores adaptadas à identidade da Santa Clara.

## Conteúdo e funcionamento

Os dados de contato e endereço provêm de `docs/informacoes.md`. Fotos e registros de antes/depois são os arquivos originais fornecidos no repositório, preservados na pasta `assets/`.

- Hero editorial com geometria SVG animada e controle para pausar a animação.
- Títulos com split text sincronizado com a rolagem.
- Carrossel de cuidados com navegação por setas, teclado e deslize.
- Galeria circular de registros com modal, navegação por teclado e suporte a toque.
- Apresentação da clínica e do Dr. Leonardo, mapa, contato e agendamento via WhatsApp.
- Interface sem frameworks, sem dependências de JavaScript, adaptada a desktop, tablet e mobile.
- `prefers-reduced-motion`, links de pular conteúdo, foco visível e descrições de imagens.

## Rodar e testar

```bash
npm run dev
npm run build
npm run preview
```

## Publicação na Hostinger

Na hospedagem estática, rode `npm run build` e envie **o conteúdo** de `dist/` para `public_html/`, com `index.html` diretamente na raiz. Se a Hostinger estiver conectada ao GitHub com implantação automática, configure comando `npm run build` e diretório de saída `dist`.

O domínio da Hostinger não é publicado automaticamente por uma alteração no GitHub, exceto se houver integração de deploy ativa. O mapa necessita de acesso à rede; os horários, avaliações e informações clínicas devem ser conferidos periodicamente. As fotos originais precisam ser revisadas visualmente após a implantação, pois o ambiente de testes utiliza cópias de proporções aproximadas.
