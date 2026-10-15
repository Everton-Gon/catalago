import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'

const bundle = await build({ stdin: { contents: `export * from './src/utils/cart.ts';export {getPriceBounds,filterProducts} from './src/data/catalog.ts'`, resolveDir: process.cwd() }, tsconfig: 'tsconfig.app.json', bundle: true, write: false, platform: 'node', format: 'esm' })
const api = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'))
const product = (required, price = 34.57) => ({ id: 'qa', name: 'Copo QA', slug: 'copo-qa', category: 'copos', price, available: true, status: 'published', createdAt: '2026-10-15', variants: [{ id: 'tamanho', name: 'Tamanho', required, options: [] }] })

test('tamanho vazio obrigatório ou opcional mantém preço e não cria seleção inexistente', () => {
  for (const required of [true, false]) {
    const p = product(required, required ? 34.57 : 102.9)
    for (const lowest of [true, false]) assert.deepEqual(api.getDefaultSelections(p, lowest), {})
    assert.equal(api.calculateStartingPrice(p), p.price)
    assert.equal(api.calculateUnitPrice(p, {}), p.price)
    assert.equal(api.getSelectedPriceOption(p, {}), undefined)
    assert.equal(api.isPriceOnRequest(p, {}), false)
  }
})

test('dimensão vazia não altera preço promocional nem acréscimos das opções configuradas', () => {
  const p = product(true)
  p.variants.push({ id: 'material', options: [{ label: 'Especial', price: 50 }, { label: 'Comum', price: 40, oldPrice: 45 }] }, { id: 'acabamento', required: true, options: [{ label: 'Brilho', priceDelta: 5 }, { label: 'Fosco', priceDelta: 2 }] })
  assert.deepEqual(api.getDefaultSelections(p), { material: 'Especial', acabamento: 'Brilho' })
  assert.deepEqual(api.getDefaultSelections(p, true), { material: 'Comum', acabamento: 'Brilho' })
  assert.equal(api.calculateStartingPrice(p), 42)
  assert.equal(api.calculateUnitPrice(p, { material: 'Comum', acabamento: 'Fosco' }), 42)
})

test('catálogo e limites de preço funcionam com produtos contendo opções vazias', () => {
  const source = [product(true), { ...product(false, 102.9), id: 'kit', slug: 'kit-qa', category: 'kits' }]
  assert.deepEqual(api.getPriceBounds(source), { min: 34.57, max: 102.9 })
  const filters = { categories: [], query: '', shirtFabric: 'todos', mugType: 'todos', minPrice: null, maxPrice: null, sort: 'menor-preco' }
  assert.equal(api.filterProducts(filters, source).length, 2)
  assert.deepEqual(api.filterProducts({ ...filters, maxPrice: 40 }, source).map(p => p.id), ['qa'])
})
