"use client";

import Link from "next/link";
import tools from "./data";

export default function GpcPage() {
  return (
    <div style={{ padding: 30, maxWidth: 1000, color: "white" }}>

      {/* ===== STICKY HEADER ===== */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "#000",
          paddingBottom: 16,
          marginBottom: 20,
          borderBottom: "1px solid #222",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "inline-block",
            padding: "8px 14px",
            borderRadius: 8,
            background: "#1f2937",
            color: "white",
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          ← Zpět na Dashboard
        </Link>

        <h1 style={{ marginTop: 16 }}>
          GPC – Seznam nástrojů (interní)
        </h1>

        <p style={{ opacity: 0.6 }}>
          Interní katalog nástrojů (zákazník GPC přímo neupravuje)
        </p>
      </div>

      {/* ===== LIST KARET POD SEBE ===== */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {tools.map((tool) => (
          <div
            key={tool.gpc_id}
            style={{
              border: "1px solid #222",
              borderRadius: 12,
              padding: 16,
              background: "#0b0b0b",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>
                {tool.name}
              </div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>
                {tool.manufacturer} · {tool.type}
              </div>
            </div>

            <Link
              href={`/gpc/${tool.gpc_id}`}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                background: "#2563eb",
                color: "white",
                textDecoration: "none",
                fontSize: 13,
                whiteSpace: "nowrap",
              }}
            >
              Detail →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
