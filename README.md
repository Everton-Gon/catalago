# Fé & Propósito — Loja de Produtos Personalizados

Loja virtual de produtos personalizados e sublimação. O cliente navega, escolhe as opções,
descreve a personalização, monta a sacola e envia o pedido pelo WhatsApp.

**Sem login, sem cadastro, sem pagamento online, sem banco de dados.**

---

## Rodando o projeto

```bash
npm install
npm run dev
```

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento em http://localhost:5173 |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Serve o `dist/` localmente para conferir antes de publicar |
| `npm run typecheck` | Verifica os tipos sem gerar arquivos |

Stack: React 19 · Vite · TypeScript · Tailwind CSS v4 · React Router · lucide-react.

---

## As três coisas que você mais vai editar

### 1. Número do WhatsApp e dados de contato

Tudo em **`src/config/site.ts`** — é o único lugar onde esses valores existem.

```ts
export const WHATSAPP_NUMBER = '5511999999999' // 55 + DDD + número, só dígitos
```

Ali também ficam: nome da loja, e-mail, telefone exibido, cidade, horário de atendimento,
links das redes sociais e o prazo médio de produção.

### 2. Produtos

**`src/data/products.ts`**. Cada produto é um objeto; para criar um novo, copie um bloco
existente e ajuste os campos. `id` e `slug` precisam ser únicos.

```ts
{
  id: 'caneca-branca',                      // único, usado na sacola
  slug: 'caneca-branca-personalizada',      // vira a URL /produto/<slug>
  name: 'Caneca Branca Personalizada',
  shortDescription: '...',                  // aparece no card
  description: '...',                       // aparece na página do produto
  category: 'canecas',                      // precisa existir em categories.ts
  images: ['/produtos/caneca-branca-1.svg'],// arquivos em public/produtos/
  price: 25,                                // preço-base "a partir de"
  oldPrice: 32,                             // opcional: mostra preço riscado
  featured: true,                           // aparece na home
  available: true,                          // false esconde do site
  badge: 'Mais vendido',                    // opcional
  salesRank: 100,                           // peso da ordenação "Mais vendidos"
  variants: [ /* ver abaixo */ ],
  personalization: { /* ver abaixo */ },
  createdAt: '2026-01-12',                  // ordenação "Mais recentes"
}
```

**Variações** (`variants`) são as escolhas do cliente. Cada opção pode ter `priceDelta`
(acréscimo ou desconto sobre o preço-base) e `swatch` (cor em hex, que faz o seletor virar
bolinhas coloridas em vez de chips).

```ts
variants: [
  {
    id: 'tamanho',
    name: 'Tamanho',
    required: true,
    options: [{ label: 'P' }, { label: 'M' }, { label: 'GG', priceDelta: 3 }],
  },
]
```

**Personalização** (`personalization`) define quais campos aparecem no formulário:

```ts
personalization: {
  enabled: true,
  nameField: { label: 'Nome para personalização', placeholder: 'Ex.: Maria', maxLength: 40 },
  textField: { label: 'Frase ou texto', placeholder: 'Ex.: ...', maxLength: 160 },
  allowArtUpload: true,
}
```

### 3. Imagens dos produtos

Ficam em **`public/produtos/`**. As atuais são ilustrações SVG próprias (placeholders).
Para trocar por fotos reais, coloque os arquivos nessa pasta e atualize o array `images`
do produto — por exemplo `['/produtos/caneca-branca-1.jpg']`. Use imagens quadradas
(os cards e a galeria usam proporção 1:1).

**Categorias** ficam em `src/data/categories.ts`; **o menu do header** em
`src/config/navigation.ts`.

---

## Como o projeto está organizado

```
src/
  components/   Componentes reutilizáveis (Header, ProductCard, CartDrawer, ...)
  pages/        Uma página por rota
  layouts/      MainLayout: header + conteúdo + rodapé + drawer + toasts
  contexts/     CartContext (sacola) e ToastContext (avisos)
  data/         products.ts, categories.ts e catalog.ts (camada de acesso)
  config/       site.ts (WhatsApp/contato) e navigation.ts (menus)
  types/        Tipos do domínio: Product, Variant, CartItem...
  utils/        format, cart, whatsapp, artStore, seo, analytics
```

### Rotas

