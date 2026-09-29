import { Clock, Facebook, Instagram, Mail, MapPin, Music2 } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'
import { CONTACT, SOCIAL } from '@/config/site'
import { generalWhatsAppUrl } from '@/utils/whatsapp'
import { useSeo } from '@/utils/seo'

const SOCIAL_LINKS = [
  { label: 'Instagram', href: SOCIAL.instagram, Icon: Instagram },
  { label: 'Facebook', href: SOCIAL.facebook, Icon: Facebook },
  { label: 'TikTok', href: SOCIAL.tiktok, Icon: Music2 },
]

export default function Contact() {
  useSeo({
    title: 'Contato',
    description:
      'Fale com a Fé & Propósito pelo WhatsApp, e-mail ou redes sociais e solicite seu orçamento de produtos personalizados.',
    path: '/contato',
  })

  return (
    <div className="container-page py-6 sm:py-8 lg:py-10">
      <Breadcrumbs items={[{ label: 'Contato' }]} />

      <header className="max-w-2xl">
        <h1 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl lg:text-4xl">
          Fale com a gente
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-base">
          O WhatsApp é o nosso canal principal: é por lá que confirmamos valores, prazos,
          frete e a arte do seu produto. Responda quando quiser — a gente retoma a conversa.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:gap-6">
        <a
          href={generalWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col rounded-card bg-gradient-to-br from-[#25D366] to-[#128C4A] p-6 text-white shadow-soft transition-transform hover:-translate-y-1"
        >
          <WhatsAppIcon className="size-8" />
          <h2 className="mt-4 font-display text-lg font-bold">WhatsApp</h2>
          <p className="mt-1 text-sm text-white/85">{CONTACT.phoneDisplay}</p>
          <span className="mt-4 inline-flex w-fit rounded-full bg-white/20 px-4 py-2 text-xs font-bold uppercase tracking-wide">
            Iniciar conversa
          </span>
        </a>

        <div className="rounded-card border border-ink-200 bg-white p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold text-ink-900">Outros canais</h2>
          <ul className="mt-4 space-y-4 text-sm text-ink-600">
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
              <a
                href={`mailto:${CONTACT.email}`}
                className="transition-colors hover:text-brand-700"
              >
                {CONTACT.email}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
              {CONTACT.city}
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
              <span>
                {CONTACT.hours.map((entry) => (
                  <span key={entry.days} className="block">
                    <strong className="font-semibold text-ink-800">{entry.days}:</strong>{' '}
                    {entry.time}
                  </span>
                ))}
              </span>
            </li>
          </ul>

          <h3 className="mt-6 text-sm font-semibold text-ink-900">Redes sociais</h3>
          <ul className="mt-3 flex gap-2">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid size-11 place-items-center rounded-full border border-ink-200 text-ink-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  <Icon className="size-5" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-8 rounded-card border border-brand-100 bg-brand-50 p-5 text-sm leading-relaxed text-ink-600">
        <strong className="font-semibold text-ink-900">Sobre a sua arte:</strong> se você já tem
        o arquivo, pode anexá-lo direto na conversa do WhatsApp (PNG, JPG ou PDF). Se ainda não
        tem, descreva a ideia — a gente cria e envia uma prova digital para você aprovar.
      </p>
    </div>
  )
}
