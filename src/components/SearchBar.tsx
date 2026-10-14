import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { suggestProducts } from '@/data/catalog'
import { track } from '@/utils/analytics'
import { formatPrice } from '@/utils/format'
import { calculateStartingPrice } from '@/utils/cart'
import type { Product } from '@/types'
import { useCatalog } from '@/contexts/CatalogContext'

interface SearchBarProps {
  /** Valor inicial (usado no catálogo, que reflete a busca na URL). */
  defaultValue?: string
  placeholder?: string
  autoFocus?: boolean
  /** Quando informado, a busca é tratada na própria página em vez de navegar. */
  onSearch?: (query: string) => void
  onDone?: () => void
  className?: string
}

export default function SearchBar({
  defaultValue = '',
  placeholder = 'Buscar produtos...',
  autoFocus = false,
  onSearch,
  onDone,
  className = '',
}: SearchBarProps) {
  const { products } = useCatalog()
  const [query, setQuery] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [isOpen, setOpen] = useState(false)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => setQuery(defaultValue), [defaultValue])

  useEffect(() => {
    const timer = setTimeout(() => setSuggestions(suggestProducts(query, 5, products)), 150)
    return () => clearTimeout(timer)
  }, [query, products])

  // Fecha as sugestões ao clicar fora.
  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    setOpen(false)
    track('search', { query: trimmed })

    if (onSearch) {
      onSearch(trimmed)
    } else {
      navigate(trimmed ? `/produtos?busca=${encodeURIComponent(trimmed)}` : '/produtos')
    }
    onDone?.()
  }

  function pick(product: Product) {
    setOpen(false)
    navigate(`/produto/${product.slug}`)
    onDone?.()
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form role="search" onSubmit={submit}>
        <label htmlFor={`${listId}-input`} className="sr-only">
          Buscar produtos
        </label>
        <div className="search-field flex min-h-12 items-center gap-1 rounded-lg border border-ink-200 bg-white px-2 shadow-sm transition-colors focus-within:border-brand-500">
          <input
            id={`${listId}-input`}
            type="search"
            value={query}
            autoFocus={autoFocus}
            placeholder={placeholder}
            onChange={(event) => {
              setQuery(event.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false) }}
            className="w-full min-w-0 bg-transparent px-2 py-3 text-sm text-ink-800 outline-none placeholder:text-ink-400 [&::-webkit-search-cancel-button]:hidden"
            aria-autocomplete="list"
            aria-controls={listId}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                onSearch?.('')
              }}
              className="grid size-11 shrink-0 place-items-center rounded-full text-ink-500 transition-colors hover:text-ink-700"
              aria-label="Limpar busca"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
          <button type="submit" aria-label="Pesquisar produtos" className="grid size-11 shrink-0 place-items-center rounded-lg text-brand-700 transition-colors hover:bg-brand-50"><Search className="size-[18px]" aria-hidden="true" /></button>
        </div>
      </form>

      {isOpen && suggestions.length > 0 && (
        <ul
          id={listId}
          aria-label="Sugestões de produtos"
          className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-ink-200 bg-white py-1 shadow-lift"
        >
          {suggestions.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => pick(product)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-brand-50"
              >
                <img
                  src={product.images[0]}
                  alt=""
                  loading="lazy"
                  className="size-10 shrink-0 rounded-lg bg-ink-100 object-contain"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink-800">
                    {product.name}
                  </span>
                  <span className="block text-xs text-ink-500">
                    a partir de {formatPrice(calculateStartingPrice(product))}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
