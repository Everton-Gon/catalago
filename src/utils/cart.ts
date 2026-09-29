import type { CartItem, Personalization, Product, VariantOption } from '@/types'

export function getSelectedPriceOption(
  product: Product,
  selectedVariants: Record<string, string>,
): VariantOption | undefined {
  return product.variants
    .flatMap((variant) => variant.options)
    .find(
      (option) =>
        option.price !== undefined &&
        Object.values(selectedVariants).includes(option.label),
    )
}

export function isPriceOnRequest(
  product: Product,
  selectedVariants: Record<string, string>,
): boolean {
  return product.variants.some((variant) => {
    const chosen = selectedVariants[variant.id]
    return variant.options.some(
      (option) => option.label === chosen && option.priceOnRequest === true,
    )
  })
}

/** Preço unitário: preço do material selecionado + acréscimos das outras opções. */
export function calculateUnitPrice(
  product: Product,
  selectedVariants: Record<string, string>,
): number {
  let basePrice = product.price
  let extras = 0

  product.variants.forEach((variant) => {
    const chosenLabel = selectedVariants[variant.id]
    const option = variant.options.find((candidate) => candidate.label === chosenLabel)
    if (option?.price !== undefined) basePrice = option.price
    else extras += option?.priceDelta ?? 0
  })

  return basePrice + extras
}

/** Menor preço disponível — usado no "a partir de" dos cards e filtros. */
export function calculateStartingPrice(product: Product): number {
  const absolutePrices = product.variants.flatMap((variant) =>
    variant.options.flatMap((option) =>
      option.price !== undefined ? [option.price] : [],
    ),
  )
  const basePrice = absolutePrices.length > 0 ? Math.min(...absolutePrices) : product.price

  return product.variants.reduce((total, variant) => {
    if (variant.options.some((option) => option.price !== undefined)) return total
    const pricedDeltas = variant.options.map((option) => option.priceDelta ?? 0)
    const cheapest = Math.min(...pricedDeltas)
    return total + (variant.required ? cheapest : Math.min(0, cheapest))
  }, basePrice)
}

/** Seleções padrão; no card prioriza a opção com menor preço disponível. */
export function getDefaultSelections(
  product: Product,
  preferLowestPrice = false,
): Record<string, string> {
  return Object.fromEntries(
    product.variants.map((variant) => {
      if (!preferLowestPrice) return [variant.id, variant.options[0].label]
      const priced = variant.options
        .filter((option) => option.price !== undefined)
        .sort((a, b) => a.price! - b.price!)
      return [variant.id, (priced[0] ?? variant.options[0]).label]
    }),
  )
}

/**
 * Identidade do item na sacola: mesmo produto com as mesmas variações,
 * a mesma personalização e as mesmas observações é o mesmo item — nesse caso
 * somamos as quantidades em vez de criar uma linha duplicada.
 */
export function buildCartItemId(
  product: Product,
  selectedVariants: Record<string, string>,
  personalization: Personalization,
  notes: string,
): string {
  const variantKey = Object.keys(selectedVariants)
    .sort()
    .map((key) => `${key}=${selectedVariants[key]}`)
    .join(';')

  const personalizationKey = [
    personalization.name ?? '',
    personalization.text ?? '',
    notes,
  ].join('|')

  return `${product.id}::${variantKey}::${personalizationKey}`
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

/** Linhas "Tecido: Algodão · Cor: Conforme a foto · Tamanho: M". */
export function describeSelection(item: CartItem): string {
  return item.product.variants
    .map((variant) => {
      const chosen = item.selectedVariants[variant.id]
      return chosen ? `${variant.name}: ${chosen}` : null
    })
    .filter(Boolean)
    .join(' · ')
}

export const MAX_QUANTITY = 999

