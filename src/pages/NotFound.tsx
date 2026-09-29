import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'
import { useSeo } from '@/utils/seo'

export default function NotFound() {
  useSeo({
    title: 'Página não encontrada',
    description: 'A página que você procurava não existe ou foi movida.',
  })

  return (
    <div className="container-page flex flex-col items-center py-20 text-center sm:py-28">
      <p className="font-display text-7xl font-extrabold text-brand-200 sm:text-8xl">404</p>
      <h1 className="mt-4 font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">
        Página não encontrada
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-500 sm:text-base">
        O link que você abriu não existe ou foi movido. Que tal dar uma olhada no catálogo?
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/produtos"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-800"
        >
          <Search className="size-4" aria-hidden="true" />
          Ver produtos
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-200 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-800"
        >
          <Home className="size-4" aria-hidden="true" />
          Ir para o início
        </Link>
      </div>
    </div>
  )
}
