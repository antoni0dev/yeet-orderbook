import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import { ensurePresent } from './lib/assert/ensurePresent'

const rootElement = ensurePresent(document.getElementById('root'), 'document root element')

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
