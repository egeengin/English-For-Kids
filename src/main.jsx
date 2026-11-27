import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', () => {
    try {
      if (!sessionStorage.getItem('vite_preload_reloaded')) {
        sessionStorage.setItem('vite_preload_reloaded', '1')
        window.location.reload()
      }
    } catch {
      window.location.reload()
    }
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
