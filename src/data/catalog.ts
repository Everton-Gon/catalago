import { PRODUCTS } from './products'
import type { CatalogFilters, Product, SortOption } from '@/types'

/**
 * Camada de acesso ao catálogo.
 *
 * Toda a aplicação lê produtos daqui — nunca importando `products.ts`
 * diretamente. Quando existir uma API/banco, basta reescrever as funções
 * abaixo (tornando-as assíncronas e adicionando estados de carregamento nas
 * páginas). Nenhum componente precisa saber de onde vêm os dados.
 */

export function getAllProducts(source: Product[] = PRODUCTS): Product[] {
  return source
    .filter((product) => product.available && product.status !== 'draft')
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
}

export function getProductBySlug(slug: string, source: Product[] = PRODUCTS): Product | undefined {
  return source.find((product) => product.slug === slug && product.status !== 'draft')
}

export function getProductById(id: string, source: Product[] = PRODUCTS): Product | undefined {
  return source.find((product) => product.id === id && product.status !== 'draft')
}

export function getFeaturedProducts(limit = 8, source: Product[] = PRODUCTS): Product[] {
  return getAllProducts(source)
    .filter((p) => p.featured)
    .sort((a, b) => b.salesRank - a.salesRank)
    .slice(0, limit)
}

export function getProductsByCategory(category: string, source: Product[] = PRODUCTS): Product[] {
  return getAllProducts(source).filter((p) => p.category === category)
}

/** Produtos da mesma categoria, excluindo o próprio produto. */
export function getRelatedProducts(
  product: Product,
  limit = 4,
  source: Product[] = PRODUCTS,
): Product[] {
  const sameCategory = getProductsByCategory(product.category, source).filter(
    (p) => p.id !== product.id,
  )
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit)

  const others = getAllProducts(source).filter(
    (p) => p.id !== product.id && p.category !== product.category,
  )
  return [...sameCategory, ...others].slice(0, limit)
}

/** Maior preço-base do catálogo — usado para o range do filtro de preço. */
export function getMaxPrice(source: Product[] = PRODUCTS): number {
  const prices = getAllProducts(source).map((product) => product.price)
  return prices.length ? Math.ceil(Math.max(...prices) / 10) * 10 : 0
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

/** Busca por nome, descrição curta e categoria, ignorando acentos e caixa. */
export function searchProducts(products: Product[], query: string): Product[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return products

  return products.filter((product) => {
    const haystack = normalize(
      [
        product.name,
        product.shortDescription,
        product.description,
        product.category,
        product.printName ?? '',
        product.mugType ?? '',
        product.variants.flatMap((variant) =>
          variant.options.map((option) => option.label),
        ).join(' '),
      ].join(' '),
    )
    return terms.every((term) => haystack.includes(term))
  })
}

const SORTERS: Record<SortOption, (a: Product, b: Product) => number> = {
  recentes: (a, b) => b.createdAt.localeCompare(a.createdAt),
  'menor-preco': (a, b) => a.price - b.price,
  'maior-preco': (a, b) => b.price - a.price,
  'mais-vendidos': (a, b) => b.salesRank - a.salesRank,
  nome: (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
}

export const SORT_LABELS: Record<SortOption, string> = {
  recentes: 'Mais recentes',
  'menor-preco': 'Menor preço',
  'maior-preco': 'Maior preço',
  'mais-vendidos': 'Mais vendidos',
  nome: 'Nome A-Z',
}

/** Aplica busca + filtros + ordenação. Usado pelo catálogo e pelas categorias. */
export function filterProducts(
  filters: CatalogFilters,
  source: Product[] = PRODUCTS,
): Product[] {
  let result = getAllProducts(source)

  if (filters.category !== 'todas') {
    result = result.filter((p) => p.category === filters.category)
  }
  if (filters.shirtFabric !== 'todos') {
    result = result.filter((product) =>
      product.variants.some(
        (variant) =>
          variant.id === 'tecido' &&
          variant.options.some((option) => option.value === filters.shirtFabric),
      ),
    )
  }
  if (filters.mugType !== 'todos') {
    result = result.filter(
      (product) => product.category === 'canecas' && product.mugType === filters.mugType,
    )
  }
  if (filters.maxPrice !== null) {
    result = result.filter((product) => {
      if (product.category === 'camisetas' && filters.shirtFabric !== 'todos') {
        const fabricOption = product.variants
          .find((variant) => variant.id === 'tecido')
          ?.options.find((option) => option.value === filters.shirtFabric)
        return fabricOption?.price !== undefined && fabricOption.price <= filters.maxPrice!
      }
      return product.price <= filters.maxPrice!
    })
  }
  result = searchProducts(result, filters.query)

  return [...result].sort(SORTERS[filters.sort])
}

/** Sugestões rápidas para o autocomplete da barra de busca. */
export function suggestProducts(
  query: string,
  limit = 5,
  source: Product[] = PRODUCTS,
): Product[] {
  if (normalize(query).length < 2) return []
  return searchProducts(getAllProducts(source), query).slice(0, limit)
}





