import type { Config } from '@netlify/functions'
import { requireAdmin } from './_lib/auth'
import { readProducts, writeProducts } from './_lib/catalog-store'
import { productErrors } from '../../src/utils/admin-validation'
import type { Product } from '../../src/types'
import { readAllOrders } from './_lib/customer-quotes'

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
        Array.isArray(product.images) &&
        (product.r2ObjectKey === undefined ||
          (typeof product.r2ObjectKey === 'string' &&
            (product.status === 'draft' ||
              (typeof product.price === 'number' && Number.isFinite(product.price) && product.price > 0)))),
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
    let products: unknown
    try { products = await request.json() } catch { return Response.json({ error:'JSON inválido.' }, { status:400 }) }
    if (!isProductList(products)) {
      return Response.json({ error: 'Catálogo inválido.' }, { status: 400 })
    }

    const list=products as unknown as Product[]
    if(new Set(list.map(p=>p.id)).size!==list.length)return Response.json({error:'Identificadores duplicados.'},{status:400})
    for(const product of list){
      if(!['canecas','camisetas','copos','kits','quadros','personalizados'].includes(product.category) || !Array.isArray(product.variants) || typeof product.available!=='boolean' || (product.status!==undefined && !['draft','published'].includes(product.status)) || (product.collections!==undefined && (!Array.isArray(product.collections) || product.collections.some(id=>typeof id!=='string'))))return Response.json({error:'Produto com estrutura inválida.'},{status:400})
      const errors=productErrors(product,list)
      if(Object.keys(errors).length)return Response.json({error:`${product.name}: ${Object.values(errors).join(' ')}`},{status:400})
    }

    const orders=await readAllOrders()
    if(orders?.some(order=>order.items.some(item=>!list.some(product=>product.id===item.productId))))return Response.json({error:'Produtos vinculados a pedidos devem ser desativados, sem exclusão.'},{status:400})
    await writeProducts(products)
    return Response.json({ ok: true, count: products.length })
  }

  return new Response(null, { status: 405, headers: { Allow: 'GET, PUT' } })
}

export const config: Config = { path: '/api/admin/products' }
