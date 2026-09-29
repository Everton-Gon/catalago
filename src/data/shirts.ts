import type { Product, ProductColor, Variant } from '@/types'
import { r2ImageUrl } from './r2'

interface StampImage {
  image: string
  legacySlug: string
}

function buildLegacySlugs(length: number, slugBase: string): string[] {
  return Array.from({ length }, (_, index) => {
    const number = String(index + 1).padStart(2, '0')
    return index === 0 ? slugBase : `${slugBase}-${number}`
  })
}

const legacySlugGroups = [
  buildLegacySlugs(41, 'camiseta-100-algodao-personalizada'),
  buildLegacySlugs(13, 'camiseta-poliester-personalizada'),
  buildLegacySlugs(36, 'camiseta-preta-personalizada'),
]

/** Mantém os identificadores antigos para não invalidar itens já salvos na sacola. */
const legacySlugs = Array.from({
  length: Math.max(...legacySlugGroups.map((slugs) => slugs.length)),
}).flatMap((_, index) => legacySlugGroups.flatMap((slugs) => slugs[index] ?? []))

const SHIRT_OBJECT_KEYS = [
  'Camisa/IMG-20260911-WA0004.jpg',
  'Camisa/IMG-20260911-WA0005.jpg',
  'Camisa/IMG-20260911-WA0021.jpg',
  'Camisa/IMG-20260911-WA0022.jpg',
  'Camisa/IMG-20260912-WA0025.jpg',
  'Camisa/IMG-20260916-WA0015[1].jpg',
  'Camisa/IMG-20260920-WA0008[1].jpg',
  'Camisa/IMG-20260921-WA0011.jpg',
  'Camisa/IMG-20260921-WA0013.jpg',
  'Camisa/IMG-20260921-WA0014.jpg',
  'Camisa/Screenshot_20260909_184211_Instagram.jpg',
  'Camisa/Screenshot_20260909_184222_Instagram.jpg',
  'Camisa/Screenshot_20260909_184250_Instagram.jpg',
  'Camisa/Screenshot_20260909_184254_Instagram.jpg',
  'Camisa/Screenshot_20260909_184310_Instagram.jpg',
  'Camisa/Screenshot_20260909_184313_Instagram.jpg',
  'Camisa/Screenshot_20260909_184329_Instagram.jpg',
  'Camisa/Screenshot_20260909_184357_Instagram.jpg',
  'Camisa/Screenshot_20260909_184400_Instagram.jpg',
  'Camisa/Screenshot_20260909_184412_Instagram.jpg',
  'Camisa/Screenshot_20260909_184415_Instagram.jpg',
  'Camisa/Screenshot_20260909_184447_Instagram.jpg',
  'Camisa/Screenshot_20260909_184450_Instagram.jpg',
  'Camisa/Screenshot_20260909_184511_Instagram.jpg',
  'Camisa/Screenshot_20260909_184523_Instagram.jpg',
  'Camisa/Screenshot_20260909_184523_ram.jpg',
  'Camisa/Screenshot_20260909_184531_Instagram.jpg',
  'Camisa/Screenshot_20260909_184534_Instagram.jpg',
  'Camisa/Screenshot_20260909_184552_Instagram.jpg',
  'Camisa/Screenshot_20260909_184646_Instagram.jpg',
  'Camisa/Screenshot_20260909_184649_Instagram.jpg',
  'Camisa/Screenshot_20260909_184702_Instagram.jpg',
  'Camisa/Screenshot_20260909_184705_Instagram.jpg',
  'Camisa/Screenshot_20260909_184721_Instagram.jpg',
  'Camisa/Screenshot_20260909_184730_Instagram.jpg',
  'Camisa/Screenshot_20260909_184743_Instagram.jpg',
  'Camisa/Screenshot_20260909_184748_Instagram.jpg',
  'Camisa/Screenshot_20260909_185003_Instagram.jpg',
  'Camisa/Screenshot_20260909_185003_gram.jpg',
  'Camisa/Screenshot_20260909_185115_Instagram.jpg',
  'Camisa/Screenshot_20260909_185117_Instagram.jpg',
  'Camisa/Screenshot_20260909_211534_Instagram.jpg',
  'Camisa/Screenshot_20260909_211829_Instagram.jpg',
  'Camisa/Screenshot_20260909_211846_Instagram.jpg',
  'Camisa/Screenshot_20260909_211935_Instagram.jpg',
  'Camisa/Screenshot_20260909_211957_Instagram.jpg',
  'Camisa/Screenshot_20260909_212147_Instagram.jpg',
  'Camisa/Screenshot_20260909_212248_Instagram.jpg',
  'Camisa/Screenshot_20260909_212255_Instagram.jpg',
  'Camisa/Screenshot_20260909_212310_Instagram.jpg',
  'Camisa/Screenshot_20260909_212329_Instagram.jpg',
  'Camisa/Screenshot_20260909_212346_Instagram.jpg',
  'Camisa/Screenshot_20260909_212350_Instagram.jpg',
  'Camisa/Screenshot_20260909_212354_Instagram.jpg',
  'Camisa/Screenshot_20260909_212402_Instagram.jpg',
  'Camisa/Screenshot_20260909_212416_Instagram.jpg',
  'Camisa/Screenshot_20260909_212419_Instagram.jpg',
  'Camisa/Screenshot_20260909_212429_Instagram.jpg',
  'Camisa/Screenshot_20260909_212445_Instagram.jpg',
  'Camisa/Screenshot_20260909_212543_Instagram.jpg',
  'Camisa/Screenshot_20260909_212619_Instagram.jpg',
  'Camisa/Screenshot_20260909_212855_Instagram.jpg',
  'Camisa/Screenshot_20260909_213133_Instagram.jpg',
  'Camisa/Screenshot_20260920_230533_Instagram[1].jpg',
  'Camisa/Screenshot_20260922_204454_Instagram.jpg',
  'Camisa/Screenshot_20260922_204508_Instagram.jpg',
  'Camisa/Screenshot_20260922_204515_Instagram.jpg',
  'Camisa/Screenshot_20260922_204523_Instagram.jpg',
  'Camisa/Screenshot_20260922_204532_Instagram.jpg',
  'Camisa/Screenshot_20260922_204537_Instagram.jpg',
  'Camisa/Screenshot_20260922_204553_Instagram.jpg',
  'Camisa/Screenshot_20260922_204557_Instagram.jpg',
  'Camisa/Screenshot_20260922_204604_Instagram.jpg',
  'Camisa/Screenshot_20260922_204611_Instagram.jpg',
  'Camisa/Screenshot_20260922_225247_Instagram[1].jpg',
  'Camisa/Screenshot_20260923_171722_Instagram[1].jpg',
  'Camisa/Screenshot_20260923_171733_Instagram[1].jpg',
  'Camisa/Screenshot_20260923_220515_Instagram.jpg',
  'Camisa/Screenshot_20260923_220524_Instagram.jpg',
  'Camisa/Screenshot_20260923_220738_Instagram.jpg',
  'Camisa/Screenshot_20260924_113757_Instagram.jpg',
  'Camisa/Screenshot_20260924_140728_Instagram.jpg',
  'Camisa/Screenshot_20260924_140827_Instagram.jpg',
  'Camisa/Screenshot_20260924_140908_Instagram.jpg',
  'Camisa/Screenshot_20260924_140953_Instagram.jpg',
  'Camisa/Screenshot_20260924_141035_Instagram.jpg',
  'Camisa/Screenshot_20260924_141038_Instagram.jpg',
  'Camisa/Screenshot_20260924_163642_Instagram[1].jpg',
  'Camisa/Screenshot_20260924_193012_Instagram.jpg',
  'Camisa/Screenshot_20260924_193019_Instagram.jpg',
  'Camisa/Screenshot_20260924_215122_Instagram[1].jpg',
] as const

