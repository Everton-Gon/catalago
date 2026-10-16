import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { writeFile, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { randomUUID } from 'node:crypto'

test('funções iniciam com dependências reais e sem atalhos de importação do Vite', async () => {
  const output = join(process.cwd(), `.quote-runtime-${randomUUID()}.mjs`)
  try {
    const result = await build({
      stdin: { contents: `export {default as submit} from './netlify/functions/customer-quote.ts';export {default as image} from './netlify/functions/quote-image.ts';export {default as orders} from './netlify/functions/admin-orders.ts'`, resolveDir: process.cwd() },
      // Deliberately omit the Vite path mappings; Netlify must load the module on its own.
      tsconfigRaw: { compilerOptions: {} }, bundle: true, write: false,
      platform: 'node', format: 'esm', packages: 'external',
    })
    await writeFile(output, result.outputFiles[0].text)
    const api = await import(pathToFileURL(output).href)
    assert.equal((await api.submit(new Request('https://shop.example/api/customer-quote', { method: 'OPTIONS' }))).status, 405)
    assert.equal((await api.image(new Request('https://shop.example/api/quote-image', { method: 'OPTIONS' }))).status, 405)
    assert.equal(typeof api.orders, 'function')
  } finally { await unlink(output).catch(() => {}) }
})
