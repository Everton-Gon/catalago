import type { Config } from '@netlify/functions'
import { readProducts } from './_lib/catalog-store'

export default async function handler(request: Request) {
  if (request.method !== 'GET') {
    return new Response(null, { status: 405, headers: { Allow: 'GET' } })
  }

  const products = await readProducts()
  return Response.json(products, {
    headers: {
      'Cache-Control': 'no-store',
      'CDN-Cache-Control': 'no-store',
      'Netlify-CDN-Cache-Control': 'no-store',
    },
  })
}

export const config: Config = { path: '/api/catalog' }
