import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

/** Pilha de avisos no rodapé (mobile) / canto inferior direito (desktop). */
export default function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-24 z-70 flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-28 sm:right-6 sm:items-end"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-ink-200 bg-white p-3 shadow-lift"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700">
            <Check className="size-5" aria-hidden="true" />
          </span>

          <p className="min-w-0 flex-1 text-sm font-medium text-ink-800">{toast.message}</p>

          {toast.action && (
            <Link
              to={toast.action.to}
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 rounded-full bg-brand-700 px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-800"
            >
              {toast.action.label}
            </Link>
          )}

          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 rounded-full p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
            aria-label="Fechar aviso"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  )
}
