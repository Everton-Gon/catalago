import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

const authCallbackHash = window.location.hash
const hasAuthCallback = [
  'invite_token=',
  'recovery_token=',
  'confirmation_token=',
  'access_token=',
].some((key) => authCallbackHash.includes(key))

if (hasAuthCallback && window.location.pathname !== '/admin') {
  window.history.replaceState(null, '', `/admin${authCallbackHash}`)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
