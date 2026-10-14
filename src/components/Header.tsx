import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, ShoppingBag } from 'lucide-react'
import Logo from './Logo'
import SearchBar from './SearchBar'
import MobileMenu from './MobileMenu'
import WhatsAppIcon from './icons/WhatsAppIcon'
import { CATEGORY_LINKS } from '@/config/navigation'
import { generalWhatsAppUrl } from '@/utils/whatsapp'
import { useCart } from '@/contexts/CartContext'

export default function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false)
  const { itemCount, openDrawer } = useCart()
  const location = useLocation()
  useEffect(() => setMenuOpen(false), [location.pathname])
  return <>
    <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
    <div className="announcement">Fé nos detalhes. Propósito em cada personalizado.</div>
    <header className="store-header">
      <div className="container-page header-main">
        <button type="button" className="header-menu icon-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu size={22} aria-hidden="true" /></button>
        <Logo className="header-logo" />
        <SearchBar className="header-search" placeholder="O que você quer personalizar hoje?" />
        <a className="header-contact" aria-label="Atendimento pelo WhatsApp" href={generalWhatsAppUrl()} target="_blank" rel="noopener noreferrer"><WhatsAppIcon className="size-5" /><span>Vamos conversar?<strong>Atendimento pelo WhatsApp</strong></span></a>
        <button type="button" onClick={openDrawer} className="header-bag icon-button" aria-label={`Abrir sacola — ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`}><ShoppingBag size={23} aria-hidden="true" /><span className="bag-count">{itemCount > 99 ? '99+' : itemCount}</span><span className="bag-label">Sacola</span></button>
      </div>
      <nav className="header-nav container-page" aria-label="Navegação principal">
        {[{ label: 'Início', to: '/' }, { label: 'Todos os produtos', to: '/produtos' }, ...CATEGORY_LINKS].map(link => <NavLink key={link.to} to={link.to} end className={({ isActive }) => isActive ? 'active' : ''}>{link.label}</NavLink>)}
      </nav>
    </header>
    <MobileMenu open={isMenuOpen} onClose={() => setMenuOpen(false)} />
  </>
}
