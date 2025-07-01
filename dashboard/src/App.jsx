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

export default function App({ bootstrap }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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
        
        {/* Preview route for OAuth redirect */}
        <Route path="/preview" element={
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
        
        {/* Catch-all route */}
        <Route path="*" element={<h1>404 – Not found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}