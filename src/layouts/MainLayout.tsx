import { Outlet } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartDrawer from '@/components/CartDrawer'
import WhatsAppButton from '@/components/WhatsAppButton'
import ToastContainer from '@/components/Toast'
import ScrollToTop from '@/components/ScrollToTop'

export default function MainLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <Header />

      <main id="conteudo" className="flex-1">
        <Outlet />
      </main>

      <Footer />

      <CartDrawer />
      <WhatsAppButton />
      <ToastContainer />
    </div>
  )
}
