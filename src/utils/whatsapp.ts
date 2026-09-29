import { WHATSAPP_DEFAULT_MESSAGE, WHATSAPP_NUMBER } from '@/config/site'
import { formatPrice } from './format'
import type { CartItem, Product } from '@/types'

/** Monta o link wa.me com a mensagem já codificada. */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

/** Link genérico usado pelo botão flutuante e pelos CTAs de contato. */
export function generalWhatsAppUrl(message: string = WHATSAPP_DEFAULT_MESSAGE): string {
  return buildWhatsAppUrl(message)
}

/** Orçamento de um único produto, sem símbolos que possam quebrar na URL. */
export function buildProductQuoteMessage(
  product: Product,
  selectedVariants: Record<string, string> = {},
  unitPrice?: number,
  quantity = 1,
): string {
  const variants = product.variants.flatMap((variant) => {
    const chosen = selectedVariants[variant.id]
    return chosen ? [`*${variant.name}:* ${chosen}`] : []
  })

  return [
    'Olá! Gostaria de solicitar um orçamento.',
    '',
    `*Produto:* ${product.name}`,
    ...(product.printName ? [`*Estampa:* ${product.printName}`] : []),
    ...variants,
    `*Quantidade:* ${quantity}`,
    `*Valor estimado:* ${
      unitPrice === undefined ? 'Sob consulta' : formatPrice(unitPrice * quantity)
    }`,
    '',
    'Poderia me passar os detalhes de valor, prazo e disponibilidade?',
  ].join('\n')
}

function describeVariants(item: CartItem): string[] {
  return item.product.variants
    .map((variant) => {
      const chosen = item.selectedVariants[variant.id]
      return chosen ? `${variant.name}: ${chosen}` : null
    })
    .filter((line): line is string => line !== null)
}

function describePersonalization(item: CartItem): string[] {
  const lines: string[] = []
  const { name, text } = item.personalization

  if (name) lines.push(`Personalização (nome): ${name}`)
  if (text) lines.push(`Personalização (texto): ${text}`)
  if (item.notes) lines.push(`Observações: ${item.notes}`)

  return lines
}

/** Mensagem completa do orçamento a partir da sacola. */
export function buildCartQuoteMessage(items: CartItem[], generalNotes = ''): string {
  const lines: string[] = ['Olá! Gostaria de solicitar um orçamento.', '']

  items.forEach((item, index) => {
    const subtotal = item.unitPrice * item.quantity

    lines.push(`*${index + 1}. ${item.product.name}*`)
    if (item.product.printName) lines.push(`Estampa: ${item.product.printName}`)
    lines.push(...describeVariants(item))
    lines.push(`Quantidade: ${item.quantity}`)
    lines.push(`Valor unitário: ${formatPrice(item.unitPrice)}`)
    lines.push(`Subtotal: ${formatPrice(subtotal)}`)
    lines.push(...describePersonalization(item))
    lines.push('')
  })

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  lines.push(`*TOTAL ESTIMADO: ${formatPrice(total)}*`)

  if (generalNotes.trim()) {
    lines.push('', '*Observações:*', generalNotes.trim())
  }

  lines.push('', 'Aguardo a confirmação do valor, prazo e disponibilidade.')
  return lines.join('\n')
}
