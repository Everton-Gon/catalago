/**
 * Guarda as artes enviadas pelo cliente **apenas durante a sessão**.
 *
 * Não há backend nesta versão, e gravar o arquivo em base64 no localStorage
 * estouraria a cota (~5 MB) e derrubaria a sacola inteira. Por isso o arquivo
 * vive só na memória da aba: a sacola persiste, a prévia da arte não.
 * No orçamento o cliente é orientado a anexar a arte no próprio WhatsApp.
 */

interface StoredArt {
  file: File
  /** Object URL para a prévia — só existe para imagens. */
  previewUrl: string | null
}

const store = new Map<string, StoredArt>()

export const ACCEPTED_ART_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const ACCEPTED_ART_EXTENSIONS = '.png,.jpg,.jpeg,.webp'
export const MAX_ART_SIZE_MB = 10

export function isAcceptedArtFile(file: File): boolean {
  const extension = file.name.toLocaleLowerCase().match(/\.[a-z0-9]+$/)?.[0]
  const acceptedExtensions = ACCEPTED_ART_EXTENSIONS.split(',')
  const hasAcceptedExtension = extension ? acceptedExtensions.includes(extension) : false
  const hasAcceptedType = file.type === '' || ACCEPTED_ART_TYPES.includes(file.type)
  return hasAcceptedExtension && hasAcceptedType
}

/** Registra o arquivo sob uma chave (o id do item da sacola). */
export function saveArt(key: string, file: File): StoredArt {
  releaseArt(key)
  const entry: StoredArt = {
    file,
    previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
  }
  store.set(key, entry)
  return entry
}

export function getArt(key: string): StoredArt | undefined {
  return store.get(key)
}

export function releaseArt(key: string): void {
  const existing = store.get(key)
  if (existing?.previewUrl) URL.revokeObjectURL(existing.previewUrl)
  store.delete(key)
}

/** Move a arte de uma chave para outra (usado ao adicionar o item à sacola). */
export function moveArt(fromKey: string, toKey: string): void {
  const entry = store.get(fromKey)
  if (!entry || fromKey === toKey) return
  store.delete(fromKey)
  const previous = store.get(toKey)
  if (previous?.previewUrl) URL.revokeObjectURL(previous.previewUrl)
  store.set(toKey, entry)
}


