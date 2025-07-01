import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './lib/theme.jsx'

// Get data from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const dataParam = urlParams.get('data');
let bootstrapData = null;

if (dataParam) {
  try {
    bootstrapData = JSON.parse(decodeURIComponent(dataParam));
    console.log('📦 Received bootstrap data:', bootstrapData);
  } catch (error) {
    console.error('Failed to parse bootstrap data:', error);
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App bootstrapData={bootstrapData} />
    </ThemeProvider>
  </StrictMode>,
)
