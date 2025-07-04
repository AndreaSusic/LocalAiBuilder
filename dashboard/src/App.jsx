import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import DesktopDashboard from "./components/DesktopDashboard";
import MobileDashboard from "./components/MobileDashboard";
import DashboardPage from "./pages/Dashboard";
import TemplateOne from "./templates/TemplateOne";
import HomepageV1 from "./templates/homepage/v1/index.jsx";
import HomepageV2 from "./templates/homepage/v2/index.jsx";
import HomepageV3 from "./templates/homepage/v3/index.jsx";
import ServiceInvisalign from "./pages/ServiceInvisalign.jsx";
import ContactV1 from "./pages/ContactV1.jsx";
import TemplatePreview from "./components/TemplatePreview.jsx";
import { validateBeforeRender } from "./utils/dataValidation";

export default function App({ bootstrap }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Debug info
  console.log('App rendering with bootstrap:', bootstrap);
  console.log('isMobile:', isMobile);

  // Data validation for templates
  useEffect(() => {
    if (bootstrap && bootstrap.company_name) {
      try {
        validateBeforeRender(bootstrap);
      } catch (error) {
        console.error('❌ CRITICAL: Data validation failed for bootstrap data:', error.message);
        // In production, this should redirect to an error page or show a validation error
      }
    }
  }, [bootstrap]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Check if we're on a short URL path (/t/v1/:id) - show template directly
  const currentPath = window.location.pathname;
  const templateMatch = currentPath.match(/^\/t\/v1\/([a-zA-Z0-9]+)$/);
  if (templateMatch) {
    const previewId = templateMatch[1];
    return <TemplatePreview previewId={previewId} fallbackBootstrap={bootstrap} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Keep dashboard as default route */}
        <Route path="/" element={
          <>
            {isMobile ? <MobileDashboard bootstrap={bootstrap} /> : <DesktopDashboard bootstrap={bootstrap} />}
            
            {/* Keep the full-screen preview overlay for both versions */}
            {isPreviewOpen && (
              <div className="preview-overlay">
                <button
                  className="close-btn"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  ×
                </button>
                <iframe
                  src="about:blank"
                  title="Full Preview"
                  className="overlay-iframe"
                />
              </div>
            )}
          </>
        } />
        
        {/* Preview route for OAuth redirect - shows template directly */}
        <Route path="/preview" element={<HomepageV1 bootstrap={bootstrap} />} />
        
        {/* New template dashboard with version selector */}
        <Route path="/templates" element={<DashboardPage />} />
        
        {/* Exact template routes */}
        <Route path="/templates/homepage/v1/index.jsx" element={<HomepageV1 bootstrap={bootstrap} />} />
        <Route path="/templates/homepage/v2/index.jsx" element={<HomepageV2 bootstrap={bootstrap} />} />
        <Route path="/templates/homepage/v3/index.jsx" element={<HomepageV3 bootstrap={bootstrap} />} />
        
        {/* Alternative template routes for versioned access */}
        <Route path="/templates/homepage-1" element={<HomepageV1 bootstrap={bootstrap} />} />
        <Route path="/templates/homepage-2" element={<HomepageV2 bootstrap={bootstrap} />} />
        <Route path="/templates/homepage-3" element={<HomepageV3 bootstrap={bootstrap} />} />
        
        {/* Service template routes */}
        <Route path="/templates/service/v1/index.jsx" element={<ServiceInvisalign bootstrap={bootstrap} />} />
        <Route path="/service" element={<ServiceInvisalign bootstrap={bootstrap} />} />
        
        {/* Contact template routes */}
        <Route path="/templates/contact/v1/index.jsx" element={<ContactV1 bootstrap={bootstrap} />} />
        <Route path="/contact" element={<ContactV1 bootstrap={bootstrap} />} />
        
        {/* Short URL template routes - these handle /t/v1/:id patterns */}
        <Route path="/t/v1/:id" element={<TemplatePreview />} />
        <Route path="/t/v1" element={<TemplatePreview fallbackBootstrap={bootstrap} />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<h1>404 – Not found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}