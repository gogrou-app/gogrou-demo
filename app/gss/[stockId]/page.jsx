"use client";

import { useState } from "react";
import Link from "next/link";

// ✅ SPRÁVNÉ RELATIVNÍ IMPORTY
import { applyActionToDmItem } from "../data/stateEngine";
import gssStock from "../data/gssStock";
import locations from "../data/locations";

export default function GssStockDetailPage({ params }) {
  const { stockId } = params;

  const stock = gssStock.find(
    (s) => String(s.gss_stock_id) === String(stockId)
  );

  const [dmCode, setDmCode] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [result, setResult] = useState(null);

  if (!stock) {
    return (
      <div style={{ padding: 30, color: "white" }}>
        <Link href="/gss" style={{ color: "#4da6ff" }}>
          ← Zpět na GSS
        </Link>
        <h1>Neznámá položka</h1>
        <div>StockId: {stockId}</div>
      </div>
    );
  }

  const dmItem = stock.items.find((i) => i.dm_code === dmCode);

  function handleAction() {
    if (!dmItem || !selectedLocation) return;

    const res = applyActionToDmItem({
      item: dmItem,
      action: "SEND_TO_PRODUCTION",
      locationId: selectedLocation
    });

    setResult(res);
  }

  return (
    <div style={{ padding: 30, color: "white" }}>
      <Link href="/gss" style={{ color: "#4da6ff" }}>
        ← Zpět na GSS
      </Link>

      <h1>Detail GSS položky</h1>
      <div style={{ opacity: 0.7, marginBottom: 20 }}>
        GSS ID: {stock.gss_stock_id}
      </div>

      {/* DM SCAN – INFO */}
      <div
        style={{
          background: "#111",
          padding: 16,
          borderRadius: 8,
          marginBottom: 20
        }}
      >
        <h3>DM scan (info)</h3>
        <input
          value={dmCode}
          onChange={(e) => setDmCode(e.target.value)}
          placeholder="Zadej / naskenuj DM kód"
          style={{ width: "100%", padding: 8 }}
        />

        {dmItem && (
          <div style={{ marginTop: 10, fontSize: 14 }}>
            Stav: <strong>{dmItem.status}</strong><br />
            Lokace: <strong>{dmItem.location}</strong>
          </div>
        )}
      </div>

      {/* AKCE */}
      <div
        style={{
          background: "#111",
          padding: 16,
          borderRadius: 8
        }}
      >
        <h3>Akce s DM kusem</h3>

        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        >
          <option value="">— vyber lokaci —</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleAction}
          disabled={!dmItem || !selectedLocation}
          style={{
            padding: "10px 20px",
            background: "#2d4fff",
            color: "white",
            borderRadius: 6,
            border: "none",
            cursor: "pointer"
          }}
        >
          Odeslat do výroby
        </button>

        {result && (
          <pre style={{ marginTop: 10, fontSize: 12 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
