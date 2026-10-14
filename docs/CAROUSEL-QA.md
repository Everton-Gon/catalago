# Banners do carrossel — estado atual

Implementação local. Não publicada no Netlify. O cabeçalho, a logo real, os produtos, os filtros, a sacola e a área administrativa foram preservados.

## Banners ativos

O carrossel inicia e reinicia sempre em Gospel. A sequência atualmente disponível é Gospel → Filmes e séries → Animes e desenhos → Games → Presentes personalizados → Modelos de caneca. Todos os seis slides estão disponíveis.

| Tema | Arquivo individual | Dimensões | Tamanho |
| --- | --- | --- | --- |
| Gospel | `C:/Users/egoncalves/catalago/public/brand/banner-fe-proposito-wide.webp` | 2078 × 757 | 179.952 bytes |
| Animes e desenhos | `C:/Users/egoncalves/catalago/public/brand/banner-animes-desenhos.webp` | 2078 × 757 | 180.556 bytes |
| Games | `C:/Users/egoncalves/catalago/public/brand/banner-games.webp` | 2079 × 756 | 171.346 bytes |
| Presentes personalizados | `C:/Users/egoncalves/catalago/public/brand/banner-presentes.webp` | 2078 × 757 | 158.264 bytes |

Os três novos arquivos foram criados com a ferramenta integrada `image_gen`, usando as capturas enviadas somente como referências visuais. Não são capturas do site nem ampliações das miniaturas. Os PNGs de origem permanecem na pasta padrão de imagens geradas; as versões finais WebP estão no projeto. Os prompts completos e o resultado de cada tema estão em `docs/BANNER-PROMPTS.json`.

- Animes: camisa Dragon Ball Super, caneca One Piece e caneca Demon Slayer; cada produto com uma única franquia.
- Games: camisa Minecraft, caneca Call of Duty e caneca Street Fighter; cada produto com uma única franquia.
- Presentes: caneca personalizada com casal fictício, caixa com laço e cartão neutro, sem informações comerciais inventadas.
- Gospel: cenário aprovado preservado como primeiro slide, com textos e botões em HTML.

## Filmes e séries — concluído com arquivo fornecido

O usuário forneceu duas artes originais de 3584 × 1184 px. Foi selecionada `Gemini_Generated_Image_ag2kdzag2kdzag2k.jpg`, com camisa Harry Potter e duas canecas (Vingadores: Doomsday e Duna). O arquivo foi apenas otimizado para `public/brand/banner-filmes-series.webp`, qualidade 92, 319.194 bytes. Não houve nova geração de imagem.

Como a arte contém uma frase gravada à esquerda, o componente enquadra apenas os 53% à direita mediante uma janela CSS proporcional, preservando as estampas e os produtos presentes nessa região. A frase gravada fica fora da área visível; título, descrição e botões continuam em HTML. O enquadramento mantém a proporção original em desktop e celular. O fundo deste slide é escuro e os controles usam o roxo da marca. Ambos os botões abrem o WhatsApp real, pois não existe coleção específica de filmes cadastrada. Não há mais imagens pendentes.

## Modelos de caneca — composição temática revisada

O sexto slide deixou de ser uma galeria de fotos sem estampa. Usa agora uma única cena fotográfica com três modelos personalizados: alça azul de coração e interior azul com One Piece; caneca rosa com borda dourada e castelo de fantasia; caneca branca com interior vermelho e colher vermelha com Ryu de Street Fighter. Cada produto mantém um único tema. As fotografias fornecidas orientaram a geometria dos modelos. Produtos e preços do catálogo não foram alterados.

Arquivo: public/brand/banner-canecas-personalizadas.webp, 2079 × 756, 247.262 bytes, WebP qualidade 92. Criado pela ferramenta integrada image_gen. Prompt completo e resultado da edição de Filmes estão em docs/BANNER-REVISION-PROMPTS.json. A arte gerada é uma apresentação visual de personalização; não cadastra disponibilidade ou estoque.

O banner de Filmes usa a arte original fornecida, com janela proporcional para excluir a frase gravada e máscaras de transição lateral, superior e inferior no desktop. A foto foi ampliada na composição do slide para reduzir a aparência de painel separado. No celular, preserva a proporção sem máscaras. A tentativa de remover a frase pela ferramenta de imagem foi rejeitada por moderation_blocked (categoria other, sem motivo específico); nenhum arquivo novo foi produzido para Filmes.

O botão Explorar canecas abre /categoria/canecas; Pedir pelo WhatsApp usa o número real existente e mensagem sobre os três modelos.

## Comportamento e aparência

- Troca automática a cada seis segundos e retorno ao primeiro slide.
- Setas, indicadores e pausar/retomar; navegação por teclado.
- Pausa com ponteiro, foco, toque e aba oculta; movimento reduzido inicia sem reprodução automática.
- Swipe horizontal no celular, mantendo rolagem vertical.
- Altura reservada pela grade de slides, sem deslocar o conteúdo abaixo.
- Texto claro nos banners escuros e ações no roxo da marca.
- Imagens enquadradas para manter camisas, estampas e alças no celular.
- Apenas o primeiro arquivo carrega com prioridade alta; demais usam lazy e prioridade baixa.
- Textos, descrições, imagens, alternativas e destinos estão definidos separadamente por slide.
- Animes e Games abrem o WhatsApp real para consulta, pois não há coleções específicas cadastradas. Presentes abre Kits ou atendimento; Gospel abre catálogo ou atendimento.

## Validações

- Build TypeScript e Vite aprovado.
- `tests/carousel.e2e.mjs`: seis slides reais, sem fixtures: ordem inicial, recarga em Gospel, intervalo de seis segundos, ciclo completo, setas, indicadores, pausa/retomada, mouse, teclado, movimento reduzido e swipe real.
- `tests/hero-banner.e2e.mjs`: Gospel validado em 320, 390, 768, 1024, 1440 e 1920 px.
- `tests/banners-layout.e2e.mjs`: os seis banners em seis larguras; sem rolagem horizontal, com texto antes da imagem no celular e conteúdo abaixo na mesma posição entre slides.
- `tests/mug-banner.e2e.mjs`: uma cena temática carregada, alternativa acessível e destinos reais, nas seis larguras de 320 a 1920 px.
- Filmes: geometria do enquadramento de 47%, proporção sem deformação, texto HTML e destinos reais verificados nas seis larguras.
- Revisão visual das capturas desktop e mobile dos novos temas. Nenhum erro JavaScript de página registrado no teste funcional.

Os testes E2E usam Playwright e aceitam `PLAYWRIGHT_MODULE`, `BROWSER_CHANNEL` e `STOREFRONT_URL`. As imagens criadas não alteraram o cadastro de produtos, preços ou estoque.
