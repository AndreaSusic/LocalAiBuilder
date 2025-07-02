import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './lib/theme.jsx'

async function loadBootstrap(){
  // 1) Try secure API
  const api = await fetch('/api/user-data');
  if(api.status !== 401){
    const result = await api.json();
    if(result.ok && result.bootstrap){
      return result.bootstrap;
    }
  }

  // 2) Handle 401 - try client-side draft
  if(api.status === 401){
    const draft = sessionStorage.getItem('draft');
    if(draft){
      console.log('Using client-side draft for 401 response');
      return JSON.parse(draft);
    }
  }

  // 3) Fallback: ?data= or sessionStorage
  const p = new URLSearchParams(location.search);
  if(p.has('data')){
    return JSON.parse(decodeURIComponent(p.get('data')));
  }
  return JSON.parse(sessionStorage.getItem('bootstrap')||'{}');
}

loadBootstrap().then(bootstrap=>{
  console.log('BOOTSTRAP >>', bootstrap);
  createRoot(document.getElementById('root')).render(
    <ThemeProvider>
      <App bootstrap={bootstrap} />
    </ThemeProvider>
  );
});
