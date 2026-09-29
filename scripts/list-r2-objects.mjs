import { createHash, createHmac } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const ENV_PATH = resolve(ROOT, '.env.local')
const OUTPUT_PATH = resolve(ROOT, 'r2-objects.json')

const PREFIXES = [
  'catalago-imagens/Camisa/',
  'catalago-imagens/Caneca normal/',
  'catalago-imagens/Caneca pintura/',
]

function parseEnv(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=')
        const key = line.slice(0, separator).trim()
        const value = line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, '$2')
        return [key, value]
      }),
  )
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function hmac(key, value, encoding) {
  return createHmac('sha256', key).update(value).digest(encoding)
}

function encode(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  )
}

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
}

function extract(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))
  return match ? decodeXml(match[1]) : undefined
}

async function signedListRequest(config, prefix, continuationToken) {
  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)
  const host = `${config.accountId}.r2.cloudflarestorage.com`
  const canonicalUri = `/${encode(config.bucket)}`
  const query = {
    'list-type': '2',
    prefix,
    ...(continuationToken ? { 'continuation-token': continuationToken } : {}),
  }
  const canonicalQuery = Object.entries(query)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${encode(key)}=${encode(value)}`)
    .join('&')
  const payloadHash = sha256('')
  const canonicalHeaders =
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date'
  const canonicalRequest = [
    'GET',
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')
  const scope = `${dateStamp}/auto/s3/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    scope,
    sha256(canonicalRequest),
  ].join('\n')
  const dateKey = hmac(`AWS4${config.secretAccessKey}`, dateStamp)
  const regionKey = hmac(dateKey, 'auto')
  const serviceKey = hmac(regionKey, 's3')
  const signingKey = hmac(serviceKey, 'aws4_request')
  const signature = hmac(signingKey, stringToSign, 'hex')
  const authorization =
    `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`

  const response = await fetch(`https://${host}${canonicalUri}?${canonicalQuery}`, {
    headers: {
      Authorization: authorization,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    },
  })
  const xml = await response.text()
  if (!response.ok) {
    const code = extract(xml, 'Code') ?? `HTTP ${response.status}`
    const message = extract(xml, 'Message') ?? response.statusText
    throw new Error(`${code}: ${message}`)
  }

  const objects = [...xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)].map((match) => ({
    key: extract(match[1], 'Key'),
    size: Number(extract(match[1], 'Size') ?? 0),
    lastModified: extract(match[1], 'LastModified'),
  }))
  return {
    objects,
    nextToken: extract(xml, 'NextContinuationToken'),
  }
}

async function listPrefix(config, prefix) {
  const objects = []
  let continuationToken
  do {
    const page = await signedListRequest(config, prefix, continuationToken)
    objects.push(...page.objects)
    continuationToken = page.nextToken
  } while (continuationToken)
  return objects
}

const env = parseEnv(await readFile(ENV_PATH, 'utf8'))
const required = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
]
const missing = required.filter((key) => !env[key])
if (missing.length) {
  throw new Error(`Variáveis ausentes no .env.local: ${missing.join(', ')}`)
}

const config = {
  accountId: env.R2_ACCOUNT_ID,
  accessKeyId: env.R2_ACCESS_KEY_ID,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  bucket: env.R2_BUCKET_NAME,
}

const groups = {}
for (const prefix of PREFIXES) {
  groups[prefix] = await listPrefix(config, prefix)
}

const configuredTotal = Object.values(groups).reduce(
  (sum, objects) => sum + objects.length,
  0,
)

// R2 diferencia maiúsculas, espaços e até erros de digitação nos prefixos.
// Se os caminhos informados não encontrarem objetos, descobre a estrutura real
// do bucket automaticamente, mantendo as credenciais somente em memória.
let discoveredFolders = {}
if (configuredTotal === 0) {
  const allObjects = await listPrefix(config, '')
  groups['* descoberta automática *'] = allObjects
  discoveredFolders = allObjects.reduce((folders, object) => {
    const separator = object.key.lastIndexOf('/')
    const folder = separator >= 0 ? object.key.slice(0, separator + 1) : '(raiz)'
    folders[folder] = (folders[folder] ?? 0) + 1
    return folders
  }, {})
}

await writeFile(
  OUTPUT_PATH,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), discoveredFolders, groups }, null, 2)}\n`,
  'utf8',
)

const total = Object.values(groups).reduce((sum, objects) => sum + objects.length, 0)
console.log(`Lista criada em r2-objects.json com ${total} objetos.`)
for (const [prefix, objects] of Object.entries(groups)) {
  console.log(`${prefix}: ${objects.length}`)
}
if (Object.keys(discoveredFolders).length) {
  console.log('Pastas encontradas:')
  for (const [folder, count] of Object.entries(discoveredFolders)) {
    console.log(`- ${folder}: ${count}`)
  }
}
