import { useEffect, useId, useState } from 'react'
import { Check } from 'lucide-react'
import { formatPrice } from '@/utils/format'
import type { ProductColor, Variant } from '@/types'

interface ProductOptionsProps {
  variants: Variant[]
  selected: Record<string, string>
  onChange: (variantId: string, optionLabel: string) => void
  colors?: ProductColor[]
}

/** Seletor de variações: chips, bolinhas de cor e paleta especial das camisetas. */
export default function ProductOptions({
  variants,
  selected,
  onChange,
  colors = [],
}: ProductOptionsProps) {
  const [showShirtColors, setShowShirtColors] = useState(false)
  const colorGridId = useId()
  const selectedColor = selected.cor

  useEffect(() => {
    if (selectedColor === 'Conforme a foto') setShowShirtColors(false)
    else if (colors.some((color) => color.name === selectedColor)) setShowShirtColors(true)
  }, [selectedColor, colors])

  if (variants.length === 0) return null

  return (
    <div className="space-y-5">
      {variants.map((variant) => {
        const isColor = variant.options.some((option) => option.swatch)
        const chosen = selected[variant.id]

        if (variant.id === 'cor' && colors.length > 0) {
          const hasCustomColor = colors.some((color) => color.name === chosen)

          return (
            <fieldset key={variant.id}>
              <legend className="mb-2.5 flex flex-wrap items-baseline gap-x-2 text-sm font-semibold text-ink-900">
                Cor
                <span className="font-normal text-ink-500">{chosen}</span>
              </legend>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowShirtColors(false)
                    onChange(variant.id, 'Conforme a foto')
                  }}
                  aria-pressed={chosen === 'Conforme a foto'}
                  className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
                    chosen === 'Conforme a foto'
                      ? 'border-brand-600 bg-brand-50 text-brand-800'
                      : 'border-ink-200 bg-white text-ink-700 hover:border-ink-400'
                  }`}
                >
                  Conforme a foto
                </button>

                <button
                  type="button"
                  onClick={() => setShowShirtColors(true)}
                  aria-expanded={showShirtColors}
                  aria-controls={colorGridId}
                  aria-pressed={hasCustomColor}
                  className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
                    showShirtColors || hasCustomColor
                      ? 'border-brand-600 bg-brand-50 text-brand-800'
                      : 'border-ink-200 bg-white text-ink-700 hover:border-ink-400'
                  }`}
                >
                  Consultar outras cores
                </button>
              </div>

              {showShirtColors && (
                <div
                  id={colorGridId}
                  className="mt-3 flex max-w-xs flex-wrap gap-2"
                  role="group"
                  aria-label="Cores disponíveis"
                >
                  {colors.map((color) => {
                    const isSelected = chosen === color.name
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => onChange(variant.id, color.name)}
                        aria-label={color.name}
                        aria-pressed={isSelected}
                        title={color.name}
                        className={`relative grid size-9 shrink-0 place-items-center rounded-lg border-2 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 ${
                          isSelected
                            ? 'border-brand-600 ring-2 ring-brand-200'
                            : color.id === 'branco'
                              ? 'border-ink-300 hover:border-brand-400'
                              : 'border-white/80 hover:border-brand-400'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        <span className="sr-only">{color.name}</span>
                        {isSelected && (
                          <Check
                            className={`size-4 ${
                              color.checkContrast === 'dark' ? 'text-ink-900' : 'text-white'
                            }`}
                            strokeWidth={3}
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </fieldset>
          )
        }

        return (
          <fieldset key={variant.id}>
            <legend className="mb-2.5 flex flex-wrap items-baseline gap-x-2 text-sm font-semibold text-ink-900">
              {variant.name}
              {chosen && <span className="font-normal text-ink-500">{chosen}</span>}
            </legend>

            <div className="flex flex-wrap gap-2.5">
              {variant.options.map((option) => {
                const isSelected = chosen === option.label
                const delta = option.priceDelta ?? 0

                if (isColor && option.swatch) {
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => onChange(variant.id, option.label)}
                      aria-pressed={isSelected}
                      title={
                        delta !== 0
                          ? `${option.label} (${delta > 0 ? '+' : '−'} ${formatPrice(Math.abs(delta))})`
                          : option.label
                      }
                      className={`relative grid size-11 place-items-center rounded-full border-2 transition-all ${
                        isSelected
                          ? 'border-brand-600 ring-2 ring-brand-200'
                          : 'border-ink-200 hover:border-ink-400'
                      }`}
                    >
                      <span className="sr-only">{option.label}</span>
                      <span
                        className="size-7 rounded-full border border-ink-900/10"
                        style={{ backgroundColor: option.swatch }}
                        aria-hidden="true"
                      />
                      {isSelected && (
                        <Check
                          className="absolute size-4 text-white mix-blend-difference"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  )
                }

                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => onChange(variant.id, option.label)}
                    aria-pressed={isSelected}
                    className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50 text-brand-800'
                        : 'border-ink-200 bg-white text-ink-700 hover:border-ink-400'
                    }`}
                  >
                    {option.label}
                    {delta !== 0 && (
                      <span className="ml-1.5 text-xs text-ink-500">
                        {delta > 0 ? '+' : '−'} {formatPrice(Math.abs(delta))}
                      </span>
                    )}
                    {option.priceOnRequest && (
                      <span className="ml-1.5 text-xs text-ink-500">sob consulta</span>
                    )}
                  </button>
                )
              })}
            </div>
          </fieldset>
        )
      })}
    </div>
  )
}
