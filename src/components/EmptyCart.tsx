import { Link } from 'react-router-dom'

interface EmptyCartProps {
  onNavigate?: () => void
  compact?: boolean
}

export default function EmptyCart({ onNavigate, compact = false }: EmptyCartProps) {
  return (
    <div className={`flex flex-col items-center text-center ${compact ? 'px-6 py-10' : 'px-4 py-16'}`}>
      <svg
        viewBox="0 0 120 120"
        className={compact ? 'size-28' : 'size-40'}
        role="img"
        aria-label="Ilustração de sacola vazia"
      >
        <circle cx="60" cy="62" r="46" fill="var(--color-brand-50)" />
        <path
          d="M34 46h52l-5 46a6 6 0 0 1-6 5.4H45a6 6 0 0 1-6-5.4L34 46Z"
          fill="white"
          stroke="var(--color-brand-300)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M48 50V38a12 12 0 0 1 24 0v12"
          fill="none"
          stroke="var(--color-brand-600)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="52" cy="70" r="2.6" fill="var(--color-ink-400)" />
        <circle cx="68" cy="70" r="2.6" fill="var(--color-ink-400)" />
        <path
          d="M52 84c2.6-3 5.4-4.4 8-4.4s5.4 1.4 8 4.4"
          fill="none"
          stroke="var(--color-ink-400)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="96" cy="34" r="6" fill="var(--color-accent-400)" />
        <circle cx="24" cy="30" r="4" fill="var(--color-brand-200)" />
      </svg>

      <h2 className={`mt-5 font-display font-bold text-ink-900 ${compact ? 'text-lg' : 'text-2xl'}`}>
        Sua sacola está vazia
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-500">
        Encontre produtos personalizados para começar seu pedido.
      </p>

      <Link
        to="/produtos"
        onClick={onNavigate}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-700 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-800"
      >
        Ver produtos
      </Link>
    </div>
  )
}
