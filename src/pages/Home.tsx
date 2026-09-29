import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Clock, Sparkles, Truck } from 'lucide-react'
import CategoryCard from '@/components/CategoryCard'
import ProductGrid from '@/components/ProductGrid'
import HowItWorksSteps from '@/components/HowItWorksSteps'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'
import { CATEGORIES } from '@/data/categories'
import { getFeaturedProducts, getProductsByCategory } from '@/data/catalog'
import { PRODUCTION_TIME, SITE } from '@/config/site'
import { generalWhatsAppUrl } from '@/utils/whatsapp'
import { useSeo } from '@/utils/seo'
import { useCatalog } from '@/contexts/CatalogContext'
import heroShirtMain from '../../imagem/camisas/IMG-20260921-WA0014.jpg'
import heroShirtSecondary from '../../imagem/camisas/IMG-20260920-WA0008[1].jpg'
import heroMugMain from '../../imagem/canecas/IMG-20260923-WA0018.jpg'
import heroMugSecondary from '../../imagem/canecas/IMG-20260921-WA0015.jpg'

const TRUST_ITEMS = [
  { Icon: BadgeCheck, title: 'Arte conferida', text: 'Enviamos a prova digital antes de produzir.' },
  { Icon: Clock, title: `Pronto em ${PRODUCTION_TIME}`, text: 'Prazo médio após a aprovação da arte.' },
  { Icon: Truck, title: 'Entrega combinada', text: 'Retirada, entrega local ou envio pelos Correios.' },
]

