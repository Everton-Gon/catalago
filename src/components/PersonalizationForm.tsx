import { useId } from 'react'
import type { Personalization, PersonalizationConfig } from '@/types'

interface PersonalizationFormProps {
  config: PersonalizationConfig
  value: Personalization
  onChange: (value: Personalization) => void
  notes: string
  onNotesChange: (notes: string) => void
}

export default function PersonalizationForm({
  config,
  value,
  onChange,
  notes,
  onNotesChange,
}: PersonalizationFormProps) {
  const fieldId = useId()

  if (!config.enabled) return null

  const fieldClass =
    'w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-800 outline-none transition-colors placeholder:text-ink-400 focus:border-brand-500'

  return (
    <section className="rounded-card border border-brand-100 bg-brand-50/60 p-4 sm:p-5">
      <h2 className="font-display text-base font-bold text-ink-900">Personalização</h2>
      <p className="mt-1 text-sm text-ink-600">
        Conte como você quer o seu produto. Tudo isso vai junto no orçamento.
      </p>

      <div className="mt-4 space-y-4">
        {config.nameField && (
          <div>
            <label htmlFor={`${fieldId}-name`} className="mb-1.5 block text-sm font-medium text-ink-800">
              {config.nameField.label}
            </label>
            <input
              id={`${fieldId}-name`}
              type="text"
              value={value.name ?? ''}
              maxLength={config.nameField.maxLength}
              placeholder={config.nameField.placeholder}
              onChange={(event) => onChange({ ...value, name: event.target.value })}
              className={fieldClass}
            />
          </div>
        )}

        {config.textField && (
          <div>
            <label htmlFor={`${fieldId}-text`} className="mb-1.5 block text-sm font-medium text-ink-800">
              {config.textField.label}
            </label>
            <textarea
              id={`${fieldId}-text`}
              rows={3}
              value={value.text ?? ''}
              maxLength={config.textField.maxLength}
              placeholder={config.textField.placeholder}
              onChange={(event) => onChange({ ...value, text: event.target.value })}
              className={`${fieldClass} resize-y`}
            />
            {config.textField.maxLength && (
              <p className="mt-1 text-right text-xs text-ink-400">
                {(value.text ?? '').length}/{config.textField.maxLength}
              </p>
            )}
          </div>
        )}

        <div>
          <label htmlFor={`${fieldId}-notes`} className="mb-1.5 block text-sm font-medium text-ink-800">
            Observações para o pedido
          </label>
          <textarea
            id={`${fieldId}-notes`}
            rows={2}
            value={notes}
            maxLength={400}
            placeholder="Ex.: quero a arte centralizada na frente."
            onChange={(event) => onNotesChange(event.target.value)}
            className={`${fieldClass} resize-y`}
          />
        </div>

      </div>
    </section>
  )
}


