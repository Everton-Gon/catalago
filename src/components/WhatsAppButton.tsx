import WhatsAppIcon from './icons/WhatsAppIcon'
import { generalWhatsAppUrl } from '@/utils/whatsapp'
import { track } from '@/utils/analytics'

/**
 * Botão flutuante de contato.
 *
 * Fica acima da barra fixa da sacola no mobile (bottom-20) e desce para o
 * canto normal a partir de sm, onde aquela barra não existe.
 */
export default function WhatsAppButton() {
  return (
    <a
      href={generalWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('begin_whatsapp_quote', { source: 'floating_button' })}
      className="group fixed bottom-4 right-4 z-40 flex items-center gap-2.5 rounded-full bg-[#17633c] p-3.5 text-white shadow-soft transition-colors duration-200 hover:bg-[#124e30] sm:bottom-6 sm:right-6 sm:p-4"
      aria-label="Fale conosco pelo WhatsApp"
    >
      <WhatsAppIcon className="size-6 sm:size-7" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-56 group-hover:pr-1 lg:block">
        Fale conosco pelo WhatsApp
      </span>
    </a>
  )
}
