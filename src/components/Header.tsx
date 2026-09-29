import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, Search, ShoppingBag } from 'lucide-react'
import Logo from './Logo'
import SearchBar from './SearchBar'
import MobileMenu from './MobileMenu'
import { MAIN_NAV } from '@/config/navigation'
import { useCart } from '@/contexts/CartContext'

export default function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [isSearchOpen, setSearchOpen] = useState(false)
  const [isScrolled, setScrolled] = useState(false)
  const { itemCount, openDrawer } = useCart()
  const location = useLocation()

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fecha a busca mobile ao trocar de página.
  useEffect(() => setSearchOpen(false), [location.pathname])

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Pular para o conteúdo
      </a>

      <header
        className={`sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm transition-shadow ${
          isScrolled ? 'border-ink-200 shadow-soft' : 'border-transparent'
        }`}
      >
        <div className="container-page flex h-16 items-center gap-3 lg:h-20 lg:gap-6">
          <Logo className="shrink-0" />

          <nav
            className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex"
            aria-label="Navegação principal"
          >
            {MAIN_NAV.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/' || link.to === '/produtos'}
                className={({ isActive }) =>
                  `relative whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors xl:px-3.5 ${
                    isActive ? 'text-brand-700' : 'text-ink-600 hover:text-brand-700'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    <span
                      className={`absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-600 transition-opacity ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <SearchBar className="hidden w-56 xl:block xl:w-64" />

            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              className="rounded-full p-2.5 text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 xl:hidden"
              aria-label="Buscar produtos"
              aria-expanded={isSearchOpen}
            >
              <Search className="size-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={openDrawer}
              className="relative rounded-full p-2.5 text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
              aria-label={`Abrir sacola — ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`}
            >
              <ShoppingBag className="size-5" aria-hidden="true" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-accent-500 px-1 text-[11px] font-bold leading-5 text-ink-900">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="rounded-full p-2.5 text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="container-page pb-3 xl:hidden">
            <SearchBar autoFocus onDone={() => setSearchOpen(false)} />
          </div>
        )}
      </header>

      <MobileMenu open={isMenuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
