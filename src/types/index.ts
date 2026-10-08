/**
 * Modelo de dados da loja.
 *
 * Nesta primeira versão os produtos vêm de `src/data/products.ts`, mas todo o
 * app consome os dados exclusivamente através de `src/data/catalog.ts`.
 * Para migrar para uma API/banco no futuro basta reimplementar aquele módulo:
 * nenhum componente conhece a origem dos dados.
 */

export type CategorySlug =
  | 'canecas'
  | 'camisetas'
  | 'copos'
  | 'kits'
  | 'quadros'
  | 'personalizados'

export interface Category {
  slug: CategorySlug
  name: string
  /** Rótulo curto usado no menu do header. */
  shortName: string
  description: string
  emoji: string
  image: string
}

/** Uma dimensão de escolha do produto: "Cor", "Tamanho", "Modelo"... */
export interface Variant {
  /** Identificador estável usado como chave em CartItem.selectedVariants. */
  id: string
  name: string
  options: VariantOption[]
  required?: boolean
}

export interface VariantOption {
  label: string
  /** Identificador estável para filtros e integrações. */
  value?: string
  /** Preço-base absoluto quando esta opção define o material do produto. */
  price?: number
  /** Preço anterior correspondente à opção em promoção. */
  oldPrice?: number
  /** Opção disponível para orçamento, mas ainda sem preço cadastrado. */
  priceOnRequest?: boolean
  /** Acréscimo (em reais) sobre o preço-base quando esta opção é escolhida. */
  priceDelta?: number
  /** Cor em hex para renderizar a bolinha do seletor (apenas variações de cor). */
  swatch?: string
}

/** Quais campos de personalização o produto aceita. */
export interface PersonalizationConfig {
  enabled: boolean
  /** Campo "Nome para personalização". */
  nameField?: { label: string; placeholder: string; maxLength?: number }
  /** Campo "Texto / frase". */
  textField?: { label: string; placeholder: string; maxLength?: number }
}

export type ShirtFabric = 'algodao' | 'poliester'
export type MugType = 'porcelana' | 'colorir' | 'magica'

export interface ProductColor {
  id: string
  name: string
  hex: string
  /** Imagem real da mesma estampa nesta cor; ausente mantém a foto original. */
  previewImage?: string
  /** Cor do check para manter contraste sobre o swatch. */
  checkContrast?: 'light' | 'dark'
}

export interface Product {
  id: string
  /** Chave original no R2, preservada para evitar importações duplicadas. */
  r2ObjectKey?: string
  name: string
  slug: string
  /** Frase curta usada no card. */
  shortDescription: string
  description: string
  category: CategorySlug
  /** Referência neutra da estampa quando o arquivo não informa um tema. */
  printName?: string
  /** Tipo comercial da caneca, usado pelo filtro da categoria. */
  mugType?: MugType
  images: string[]
  /** Cores alternativas disponíveis para seleção visual. */
  colors?: ProductColor[]
  /** Preço-base "a partir de", em reais. */
  price: number
  /** Preço anterior, quando o produto está em promoção. */
  oldPrice?: number
  /** Exibe preços empilhados e omite o selo automático de promoção. */
  promotionPresentation?: 'stacked-no-badge'
  featured: boolean
  available: boolean
  /** Estado editorial controlado pelo painel administrativo. */
  status?: 'draft' | 'published'
  /** Quantidade disponível; ausente significa estoque não controlado. */
  stock?: number
  /** Posição manual no catálogo administrativo. */
  order?: number
  /** Etiqueta opcional exibida sobre a imagem ("Mais vendido", "Novo"...). */
  badge?: string
  /** Peso para a ordenação "Mais vendidos". */
  salesRank: number
  variants: Variant[]
  personalization: PersonalizationConfig
  createdAt: string
}

/** Dados de personalização preenchidos pelo cliente. */
export interface Personalization {
  name?: string
  text?: string
}

export interface CartItem {
  /** Chave única: produto + combinação de variações + personalização. */
  id: string
  product: Product
  selectedVariants: Record<string, string>
  quantity: number
  personalization: Personalization
  notes: string
  /** Preço unitário já com os acréscimos das variações escolhidas. */
  unitPrice: number
}

export type SortOption =
  | 'recentes'
  | 'menor-preco'
  | 'maior-preco'
  | 'mais-vendidos'
  | 'nome'

export interface CatalogFilters {
  query: string
  category: CategorySlug | 'todas'
  shirtFabric: ShirtFabric | 'todos'
  mugType: MugType | 'todos'
  maxPrice: number | null
  sort: SortOption
}










