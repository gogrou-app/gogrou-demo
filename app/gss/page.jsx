"use client";

import { useEffect, useState } from "react";
import tools from "../gpc/data"; // GPC katalog
import {
  getMainWarehouseStock,
  addStockItemFromGPC,
} from "./data/gssStore";

export default function GssPage() {
  const [stock, setStock] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    refreshStock();
  }, []);

  function refreshStock() {
    const data = getMainWarehouseStock();
    setStock(data || []);
  }

  function handleSearch(value) {
    setQuery(value);

    if (value.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const q = value.toLowerCase();

    const filtered = tools.filter((t) => {
      return (
        t.name?.toLowerCase().includes(q) ||
        t.gpc_id?.toLowerCase().includes(q) ||
        t.gtin?.toLowerCase().includes(q)
      );
    });

    setResults(filtered);
    setShowResults(true);
  }

  function handleAdd(tool) {
    addStockItemFromGPC(tool);
    setQuery("");
    setResults([]);
    setShowResults(false);
    refreshStock();
  }

  return (
    <div style={{ padding: 40, color: "white", maxWidth: 1000 }}>
      <h1>GSS – Hlavní sklad</h1>
      <p style={{ opacity: 0.6 }}>
        Zde spravujete skutečný sklad firmy
      </p>

      {/* ===== CHYTRÝ ŘÁDEK (NAVEDENÍ Z GPC) ===== */}
      <div
        style={{
          marginTop: 20,
          marginBottom: 30,
          background: "#0b0b0b",
          border: "1px solid #222",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <input
          autoFocus
          placeholder="Zadej název / GPC_ID / GTIN / čtečka…"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            fontSize: 15,
            borderRadius: 8,
            border: "1px solid #333",
            background: "#000",
            color: "white",
          }}
        />

        {showResults && results.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {results.map((tool) => (
              <div
                key={tool.gpc_id}
                onClick={() => handleAdd(tool)}
                onDoubleClick={() => handleAdd(tool)}
                style={{
                  padding: 12,
                  border: "1px solid #333",
                  borderRadius: 8,
                  marginBottom: 8,
                  cursor: "pointer",
                  background: "#111",
                }}
              >
                <strong>{tool.name}</strong>
                <div style={{ fontSize: 12, opacity: 0.6 }}>
                  {tool.manufacturer} · {tool.gpc_id}
                  {tool.gtin ? ` · GTIN ${tool.gtin}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}

        {showResults && results.length === 0 && (
          <div style={{ marginTop: 12, opacity: 0.5 }}>
            Nic nenalezeno
          </div>
        )}
      </div>

      {/* ===== SEZNAM SKLADU ===== */}
      <div>
        {stock.length === 0 && (
          <div style={{ opacity: 0.5 }}>
            Zatím žádné položky ve skladu
          </div>
        )}

        {stock.map((item) => (
          <div
            key={item.gss_stock_id}
            onClick={() =>
              (window.location.href = `/gss/${item.gss_stock_id}`)
            }
            style={{
              border: "1px solid #222",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              cursor: "pointer",
              background: "#0b0b0b",
            }}
          >
            <strong>{item.name}</strong>

            <div
              style={{
                display: "flex",
                gap: 16,
                marginTop: 6,
                fontSize: 13,
                opacity: 0.8,
              }}
            >
              <div>Stav: {item.quantity} ks</div>
              <div>MIN: {item.min ?? "—"}</div>
              <div>MAX: {item.max ?? "—"}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

