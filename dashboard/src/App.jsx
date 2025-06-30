import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/Dashboard';
import { SiteDataContext } from './context/SiteDataContext';
import HomePageV1 from './templates/HomePageV1';

export default function App({ bootstrap = {} }) {
  // Check if we have bootstrap data from window object
  const windowBootstrap = typeof window !== 'undefined' ? window.bootstrapData : {};
  const finalBootstrap = { ...bootstrap, ...windowBootstrap };
  
  // Otherwise render the normal dashboard
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/templates/homepage/v1/index.jsx" element={<DashboardPage />} />
        <Route path="/templates/homepage/v2/index.jsx" element={<DashboardPage />} />
        <Route path="/templates/homepage/v3/index.jsx" element={<DashboardPage />} />
        <Route path="/templates/service/v1/index.jsx" element={<DashboardPage />} />
        <Route path="/templates/contact/v1/index.jsx" element={<DashboardPage />} />
        <Route path="/preview" element={
          <SiteDataContext.Provider value={finalBootstrap}>
            <HomePageV1 />
          </SiteDataContext.Provider>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}