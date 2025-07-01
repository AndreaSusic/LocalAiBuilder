import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './lib/theme.jsx'

// --- Load bootstrap from URL or sessionStorage -------------
let bootstrap = {};
const params = new URLSearchParams(window.location.search);
if (params.has('data')) {
  try {
    bootstrap = JSON.parse(decodeURIComponent(params.get('data')));
    console.log('📦 Received bootstrap data from URL:', bootstrap);
  } catch (e) {
    console.error('bootstrap decode err', e);
  }
} else if (sessionStorage.getItem('bootstrap')) {
  try {
    bootstrap = JSON.parse(sessionStorage.getItem('bootstrap'));
    console.log('📦 Received bootstrap data from sessionStorage:', bootstrap);
  } catch (e) {
    console.error('sessionStorage bootstrap decode err', e);
  }
}
// -----------------------------------------------------------

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App bootstrap={bootstrap} />
    </ThemeProvider>
  </StrictMode>,
)
