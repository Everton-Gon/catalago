import { useEffect } from 'react'
import { SITE } from '@/config/site'

interface SeoOptions {
  /** Sem o sufixo da loja — ele é acrescentado automaticamente. */
  title: string
  description?: string
  image?: string
  /** Caminho da rota atual, ex.: "/produto/caneca-branca". */
  path?: string
}

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = href
}

/**
 * Atualiza título, meta description, Open Graph e canonical da página.
 *
 * Como o app é uma SPA sem SSR, as tags são aplicadas no cliente. Se um dia
 * for necessário SEO para crawlers sem JavaScript, o caminho é pré-renderizar
 * as rotas no build — a origem dos textos continua sendo este hook.
 */
export function useSeo({ title, description = SITE.description, image, path }: SeoOptions): void {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE.name}`
    const url = `${SITE.url}${path ?? window.location.pathname}`
    const ogImage = `${SITE.url}${image ?? '/og-image.svg'}`

    document.title = fullTitle
    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:url"]', 'property', 'og:url', url)
    setMeta('meta[property="og:image"]', 'property', 'og:image', ogImage)
    setCanonical(url)
  }, [title, description, image, path])
}
