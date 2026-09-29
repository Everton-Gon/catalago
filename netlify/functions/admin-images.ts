import { randomUUID } from 'node:crypto'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { Config } from '@netlify/functions'
import { requireAdmin } from './_lib/auth'

const MAX_FILE_SIZE = 10 * 1024 * 1024

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Variável ${name} não configurada.`)
  return value
}

function safeSegment(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function publicUrl(baseUrl: string, key: string): string {
  return `${baseUrl.replace(/\/$/, '')}/${key
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')}`
}

export default async function handler(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } })
  }

  const form = await request.formData()
  const file = form.get('file')
  const category = String(form.get('category') ?? 'produtos')
  if (!(file instanceof File) || !file.type.startsWith('image/')) {
    return Response.json({ error: 'Selecione uma imagem válida.' }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ error: 'A imagem deve ter no máximo 10 MB.' }, { status: 413 })
  }

  const accountId = requiredEnv('R2_ACCOUNT_ID')
  const bucket = requiredEnv('R2_BUCKET_NAME')
  const baseUrl = process.env.R2_PUBLIC_BASE_URL ??
    'https://pub-d3378ac83d9c4975a35281f0d11b94ad.r2.dev'
  const key = `catalogo-admin/${safeSegment(category)}/${Date.now()}-${randomUUID()}-${safeSegment(file.name)}`
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requiredEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: requiredEnv('R2_SECRET_ACCESS_KEY'),
    },
  })

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: new Uint8Array(await file.arrayBuffer()),
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  )

  return Response.json({ key, url: publicUrl(baseUrl, key) })
}

export const config: Config = { path: '/api/admin/images' }
