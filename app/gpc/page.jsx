"use client";

import { useRouter } from "next/navigation";
import { gpcTools } from "./data/gpcTools";

export default function GPCPage() {
  const router = useRouter();

  return (
    <div style={{ padding: "32px 24px", color: "white" }}>
      {/* FIXNÍ HLAVIČKA */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#000",
          paddingBottom: 16,
          marginBottom: 24,
          borderBottom: "1px solid #222",
        }}
      >
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            marginBottom: 12,
            background: "#1f2937",
            border: "1px solid #333",
            color: "white",
            padding: "6px 12px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          ← Zpět na Dashboard
        </button>

        <h1 style={{ fontSize: 28, marginBottom: 4 }}>
          GPC – Seznam nástrojů (interní)
        </h1>
        <div style={{ opacity: 0.6 }}>
          Interní katalog nástrojů (zákazník GPC přímo neupravuje)
        </div>
      </div>

      {/* CENTRÁLNÍ OBSAH */}
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {gpcTools.map((tool) => (
          <div
            key={tool.id}
            style={{
              border: "1px solid #222",
              borderRadius: 14,
              padding: "16px 18px",
              background: "#0b0b0b",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{tool.name}</div>
              <div style={{ opacity: 0.6, fontSize: 13 }}>
                {tool.manufacturer} • {tool.type}
              </div>
            </div>

            <button
              onClick={() => router.push(`/gpc/${tool.id}`)}
              style={{
                background: "#2563eb",
                border: "none",
                color: "white",
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Detail →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
