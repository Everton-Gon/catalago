import { useCallback, useMemo, useReducer } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { PackageSearch, X } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import ProductFilters from '@/components/ProductFilters'
import ProductGrid from '@/components/ProductGrid'
import SearchBar from '@/components/SearchBar'
import { filterProducts, getAllProducts, getPriceBounds, SORT_LABELS } from '@/data/catalog'
import { CATEGORIES, getCategory } from '@/data/categories'
import { useSeo } from '@/utils/seo'
import type { CatalogFilters, CategorySlug, MugType, ShirtFabric, SortOption } from '@/types'
import { useCatalog } from '@/contexts/CatalogContext'
import { useStorefrontContent } from '@/contexts/StorefrontContext'
import { formatPrice } from '@/utils/format'

const SHIRT_FABRICS: ShirtFabric[] = ['algodao', 'poliester']
const MUG_TYPES: MugType[] = ['porcelana', 'colorir', 'magica']
const SORT_KEYS: SortOption[] = ['recentes', 'menor-preco', 'maior-preco', 'nome']

export default function Catalog() {
  const { products: allCatalogProducts } = useCatalog()
  const { slug, collectionSlug } = useParams<{ slug: string; collectionSlug: string }>()
  const content = useStorefrontContent()
  const collection = content.collections.find(c=>c.slug===collectionSlug && c.active)
  const catalogProducts = useMemo(()=>collection ? allCatalogProducts.filter(p=>p.collections?.includes(collection.id)) : allCatalogProducts,[allCatalogProducts,collection])
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [filterRevision, refreshFilters] = useReducer(value => value + 1, 0)
  const routeCategory = slug ? getCategory(slug) : undefined
  const priceBounds = useMemo(() => getPriceBounds(catalogProducts), [catalogProducts])

  const categoriesFromParams = useCallback((params: URLSearchParams): CategorySlug[] => {
    if (!params.has('categoria')) return routeCategory && window.location.pathname === `/categoria/${routeCategory.slug}` ? [routeCategory.slug] : []
    return [...new Set(params.getAll('categoria').filter(value => getCategory(value)))] as CategorySlug[]
  }, [routeCategory])

  const filters = useMemo<CatalogFilters>(() => {
    const params = new URLSearchParams(window.location.search)
    const rawSort = params.get('ordem') as SortOption | null
    const rawFabric = params.get('tecido') as ShirtFabric | null
    const rawType = params.get('tipo') as MugType | null
    const readPrice = (key: string) => {
      if (!params.has(key) || params.get(key)?.trim() === '') return null
      const value = Number(params.get(key))
      return Number.isFinite(value) && value >= 0 ? Math.min(priceBounds.max, Math.max(priceBounds.min, value)) : null
    }
    const min = readPrice('de')
    const max = readPrice('ate')
    return {
      query: params.get('busca') ?? '',
      categories: categoriesFromParams(params),
      shirtFabric: rawFabric && SHIRT_FABRICS.includes(rawFabric) ? rawFabric : 'todos',
      shirtModel: params.get('modelo') ?? 'todos',
      mugType: rawType && MUG_TYPES.includes(rawType) ? rawType : 'todos',
      minPrice: min === null || min <= priceBounds.min ? null : Math.min(min, max ?? priceBounds.max),
      maxPrice: max === null || max >= priceBounds.max ? null : max,
      sort: rawSort && SORT_KEYS.includes(rawSort) ? rawSort : 'recentes',
    }
  }, [searchParams, priceBounds, categoriesFromParams, filterRevision])

  const updateFilters = useCallback((patch: Partial<CatalogFilters>) => {
    // Successive choices must build on the latest URL, even before a router render.
    const next = new URLSearchParams(window.location.search)
    const apply = (key: string, value: string | null | undefined) => {
      if (value === null || value === undefined || value === '') next.delete(key)
      else next.set(key, value)
    }
    if ('query' in patch) apply('busca', patch.query)
    if ('categories' in patch) {
      next.delete('categoria')
      patch.categories?.forEach(category => next.append('categoria', category))
    }
    if ('shirtFabric' in patch) apply('tecido', patch.shirtFabric === 'todos' ? null : patch.shirtFabric)
    if ('shirtModel' in patch) apply('modelo', patch.shirtModel === 'todos' ? null : patch.shirtModel)
    if ('mugType' in patch) apply('tipo', patch.mugType === 'todos' ? null : patch.mugType)
    if ('minPrice' in patch) apply('de', patch.minPrice == null ? null : String(patch.minPrice))
    if ('maxPrice' in patch) apply('ate', patch.maxPrice == null ? null : String(patch.maxPrice))
    if ('sort' in patch) apply('ordem', patch.sort === 'recentes' ? null : patch.sort)
    if ('categories' in patch && routeCategory) navigate({ pathname: '/produtos', search: next.toString() }, { replace: true })
    else setSearchParams(next, { replace: true })
    refreshFilters()
  }, [setSearchParams, navigate, routeCategory])

  const toggleCategory = useCallback((category: CategorySlug, checked: boolean) => {
    const current = categoriesFromParams(new URLSearchParams(window.location.search))
    updateFilters({ categories: checked ? [...new Set([...current, category])] : current.filter(value => value !== category) })
  }, [categoriesFromParams, updateFilters])

  const resetFilters = useCallback(() => {
    const next = new URLSearchParams()
    if (filters.sort !== 'recentes') next.set('ordem', filters.sort)
    if (routeCategory) navigate({ pathname: '/produtos', search: next.toString() }, { replace: true })
    else setSearchParams(next, { replace: true })
    refreshFilters()
  }, [setSearchParams, navigate, routeCategory, filters.sort])

  const products = useMemo(() => filterProducts(filters, catalogProducts), [filters, catalogProducts])
  const published = useMemo(() => getAllProducts(catalogProducts), [catalogProducts])
  const categoryCounts = useMemo(() => Object.fromEntries(CATEGORIES.map(category => [category.slug, published.filter(product => product.category === category.slug).length])) as Record<CategorySlug, number>, [published])
  const shirtModels = useMemo(() => Array.from(new Map(published.filter(product => product.category === 'camisetas').flatMap(product => product.variants.filter(variant => variant.id === 'modelo').flatMap(variant => variant.options.map(option => [option.value ?? option.label, { value: option.value ?? option.label, label: option.label }] as const)))).values()), [published])
  const activeFilters: { key: string; label: string; clear: () => void }[] = [
    ...(filters.query ? [{ key: 'query', label: `Busca: ${filters.query}`, clear: () => updateFilters({ query: '' }) }] : []),
    ...filters.categories.map(category => ({ key: category, label: getCategory(category)!.shortName, clear: () => toggleCategory(category, false) })),
    ...(filters.minPrice !== null || filters.maxPrice !== null ? [{ key: 'price', label: `${formatPrice(filters.minPrice ?? priceBounds.min)} a ${formatPrice(filters.maxPrice ?? priceBounds.max)}`, clear: () => updateFilters({ minPrice: null, maxPrice: null }) }] : []),
    ...(filters.shirtFabric !== 'todos' ? [{ key: 'fabric', label: filters.shirtFabric === 'algodao' ? 'Algodão' : 'Poliéster', clear: () => updateFilters({ shirtFabric: 'todos' }) }] : []),
    ...(filters.shirtModel && filters.shirtModel !== 'todos' ? [{ key: 'model', label: shirtModels.find(model => model.value === filters.shirtModel)?.label ?? filters.shirtModel, clear: () => updateFilters({ shirtModel: 'todos' }) }] : []),
    ...(filters.mugType !== 'todos' ? [{ key: 'mug', label: { porcelana: 'Porcelana', colorir: 'Para colorir', magica: 'Mágica' }[filters.mugType], clear: () => updateFilters({ mugType: 'todos' }) }] : []),
  ]

  const title = collection?.name ?? routeCategory?.name ?? 'Todos os produtos'
  const description = collection?.description || routeCategory?.description || 'Canecas, camisetas, copos, kits e muito mais para personalizar do seu jeito.'
  useSeo({ title, description })
  if (slug && !routeCategory) return <Navigate to="/produtos" replace />
  if (collectionSlug && !collection) return <Navigate to="/produtos" replace />

  return <div className="container-page py-6 sm:py-8 lg:py-10">
    <Breadcrumbs items={routeCategory ? [{ label: 'Produtos', to: '/produtos' }, { label: routeCategory.shortName }] : [{ label: 'Produtos' }]} />
    <header className="catalog-heading rounded-card border border-ink-200 bg-[#f1e9df] px-5 py-8 sm:px-8 sm:py-10">
      <p className="eyebrow">Fé &amp; Propósito · Catálogo</p><h1 className="mt-3 font-display text-2xl text-ink-900 sm:text-3xl lg:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-600 sm:text-base">{description}</p>
    </header>
    <div className="catalog-layout">
      <ProductFilters filters={filters} onChange={updateFilters} onToggleCategory={toggleCategory} onReset={resetFilters} priceBounds={priceBounds} categoryCounts={categoryCounts} resultCount={products.length} activeCount={activeFilters.length} shirtModels={shirtModels} />
      <div className="catalog-results">
        <SearchBar className="catalog-search" defaultValue={filters.query} onSearch={query => updateFilters({ query })} placeholder="Buscar produtos..." />
        <div className="catalog-toolbar">
          <p className="catalog-result-count" role="status">{products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}</p>
          <div className="catalog-sort"><label htmlFor="catalog-sort">Ordenar por</label><select id="catalog-sort" value={filters.sort} onChange={event => updateFilters({ sort: event.target.value as SortOption })}>{SORT_KEYS.map(key => <option key={key} value={key}>{SORT_LABELS[key]}</option>)}</select></div>
        </div>
        {activeFilters.length > 0 && <div className="active-filter-tags" aria-label="Filtros selecionados">{activeFilters.map(filter => <button key={filter.key} type="button" onClick={filter.clear} aria-label={`Remover filtro ${filter.label}`}>{filter.label}<X size={14} aria-hidden="true" /></button>)}</div>}
        {products.length > 0 ? <ProductGrid products={products} eagerCount={4} /> : <div className="rounded-card border border-dashed border-ink-300 bg-white px-6 py-16 text-center"><PackageSearch className="mx-auto size-12 text-ink-400" aria-hidden="true" /><h2 className="mt-4 text-lg text-ink-900">Nenhum produto encontrado</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-500">Tente outra palavra ou ajuste as categorias e a faixa de preço.</p><button type="button" onClick={resetFilters} className="store-button mt-6">Limpar filtros</button></div>}
      </div>
    </div>
  </div>
}
