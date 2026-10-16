import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'
const state={user:null,renew:async()=>null,refreshes:0}
globalThis.__sessionFixture=state
const mock=`export async function getUser(){return globalThis.__sessionFixture.user}export async function refreshSession(){globalThis.__sessionFixture.refreshes++;return globalThis.__sessionFixture.renew()}export function verifyRequestOrigin(request){if(request.headers.get('origin')!=='https://shop.example')throw Error('origin')}`
const result=await build({stdin:{contents:`export {adminFetch} from './src/utils/admin-session.ts';export {requireAdmin,getAdminSessionUser} from './netlify/functions/_lib/auth.ts'`,resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm',plugins:[{name:'identity-fixture',setup(b){b.onResolve({filter:/^@netlify\/identity$/},args=>({path:args.path,namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:mock,loader:'js'}))}}]})
const api=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'))
const originalFetch=globalThis.fetch,originalURL=process.env.URL
function browser(){globalThis.window={};globalThis.document={cookie:'nf_jwt=test-session'};state.refreshes=0;state.renew=async()=>null}
function server(){delete globalThis.window;delete globalThis.document;state.user=null;process.env.URL='https://shop.example'}
test.after(()=>{globalThis.fetch=originalFetch;delete globalThis.window;delete globalThis.document;if(originalURL===undefined)delete process.env.URL;else process.env.URL=originalURL})

test('renova uma vez para chamadas paralelas e envia token somente ao admin local',async()=>{
  browser();const calls=[];globalThis.fetch=async(url,options)=>{calls.push({url,options});return Response.json({ok:true})}
  await Promise.all(['products','content','orders'].map(path=>api.adminFetch('/api/admin/'+path)))
  assert.equal(state.refreshes,1);assert.equal(calls.length,3)
  for(const {options} of calls){assert.equal(options.headers.get('authorization'),'Bearer test-session');assert.equal(options.credentials,'same-origin');assert.equal(options.cache,'no-store')}
  await assert.rejects(()=>api.adminFetch('https://other.example/api/admin/products'),/Destino/);assert.equal(calls.length,3)
})

test('401 repete somente quando a renovação fornece um token novo; POST não é repetido sem renovação',async()=>{
  browser();let requests=0
  state.renew=async()=>{if(state.refreshes===2)document.cookie='nf_jwt=new-session'}
  globalThis.fetch=async(url,options)=>{requests++;if(requests===1)return Response.json({error:'Não autenticado'},{status:401});assert.equal(options.headers.get('authorization'),'Bearer new-session');return Response.json({ok:true})}
  assert.equal((await api.adminFetch('/api/admin/products',{method:'PUT',body:'[]'})).status,200);assert.equal(requests,2)
  browser();requests=0;globalThis.fetch=async()=>{requests++;return Response.json({error:'Não autenticado'},{status:401})}
  await assert.rejects(()=>api.adminFetch('/api/admin/products',{method:'PUT',body:'[]'}),/sessão administrativa/);assert.equal(requests,1)
})

test('cookie é verificado na API Identity quando o contexto do runtime está ausente; perfil verificado fica restrito à requisição',async()=>{
  server();let calls=0
  globalThis.fetch=async(url,options)=>{calls++;assert.equal(String(url),'https://shop.example/.netlify/identity/user');assert.equal(options.headers.Authorization,'Bearer valid-session');return Response.json({id:'verified-admin',email:'admin@example.test',app_metadata:{roles:['admin']}})}
  const request=new Request('https://shop.example/api/admin/products',{headers:{cookie:'other=1; nf_jwt=valid-session'}})
  assert.equal(await api.requireAdmin(request),null);assert.equal((await api.getAdminSessionUser(request)).email,'admin@example.test');assert.equal(calls,1)
  const response=await api.requireAdmin(new Request('https://shop.example/api/admin/products'));assert.equal(response.status,401);assert.equal(calls,1)
})

test('token inválido, função administrativa ausente e origem externa continuam bloqueados',async()=>{
  server();const req=(method='GET',origin='https://shop.example')=>new Request('https://shop.example/api/admin/products',{method,headers:{authorization:'Bearer client-claims-are-not-trusted',origin}})
  globalThis.fetch=async()=>Response.json({error:'Invalid token'},{status:401});assert.equal((await api.requireAdmin(req())).status,401)
  globalThis.fetch=async()=>Response.json({id:'member',app_metadata:{roles:[]}});assert.equal((await api.requireAdmin(req())).status,403)
  globalThis.fetch=async()=>Response.json({id:'admin',app_metadata:{roles:['admin']}});assert.equal((await api.requireAdmin(req('PUT','https://other.example'))).status,403)
})
