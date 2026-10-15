import assert from 'node:assert/strict'
import test from 'node:test'
import {build} from 'esbuild'
const state={user:null,values:{},writes:0,reads:[]}
globalThis.__adminServerFixture=state
const identity=`export async function getUser(){return globalThis.__adminServerFixture.user}export function verifyRequestOrigin(request){if(request.headers.get('origin')!=='https://shop.example')throw new Error('Forbidden origin')}`
const blobs=`export function getStore(){return {get:async(key,options)=>{globalThis.__adminServerFixture.reads.push({key,options});return structuredClone(globalThis.__adminServerFixture.values[key]??null)},setJSON:async(key,value)=>{globalThis.__adminServerFixture.values[key]=structuredClone(value);globalThis.__adminServerFixture.writes++}}}`
const result=await build({stdin:{contents:`export {default as products} from './netlify/functions/admin-products.ts';export {default as content} from './netlify/functions/admin-content.ts';export {default as orders} from './netlify/functions/admin-orders.ts';export {default as storefront} from './netlify/functions/storefront.ts';export {default as catalog} from './netlify/functions/catalog.ts';export {PRODUCTS} from './src/data/products.ts';export {DEFAULT_CONTENT} from './src/data/storefrontContent.ts';`,resolveDir:process.cwd()},tsconfig:'tsconfig.app.json',bundle:true,write:false,platform:'node',format:'esm',plugins:[{name:'isolated-services',setup(builder){builder.onResolve({filter:/^@netlify\/(identity|blobs)$/},args=>({path:args.path,namespace:'fixture'}));builder.onLoad({filter:/.*/,namespace:'fixture'},args=>({contents:args.path.endsWith('identity')?identity:blobs,loader:'js'}))}}]})
const api=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'))
function request(path,method='GET',value,origin='https://shop.example'){return new Request(`https://shop.example/api/admin/${path}`,{method,headers:{origin,'Content-Type':'application/json'},...(value!==undefined?{body:JSON.stringify(value)}:{})})}
function reset(){state.user={email:'admin@example.test',roles:['admin']};state.values={products:structuredClone(api.PRODUCTS),content:structuredClone(api.DEFAULT_CONTENT),orders:[]};state.writes=0}
test('endpoints administrativos negam visitantes, não-admin e origem externa',async()=>{
  for(const handler of [api.products,api.content,api.orders]){reset();state.user=null;assert.equal((await handler(request('data'))).status,401);state.user={roles:[]};assert.equal((await handler(request('data'))).status,403);state.user={roles:['admin']};assert.equal((await handler(request('data','PUT',[],'https://other.example'))).status,403);assert.equal(state.writes,0)}
})
test('produtos preservam dados reais e validam duplicação, preço e variantes no servidor',async()=>{
  reset();const products=structuredClone(api.PRODUCTS);assert.equal((await api.products(request('products','PUT',products))).status,200);assert.deepEqual(state.values.products,products)
  const invalid=structuredClone(products);invalid[0].price=-1;assert.equal((await api.products(request('products','PUT',invalid))).status,400)
  const duplicate=structuredClone(products[0]);duplicate.id='qa-copy';duplicate.slug+='-qa-copy';duplicate.status='draft';duplicate.price=0;assert.equal((await api.products(request('products','PUT',[...products,duplicate]))).status,200)
  assert.equal((await api.products(request('products','PUT',[...products,{...duplicate,id:products[0].id}]))).status,400)
  const badOption=structuredClone(products);badOption[0].variants[0].options[0].price=NaN;assert.equal((await api.products(request('products','PUT',badOption))).status,400)
})
test('conteúdo bloqueia links perigosos, intervalo inválido e remoção do principal',async()=>{
  reset();assert.equal((await api.content(request('content','PUT',api.DEFAULT_CONTENT))).status,200)
  for(const mutate of [c=>c.intervalMs=4000,c=>c.banners[0].active=false,c=>c.banners[1].primary.href='javascript:alert(1)',c=>c.banners[1].image='data:image/svg+xml,bad']){const value=structuredClone(api.DEFAULT_CONTENT);mutate(value);assert.equal((await api.content(request('content','PUT',value))).status,400)}
  const value=structuredClone(api.DEFAULT_CONTENT);value.banners[1].active=false;value.collections[0].active=false;state.values.content=value;const publicValue=await (await api.storefront(new Request('https://shop.example/api/storefront'))).json();assert(!publicValue.banners.some(b=>b.id==='filmes-series'));assert(!publicValue.collections.some(c=>c.id==='gospel'))
})
test('orçamentos recebem ID/histórico no servidor e protegem produtos vinculados',async()=>{
  reset();const input={id:'cliente-nao-escolhe-id',number:'numero-falso',customer:'Cliente QA',phone:'5511999999999',createdAt:'2000-01-01',items:[{productId:api.PRODUCTS[0].id,name:api.PRODUCTS[0].name,quantity:2,unitPrice:40,options:{cor:'Azul'},notes:'Nome Ana'}],notes:'Atendimento manual',attachments:[],status:'pending',payment:'unconfirmed',totalKind:'estimated',history:[{actor:'falso'}]}
  const response=await api.orders(request('orders','POST',input));assert.equal(response.status,200);const saved=await response.json();assert.notEqual(saved.id,input.id);assert.notEqual(saved.number,input.number);assert.equal(saved.history.length,1);assert.equal(saved.history[0].actor,'admin@example.test');assert.equal(saved.payment,'unconfirmed');assert.equal(saved.totalKind,'estimated')
  const update={...saved,status:'production',payment:'confirmed'};assert.equal((await api.orders(request('orders','PUT',update))).status,200);assert.equal(state.values.orders[0].history.length,2)
  assert.equal((await api.products(request('products','PUT',api.PRODUCTS.filter(p=>p.id!==input.items[0].productId)))).status,400)
  assert.equal((await api.orders(request('orders','POST',{...input,items:[{...input.items[0],quantity:0}]}))).status,400)
})
test('coleções vinculadas não podem ser removidas pela API',async()=>{
  reset();state.values.products[0].collections=['gospel'];const value=structuredClone(api.DEFAULT_CONTENT);value.collections=value.collections.filter(c=>c.id!=='gospel');assert.equal((await api.content(request('content','PUT',value))).status,400)
})

test('catálogo público lê a versão atual sem cache após publicação e desativação',async()=>{
  reset();state.reads=[]
  const updated=structuredClone(api.PRODUCTS)
  updated[0].available=false
  updated[1].price=40
  assert.equal((await api.products(request('products','PUT',updated))).status,200)
  const response=await api.catalog(new Request('https://shop.example/api/catalog'))
  assert.deepEqual(await response.json(),updated)
  for(const header of ['cache-control','cdn-cache-control','netlify-cdn-cache-control'])assert.equal(response.headers.get(header),'no-store')
  const read=state.reads.filter(r=>r.key==='products').at(-1)
  assert.equal(read.options.consistency,'strong')
  assert.equal(state.writes,1)
})
