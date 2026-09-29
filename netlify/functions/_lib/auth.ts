import { getUser, verifyRequestOrigin } from '@netlify/identity'

export async function requireAdmin(request: Request): Promise<Response | null> {
  const user = await getUser()
  if (!user) return Response.json({ error: 'Não autenticado.' }, { status: 401 })
  if (!user.roles?.includes('admin')) {
    return Response.json({ error: 'Acesso restrito a administradores.' }, { status: 403 })
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    verifyRequestOrigin(request)
  }
  return null
}
