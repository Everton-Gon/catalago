import { generalWhatsAppUrl } from '@/utils/whatsapp'

export interface HomeBanner {
  id: string
  name: string
  title: string
  emphasis?: string
  description: string
  image: string | null
  mobileImage?: string
  imageAlt: string
  width: number
  height: number
  primary: { label: string; href: string }
  secondary: { label: string; href: string }
  tone?: 'light' | 'dark'
  missingAsset?: string
  cropLeft?: number
}

/** Approved order. A null image deliberately keeps an unfinished banner off the storefront. */
export const HOME_BANNERS: HomeBanner[] = [
  {
    id: 'gospel', name: 'Gospel',
    title: 'Personalizados que expressam sua fé e seu estilo.', emphasis: 'sua fé e seu estilo.',
    description: 'Camisas e canecas feitas para você e para quem você ama.',
    image: '/brand/banner-fe-proposito-wide.webp',
    imageAlt: 'Camisa bege com a palavra Fé e caneca Propósito com folhas, sobre pedras claras.',
    width: 2078, height: 757,
    primary: { label: 'Explorar produtos', href: '/produtos' },
    secondary: { label: 'Pedir pelo WhatsApp', href: generalWhatsAppUrl() },
  },
  {
    id: 'filmes-series', name: 'Filmes e séries',
    title: 'Suas histórias favoritas, no seu estilo.',
    description: 'Personalizados de Harry Potter, Vingadores: Doomsday e Duna. Consulte as opções pelo WhatsApp.',
    image: '/brand/banner-filmes-series.webp', tone: 'dark', cropLeft: 0.47,
    imageAlt: 'Camisa preta Harry Potter, caneca verde Vingadores: Doomsday e caneca Duna, em cenário de cinema.',
    width: 3584, height: 1184,
    primary: { label: 'Consultar opções', href: generalWhatsAppUrl('Olá! Quero consultar personalizados de Harry Potter, Vingadores: Doomsday e Duna.') },
    secondary: { label: 'Pedir pelo WhatsApp', href: generalWhatsAppUrl('Olá! Quero pedir um personalizado de filmes e séries.') },
  },
  {
    id: 'animes-desenhos', name: 'Animes e desenhos',
    title: 'Personagens que acompanham sua história.',
    description: 'Dragon Ball Super, One Piece e Demon Slayer em personalizados. Consulte as opções com a gente.',
    image: '/brand/banner-animes-desenhos.webp', tone: 'dark',
    imageAlt: 'Produtos de Dragon Ball Super, One Piece e Demon Slayer, cada um com uma única franquia.',
    width: 2078, height: 757,
    primary: { label: 'Consultar opções', href: generalWhatsAppUrl('Olá! Quero consultar personalizados de Dragon Ball Super, One Piece e Demon Slayer.') },
    secondary: { label: 'Pedir pelo WhatsApp', href: generalWhatsAppUrl('Olá! Quero pedir um personalizado de animes e desenhos.') },

  },
  {
    id: 'games', name: 'Games',
    title: 'Leve seu universo favorito para o dia a dia.',
    description: 'Minecraft, Call of Duty e Street Fighter em personalizados. Consulte as opções pelo WhatsApp.',
    image: '/brand/banner-games.webp', tone: 'dark',
    imageAlt: 'Produtos de Minecraft, Call of Duty e Street Fighter, cada um com uma única franquia.',
    width: 2079, height: 756,
    primary: { label: 'Consultar opções', href: generalWhatsAppUrl('Olá! Quero consultar personalizados de Minecraft, Call of Duty e Street Fighter.') },
    secondary: { label: 'Pedir pelo WhatsApp', href: generalWhatsAppUrl('Olá! Quero pedir um personalizado de games.') },

  },
  {
    id: 'presentes', name: 'Presentes personalizados',
    title: 'Um presente com um pouco de você.',
    description: 'Escolha um presente e conte os detalhes que tornam esse momento especial.',
    image: '/brand/banner-presentes.webp', tone: 'light',
    imageAlt: 'Composição de presentes personalizados, com produtos completos e espaço livre para texto.',
    width: 2078, height: 757,
    primary: { label: 'Explorar presentes', href: '/categoria/kits' },
    secondary: { label: 'Pedir pelo WhatsApp', href: generalWhatsAppUrl('Olá! Quero montar um presente personalizado.') },

  },
  {
    id: 'modelos-canecas', name: 'Modelos de caneca',
    title: 'Uma caneca para cada estilo.',
    description: 'Seu filme, anime ou game favorito em canecas com alça de coração, borda dourada ou colher.',
    image: '/brand/banner-canecas-personalizadas.webp', tone: 'dark',
    imageAlt: 'Caneca azul com alça de coração e estampa One Piece, caneca rosa com borda dourada e castelo de fantasia, e caneca vermelha com colher e estampa de Ryu de Street Fighter.',
    width: 2079, height: 756,
    primary: { label: 'Explorar canecas', href: '/categoria/canecas' },
    secondary: { label: 'Pedir pelo WhatsApp', href: generalWhatsAppUrl('Olá! Quero personalizar uma caneca. Gostaria de consultar os modelos com alça de coração, borda dourada ou colher.') },
  },
]

export const AVAILABLE_HOME_BANNERS = HOME_BANNERS.filter((banner): banner is HomeBanner & { image: string } => Boolean(banner.image))
