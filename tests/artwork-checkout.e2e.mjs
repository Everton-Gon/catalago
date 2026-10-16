import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { mkdir, readFile } from 'node:fs/promises'
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const bundle = await build({ stdin: { contents: `export {PRODUCTS} from './src/data/products.ts'`, resolveDir: process.cwd() }, bundle: true, write: false, format: 'esm', platform: 'node' })
const { PRODUCTS } = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'))
const product = { ...PRODUCTS.find(p => p.category === 'personalizados'), id: 'qa-art', slug: 'qa-art', name: 'Almofada Arte QA', price: 40, variants: [], status: 'published', available: true, personalization: { enabled: true, nameField: { label: 'Nome para personalização', maxLength: 100 }, textField: { label: 'Texto da arte', maxLength: 100 } } }
const png=await readFile('public/brand/fe-proposito-logo.png')
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) })
const base = process.env.STOREFRONT_URL || 'http://127.0.0.1:5173'
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' })
    const errors=[], attempts=[]; let reject=true, release, orders=[]
    await context.route(/\/node_modules\/\.vite\/deps\/@netlify_identity\.js/,r=>r.fulfill({contentType:'application/javascript',body:`const user={id:'qa-admin',email:'qa@example.test',roles:['admin']};export async function getUser(){return user}export async function handleAuthCallback(){return null}export function onAuthChange(){return()=>{}}export async function login(){return user}export async function logout(){}export async function acceptInvite(){return user}export async function updateUser(){return user}`}))
    await context.route('**/api/**',async route=>{
      const req=route.request(),path=new URL(req.url()).pathname
      if(path==='/api/catalog'||path==='/api/admin/products')return route.fulfill({json:[product]})
      if(path==='/api/admin/orders')return route.fulfill({json:orders})
      if(path==='/api/quote-image')return route.fulfill({contentType:'image/png',body:png})
      if(path!=='/api/customer-quote')return route.fulfill({json:null})
      const form=await new Request(req.url(),{method:'POST',headers:req.headers(),body:req.postDataBuffer()}).formData()
      const payload=JSON.parse(form.get('payload'));attempts.push(payload)
      assert.equal(form.get('file-0').name,'referencia-final.png');assert.deepEqual(Buffer.from(await form.get('file-0').arrayBuffer()),png)
      if(reject){reject=false;return route.fulfill({status:503,json:{error:'Falha de gravação simulada. Tente novamente.'}})}
      await new Promise(resolve=>{release=resolve})
      const url=base+'/api/quote-image?quote=web-qa&file=0&token=fixture'
      orders=[{id:'web-qa',number:'FP-QA-123',customer:payload.customer,phone:payload.phone,createdAt:new Date().toISOString(),source:'storefront',items:[{productId:product.id,name:product.name,quantity:1,unitPrice:40,options:{},notes:'Nome: Maria\nCentralizada',attachments:[url]}],notes:payload.notes,attachments:[url],status:'pending',payment:'unconfirmed',totalKind:'estimated',history:[]}]
      return route.fulfill({json:{number:'FP-QA-123',hasImages:true,whatsappUrl:'https://wa.me/5585986389141?text='+encodeURIComponent('Orçamento FP-QA-123\nImagem de referência anexada ao orçamento\n'+url)}})
    })
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message))
    await page.goto(base+'/produto/qa-art');const main=page.locator('main')
    await main.getByLabel('Enviar foto ou arte',{exact:true}).setInputFiles({name:'invalid.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg/>')})
    await main.getByRole('alert').filter({hasText:'JPG'}).waitFor()
    await main.getByLabel('Enviar foto ou arte',{exact:true}).setInputFiles({name:'primeira.png',mimeType:'image/png',buffer:png})
    await main.getByText('Imagem anexada ao produto',{exact:true}).waitFor()
    await main.getByRole('button',{name:'Remover imagem',exact:true}).click()
    assert.equal(await main.getByText('Imagem anexada ao produto',{exact:true}).count(),0)
    await main.getByLabel('Enviar foto ou arte',{exact:true}).setInputFiles({name:'segunda.png',mimeType:'image/png',buffer:png})
    await main.getByLabel('Substituir foto ou arte',{exact:true}).waitFor()
    await main.getByLabel('Substituir foto ou arte',{exact:true}).setInputFiles({name:'referencia-final.png',mimeType:'image/png',buffer:png})
    await main.getByText('referencia-final.png',{exact:true}).waitFor()
    await main.getByLabel('Nome para personalização',{exact:true}).fill('Maria')
    await main.getByLabel('Observações para o pedido').fill('Centralizada')
    await main.getByRole('button',{name:'Adicionar à sacola',exact:true}).click()
    const drawer=page.getByRole('dialog',{name:'Minha sacola',exact:true})
    await drawer.getByText('referencia-final.png',{exact:true}).waitFor()
    await drawer.getByRole('link',{name:'Ver sacola completa'}).click()
    await page.reload();await main.getByText('referencia-final.png',{exact:true}).waitFor()
    await main.getByRole('img',{name:'Arte anexada: referencia-final.png'}).evaluate(img=>img.decode())
    await main.getByRole('link',{name:'Editar opções ou personalização'}).click()
    await main.getByText('referencia-final.png',{exact:true}).waitFor()
    await main.getByRole('button',{name:'Salvar alterações na sacola'}).click()
    await main.getByRole('button',{name:'Enviar pedido pelo WhatsApp',exact:true}).click()
    await main.getByLabel('Seu nome',{exact:true}).fill('Cliente QA')
    await main.getByLabel('Seu WhatsApp com DDD').fill('85999999999')
    await main.getByRole('button',{name:'Registrar orçamento',exact:true}).click()
    await main.getByRole('alert').filter({hasText:'Falha de gravação simulada'}).waitFor()
    assert.equal(await main.getByRole('link',{name:'Continuar no WhatsApp'}).count(),0)
    assert.equal(orders.length,0)
    await main.getByRole('button',{name:'Registrar orçamento',exact:true}).click()
    await page.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>b.textContent.includes('Salvando orçamento')))
    assert.equal(await main.getByRole('link',{name:'Continuar no WhatsApp'}).count(),0)
    while(!release)await new Promise(resolve=>setTimeout(resolve,20));release()
    await main.getByText('Orçamento nº FP-QA-123 registrado com sua imagem.',{exact:true}).waitFor()
    assert.equal(attempts[0].submissionId,attempts[1].submissionId)
    assert.equal(attempts[1].items[0].personalization.name,'Maria');assert.equal(attempts[1].items[0].hasImage,true)
    const message=new URL(await main.getByRole('link',{name:'Continuar no WhatsApp'}).getAttribute('href')).searchParams.get('text')
    assert.match(message,/Imagem de referência anexada/);assert.match(message,/api\/quote-image/)
    if(process.env.STOREFRONT_ARTIFACTS){await mkdir(process.env.STOREFRONT_ARTIFACTS,{recursive:true});await page.screenshot({path:process.env.STOREFRONT_ARTIFACTS+'/arte-orcamento-'+width+'.png',fullPage:true})}
    await page.goto(base+'/admin');
    if(width<900){await page.getByRole('button',{name:'Abrir menu administrativo'}).click();await page.getByRole('dialog').getByRole('button',{name:'Pedidos e orçamentos',exact:true}).click()}
    else await page.locator('.admin-sidebar').getByRole('button',{name:'Pedidos e orçamentos',exact:true}).click()
    await page.getByRole('cell',{name:/FP-QA-123/}).waitFor()
    await page.getByRole('button',{name:'Detalhes',exact:true}).click()
    await page.getByRole('img',{name:'Arte de referência de '+product.name}).evaluate(img=>img.decode())
    assert.deepEqual(errors,[])
    await context.close()
    console.log('PASS '+width+'px: remover/substituir arte, prévia, recarga/edição da sacola, falha sem falso sucesso, repetição segura, confirmação, link WhatsApp e imagem no admin')
  }
} finally { await browser.close() }
