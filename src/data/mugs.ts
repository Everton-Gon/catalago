import type { MugType, Product } from '@/types'
import { r2ImageUrl } from './r2'

interface MugArtwork {
  sourceNumber: number
  image: string
  type: MugType
  theme: string
  slug: string
}

const PAINTING_OBJECT_KEYS = [
  'Caneca pintura/IMG-20260921-WA0010.jpg',
  'Caneca pintura/IMG-20260921-WA0015.jpg',
  'Caneca pintura/IMG-20260923-WA0000.jpg',
  'Caneca pintura/IMG-20260923-WA0001.jpg',
  'Caneca pintura/IMG-20260923-WA0002.jpg',
  'Caneca pintura/IMG-20260923-WA0003.jpg',
  'Caneca pintura/IMG-20260923-WA0004.jpg',
  'Caneca pintura/IMG-20260923-WA0005.jpg',
  'Caneca pintura/IMG-20260923-WA0006.jpg',
  'Caneca pintura/IMG-20260923-WA0007.jpg',
  'Caneca pintura/IMG-20260923-WA0008.jpg',
  'Caneca pintura/IMG-20260923-WA0009.jpg',
  'Caneca pintura/IMG-20260923-WA0010.jpg',
  'Caneca pintura/IMG-20260923-WA0011.jpg',
  'Caneca pintura/IMG-20260923-WA0012.jpg',
  'Caneca pintura/IMG-20260923-WA0013.jpg',
  'Caneca pintura/IMG-20260923-WA0014.jpg',
  'Caneca pintura/IMG-20260923-WA0015.jpg',
  'Caneca pintura/IMG-20260923-WA0016.jpg',
  'Caneca pintura/IMG-20260923-WA0017.jpg',
  'Caneca pintura/IMG-20260923-WA0018.jpg',
] as const

const TRADITIONAL_OBJECT_KEYS = [
  'Caneca normal/IMG-20260918-WA0014.jpg',
  'Caneca normal/IMG-20260918-WA0015.jpg',
  'Caneca normal/Screenshot_20260916_190619_ChatGPT[1].jpg',
  'Caneca normal/Screenshot_20260916_190623_ChatGPT[1].jpg',
  'Caneca normal/Screenshot_20260916_190626_ChatGPT[1].jpg',
  'Caneca normal/WhatsApp Image 2026-09-27 at 15.05.50.jpeg',
  'Caneca normal/WhatsApp Image 2026-09-27 at 15.05.51 (1).jpeg',
  'Caneca normal/WhatsApp Image 2026-09-27 at 15.05.51 (2).jpeg',
  'Caneca normal/WhatsApp Image 2026-09-27 at 15.05.51 (3).jpeg',
  'Caneca normal/WhatsApp Image 2026-09-27 at 15.05.51.jpeg',
  'Caneca normal/WhatsApp Image 2026-09-27 at 15.05.52 (2).jpeg',
  'Caneca normal/WhatsApp Image 2026-09-27 at 15.05.52 (3).jpeg',
  'Caneca normal/WhatsApp Image 2026-09-27 at 15.05.52 (4).jpeg',
  'Caneca normal/WhatsApp Image 2026-09-27 at 15.05.52 (5).jpeg',
  'Caneca normal/WhatsApp Image 2026-09-27 at 15.05.52.jpeg',
  'Caneca normal/WhatsApp Image 2026-09-27 at 15.05.53.jpeg',
  'Caneca normal/caneca-catalogo-033.jpeg',
] as const

const TRADITIONAL_SOURCE_NUMBERS = [
  1, 2, 24, 25, 26, 27, 28, 29, 30, 32, 33, 34, 35, 36, 37, 38, 39,
] as const

const cloudImageBySourceNumber = new Map<number, string>([
  ...PAINTING_OBJECT_KEYS.map((objectKey, index) => [3 + index, r2ImageUrl(objectKey)] as const),
  ...TRADITIONAL_OBJECT_KEYS.map(
    (objectKey, index) => [TRADITIONAL_SOURCE_NUMBERS[index], r2ImageUrl(objectKey)] as const,
  ),
])

