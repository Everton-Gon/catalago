import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Category } from '@/types'

interface CategoryCardProps {
  category: Category
  productCount: number
}

export default function CategoryCard({ category, productCount }: CategoryCardProps) {
  return (
    <Link
      to={`/categoria/${category.slug}`}
      className="group flex items-center gap-4 rounded-card border border-ink-200 bg-white p-4 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift sm:flex-col sm:items-start sm:p-5"
    >
      <span
        className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-50 to-accent-50 text-2xl transition-transform duration-300 group-hover:scale-110 sm:size-16 sm:text-3xl"
        aria-hidden="true"
      >
        {category.emoji}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-display text-base font-bold text-ink-900 sm:text-lg">
          {category.shortName}
        </span>
        <span className="mt-0.5 block text-xs text-ink-500 sm:text-sm">
          {productCount} {productCount === 1 ? 'produto' : 'produtos'}
        </span>
      </span>

      <ArrowRight
        className="size-5 shrink-0 text-ink-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand-600 sm:hidden"
        aria-hidden="true"
      />

      <span className="hidden items-center gap-1 text-sm font-semibold text-brand-700 sm:inline-flex">
        Ver produtos
        <ArrowRight
          className="size-4 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </Link>
  )
}
