import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'
import type { Config } from '@netlify/functions'
import { requireAdmin } from './_lib/auth'
import { listModelPage } from './_lib/r2-models'

export default async function handler(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  if (request.method !== 'GET') {
    return new Response(null, { status: 405, headers: { Allow: 'GET' } })
  }

  const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME']
  const missing = required.filter((name) => !process.env[name])
  if (missing.length) {
    return Response.json(
      { error: `Configure ${missing.join(', ')} na Netlify para buscar os modelos.` },
      { status: 503 },
    )
  }
  const cursor = new URL(request.url).searchParams.get('cursor') ?? undefined
  if (cursor && cursor.length > 4096) {
    return Response.json({ error: 'Página de busca inválida.' }, { status: 400 })
  }
  const baseUrl = process.env.R2_PUBLIC_BASE_URL ??
    'https://pub-d3378ac83d9c4975a35281f0d11b94ad.r2.dev'
  try {
    if (new URL(baseUrl).protocol !== 'https:') throw new Error('Invalid public URL')
  } catch {
    return Response.json({ error: 'Configure R2_PUBLIC_BASE_URL com uma URL HTTPS válida.' }, { status: 503 })
  }

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    maxAttempts: 2,
    requestHandler: { connectionTimeout: 5000, requestTimeout: 15_000 },
  })
  try {
    const page = await listModelPage(
      (input) => client.send(new ListObjectsV2Command(input)),
      process.env.R2_BUCKET_NAME!,
      baseUrl,
      cursor,
    )
    return Response.json(page, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json(
      { error: 'Não foi possível listar os modelos. Confira as credenciais e a permissão de leitura do bucket R2.' },
      { status: 502 },
    )
  } finally {
    client.destroy()
  }
}

export const config: Config = { path: '/api/admin/r2-models' }
