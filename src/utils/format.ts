const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatPrice(value: number): string {
  return BRL.format(value)
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}

/** "1 item" / "3 itens" */
export function formatItemCount(count: number): string {
  return `${count} ${pluralize(count, 'item', 'itens')}`
}
