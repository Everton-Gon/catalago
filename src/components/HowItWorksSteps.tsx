import { MessageCircle, MousePointerClick, ShoppingBag, SlidersHorizontal } from 'lucide-react'

export const STEPS = [
  {
    number: '01',
    title: 'Escolha seu produto',
    description: 'Encontre o produto que deseja personalizar no catálogo.',
    Icon: MousePointerClick,
  },
  {
    number: '02',
    title: 'Escolha as opções',
    description: 'Informe modelo, cor, tamanho, quantidade e como quer a personalização.',
    Icon: SlidersHorizontal,
  },
  {
    number: '03',
    title: 'Adicione à sacola',
    description: 'Revise todos os produtos e os detalhes de cada item.',
    Icon: ShoppingBag,
  },
  {
    number: '04',
    title: 'Fale pelo WhatsApp',
    description: 'Envie seu pedido em um clique e receba o orçamento final.',
    Icon: MessageCircle,
  },
]

export default function HowItWorksSteps() {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
      {STEPS.map(({ number, title, description, Icon }) => (
        <li
          key={number}
          className="relative flex flex-col rounded-card border border-ink-200 bg-white p-5 shadow-soft transition-shadow hover:shadow-lift"
        >
          <span
            className="font-display text-4xl font-extrabold leading-none text-brand-100"
            aria-hidden="true"
          >
            {number}
          </span>
          <span className="mt-3 grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <h3 className="mt-3 font-display text-base font-bold text-ink-900">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{description}</p>
        </li>
      ))}
    </ol>
  )
}
