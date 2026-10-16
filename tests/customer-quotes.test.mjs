import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
import { randomUUID } from 'node:crypto'
const state = { values: {}, objects: {}, puts: 0, failPut: false, failStore: false, failAck: false, admin: true }
globalThis.__quoteFixture = state
const blobs = `export function getStore(){const s=globalThis.__quoteFixture;return {get:async key=>structuredClone(s.values[key]??null),list:async function*({prefix}){yield {blobs:Object.keys(s.values).filter(key=>key.startsWith(prefix)).map(key=>({key}))}},setJSON:async(key,value,options)=>{if(s.failStore&&key.startsWith('customer-quotes/'))throw Error('storage unavailable');if(options?.onlyIfNew&&s.values[key])return {modified:false};s.values[key]=structuredClone(value);if(s.failAck&&key.startsWith('customer-quotes/'))throw Error('acknowledgement lost');return {modified:true}}}}`
const aws = `export class PutObjectCommand{constructor(input){this.input=input;this.kind='put'}}export class DeleteObjectCommand{constructor(input){this.input=input;this.kind='delete'}}export class GetObjectCommand{constructor(input){this.input=input;this.kind='get'}}export class S3Client{async send(command){const s=globalThis.__quoteFixture,k=command.input.Bucket+'/'+command.input.Key;if(command.kind==='put'){if(s.failPut)throw Error('R2 failed');s.objects[k]=command.input.Body;s.puts++;return {}}if(command.kind==='delete'){delete s.objects[k];return {}}if(!s.objects[k])throw Error('missing');return {Body:{transformToByteArray:async()=>s.objects[k]}}}}`
const identity = `export async function getUser(){return globalThis.__quoteFixture.admin?{email:'admin@example.test',roles:['admin']}:null}export function verifyRequestOrigin(request){if(request.headers.get('origin')!=='https://shop.example')throw Error('origin')}`
const bundle = await build({ stdin: { contents: `export {default as submit} from './netlify/functions/customer-quote.ts';export {default as image} from './netlify/functions/quote-image.ts';export {default as orders} from './netlify/functions/admin-orders.ts';export {PRODUCTS} from './src/data/products.ts'`, resolveDir: process.cwd() }, tsconfig: 'tsconfig.app.json', bundle: true, write: false, platform: 'node', format: 'esm', plugins: [{ name: 'fixtures', setup(b) { b.onResolve({ filter: /^(@netlify\/(identity|blobs)|@aws-sdk\/client-s3)$/ }, args => ({ path: args.path, namespace: 'fixture' })); b.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ contents: args.path.endsWith('blobs') ? blobs : args.path.endsWith('identity') ? identity : aws, loader: 'js' })) } }] })
const api = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'))
process.env.R2_ACCOUNT_ID='fixture';process.env.R2_ACCESS_KEY_ID='fixture';process.env.R2_SECRET_ACCESS_KEY='fixture';process.env.R2_BUCKET_NAME='public';process.env.R2_QUOTES_BUCKET_NAME='private'
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRZkAAAAASUVORK5CYII=','base64')
function reset(){state.values={products:[{...structuredClone(api.PRODUCTS[0]),id:'qa',slug:'qa',price:40,variants:[],available:true,status:'published'}],orders:[]};state.objects={};state.puts=0;state.failPut=false;state.failStore=false;state.admin=true}
const input=()=>({submissionId:randomUUID(),customer:'Cliente QA',phone:'85999999999',notes:'Retirar na loja',items:[{productId:'qa',quantity:2,options:{},notes:'Centralizada',personalization:{name:'Maria',text:'Com carinho'},hasImage:true,unitPrice:0.01}],payment:'confirmed',status:'completed'})
function request(value, file=new File([png],'arte.png',{type:'image/png'}),origin='https://shop.example') {const form=new FormData();form.set('payload',JSON.stringify(value));if(file)form.set('file-0',file);return new Request('https://shop.example/api/customer-quote',{method:'POST',headers:{origin},body:form})}
test('salva arquivo privado e orçamento com preço real, número e imagem por item; repetição não duplica',async()=>{
  reset();const payload=input();const response=await api.submit(request(payload));assert.equal(response.status,200);const receipt=await response.json();assert(receipt.hasImages);assert.match(receipt.number,/^FP-/)
  const saved=state.values['customer-quotes/web-'+payload.submissionId];assert(saved);assert.equal(saved.order.payment,'unconfirmed');assert.equal(saved.order.totalKind,'estimated');assert.equal(saved.order.status,'pending');assert.equal(saved.order.items[0].unitPrice,40);assert.match(saved.order.items[0].notes,/Maria/);assert.equal(saved.files[0].bucket,'private');assert.equal(saved.order.items[0].attachments[0],saved.order.attachments[0]);assert(!saved.order.attachments[0].includes('.r2.dev'))
  const message=new URL(receipt.whatsappUrl).searchParams.get('text');assert.match(message,/Imagem de referência anexada ao orçamento/);assert(message.includes(saved.order.attachments[0]));assert.match(message,/80,00/)
  assert.deepEqual(await(await api.submit(request(payload))).json(),receipt);assert.equal(state.puts,1);assert.equal(Object.keys(state.values).filter(k=>k.startsWith('customer-quotes/')).length,1)
})
test('imagem exige token correto e não é cacheada; admin recebe orçamento e preserva arquivo ao editar',async()=>{
  reset();const payload=input();await api.submit(request(payload));const saved=state.values['customer-quotes/web-'+payload.submissionId],url=saved.order.attachments[0]
  assert.equal((await api.image(new Request(url.replace(/token=[^&]+/,'token='+'0'.repeat(64))))).status,404)
  assert.equal((await api.image(new Request(url.replace(/&token=[^&]+/,'')))).status,404)
  const response=await api.image(new Request(url));assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(response.headers.get('content-type'),'image/png');assert.deepEqual(Buffer.from(await response.arrayBuffer()),png)
  const orders=await(await api.orders(new Request('https://shop.example/api/admin/orders'))).json();assert.equal(orders[0].source,'storefront');const updated={...orders[0],status:'production'}
  const result=await api.orders(new Request('https://shop.example/api/admin/orders',{method:'PUT',headers:{origin:'https://shop.example'},body:JSON.stringify(updated)}));assert.equal(result.status,200);const after=state.values['customer-quotes/web-'+payload.submissionId];assert.equal(after.order.status,'production');assert.equal(after.token,saved.token);assert.equal(after.order.history.length,2);assert.equal((await api.image(new Request(url))).status,200)
  state.admin=false;assert.equal((await api.orders(new Request('https://shop.example/api/admin/orders'))).status,401)
})
test('falhas de R2 e do registro não confirmam orçamento e removem uploads parciais',async()=>{
  reset();state.failPut=true;assert.equal((await api.submit(request(input()))).status,503);assert.equal(Object.keys(state.values).filter(k=>k.startsWith('customer-quotes/')).length,0)
  reset();state.failStore=true;assert.equal((await api.submit(request(input()))).status,503);assert.equal(Object.keys(state.objects).length,0)
})
test('recusa origem externa, arquivos disfarçados, opção inexistente e imagem faltante',async()=>{
  reset();assert.equal((await api.submit(request(input(),undefined,'https://other.example'))).status,403)
  assert.equal((await api.submit(request(input(),new File(['not an image'],'fake.png',{type:'image/png'})))).status,400)
  assert.equal((await api.submit(request(input(),null))).status,400)
  const bad=input();bad.items[0].options={tamanho:'XYZ'};assert.equal((await api.submit(request(bad))).status,400);assert.equal(state.puts,0)
})
test('sem imagem funciona sem credenciais R2; bucket público nunca recebe arte de cliente',async()=>{
  reset();const value=input();value.items[0].hasImage=false;delete process.env.R2_QUOTES_BUCKET_NAME;assert.equal((await api.submit(request(value,null))).status,200)
  process.env.R2_QUOTES_BUCKET_NAME='public';assert.equal((await api.submit(request(input()))).status,503);assert.equal(state.puts,0);process.env.R2_QUOTES_BUCKET_NAME='private'
})

