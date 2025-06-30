import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import { SiteDataContext } from './context/SiteDataContext';
import HomePageV1 from './templates/HomePageV1';

export default function App({ bootstrap = {} }) {
  const [previewMode, setPreviewMode] = useState(false);
  
  useEffect(() => {
    // Check if we're in preview mode based on URL
    const isPreview = window.location.pathname === '/preview';
    setPreviewMode(isPreview);
  }, []);
  
  // If in preview mode, render the template directly
  if (previewMode) {
    return (
      <SiteDataContext.Provider value={bootstrap}>
        <HomePageV1 />
      </SiteDataContext.Provider>
    );
  }
  
  // Otherwise render the normal dashboard
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/templates/homepage/v1/index.jsx" element={<Dashboard />} />
        <Route path="/templates/homepage/v2/index.jsx" element={<Dashboard />} />
        <Route path="/templates/homepage/v3/index.jsx" element={<Dashboard />} />
        <Route path="/templates/service/v1/index.jsx" element={<Dashboard />} />
        <Route path="/templates/contact/v1/index.jsx" element={<Dashboard />} />
        <Route path="/preview" element={
          <SiteDataContext.Provider value={bootstrap}>
            <HomePageV1 />
          </SiteDataContext.Provider>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}