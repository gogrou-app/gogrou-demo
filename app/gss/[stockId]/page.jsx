"use client";

import { useState } from "react";
import Link from "next/link";

import { applyActionToDmItem } from "../data/stateEngine";
import dmItems from "../data/dmItems";
import locations from "../data/locations";

export default function GssStockDetailPage({ params }) {
  const { stockId } = params;

  const [dmCode, setDmCode] = useState("");
  const [dmItem, setDmItem] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [actionResult, setActionResult] = useState(null);

  // ============================
  // DM SCAN – INFO ONLY
  // ============================
  function handleDmScan(value) {
    setDmCode(value);

    const found = dmItems.find((d) => d.dm_code === value);
    setDmItem(found || null);
    setActionResult(null);
  }

  // ============================
  // AKCE – ODESLAT DO VÝROBY
  // ============================
  function handleSendToProduction() {
    if (!dmItem) {
      alert("Nejprve naskenuj DM kód");
      return;
    }

    if (!selectedLocation) {
      alert("Vyber lokaci");
      return;
    }

    const result = applyActionToDmItem({
      item: dmItem,
      action: "SEND_TO_PRODUCTION",
      locationId: selectedLocation
    });

    setActionResult(result);
  }

  return (
    <div style={{ padding: 30, color: "white" }}>
      <Link
        href="/gss"
        style={{ color: "#4da6ff", textDecoration: "none" }}
      >
        ← Zpět na GSS
      </Link>

      <h1 style={{ marginTop: 10 }}>
        Neznámá položka
      </h1>

      <div style={{ opacity: 0.6, marginBottom: 20 }}>
        StockId: {stockId}
      </div>

      {/* ================= DM SCAN ================= */}
      <div
        style={{
          background: "#111",
          padding: 20,
          borderRadius: 10,
          marginBottom: 20
        }}
      >
        <h3>DM scan (info)</h3>

        <input
          value={dmCode}
          onChange={(e) => handleDmScan(e.target.value)}
          placeholder="Zadej / naskenuj DM kód"
          style={{
            width: "100%",
            padding: 10,
            marginTop: 10,
            background: "#000",
            color: "white",
            border: "1px solid #333",
            borderRadius: 6
          }}
        />

        {dmItem && (
          <div style={{ marginTop: 10, fontSize: 14 }}>
            <div>DM: <strong>{dmItem.dm_code}</strong></div>
            <div>Stav: {dmItem.status}</div>
            <div>Přebroušení: {dmItem.resharpen_count}</div>
          </div>
        )}
      </div>

      {/* ================= AKCE ================= */}
      <div
        style={{
          background: "#111",
          padding: 20,
          borderRadius: 10
        }}
      >
        <h3>Akce s DM kusem</h3>
        <div style={{ fontSize: 13, opacity: 0.7 }}>
          Lokace (povinné)
        </div>

        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          style={{
            width: "100%",
            marginTop: 8,
            padding: 10,
            background: "#000",
            color: "white",
            border: "1px solid #333",
            borderRadius: 6
          }}
        >
          <option value="">— vyber lokaci —</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleSendToProduction}
          style={{
            marginTop: 12,
            width: "100%",
            padding: 12,
            background: "#2a3faa",
            border: "none",
            color: "white",
            borderRadius: 6,
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Odeslat do výroby
        </button>

        {actionResult && (
          <pre
            style={{
              marginTop: 15,
              fontSize: 12,
              background: "#000",
              padding: 10,
              borderRadius: 6
            }}
          >
            {JSON.stringify(actionResult, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
