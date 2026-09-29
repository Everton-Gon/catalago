import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { PRODUCTS } from '@/data/products'
import type { Product } from '@/types'

interface CatalogContextValue {
  products: Product[]
  loading: boolean
  refresh: () => Promise<void>
}

const CatalogContext = createContext<CatalogContextValue | null>(null)

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
  const [products, setProducts] = useState<Product[]>(PRODUCTS)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/catalog', {
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) return
      const payload: unknown = await response.json()
      if (isProductList(payload)) setProducts(payload)
    } catch {
      // Desenvolvimento sem Netlify Functions e indisponibilidade temporária
      // usam o catálogo estático incluído no bundle.
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo(
    () => ({ products, loading, refresh }),
    [products, loading, refresh],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog(): CatalogContextValue {
  const context = useContext(CatalogContext)
  if (!context) throw new Error('useCatalog precisa estar dentro de <CatalogProvider>')
  return context
}
