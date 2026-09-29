import { Link } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import QuantitySelector from './QuantitySelector'
import { useCart } from '@/contexts/CartContext'
import { describeSelection } from '@/utils/cart'
import { formatPrice } from '@/utils/format'
import type { CartItem } from '@/types'

interface CartItemRowProps {
  item: CartItem
  /** `compact` é usado dentro do painel lateral. */
  variant?: 'compact' | 'full'
  onNavigate?: () => void
}

export default function CartItemRow({ item, variant = 'full', onNavigate }: CartItemRowProps) {
  const { removeItem, updateQuantity } = useCart()
  const selection = describeSelection(item)
  const subtotal = item.unitPrice * item.quantity
  const isCompact = variant === 'compact'

  return (
    <li
      className={`flex gap-3 ${
        isCompact ? 'py-4' : 'rounded-card border border-ink-200 bg-white p-3 shadow-soft sm:p-4'
      }`}
    >
      <Link
        to={`/produto/${item.product.slug}`}
        onClick={onNavigate}
        className={`${isCompact ? 'size-20' : 'size-24 sm:size-28'} shrink-0 overflow-hidden rounded-xl bg-ink-100`}
      >
        <img
          src={item.product.images[0]}
          alt={item.product.name}
          loading="lazy"
          className="size-full object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-display font-bold leading-snug ${isCompact ? 'text-sm' : 'text-base sm:text-lg'}`}>
            <Link
              to={`/produto/${item.product.slug}`}
              onClick={onNavigate}
              className="text-ink-900 transition-colors hover:text-brand-700"
            >
              {item.product.name}
            </Link>
          </h3>

          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="shrink-0 rounded-full p-1.5 text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label={`Remover ${item.product.name} da sacola`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>

        {item.product.printName && (
          <p className="mt-1 text-xs text-ink-500 sm:text-sm">
            Estampa: {item.product.printName}
          </p>
        )}

        {selection && <p className="mt-1 text-xs text-ink-500 sm:text-sm">{selection}</p>}

        {(item.personalization.name || item.personalization.text) && (
          <p className="mt-1 text-xs text-ink-500 sm:text-sm">
            {item.personalization.name && (
              <span className="block truncate">Nome: {item.personalization.name}</span>
            )}
            {item.personalization.text && (
              <span className="block truncate">Texto: “{item.personalization.text}”</span>
            )}
          </p>
        )}

        {item.notes && (
          <p className="mt-1 truncate text-xs italic text-ink-500">Obs.: {item.notes}</p>
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
          <QuantitySelector
            value={item.quantity}
            onChange={(quantity) => updateQuantity(item.id, quantity)}
            size="sm"
            label={`Quantidade de ${item.product.name}`}
          />

          <div className="text-right">
            <p className="text-[11px] text-ink-400">{formatPrice(item.unitPrice)} cada</p>
            <p className={`font-display font-extrabold text-ink-900 ${isCompact ? 'text-base' : 'text-lg'}`}>
              {formatPrice(subtotal)}
            </p>
          </div>
        </div>

        {!isCompact && (
          <Link
            to={`/produto/${item.product.slug}`}
            className="mt-3 inline-flex items-center gap-1.5 self-start text-xs font-semibold text-brand-700 transition-colors hover:text-brand-900"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            Editar opções ou personalização
          </Link>
        )}
      </div>
    </li>
  )
}
