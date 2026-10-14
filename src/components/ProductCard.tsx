import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { calculateStartingPrice, getDefaultSelections, getSelectedPriceOption } from '@/utils/cart'
import { formatPrice } from '@/utils/format'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  /** Prioriza o carregamento da imagem nos primeiros cards visíveis. */
  eager?: boolean
}

/** Shared card: product choices are confirmed on the product page. */
export default function ProductCard({ product, eager = false }: ProductCardProps) {
  const startingPrice = calculateStartingPrice(product)
  const oldPrice = getSelectedPriceOption(product, getDefaultSelections(product, true))?.oldPrice ?? product.oldPrice
  const hasDiscount = oldPrice !== undefined && oldPrice > startingPrice

  return (
    <article className="product-card group relative flex h-full flex-col overflow-hidden rounded-card border border-ink-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift">
      <div className="product-image relative aspect-square overflow-hidden bg-ink-100">
        <img
          src={product.images[0]}
          alt={product.name}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          width={600}
          height={600}
          className="size-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.02]"
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

        {product.printName && <p className="mt-1 text-xs text-ink-500">{product.printName}</p>}

        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-500">
          {product.shortDescription}
        </p>

        <div className="mb-4 mt-4 flex items-end justify-between gap-3">
          <p className="min-w-0">
            <span className="block text-[11px] font-medium uppercase tracking-wide text-ink-400">
              A partir de
            </span>
            {hasDiscount && product.promotionPresentation === 'stacked-no-badge' ? (
              <span className="block">
                <span className="block text-xs text-ink-400 line-through">
                  {formatPrice(oldPrice!)}
                </span>
                <span className="product-price block font-display text-xl font-extrabold text-brand-800">
                  {formatPrice(startingPrice)}
                </span>
              </span>
            ) : (
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span className="product-price font-display text-xl font-extrabold text-brand-800">
                  {formatPrice(startingPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-ink-400 line-through">
                    {formatPrice(oldPrice!)}
                  </span>
                )}
              </span>
            )}
          </p>

        </div>

        <Link
          to={`/produto/${product.slug}`}
          className="product-action relative z-10 mt-auto flex items-center justify-center gap-2 rounded-full border border-ink-200 py-2.5 text-center text-sm font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
        >
          {product.variants.length ? 'Ver opções' : product.personalization.enabled ? 'Personalizar' : 'Ver produto'}
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}



