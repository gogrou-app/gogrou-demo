// /app/components/GogrouHeader.jsx
"use client";

import { getGogrouContext } from "@/app/context/gogrouContext";

export default function GogrouHeader() {
  const ctx = getGogrouContext();

  if (!ctx) return null;

  return (
    <div
      style={{
        background: "#0b1220",
        borderBottom: "1px solid #1f2937",
        padding: "10px 24px",
        color: "#e5e7eb",
        fontSize: 14,
      }}
    >
      <strong>{ctx.company.name}</strong>
      <span style={{ opacity: 0.5, margin: "0 8px" }}>•</span>
      <span>{ctx.module.label}</span>
      <span style={{ opacity: 0.5, margin: "0 8px" }}>•</span>
      <span>{ctx.warehouse.label}</span>
    </div>
  );
}
