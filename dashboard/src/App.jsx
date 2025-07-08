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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  
  // Debug info
  console.log('App rendering with bootstrap:', bootstrap);
  console.log('Window width:', window.innerWidth);
  console.log('isMobile:', isMobile);

  // Load authenticated user data on startup
  useEffect(() => {
    async function loadUserData() {
      try {
        setIsLoadingUserData(true);
        
        // First check authentication status
        const authResponse = await fetch('/api/me', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (authResponse.ok) {
          const authData = await authResponse.json();
          setAuthUser(authData.user);
          console.log('🔐 User authenticated:', authData.user?.displayName || 'Unknown');
          
          // If authenticated, load their personalized data
          const userDataResponse = await fetch('/api/user-data', {
            method: 'GET',
            credentials: 'include'
          });
          
          if (userDataResponse.ok) {
            const userDataResult = await userDataResponse.json();
            if (userDataResult.ok && userDataResult.bootstrap) {
              setUserData(userDataResult.bootstrap);
              console.log('📊 Loaded authentic user data:', userDataResult.bootstrap.company_name || 'Unknown Company');
            } else {
              console.log('⚠️ No user website data found, using fallback bootstrap');
              setUserData(bootstrap);
            }
          } else {
            console.log('❌ Failed to load user data, using fallback bootstrap');
            setUserData(bootstrap);
          }
        } else {
          console.log('🔓 User not authenticated, using static bootstrap data');
          setUserData(bootstrap);
        }
      } catch (error) {
        console.error('❌ Error loading user data:', error);
        setUserData(bootstrap);
      } finally {
        setIsLoadingUserData(false);
      }
    }
    
    loadUserData();
  }, [bootstrap]);

  // Update mobile detection on resize
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 640;
      console.log('Resize detected - Window width:', window.innerWidth, 'isMobile:', newIsMobile);
      setIsMobile(newIsMobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Data validation for templates
  useEffect(() => {
    if (userData && userData.company_name) {
      try {
        validateBeforeRender(userData);
      } catch (error) {
        console.error('❌ CRITICAL: Data validation failed for user data:', error.message);
        // In production, this should redirect to an error page or show a validation error
      }
    }
  }, [userData]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 800);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Show loading screen while fetching user data
  if (isLoadingUserData) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#666',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '16px' }}>Loading your website data...</div>
        {authUser && (
          <div style={{ fontSize: '14px', color: '#999' }}>
            Welcome back, {authUser.displayName || 'User'}
          </div>
        )}
      </div>
    );
  }

  // Check if we're on a short URL path (/t/v1/:id) - show template directly
  const currentPath = window.location.pathname;
  const templateMatch = currentPath.match(/^\/t\/v1\/([a-zA-Z0-9]+)$/);
  if (templateMatch) {
    const previewId = templateMatch[1];
    return <TemplatePreview previewId={previewId} fallbackBootstrap={userData || bootstrap} />;
  }

  // Use userData if available, otherwise fallback to bootstrap
  const activeData = userData || bootstrap;

  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard as default route */}
        <Route path="/" element={
          <>
            {isMobile ? <MobileDashboard bootstrap={activeData} /> : <DesktopDashboard bootstrap={activeData} />}
            
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
        
        {/* Dashboard route alias */}
        <Route path="/dashboard" element={
          <>
            {isMobile ? <MobileDashboard bootstrap={activeData} /> : <DesktopDashboard bootstrap={activeData} />}
            
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
        
        {/* Preview route for OAuth redirect - shows dashboard */}
        <Route path="/preview" element={
          <>
            {isMobile ? <MobileDashboard bootstrap={activeData} /> : <DesktopDashboard bootstrap={activeData} />}
            
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
        <Route path="/templates/homepage/v1/index.jsx" element={<HomepageV1 bootstrap={activeData} />} />
        <Route path="/templates/homepage/v2/index.jsx" element={<HomepageV2 bootstrap={activeData} />} />
        <Route path="/templates/homepage/v3/index.jsx" element={<HomepageV3 bootstrap={activeData} />} />
        
        {/* Alternative template routes for versioned access */}
        <Route path="/templates/homepage-1" element={<HomepageV1 bootstrap={activeData} />} />
        <Route path="/templates/homepage-2" element={<HomepageV2 bootstrap={activeData} />} />
        <Route path="/templates/homepage-3" element={<HomepageV3 bootstrap={activeData} />} />
        
        {/* Service template routes */}
        <Route path="/templates/service/v1/index.jsx" element={<ServiceInvisalign bootstrap={activeData} />} />
        <Route path="/service" element={<ServiceInvisalign bootstrap={activeData} />} />
        
        {/* Contact template routes */}
        <Route path="/templates/contact/v1/index.jsx" element={<ContactV1 bootstrap={activeData} />} />
        <Route path="/contact" element={<ContactV1 bootstrap={activeData} />} />
        
        {/* Short URL template routes - these handle /t/v1/:id patterns */}
        <Route path="/t/v1/:id" element={<TemplatePreview />} />
        <Route path="/t/v1" element={<TemplatePreview fallbackBootstrap={activeData} />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<h1>404 – Not found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}