| Rota | Página |
| --- | --- |
| `/` | Home |
| `/produtos` | Catálogo completo |
| `/categoria/:slug` | Catálogo filtrado pela categoria |
| `/produto/:slug` | Página do produto |
| `/sacola` | Sacola + resumo do pedido |
| `/como-funciona` | Passo a passo + perguntas frequentes |
| `/contato` | Canais de atendimento |
| `/politica-de-privacidade`, `/termos` | Páginas institucionais |

Rotas inválidas caem no 404; categorias inexistentes redirecionam para `/produtos`.

---

## Decisões que valem conhecer

**A sacola vive no `localStorage`.** Guardamos apenas o `productId` + variações +
personalização (`src/contexts/CartContext.tsx`). O produto é reidratado do catálogo ao
carregar a página — então, se você mudar o preço ou o nome de um produto, quem já tinha o
item na sacola vê o dado novo, e itens de produtos removidos são descartados sozinhos.
A chave é `feproposito:cart:v1`; mude o sufixo se algum dia o formato mudar de forma
incompatível.

**Arte enviada pelo cliente fica só na sessão** (`src/utils/artStore.ts`). Não há backend, e
gravar o arquivo em base64 no `localStorage` estouraria a cota de ~5 MB e derrubaria a sacola
inteira. Por isso o arquivo vive na memória da aba: o nome do arquivo vai na mensagem do
WhatsApp e o cliente é orientado a anexar a arte na conversa.

**Adicionar pelo card usa as opções padrão.** O botão de sacola no `ProductCard` adiciona o
produto com a primeira opção de cada variação. Quem quiser escolher cor, tamanho ou
personalizar abre a página do produto — e cada item na sacola tem um link "Editar" que leva
de volta para lá.

**`/produtos` e `/categoria/:slug` são a mesma página.** A categoria da rota apenas pré-aplica
o filtro, então busca, faixa de preço e ordenação têm uma implementação só. Os filtros ficam
na URL (`?busca=`, `?categoria=`, `?ate=`, `?ordem=`), o que torna a página compartilhável e
faz o botão "voltar" do navegador funcionar como o usuário espera.

---

## Publicando

```bash
npm run build     # gera dist/
```

Publique o conteúdo de `dist/`. Como é uma SPA, **o servidor precisa devolver `index.html`
para qualquer rota** — sem isso, abrir `/produtos` direto pela URL dá 404:

- **Netlify** — crie `public/_redirects` com `/* /index.html 200`
- **Vercel** — funciona por padrão em projetos Vite
- **Apache** — regra de `RewriteRule` para `index.html`
- **Nginx** — `try_files $uri $uri/ /index.html;`

Antes de publicar, ajuste `SITE.url` em `src/config/site.ts` (usado nas tags Open Graph e no
canonical) e o domínio dentro de `public/robots.txt`.

---

## Painel administrativo na Netlify

O painel fica em `/admin` e não aparece nos menus públicos. Ele usa autenticação real da
Netlify Identity; esconder a rota não é usado como mecanismo de segurança.

1. Publique o projeto na Netlify usando o `netlify.toml` incluído.
2. No painel do site, abra **Identity** e selecione **Enable Identity**.
3. Desative cadastros públicos e use usuários por convite.
4. Convide o administrador e atribua a função `admin` em `app_metadata.roles`.
5. Cadastre estas variáveis de ambiente no site:

```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_BASE_URL=https://pub-d3378ac83d9c4975a35281f0d11b94ad.r2.dev
GEMINI_API_KEY=
GEMINI_IMAGE_MODEL=gemini-3.1-flash-image
```

O token do R2 precisa permitir leitura e gravação de objetos no bucket. As credenciais são
usadas somente pela Function de upload e nunca são enviadas ao navegador.

`R2_BUCKET_NAME` é o identificador do bucket, não uma credencial. O `netlify.toml` exclui
somente essa variável da verificação de segredos, pois seu nome aparece nos exemplos.
As chaves de acesso continuam sendo verificadas normalmente.

`GEMINI_API_KEY` é opcional: sem ela, todo o catálogo e o painel continuam funcionando e
somente o botão de geração de cores informa que falta configuração. Cada combinação de
imagem original, cor, modelo e versão da instrução é armazenada em `ai-cache/` no R2; uma
solicitação repetida reutiliza o arquivo existente sem chamar a IA novamente. As variações
geradas permanecem apenas no estado de edição até o administrador revisar e publicar.

