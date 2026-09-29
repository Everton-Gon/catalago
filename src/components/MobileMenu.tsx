import { useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { MessageCircle, X } from 'lucide-react'
import Logo from './Logo'
import { CATEGORIES } from '@/data/categories'
import { FOOTER_INFO_NAV } from '@/config/navigation'
import { generalWhatsAppUrl } from '@/utils/whatsapp'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  // Trava o scroll do fundo enquanto o painel está aberto.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-xl px-4 py-3 text-base font-medium transition-colors ${
      isActive ? 'bg-brand-50 text-brand-800' : 'text-ink-700 hover:bg-ink-100'
    }`

  return (
    <div
      className={`fixed inset-0 z-60 lg:hidden ${open ? '' : 'pointer-events-none'}`}
      inert={!open}
    >
      <div
        className={`absolute inset-0 bg-ink-900/50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className={`absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink-200 px-4 py-3">
          <Logo compact onClick={onClose} />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
            aria-label="Fechar menu"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegação principal">
          <NavLink to="/" end className={linkClass} onClick={onClose}>
            Início
          </NavLink>
          <NavLink to="/produtos" end className={linkClass} onClick={onClose}>
            Todos os produtos
          </NavLink>

          <p className="mt-5 px-4 pb-1 text-xs font-semibold uppercase tracking-wider text-ink-400">
            Categorias
          </p>
          {CATEGORIES.map((category) => (
            <NavLink
              key={category.slug}
              to={`/categoria/${category.slug}`}
              className={linkClass}
              onClick={onClose}
            >
              <span className="mr-2" aria-hidden="true">
                {category.emoji}
              </span>
              {category.shortName}
            </NavLink>
          ))}

          <p className="mt-5 px-4 pb-1 text-xs font-semibold uppercase tracking-wider text-ink-400">
            Informações
          </p>
          {FOOTER_INFO_NAV.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} onClick={onClose}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-ink-200 p-4">
          <a
            href={generalWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <MessageCircle className="size-[18px]" aria-hidden="true" />
            Falar pelo WhatsApp
          </a>
          <Link
            to="/sacola"
            onClick={onClose}
            className="mt-2 block rounded-full px-5 py-3 text-center text-sm font-medium text-ink-600 transition-colors hover:text-brand-700"
          >
            Ver minha sacola
          </Link>
        </div>
      </div>
    </div>
  )
}
