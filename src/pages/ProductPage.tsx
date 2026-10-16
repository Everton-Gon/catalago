import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Check, Info, ShoppingBag, MessageCircle } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import ProductGallery from '@/components/ProductGallery'
import ProductOptions from '@/components/ProductOptions'
import PersonalizationForm from '@/components/PersonalizationForm'
import ProductGrid from '@/components/ProductGrid'
import QuantitySelector from '@/components/QuantitySelector'
import WhatsAppCheckout from '@/components/WhatsAppCheckout'
import { getProductBySlug, getRelatedProducts } from '@/data/catalog'
import { useCatalog } from '@/contexts/CatalogContext'
import { getCategory } from '@/data/categories'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'
import { track } from '@/utils/analytics'
import {
  calculateUnitPrice,
  getDefaultSelections,
  getSelectedPriceOption,
  isPriceOnRequest,
} from '@/utils/cart'
import { formatPrice } from '@/utils/format'
import { useSeo } from '@/utils/seo'
import type { Personalization } from '@/types'

export default function ProductPage() {
  const { products, loading } = useCatalog()
  const { slug } = useParams<{ slug: string }>()
  const product = slug ? getProductBySlug(slug, products) : undefined

  const { items, addItem, replaceItem, openDrawer } = useCart()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const editingId = searchParams.get('editar')
  const editingItem = items.find(item => item.id === editingId && item.product.id === product?.id)
  const { showToast } = useToast()

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [personalization, setPersonalization] = useState<Personalization>({})
  const [notes, setNotes] = useState('')
  const [imageBusy, setImageBusy] = useState(false)

  // Reinicia o formulário sempre que o produto muda (navegação entre relacionados).
  useEffect(() => {
    if (!product) return
    setSelectedVariants(editingItem?.selectedVariants ?? getDefaultSelections(product))
    setQuantity(editingItem?.quantity ?? 1)
    setPersonalization(editingItem?.personalization ?? {})
    setNotes(editingItem?.notes ?? '')
    track('view_product', { id: product.id, name: product.name })
  }, [product?.id, editingId, editingItem?.id])

  const unitPrice = useMemo(
    () => (product ? calculateUnitPrice(product, selectedVariants) : 0),
    [product, selectedVariants],
  )
  const selectedPriceOption = useMemo(
    () => (product ? getSelectedPriceOption(product, selectedVariants) : undefined),
    [product, selectedVariants],
  )
  const priceOnRequest = useMemo(
    () => (product ? isPriceOnRequest(product, selectedVariants) : false),
    [product, selectedVariants],
  )

  useSeo({
    title: product?.name ?? 'Produto não encontrado',
    description: product?.shortDescription,
    image: product?.images[0],
  })

  if (loading && !product) {
    return (
      <div className="container-page grid min-h-80 place-items-center" role="status">
        <div className="size-9 animate-spin rounded-full border-4 border-ink-200 border-t-brand-600" />
        <span className="sr-only">Carregando produto…</span>
      </div>
    )
  }
  if (!product) return <Navigate to="/produtos" replace />

  const category = getCategory(product.category)
  const selectedColor = product.colors?.find((color) => color.name === selectedVariants.cor)
  const pricePendingOption = product.variants
    .flatMap((variant) => variant.options)
    .find((option) =>
      option.priceOnRequest && Object.values(selectedVariants).includes(option.label),
    )
  const related = getRelatedProducts(product, 4, products)
  const total = unitPrice * quantity
  const oldPrice = selectedPriceOption?.oldPrice ?? product.oldPrice
  const hasDiscount = oldPrice !== undefined && oldPrice > unitPrice


  function handleAddToCart() {
    if (priceOnRequest) {
      showToast(`O preço de ${pricePendingOption?.label ?? 'esta opção'} ainda precisa ser definido. Solicite um orçamento pelo WhatsApp.`)
      return
    }

    const input = { product: product!, selectedVariants, quantity, personalization, notes }
    if (editingItem) {
      replaceItem(editingItem.id, input)
      showToast('Alterações salvas na sacola.')
      navigate('/sacola')
    } else {
      addItem(input)
      showToast('Produto adicionado à sacola.', { label: 'Ver sacola', to: '/sacola' })
      openDrawer()
    }
  }

  return (
    <div className="container-page py-6 sm:py-8 lg:py-10">
      <Breadcrumbs
        items={[
          { label: 'Produtos', to: '/produtos' },
          ...(category
            ? [{ label: category.shortName, to: `/categoria/${category.slug}` }]
            : []),
          { label: product.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="lg:sticky lg:top-44 lg:self-start">
          <ProductGallery
            images={product.images}
            productName={product.name}
            imageFit="contain"
            previewImage={selectedColor?.previewImage}
            previewLabel={selectedColor?.previewImage ? `na cor ${selectedColor.name}` : undefined}
            badge={
              product.badge ??
              (hasDiscount && product.promotionPresentation !== 'stacked-no-badge'
                ? 'Promoção'
                : undefined)
            }
          />
        </div>

        <div>
          {category && (
            <Link
              to={`/categoria/${category.slug}`}
              className="text-xs font-semibold uppercase tracking-wider text-brand-700 transition-colors hover:text-brand-900"
            >
              {category.shortName}
            </Link>
          )}

          <h1 className="mt-2 font-display text-2xl font-extrabold leading-tight text-ink-900 sm:text-3xl lg:text-4xl">
            {product.name}
          </h1>

          {product.printName && <p className="mt-3 text-sm text-ink-500">{product.printName}</p>}
          {editingItem && <p className="mt-3 rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-800">Editando um item da sacola. Salve abaixo para atualizar suas escolhas.</p>}

          <p className="mt-4 text-sm leading-relaxed text-ink-600 sm:text-base">
            {product.description}
          </p>

          <div className="mt-6 rounded-card border border-ink-200 bg-white p-4 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
              Preço estimado
            </p>
            {priceOnRequest ? (
              <p className="mt-1 font-display text-2xl font-extrabold text-brand-800 sm:text-3xl">
                Preço sob consulta
              </p>
            ) : (
              <div className="mt-1">
                {hasDiscount && (
                  <span className="block text-sm text-ink-400 line-through">
                    {formatPrice(oldPrice!)}
                  </span>
                )}
                <p className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-display text-3xl font-extrabold text-brand-800 sm:text-4xl">
                    {formatPrice(unitPrice)}
                  </span>
                  <span className="text-sm text-ink-500">por unidade</span>
                </p>
              </div>
            )}
            <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-ink-500">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              {priceOnRequest
                ? `O valor de ${pricePendingOption?.label ?? 'esta opção'} ainda precisa ser definido e será confirmado pelo WhatsApp.`
                : 'Valor de referência. O preço final é confirmado pelo WhatsApp.'}
            </p>
          </div>

          <div className="mt-6">
            <ProductOptions
              variants={product.variants}
              colors={product.colors}
              selected={selectedVariants}
              onChange={(variantId, optionLabel) =>
                setSelectedVariants((current) => ({ ...current, [variantId]: optionLabel }))
              }
            />
          </div>

          <div className="mt-6">
            <PersonalizationForm
              config={product.personalization}
              value={personalization}
              onChange={setPersonalization}
              notes={notes}
              onNotesChange={setNotes}
              onImageBusy={setImageBusy}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div>
              <p className="mb-1.5 text-sm font-semibold text-ink-900">Quantidade</p>
              <QuantitySelector value={quantity} onChange={setQuantity} />
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-ink-400">Total estimado</p>
              <p className="font-display text-2xl font-extrabold text-ink-900">
                {priceOnRequest ? 'Sob consulta' : formatPrice(total)}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={priceOnRequest || imageBusy}
              className="flex w-full items-center justify-center gap-2.5 rounded-full bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 px-6 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-brand-700/20 transition-all hover:bg-brand-800 active:scale-[0.99]"
            >
              <ShoppingBag className="size-[18px]" aria-hidden="true" />
              {editingItem ? 'Salvar alterações na sacola' : 'Adicionar à sacola'}
            </button>

            <WhatsAppCheckout disabled={imageBusy} source="product_page" items={[{ id: product.id, product, selectedVariants, quantity, personalization, notes, unitPrice }]}>
              Solicitar orçamento pelo WhatsApp
            </WhatsAppCheckout>
          </div>

          <ul className="mt-6 space-y-2.5 text-sm text-ink-600">
            <li className="flex items-start gap-2.5">
              <Check className="mt-0.5 size-[18px] shrink-0 text-brand-600" aria-hidden="true" />
              Escolha as opções e revise a personalização antes de enviar.
            </li>
            <li className="flex items-start gap-2.5">
              <MessageCircle className="mt-0.5 size-[18px] shrink-0 text-brand-600" aria-hidden="true" />
              Valor final, prazo e entrega são confirmados no atendimento pelo WhatsApp.
            </li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 lg:mt-24">
          <h2 className="mb-6 font-display text-xl font-extrabold text-ink-900 sm:text-2xl">
            Você também pode gostar
          </h2>
          <ProductGrid products={related} eagerCount={0} />
        </section>
      )}
    </div>
  )
}











