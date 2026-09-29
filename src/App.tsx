import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import Home from '@/pages/Home'
import { CartProvider } from '@/contexts/CartContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { CatalogProvider } from '@/contexts/CatalogContext'

/**
 * A Home entra no bundle principal; as demais páginas são carregadas sob
 * demanda para manter o primeiro carregamento leve.
 */
const Catalog = lazy(() => import('@/pages/Catalog'))
const ProductPage = lazy(() => import('@/pages/ProductPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const HowItWorks = lazy(() => import('@/pages/HowItWorks'))
const Contact = lazy(() => import('@/pages/Contact'))
const Privacy = lazy(() => import('@/pages/Privacy'))
const Terms = lazy(() => import('@/pages/Terms'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Admin = lazy(() => import('@/pages/Admin'))

function PageFallback() {
  return (
    <div className="container-page py-24" role="status" aria-live="polite">
      <span className="sr-only">Carregando…</span>
      <div className="mx-auto size-10 animate-spin rounded-full border-4 border-ink-200 border-t-brand-600" />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <CatalogProvider>
        <CartProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="admin" element={<Admin />} />
              <Route element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="produtos" element={<Catalog />} />
              <Route path="categoria/:slug" element={<Catalog />} />
              <Route path="produto/:slug" element={<ProductPage />} />
              <Route path="sacola" element={<CartPage />} />
              <Route path="como-funciona" element={<HowItWorks />} />
              <Route path="contato" element={<Contact />} />
              <Route path="politica-de-privacidade" element={<Privacy />} />
              <Route path="termos" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </CartProvider>
      </CatalogProvider>
    </ToastProvider>
  )
}
