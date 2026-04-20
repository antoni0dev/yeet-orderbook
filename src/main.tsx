import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'

const rootElement = document.getElementById('root')

if (rootElement === null) {
  throw new Error('Expected #root element to be present in index.html')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
