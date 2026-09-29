import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface Crumb {
  label: string
  to?: string
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Você está aqui" className="mb-4 sm:mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-500 sm:text-sm">
        <li>
          <Link to="/" className="transition-colors hover:text-brand-700">
            Início
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1">
            <ChevronRight className="size-3.5 text-ink-300" aria-hidden="true" />
            {item.to && index < items.length - 1 ? (
              <Link to={item.to} className="transition-colors hover:text-brand-700">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-ink-700" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
