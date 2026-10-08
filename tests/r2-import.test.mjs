import assert from 'node:assert/strict'
import test from 'node:test'
import { modelFromKey, listModelPage } from '../netlify/functions/_lib/r2-models.ts'
import { fetchR2Models, importR2Models, findUnpricedR2Product } from '../src/utils/r2-import.ts'

const base = 'https://images.example.com'
const model = modelFromKey('Caneca pintura/Novo coração [1].jpg', base)
const importModels = (products, models = [model]) => importR2Models(products, models, '2026-10-08')

test('classifica a pasta, codifica a URL e mantém IDs estáveis por chave', () => {
  assert.equal(model.category, 'canecas')
  assert.equal(model.mugType, 'colorir')
  assert.equal(model.url, `${base}/Caneca%20pintura/Novo%20cora%C3%A7%C3%A3o%20%5B1%5D.jpg`)
  assert.equal(model.id, modelFromKey(model.key, `${base}/`).id)
  assert.notEqual(model.id, modelFromKey('Caneca normal/Novo coração [1].jpg', base).id)
  assert.equal(modelFromKey('catalago-imagens/Camisa/nova.PNG', base).category, 'camisetas')
  assert.equal(modelFromKey('catalogo-admin/quadros/nova.webp', base).category, 'quadros')
})

test('ignora arquivos auxiliares, pastas desconhecidas e cache de IA', () => {
  for (const key of ['Caneca pintura/', 'Camisa/lista.json', 'brand/logo.png', 'ai-cache/camisetas/azul.png']) {
    assert.equal(modelFromKey(key, base), null)
  }
})

test('listagem mantém a paginação mesmo quando uma página não contém modelos', async () => {
  const page = await listModelPage(async (input) => {
    assert.deepEqual(input, { Bucket: 'test-bucket', MaxKeys: 1000, ContinuationToken: 'opaque-token' })
    return {
      Contents: [{ Key: 'brand/logo.png', Size: 123 }, { Key: 'Camisa/vazio.jpg', Size: 0 }],
      IsTruncated: true, NextContinuationToken: 'next-token',
    }
  }, 'test-bucket', base, 'opaque-token')
  assert.deepEqual(page, { models: [], scanned: 2, nextCursor: 'next-token' })
})

test('listagem retorna somente imagens de produtos e rejeita paginação incompleta', async () => {
  const page = await listModelPage(async () => ({ Contents: [{ Key: model.key, Size: 200 }] }), 'bucket', base)
  assert.deepEqual(page.models, [model])
  assert.equal(page.nextCursor, null)
  await assert.rejects(listModelPage(async () => ({ IsTruncated: true }), 'bucket', base), /incompleta/)
})

test('importa somente rascunhos, sem preço inventado, e preserva o catálogo existente', () => {
  const existing = { ...importModels([]).additions[0], id: 'local', images: ['/local.jpg'], r2ObjectKey: undefined }
  const result = importModels([existing])
  assert.equal(result.products[0], existing)
  assert.equal(result.additions.length, 1)
  assert.equal(result.additions[0].status, 'draft')
  assert.equal(result.additions[0].price, 0)
  assert.equal(result.additions[0].createdAt, '2026-10-08')
  assert.notEqual(result.additions[0].slug, existing.slug)
})

test('nova busca não duplica modelos já importados ou renomeados', () => {
  const first = importModels([]).products
  first[0].id = 'renomeado'
  first[0].images = []
  first[0].name = 'Nome escolhido pelo administrador'
  const second = importModels(first)
  assert.equal(second.additions.length, 0)
  assert.deepEqual(second.products, first)
})

test('não duplica imagens do catálogo estático ou usadas como prévia de cor', () => {
  const product = importModels([]).products[0]
  const legacy = { ...product, id: 'legacy', r2ObjectKey: undefined, images: [decodeURI(model.url) + '?v=1'] }
  assert.equal(importModels([legacy]).additions.length, 0)
  const withPreview = { ...legacy, images: ['/local.jpg'], colors: [{ id: 'red', name: 'Red', hex: '#FF0000', previewImage: model.url }] }
  assert.equal(importModels([withPreview]).additions.length, 0)
})

test('duplicatas na resposta e colisões de endereços não criam produtos duplicados', () => {
  const result = importModels([], [model, model])
  assert.equal(result.additions.length, 1)
  const other = { ...model, id: 'outro', key: 'Camisa/outra.jpg', url: `${base}/Camisa/outra.jpg` }
  const merged = importModels(result.products, [other])
  assert.equal(merged.additions[0].slug, `${model.slug}-2`)
})

test('limite do catálogo falha antes de aplicar uma importação parcial', () => {
  const existing = Array.from({ length: 5000 }, (_, index) => ({ id: `p-${index}`, slug: `p-${index}`, images: [] }))
  assert.throws(() => importModels(existing), /5.000/)
  assert.equal(existing.length, 5000)
})

test('exige preço válido para publicar importados, mas permite salvar rascunhos', () => {
  const product = importModels([]).products[0]
  assert.equal(findUnpricedR2Product([product]), undefined)
  for (const price of [0, -1, NaN, Infinity]) {
    assert.ok(findUnpricedR2Product([{ ...product, status: 'published', price }]))
  }
  assert.equal(findUnpricedR2Product([{ ...product, status: 'published', price: 25 }]), undefined)
})

test('busca todas as páginas e codifica tokens opacos', async () => {
  const calls = []
  const request = async (url, options) => {
    calls.push(url)
    assert.ok(options.signal instanceof AbortSignal)
    return Response.json(calls.length === 1
      ? { models: [], scanned: 1000, nextCursor: 'token+/=' }
      : { models: [model], scanned: 1, nextCursor: null })
  }
  assert.deepEqual(await fetchR2Models(new AbortController().signal, request), [model])
  assert.deepEqual(calls, ['/api/admin/r2-models', '/api/admin/r2-models?cursor=token%2B%2F%3D'])
})

test('falha numa página não retorna modelos parciais e preserva o erro de acesso', async () => {
  let calls = 0
  await assert.rejects(fetchR2Models(new AbortController().signal, async () => {
    calls++
    return calls === 1
      ? Response.json({ models: [model], scanned: 1, nextCursor: 'next' })
      : Response.json({ error: 'Acesso restrito a administradores.' }, { status: 403 })
  }), /Acesso restrito/)
})

test('detecta loop de paginação e Functions indisponíveis no Vite', async () => {
  await assert.rejects(fetchR2Models(new AbortController().signal, async () =>
    Response.json({ models: [], scanned: 0, nextCursor: 'repeated' })), /paginação/)
  await assert.rejects(fetchR2Models(new AbortController().signal, async () =>
    new Response('<html></html>', { headers: { 'Content-Type': 'text/html' } })), /netlify dev/)
})
