import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './lib/theme.jsx'

async function loadBootstrap(){
  // 1) Try secure API first
  const api = await fetch('/api/user-data');
  if(api.status !== 401){
    const result = await api.json();
    if(result.ok && result.bootstrap){
      return result.bootstrap;
    }
  }

  // 2) Handle 401 - check if we have a draft to migrate after OAuth
  if(api.status === 401){
    const draft = sessionStorage.getItem('draft');
    if(draft){
      console.log('Found client-side draft, attempting migration after OAuth');
      
      // Try to migrate the draft if user is now authenticated
      try {
        const migrateResponse = await fetch('/api/migrate-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ draft: JSON.parse(draft) })
        });
        
        if (migrateResponse.ok) {
          console.log('✅ Draft migrated successfully, clearing sessionStorage');
          sessionStorage.removeItem('draft');
          
          // Try to reload user data after migration
          const reloadApi = await fetch('/api/user-data');
          if(reloadApi.ok){
            const reloadResult = await reloadApi.json();
            if(reloadResult.ok && reloadResult.bootstrap){
              return reloadResult.bootstrap;
            }
          }
        } else {
          console.log('Draft migration failed, using client-side draft');
          return JSON.parse(draft);
        }
      } catch (error) {
        console.log('Migration error, using client-side draft:', error);
        return JSON.parse(draft);
      }
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
