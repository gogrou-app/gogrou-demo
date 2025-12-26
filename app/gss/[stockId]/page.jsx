"use client";

import { useState } from "react";
import Link from "next/link";

import { applyActionToDmItem } from "@/lib/gssStateEngine";
import dmItems from "@/data/dmItems";
import locations from "@/data/locations";

export default function GssStockDetailPage({ params }) {
  const { stockId } = params;

  const [dmCode, setDmCode] = useState("");
  const [dmItem, setDmItem] = useState(null);

  const [selectedLocation, setSelectedLocation] = useState("");
  const [actionResult, setActionResult] = useState(null);

  // ==============================
  // DM SCAN (INFO ONLY)
  // ==============================
  function handleDmScan(value) {
    setDmCode(value);

    const found = dmItems.find((d) => d.dm_code === value);
    setDmItem(found || null);
    setActionResult(null);
  }

  // ==============================
  // APPLY ACTION
  // ==============================
  function handleSendToProduction() {
    if (!dmItem || !selectedLocation) return;

    const result = applyActionToDmItem({
      item: dmItem,
      action: "SEND_TO_PRODUCTION",
      locationId: selectedLocation
    });

    setActionResult(result);

    if (result.ok) {
      setDmItem(result.item);
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <Link href="/gss" style={{ color: "#6aa9ff" }}>
        ← Zpět na GSS
      </Link>

      <h1 style={{ marginTop: 16 }}>
        {dmItem ? dmItem.name : "Neznámá položka"}
      </h1>

      <div style={{ opacity: 0.6, marginBottom: 24 }}>
        StockId: {stockId}
      </div>

      {/* ==============================
          DM SCAN (INFO)
      ============================== */}
      <section
        style={{
          border: "1px solid #333",
          borderRadius: 8,
          padding: 16,
          marginBottom: 24
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
            background: "#111",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: 6
          }}
        />

        {dmItem && (
          <div
            style={{
              marginTop: 16,
              background: "#111",
              padding: 12,
              borderRadius: 6
            }}
          >
            <div><strong>DM:</strong> {dmItem.dm_code}</div>
            <div><strong>Stav:</strong> {dmItem.status}</div>
            <div><strong>Lokace:</strong> {dmItem.location}</div>
            <div>
              <strong>Přebroušení:</strong>{" "}
              {dmItem.sharpened}/{dmItem.max_sharpening}
            </div>
          </div>
        )}
      </section>

      {/* ==============================
          ACTIONS
      ============================== */}
      <section
        style={{
          border: "1px solid #333",
          borderRadius: 8,
          padding: 16
        }}
      >
        <h3>Akce s DM kusem</h3>

        <label style={{ display: "block", marginBottom: 8 }}>
          Lokace (povinné)
        </label>

        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            background: "#111",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: 6,
            marginBottom: 12
          }}
        >
          <option value="">— vyber lokaci —</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>

        <button
          disabled={!dmItem || !selectedLocation}
          onClick={handleSendToProduction}
          style={{
            width: "100%",
            padding: 12,
            background:
              !dmItem || !selectedLocation ? "#333" : "#2f4fd8",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor:
              !dmItem || !selectedLocation ? "not-allowed" : "pointer"
          }}
        >
          Odeslat do výroby
        </button>

        {actionResult && (
          <div style={{ marginTop: 16 }}>
            {actionResult.ok ? (
              <div style={{ color: "#6aff8f" }}>
                ✔ Akce provedena
              </div>
            ) : (
              <div style={{ color: "#ff6a6a" }}>
                ✖ {actionResult.error}
              </div>
            )}
          </div>
        )}
      </section>

      <div style={{ marginTop: 16, opacity: 0.5 }}>
        Další akce, role, autorizace a workflow přijdou v D6 / D7.
      </div>
    </div>
  );
}
