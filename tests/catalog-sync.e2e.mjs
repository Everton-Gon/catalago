import assert from 'node:assert/strict'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
const base = process.env.STOREFRONT_URL || 'http://127.0.0.1:4173'
const product = (id, name, extra = {}) => ({ id, slug: id, name, category: 'personalizados', shortDescription: 'Personalizado QA', description: 'Produto de teste', images: ['/brand/fe-proposito-assinatura.webp'], price: 45, available: true, status: 'published', featured: false, salesRank: 0, createdAt: '2026-10-15', personalization: { enabled: true }, variants: [], ...extra })
const old = product('qa-antiga', 'Almofada antiga QA')
const bluey = product('qa-bluey', 'Almofada Bluey Bingo QA', { price: 40, oldPrice: 45, available: false, status: 'draft' })
let products = [old, bluey], fail = false, requests = 0, holdNext = false, releaseOld
const errors = []
await context.route('**/api/**', async route => {
  if (!route.request().url().includes('/api/catalog')) return route.fulfill({ json: null })
  requests++
  const snapshot = structuredClone(products)
  if (holdNext) { holdNext = false; await new Promise(resolve => { releaseOld = resolve }) }
  return fail ? route.fulfill({ status: 503, json: { error: 'Simulação' } }) : route.fulfill({ json: snapshot })
})
const page = await context.newPage()
page.on('pageerror', e => errors.push(e.message))
const expectNames = async names => {
  await page.waitForFunction(expected => JSON.stringify([...document.querySelectorAll('main .product-card h3')].map(n => n.textContent).sort()) === JSON.stringify([...expected].sort()), names)
  assert.match(await page.locator('.catalog-result-count').innerText(), new RegExp(`^${names.length} produto`))
}
try {
  await page.goto(base + '/categoria/personalizados')
  await expectNames([old.name])
  products = [{ ...old, available: false }, { ...bluey, available: true, status: 'published' }]
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expectNames([bluey.name])
  assert.match(await page.locator('.product-card').innerText(), /40,00/)
  console.log('PASS: ao voltar à aba, publicado aparece, desativado sai e preço/contagem atualizam')

  const otherTab = await context.newPage()
  await otherTab.goto(base + '/contato')
  const added = product('qa-colher', 'Caneca com colher QA')
  products = [...products, added]
  // Same signal emitted by AdminWorkspace only after a successful save.
  await otherTab.evaluate(() => localStorage.setItem('fp-catalog-updated', String(Date.now())))
  await expectNames([added.name, bluey.name])
  await otherTab.close()
  console.log('PASS: publicação em outra aba atualiza a vitrine sem recarregar a página')

  holdNext = true
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  while (!releaseOld) await new Promise(resolve => setTimeout(resolve, 20))
  products = [{ ...bluey, available: true, status: 'published', name: 'Almofada atualizada QA' }]
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
  await expectNames(['Almofada atualizada QA'])
  releaseOld()
  await page.waitForLoadState('networkidle')
  await expectNames(['Almofada atualizada QA'])
  console.log('PASS: resposta atrasada não sobrescreve a publicação mais recente')

  fail = true
  await page.reload()
  await page.getByRole('alert').waitFor()
  assert.equal(await page.locator('.product-card').count(), 0)
  fail = false
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expectNames(['Almofada atualizada QA'])
  assert.equal(await page.getByRole('alert').count(), 0)
  console.log('PASS: falha na API mostra aviso e recuperação, sem apresentar catálogo estático antigo')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload()
  await expectNames(['Almofada atualizada QA'])
  assert.deepEqual(errors, [])
  assert(requests >= 7)
  console.log('PASS: catálogo atualizado também no celular; nenhum erro de execução')
} catch (error) { console.log({requests,errors,cards:await page.locator('.product-card h3').allTextContents(),body:(await page.locator('body').innerText()).slice(0,2500)}); throw error } finally {
  releaseOld?.()
  await browser.close()
}
