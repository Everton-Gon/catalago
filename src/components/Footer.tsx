import { Link } from 'react-router-dom'
import { Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, Music2 } from 'lucide-react'
import Logo from './Logo'
import { CONTACT, SITE, SOCIAL } from '@/config/site'
import { CATEGORY_LINKS, FOOTER_INFO_NAV } from '@/config/navigation'
import { generalWhatsAppUrl } from '@/utils/whatsapp'

const SOCIAL_LINKS = [
  { label: 'Instagram', href: SOCIAL.instagram, Icon: Instagram },
  { label: 'Facebook', href: SOCIAL.facebook, Icon: Facebook },
  { label: 'TikTok', href: SOCIAL.tiktok, Icon: Music2 },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-ink-200 bg-white">
      <div className="container-page py-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-600">
              {SITE.description}
            </p>
            <ul className="mt-5 flex gap-2">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-10 place-items-center rounded-full border border-ink-200 text-ink-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                  >
                    <Icon className="size-[18px]" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-labelledby="footer-loja">
            <h2 id="footer-loja" className="text-sm font-semibold uppercase tracking-wider text-ink-900">
              Loja
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-ink-600 transition-colors hover:text-brand-700">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/produtos" className="text-ink-600 transition-colors hover:text-brand-700">
                  Todos os produtos
                </Link>
              </li>
              {CATEGORY_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-ink-600 transition-colors hover:text-brand-700">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-900">
              Atendimento
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-600">
              <li>
                <a
                  href={generalWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-brand-700"
                >
                  <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
                  WhatsApp {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-brand-700"
                >
                  <Mail className="size-4 shrink-0" aria-hidden="true" />
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {CONTACT.city}
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  {CONTACT.hours.map((entry) => (
                    <span key={entry.days} className="block">
                      {entry.days}: {entry.time}
                    </span>
                  ))}
                </span>
              </li>
              <li>
                <a
                  href={generalWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-800"
                >
                  Solicitar orçamento
                </a>
              </li>
            </ul>
          </div>

          <nav aria-labelledby="footer-info">
            <h2 id="footer-info" className="text-sm font-semibold uppercase tracking-wider text-ink-900">
              Informações
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {FOOTER_INFO_NAV.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-ink-600 transition-colors hover:text-brand-700">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/sacola" className="text-ink-600 transition-colors hover:text-brand-700">
                  Minha sacola
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-ink-200 pt-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name}. Todos os direitos reservados.
          </p>
          <p>
            Os valores exibidos são estimativas. O orçamento final é confirmado pelo WhatsApp.
          </p>
        </div>
      </div>
    </footer>
  )
}
