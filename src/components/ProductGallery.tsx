import { useEffect, useState } from 'react'

interface ProductGalleryProps {
  images: string[]
  productName: string
  badge?: string
  previewImage?: string
  previewLabel?: string
  imageFit?: 'cover' | 'contain'
}

export default function ProductGallery({
  images,
  productName,
  badge,
  previewImage,
  previewLabel,
  imageFit = 'cover',
}: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => setActiveIndex(0), [productName])

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-card border border-ink-200 bg-white shadow-soft">
        <img
          src={previewImage ?? images[activeIndex]}
          alt={`${productName}${previewLabel ? ` — prévia ${previewLabel}` : ` — imagem ${activeIndex + 1} de ${images.length}`}`}
          width={900}
          height={900}
          decoding="async"
          className={`size-full ${imageFit === 'contain' ? 'object-contain p-2' : 'object-cover'}`}
        />
        {badge && (
          <span className="absolute left-4 top-4 rounded-full bg-accent-400 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink-900 shadow-sm">
            {badge}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin" role="group" aria-label="Miniaturas do produto">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver imagem ${index + 1}`}
              aria-current={index === activeIndex}
              className={`size-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-colors sm:size-24 ${
                index === activeIndex
                  ? 'border-brand-600'
                  : 'border-ink-200 hover:border-brand-300'
              }`}
            >
              <img src={image} alt="" loading="lazy" className={`size-full ${imageFit === 'contain' ? 'object-contain p-2' : 'object-cover'}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


