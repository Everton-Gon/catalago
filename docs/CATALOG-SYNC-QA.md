# Atualização do catálogo público

## Diagnóstico

Consulta somente de leitura em `https://feproposito.netlify.app/api/catalog`: 263 registros, incluindo a almofada Bluey/Bingo publicada por R$ 40 e a almofada antiga indisponível. O cadastro já estava salvo; a tela pública apresentada pelo usuário ainda correspondia ao catálogo inicial antigo.

A consulta pública acontecia apenas na montagem da aplicação. A API permitia cache de 30 segundos e reutilização de resposta antiga por mais 300 segundos; em falhas de conexão, o navegador continuava exibindo silenciosamente os produtos do pacote inicial.

## Correção

- Leitura dos produtos no Netlify Blobs com consistência forte.
- Respostas públicas e consulta do navegador sem armazenamento em cache.
- Nova consulta ao voltar à aba e receber aviso de gravação em outra aba da mesma origem.
- O admin envia o aviso somente após a API confirmar a gravação.
- Respostas atrasadas não substituem dados de uma consulta mais recente.
- Em produção, a primeira consulta aguarda a API. Falhas mostram aviso e ação de tentar novamente; não carregam silenciosamente o catálogo antigo. A última resposta válida é preservada em falhas posteriores.
- O catálogo inicial continua disponível para desenvolvimento local e quando a API confirma que o armazenamento ainda não foi inicializado (`null`).

## Validação

- `npm run build`: TypeScript da aplicação e das funções, mais build de produção.
- `node --test tests/admin-server.test.mjs`: publicação/desativação, resposta atual, três cabeçalhos `no-store`, leitura forte e demais validações administrativas.
- `tests/catalog-sync.e2e.mjs`, contra o preview de produção: publicação, desativação, preço, contagem, sincronização entre abas, resposta atrasada, recuperação após erro e celular.
- `tests/admin.e2e.mjs`, contra Vite: gravação confirmada emite aviso; gravação rejeitada não emite; regressão dos fluxos administrativos.

Os testes usam APIs simuladas e não alteram os dados publicados. A correção precisa de deploy para entrar no site. Como a API publicada já contém o cadastro correto, uma atualização completa da página (`Ctrl+F5`) deve carregar esse cadastro mesmo antes do deploy.
