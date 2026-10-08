import type { Product } from '../types/index'
import type { R2Model, R2ModelPage } from '../types/r2'

export async function fetchR2Models(signal: AbortSignal, request: typeof fetch = fetch): Promise<R2Model[]> {
  const models: R2Model[] = []
  const cursors = new Set<string>()
  let cursor: string | null = null
  let scanned = 0
  do {
    const response = await request(`/api/admin/r2-models${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`, {
      headers: { Accept: 'application/json' },
      signal,
    })
    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw new Error('A busca no Cloudflare precisa das Functions. Abra o painel no site Netlify ou execute netlify dev.')
    }
    const payload = await response.json() as Partial<R2ModelPage> & { error?: string }
    if (!response.ok) throw new Error(payload.error ?? 'Não foi possível buscar os modelos no Cloudflare.')
    if (!Array.isArray(payload.models) || typeof payload.scanned !== 'number' ||
        !(payload.nextCursor === null || typeof payload.nextCursor === 'string')) {
      throw new Error('A busca retornou uma resposta inválida. Nenhum modelo foi importado.')
    }
    scanned += payload.scanned
    if (scanned > 50_000) {
      throw new Error('A busca excedeu 50.000 arquivos. Nenhum modelo foi importado; organize um bucket exclusivo para o catálogo.')
    }
    models.push(...payload.models)
    cursor = payload.nextCursor
    if (cursor) {
      if (cursors.has(cursor)) throw new Error('Não foi possível concluir a paginação do Cloudflare. Tente novamente.')
      cursors.add(cursor)
    }
  } while (cursor)
  return models
}

export function findUnpricedR2Product(products: Product[]): Product | undefined {
  return products.find((product) => product.r2ObjectKey && product.status !== 'draft' &&
    (!Number.isFinite(product.price) || product.price <= 0))
}

function imageIdentity(value: string): string {
  try {
    const url = new URL(value)
    return `${url.origin}${decodeURIComponent(url.pathname)}`
  } catch {
    return value
  }
}

/** Acrescenta rascunhos sem alterar produtos existentes, inclusive os editados. */
export function importR2Models(products: Product[], models: R2Model[], today: string) {
  const ids = new Set(products.map((product) => product.id))
  const keys = new Set(products.flatMap((product) => product.r2ObjectKey ? [product.r2ObjectKey] : []))
  const slugs = new Set(products.map((product) => product.slug))
  const images = new Set(products.flatMap((product) => [
    ...product.images,
    ...(product.colors ?? []).flatMap((color) => color.previewImage ? [color.previewImage] : []),
  ]).map(imageIdentity))
  const additions: Product[] = []
  let nextOrder = Math.max(-1, ...products.map((product, index) => product.order ?? index)) + 1
  for (const model of models) {
    const image = imageIdentity(model.url)
    if (ids.has(model.id) || keys.has(model.key) || images.has(image)) continue
    let slug = model.slug
    let suffix = 2
    while (slugs.has(slug)) slug = `${model.slug}-${suffix++}`
    additions.push({
      id: model.id,
      r2ObjectKey: model.key,
      name: model.name,
      slug,
      category: model.category,
      ...(model.mugType ? { mugType: model.mugType } : {}),
      shortDescription: 'Modelo personalizado. Confira os detalhes antes de publicar.',
      description: 'Modelo personalizado. Confira os detalhes antes de publicar.',
      images: [model.url],
      price: 0,
      featured: false,
      available: true,
      status: 'draft',
      order: nextOrder++,
      salesRank: 1,
      variants: [],
      personalization: { enabled: true },
      createdAt: today,
    })
    ids.add(model.id)
    keys.add(model.key)
    images.add(image)
    slugs.add(slug)
  }
  if (products.length + additions.length > 5000) {
    throw new Error('O catálogo aceita até 5.000 produtos. Nenhum modelo foi importado.')
  }
  return { products: [...products, ...additions], additions }
}
