# Ajustes do catálogo e banner — validação

Implementação local em 14/10/2026. Não publicada no Netlify.

## Alterações

- Filtro lateral de 260 px com superfície branca, bordas neutras, divisórias, ícone uniforme e ação Limpar no cabeçalho.
- Seis categorias existentes em checkboxes, sem emojis e com quantidade real de produtos publicados e disponíveis. Sem seleção, o catálogo completo é exibido.
- Seleções de categoria são alternativas entre si; busca, faixa de preço e opções adicionais restringem o conjunto. Seleções rápidas preservam as escolhas anteriores.
- Faixa de preço com campos Mínimo/Máximo em reais e dois seletores nativos acessíveis. Campos, seletores, etiquetas e URL ficam sincronizados. Valores são limitados ao catálogo e o mínimo não ultrapassa o máximo.
- Limites calculados a partir dos preços atuais de venda e das opções com preço cadastrado. Preços anteriores de promoção não determinam os limites. O filtro por tecido continua considerando o preço atual do tecido selecionado.
- Ordenação acima da grade: Mais recentes, Menor preço, Maior preço e Nome de A a Z. Limpar remove os filtros e conserva a ordenação escolhida.
- Etiquetas removíveis para categorias, preço, busca e demais opções; contagem atualizada e estado vazio com Limpar filtros.
- Celular com botão Filtrar e contador, painel com os mesmos controles, fechar, Limpar e Ver resultados. Mantém seleções, contém o foco, fecha com Escape e devolve o foco ao botão.
- Rotas de categoria existentes continuam abrindo a categoria correspondente. Ao combinar categorias ou limpar sua seleção, a navegação usa o catálogo geral com as escolhas na URL.
- Banner integrado atualizado conforme a nova referência: a versão horizontal em `public/brand/banner-fe-proposito-wide.png` foi preparada com a ferramenta de imagem, ampliando o cenário e reservando espaço para o texto à esquerda. O original enviado continua preservado em `public/brand/banner-fe-proposito.png`.
- A composição horizontal tem 2078 × 757 px e ocupa todo o fundo no desktop, sem moldura. Título, descrição e botões ficam em HTML sobre a área livre à esquerda. No celular, o enquadramento privilegia os produtos à direita, depois do texto e dos botões.
- Título, descrição e botões solicitados permanecem em HTML. Explorar produtos aponta para `/produtos`; Pedir pelo WhatsApp usa a integração existente.
- Produtos, preços cadastrados, logo e área administrativa preservados.

## Testes

- `npm run build`: TypeScript do app e Functions e build Vite aprovados.
- `node --experimental-strip-types --test tests/r2-import.test.mjs`: 13 testes existentes aprovados.
- `node tests/catalog-filters.e2e.mjs`: testes novos aprovados em Edge headless com Playwright.
- `node tests/storefront.e2e.mjs`: regressão de busca, filtros, opções, personalização, sacola, persistência, edição e conteúdo das URLs de WhatsApp aprovada.
- Seleção simultânea de Canecas e Camisetas; verificação independente de contagens por categoria.
- Combinação de busca, várias categorias e preço; exclusão individual e limpeza; estado vazio.
- Campos monetários e seletores em ambos os sentidos, validação de limites, ajuste por teclado e arraste real com mouse.
- Ordenação crescente, decrescente e alfabética e as quatro opções visíveis.
- Catálogo simulado com preço atual de R$ 128,50 e preço anterior de R$ 250: limite de R$ 128,50 confirmado, sem máximo fixo de R$ 60.
- Painel móvel: reabertura preserva escolhas, contador de filtros, limpeza, foco, Escape e retorno do foco.
- Home e catálogo sem rolagem horizontal em 320, 390, 768, 1024 e 1440 px. Verificação adicional do banner integrado com `tests/hero-banner.e2e.mjs` em 320, 390, 768, 1024, 1440 e 1920 px, incluindo posicionamento do texto, cena e destino dos botões.
- Nenhum erro JavaScript de página registrado no teste novo. Revisão visual de capturas desktop e mobile.

Os testes usam a prévia local e o catálogo incluído no projeto quando as Netlify Functions não estão disponíveis. Nenhum pedido foi enviado ao atendimento; foram verificados os links e as mensagens geradas.

Para repetir, inicie `npm run dev` e execute os arquivos `.e2e.mjs` com Playwright e um navegador disponíveis. Aceitam `PLAYWRIGHT_MODULE`, `BROWSER_CHANNEL` e `STOREFRONT_URL`; o teste novo também aceita `STOREFRONT_ARTIFACTS` para salvar capturas.
