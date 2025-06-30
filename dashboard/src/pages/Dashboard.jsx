import { useState, useEffect } from "react";
import { loadTemplate } from "../utils/templateLoader";
import { SiteDataContext } from "../context/SiteDataContext";
import HomePageV1 from "../templates/HomePageV1";
import "../styles/templateSelector.css";

export default function DashboardPage() {
  const [pageType] = useState("homepage");
  const [version, setVersion] = useState(1);
  const [Template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check for bootstrap data
  const bootstrapData = typeof window !== 'undefined' ? window.bootstrapData : {};

  // Default site tokens that can be customized
  const siteTokens = {
    companyName: bootstrapData.company_name || "Your Practice Name",
    tagline: "High-quality care in a welcoming environment—expertise you can trust.",
    primaryColor: "#5DD39E",
    secondaryColor: "#EFD5BD",
    phone: "+1 234 567 89",
    email: "info@yourpractice.com",
    address: "123 Dental St., City, State ZIP"
  };

  // Mobile responsive state
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load the first template on mount
  useEffect(() => {
    setLoading(true);
    loadTemplate(pageType, version)
      .then((TemplateComponent) => {
        setTemplate(() => TemplateComponent);
      })
      .catch((error) => {
        console.error("Failed to load template:", error);
        setTemplate(null);
      })
      .finally(() => setLoading(false));
  }, [pageType, version]);

  const handleSwitch = async (v) => {
    setLoading(true);
    setVersion(v);
    try {
      const TemplateComponent = await loadTemplate(pageType, v);
      setTemplate(() => TemplateComponent);
    } catch (error) {
      console.error("Failed to load template:", error);
      setTemplate(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewTemplate = (templateVersion) => {
    // Switch to template preview mode
    setVersion(templateVersion);
    setPreviewMode(true);
  };

  const backToDashboard = () => {
    setPreviewMode(false);
  };

  // If in preview mode and we have bootstrap data, show the template
  if (previewMode && Object.keys(bootstrapData).length > 0) {
    return (
      <div style={{ position: 'relative' }}>
        <button 
          onClick={backToDashboard}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Back to Dashboard
        </button>
        <SiteDataContext.Provider value={bootstrapData}>
          <HomePageV1 />
        </SiteDataContext.Provider>
      </div>
    );
  }

  // Desktop dashboard layout
  if (!isMobile) {
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 300px', 
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        {/* Left Panel - Template Versions */}
        <div style={{ 
          padding: '20px', 
          borderRight: '1px solid #ddd',
          backgroundColor: 'white',
          overflowY: 'auto'
        }}>
          <h2 style={{ marginTop: 0 }}>Templates</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3].map(v => (
              <div key={v} style={{
                border: version === v ? '2px solid #007bff' : '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                cursor: 'pointer',
                backgroundColor: version === v ? '#f0f8ff' : 'white'
              }} onClick={() => handleSwitch(v)}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Homepage V{v}</h3>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviewTemplate(v);
                  }}
                  style={{
                    marginTop: '10px',
                    padding: '5px 15px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Preview V{v}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Live Preview */}
        <div style={{ 
          padding: '20px',
          borderRight: '1px solid #ddd',
          backgroundColor: 'white',
          overflowY: 'auto'
        }}>
          <h2 style={{ marginTop: 0 }}>Live Preview</h2>
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            height: 'calc(100% - 60px)',
            overflow: 'hidden'
          }}>
            {loading ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>Loading template...</div>
            ) : Template ? (
              <div style={{ 
                transform: 'scale(0.5)', 
                transformOrigin: 'top left',
                width: '200%',
                height: '200%'
              }}>
                <Template tokens={siteTokens} />
              </div>
            ) : (
              <div style={{ padding: "2rem", textAlign: "center" }}>Failed to load template</div>
            )}
          </div>
        </div>

        {/* Right Panel - Chat/Editor */}
        <div style={{ 
          padding: '20px',
          backgroundColor: 'white',
          overflowY: 'auto'
        }}>
          <h2 style={{ marginTop: 0 }}>Chat Editor</h2>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Complete the chat wizard to see your personalized website preview.
          </p>
          <button 
            onClick={() => window.open('/chat', '_blank')}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Open Chat Wizard
          </button>
          {Object.keys(bootstrapData).length > 0 && (
            <button 
              onClick={() => setPreviewMode(true)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Preview Your Site
            </button>
          )}
        </div>
      </div>
    );
  }

  // Mobile dashboard layout
  return (
    <div style={{ height: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Mobile Header */}
      <div style={{
        padding: '15px',
        backgroundColor: 'white',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '20px' }}>Dashboard</h1>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            padding: '8px 12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Menu
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderBottom: '1px solid #ddd',
          padding: '20px',
          zIndex: 100,
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <h3>Templates</h3>
          {[1, 2, 3].map(v => (
            <button 
              key={v}
              onClick={() => {
                handleSwitch(v);
                setMobileMenuOpen(false);
              }}
              style={{
                width: '100%',
                padding: '12px',
                margin: '5px 0',
                backgroundColor: version === v ? '#007bff' : '#f8f9fa',
                color: version === v ? 'white' : 'black',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Homepage V{v}
            </button>
          ))}
          <button 
            onClick={() => {
              window.open('/chat', '_blank');
              setMobileMenuOpen(false);
            }}
            style={{
              width: '100%',
              padding: '12px',
              margin: '10px 0 5px 0',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Open Chat Wizard
          </button>
        </div>
      )}

      {/* Mobile Preview */}
      <div style={{
        padding: '20px',
        height: 'calc(100vh - 100px)',
        overflowY: 'auto'
      }}>
        <h2>Live Preview</h2>
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          height: 'calc(100% - 60px)',
          overflow: 'hidden',
          backgroundColor: 'white'
        }}>
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>Loading template...</div>
          ) : Template ? (
            <div style={{ 
              transform: 'scale(0.3)', 
              transformOrigin: 'top left',
              width: '333%',
              height: '333%'
            }}>
              <Template tokens={siteTokens} />
            </div>
          ) : (
            <div style={{ padding: "2rem", textAlign: "center" }}>Failed to load template</div>
          )}
        </div>
      </div>
    </div>
  );
}