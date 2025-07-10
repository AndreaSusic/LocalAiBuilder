/*  src/components/TemplatePreview.jsx
    -----------------------------------------------------------
    Shows the live website preview inside the dashboard.
    It pulls the logged-in account’s data from /api/user-data
    and feeds it to the template (HomepageV1).
----------------------------------------------------------- */
import React, { useEffect, useState } from "react";
import HomepageV1 from "../templates/homepage/v1/index.jsx";

console.log("######## I AM TP at", import.meta.url);

/* -----------------------------------------------------------
 * 1. Fetch the bootstrap JSON once.
 * 2. While loading, show a spinner message.
 * 3. If there’s an error, show a friendly retry box.
 * 4. When ready, pass the data to <HomepageV1>.
 * --------------------------------------------------------- */
export default function TemplatePreview() {
  /* -------- state buckets -------- */
  const [bootstrap, setBootstrap] = useState(null); // real data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* -------- one-time fetch -------- */
  useEffect(() => {
    (async () => {
      try {
        console.log("📡  GET /api/user-data …");
        const res = await fetch("/api/user-data");
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const json = await res.json();

        // Normalise shape: make sure services is always an ARRAY
        const processed = {
          ...json.bootstrap,
          services: Array.isArray(json.bootstrap.services)
            ? json.bootstrap.services
            : json.bootstrap.services
              ? [json.bootstrap.services]
              : [],
        };

        console.log("✅  Loaded bootstrap:", processed);
        setBootstrap(processed);
      } catch (err) {
        console.error("❌  /api/user-data failed:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* -------- loading state -------- */
  if (loading) {
    return <div style={styles.centerBox}>Loading preview…</div>;
  }

  /* -------- error state -------- */
  if (error || !bootstrap) {
    return (
      <div style={styles.centerBox}>
        <h2 style={{ color: "#ff4444", marginBottom: 16 }}>Data Error</h2>
        <p style={{ marginBottom: 16, color: "#666" }}>
          {error || "No data returned from /api/user-data"}
        </p>
        <button onClick={() => window.location.reload()} style={styles.btn}>
          Retry
        </button>
      </div>
    );
  }

  /* -------- ready! -------- */
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <HomepageV1 bootstrap={bootstrap} />
    </div>
  );
}

/* -----------------------------------------------------------
 * Inline helper styles
 * --------------------------------------------------------- */
const styles = {
  centerBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
  },
  btn: {
    padding: "12px 24px",
    background: "#ffc000",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    fontSize: 16,
    cursor: "pointer",
  },
};
