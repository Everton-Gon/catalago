import { useCallback, useMemo } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { PackageSearch } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import ProductFilters from '@/components/ProductFilters'
import ProductGrid from '@/components/ProductGrid'
import SearchBar from '@/components/SearchBar'
import { filterProducts, getMaxPrice } from '@/data/catalog'
import { getCategory } from '@/data/categories'
import { useSeo } from '@/utils/seo'
import type { CatalogFilters, CategorySlug, MugType, ShirtFabric, SortOption } from '@/types'
import { useCatalog } from '@/contexts/CatalogContext'

const SHIRT_FABRICS: ShirtFabric[] = ['algodao', 'poliester']
const MUG_TYPES: MugType[] = ['porcelana', 'colorir', 'magica']

const SORT_KEYS: SortOption[] = [
  'recentes',
  'menor-preco',
  'maior-preco',
  'mais-vendidos',
  'nome',
]

/**
 * Serve tanto `/produtos` quanto `/categoria/:slug`.
 *
 * A categoria da rota apenas pré-aplica o filtro — assim busca, faixa de preço
 * e ordenação têm uma implementação só, em vez de uma por categoria.
 * Os filtros ficam na URL, então a página é compartilhável e o botão voltar
 * do navegador funciona como o usuário espera.
 */
export default function Catalog() {
  const { products: catalogProducts } = useCatalog()
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  const routeCategory = slug ? getCategory(slug) : undefined
  const isCategoryRoute = Boolean(slug)

  const filters = useMemo<CatalogFilters>(() => {
    const paramCategory = searchParams.get('categoria')
    const rawSort = searchParams.get('ordem') as SortOption | null
    const rawMax = Number(searchParams.get('ate'))
    const rawShirtFabric = searchParams.get('tecido') as ShirtFabric | null
    const rawMugType = searchParams.get('tipo') as MugType | null

    return {
      query: searchParams.get('busca') ?? '',
      category: routeCategory
        ? routeCategory.slug
        : paramCategory && getCategory(paramCategory)
          ? (paramCategory as CategorySlug)
          : 'todas',
      shirtFabric:
        rawShirtFabric && SHIRT_FABRICS.includes(rawShirtFabric) ? rawShirtFabric : 'todos',
      mugType: rawMugType && MUG_TYPES.includes(rawMugType) ? rawMugType : 'todos',
      maxPrice: Number.isFinite(rawMax) && rawMax > 0 ? rawMax : null,
      sort: rawSort && SORT_KEYS.includes(rawSort) ? rawSort : 'recentes',
    }
  }, [searchParams, routeCategory])

  const updateFilters = useCallback(
    (patch: Partial<CatalogFilters>) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          const apply = (key: string, value: string | null) => {
            if (value === null || value === '') next.delete(key)
            else next.set(key, value)
          }

          if ('query' in patch) apply('busca', patch.query ?? null)
          if ('category' in patch) {
            apply('categoria', patch.category === 'todas' ? null : (patch.category ?? null))
          }
          if ('shirtFabric' in patch) {
            apply(
              'tecido',
              patch.shirtFabric === 'todos' ? null : (patch.shirtFabric ?? null),
            )
          }
          if ('mugType' in patch) {
            apply('tipo', patch.mugType === 'todos' ? null : (patch.mugType ?? null))
          }
          if ('maxPrice' in patch) {
            apply('ate', patch.maxPrice === null ? null : String(patch.maxPrice))
          }
          if ('sort' in patch) apply('ordem', patch.sort === 'recentes' ? null : (patch.sort ?? null))

          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  const products = useMemo(
    () => filterProducts(filters, catalogProducts),
    [filters, catalogProducts],
  )
  const maxPrice = useMemo(() => getMaxPrice(catalogProducts), [catalogProducts])

  const title = routeCategory ? routeCategory.name : 'Todos os produtos'
  const description = routeCategory
    ? routeCategory.description
    : 'Canecas, camisetas, copos, kits e muito mais para personalizar do seu jeito.'

  useSeo({
    title: routeCategory ? routeCategory.name : 'Todos os produtos',
    description,
  })

  // Rota de categoria inexistente: volta para o catálogo completo.
  if (isCategoryRoute && !routeCategory) {
    return <Navigate to="/produtos" replace />
  }

  return (
    <div className="container-page py-6 sm:py-8 lg:py-10">
      <Breadcrumbs
        items={
          routeCategory
            ? [{ label: 'Produtos', to: '/produtos' }, { label: routeCategory.shortName }]
            : [{ label: 'Produtos' }]
        }
      />

      <header
        className={`rounded-card px-5 py-8 sm:px-8 sm:py-10 ${
          routeCategory
            ? 'bg-gradient-to-br from-brand-800 to-brand-950 text-white'
            : 'bg-white shadow-soft'
        }`}
      >
        {routeCategory && (
          <span className="text-4xl sm:text-5xl" aria-hidden="true">
            {routeCategory.emoji}
          </span>
        )}
        <h1
          className={`font-display text-2xl font-extrabold sm:text-3xl lg:text-4xl ${
            routeCategory ? 'mt-3 text-white' : ''
          }`}
        >
          {title}
        </h1>
        <p
          className={`mt-3 max-w-2xl text-sm leading-relaxed sm:text-base ${
            routeCategory ? 'text-brand-100' : 'text-ink-500'
          }`}
        >
          {description}
        </p>
      </header>

      <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[17rem_1fr] lg:gap-8">
        <ProductFilters
          filters={filters}
          onChange={updateFilters}
          onReset={resetFilters}
          maxPrice={maxPrice}
          resultCount={products.length}
          showCategoryFilter={!isCategoryRoute}
          showShirtFabricFilter={routeCategory?.slug === 'camisetas'}
          showMugTypeFilter={routeCategory?.slug === 'canecas'}
        />

        <div className="mt-4 min-w-0 lg:mt-0">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchBar
              className="w-full sm:max-w-sm"
              defaultValue={filters.query}
              onSearch={(query) => updateFilters({ query })}
              placeholder={
                routeCategory ? `Buscar em ${routeCategory.shortName}...` : 'Buscar produtos...'
              }
            />
            <p className="text-sm text-ink-500" aria-live="polite">
              {products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </p>
          </div>

          {products.length > 0 ? (
            <ProductGrid products={products} eagerCount={4} />
          ) : (
            <div className="rounded-card border border-dashed border-ink-300 bg-white px-6 py-16 text-center">
              <PackageSearch className="mx-auto size-12 text-ink-300" aria-hidden="true" />
              <h2 className="mt-4 font-display text-lg font-bold text-ink-900">
                Nenhum produto encontrado
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
                Tente outra palavra ou ajuste os filtros. Se você procura algo específico, fale
                com a gente pelo WhatsApp — personalizamos sob medida.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}