const ARTWORKS: MugArtwork[] = [
  { sourceNumber: 1, image: '/produtos/caneca-magica-personalizada-1.jpg', type: 'porcelana', theme: 'Flamengo', slug: 'caneca-branca-personalizada' },
  { sourceNumber: 2, image: '/produtos/caneca-magica-personalizada-2.jpg', type: 'magica', theme: 'Metroid Dread', slug: 'caneca-magica-personalizada' },
  { sourceNumber: 3, image: '/produtos/caneca-com-alca-colorida-2.jpg', type: 'colorir', theme: 'Dinossauros', slug: 'caneca-com-alca-colorida' },
  { sourceNumber: 4, image: '/produtos/caneca-branca-personalizada-1.jpg', type: 'colorir', theme: 'Jesus', slug: 'caneca-para-colorir-jesus' },
  { sourceNumber: 5, image: '/produtos/caneca-branca-personalizada-2.jpg', type: 'colorir', theme: 'Peppa Pig', slug: 'caneca-para-colorir-peppa-pig' },
  { sourceNumber: 6, image: '/produtos/caneca-branca-personalizada-3.jpg', type: 'colorir', theme: 'Wandinha', slug: 'caneca-para-colorir-wandinha' },
  { sourceNumber: 7, image: '/produtos/caneca-branca-personalizada-4.jpg', type: 'colorir', theme: 'Frozen', slug: 'caneca-para-colorir-frozen' },
  { sourceNumber: 8, image: '/produtos/caneca-com-alca-colorida-5.jpg', type: 'colorir', theme: 'Minecraft', slug: 'caneca-para-colorir-minecraft' },
  { sourceNumber: 9, image: '/produtos/caneca-branca-personalizada-5.jpg', type: 'colorir', theme: 'Minions', slug: 'caneca-para-colorir-minions' },
  { sourceNumber: 10, image: '/produtos/caneca-branca-personalizada-6.jpg', type: 'colorir', theme: 'Dora', slug: 'caneca-para-colorir-dora' },
  { sourceNumber: 11, image: '/produtos/caneca-branca-personalizada-7.jpg', type: 'colorir', theme: 'Mundo Bita', slug: 'caneca-para-colorir-mundo-bita' },
  { sourceNumber: 12, image: '/produtos/caneca-branca-personalizada-8.jpg', type: 'colorir', theme: 'Stitch', slug: 'caneca-para-colorir-stitch' },
  { sourceNumber: 13, image: '/produtos/caneca-branca-personalizada-9.jpg', type: 'colorir', theme: 'Bluey', slug: 'caneca-para-colorir-bluey' },
  { sourceNumber: 14, image: '/produtos/caneca-com-alca-colorida-6.jpg', type: 'colorir', theme: 'Turminha Infantil', slug: 'caneca-para-colorir-turminha-infantil' },
  { sourceNumber: 15, image: '/produtos/caneca-com-alca-colorida-3.jpg', type: 'colorir', theme: 'Sonic', slug: 'caneca-para-colorir-sonic' },
  { sourceNumber: 16, image: '/produtos/caneca-branca-personalizada-10.jpg', type: 'colorir', theme: 'Roblox', slug: 'caneca-para-colorir-roblox' },
  { sourceNumber: 17, image: '/produtos/caneca-branca-personalizada-11.jpg', type: 'colorir', theme: 'Patrulha Canina', slug: 'caneca-para-colorir-patrulha-canina' },
  { sourceNumber: 18, image: '/produtos/caneca-com-alca-colorida-7.jpg', type: 'colorir', theme: 'Gumball', slug: 'caneca-para-colorir-gumball' },
  { sourceNumber: 19, image: '/produtos/caneca-branca-personalizada-12.jpg', type: 'colorir', theme: 'Minnie', slug: 'caneca-para-colorir-minnie' },
  { sourceNumber: 20, image: '/produtos/caneca-com-alca-colorida-8.jpg', type: 'colorir', theme: 'Turma da Mônica', slug: 'caneca-para-colorir-turma-da-monica' },
  { sourceNumber: 21, image: '/produtos/caneca-com-alca-colorida-4.jpg', type: 'colorir', theme: 'Super Mario', slug: 'caneca-para-colorir-super-mario' },
  { sourceNumber: 22, image: '/produtos/caneca-branca-personalizada-13.jpg', type: 'colorir', theme: 'Jovens Titãs', slug: 'caneca-para-colorir-jovens-titas' },
  { sourceNumber: 23, image: '/produtos/caneca-branca-personalizada-14.jpg', type: 'colorir', theme: 'Guerreiras', slug: 'caneca-para-colorir-guerreiras' },
  { sourceNumber: 24, image: '/produtos/caneca-magica-personalizada-3.jpg', type: 'porcelana', theme: 'Gamer', slug: 'caneca-personalizada-gamer-controles' },
  { sourceNumber: 25, image: '/produtos/caneca-com-alca-colorida-1.jpg', type: 'porcelana', theme: 'Jesus', slug: 'caneca-personalizada-jesus-coracao' },
  { sourceNumber: 26, image: '/produtos/caneca-branca-personalizada-15.jpg', type: 'porcelana', theme: 'Gamer', slug: 'caneca-personalizada-gamer' },
  { sourceNumber: 27, image: '/produtos/caneca-catalogo-027.jpeg', type: 'porcelana', theme: 'Jesus', slug: 'caneca-personalizada-jesus' },
  { sourceNumber: 28, image: '/produtos/caneca-catalogo-028.jpeg', type: 'porcelana', theme: 'Super Professor — Homem de Ferro', slug: 'caneca-personalizada-super-professor-homem-de-ferro' },
  { sourceNumber: 29, image: '/produtos/caneca-catalogo-029.jpeg', type: 'porcelana', theme: 'Super Professor — Superman', slug: 'caneca-personalizada-super-professor-superman' },
  { sourceNumber: 30, image: '/produtos/caneca-catalogo-030.jpeg', type: 'porcelana', theme: 'Super Professor — Batman', slug: 'caneca-personalizada-super-professor-batman' },
  { sourceNumber: 32, image: '/produtos/caneca-catalogo-032.jpeg', type: 'porcelana', theme: 'Super Professora — Mulher-Maravilha', slug: 'caneca-personalizada-super-professora-mulher-maravilha' },
  { sourceNumber: 33, image: '/produtos/caneca-catalogo-033.jpeg', type: 'porcelana', theme: 'Professora', slug: 'caneca-personalizada-professora' },
  { sourceNumber: 34, image: '/produtos/caneca-catalogo-034.jpeg', type: 'porcelana', theme: 'Mãe de Pet — Husky', slug: 'caneca-personalizada-mae-de-pet-husky' },
  { sourceNumber: 35, image: '/produtos/caneca-catalogo-035.jpeg', type: 'porcelana', theme: 'Mãe de Pet — Poodle', slug: 'caneca-personalizada-mae-de-pet-poodle' },
  { sourceNumber: 36, image: '/produtos/caneca-catalogo-036.jpeg', type: 'porcelana', theme: 'Popeye e Café', slug: 'caneca-personalizada-popeye-cafe' },
  { sourceNumber: 37, image: '/produtos/caneca-catalogo-037.jpeg', type: 'porcelana', theme: 'Galinha e Café', slug: 'caneca-personalizada-galinha-cafe' },
  { sourceNumber: 38, image: '/produtos/caneca-catalogo-038.jpeg', type: 'porcelana', theme: 'Super Professor — Hulk', slug: 'caneca-personalizada-super-professor-hulk' },
  { sourceNumber: 39, image: '/produtos/caneca-catalogo-039.jpeg', type: 'porcelana', theme: 'Cinderela', slug: 'caneca-personalizada-cinderela' },
]

