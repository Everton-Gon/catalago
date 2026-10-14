import { useEffect, useId, useRef, useState } from 'react'
import { formatPrice } from '@/utils/format'

interface PriceRangeProps {
  bounds: { min: number; max: number }
  min: number
  max: number
  onChange: (min: number, max: number) => void
}

function parsePrice(value: string): number {
  const numeric = value.replace(/[^\d,.-]/g, '')
  if (!numeric) return NaN
  return Number(numeric.includes(',') ? numeric.replace(/\./g, '').replace(',', '.') : numeric)
}

export default function PriceRange({ bounds, min, max, onChange }: PriceRangeProps) {
  const id = useId()
  const [minText, setMinText] = useState(formatPrice(min))
  const [maxText, setMaxText] = useState(formatPrice(max))
  const [notice, setNotice] = useState('')
  const latest = useRef({ min, max })
  const editing = useRef<'min' | 'max' | null>(null)
  const [selected, setSelected] = useState({ min, max })
  useEffect(() => {
    latest.current = { min, max }
    setSelected({ min, max })
    if (editing.current !== 'min') setMinText(formatPrice(min))
    if (editing.current !== 'max') setMaxText(formatPrice(max))
  }, [min, max])
  function update(nextMin: number, nextMax: number) {
    latest.current = { min: nextMin, max: nextMax }
    setSelected(latest.current)
    setMinText(formatPrice(nextMin))
    setMaxText(formatPrice(nextMax))
    onChange(nextMin, nextMax)
  }
  const clamp = (value: number) => Math.round(Math.min(bounds.max, Math.max(bounds.min, value)) * 100) / 100
  function commit(which: 'min' | 'max') {
    const raw = parsePrice(which === 'min' ? minText : maxText)
    const valid = Number.isFinite(raw) ? clamp(raw) : which === 'min' ? bounds.min : bounds.max
    const next = which === 'min' ? Math.min(valid, latest.current.max) : Math.max(valid, latest.current.min)
    if (which === 'min') update(next, latest.current.max)
    else update(latest.current.min, next)
    setNotice(valid !== next ? 'O mínimo deve ser menor ou igual ao máximo. O valor foi ajustado.' : '')
  }
  const span = bounds.max - bounds.min
  const left = span ? (selected.min - bounds.min) / span * 100 : 0
  const right = span ? (selected.max - bounds.min) / span * 100 : 100
  return <fieldset className="price-filter">
    <legend>Faixa de preço</legend>
    <div className="price-inputs">
      <label htmlFor={`${id}-min`}>Mínimo<input id={`${id}-min`} type="text" inputMode="decimal" value={minText} onFocus={event => { editing.current = 'min'; event.currentTarget.select() }} onChange={event => setMinText(event.target.value)} onBlur={() => { editing.current = null; commit('min') }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur() }} /></label>
      <span aria-hidden="true">—</span>
      <label htmlFor={`${id}-max`}>Máximo<input id={`${id}-max`} type="text" inputMode="decimal" value={maxText} onFocus={event => { editing.current = 'max'; event.currentTarget.select() }} onChange={event => setMaxText(event.target.value)} onBlur={() => { editing.current = null; commit('max') }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur() }} /></label>
    </div>
    <div className="dual-range" role="group" aria-label="Controle da faixa de preço">
      <div className="range-track" aria-hidden="true"><span style={{ left: `${left}%`, width: `${right - left}%` }} /></div>
      <label className="sr-only" htmlFor={`${id}-min-range`}>Preço mínimo no controle deslizante</label>
      <input id={`${id}-min-range`} className="range-min" type="range" min={bounds.min} max={bounds.max} step="0.01" value={selected.min} aria-valuetext={formatPrice(selected.min)} disabled={!span} onChange={event => { setNotice(''); update(Math.min(Number(event.target.value), latest.current.max), latest.current.max) }} style={{ zIndex: left > 95 ? 3 : 1 }} />
      <label className="sr-only" htmlFor={`${id}-max-range`}>Preço máximo no controle deslizante</label>
      <input id={`${id}-max-range`} className="range-max" type="range" min={bounds.min} max={bounds.max} step="0.01" value={selected.max} aria-valuetext={formatPrice(selected.max)} disabled={!span} onChange={event => { setNotice(''); update(latest.current.min, Math.max(Number(event.target.value), latest.current.min)) }} />
    </div>
    <div className="range-limits" aria-hidden="true"><span>{formatPrice(bounds.min)}</span><span>{formatPrice(bounds.max)}</span></div>
    <p role="status" className="range-notice">{notice}</p>
  </fieldset>
}
