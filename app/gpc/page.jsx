"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppContext } from "../context/AppContext";

// ✅ SPRÁVNÝ IMPORT – RELATIVNÍ CESTA
import { gpcTools } from "../data/gpcTools";

export default function GPCPage() {
  const { setModule } = useAppContext();

  useEffect(() => {
    setModule("GPC – Produktový katalog");
  }, [setModule]);

  return (
    <div style={{ padding: 30, maxWidth: 1100, color: "white" }}>
      {/* HLAVIČKA */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, marginBottom: 6 }}>
          GPC – Seznam nástrojů (interní)
        </h1>
        <div style={{ opacity: 0.7, fontSize: 14 }}>
          Interní katalog nástrojů (zákazník GPC přímo neupravuje)
        </div>
      </div>

      {/* SEZNAM NÁSTROJŮ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {gpcTools.map((tool) => (
          <div
            key={tool.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 18px",
              borderRadius: 14,
              background: "#0b0b0b",
              border: "1px solid #1f1f1f",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {tool.name}
              </div>
              <div style={{ opacity: 0.65, fontSize: 13 }}>
                {tool.brand} · {tool.type}
              </div>
            </div>

            <Link href={`/gpc/${tool.id}`}>
              <button
                style={{
                  background: "#2563eb",
                  border: "none",
                  color: "white",
                  padding: "8px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 600,
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
