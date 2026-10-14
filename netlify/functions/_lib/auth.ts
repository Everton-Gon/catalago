import { getUser, verifyRequestOrigin } from '@netlify/identity'

export async function requireAdmin(request: Request): Promise<Response | null> {
  const user = await getUser()
  if (!user) return Response.json({ error: 'Não autenticado.' }, { status: 401 })
  if (!user.roles?.includes('admin')) {
    return Response.json({ error: 'Acesso restrito a administradores.' }, { status: 403 })
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    try { verifyRequestOrigin(request) } catch { return Response.json({error:'Origem da solicitação não autorizada.'},{status:403}) }
  }
  return null
}
