import { useState, useEffect } from "react";
import "./App.css";
import DesktopDashboard from "./components/DesktopDashboard";
import MobileDashboard from "./components/MobileDashboard";

export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
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
  );
}