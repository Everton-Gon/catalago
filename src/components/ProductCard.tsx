import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'
import { calculateStartingPrice, getDefaultSelections } from '@/utils/cart'
import { formatPrice } from '@/utils/format'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  /** Prioriza o carregamento da imagem nos primeiros cards visíveis. */
  eager?: boolean
}

/**
 * Card usado na home, no catálogo e nas categorias.
 *
 * O botão de adicionar rápido usa a primeira opção de cada variação como
 * padrão — quem quiser escolher cor, tamanho ou personalizar abre o produto.
 * Na sacola cada item tem um link "Editar" que volta para a página do produto.
 */
export default function ProductCard({ product, eager = false }: ProductCardProps) {
  const { addItem, openDrawer } = useCart()
  const { showToast } = useToast()

  const startingPrice = calculateStartingPrice(product)
  const hasDiscount = product.oldPrice !== undefined && product.oldPrice > product.price

  function quickAdd() {
    const defaults = getDefaultSelections(product, true)
    addItem({ product, selectedVariants: defaults, quantity: 1 })
    showToast('Produto adicionado à sacola.', { label: 'Ver sacola', to: '/sacola' })
    openDrawer()
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-ink-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift">
      <div className="relative aspect-square overflow-hidden bg-ink-100">
        <img
          src={product.images[0]}
          alt={product.name}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          width={600}
          height={600}
          className={`size-full transition-transform duration-500 group-hover:scale-105 ${product.category === 'canecas' ? 'object-contain p-1' : 'object-cover'}`}
        />
        {(product.badge ||
          (hasDiscount && product.promotionPresentation !== 'stacked-no-badge')) && (
          <span className="absolute left-3 top-3 rounded-full bg-accent-400 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-900 shadow-sm">
            {product.badge ?? 'Promoção'}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="font-display text-base font-bold leading-snug text-ink-900 sm:text-lg">
          <Link
            to={`/produto/${product.slug}`}
            className="transition-colors before:absolute before:inset-0 hover:text-brand-700"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-500">
          {product.shortDescription}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="min-w-0">
            <span className="block text-[11px] font-medium uppercase tracking-wide text-ink-400">
              A partir de
            </span>
            {hasDiscount && product.promotionPresentation === 'stacked-no-badge' ? (
              <span className="block">
                <span className="block text-xs text-ink-400 line-through">
                  {formatPrice(product.oldPrice!)}
                </span>
                <span className="block font-display text-xl font-extrabold text-brand-800">
                  {formatPrice(startingPrice)}
                </span>
              </span>
            ) : (
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-display text-xl font-extrabold text-brand-800">
                  {formatPrice(startingPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-ink-400 line-through">
                    {formatPrice(product.oldPrice!)}
                  </span>
                )}
              </span>
            )}
          </p>

          <button
            type="button"
            onClick={quickAdd}
            className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full bg-brand-700 text-white transition-colors hover:bg-brand-800 active:scale-95"
            aria-label={`Adicionar ${product.name} à sacola`}
          >
            <ShoppingBag className="size-[18px]" aria-hidden="true" />
          </button>
        </div>

        <Link
          to={`/produto/${product.slug}`}
          className="relative z-10 mt-4 block rounded-full border border-ink-200 py-2.5 text-center text-sm font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
        >
          Ver produto
        </Link>
      </div>
    </article>
  )
}



