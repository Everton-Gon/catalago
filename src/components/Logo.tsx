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
      className={`brand-logo${compact ? ' is-compact' : ''} ${className}`}
      aria-label={`${SITE.name} — página inicial`}
    >
      {/* Viewports display the supplied artwork unchanged and exclude screenshot UI. */}
      <svg className="brand-logo-full" viewBox="160 65 865 715" width="178" height="147" role="img" aria-label="Fé & Propósito — Produtos que inspiram, fé que transforma">
        <image href="/brand/fe-proposito-assinatura.webp" width="1202" height="858" />
      </svg>
      <svg className="brand-logo-symbol" viewBox="405 65 410 480" width="42" height="49" aria-hidden="true">
        <image href="/brand/fe-proposito-assinatura.webp" width="1202" height="858" />
      </svg>
    </Link>
  )
}

