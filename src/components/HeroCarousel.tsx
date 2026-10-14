import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react'
import WhatsAppIcon from './icons/WhatsAppIcon'
import type { HomeBanner } from '@/data/homeBanners'

interface HeroCarouselProps { slides: (HomeBanner & { image: string })[]; intervalMs?: number; preview?: boolean; loading?: boolean }

function BannerAction({ action, secondary = false }: { action: HomeBanner['primary']; secondary?: boolean }) {
  const className = `store-button${secondary ? ' secondary' : ''}`
  const external = action.href.startsWith('https://')
  const content = <>{secondary && <WhatsAppIcon className="size-4" />}{action.label}{!secondary && <ArrowRight size={17} aria-hidden="true" />}</>
  return external ? <a href={action.href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a> : <Link to={action.href} className={className}>{content}</Link>
}

export default function HeroCarousel({ slides, intervalMs = 6000, preview = false, loading = false }: HeroCarouselProps) {
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [touching, setTouching] = useState(false)
  const [pageVisible, setPageVisible] = useState(() => !document.hidden)
  const [announcement, setAnnouncement] = useState('')
  const gesture = useRef<{ x: number; y: number } | null>(null)
  const multiple = slides.length > 1

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotion = () => setPlaying(!media.matches)
    const onVisibility = () => setPageVisible(!document.hidden)
    media.addEventListener('change', onMotion)
    document.addEventListener('visibilitychange', onVisibility)
    return () => { media.removeEventListener('change', onMotion); document.removeEventListener('visibilitychange', onVisibility) }
  }, [])

  useEffect(() => {
    if (loading || preview || !multiple || !playing || hovered || focused || touching || !pageVisible) return
    const timer = window.setTimeout(() => setActive(index => (index + 1) % slides.length), Math.max(5000, Math.min(7000, intervalMs)))
    return () => window.clearTimeout(timer)
  }, [active, slides.length, multiple, playing, hovered, focused, touching, pageVisible, intervalMs, preview, loading])

  function goTo(index: number) {
    if (loading) return
    const next = (index + slides.length) % slides.length
    setActive(next)
    setAnnouncement(`${slides[next].name}, banner ${next + 1} de ${slides.length}`)
  }
  function beginSwipe(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' || (event.target as HTMLElement).closest('a,button')) return
    gesture.current = { x: event.clientX, y: event.clientY }
    setTouching(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  function endSwipe(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current
    gesture.current = null
    setTouching(false)
    if (!start || !multiple) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) goTo(active + (dx < 0 ? 1 : -1))
  }
  if (!slides.length) return null

  return <section className="hero-carousel" aria-label="Destaques da loja" aria-roledescription="carrossel" tabIndex={multiple ? 0 : undefined}
    onPointerEnter={event => { if (event.pointerType !== 'touch') setHovered(true) }} onPointerLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false) }}
    onKeyDown={event => {
      if (!multiple || (event.target !== event.currentTarget && !(event.target as HTMLElement).closest('.carousel-controls'))) return
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); goTo(active + (event.key === 'ArrowLeft' ? -1 : 1)) }
    }}>
    <div className="carousel-stage" onPointerDown={beginSwipe} onPointerUp={endSwipe} onPointerCancel={() => { gesture.current = null; setTouching(false) }}>
      {slides.map((slide, index) => <div key={slide.id} className={`hero-slide home-hero${slide.mobileImage ? ' has-mobile-image' : ''}${slide.cropLeft ? ' hero-cropped-art' : ''}${slide.id === 'modelos-canecas' ? ' hero-personalized-mugs' : ''}${slide.tone === 'dark' ? ' theme-dark' : ''}${index === active ? ' is-active' : ''}`} role="group" aria-roledescription="slide" aria-label={`${index + 1} de ${slides.length}: ${slide.name}`} aria-hidden={index !== active} inert={index !== active}>
        <div className="hero-scene">{slide.cropLeft ? <div className="hero-art-window" style={{ aspectRatio: `${slide.width * (1 - slide.cropLeft)} / ${slide.height}` }}>
          <picture>{slide.mobileImage && <source media="(max-width: 900px)" srcSet={slide.mobileImage}/>}<img src={slide.image} alt={slide.imageAlt} width={slide.width} height={slide.height} style={{ width: `${100 / (1 - slide.cropLeft)}%` }} loading="lazy" fetchPriority="low" decoding="async" /></picture>
        </div> : <picture>{slide.mobileImage && <source media="(max-width: 900px)" srcSet={slide.mobileImage}/>}<img src={slide.image} alt={slide.imageAlt} width={slide.width} height={slide.height} loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'low'} decoding="async" /></picture>}</div>
        <div className="container-page hero-layout"><div className="hero-copy">
          <h1>{slide.emphasis && slide.title.endsWith(slide.emphasis) ? <>{slide.title.slice(0, -slide.emphasis.length)}<em>{slide.emphasis}</em></> : slide.title}</h1>
          <p className="hero-description">{slide.description}</p>
          <div className="hero-actions"><BannerAction action={slide.primary} /><BannerAction action={slide.secondary} secondary /></div>
        </div></div>
      </div>)}
    </div>
    {multiple && <div className="carousel-controls" aria-label="Controles dos banners">
      <button type="button" disabled={loading} onClick={() => goTo(active - 1)} aria-label="Banner anterior"><ArrowLeft size={18} aria-hidden="true" /></button>
      <div className="carousel-indicators" role="group" aria-label="Escolher banner">{slides.map((slide, index) => <button key={slide.id} type="button" onClick={() => goTo(index)} aria-label={`Mostrar banner ${index + 1}: ${slide.name}`} aria-current={index === active ? 'true' : undefined}><span /></button>)}</div>
      <button type="button" disabled={loading} onClick={() => goTo(active + 1)} aria-label="Próximo banner"><ArrowRight size={18} aria-hidden="true" /></button>
      <button type="button" onClick={() => setPlaying(current => !current)} aria-label={playing ? 'Pausar carrossel' : 'Retomar carrossel'} aria-pressed={!playing}>{playing ? <Pause size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}</button>
    </div>}
    <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
  </section>
}
