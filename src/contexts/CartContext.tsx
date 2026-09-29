import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getProductById } from '@/data/catalog'
import { track } from '@/utils/analytics'
import {
  buildCartItemId,
  calculateUnitPrice,
  cartItemCount,
  cartSubtotal,
  MAX_QUANTITY,
} from '@/utils/cart'
import type { CartItem, Personalization, Product } from '@/types'
import { useCatalog } from '@/contexts/CatalogContext'

const STORAGE_KEY = 'feproposito:cart:v1'

/**
 * Formato persistido no localStorage.
 *
 * Guardamos apenas o `productId` — o produto é reidratado a partir do catálogo
 * na inicialização. Assim, preços e descrições editados no catálogo aparecem
 * para quem já tinha itens na sacola, e itens de produtos removidos são
 * descartados em vez de manter dados fantasmas.
 */
interface StoredCartItem {
  productId: string
  selectedVariants: Record<string, string>
  quantity: number
  personalization: Personalization
  notes: string
}

interface AddToCartInput {
  product: Product
  selectedVariants: Record<string, string>
  quantity: number
  personalization?: Personalization
  notes?: string
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  /** Retorna o id do item criado/atualizado. */
  addItem: (input: AddToCartInput) => string
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function hydrate(stored: StoredCartItem[], products: Product[]): CartItem[] {
  return stored.flatMap((entry) => {
    const product = getProductById(entry.productId, products)
    if (!product || !product.available) return []

    const quantity = Math.min(Math.max(1, Math.trunc(entry.quantity)), MAX_QUANTITY)
    const personalization = entry.personalization ?? {}
    const notes = entry.notes ?? ''
    const selectedVariants = Object.fromEntries(
      product.variants.map((variant) => {
        const storedLabel = entry.selectedVariants[variant.id] ?? ''
        const normalized = storedLabel
          .toLocaleLowerCase('pt-BR')
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
        const matching = variant.options.find(
          (option) =>
            option.label
              .toLocaleLowerCase('pt-BR')
              .normalize('NFD')
              .replace(/[̀-ͯ]/g, '') === normalized,
        )
        const matchingColor =
          variant.id === 'cor'
            ? product.colors?.find(
                (color) =>
                  color.name
                    .toLocaleLowerCase('pt-BR')
                    .normalize('NFD')
                    .replace(/[̀-ͯ]/g, '') === normalized,
              )
            : undefined
        const migrated =
          matching ??
          (matchingColor ? { label: matchingColor.name } : undefined) ??
          (variant.id === 'tecido'
            ? variant.options.find((option) =>
                normalized.includes(option.value ?? '__sem-correspondencia__'),
              )
            : undefined)
        return [variant.id, (migrated ?? variant.options[0]).label]
      }),
    )

    return [
      {
        id: buildCartItemId(product, selectedVariants, personalization, notes),
        product,
        selectedVariants,
        quantity,
        personalization,
        notes,
        unitPrice: calculateUnitPrice(product, selectedVariants),
      },
    ]
  })
}

function readStorage(products: Product[]): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return hydrate(parsed as StoredCartItem[], products)
  } catch {
    // localStorage bloqueado (aba anônima) ou dado corrompido: começa vazio.
    return []
  }
}

function writeStorage(items: CartItem[]): void {
  try {
    const stored: StoredCartItem[] = items.map((item) => ({
      productId: item.product.id,
      selectedVariants: item.selectedVariants,
      quantity: item.quantity,
      personalization: item.personalization,
      notes: item.notes,
    }))
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // Sem persistência disponível: a sacola continua funcionando na sessão.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useCatalog()
  const [items, setItems] = useState<CartItem[]>(() => readStorage(products))
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    writeStorage(items)
  }, [items])

  useEffect(() => {
    setItems(readStorage(products))
  }, [products])

  // Mantém a sacola sincronizada entre abas abertas do mesmo navegador.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) setItems(readStorage(products))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [products])

  const addItem = useCallback(
    ({ product, selectedVariants, quantity, personalization = {}, notes = '' }: AddToCartInput) => {
      const id = buildCartItemId(product, selectedVariants, personalization, notes)
      const unitPrice = calculateUnitPrice(product, selectedVariants)

      setItems((current) => {
        const existing = current.find((item) => item.id === id)
        if (existing) {
          return current.map((item) =>
            item.id === id
              ? { ...item, quantity: Math.min(item.quantity + quantity, MAX_QUANTITY) }
              : item,
          )
        }
        return [
          ...current,
          { id, product, selectedVariants, quantity, personalization, notes, unitPrice },
        ]
      })

      track('add_to_cart', { id: product.id, name: product.name, quantity, unitPrice })
      return id
    },
    [],
  )

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
    track('remove_from_cart', { id })
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    const next = Math.trunc(quantity)
    if (next < 1) {
        setItems((current) => current.filter((item) => item.id !== id))
      track('remove_from_cart', { id })
      return
    }
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: Math.min(next, MAX_QUANTITY) } : item,
      ),
    )
    track('update_cart_quantity', { id, quantity: next })
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    track('clear_cart')
  }, [])

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: cartItemCount(items),
      subtotal: cartSubtotal(items),
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, isDrawerOpen, openDrawer, closeDrawer, addItem, removeItem, updateQuantity, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart precisa estar dentro de <CartProvider>')
  return context
}





