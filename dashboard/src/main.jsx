import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './lib/theme.jsx'

// Bootstrap data from window or defaults
const bootstrapData = window.bootstrapData || {};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App bootstrap={bootstrapData} />
    </ThemeProvider>
  </StrictMode>,
)
