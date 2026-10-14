const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
import assert from 'node:assert/strict'
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL ? {channel:process.env.BROWSER_CHANNEL} : {})})
const page=await browser.newPage({viewport:{width:1440,height:1000}})
const output=process.env.STOREFRONT_ARTIFACTS
await page.emulateMedia({reducedMotion:'reduce'})
await page.goto(process.env.STOREFRONT_URL || 'http://127.0.0.1:5173/',{waitUntil:'networkidle'})
await page.evaluate(()=>document.fonts.ready)
await page.locator('.hero-slide.is-active .hero-scene img').evaluate(img=>img.decode())
for(const width of [320,390,768,1024,1440,1920]) {
  await page.setViewportSize({width,height:1000})
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
  const hero=await page.locator('.hero-slide.is-active').boundingBox()
  const copy=await page.locator('.hero-slide.is-active .hero-copy').boundingBox()
  const scene=await page.locator('.hero-slide.is-active .hero-scene').boundingBox()
  console.log(width,JSON.stringify({hero,copy,scene}))
  if(width>900) assert(copy.x+copy.width<=width*.54)
  else assert(scene.y>=copy.y+copy.height)
  assert.equal(await page.locator('.hero-slide.is-active .hero-actions').getByRole('link',{name:'Explorar produtos'}).getAttribute('href'),'/produtos')
  assert((await page.locator('.hero-slide.is-active .hero-actions').getByRole('link',{name:'Pedir pelo WhatsApp'}).getAttribute('href')).startsWith('https://wa.me/'))
  if(output && width===1440) await page.screenshot({path:output+'/banner-integrado-desktop.png',animations:'disabled'})
  if(output && width===390) await page.screenshot({path:output+'/banner-integrado-mobile.png',animations:'disabled'})
}
await browser.close()
