// dashboard/src/templates/homepage/v1/index.jsx
// ──────────────────────────────────────────────
// Thin wrapper → hands every prop (including bootstrap data)
// directly to the real component in the same folder.

import React from "react";
import HomePageV1 from "../../HomePageV1.jsx";
// ← make sure the filename matches yours exactly

export default function IndexWrapper(props) {
  return <HomePageV1 {...props} />;
}
