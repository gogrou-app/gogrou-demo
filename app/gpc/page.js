"use client";

import Link from "next/link";
import tools from "./data";

export default function GpcPage() {
  return (
    <div style={{ padding: 30, color: "white", maxWidth: 1200 }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>
        GPC – Seznam nástrojů (interní)
      </h1>

      {tools.length === 0 ? (
        <div style={{ opacity: 0.6 }}>Žádná data</div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {tools.map((tool) => (
            <div
              key={tool.gpc_id}
              style={{
                border: "1px solid #333",
                borderRadius: 12,
                padding: 16,
                background: "#111",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold", fontSize: 16 }}>
                  {tool.name}
                </div>
                <div style={{ opacity: 0.7, fontSize: 13 }}>
                  {tool.manufacturer} · {tool.type}
                </div>
              </div>

              <Link
                href={`/gpc/${tool.gpc_id}`}
                style={{
                  padding: "8px 14px",
                  background: "#333",
                  color: "white",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontSize: 13,
                }}
              >
                Detail →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
