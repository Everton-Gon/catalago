import { Outlet } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartDrawer from '@/components/CartDrawer'
import WhatsAppButton from '@/components/WhatsAppButton'
import ToastContainer from '@/components/Toast'
import ScrollToTop from '@/components/ScrollToTop'
import { useCatalog } from '@/contexts/CatalogContext'

export default function MainLayout() {
  const { error, products, loading, refresh } = useCatalog()
  return (
    <div className="storefront flex min-h-dvh flex-col">
      <ScrollToTop />
      <Header />

      <main id="conteudo" className="flex-1">
        {error && (
          <div className="container-page py-5" role="alert">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p>{error}</p>
              <button type="button" onClick={() => void refresh()} className="mt-2 font-semibold underline">
                Tentar novamente
              </button>
            </div>
          </div>
        )}
        {loading && products.length === 0 ? (
          <div className="container-page py-16" role="status">Carregando catálogo…</div>
        ) : !error || products.length > 0 ? <Outlet /> : null}
      </main>

      <Footer />

      <CartDrawer />
      <WhatsAppButton />
      <ToastContainer />
    </div>
  )
}
