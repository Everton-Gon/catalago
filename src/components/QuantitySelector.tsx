import { useId } from 'react'
import { Minus, Plus } from 'lucide-react'
import { MAX_QUANTITY } from '@/utils/cart'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  /** `sm` é usado nas linhas da sacola; `md` na página do produto. */
  size?: 'sm' | 'md'
  label?: string
  /** Permite chegar a 0 (na sacola isso remove o item). */
  min?: number
}

export default function QuantitySelector({
  value,
  onChange,
  size = 'md',
  label = 'Quantidade',
  min = 1,
}: QuantitySelectorProps) {
  const fieldId = useId()
  const buttonSize = size === 'sm' ? 'size-8' : 'size-11'
  const iconSize = size === 'sm' ? 'size-3.5' : 'size-4'
  const fieldWidth = size === 'sm' ? 'w-9' : 'w-12'

  return (
    <div className="inline-flex items-center rounded-full border border-ink-200 bg-white p-1">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className={`${buttonSize} grid place-items-center rounded-full text-ink-700 transition-colors hover:bg-ink-100 disabled:cursor-not-allowed disabled:text-ink-300 disabled:hover:bg-transparent`}
        aria-label={`Diminuir ${label.toLowerCase()}`}
      >
        <Minus className={iconSize} aria-hidden="true" />
      </button>

      <label className="sr-only" htmlFor={fieldId}>
        {label}
      </label>
      <input
        id={fieldId}
        type="number"
        inputMode="numeric"
        min={min}
        max={MAX_QUANTITY}
        value={value}
        onChange={(event) => {
          const next = Number(event.target.value)
          if (Number.isFinite(next)) onChange(Math.min(Math.max(next, min), MAX_QUANTITY))
        }}
        className={`${fieldWidth} bg-transparent text-center text-sm font-semibold text-ink-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
      />

      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QUANTITY}
        className={`${buttonSize} grid place-items-center rounded-full text-ink-700 transition-colors hover:bg-ink-100 disabled:cursor-not-allowed disabled:text-ink-300`}
        aria-label={`Aumentar ${label.toLowerCase()}`}
      >
        <Plus className={iconSize} aria-hidden="true" />
      </button>
    </div>
  )
}
