# Artes do cliente e orçamentos pelo site

## Comportamento

- JPG, PNG ou WebP de até 3 MB por produto, uma imagem por item. As imagens de um orçamento devem somar até 4 MB (limite conservador para o upload pelas Functions).
- A arte fica no IndexedDB do navegador até a solicitação. A sacola guarda a referência e mostra a prévia no item correto, inclusive após recarregar/editar. Uma arte diferente cria um item independente na sacola.
- Remover/substituir a imagem altera o item. A confirmação local diz “Imagem anexada ao produto”; não diz que o arquivo já foi enviado.
- Ao solicitar: o cliente informa nome e WhatsApp. A Function valida os produtos e as opções e recalcula os preços pelo catálogo do servidor, salva as artes no bucket privado e registra o orçamento por ID independente no Netlify Blobs. Pagamento começa não confirmado; valor é estimado; andamento pendente é apresentado como “Orçamento solicitado”.
- A confirmação de registro só vem depois da gravação. A mensagem contém número, itens, personalização, observações, total e um link protegido para a imagem de cada item. O cliente usa “Continuar no WhatsApp” e toca em Enviar. Não há envio automático nem anexo de mídia pelo WhatsApp.
- Falhas preservam a sacola; a tentativa repetida usa o mesmo ID e não duplica o orçamento confirmado. Falhas antes do registro tentam excluir os uploads parciais.
- No admin, Pedidos e orçamentos reúne registros manuais e do site. “Atualizar orçamentos” busca novas solicitações. Detalhes mostra a imagem por item e o link para abrir/baixar, mantendo o histórico de andamento e pagamento.

## Configuração obrigatória em produção

1. No Cloudflare R2, crie um bucket **privado separado** para as artes, por exemplo `feproposito-artes-clientes`. Mantenha o acesso `r2.dev` e domínios públicos **desativados** nesse bucket. Não use o bucket público `catalago-imagens`.
2. A credencial R2 do servidor precisa ter leitura e escrita nesse bucket, além dos acessos existentes. Não exponha chaves em variáveis com prefixo `VITE_`.
3. Na Netlify, adicione `R2_QUOTES_BUCKET_NAME` com o nome do bucket privado. As Functions reutilizam `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID` e `R2_SECRET_ACCESS_KEY` já usados no projeto. Faça um novo deploy com essas variáveis disponíveis para as Functions.
4. Cadastre um orçamento de teste com arte no site publicado. Confira a confirmação, o registro no admin e o link recebido. Sem esse bucket/credencial, a operação com imagem retorna erro e não confirma o orçamento. Orçamentos sem imagem não dependem do R2.

O código recusa usar o mesmo bucket configurado em `R2_BUCKET_NAME`. A privacidade do novo bucket também depende de manter seus acessos públicos desativados no painel da Cloudflare.

## Acesso e dados

`/api/customer-quote` aceita somente POST da mesma origem, limita quantidade/textos/tamanho, confere assinatura e tipo dos arquivos e tem limitação de frequência por IP/domínio. O ID de submissão é idempotente e a criação do registro é condicional para evitar duplicação concorrente.

`/api/quote-image` exige identificador e token aleatório de 256 bits. Consulta o arquivo pelo servidor, sem divulgar credenciais ou criar URL pública no R2. Respostas usam `private, no-store`, `nosniff`, `no-referrer` e `noindex`. O link é uma credencial de acesso: qualquer pessoa que o receber poderá abrir a imagem. Os arquivos e registros não têm exclusão automática; ao atender uma solicitação de exclusão, remova o registro `customer-quotes/<id>` no Blobs e os objetos correspondentes em `quotes/<id>/` no R2. Limpar os dados do site no navegador remove as cópias locais.

## Validação

- `tests/customer-quotes.test.mjs`: persistência, preços do servidor, imagens por item, idempotência, token, edição no admin, acesso administrativo, origem, formatos inválidos, limpeza em falhas e recusa do bucket público.
- `tests/artwork-checkout.e2e.mjs`: desktop/celular, prévia, remover/substituir, recarga/edição da sacola, falha de gravação sem falso sucesso, confirmação, mensagem e imagem no admin.
- `tests/admin-server.test.mjs`, `tests/admin.e2e.mjs` e `tests/storefront.e2e.mjs`: regressões administrativas e da loja.
- TypeScript e build de produção.

Testes de R2, Identity e Blobs são isolados com serviços simulados. Não foram enviados arquivos de clientes nem alterados os dados publicados. A configuração real do bucket privado e a validação final em produção ficam pendentes até o deploy com as variáveis corretas.
