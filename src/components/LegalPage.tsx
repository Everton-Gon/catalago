import type { ReactNode } from 'react'
import Breadcrumbs from './Breadcrumbs'

interface LegalSection {
  heading: string
  body: ReactNode
}

interface LegalPageProps {
  title: string
  intro: string
  updatedAt: string
  sections: LegalSection[]
}

/** Moldura compartilhada pelas páginas de política de privacidade e termos. */
export default function LegalPage({ title, intro, updatedAt, sections }: LegalPageProps) {
  return (
    <div className="container-page py-6 sm:py-8 lg:py-10">
      <Breadcrumbs items={[{ label: title }]} />

      <article className="mx-auto max-w-3xl">
        <h1 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-xs text-ink-400">Última atualização: {updatedAt}</p>
        <p className="mt-5 text-sm leading-relaxed text-ink-600 sm:text-base">{intro}</p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-lg font-bold text-ink-900 sm:text-xl">
                {section.heading}
              </h2>
              <div className="mt-2.5 space-y-3 text-sm leading-relaxed text-ink-600">
                {section.body}
              </div>
            </section>
          ))}
        </div>
      </article>
    </div>
  )
}