O catálogo publicado pelo painel fica no Netlify Blobs. Na ausência da API (por exemplo,
ao executar apenas `npm run dev`), a loja usa automaticamente o catálogo estático do projeto.
Para testar autenticação e Functions localmente, execute o projeto com `netlify dev`.

### Buscar novos modelos no Cloudflare R2

No `/admin`, clique em **Buscar novos modelos**. O projeto lista as imagens do bucket R2,
percorre todas as páginas da listagem e acrescenta os modelos novos ao catálogo em edição
como **rascunhos**. A busca exige uma conta com função `admin` e usa as mesmas variáveis
`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` e
`R2_PUBLIC_BASE_URL` configuradas nas Functions da Netlify. O token R2 precisa permitir
listar/ler objetos do bucket. Nenhuma credencial é enviada ao navegador. Gemini não é usado.

Organize as novas imagens em pastas de produtos:

| Pasta | Categoria sugerida |
| --- | --- |
| `Camisa/`, `Camisas/`, `Camiseta/`, `Camisetas/` | Camisetas |
| `Caneca normal/` | Canecas de porcelana |
| `Caneca pintura/` | Canecas para colorir |
| `Caneca magica/` | Canecas mágicas |
| `Canecas/`, `Copos/`, `Kits/`, `Quadros/`, `Personalizados/` | Categoria correspondente |

As pastas podem estar dentro de outro prefixo, como `catalago-imagens/`. Imagens em
`catalogo-admin/<categoria>/` também são reconhecidas. A busca aceita JPG/JPEG, PNG, WebP,
AVIF, GIF e SVG; ignora arquivos vazios, pastas sem categoria reconhecida e `ai-cache/`.
Uma imagem corresponde a um modelo: use um arquivo por novo produto. O nome inicial vem
do arquivo; a busca não interpreta a estampa nem agrupa fotos de um mesmo modelo.

Produtos existentes são preservados. A chave do objeto e as imagens já utilizadas no
catálogo (inclusive prévias de cores) evitam duplicatas em buscas futuras. Arquivos
renomeados no R2 são novas chaves; revise para evitar cadastrar a mesma estampa duas vezes.

Após importar, confira nome, categoria, descrição e preço. Os novos produtos começam sem
variações de tamanho, tecido ou cor; a imagem do arquivo é o modelo oferecido. Os preços começam em
zero para revisão e um produto importado precisa de preço maior que zero para ser publicado.
O botão **Publicar** salva o catálogo inteiro, incluindo rascunhos; somente produtos com
status **Publicado** ficam visíveis na loja. Se sair antes de salvar, a importação é perdida.
A busca não envia, remove ou altera arquivos no R2 e não publica produtos automaticamente.
O catálogo suporta até 5.000 produtos; a busca é limitada a 50.000 arquivos por execução e
não aplica resultados parciais se uma página falhar ou um limite for excedido.

Para executar os testes da importação com Node.js 24 (sem instalar ferramentas extras):

```bash
node --test tests/r2-import.test.mjs
npm run build
```

---

## O que ficou de fora de propósito

Nada disso existe nesta versão, e a arquitetura foi mantida simples por isso:

- Login, cadastro, senha, área do cliente
- Pagamento online (cartão, Pix, gateways)
- Cálculo de frete — o resumo mostra "calculado posteriormente"
- Banco de dados ou API
- Painel administrativo
- Analytics configurado

### Preparado para depois

- **API/banco:** todo o app lê produtos por `src/data/catalog.ts`. Reescreva as funções desse
  arquivo (tornando-as assíncronas) e nenhum componente precisa saber da mudança.
- **Analytics:** os pontos de medição já estão espalhados pelo código chamando `track()` em
  `src/utils/analytics.ts` — `add_to_cart`, `begin_whatsapp_quote`, `search`, etc. Basta
  implementar o encaminhamento para o GA4 ou o Meta Pixel dentro dessa função.
- **Painel admin:** os dados já estão separados da interface (`src/data/`), então um `/admin`
  futuro passa a escrever na mesma camada que o site lê.
- **Sitemap:** gere a partir de `PRODUCTS` e `CATEGORIES` quando o domínio estiver definido;
  o `robots.txt` já aponta para `/sitemap.xml`.
