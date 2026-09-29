/**
 * Ponto único de instrumentação.
 *
 * Nenhuma ferramenta está configurada nesta versão. Quando o Google Analytics
 * ou o Meta Pixel forem adicionados, basta implementar os encaminhamentos
 * dentro de `track()` — os pontos de chamada pelo app já estão no lugar.
 *
 *   window.gtag?.('event', event, payload)
 *   window.fbq?.('track', event, payload)
 */

export type AnalyticsEvent =
  | 'view_product'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'update_cart_quantity'
  | 'clear_cart'
  | 'begin_whatsapp_quote'
  | 'search'

export function track(event: AnalyticsEvent, payload: Record<string, unknown> = {}): void {
  if (import.meta.env.DEV) {
    console.debug('[analytics]', event, payload)
  }
  // Integrações futuras entram aqui.
}
