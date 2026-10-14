# Administração da Fé & Propósito

Implementação no projeto atual, ainda sem publicação. Usa React/Vite, Netlify Identity, Netlify Functions, Netlify Blobs, Cloudflare R2 e a integração Gemini já existente.

## Alterações

- Menu com logo real, indicação da seção, recolhimento, nomes acessíveis, Ver loja e navegação móvel em painel temporário.
- Dashboard calculado a partir dos produtos, banners e orçamentos carregados: ativos, rascunhos, inativos, promoções, banners ativos e orçamentos pendentes. Sem faturamento, conversão ou vendas inferidas de cliques.
- Produtos em tabela com seleção, imagens, categoria, coleções, preço atual, promoção, situação, busca, filtros, ordenação e páginas de 12 registros. Os filtros permanecem ao abrir e fechar a edição.
- Duplicação cria outro ID/endereço em rascunho, preservando opções. Ativação individual e alterações em lote pedem confirmação com quantidade afetada. Exclusão não aparece como ação principal.
- Ordenação manual do catálogo preservada no menu de ações por produto, com mover acima/abaixo. A busca de modelos R2 pode ser cancelada ao sair e usa a versão mais recente dos produtos para não descartar edições durante a descoberta.
- Formulário em cinco seções, prévia de card, erros por campo, salvamento de rascunho, aviso ao fechar/recarregar com alterações não salvas e bloqueio de reenvio. Falhas não exibem confirmação de salvamento.
- Upload múltiplo com prévias locais, formato/tamanho, retorno de erro, reordenação e foto principal. JPG, PNG, WebP e GIF até 10 MB. Referências antigas de imagens SVG continuam válidas no catálogo, mas novos uploads SVG não são aceitos.
- Dimensões de tecido/modelo/tamanho/cor separadas; tipos de caneca mantidos; edição de valores por opção, personalização e cores. Descontos negativos já existentes em acréscimos foram preservados. Geração Gemini somente nas cores escolhidas.
- Categorias existentes preservadas. Coleções têm IDs estáveis, nome, endereço, imagem, descrição, ordem e situação; um produto pode receber vários vínculos. Não houve classificação automática dos produtos em temas.
- Coleções públicas usam `/colecao/:slug`; a página inicial exibe apenas coleções ativas com produtos ativos vinculados, com imagem e ordem configuradas.
- Gestão dos seis banners atuais, novo banner inicialmente inativo, título/descrição/alternativa/botões/links, imagem desktop e celular, prévias, ordem e situação. Gospel permanece ativo, primeiro e com a foto aprovada. Intervalo inicial 6 s, configurável em 5, 6 ou 7 s.
- Ao carregar a configuração pública, o carrossel fica no Gospel e não permite navegar antes de receber o estado dos banners. Banners inativos são omitidos pela API pública.
- Orçamentos registrados manualmente, sem criar vendas a partir do WhatsApp: cliente, telefone, itens, opções, quantidades, notas e links reais de arquivos. Painel de detalhes com resumo copiável, WhatsApp, arquivos, andamento e histórico.
- Estimativa e valor confirmado são identificados separadamente. Pagamento começa não confirmado e exige confirmação contextual do administrador para mudar. Histórico recebe data e responsável no servidor.

## Persistência e proteção

- `/api/admin/products`: catálogo existente; validado no servidor, protegido por função admin e origem. Produtos relacionados a pedidos não podem ser excluídos pela API.
- `/api/admin/content`: banners, coleções e intervalo na chave `content` do store existente `fe-proposito-catalog`. Coleções vinculadas não podem ser removidas; devem ser desativadas.
- `/api/admin/orders`: chave `orders`, registros manuais e histórico. IDs, número, criação e histórico são controlados pelo servidor; informações enviadas pelo cliente não substituem esses metadados.
- `/api/storefront`: configuração pública sem banners ou coleções inativos, cache de até 30 segundos. Abra/recarregue a loja depois de salvar para consultar a nova configuração.
- Com dados ainda não persistidos, os arquivos atuais iniciam o painel. Se um GET administrativo falhar, o módulo afetado fica para consulta e a gravação é bloqueada.
- Login, convite, recuperação de senha e papel admin mantidos. Nenhum bypass de autenticação foi introduzido no aplicativo.

## Validação

- Build TypeScript/Vite.
- `tests/admin.e2e.mjs`: navegador com Identity/APIs simulados em contexto isolado; não altera registros reais. Criação/publicação, campos obrigatórios, upload múltiplo/formato/falha de upload, foto principal/ordem, edição e falha de servidor, duplicação, busca preservada, ativação individual/em lote, coleção, ordem, links de banners, prévias, intervalo, orçamento, pagamento/histórico, celular, menu, foco, coleção pública e Gospel inicial.
- `tests/admin-server.test.mjs`: handlers reais empacotados com serviços Identity/Blobs simulados: visitantes/não-admin/origem externa, validações, integridade dos dados existentes, metadados de orçamento e proteção de vínculos.
- Regressões públicas: `storefront.e2e.mjs`, `catalog-filters.e2e.mjs`, `carousel.e2e.mjs` e `banners-layout.e2e.mjs`; filtros, produto, sacola, WhatsApp, ciclo, teclado, pausa, swipe, movimento reduzido e layout.
- `r2-import.test.mjs`: importação R2 preserva classificações, URLs, IDs, paginação e rascunhos.

As capturas do admin são de um contexto de teste, com conta `qa@example.test`; não representam uma conta real ou dados de atendimentos reais.

## Integrações e dados ainda necessários

- A gravação real exige publicar as Functions no Netlify com Identity e Blobs disponíveis. Testes locais simulados verificam o código, mas não confirmam as credenciais do ambiente publicado.
- Upload real depende das variáveis R2 já usadas pelo projeto. Gemini depende da configuração existente; nenhuma geração paga foi executada durante esta reformulação.
- O histórico anterior de conversas do WhatsApp não está no projeto. Os atendimentos precisam ser registrados manualmente; sincronização automática exigiria integração própria e consentimento para persistir os dados dos clientes.
- Não há gateway de pagamentos ou conciliação automática. Confirmação é manual, registrada pelo administrador.
- Arquivos de clientes não são enviados pela sacola pública: podem ser vinculados pelos links reais recebidos no atendimento.
