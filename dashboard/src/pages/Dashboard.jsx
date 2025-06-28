import { useState, useEffect } from "react";
import { loadTemplate } from "../utils/templateLoader";
import "../styles/templateSelector.css";

export default function DashboardPage() {
  const [pageType] = useState("homepage");
  const [version, setVersion] = useState(1);
  const [Template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(false);

  // Default site tokens that can be customized
  const siteTokens = {
    companyName: "Your Practice Name",
    tagline: "High-quality care in a welcoming environment—expertise you can trust.",
    primaryColor: "#5DD39E",
    secondaryColor: "#EFD5BD",
    phone: "+1 234 567 89",
    email: "info@yourpractice.com",
    address: "123 Dental St., City, State ZIP"
  };

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

  return (
    <div className="dashboard">
      <aside className="version-selector">
        <h3 style={{ margin: "0 0 16px 0", color: "#333" }}>Homepage Templates</h3>
        {[1, 2, 3].map((v) => (
          <button
            key={v}
            className={v === version ? "active" : ""}
            onClick={() => handleSwitch(v)}
            disabled={loading}
          >
            Homepage v{v}
          </button>
        ))}
      </aside>

      <main className="preview-canvas">
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>Loading template...</div>
        ) : Template ? (
          <Template tokens={siteTokens} />
        ) : (
          <div style={{ padding: "2rem", textAlign: "center" }}>Failed to load template</div>
        )}
      </main>
    </div>
  );
}