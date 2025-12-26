"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  loadGssStock,
  addStockItemFromGPC,
} from "./data/gssStore";

import gpcTools from "../gpc/data";

export default function GssPage() {
  const [stock, setStock] = useState([]);

  // ⬅️ načtení skladu z LocalStorage
  useEffect(() => {
    setStock(loadGssStock());
  }, []);

  function handleAddFromGPC(tool) {
    addStockItemFromGPC(tool);
    setStock(loadGssStock());
  }

  return (
    <div style={{ padding: 30, color: "white", maxWidth: 1200 }}>
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>
        GSS – Hlavní sklad firmy
      </h1>

      {/* === PŘIDÁNÍ POLOŽKY (TRVALE VIDITELNÉ) === */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#000",
          padding: "14px 0",
          borderBottom: "1px solid #333",
          marginBottom: 20,
        }}
      >
        <h3 style={{ marginBottom: 10 }}>Přidat položku do skladu</h3>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {gpcTools.map((tool) => (
            <button
              key={tool.gpc_id}
              onClick={() => handleAddFromGPC(tool)}
              style={{
                padding: "8px 12px",
                background: "#1e90ff",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              + {tool.name}
            </button>
          ))}
        </div>
      </div>

      {/* === SEZNAM SKLADU === */}
      {stock.length === 0 ? (
        <div style={{ opacity: 0.6 }}>
          Sklad je zatím prázdný
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {stock.map((item) => (
            <Link
              key={item.gss_stock_id}
              href={`/gss/${item.gss_stock_id}`}
              style={{
                textDecoration: "none",
                color: "white",
                border: "1px solid #333",
                borderRadius: 10,
                padding: 14,
                background: "#111",
              }}
            >
              <div style={{ fontWeight: "bold" }}>
                {item.name}
              </div>
              <div style={{ opacity: 0.7, fontSize: 13 }}>
                {item.manufacturer} · {item.type}
              </div>
              <div style={{ marginTop: 6 }}>
                Stav: <strong>{item.quantity} ks</strong>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
