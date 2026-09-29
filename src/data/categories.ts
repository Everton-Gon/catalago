import type { Category, CategorySlug } from '@/types'

export const CATEGORIES: Category[] = [
  {
    slug: 'canecas',
    name: 'Canecas Personalizadas',
    shortName: 'Canecas',
    description:
      'Canecas de cerâmica com impressão por sublimação: foto, nome, frase ou arte completa. Resistentes à lavagem e ao micro-ondas.',
    emoji: '☕',
    image: '/produtos/caneca-branca-1.svg',
  },
  {
    slug: 'camisetas',
    name: 'Camisetas Personalizadas',
    shortName: 'Camisetas',
    description:
      'Camisetas em malha confortável com sua estampa. Ideais para times, eventos, empresas e presentes.',
    emoji: '👕',
    image: '/produtos/camiseta-branca-1.svg',
  },
  {
    slug: 'copos',
    name: 'Copos e Garrafas',
    shortName: 'Copos e Garrafas',
    description:
      'Copos, squeezes e garrafas térmicas personalizados para o dia a dia, academia e brindes corporativos.',
    emoji: '🥤',
    image: '/produtos/copo-1.svg',
  },
  {
    slug: 'kits',
    name: 'Kits Presente',
    shortName: 'Kits',
    description:
      'Combinações prontas para presentear: caneca, camiseta, copo e itens complementares em embalagem especial.',
    emoji: '🎁',
    image: '/produtos/kit-1.svg',
  },
  {
    slug: 'quadros',
    name: 'Quadros Personalizados',
    shortName: 'Quadros',
    description:
      'Quadros e azulejos decorativos com sua foto ou frase favorita. Acabamento pronto para pendurar.',
    emoji: '🖼️',
    image: '/produtos/quadro-1.svg',
  },
  {
    slug: 'personalizados',
    name: 'Outros Personalizados',
    shortName: 'Personalizados',
    description:
      'Almofadas, chaveiros, mousepads e projetos sob medida. Se dá para sublimar, a gente personaliza.',
    emoji: '✨',
    image: '/produtos/almofada-1.svg',
  },
]

export const CATEGORY_BY_SLUG = new Map<CategorySlug, Category>(
  CATEGORIES.map((c) => [c.slug, c]),
)

export function getCategory(slug: string): Category | undefined {
  return CATEGORY_BY_SLUG.get(slug as CategorySlug)
}
