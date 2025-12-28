"use client";

import Link from "next/link";
import { gpcTools } from "@/app/data/gpcTools";

export default function GPCPage() {
  return (
    <div style={{ padding: "24px", maxWidth: "1100px" }}>
      {/* HLAVIČKA */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700" }}>
          GPC – Seznam nástrojů (interní)
        </h1>
        <p style={{ opacity: 0.7 }}>
          Interní katalog nástrojů (zákazník GPC přímo neupravuje)
        </p>
      </div>

      {/* SEZNAM NÁSTROJŮ */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {gpcTools.map((tool) => (
          <div
            key={tool.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              background: "#111",
              borderRadius: "12px",
              border: "1px solid #222",
            }}
          >
            <div>
              <div style={{ fontWeight: "600" }}>{tool.name}</div>
              <div style={{ fontSize: "13px", opacity: 0.7 }}>
                {tool.brand} · {tool.type}
              </div>
            </div>

            <Link href={`/gpc/${tool.id}`}>
              <button
                style={{
                  padding: "8px 14px",
                  background: "#2563eb",
                  borderRadius: "8px",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Detail →
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
