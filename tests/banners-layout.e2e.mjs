const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
import assert from 'node:assert/strict'
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL ? {channel:process.env.BROWSER_CHANNEL} : {})})
const page=await browser.newPage({viewport:{width:1440,height:1000}})
await page.emulateMedia({reducedMotion:'reduce'})
await page.goto(process.env.STOREFRONT_URL || 'http://127.0.0.1:5173/',{waitUntil:'networkidle'})
for (const width of [320,390,768,1024,1440,1920]) {
  await page.setViewportSize({width,height:1000})
  await page.reload({waitUntil:'networkidle'})
  await page.waitForFunction(width=>innerWidth===width,width)
  await page.evaluate(()=>document.fonts.ready)
  await page.locator('.hero-slide.is-active img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())))
  const baseline=await page.evaluate(()=>document.querySelector('.service-strip').getBoundingClientRect().top + scrollY)
  for (const [index,name] of [[1,'Gospel'],[2,'Filmes e séries'],[3,'Animes e desenhos'],[4,'Games'],[5,'Presentes personalizados'],[6,'Modelos de caneca']]) {
    await page.getByRole('button',{name:`Mostrar banner ${index}: ${name}`,exact:true}).click()
    await page.waitForFunction(index=>document.querySelector('.hero-slide.is-active')?.getAttribute('aria-label')?.startsWith(`${index} de`),index)
    await page.locator('.hero-slide.is-active img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())))
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
    assert.equal(await page.evaluate(()=>document.querySelector('.service-strip').getBoundingClientRect().top + scrollY),baseline)
    if (index === 2) {
      const slide=page.locator('.hero-slide.is-active')
      assert.equal(await slide.locator('h1').innerText(),'Suas histórias favoritas, no seu estilo.')
      for (const link of await slide.getByRole('link').all()) assert((await link.getAttribute('href')).startsWith('https://wa.me/'))
      const geometry=await slide.locator('img').evaluate(img=> {
        const image=img.getBoundingClientRect(), frame=img.closest('.hero-art-window').getBoundingClientRect()
        return { ratio:image.width/image.height, natural:img.naturalWidth/img.naturalHeight, crop:(frame.left-image.left)/image.width, right:frame.right-image.right }
      })
      assert(Math.abs(geometry.ratio-geometry.natural)<0.002)
      assert(Math.abs(geometry.crop-0.47)<0.002)
      assert(Math.abs(geometry.right)<1)
      if(process.env.STOREFRONT_ARTIFACTS && [390,1440].includes(width)) {
        await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}))
        await page.screenshot({path:`${process.env.STOREFRONT_ARTIFACTS}/banner-filmes-${width}.png`,animations:'disabled'})
      }
    }
    if(width<=900) {
      const scene=await page.locator('.hero-slide.is-active .hero-scene').boundingBox()
      const copy=await page.locator('.hero-slide.is-active .hero-copy').boundingBox()
      assert(scene.y>=copy.y+copy.height)
    }
  }
}
await page.setViewportSize({width:390,height:1000})
await page.evaluate(()=>scrollTo(0,0))
if(process.env.STOREFRONT_ARTIFACTS) await page.screenshot({path:process.env.STOREFRONT_ARTIFACTS+'/carrossel-presentes-mobile.png',animations:'disabled'})
console.log('PASS: seis banners reais em seis larguras, sem rolagem horizontal, sobreposição ou deslocamento do conteúdo abaixo')
await browser.close()

