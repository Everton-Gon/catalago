import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Volta ao topo a cada troca de rota (o navegador não faz isso em SPAs). */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return null
}
