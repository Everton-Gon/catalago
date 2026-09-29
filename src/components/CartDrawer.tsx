import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import CartItemRow from './CartItemRow'
import EmptyCart from './EmptyCart'
import WhatsAppCheckout from './WhatsAppCheckout'
import { useCart } from '@/contexts/CartContext'
import { formatItemCount, formatPrice } from '@/utils/format'

/** Painel lateral com a sacola — atalho rápido sem sair da navegação. */
export default function CartDrawer() {
  const { items, itemCount, subtotal, isDrawerOpen, closeDrawer } = useCart()
  const location = useLocation()

  // Fecha o painel ao navegar para outra página.
  useEffect(() => {
    closeDrawer()
  }, [location.pathname, closeDrawer])

  useEffect(() => {
    if (!isDrawerOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeDrawer()
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isDrawerOpen, closeDrawer])

  return (
    // `inert` (React 19) tira o painel fechado do tab order e da árvore de
    // acessibilidade sem impedir a animação de saída.
    <div
      className={`fixed inset-0 z-60 ${isDrawerOpen ? '' : 'pointer-events-none'}`}
      inert={!isDrawerOpen}
    >
      <div
        className={`absolute inset-0 bg-ink-900/50 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeDrawer}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Minha sacola"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink-200 px-4 py-4 sm:px-5">
          <h2 className="font-display text-lg font-bold text-ink-900">
            Minha sacola
            {itemCount > 0 && (
              <span className="ml-2 text-sm font-medium text-ink-500">
                ({formatItemCount(itemCount)})
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="rounded-full p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
            aria-label="Fechar sacola"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyCart compact onNavigate={closeDrawer} />
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-ink-200 overflow-y-auto px-4 sm:px-5">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} variant="compact" onNavigate={closeDrawer} />
              ))}
            </ul>

            <div className="border-t border-ink-200 bg-ink-50 px-4 py-4 sm:px-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-ink-600">Total estimado</span>
                <span className="font-display text-2xl font-extrabold text-brand-800">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-500">
                Frete e valor final confirmados pelo WhatsApp.
              </p>

              <WhatsAppCheckout items={items} source="drawer" className="mt-4" />

              <Link
                to="/sacola"
                onClick={closeDrawer}
                className="mt-2 block rounded-full py-3 text-center text-sm font-semibold text-ink-600 transition-colors hover:text-brand-700"
              >
                Ver sacola completa
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