test('duas artes ficam nos itens certos; submissões concorrentes não duplicam registros',async()=>{
  reset();const value=input();value.items.push({...value.items[0],personalization:{name:'João'}})
  const make=()=>{const form=new FormData();form.set('payload',JSON.stringify(value));form.set('file-0',new File([png],'maria.png',{type:'image/png'}));form.set('file-1',new File([png],'joao.png',{type:'image/png'}));return new Request('https://shop.example/api/customer-quote',{method:'POST',headers:{origin:'https://shop.example'},body:form})}
  const results=await Promise.all([api.submit(make()),api.submit(make())]);assert(results.every(r=>r.status===200));assert.deepEqual(await results[0].json(),await results[1].json())
  const stored=state.values['customer-quotes/web-'+value.submissionId];assert.equal(stored.files[0].name,'maria.png');assert.equal(stored.files[1].name,'joao.png');assert.notEqual(stored.order.items[0].attachments[0],stored.order.items[1].attachments[0]);assert.equal(Object.keys(state.objects).length,2)
})

test('opções sob consulta continuam permitindo orçamento sem inventar preço final',async()=>{
  reset();state.values.products[0].variants=[{id:'modelo',name:'Modelo',options:[{label:'Especial',priceOnRequest:true}]}];const value=input();value.items[0].options={modelo:'Especial'};value.items[0].hasImage=false
  const result=await api.submit(request(value,null));assert.equal(result.status,200);const receipt=await result.json();assert.match(new URL(receipt.whatsappUrl).searchParams.get('text'),/Sob consulta/);assert.equal(state.values['customer-quotes/web-'+value.submissionId].order.items[0].priceOnRequest,true)
})

test('confirmação perdida após gravar não apaga a arte de um orçamento salvo',async()=>{
  reset();state.failAck=true;const value=input();const response=await api.submit(request(value));assert.equal(response.status,200);assert.equal(Object.keys(state.objects).length,1);const stored=state.values['customer-quotes/web-'+value.submissionId];assert.equal((await api.image(new Request(stored.order.attachments[0]))).status,200);state.failAck=false
})
