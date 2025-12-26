"use client";

import { useState } from "react";
import Link from "next/link";

// DATA
import gssStock from "../data/gssStock";
import dmItems from "../data/dmItems";
import auditLog from "../data/auditLog";

// STATE ENGINE
import {
  DM_STATUSES,
  DM_ACTIONS,
  applyActionToDmItem
} from "../data/stateEngine";

// ==================================================
// MOCK LOKACE (dočasně – v D6 půjde do dat)
// ==================================================
const LOCATIONS = [
  { id: "warehouse:MAIN", label: "Hlavní sklad" },
  { id: "machine:CNC_MAZAK_01", label: "CNC Mazak 01" },
  { id: "machine:CNC_MAZAK_02", label: "CNC Mazak 02" },
  { id: "service:SHARPENING", label: "Brusírna" }
];

// ==================================================
// PAGE
// ==================================================
export default function GssItemDetail({ params }) {
  const { stockId } = params;

  // ------------------------------------------------
  // DATA
  // ------------------------------------------------
  const stockItem = gssStock.find((s) => s.id === stockId);

  const [dmCode, setDmCode] = useState("");
  const [dmItem, setDmItem] = useState(null);

  const [selectedLocation, setSelectedLocation] = useState("");
  const [message, setMessage] = useState("");

  // ------------------------------------------------
  // DM LOOKUP
  // ------------------------------------------------
  function handleDmLookup(value) {
    setDmCode(value);
    const found = dmItems.find((d) => d.dm_code === value);
    setDmItem(found || null);
    setMessage("");
  }

  // ------------------------------------------------
  // ACTION: SEND TO PRODUCTION
  // ------------------------------------------------
  function handleSendToProduction() {
    if (!dmItem) {
      setMessage("❌ Nejdříve načti DM kus");
      return;
    }

    if (!selectedLocation) {
      setMessage("❌ Lokace je povinná");
      return;
    }

    const result = applyActionToDmItem({
      item: dmItem,
      action: "SEND_TO_PRODUCTION",
      locationId: selectedLocation
    });

    if (!result.ok) {
      setMessage(`❌ ${result.error}`);
      return;
    }

    // UPDATE LOCAL STATE (DEMO)
    dmItem.status = result.item.status;
    dmItem.location = result.item.location;

    setMessage("✅ Nástroj odeslán do výroby");
  }

  // ------------------------------------------------
  // RENDER
  // ------------------------------------------------
  return (
    <div>
      <Link href="/gss" style={{ color: "#6ea8ff" }}>
        ← Zpět na GSS
      </Link>

      <h1 style={{ marginTop: 20 }}>
        {stockItem ? stockItem.name : "Neznámá položka"}
      </h1>
      <div style={{ opacity: 0.6 }}>
        StockId: {stockId}
      </div>

      {/* ================= DM SCAN ================= */}
      <div className="card" style={{ marginTop: 30 }}>
        <h3>DM scan (info)</h3>
        <input
          type="text"
          placeholder="Zadej / naskenuj DM kód"
          value={dmCode}
          onChange={(e) => handleDmLookup(e.target.value)}
          style={{ width: "100%" }}
        />

        {dmItem && (
          <div
            style={{
              marginTop: 15,
              padding: 12,
              border: "1px solid #333",
              borderRadius: 6
            }}
          >
            <strong>DM:</strong> {dmItem.dm_code}<br />
            <strong>Stav:</strong> {dmItem.status}<br />
            <strong>Lokace:</strong> {dmItem.location}<br />
            <strong>Přebroušení:</strong>{" "}
            {dmItem.sharpening_current}/{dmItem.sharpening_max}
          </div>
        )}
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="card" style={{ marginTop: 30 }}>
        <h3>Akce s DM kusem</h3>

        <label>Lokace (povinné)</label>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          style={{ width: "100%", marginTop: 5 }}
        >
          <option value="">— vyber lokaci —</option>
          {LOCATIONS.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleSendToProduction}
          style={{
            marginTop: 15,
            width: "100%",
            background: "#3558d6"
          }}
        >
          Odeslat do výroby
        </button>

        {message && (
          <div style={{ marginTop: 10 }}>{message}</div>
        )}
      </div>

      {/* ================= AUDIT LOG ================= */}
      <div className="card" style={{ marginTop: 30 }}>
        <h3>Historie pohybů (audit)</h3>

        {auditLog
          .filter((a) => a.dm_code === dmCode)
          .reverse()
          .map((a) => (
            <div
              key={a.id}
              style={{
                padding: "8px 0",
                borderBottom: "1px solid #222",
                fontSize: 13
              }}
            >
              <strong>{a.action}</strong> → {a.to_status}<br />
              <span style={{ opacity: 0.6 }}>
                {a.timestamp} | {a.location}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
