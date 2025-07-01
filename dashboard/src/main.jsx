import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './lib/theme.jsx'

// --- Load bootstrap from URL or sessionStorage -------------
let bootstrap = {};
const params = new URLSearchParams(window.location.search);

console.log('🔍 Current URL:', window.location.href);
console.log('🔍 URL search params:', window.location.search);
console.log('🔍 Has data param:', params.has('data'));

if (params.has('data')) {
  try {
    const rawData = params.get('data');
    console.log('🔍 Raw data param:', rawData);
    bootstrap = JSON.parse(decodeURIComponent(rawData));
    console.log('📦 Received bootstrap data from URL:', bootstrap);
    console.log('📦 Bootstrap keys:', Object.keys(bootstrap));
  } catch (e) {
    console.error('bootstrap decode err', e);
  }
} else if (sessionStorage.getItem('chatBootstrapData')) {
  try {
    const sessionData = sessionStorage.getItem('chatBootstrapData');
    console.log('🔍 Raw chatBootstrapData:', sessionData);
    bootstrap = JSON.parse(sessionData);
    console.log('📦 Received bootstrap data from chatBootstrapData:', bootstrap);
    console.log('📦 Bootstrap keys:', Object.keys(bootstrap));
  } catch (e) {
    console.error('chatBootstrapData decode err', e);
  }
} else if (sessionStorage.getItem('bootstrap')) {
  try {
    const sessionData = sessionStorage.getItem('bootstrap');
    console.log('🔍 Raw sessionStorage data:', sessionData);
    bootstrap = JSON.parse(sessionData);
    console.log('📦 Received bootstrap data from sessionStorage:', bootstrap);
    console.log('📦 Bootstrap keys:', Object.keys(bootstrap));
  } catch (e) {
    console.error('sessionStorage bootstrap decode err', e);
  }
} else {
  console.log('⚠️ No bootstrap data found in URL or sessionStorage');
}
// -----------------------------------------------------------

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App bootstrap={bootstrap} />
    </ThemeProvider>
  </StrictMode>,
)
