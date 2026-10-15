# Reconhecimento das pastas de produtos no R2

Correção de 15/10/2026. A descoberta usava uma lista fechada de nomes. As pastas informadas pelo lojista estavam no bucket, mas quatro delas não tinham correspondência nessa lista: Almofadas, Azulejo, Copos e garrafas e Kit. Isso fazia suas imagens serem ignoradas antes da importação.

| Pasta informada | Categoria no catálogo | Tipo |
| --- | --- | --- |
| `Almofadas/` | Personalizados | Almofada |
| `Azulejo/` | Quadros | Azulejo |
| `Camisa/` | Camisetas | Camiseta |
| `Caneca magica/` | Canecas | Mágica |
| `Caneca normal/` | Canecas | Porcelana |
| `Caneca pintura/` | Canecas | Para colorir |
| `Copos e garrafas/` | Copos e Garrafas | Copo ou garrafa, conforme revisão do cadastro |
| `Kit/` | Kits | Kit |

A classificação aceita também singular/plural registrados, acentos, maiúsculas/minúsculas, espaços repetidos, hífens, sublinhados e `&` na pasta combinada de copos e garrafas. Foram incluídos os nomes Garrafas, Garrafas térmicas, Squeezes, Azulejos e a variante Azuleijos. Pastas desconhecidas continuam sendo ignoradas; imagens do cache de IA não viram produtos.

Chaves R2, URLs e IDs continuam baseados no caminho original, sem renomear arquivos ou produtos já importados. Os novos registros entram como rascunhos, com preço ainda a preencher. Uma segunda busca não duplica os mesmos arquivos.

As mensagens do admin distinguem nenhuma imagem reconhecida de imagens já cadastradas, incluindo rascunhos.

Validação local: testes de classificação, paginação e importação, incluindo os oito nomes exatos enviados pelo lojista, preservação do catálogo existente e deduplicação. A conexão com o bucket real não foi executada nesta correção; as listagens dos testes são simuladas.

Para aplicar no site, publicar a versão corrigida das Functions, especialmente `admin-r2-models`, junto do build atual. Depois usar Produtos → Buscar modelos no R2 e conferir Situação → Rascunho. Não é necessário renomear as oito pastas informadas. A publicação de cada produto ainda exige revisar dados/fotos e preencher o preço.
