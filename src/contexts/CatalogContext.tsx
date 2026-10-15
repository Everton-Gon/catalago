import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { PRODUCTS } from '@/data/products'
import type { Product } from '@/types'

interface CatalogContextValue {
  products: Product[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const CatalogContext = createContext<CatalogContextValue | null>(null)
const CATALOG_UPDATE_KEY = 'fp-catalog-updated'

export function notifyCatalogUpdated() {
  try {
    window.localStorage.setItem(CATALOG_UPDATE_KEY, String(Date.now()))
  } catch {
    // Focus refresh still works when browser storage is unavailable.
  }
}

function isProductList(value: unknown): value is Product[] {
  return (
    Array.isArray(value) &&
    value.every(
      (product) =>
        typeof product === 'object' &&
        product !== null &&
        typeof (product as Product).id === 'string' &&
        typeof (product as Product).slug === 'string' &&
        Array.isArray((product as Product).images),
    )
  )
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(import.meta.env.DEV ? PRODUCTS : [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const revision = useRef(0)

  const refresh = useCallback(async () => {
    const requestRevision = ++revision.current
    try {
      const response = await fetch('/api/catalog', {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      if (!response.ok) throw new Error('Catálogo indisponível.')
      const payload: unknown = await response.json()
      if (!isProductList(payload) && payload !== null) throw new Error('Resposta inválida do catálogo.')
      if (requestRevision !== revision.current) return
      // A null value means the store has not been initialized, unlike an API failure.
      setProducts(payload === null ? PRODUCTS : payload)
      setError(null)
    } catch {
      if (requestRevision === revision.current && !import.meta.env.DEV) {
        setError('Não foi possível atualizar o catálogo. Tente novamente.')
      }
    } finally {
      if (requestRevision === revision.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const onFocus = () => {
      if (!document.hidden) void refresh()
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === CATALOG_UPDATE_KEY) void refresh()
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    window.addEventListener('storage', onStorage)
    return () => {
      ++revision.current
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
      window.removeEventListener('storage', onStorage)
    }
  }, [refresh])

  const value = useMemo(
    () => ({ products, loading, error, refresh }),
    [products, loading, error, refresh],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog(): CatalogContextValue {
  const context = useContext(CatalogContext)
  if (!context) throw new Error('useCatalog precisa estar dentro de <CatalogProvider>')
  return context
}
