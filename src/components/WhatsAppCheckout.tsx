import WhatsAppIcon from './icons/WhatsAppIcon'
import { track } from '@/utils/analytics'
import { buildCartQuoteMessage, buildWhatsAppUrl } from '@/utils/whatsapp'
import type { CartItem } from '@/types'

interface WhatsAppCheckoutProps {
  items: CartItem[]
  /** Observações gerais digitadas na sacola. */
  notes?: string
  source: 'drawer' | 'cart_page'
  className?: string
  children?: React.ReactNode
}

/** Abre o WhatsApp com o texto do pedido. */
export default function WhatsAppCheckout({
  items,
  notes = '',
  source,
  className = '',
  children = 'Solicitar orçamento pelo WhatsApp',
}: WhatsAppCheckoutProps) {
  if (items.length === 0) return null

  return (
    <div className={className}>
      <a
        href={buildWhatsAppUrl(buildCartQuoteMessage(items, notes))}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          track('begin_whatsapp_quote', {
            source,
            items: items.length,
            total: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
          })
        }}
        className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-5 py-4 text-center text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#25D366]/25 transition-all hover:brightness-105 active:scale-[0.99]"
      >
        <WhatsAppIcon className="size-5 shrink-0" />
        {children}
      </a>

      <p className="mt-2 text-center text-xs leading-relaxed text-ink-500">
        Se você já possui uma arte, anexe a imagem diretamente na conversa do WhatsApp.
      </p>
    </div>
  )
}
