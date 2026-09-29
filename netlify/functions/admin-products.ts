import type { Config } from '@netlify/functions'
import { requireAdmin } from './_lib/auth'
import { readProducts, writeProducts } from './_lib/catalog-store'

function isProductList(value: unknown): value is Array<Record<string, unknown>> {
  return (
    Array.isArray(value) &&
    value.length <= 5_000 &&
    value.every(
      (product) =>
        typeof product === 'object' &&
        product !== null &&
        typeof product.id === 'string' &&
        typeof product.name === 'string' &&
        typeof product.slug === 'string' &&
        Array.isArray(product.images),
    )
  )
}

export default async function handler(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  if (request.method === 'GET') {
    return Response.json(await readProducts(), {
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  if (request.method === 'PUT') {
    const products: unknown = await request.json()
    if (!isProductList(products)) {
      return Response.json({ error: 'Catálogo inválido.' }, { status: 400 })
    }

    await writeProducts(products)
    return Response.json({ ok: true, count: products.length })
  }

  return new Response(null, { status: 405, headers: { Allow: 'GET, PUT' } })
}

export const config: Config = { path: '/api/admin/products' }
