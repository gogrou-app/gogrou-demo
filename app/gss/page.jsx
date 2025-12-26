"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMainWarehouseStock } from "./data/gssStore";

export default function GSSPage() {
  const [stock, setStock] = useState([]);

  useEffect(() => {
    setStock(getMainWarehouseStock());
  }, []);

  return (
    <div style={{ padding: "30px", maxWidth: "900px" }}>
      <h1>GSS – Hlavní sklad</h1>
      <p>Centrální sklad firmy (uživatelský pohled)</p>

      {/* 🔵 FIXNÍ TLAČÍTKO – VŽDY VIDITELNÉ */}
      <div
        style={{
          position: "sticky",
          top: "20px",
          zIndex: 10,
          marginBottom: "30px",
        }}
      >
        <Link href="/gss/add">
          <button
            style={{
              padding: "12px 20px",
              fontSize: "16px",
              background: "#2563eb",
              color: "white",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            ➕ Přidat položku do hlavního skladu
          </button>
        </Link>
      </div>

      {/* 📦 OBSAH SKLADU */}
      {stock.length === 0 ? (
        <p style={{ opacity: 0.6 }}>Ve skladu zatím nejsou žádné položky.</p>
      ) : (
        stock.map((item) => (
          <div
            key={item.gss_stock_id}
            style={{
              border: "1px solid #333",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "12px",
            }}
          >
            <strong>{item.name}</strong>
            <div>Stav: {item.quantity} ks</div>
          </div>
        ))
      )}
    </div>
  );
}