const stampImages: StampImage[] = SHIRT_OBJECT_KEYS.map((objectKey, index) => ({
  image: r2ImageUrl(objectKey),
  legacySlug: legacySlugs[index] ?? `camiseta-personalizada-${String(index + 1).padStart(3, '0')}`,
}))

export const SHIRT_COLORS: ProductColor[] = [
  { id: 'verde', name: 'Verde', hex: '#3F7D4E', checkContrast: 'light' },
  { id: 'bege', name: 'Bege', hex: '#D8C3A5', checkContrast: 'dark' },
  { id: 'rosa', name: 'Rosa', hex: '#E7A1B0', checkContrast: 'dark' },
  { id: 'azul', name: 'Azul', hex: '#315C9B', checkContrast: 'light' },
  { id: 'preto', name: 'Preto', hex: '#1C1917', checkContrast: 'light' },
  { id: 'branco', name: 'Branco', hex: '#FFFFFF', checkContrast: 'dark' },
  { id: 'amarelo', name: 'Amarelo', hex: '#F2C94C', checkContrast: 'dark' },
  { id: 'lilas', name: 'Lilás', hex: '#B59BD8', checkContrast: 'dark' },
  { id: 'roxo', name: 'Roxo', hex: '#6D28D9', checkContrast: 'light' },
]

