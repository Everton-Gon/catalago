import { createHash } from 'node:crypto'
import type { ListObjectsV2CommandInput, ListObjectsV2CommandOutput } from '@aws-sdk/client-s3'
import type { CategorySlug, MugType } from '../../../src/types/index'
import type { R2Model, R2ModelPage } from '../../../src/types/r2'

const FOLDERS: Record<string, { category: CategorySlug; label: string; mugType?: MugType }> = {
  camisa: { category: 'camisetas', label: 'Camiseta' },
  camisas: { category: 'camisetas', label: 'Camiseta' },
  camiseta: { category: 'camisetas', label: 'Camiseta' },
  camisetas: { category: 'camisetas', label: 'Camiseta' },
  'caneca normal': { category: 'canecas', label: 'Caneca tradicional', mugType: 'porcelana' },
  'caneca pintura': { category: 'canecas', label: 'Caneca para colorir', mugType: 'colorir' },
  'caneca magica': { category: 'canecas', label: 'Caneca mágica', mugType: 'magica' },
  canecas: { category: 'canecas', label: 'Caneca' },
  copos: { category: 'copos', label: 'Copo' },
  kits: { category: 'kits', label: 'Kit' },
  quadros: { category: 'quadros', label: 'Quadro' },
  personalizados: { category: 'personalizados', label: 'Personalizado' },
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

export function modelFromKey(key: string, baseUrl: string): R2Model | null {
  if (!/\.(jpe?g|png|webp|avif|gif|svg)$/i.test(key)) return null
  const parts = key.split('/')
  const folders = parts.slice(0, -1).map(normalize)
  // Imagens de IA são variações de um produto existente, não novos modelos.
  if (folders.includes('ai-cache')) return null
  const folder = [...folders].reverse().find((part) => Object.hasOwn(FOLDERS, part))
  if (!folder) return null
  const config = FOLDERS[folder]
  const filename = parts[parts.length - 1].replace(/\.[^.]+$/, '')
  const label = filename.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Novo modelo'
  const hash = createHash('sha256').update(key).digest('hex').slice(0, 24)
  const slugLabel = normalize(label).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
  return {
    key,
    id: `r2-${hash}`,
    slug: `${config.category}-${slugLabel || 'modelo'}-${hash}`,
    name: `${config.label} — ${label}`,
    category: config.category,
    ...(config.mugType ? { mugType: config.mugType } : {}),
    url: `${baseUrl.replace(/\/+$/, '')}/${parts.map(encodeURIComponent).join('/')}`,
  }
}

export async function listModelPage(
  list: (input: ListObjectsV2CommandInput) => Promise<ListObjectsV2CommandOutput>,
  bucket: string,
  baseUrl: string,
  cursor?: string,
): Promise<R2ModelPage> {
  const page = await list({ Bucket: bucket, MaxKeys: 1000, ContinuationToken: cursor })
  if (page.IsTruncated && !page.NextContinuationToken) {
    throw new Error('A listagem do R2 retornou uma página incompleta.')
  }
  return {
    models: (page.Contents ?? []).flatMap((object) => {
      const model = object.Key && (object.Size ?? 0) > 0 ? modelFromKey(object.Key, baseUrl) : null
      return model ? [model] : []
    }),
    scanned: page.Contents?.length ?? 0,
    nextCursor: page.IsTruncated ? page.NextContinuationToken! : null,
  }
}
