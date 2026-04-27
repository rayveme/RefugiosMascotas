import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <-- Paso 1: Importar
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> {/* <-- Paso 2: Envolver */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)