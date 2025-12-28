"use client";

import { useEffect } from "react";
import tools from "./data"; // ✅ SPRÁVNÝ IMPORT
import { useAppContext } from "../context/AppContext";
import Link from "next/link";

export default function GpcPage() {
  const { setModule } = useAppContext();

  useEffect(() => {
    setModule("GPC – Interní katalog");
  }, [setModule]);

  return (
    <div style={{ padding: 40, color: "white", maxWidth: 1100 }}>
      <Link
        href="/dashboard"
        style={{
          display: "inline-block",
          marginBottom: 20,
          padding: "8px 14px",
          background: "#222",
          borderRadius: 8,
          textDecoration: "none",
          color: "white",
          fontSize: 14,
        }}
      >
        ← Zpět na Dashboard
      </Link>

      <h1>GPC – Seznam nástrojů (interní)</h1>
      <p style={{ opacity: 0.6, marginBottom: 30 }}>
        Interní katalog nástrojů (zákazník GPC přímo neupravuje)
      </p>

      {tools.map((tool) => (
        <div
          key={tool.gpc_id}
          style={{
            border: "1px solid #222",
            borderRadius: 14,
            padding: 18,
            marginBottom: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#0b0b0b",
          }}
        >
          <div>
            <div style={{ fontWeight: 700 }}>{tool.name}</div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              {tool.manufacturer} · {tool.type}
            </div>
          </div>

          <Link
            href={`/gpc/${tool.gpc_id}`}
            style={{
              padding: "8px 14px",
              background: "#2563eb",
              borderRadius: 8,
              color: "white",
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            Detail →
          </Link>
        </div>
      ))}
    </div>
  );
}
