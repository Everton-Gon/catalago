import { Link } from 'react-router-dom'
import { ArrowRight, HelpCircle } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import HowItWorksSteps from '@/components/HowItWorksSteps'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'
import { PRODUCTION_TIME } from '@/config/site'
import { generalWhatsAppUrl } from '@/utils/whatsapp'
import { useSeo } from '@/utils/seo'

const FAQ = [
  {
    question: 'Preciso criar uma conta para pedir?',
    answer:
      'Não. Você monta a sacola e envia o pedido pelo WhatsApp como visitante. Não pedimos cadastro, senha nem dados de pagamento no site.',
  },
  {
    question: 'O preço do site é o valor final?',
    answer:
      'É uma estimativa. Produtos personalizados variam conforme quantidade, tamanho, modelo, arte, material e acabamento. O valor final é confirmado na conversa do WhatsApp, antes de qualquer produção.',
  },
  {
    question: 'Como envio a minha arte?',
    answer:
      'Você pode selecionar o arquivo na página do produto para deixá-lo anotado no pedido. Como o site ainda não recebe arquivos, o envio de fato acontece na conversa do WhatsApp — é só anexar a imagem ou o PDF.',
  },
  {
    question: 'Não tenho arte pronta. Vocês criam?',
    answer:
      'Criamos. Conte a ideia pelo WhatsApp (tema, cores, textos, fotos) e desenvolvemos a arte junto com você. Enviamos uma prova digital antes de produzir.',
  },
  {
    question: 'Qual é o prazo de produção?',
    answer: `Em média ${PRODUCTION_TIME} após a aprovação da arte. Pedidos grandes ou com arte complexa podem levar mais tempo — combinamos isso no orçamento.`,
  },
  {
    question: 'Qual é a quantidade mínima?',
    answer:
      'Uma unidade. Para quantidades maiores temos preço especial — informe a quantidade no pedido e a gente calcula.',
  },
  {
    question: 'Como funciona a entrega?',
    answer:
      'Retirada no local, entrega na região ou envio pelos Correios/transportadora. O frete é calculado depois, junto com o orçamento, de acordo com o seu endereço.',
  },
  {
    question: 'Como eu pago?',
    answer:
      'O pagamento é combinado diretamente no WhatsApp após a confirmação do orçamento. O site não processa pagamentos.',
  },
]

export default function HowItWorks() {
  useSeo({
    title: 'Como funciona',
    description:
      'Entenda o passo a passo para pedir seus produtos personalizados: escolha, personalize, monte a sacola e receba o orçamento pelo WhatsApp.',
    path: '/como-funciona',
  })

  return (
    <div className="container-page py-6 sm:py-8 lg:py-10">
      <Breadcrumbs items={[{ label: 'Como funciona' }]} />

      <header className="rounded-card bg-gradient-to-br from-brand-800 to-brand-950 px-5 py-10 text-white sm:px-8 sm:py-12">
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl lg:text-4xl">
          Como funciona
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-100 sm:text-base">
          Do catálogo ao orçamento em quatro passos — sem cadastro, sem senha e sem pagamento
          online. Simples assim.
        </p>
      </header>

      <section className="mt-8 sm:mt-10">
        <HowItWorksSteps />
      </section>

      <section className="mt-14 sm:mt-16">
        <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-ink-900 sm:text-2xl">
          <HelpCircle className="size-6 text-brand-600" aria-hidden="true" />
          Perguntas frequentes
        </h2>

        <div className="mt-6 space-y-3">
          {FAQ.map((entry) => (
            <details
              key={entry.question}
              className="group rounded-card border border-ink-200 bg-white p-4 shadow-soft sm:p-5"
            >
              <summary className="cursor-pointer list-none font-display text-base font-bold text-ink-900 marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {entry.question}
                  <span
                    className="shrink-0 text-2xl font-normal leading-none text-brand-600 transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{entry.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-card border border-ink-200 bg-white px-6 py-10 text-center shadow-soft sm:mt-16">
        <h2 className="font-display text-xl font-extrabold text-ink-900 sm:text-2xl">
          Ainda com dúvida?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
          Chama a gente no WhatsApp. Respondemos no horário de atendimento.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={generalWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
          >
            <WhatsAppIcon className="size-[18px]" />
            Falar pelo WhatsApp
          </a>
          <Link
            to="/produtos"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-200 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-800"
          >
            Ver produtos
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  )
}
