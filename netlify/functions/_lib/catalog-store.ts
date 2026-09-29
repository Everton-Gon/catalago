import { getStore } from '@netlify/blobs'

const STORE_NAME = 'fe-proposito-catalog'
const PRODUCTS_KEY = 'products'

export function getCatalogStore() {
  return getStore(STORE_NAME)
}

export async function readProducts(): Promise<unknown> {
  return getCatalogStore().get(PRODUCTS_KEY, { type: 'json' })
}

export async function writeProducts(products: unknown): Promise<void> {
  await getCatalogStore().setJSON(PRODUCTS_KEY, products)
}
