export const R2_PUBLIC_BASE_URL =
  'https://pub-d3378ac83d9c4975a35281f0d11b94ad.r2.dev'

/** Monta a URL pública preservando as barras e codificando espaços, acentos e colchetes. */
export function r2ImageUrl(objectKey: string): string {
  const encodedKey = objectKey
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')

  return `${R2_PUBLIC_BASE_URL}/${encodedKey}`
}
