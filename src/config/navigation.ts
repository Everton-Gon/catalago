import { CATEGORIES } from '@/data/categories'
import type { CategorySlug } from '@/types'

export interface NavLink {
  label: string
  to: string
}

/** Categorias exibidas no menu principal (as demais ficam no catálogo). */
const MENU_CATEGORIES: CategorySlug[] = [
  'canecas',
  'camisetas',
  'copos',
  'kits',
  'personalizados',
]

export const CATEGORY_LINKS: NavLink[] = CATEGORIES.map((category) => ({
  label: category.shortName,
  to: `/categoria/${category.slug}`,
}))

export const MAIN_NAV: NavLink[] = [
  { label: 'Início', to: '/' },
  { label: 'Produtos', to: '/produtos' },
  ...MENU_CATEGORIES.map((slug) => {
    const category = CATEGORIES.find((c) => c.slug === slug)!
    return { label: category.shortName, to: `/categoria/${category.slug}` }
  }),
]

export const FOOTER_INFO_NAV: NavLink[] = [
  { label: 'Como funciona', to: '/como-funciona' },
  { label: 'Contato', to: '/contato' },
  { label: 'Política de privacidade', to: '/politica-de-privacidade' },
  { label: 'Termos de uso', to: '/termos' },
]
