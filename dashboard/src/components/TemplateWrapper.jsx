import React from 'react';
import { useLocation } from 'react-router-dom';

export default function TemplateWrapper({ children, bootstrap }) {
  const location = useLocation();
  
  // Parse URL parameters for bootstrap data
  const urlParams = new URLSearchParams(location.search);
  const dataParam = urlParams.get('data');
  
  let finalBootstrap = bootstrap;
  
  if (dataParam) {
    try {
      const urlBootstrap = JSON.parse(decodeURIComponent(dataParam));
      finalBootstrap = urlBootstrap;
      console.log('TemplateWrapper parsed URL bootstrap data:', finalBootstrap);
    } catch (error) {
      console.error('Failed to parse URL bootstrap data:', error);
    }
  }
  
  // Clone children with the final bootstrap data
  return React.cloneElement(children, { bootstrap: finalBootstrap });
}