export default function Home() {
  const { products } = useCatalog()
  useSeo({
    title: 'Produtos Personalizados e Sublimação',
    description: SITE.description,
    path: '/',
  })

  const featured = getFeaturedProducts(8, products)

  return (
    <>
      {/* ------------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-700">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-accent-400/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-brand-400/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="container-page relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:gap-12 lg:py-24">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-200 ring-1 ring-inset ring-white/15">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Sublimação e personalizados
            </span>

            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              Personalize
              <span className="block text-accent-300">do seu jeito</span>
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-brand-100 sm:text-lg lg:mx-0">
              Produtos personalizados para transformar suas ideias em presentes únicos.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                to="/produtos"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-400 px-7 py-4 text-sm font-bold uppercase tracking-wide text-ink-900 shadow-lg shadow-accent-500/25 transition-all hover:bg-accent-300 active:scale-[0.99]"
              >
                Ver produtos
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>

              <a
                href={generalWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-4 text-sm font-bold uppercase tracking-wide text-white backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                <WhatsAppIcon className="size-[18px]" />
                Pedir orçamento
              </a>
            </div>
          </div>

          <div className="relative mx-auto h-[340px] w-full max-w-[520px] sm:h-[430px] lg:h-[500px] lg:max-w-none">
            <div className="pointer-events-none absolute inset-x-[8%] bottom-[3%] h-[28%] rounded-[50%] bg-brand-950/45 blur-2xl" aria-hidden="true" />

            <figure className="absolute left-[2%] top-[3%] z-10 w-[55%] -rotate-3 overflow-hidden rounded-[1.75rem] bg-white p-2 shadow-2xl shadow-brand-950/35 sm:p-2.5">
              <img src={heroShirtMain} alt="Camisa personalizada produzida pela Fé & Propósito" width={1080} height={1350} fetchPriority="high" decoding="async" className="aspect-[4/5] w-full rounded-[1.25rem] object-contain" />
            </figure>

            <figure className="absolute right-[3%] top-[13%] z-20 w-[43%] rotate-[5deg] overflow-hidden rounded-[1.5rem] bg-white p-2 shadow-2xl shadow-brand-950/35 sm:p-2.5">
              <img src={heroShirtSecondary} alt="Outro modelo de camisa personalizada da loja" width={1080} height={1350} fetchPriority="high" decoding="async" className="aspect-[4/5] w-full rounded-[1rem] object-contain" />
            </figure>

            <figure className="absolute bottom-[1%] left-[21%] z-30 w-[36%] rotate-[4deg] overflow-hidden rounded-[1.35rem] bg-white p-2 shadow-2xl shadow-brand-950/40 sm:p-2.5">
              <img src={heroMugMain} alt="Caneca personalizada produzida pela Fé & Propósito" width={1080} height={1080} fetchPriority="high" decoding="async" className="aspect-square w-full rounded-[0.9rem] object-contain" />
            </figure>

            <figure className="absolute bottom-[6%] right-[3%] z-30 w-[29%] -rotate-[6deg] overflow-hidden rounded-[1.25rem] bg-white p-1.5 shadow-2xl shadow-brand-950/40 sm:p-2">
              <img src={heroMugSecondary} alt="Segundo modelo de caneca personalizada da loja" width={1080} height={1080} fetchPriority="high" decoding="async" className="aspect-square w-full rounded-[0.8rem] object-contain" />
            </figure>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ CONFIANÇA */}
      <section className="border-b border-ink-200 bg-white">
        <ul className="container-page grid gap-4 py-6 sm:grid-cols-3 sm:gap-6">
          {TRUST_ITEMS.map(({ Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink-900">{title}</span>
                <span className="block text-xs text-ink-500">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------ CATEGORIAS */}
      <section className="container-page py-14 sm:py-16 lg:py-20">
        <header className="mb-8 text-center">
          <h2 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl lg:text-4xl">
            Encontre o que você procura
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-500 sm:text-base">
            Escolha uma categoria e veja tudo o que dá para personalizar.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.slug}
              category={category}
              productCount={getProductsByCategory(category.slug, products).length}
            />
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- DESTAQUES */}
      <section className="bg-white py-14 sm:py-16 lg:py-20">
        <div className="container-page">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl lg:text-4xl">
                Produtos em destaque
              </h2>
              <p className="mt-2 text-sm text-ink-500 sm:text-base">
                Os mais pedidos por quem já personalizou com a gente.
              </p>
            </div>

            <Link
              to="/produtos"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-900"
            >
              Ver todos
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </header>

          <ProductGrid products={featured} eagerCount={4} />
        </div>
      </section>

      {/* ---------------------------------------------------- COMO FUNCIONA */}
      <section className="container-page py-14 sm:py-16 lg:py-20">
        <header className="mb-8 text-center">
          <h2 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl lg:text-4xl">
            Como funciona
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-500 sm:text-base">
            Sem cadastro, sem senha, sem complicação. Quatro passos até o seu orçamento.
          </p>
        </header>

        <HowItWorksSteps />
      </section>

      {/* -------------------------------------------------- PERSONALIZAÇÃO */}
      <section className="bg-white py-14 sm:py-16 lg:py-20">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="order-2 lg:order-1">
            <h2 className="font-display text-2xl font-extrabold leading-tight text-ink-900 sm:text-3xl lg:text-4xl">
              Seu produto. <span className="text-brand-700">Sua ideia.</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-600 sm:text-lg">
              Você imagina, a gente transforma em produto. Foto de família, logo da empresa,
              versículo favorito ou aquela piada interna — se cabe numa estampa, a gente faz.
            </p>

            <ul className="mt-6 space-y-2.5 text-sm text-ink-600">
              {[
                'Arte enviada por você ou criada junto com a gente',
                'Prova digital antes da produção',
                'Pedidos a partir de 1 unidade',
                'Preço especial para quantidades maiores',
              ].map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5">
                  <BadgeCheck
                    className="mt-0.5 size-[18px] shrink-0 text-brand-600"
                    aria-hidden="true"
                  />
                  {benefit}
                </li>
              ))}
            </ul>

            <Link
              to="/produtos"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-7 py-4 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-800"
            >
              Começar agora
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="order-1 lg:order-2">
            <img
              src="/personalizacao.svg"
              alt="Mosaico com camiseta, caneca, copo e kit presente personalizados"
              width={640}
              height={520}
              loading="lazy"
              decoding="async"
              className="w-full rounded-card"
            />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- CTA FIM */}
      <section className="container-page py-14 sm:py-16">
        <div className="rounded-card bg-gradient-to-br from-brand-800 to-brand-950 px-6 py-12 text-center sm:px-12">
          <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
            Pronto para criar o seu?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-brand-100 sm:text-base">
            Monte sua sacola e envie o pedido pelo WhatsApp. A gente confirma valor, prazo e
            frete na hora.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/produtos"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-400 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-ink-900 transition-colors hover:bg-accent-300"
            >
              Ver produtos
            </Link>
            <a
              href={generalWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-white/10"
            >
              <WhatsAppIcon className="size-[18px]" />
              Falar com a gente
            </a>
          </div>
        </div>
      </section>
    </>
  )
}


