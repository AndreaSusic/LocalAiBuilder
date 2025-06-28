import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import DesktopDashboard from "./components/DesktopDashboard";
import MobileDashboard from "./components/MobileDashboard";
import TemplateOne from "./templates/TemplateOne";

export default function App() {
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
            {isMobile ? <MobileDashboard /> : <DesktopDashboard />}
            
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
        
        {/* New template preview routes */}
        <Route path="/templates/homepage-1" element={<TemplateOne />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<h1>404 – Not found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}