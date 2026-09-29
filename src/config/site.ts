/**
 * Configuração central da loja.
 *
 * >>> EDITE AQUI <<<
 * Número de WhatsApp, contatos, redes sociais e textos institucionais ficam
 * todos neste arquivo. Nenhum destes valores deve ser repetido no resto do código.
 */

export const SITE = {
  name: 'Fé & Propósito',
  shortName: 'Fé & Propósito',
  tagline: 'Produtos personalizados e sublimação',
  description:
    'Canecas, camisetas, copos e kits personalizados sob medida. Monte sua sacola e receba o orçamento pelo WhatsApp.',
  /** Usado nas tags Open Graph e no sitemap quando o site for publicado. */
  url: 'https://www.feproposito.com.br',
} as const

/**
 * Número do WhatsApp no formato internacional, somente dígitos:
 * 55 (Brasil) + DDD + número. Ex.: 5511987654321
 */
export const WHATSAPP_NUMBER = '5585986389141'

/** Mensagem usada no botão flutuante e nos CTAs genéricos de contato. */
export const WHATSAPP_DEFAULT_MESSAGE =
  'Olá! Vim pelo site e gostaria de saber mais sobre os produtos personalizados.'

export const CONTACT = {
  /** Exibido no rodapé e na página de contato. */
  phoneDisplay: '(85) 98638-9141',
  email: 'fepropositos@gmail.com',
  city: 'Maranguape — CE',
  hours: [
    { days: 'Segunda a sexta', time: '09h às 18h' },
    { days: 'Sábado', time: '09h às 13h' },
    { days: 'Domingo e feriados', time: '09h às 12h' },
  ],
} as const

export const SOCIAL = {
  instagram: 'https://instagram.com/fe_e_proposito01?stkn=MWMyZzk3Z2MmxxNg==',
  facebook: 'https://facebook.com/',
  tiktok: 'https://tiktok.com/',
} as const

/** Prazo médio informado ao cliente (apenas texto institucional). */
export const PRODUCTION_TIME = '3 a 5 dias úteis'
