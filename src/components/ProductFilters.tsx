import { useEffect, useId, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { CATEGORIES } from '@/data/categories'
import type { CatalogFilters, CategorySlug } from '@/types'
import { useDialogFocus } from '@/utils/useDialogFocus'
import PriceRange from './PriceRange'

interface ProductFiltersProps {
  filters: CatalogFilters
  onChange: (patch: Partial<CatalogFilters>) => void
  onToggleCategory: (category: CategorySlug, checked: boolean) => void
  onReset: () => void
  priceBounds: { min: number; max: number }
  categoryCounts: Record<CategorySlug, number>
  resultCount: number
  activeCount: number
  shirtModels: { value: string; label: string }[]
}

export default function ProductFilters({ filters, onChange, onToggleCategory, onReset, priceBounds, categoryCounts, resultCount, activeCount, shirtModels }: ProductFiltersProps) {
  const [isOpen, setOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState(filters.categories)
  useEffect(() => setSelectedCategories(filters.categories), [filters.categories])
  const id = useId()
  const dialogRef = useDialogFocus(isOpen, () => setOpen(false))
  const shirtOnly = filters.categories.length === 1 && filters.categories[0] === 'camisetas'
  const mugOnly = filters.categories.length === 1 && filters.categories[0] === 'canecas'
  const renderHeading = (mobile = false) => <div className="filter-heading">
    <h2><SlidersHorizontal size={18} aria-hidden="true" />Filtros</h2>
    <div>{activeCount > 0 && <button type="button" className="filter-clear" onClick={onReset}>Limpar</button>}
      {mobile && <button type="button" className="filter-close" onClick={() => setOpen(false)} aria-label="Fechar filtros"><X size={20} aria-hidden="true" /></button>}
    </div>
  </div>
  const renderControls = (mode: string) => <div className="filter-controls">
    <fieldset className="category-options">
      <legend>Categorias</legend>
      {CATEGORIES.map(category => <label key={category.slug} className="category-option">
        <input type="checkbox" checked={selectedCategories.includes(category.slug)} onChange={event => {
          const checked = event.target.checked
          setSelectedCategories(current => checked ? [...new Set([...current, category.slug])] : current.filter(value => value !== category.slug))
          onToggleCategory(category.slug, checked)
        }} />
        <span>{category.shortName}</span><span className="category-quantity" aria-label={`${categoryCounts[category.slug]} produtos`}>{categoryCounts[category.slug]}</span>
      </label>)}
    </fieldset>
    <PriceRange bounds={priceBounds} min={filters.minPrice ?? priceBounds.min} max={filters.maxPrice ?? priceBounds.max} onChange={(min, max) => onChange({ minPrice: min <= priceBounds.min ? null : min, maxPrice: max >= priceBounds.max ? null : max })} />
    {(shirtOnly || filters.shirtFabric !== 'todos' || (filters.shirtModel && filters.shirtModel !== 'todos')) && <div className="variant-filters">
      <label htmlFor={`${id}-${mode}-fabric`}>Tecido</label>
      <select id={`${id}-${mode}-fabric`} value={filters.shirtFabric} onChange={event => onChange({ shirtFabric: event.target.value as CatalogFilters['shirtFabric'] })}>
        <option value="todos">Todos os tecidos</option><option value="algodao">100% Algodão</option><option value="poliester">Poliéster</option>
      </select>
      {shirtModels.length > 0 && <><label htmlFor={`${id}-${mode}-model`}>Modelo</label><select id={`${id}-${mode}-model`} value={filters.shirtModel ?? 'todos'} onChange={event => onChange({ shirtModel: event.target.value })}><option value="todos">Todos os modelos</option>{shirtModels.map(model => <option key={model.value} value={model.value}>{model.label}</option>)}</select></>}
    </div>}
    {(mugOnly || filters.mugType !== 'todos') && <div className="variant-filters"><label htmlFor={`${id}-${mode}-mug`}>Tipo de caneca</label><select id={`${id}-${mode}-mug`} value={filters.mugType} onChange={event => onChange({ mugType: event.target.value as CatalogFilters['mugType'] })}><option value="todos">Todos os tipos</option><option value="porcelana">Porcelana</option><option value="colorir">Para colorir</option><option value="magica">Mágica</option></select></div>}
  </div>
  return <>
    <aside className="catalog-sidebar hidden lg:block" aria-label="Filtros de produtos"><div className="filter-card">{renderHeading()}{renderControls('desktop')}</div></aside>
    <div className="lg:hidden">
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={isOpen} className="mobile-filter-trigger"><SlidersHorizontal size={18} aria-hidden="true" />Filtrar{activeCount > 0 && <span aria-label={`${activeCount} filtros ativos`}>{activeCount}</span>}</button>
      {isOpen && <div className="fixed inset-0 z-60"><div className="absolute inset-0 bg-ink-900/50" onClick={() => setOpen(false)} />
        <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Filtros de produtos" className="mobile-filter-panel">
          {renderHeading(true)}{renderControls('mobile')}
          <div className="filter-panel-footer"><button type="button" className="store-button" onClick={() => setOpen(false)}>Ver resultados <span>({resultCount})</span></button></div>
        </div>
      </div>}
    </div>
  </>
}
