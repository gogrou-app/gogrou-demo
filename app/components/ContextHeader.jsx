"use client";

import React from "react";

// ⚠️ Bezpečný import kontextu – pokud soubor existuje, použije se.
// Když by se někdy jmenovalo jinak, komponenta stejně nespadne.
let useAppContext = null;
try {
  // eslint-disable-next-line global-require
  useAppContext = require("../context/AppContext").useAppContext;
} catch (e) {
  useAppContext = null;
}

export default function ContextHeader() {
  let moduleTitle = "";

  try {
    const ctx = useAppContext ? useAppContext() : null;
    moduleTitle =
      (ctx && (ctx.module || ctx.currentModule || ctx.activeModule)) || "";
  } catch (e) {
    moduleTitle = "";
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        marginBottom: 18,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>GOGROU DEMO</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>
          {moduleTitle || "Dashboard"}
        </div>
      </div>

      <div style={{ fontSize: 12, opacity: 0.7 }}>v0.1</div>
    </div>
  );
}
