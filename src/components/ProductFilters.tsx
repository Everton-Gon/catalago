import { useId, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { CATEGORIES } from '@/data/categories'
import { SORT_LABELS } from '@/data/catalog'
import { formatPrice } from '@/utils/format'
import type { CatalogFilters, CategorySlug, MugType, ShirtFabric, SortOption } from '@/types'

interface ProductFiltersProps {
  filters: CatalogFilters
  onChange: (patch: Partial<CatalogFilters>) => void
  onReset: () => void
  maxPrice: number
  resultCount: number
  /** Nas páginas de categoria o filtro de categoria some (já está fixo). */
  showCategoryFilter?: boolean
  /** Mostra o filtro de tecido apenas na categoria Camisetas. */
  showShirtFabricFilter?: boolean
  /** Mostra o filtro de tipo apenas na categoria Canecas. */
  showMugTypeFilter?: boolean
}

export default function ProductFilters({
  filters,
  onChange,
  onReset,
  maxPrice,
  resultCount,
  showCategoryFilter = true,
  showShirtFabricFilter = false,
  showMugTypeFilter = false,
}: ProductFiltersProps) {
  const [isOpen, setOpen] = useState(false)
  const fieldId = useId()

  const hasActiveFilters =
    filters.query !== '' ||
    (showCategoryFilter && filters.category !== 'todas') ||
    (showShirtFabricFilter && filters.shirtFabric !== 'todos') ||
    (showMugTypeFilter && filters.mugType !== 'todos') ||
    filters.maxPrice !== null ||
    filters.sort !== 'recentes'

  const priceValue = filters.maxPrice ?? maxPrice

  const panel = (
    <div className="space-y-6">
      {showCategoryFilter && (
        <div>
          <h3 className="mb-2.5 text-sm font-semibold text-ink-900">Categoria</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onChange({ category: 'todas' })}
              aria-pressed={filters.category === 'todas'}
              className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                filters.category === 'todas'
                  ? 'border-brand-600 bg-brand-50 font-medium text-brand-800'
                  : 'border-ink-200 bg-white text-ink-600 hover:border-ink-400'
              }`}
            >
              Todas
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => onChange({ category: category.slug as CategorySlug })}
                aria-pressed={filters.category === category.slug}
                className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                  filters.category === category.slug
                    ? 'border-brand-600 bg-brand-50 font-medium text-brand-800'
                    : 'border-ink-200 bg-white text-ink-600 hover:border-ink-400'
                }`}
              >
                <span className="mr-1" aria-hidden="true">
                  {category.emoji}
                </span>
                {category.shortName}
              </button>
            ))}
          </div>
        </div>
      )}

      {showShirtFabricFilter && (
        <div>
          <h3 className="mb-2.5 text-sm font-semibold text-ink-900">Tecido</h3>
          <div className="flex flex-wrap gap-2">
            {([
              ['todos', 'Todos'],
              ['algodao', '100% Algodão'],
              ['poliester', 'Poliéster'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ shirtFabric: value as ShirtFabric | 'todos' })}
                aria-pressed={filters.shirtFabric === value}
                className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                  filters.shirtFabric === value
                    ? 'border-brand-600 bg-brand-50 font-medium text-brand-800'
                    : 'border-ink-200 bg-white text-ink-600 hover:border-ink-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {showMugTypeFilter && (
        <div>
          <h3 className="mb-2.5 text-sm font-semibold text-ink-900">Tipo</h3>
          <div className="flex flex-wrap gap-2">
            {([
              ['todos', 'Todas'],
              ['porcelana', 'Porcelana'],
              ['colorir', 'Para Colorir'],
              ['magica', 'Mágica'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ mugType: value as MugType | 'todos' })}
                aria-pressed={filters.mugType === value}
                className={`rounded-full border px-3.5 py-2 text-sm transition-colors ${
                  filters.mugType === value
                    ? 'border-brand-600 bg-brand-50 font-medium text-brand-800'
                    : 'border-ink-200 bg-white text-ink-600 hover:border-ink-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div>
        <label htmlFor={`${fieldId}-price`} className="mb-2.5 block text-sm font-semibold text-ink-900">
          Preço até{' '}
          <span className="font-normal text-brand-700">{formatPrice(priceValue)}</span>
        </label>
        <input
          id={`${fieldId}-price`}
          type="range"
          min={10}
          max={maxPrice}
          step={5}
          value={priceValue}
          onChange={(event) => {
            const next = Number(event.target.value)
            onChange({ maxPrice: next >= maxPrice ? null : next })
          }}
          className="w-full accent-brand-600"
        />
        <div className="mt-1 flex justify-between text-xs text-ink-400">
          <span>{formatPrice(10)}</span>
          <span>{formatPrice(maxPrice)}+</span>
        </div>
      </div>

      <div>
        <label htmlFor={`${fieldId}-sort`} className="mb-2.5 block text-sm font-semibold text-ink-900">
          Ordenar por
        </label>
        <select
          id={`${fieldId}-sort`}
          value={filters.sort}
          onChange={(event) => onChange({ sort: event.target.value as SortOption })}
          className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-800 outline-none transition-colors focus:border-brand-500"
        >
          {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
            <option key={key} value={key}>
              {SORT_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-900"
        >
          <X className="size-4" aria-hidden="true" />
          Limpar filtros
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop: coluna fixa à esquerda */}
      <aside className="hidden lg:block" aria-label="Filtros de produtos">
        <div className="sticky top-24 rounded-card border border-ink-200 bg-white p-5 shadow-soft">
          <h2 className="mb-5 font-display text-lg font-bold text-ink-900">Filtros</h2>
          {panel}
        </div>
      </aside>

      {/* Mobile: botão que abre o painel */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-700 shadow-sm transition-colors hover:border-brand-300"
        >
          <SlidersHorizontal className="size-[18px]" aria-hidden="true" />
          Filtros e ordenação
          {hasActiveFilters && (
            <span className="size-2 rounded-full bg-accent-500" aria-label="filtros ativos" />
          )}
        </button>

        {isOpen && (
          <div className="fixed inset-0 z-60">
            <div className="absolute inset-0 bg-ink-900/50" onClick={() => setOpen(false)} />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Filtros de produtos"
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-ink-900">Filtros</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 text-ink-500 transition-colors hover:bg-ink-100"
                  aria-label="Fechar filtros"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>

              {panel}

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-6 w-full rounded-full bg-brand-700 px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-800"
              >
                Ver {resultCount} {resultCount === 1 ? 'produto' : 'produtos'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}




