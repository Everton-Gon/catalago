import { Link } from 'react-router-dom'
import { SITE } from '@/config/site'

interface LogoProps {
  /** Versão compacta usada no header mobile e no rodapé do drawer. */
  compact?: boolean
  className?: string
  onClick?: () => void
}

export default function Logo({ compact = false, className = '', onClick }: LogoProps) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label={`${SITE.name} — página inicial`}
    >
      <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white shadow-sm transition-transform duration-300 group-hover:scale-105 sm:size-12">
        <img
          src="/brand/fe-proposito-logo.png"
          alt=""
          width={48}
          height={48}
          className="size-full object-contain"
          aria-hidden="true"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-extrabold tracking-tight text-ink-900 sm:text-xl">
          {SITE.name.split('&').map((part, index) => (
            <span key={index}>
              {index > 0 && <span className="text-brand-700">&amp;</span>}
              {part}
            </span>
          ))}
        </span>
        {!compact && (
          <span className="mt-0.5 hidden text-[10px] font-medium uppercase tracking-[0.18em] text-ink-500 sm:block">
            Personalizados
          </span>
        )}
      </span>
    </Link>
  )
}

