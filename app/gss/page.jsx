"use client";

import { useState } from "react";
import Link from "next/link";

import gpcTools from "../gpc/data";          // GPC data
import gssStockData from "./data/gssStock"; // GSS stock (demo)
import { company, warehouses } from "./data/company";

export default function GssPage() {
  const [query, setQuery] = useState("");
  const [gssStock, setGssStock] = useState(gssStockData);
  const [error, setError] = useState(null);

  const mainWarehouse = warehouses.find(w => w.type === "MAIN");

  function handleAddFromGPC(e) {
    e.preventDefault();
    setError(null);

    const q = query.trim().toLowerCase();
    if (!q) return;

    const matches = gpcTools.filter(t =>
      String(t.gpc_id).toLowerCase() === q ||
      String(t.gtin || "").toLowerCase() === q ||
      String(t.name).toLowerCase().includes(q)
    );

    if (matches.length !== 1) {
      setError("Nenalezena jednoznačná položka v GPC");
      return;
    }

    const tool = matches[0];

    const exists = gssStock.some(s => s.gpc_id === tool.gpc_id);
    if (exists) {
      setError("Položka už je v GSS založena");
      return;
    }

    const newStock = {
      gss_stock_id: `STOCK-${String(gssStock.length + 1).padStart(3, "0")}`,
      company_id: company.company_id,
      warehouse_id: mainWarehouse.warehouse_id,
      gpc_id: tool.gpc_id,
      tracking_mode: "dm",
      min_qty: 0,
      max_qty: null,
      items: [],
    };

    setGssStock([...gssStock, newStock]);
    setQuery("");
  }

  return (
    <div style={{ padding: 30, color: "white" }}>
      <h1 style={{ fontSize: 32, marginBottom: 12 }}>
        GSS – Hlavní sklad
      </h1>

      <div style={{ opacity: 0.7, marginBottom: 20 }}>
        Firma: <strong>{company.name}</strong> · Sklad:{" "}
        <strong>{mainWarehouse.name}</strong>
      </div>

      {/* VSTUP – PŘIDAT Z GPC */}
      <form onSubmit={handleAddFromGPC} style={{ marginBottom: 20 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="GTIN / GPC_ID / název + ENTER"
          style={{
            width: 420,
            padding: "10px 12px",
            borderRadius: 6,
            border: "1px solid #333",
            background: "#111",
            color: "white",
            fontSize: 14,
          }}
        />
        {error && (
          <div style={{ color: "#ff6b6b", marginTop: 8 }}>
            {error}
          </div>
        )}
      </form>

      {/* HLAVIČKA TABULKY */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "3fr 1fr 2fr 2fr",
          gap: 12,
          padding: "12px 16px",
          background: "#222",
          borderRadius: 8,
          fontWeight: "bold",
          fontSize: 14,
          marginBottom: 10,
        }}
      >
        <div>Název položky</div>
        <div>Typ</div>
        <div>Skladem (nové / ostřené)</div>
        <div>Stav</div>
      </div>

      {/* ŘÁDKY */}
      {gssStock.map((stock) => {
        const tool = gpcTools.find(
          (t) => String(t.gpc_id) === String(stock.gpc_id)
        );

        const newCount = stock.items.filter(
          (i) => i.status === "in_stock" && i.resharpen_count === 0
        ).length;

        const sharpenedCount = stock.items.filter(
          (i) => i.status === "in_stock" && i.resharpen_count > 0
        ).length;

        return (
          <div
            key={stock.gss_stock_id}
            style={{
              display: "grid",
              gridTemplateColumns: "3fr 1fr 2fr 2fr",
              gap: 12,
              padding: "14px 16px",
              background: "#111",
              borderRadius: 8,
              marginBottom: 6,
              alignItems: "center",
            }}
          >
            <div>
              <Link
                href={`/gss/${stock.gss_stock_id}`}
                style={{
                  color: "#4da6ff",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                {tool?.name || "Neznámá položka"}
              </Link>
            </div>

            <div style={{ opacity: 0.8 }}>
              {tool?.type || "—"}
            </div>

            <div>
              <strong>{newCount}</strong> /{" "}
              <strong>{sharpenedCount}</strong>
            </div>

            <div style={{ opacity: 0.6 }}>—</div>
          </div>
        );
      })}
    </div>
  );
}
