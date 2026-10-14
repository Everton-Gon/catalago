import assert from 'node:assert/strict'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto(process.env.STOREFRONT_URL || 'http://127.0.0.1:5173', { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Mostrar banner 6: Modelos de caneca', exact: true }).click()
    const slide = page.locator('.hero-slide.is-active')
    assert.equal(await slide.locator('figure').count(), 0)
    assert.equal(await slide.locator('img').count(), 1)
    const photo=slide.locator('img')
    await photo.evaluate(img=>img.decode())
    assert((await photo.getAttribute('src')).endsWith('banner-canecas-personalizadas.webp'))
    assert((await photo.getAttribute('alt')).includes('Street Fighter'))
    assert(await photo.evaluate(img=>img.naturalWidth===2079 && img.naturalHeight===756))
    assert.equal(await slide.getByRole('link', { name: 'Explorar canecas' }).getAttribute('href'), '/categoria/canecas')
    const url = new URL(await slide.getByRole('link', { name: 'Pedir pelo WhatsApp' }).getAttribute('href'))
    assert.equal(url.hostname, 'wa.me')
    assert(url.searchParams.get('text').includes('alça de coração, borda dourada ou colher'))
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    if (process.env.STOREFRONT_ARTIFACTS && [390,1440].includes(width)) {
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
      await page.screenshot({ path: `${process.env.STOREFRONT_ARTIFACTS}/banner-canecas-${width}.png`, animations: 'disabled' })
    }
  }
  console.log('PASS: cena única com modelos personalizados em seis larguras; imagem, alternativas e destinos reais')
} finally { await browser.close() }
