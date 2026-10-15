import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { Category } from '@/types'

interface CategoryCardProps { category: Category; productCount: number; image?: string }
export default function CategoryCard({ category, productCount, image }: CategoryCardProps) {
  return <Link to={`/categoria/${category.slug}`} className="category-card">
    <span className={`category-image${image ? ' has-photo' : ''}`}><img src={image ?? category.image} alt="" width={280} height={280} loading="lazy" decoding="async" /></span>
    <span className="category-name">{category.shortName}<ArrowUpRight size={16} aria-hidden="true" /></span>
    <span className="category-count">{productCount} {productCount === 1 ? 'produto' : 'produtos'}</span>
  </Link>
}
