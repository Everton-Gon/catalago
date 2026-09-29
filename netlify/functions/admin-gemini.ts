import { createHash } from 'node:crypto'
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { Config } from '@netlify/functions'
import { requireAdmin } from './_lib/auth'

const DEFAULT_MODEL = 'gemini-3.1-flash-image'
const PROMPT_VERSION = 'shirt-color-v1'
const MAX_SOURCE_SIZE = 15 * 1024 * 1024

interface GenerateRequest {
  sourceImage?: string
  productId?: string
  colorName?: string
  colorHex?: string
}

interface GeminiImage {
  data: string
  mime_type?: string
  mimeType?: string
}

interface GeminiResponse {
  status?: string
  output_image?: GeminiImage
  steps?: Array<{ content?: Array<{ type?: string; data?: string; mime_type?: string }> }>
  error?: { message?: string }
}

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

function buildPublicUrl(baseUrl: string, key: string): string {
  return `${baseUrl.replace(/\/$/, '')}/${key
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')}`
}

function findOutputImage(payload: GeminiResponse): GeminiImage | undefined {
  if (payload.output_image?.data) return payload.output_image
  for (const step of [...(payload.steps ?? [])].reverse()) {
    const image = [...(step.content ?? [])].reverse().find((part) => part.type === 'image' && part.data)
    if (image?.data) return { data: image.data, mime_type: image.mime_type }
  }
  return undefined
}

export default async function handler(request: Request) {
  const denied = await requireAdmin(request)
  if (denied) return denied
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } })
  }

  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: 'Configure GEMINI_API_KEY na Netlify para ativar a geração.' },
      { status: 503 },
    )
  }

  const body = (await request.json()) as GenerateRequest
  const sourceImage = body.sourceImage?.trim()
  const colorName = body.colorName?.trim()
  const colorHex = body.colorHex?.trim().toUpperCase()
  if (!sourceImage || !colorName || !/^#[0-9A-F]{6}$/.test(colorHex ?? '')) {
    return Response.json({ error: 'Imagem e cor hexadecimal válida são obrigatórias.' }, { status: 400 })
  }

  let sourceUrl: URL
  try {
    sourceUrl = new URL(sourceImage)
  } catch {
    return Response.json({ error: 'A imagem original precisa ter uma URL pública válida.' }, { status: 400 })
  }
  if (sourceUrl.protocol !== 'https:') {
    return Response.json({ error: 'A imagem original precisa usar HTTPS.' }, { status: 400 })
  }

  const model = process.env.GEMINI_IMAGE_MODEL ?? DEFAULT_MODEL
  const accountId = requiredEnv('R2_ACCOUNT_ID')
  const bucket = requiredEnv('R2_BUCKET_NAME')
  const baseUrl = process.env.R2_PUBLIC_BASE_URL ??
    'https://pub-d3378ac83d9c4975a35281f0d11b94ad.r2.dev'
  if (sourceUrl.hostname !== new URL(baseUrl).hostname) {
    return Response.json(
      { error: 'Envie a imagem original ao R2 antes de gerar as cores.' },
      { status: 400 },
    )
  }
  const cacheHash = createHash('sha256')
    .update(`${PROMPT_VERSION}\n${model}\n${sourceImage}\n${colorName}\n${colorHex}`)
    .digest('hex')
    .slice(0, 32)
  const productSegment = safeSegment(body.productId ?? 'produto') || 'produto'
  const extension = 'png'
  const key = `ai-cache/${productSegment}/${safeSegment(colorName)}-${cacheHash}.${extension}`
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requiredEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: requiredEnv('R2_SECRET_ACCESS_KEY'),
    },
  })

  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return Response.json({ url: buildPublicUrl(baseUrl, key), cached: true, model })
  } catch {
    // Ausência no cache: segue para uma única geração.
  }

  const sourceResponse = await fetch(sourceUrl, { signal: AbortSignal.timeout(20_000) })
  if (!sourceResponse.ok) {
    return Response.json({ error: 'Não foi possível baixar a imagem original.' }, { status: 400 })
  }
  const mimeType = sourceResponse.headers.get('content-type')?.split(';')[0] ?? ''
  if (!mimeType.startsWith('image/')) {
    return Response.json({ error: 'A URL original não retornou uma imagem.' }, { status: 400 })
  }
  const sourceBytes = new Uint8Array(await sourceResponse.arrayBuffer())
  if (sourceBytes.byteLength > MAX_SOURCE_SIZE) {
    return Response.json({ error: 'A imagem original deve ter no máximo 15 MB.' }, { status: 413 })
  }

  const prompt = [
    `Edite esta foto de produto para que somente o tecido da camiseta fique na cor ${colorName} (${colorHex}).`,
    'Preserve exatamente a estampa, logotipos, textos, pessoa, pele, pose, fundo, enquadramento e resolução.',
    'Mantenha sombras, dobras e textura realistas. Não adicione nem remova elementos.',
    'Retorne apenas a fotografia final do produto, sem explicações, bordas ou legendas.',
  ].join(' ')

  const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      model,
      input: [
        { type: 'text', text: prompt },
        { type: 'image', mime_type: mimeType, data: Buffer.from(sourceBytes).toString('base64') },
      ],
      response_format: { type: 'image', mime_type: 'image/png' },
    }),
    signal: AbortSignal.timeout(120_000),
  })
  const payload = (await geminiResponse.json()) as GeminiResponse
  if (!geminiResponse.ok) {
    return Response.json(
      { error: payload.error?.message ?? 'O Gemini não conseguiu gerar a imagem.' },
      { status: geminiResponse.status },
    )
  }

  const output = findOutputImage(payload)
  if (!output?.data) {
    return Response.json({ error: 'O Gemini não retornou uma imagem final.' }, { status: 502 })
  }
  const outputType = output.mime_type ?? output.mimeType ?? 'image/png'
  const outputBytes = Buffer.from(output.data, 'base64')
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: outputBytes,
      ContentType: outputType,
      CacheControl: 'public, max-age=31536000, immutable',
      Metadata: {
        'gemini-model': model,
        'prompt-version': PROMPT_VERSION,
        'source-hash': cacheHash,
      },
    }),
  )

  return Response.json({ url: buildPublicUrl(baseUrl, key), cached: false, model })
}

export const config: Config = { path: '/api/admin/gemini' }
