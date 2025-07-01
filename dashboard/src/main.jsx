import React, { StrictMode } from 'react'
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
  
  // If this is a template URL being accessed directly, try to fetch user data
  if (window.location.pathname.includes('/templates/') && window.location.pathname.includes('index.jsx')) {
    console.log('🔧 Template URL detected, attempting to fetch user data...');
    
    // Use a promise to handle async loading
    fetch('/api/user-data', { credentials: 'include' })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Could not fetch user data');
      })
      .then(userData => {
        console.log('📦 Fetched user data for template:', userData);
        bootstrap = userData;
        
        // Re-render the app with the new bootstrap data
        createRoot(document.getElementById('root')).render(
          <StrictMode>
            <ThemeProvider>
              <App bootstrap={bootstrap} />
            </ThemeProvider>
          </StrictMode>
        );
      })
      .catch(error => {
        console.log('❌ Could not fetch user data for template:', error.message);
        // Continue with empty bootstrap
      });
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
