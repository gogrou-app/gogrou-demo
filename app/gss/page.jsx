"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import tools from "../gpc/data"; // GPC je jen backendová databáze
import {
  getGssStock,
  addStockItemFromGPC,
} from "./data/gssStore";

export default function GssPage() {
  const [stock, setStock] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  // načtení skladu z LocalStorage
  useEffect(() => {
    setStock(getGssStock());
  }, []);

  function handleAddToStock(e) {
    e.preventDefault();
    setError("");

    const value = input.trim();
    if (!value) return;

    // hledání v GPC (na pozadí)
    const matches = tools.filter(
      (t) =>
        String(t.gpc_id) === value ||
        String(t.gtin) === value ||
        t.name.toLowerCase().includes(value.toLowerCase())
    );

    if (matches.length === 0) {
      setError("Položka nenalezena v databázi.");
      return;
    }

    if (matches.length > 1) {
      setError("Nalezeno více položek – zpřesni zadání.");
      return;
    }

    // ✅ založení GSS STOCK (0 ks)
    addStockItemFromGPC(matches[0]);
    setStock(getGssStock());
    setInput("");
  }

  return (
    <div style={{ padding: 30, color: "white", maxWidth: 1200 }}>
      <h1 style={{ fontSize: 32, marginBottom: 6 }}>
        GSS – Hlavní sklad
      </h1>
      <div style={{ opacity: 0.6, marginBottom: 20 }}>
        Firma: DEMO COMPANY
      </div>

      {/* === FIXNÍ PŘIDÁNÍ POLOŽKY === */}
      <form
        onSubmit={handleAddToStock}
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          position: "sticky",
          top: 0,
          background: "#0b0b0b",
          padding: 12,
          borderRadius: 12,
          border: "1px solid #333",
          zIndex: 10,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="GTIN / GPC_ID / název → ENTER"
          style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #444",
            background: "#111",
            color: "white",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "12px 18px",
            borderRadius: 10,
            border: "1px solid #2b5",
            background: "#113322",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          + Přidat položku
        </button>
      </form>

      {error && (
        <div
          style={{
            background: "#2a1414",
            color: "#ffb3b3",
            padding: "10px 14px",
            borderRadius: 10,
            marginBottom: 16,
            border: "1px solid #400",
          }}
        >
          {error}
        </div>
      )}

      {/* === SEZNAM POLOŽEK VE SKLADU === */}
      {stock.length === 0 ? (
        <div style={{ opacity: 0.6 }}>
          Ve skladu zatím nejsou žádné položky.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {stock.map((s) => (
            <div
              key={s.gss_stock_id}
              style={{
                display: "grid",
                gridTemplateColumns: "3fr 1fr 2fr",
                gap: 12,
                padding: "14px 16px",
                background: "#111",
                borderRadius: 10,
                border: "1px solid #333",
                alignItems: "center",
              }}
            >
              <div>
                <Link
                  href={`/gss/${s.gss_stock_id}`}
                  style={{
                    color: "#4da6ff",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  {s.name}
                </Link>
              </div>

              <div style={{ opacity: 0.7 }}>
                {s.tracking_mode.toUpperCase()}
              </div>

              <div style={{ opacity: 0.7 }}>
                Skladem: 0 ks
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