const DISPLAY_ORDER = [
  1, 3, 4, 24, 5, 2, 25, 6, 26, 7, 8, 27, 9, 28, 10, 29, 11, 12, 30, 13,
  32, 14, 33, 15, 16, 34, 17, 35, 18, 36, 19, 20, 37, 21, 38, 22, 39, 23,
]

const TYPE_CONFIG: Record<MugType, {
  label: string
  price: number
  name: string
  description: string
}> = {
  porcelana: {
    label: 'Tradicional',
    price: 35,
    name: 'Caneca Tradicional',
    description: 'Caneca personalizada em porcelana, ideal para presentes e momentos especiais.',
  },
  colorir: {
    label: 'Para Pintar',
    price: 45,
    name: 'Caneca para Pintar',
    description: 'Caneca personalizada para colorir, uma opção divertida e criativa para presentear.',
  },
  magica: {
    label: 'Mágica',
    price: 45,
    name: 'Caneca Mágica',
    description: 'Caneca mágica personalizada que revela a arte com o calor da bebida.',
  },
}

function createMugProduct(artwork: MugArtwork, index: number): Product {
  const config = TYPE_CONFIG[artwork.type]

  return {
    id: artwork.slug,
    name: `${config.name} — ${artwork.theme}`,
    slug: artwork.slug,
    printName: artwork.theme,
    mugType: artwork.type,
    shortDescription: config.description,
    description: config.description,
    category: 'canecas',
    images: [cloudImageBySourceNumber.get(artwork.sourceNumber) ?? artwork.image],
    price: config.price,
    featured: index < 3,
    available: true,
    salesRank: Math.max(1, 100 - index),
    variants: [
      {
        id: 'tipo',
        name: 'Tipo',
        required: true,
        options: [{ label: config.label, value: artwork.type }],
      },
    ],
    personalization: {
      enabled: true,
      nameField: {
        label: 'Nome para personalização',
        placeholder: 'Ex.: Maria Eduarda',
        maxLength: 40,
      },
      textField: {
        label: 'Frase ou texto',
        placeholder: 'Ex.: mensagem para a caneca',
        maxLength: 160,
      },
    },
    createdAt: '2026-09-27',
  }
}

const artworkByNumber = new Map(ARTWORKS.map((artwork) => [artwork.sourceNumber, artwork]))

/** Uma entrada por arte única, com os tipos mesclados no catálogo. */
export const MUG_PRODUCTS: Product[] = DISPLAY_ORDER.map((sourceNumber, index) => {
  const artwork = artworkByNumber.get(sourceNumber)
  if (!artwork) throw new Error(`Imagem de caneca ${sourceNumber} não cadastrada.`)
  return createMugProduct(artwork, index)
})
