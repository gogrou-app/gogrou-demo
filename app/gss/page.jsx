"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppContext } from "../context/AppContext";
import { gssData } from "./data/gssStore";

export default function GSSPage() {
  const ctx = useAppContext();

  // ✅ DEMO FALLBACK (kritické)
  const company = ctx?.company || "DEMO";
  const warehouse = ctx?.warehouse || "MAIN";
  const setModule = ctx?.setModule;

  useEffect(() => {
    if (setModule) {
      setModule("GSS – Hlavní sklad");
    }
  }, [setModule]);

  const items = gssData?.[company]?.[warehouse] || [];

  return (
    <div style={{ padding: 30, color: "white", maxWidth: 1100 }}>
      <h1>Hlavní sklad</h1>

      <p style={{ opacity: 0.6 }}>
        Firma: <b>{company}</b> • Sklad: <b>{warehouse}</b>
      </p>

      {items.length === 0 && (
        <div style={{ marginTop: 20, opacity: 0.6 }}>
          Sklad je zatím prázdný
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/gss/${item.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                border: "1px solid #222",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                background: "#0b0b0b",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 700 }}>{item.name}</div>

              <div style={{ fontSize: 13, opacity: 0.75 }}>
                {item.type}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 16,
                  marginTop: 8,
                  fontSize: 13,
                }}
              >
                <div>🆕 {item.qty_new || 0}</div>
                <div>🔧 {item.qty_sharpened || 0}</div>
                <div>↩️ {item.qty_used || 0}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
