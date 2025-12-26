"use client";

import { useState } from "react";
import Link from "next/link";

// DATA (POZOR – OPRAVENÉ CESTY)
import gssStock from "../../data/gssStock";
import dmItems from "../../data/dmItems";
import auditLog from "../../data/auditLog";

// STATE ENGINE
import {
  applyActionToDmItem
} from "../../data/stateEngine";

// ==================================================
// MOCK LOKACE
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
  // SEND TO PRODUCTION
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
      <div style={{ opacity: 0.6 }}>StockId: {stockId}</div>

      {/* DM SCAN */}
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
          <div style={{ marginTop: 15 }}>
            <div>DM: {dmItem.dm_code}</div>
            <div>Stav: {dmItem.status}</div>
            <div>Lokace: {dmItem.location}</div>
            <div>
              Přebroušení: {dmItem.sharpening_current}/{dmItem.sharpening_max}
            </div>
          </div>
        )}
      </div>

      {/* ACTION */}
      <div className="card" style={{ marginTop: 30 }}>
        <h3>Akce s DM kusem</h3>

        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          style={{ width: "100%" }}
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
          style={{ marginTop: 15, width: "100%" }}
        >
          Odeslat do výroby
        </button>

        {message && <div style={{ marginTop: 10 }}>{message}</div>}
      </div>

      {/* AUDIT */}
      <div className="card" style={{ marginTop: 30 }}>
        <h3>Audit log</h3>
        {auditLog
          .filter((a) => a.dm_code === dmCode)
          .reverse()
          .map((a) => (
            <div key={a.id}>
              {a.timestamp} – {a.action} → {a.to_status}
            </div>
          ))}
      </div>
    </div>
  );
}
