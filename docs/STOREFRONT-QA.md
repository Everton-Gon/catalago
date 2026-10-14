# Loja pública — redesign e validação

Implementado em 14/10/2026 no projeto existente. Publicação no Netlify não foi executada.

## O que mudou

- Identidade pública com branco, areia e violeta, títulos em Lora e textos em Inter; estilos restritos ao layout público para preservar o administrativo.
- Cabeçalho com busca sempre visível, categorias reais, atendimento e quantidade na sacola; organização própria para celular.
- Home com banner em HTML, fotos do catálogo, categorias com imagens, destaques, personalização e etapas do pedido.
- Banner passou a consumir imagens do catálogo em vez de importar arquivos locais ausentes. Nenhuma imagem foi gerada ou produto cadastrado.
- Cards com imagem inteira, proporção consistente, referência da estampa, preço inicial calculado pelas opções cadastradas e acesso à seleção de opções.
- Catálogo com filtros compartilháveis na URL, modelo de camisa, tecido, tipo de caneca, preço, ordenação, chips removíveis e limpeza de filtros. Seleções rápidas agora preservam os demais filtros.
- Página de produto mantém tecido, modelo, tamanho e cor separados. Cores sem imagem cadastrada preservam a foto original. Modelos com preço sob consulta continuam no fluxo de orçamento.
- Avaliações em estrelas sem dados correspondentes foram removidas.
- Sacola permite recuperar e editar escolhas, personalização, observações e quantidade, substituindo o item original. Fotos completas, subtotais e total permanecem visíveis.
- Orçamento direto do produto e pedido da sacola incluem opções, nome, texto e observações no link do WhatsApp.
- Painéis móveis mantêm foco, respondem a Escape e devolvem o foco ao controle que os abriu.

## Verificações executadas

- `npm run build`: compilação TypeScript do app e Functions e build Vite aprovados.
- `node --experimental-strip-types --test tests/r2-import.test.mjs`: 13 testes existentes aprovados.
- `node tests/storefront.e2e.mjs`: testes de navegador aprovados em Microsoft Edge headless com Playwright.
- Busca por termos, filtros combinados, preço por tecido, remoção e limpeza de filtros, ordenação e tipo de caneca.
- Estado sem resultados, opções de camisa, cor sem foto correspondente, nome, texto, observações, quantidade e bloqueio de compra de modelo sob consulta.
- Sacola persistida após recarregar, recuperação dos campos ao editar, substituição sem duplicação, quantidade, remoção e sacola vazia.
- Conteúdo e totais das URLs de WhatsApp, tanto na página de produto quanto na sacola. Nenhuma mensagem foi enviada para atendimento.
- Home, catálogo, produto e sacola sem rolagem horizontal em 320, 390, 768, 1024 e 1440 px: 20 combinações.
- Abertura, contenção de foco, fechamento por Escape e retorno de foco nos painéis móveis.
- Nenhum erro JavaScript de página registrado durante o teste funcional.
- Revisão visual de capturas de home, catálogo, produto e sacola em desktop, além de home e produto no celular.

### Reexecutar os testes de navegador

Inicie `npm run dev` em um terminal. Em outro, execute `node tests/storefront.e2e.mjs` com Playwright e um navegador instalados no ambiente.

Variáveis opcionais:

- `STOREFRONT_URL`: URL da prévia; padrão `http://127.0.0.1:5173`.
- `PLAYWRIGHT_MODULE`: módulo ou URL `file:///` da instalação existente de Playwright; padrão `playwright`.
- `BROWSER_CHANNEL`: canal disponível, por exemplo `msedge`. Ausente usa o Chromium do Playwright.

## Imagens e informações reais

- O anexo recebido continha somente o texto do pedido. As quatro referências visuais mencionadas não estavam disponíveis; foi seguida a direção descrita.
- Camisas e canecas usam as fotos já cadastradas, inclusive as URLs públicas R2 existentes.
- Copos, kits, quadros e outros personalizados continuam usando as ilustrações que já existiam no cadastro. Fotos reais dessas categorias melhorariam a consistência da vitrine.
- Não há campo ativo de upload de arte do cliente nos componentes públicos. O utilitário antigo `artStore.ts` guarda arquivos somente na memória da aba e não é consumido pelo fluxo atual. A interface informa que o cliente precisa anexar a arte diretamente na conversa do WhatsApp; não afirma que arquivos foram enviados.
- Dados de contato, redes sociais e políticas existentes foram preservados. Produtos, preços cadastrados e rotas não foram alterados.
- A validação local usa o catálogo estático quando as Netlify Functions não estão disponíveis. Não valida gravações no catálogo remoto, upload administrativo, recebimento real de mensagens ou publicação em produção.
