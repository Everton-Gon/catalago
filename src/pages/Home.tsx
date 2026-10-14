import HeroCarousel from '@/components/HeroCarousel'
import { activeBanners } from '@/data/storefrontContent'
import { useStorefrontContent, useStorefrontLoading } from '@/contexts/StorefrontContext'
import { Link } from 'react-router-dom'
import { ArrowRight, Heart, MessageCircle, SlidersHorizontal, Sparkles } from 'lucide-react'
import CategoryCard from '@/components/CategoryCard'
import ProductGrid from '@/components/ProductGrid'
import HowItWorksSteps from '@/components/HowItWorksSteps'
import { CATEGORIES } from '@/data/categories'
import { getFeaturedProducts, getProductsByCategory } from '@/data/catalog'
import { SITE } from '@/config/site'
import { useSeo } from '@/utils/seo'
import { useCatalog } from '@/contexts/CatalogContext'

export default function Home() {
  const { products } = useCatalog()
  const content = useStorefrontContent()
  const contentLoading = useStorefrontLoading()
  useSeo({ title: 'Personalizados que expressam sua fé e seu estilo', description: SITE.description, path: '/' })
  const featured = getFeaturedProducts(8, products)
  const collections = content.collections.filter(c=>c.active && products.some(p=>p.available && p.status!=='draft' && p.collections?.includes(c.id))).sort((a,b)=>a.order-b.order)
  const mugs = getProductsByCategory('canecas', products)
  const mug = mugs.find(product => product.mugType === 'porcelana' && /jesus/i.test(product.name)) ?? mugs[0]

  return (
    <>
      <HeroCarousel slides={activeBanners(content)} intervalMs={content.intervalMs} loading={contentLoading} />
      <div className="service-strip">
        <ul className="container-page">
          <li><SlidersHorizontal aria-hidden="true" /><span><strong>Escolhas que combinam com você</strong>Opções e personalização em cada produto</span></li>
          <li><Heart aria-hidden="true" /><span><strong>Seu pedido em uma só sacola</strong>Revise todos os detalhes antes de enviar</span></li>
          <li><MessageCircle aria-hidden="true" /><span><strong>Atendimento pelo WhatsApp</strong>Combine os detalhes diretamente com a gente</span></li>
        </ul>
      </div>
      <section className="container-page store-section">
        <header className="section-heading"><div><p className="eyebrow">Encontre seu próximo personalizado</p><h2>Pequenos detalhes. Muitas possibilidades.</h2></div><Link to="/produtos" className="text-link">Todo o catálogo <ArrowRight size={16} aria-hidden="true" /></Link></header>
        <div className="category-grid">
          {CATEGORIES.map(category => {
            const items = getProductsByCategory(category.slug, products)
            return <CategoryCard key={category.slug} category={category} image={items[0]?.images[0]} productCount={items.length} />
          })}
        </div>
      </section>
      <section className="featured-section store-section">
        <div className="container-page">
          <header className="section-heading"><div><p className="eyebrow">Uma seleção da nossa loja</p><h2>Personalizados em destaque</h2><p>Inspire-se e escolha os detalhes que deixam tudo com a sua cara.</p></div><Link to="/produtos" className="text-link">Ver todos os produtos <ArrowRight size={16} aria-hidden="true" /></Link></header>
          <ProductGrid products={featured} eagerCount={0} />
        </div>
      </section>
      {collections.length > 0 && <section className="container-page store-section"><header className="section-heading"><div><p className="eyebrow">Encontre seu tema</p><h2>Coleções para cada paixão</h2></div></header><div className="store-collections">{collections.map(collection=>{
        const items=products.filter(p=>p.available && p.status!=='draft' && p.collections?.includes(collection.id))
        return <Link key={collection.id} to={`/colecao/${collection.slug}`}><img src={collection.image || items[0]?.images[0]} alt={collection.name} loading="lazy"/><span><strong>{collection.name}</strong><small>{items.length} produto(s)</small></span><ArrowRight size={18} aria-hidden="true"/></Link>
      })}</div></section>}
      <section className="container-page store-section">
        <div className="personalization-banner">
          <div className="personalization-image">{mug && <img src={mug.images[0]} alt="Uma das canecas disponíveis para personalização" width={560} height={480} loading="lazy" decoding="async" />}</div>
          <div className="personalization-copy"><p className="eyebrow"><Sparkles size={15} aria-hidden="true" /> Um toque só seu</p><h2>Uma ideia sua.<br /><em>Um presente com significado.</em></h2><p>Um nome, uma frase, uma lembrança especial. Escolha o produto e conte como você imagina a personalização. A gente combina os detalhes pelo WhatsApp.</p><Link to="/produtos" className="store-button">Quero personalizar <ArrowRight size={17} aria-hidden="true" /></Link><small>Já tem uma arte? Envie o arquivo diretamente na conversa do WhatsApp.</small></div>
        </div>
      </section>
      <section className="container-page store-section how-section">
        <header className="section-heading centered"><div><p className="eyebrow">Da sua ideia para o seu dia a dia</p><h2>Como fazer seu pedido</h2><p>Escolha com calma. A confirmação dos detalhes acontece pelo WhatsApp.</p></div></header>
        <HowItWorksSteps />
      </section>
    </>
  )
}
