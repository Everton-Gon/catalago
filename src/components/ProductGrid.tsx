import ProductCard from './ProductCard'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
  /** Quantos cards carregam a imagem imediatamente (acima da dobra). */
  eagerCount?: number
}

export default function ProductGrid({ products, eagerCount = 2 }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} eager={index < eagerCount} />
      ))}
    </div>
  )
}
