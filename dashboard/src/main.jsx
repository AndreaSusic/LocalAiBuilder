import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './lib/theme.jsx'
import { initColorGuard } from './utils/colorGuard.js'
import { renderProducts } from './utils/renderProducts.js'

// 3-tier product loading system
async function loadProducts(bootstrap) {
  let products = [];
  
  console.log('🔍 Loading products with 3-tier fallback system');
  
  // Tier 1: Try to fetch GBP products if we have a CID
  if (bootstrap.gbpCid) {
    console.log('📋 Fetching GBP products for CID:', bootstrap.gbpCid);
    try {
      const response = await fetch(`/api/gbp-products?cid=${bootstrap.gbpCid}`);
      if (response.ok) {
        products = await response.json();
        console.log(`📦 Got ${products.length} GBP products`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch GBP products:', error);
    }
  }
  
  // Tier 2: Fall back to user products if no GBP products found
  if (!products.length && bootstrap.userProducts?.length) {
    products = bootstrap.userProducts;
    console.log(`👤 Using ${products.length} user products as fallback`);
  }
  
  // Tier 3: Keep placeholders if no products (do nothing)
  if (!products.length) {
    console.log('📝 No products found, keeping placeholder content');
    return;
  }
  
  // Render the products
  renderProducts(products);
}

async function loadBootstrap(){
  // First check if bootstrap data was injected directly into the page
  if (window.bootstrapData) {
    console.log('🔄 Using injected bootstrap data:', window.bootstrapData.company_name);
    return window.bootstrapData;
  }
  
  // Check if we're on a short URL path (/t/v1/:id)
  const pathMatch = window.location.pathname.match(/^\/t\/v1\/(.+)$/);
  if (pathMatch) {
    const shortId = pathMatch[1];
    try {
      const response = await fetch(`/api/preview/${shortId}`);
      if (response.ok) {
        const bootstrap = await response.json();
        console.log('🔄 Loaded bootstrap data from short URL:', bootstrap.company_name);
        return bootstrap;
      }
    } catch (error) {
      console.error('Error loading preview data:', error);
    }
  }
  
  // Check if we have a dataId parameter (legacy support)
  const urlParams = new URLSearchParams(window.location.search);
  const dataId = urlParams.get('dataId');
  
  if (dataId) {
    try {
      const response = await fetch(`/api/template-data/${dataId}`);
      if (response.ok) {
        const result = await response.json();
        const bootstrap = JSON.parse(result.data);
        console.log('🔄 Loaded bootstrap data from session:', bootstrap.company_name);
        return bootstrap;
      }
    } catch (error) {
      console.error('Error loading template data:', error);
    }
  }
  
  // 1) Try authentic Kigen Plastika data first
  try {
    const kigenResponse = await fetch('/api/kigen-data');
    if (kigenResponse.ok) {
      const kigenData = await kigenResponse.json();
      console.log('🔄 Loaded authentic Kigen Plastika data:', kigenData.company_name);
      return kigenData;
    }
  } catch (error) {
    console.error('Error loading Kigen data:', error);
  }

  // 2) Try secure API as fallback
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
  console.log('Current path:', window.location.pathname);
  console.log('Root element exists:', !!document.getElementById('root'));
  
  const root = document.getElementById('root');
  if (!root) {
    console.error('Root element not found!');
    return;
  }
  
  try {
    createRoot(root).render(
      <ThemeProvider>
        <App bootstrap={bootstrap} />
      </ThemeProvider>
    );
    console.log('React app rendered successfully');
    
    // Signal to inline editor that React is ready
    setTimeout(() => {
      window.dispatchEvent(new Event('react-dom-ready'));
      console.log('✅ React DOM ready event dispatched');
    }, 100);
    
    // Products now render directly in React components - no DOM manipulation needed
    
    // Initialize Color Guard after React mounts
    setTimeout(() => {
      initColorGuard();
    }, 100);
  } catch (error) {
    console.error('Error rendering React app:', error);
  }
}).catch(error => {
  console.error('Error loading bootstrap:', error);
});
