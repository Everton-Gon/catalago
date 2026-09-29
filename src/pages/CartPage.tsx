import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Info, Trash2 } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import CartItemRow from '@/components/CartItemRow'
import EmptyCart from '@/components/EmptyCart'
import WhatsAppCheckout from '@/components/WhatsAppCheckout'
import { useCart } from '@/contexts/CartContext'
import { formatItemCount, formatPrice } from '@/utils/format'
import { useSeo } from '@/utils/seo'

export default function CartPage() {
  const { items, itemCount, subtotal, clearCart } = useCart()
  const [notes, setNotes] = useState('')

  useSeo({
    title: 'Minha sacola',
    description: 'Revise seu pedido e solicite o orçamento pelo WhatsApp.',
    path: '/sacola',
  })

  return (
    <div className="container-page py-6 sm:py-8 lg:py-10">
      <Breadcrumbs items={[{ label: 'Minha sacola' }]} />

      <h1 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl lg:text-4xl">
        Minha sacola
      </h1>

      {items.length === 0 ? (
        <div className="mt-6 rounded-card border border-ink-200 bg-white shadow-soft">
          <EmptyCart />
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-ink-500">
            {formatItemCount(itemCount)} — os valores abaixo são estimativas.
          </p>

          <div className="mt-6 lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-8">
            <div className="min-w-0">
              <ul className="space-y-3 sm:space-y-4">
                {items.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <Link
                  to="/produtos"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-900"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Continuar comprando
                </Link>

                <button
                  type="button"
                  onClick={clearCart}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-red-600"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Esvaziar sacola
                </button>
              </div>

              <div className="mt-6 rounded-card border border-ink-200 bg-white p-4 shadow-soft sm:p-5">
                <label
                  htmlFor="pedido-observacoes"
                  className="block text-sm font-semibold text-ink-900"
                >
                  Observações do pedido
                </label>
                <p className="mt-1 text-xs text-ink-500">
                  Prazo desejado, endereço de entrega, detalhes da arte… tudo isso vai junto na
                  mensagem do WhatsApp.
                </p>
                <textarea
                  id="pedido-observacoes"
                  rows={3}
                  value={notes}
                  maxLength={600}
                  placeholder="Ex.: preciso para o dia 20, posso retirar no local."
                  onChange={(event) => setNotes(event.target.value)}
                  className="mt-3 w-full resize-y rounded-xl border border-ink-200 px-4 py-3 text-sm text-ink-800 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500"
                />
              </div>
            </div>

            {/* ------------------------------------------------- RESUMO */}
            <aside
              className="mt-8 lg:sticky lg:top-24 lg:mt-0"
              aria-label="Resumo do pedido"
            >
              <div className="rounded-card border border-ink-200 bg-white p-5 shadow-soft">
                <h2 className="font-display text-lg font-bold text-ink-900">Resumo do pedido</h2>

                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-ink-600">Subtotal</dt>
                    <dd className="font-semibold text-ink-900">{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-ink-600">Quantidade</dt>
                    <dd className="font-semibold text-ink-900">{formatItemCount(itemCount)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="text-ink-600">Frete</dt>
                    <dd className="text-right text-ink-500">calculado posteriormente</dd>
                  </div>

                  <div className="flex items-baseline justify-between gap-3 border-t border-ink-200 pt-4">
                    <dt className="font-display text-base font-bold text-ink-900">
                      Total estimado
                    </dt>
                    <dd className="font-display text-2xl font-extrabold text-brand-800">
                      {formatPrice(subtotal)}
                    </dd>
                  </div>
                </dl>

                <WhatsAppCheckout
                  items={items}
                  notes={notes}
                  source="cart_page"
                  className="mt-5"
                />

                <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-ink-500">
                  <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  Sem cadastro e sem pagamento online. Ao clicar, o WhatsApp abre com o pedido
                  já escrito — é só enviar.
                </p>

              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}