const SHIRT_VARIANTS: Variant[] = [
  {
    id: 'tecido',
    name: 'Tecido',
    required: true,
    options: [
      { label: '100% Algodão', value: 'algodao', price: 45, oldPrice: 55 },
      { label: 'Poliéster', value: 'poliester', price: 35, oldPrice: 40 },
    ],
  },
  {
    id: 'modelo',
    name: 'Modelo',
    required: true,
    options: [
      { label: 'Tradicional', value: 'tradicional' },
      { label: 'Oversized', value: 'oversized', priceOnRequest: true },
      { label: 'Gola Polo', value: 'polo', priceOnRequest: true },
    ],
  },
  {
    id: 'cor',
    name: 'Cor',
    required: true,
    options: [{ label: 'Conforme a foto' }, { label: 'Consultar outras cores' }],
  },
  {
    id: 'tamanho',
    name: 'Tamanho',
    required: true,
    options: [
      { label: 'P' },
      { label: 'M' },
      { label: 'G' },
      { label: 'GG', priceDelta: 3 },
    ],
  },
]

const DESCRIPTION =
  'Camiseta personalizada com sua estampa favorita. Escolha o tecido, tamanho e demais opções para montar sua camiseta do seu jeito.'

function createShirtProduct(stamp: StampImage, index: number): Product {
  const reference = String(index + 1).padStart(3, '0')

  return {
    id: stamp.legacySlug,
    name: 'Camiseta Personalizada',
    slug: stamp.legacySlug,
    printName: `Referência ${reference}`,
    shortDescription: DESCRIPTION,
    description: DESCRIPTION,
    category: 'camisetas',
    images: [stamp.image],
    colors: SHIRT_COLORS,
    price: 35,
    featured: index < 2,
    available: true,
    salesRank: Math.max(1, 100 - index),
    variants: SHIRT_VARIANTS,
    personalization: {
      enabled: true,
      nameField: {
        label: 'Nome para personalização',
        placeholder: 'Ex.: nome que vai nas costas',
        maxLength: 40,
      },
      textField: {
        label: 'Texto da estampa',
        placeholder: 'Ex.: frase ou tema desejado',
        maxLength: 160,
      },
    },
    createdAt: '2026-03-01',
  }
}

/** Uma entrada por foto/estampa; tecido é uma variação, nunca outro produto. */
export const SHIRT_PRODUCTS: Product[] = stampImages.map(createShirtProduct)



