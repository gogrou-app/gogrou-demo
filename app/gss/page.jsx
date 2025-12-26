"use client";

import { useEffect, useState } from "react";
import tools from "../gpc/data";
import {
  getMainWarehouseStock,
  addStockItemFromGPC,
} from "./data/gssStore";

export default function GssPage() {
  const [stock, setStock] = useState([]);
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    refreshStock();
  }, []);

  function refreshStock() {
    setStock(getMainWarehouseStock());
  }

  const searchResults =
    query.length < 2
      ? []
      : tools.filter((t) => {
          const q = query.toLowerCase();
          return (
            t.name?.toLowerCase().includes(q) ||
            t.gpc_id?.toLowerCase().includes(q) ||
            t.gtin?.toLowerCase().includes(q)
          );
        });

  function handleAdd(tool) {
    addStockItemFromGPC(tool);
    setQuery("");
    setShowAdd(false);
    refreshStock();
  }

  return (
    <div style={{ padding: 40, color: "white", maxWidth: 900 }}>
      <h1>GSS – Hlavní sklad</h1>
      <p style={{ opacity: 0.6 }}>
        Centrální sklad firmy (uživatelský pohled)
      </p>

      {/* FIXNÍ TLAČÍTKO */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "#000",
          paddingBottom: 20,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => setShowAdd((v) => !v)}
          style={{
            background: "#2563eb",
            color: "white",
            padding: "10px 16px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
          }}
        >
          + Přidat položku do hlavního skladu
        </button>

        {/* INLINE VYHLEDÁVÁNÍ */}
        {showAdd && (
          <div
            style={{
              marginTop: 12,
              background: "#111",
              padding: 12,
              borderRadius: 8,
            }}
          >
            <input
              autoFocus
              placeholder="GTIN / GPC_ID / název / čtečka…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                border: "1px solid #333",
                background: "#000",
                color: "white",
              }}
            />

            {searchResults.length > 0 && (
              <div style={{ marginTop: 10 }}>
                {searchResults.map((tool) => (
                  <div
                    key={tool.gpc_id}
                    onClick={() => handleAdd(tool)}
                    style={{
                      padding: 10,
                      border: "1px solid #333",
                      borderRadius: 6,
                      marginBottom: 6,
                      cursor: "pointer",
                    }}
                  >
                    <strong>{tool.name}</strong>
                    <div style={{ fontSize: 12, opacity: 0.6 }}>
                      {tool.manufacturer} · {tool.gpc_id}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {query.length >= 2 && searchResults.length === 0 && (
              <div style={{ opacity: 0.5, marginTop: 10 }}>
                Nic nenalezeno
              </div>
            )}
          </div>
        )}
      </div>

      {/* SEZNAM GSS STOCK */}
      <div style={{ marginTop: 30 }}>
        {stock.length === 0 && (
          <div style={{ opacity: 0.5 }}>
            Zatím žádné položky ve skladu
          </div>
        )}

        {stock.map((item) => (
          <div
            key={item.gss_stock_id}
            style={{
              border: "1px solid #222",
              borderRadius: 10,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <strong>{item.name}</strong>
            <div style={{ opacity: 0.6 }}>
              Stav: {item.quantity} ks
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
