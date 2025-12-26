"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import gssStock from "../data/gssStock";
import locations from "../data/locations";

// ==================================================
// DETAIL GSS ITEM
// ==================================================

export default function GssItemDetail() {
  const { stockId } = useParams();
  const router = useRouter();

  const stockItem = gssStock.find((s) => s.id === stockId);

  const [dmInput, setDmInput] = useState("");
  const [dmInfo, setDmInfo] = useState(null);

  const [selectedLocation, setSelectedLocation] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // ==================================================
  // DM INFO ONLY (C1)
// ==================================================
  function handleDmInfoScan(value) {
    setDmInput(value);

    const dm = stockItem?.dm_items?.find(
      (d) => d.dm_code === value
    );

    if (!dm) {
      setDmInfo(null);
      setInfoMessage("DM kód nebyl nalezen");
      return;
    }

    setDmInfo(dm);
    setInfoMessage("");
  }

  // ==================================================
  // CONFIRM (zatím jen UI logika)
// ==================================================
  function handleConfirm() {
    if (!dmInfo) {
      setInfoMessage("Nejprve naskenuj DM kód");
      return;
    }

    if (!selectedLocation) {
      setInfoMessage("Vyber cílovou lokaci");
      return;
    }

    setInfoMessage(
      `Připraveno: DM ${dmInfo.dm_code} → ${selectedLocation}`
    );
  }

  // ==================================================
  // RENDER
// ==================================================
  if (!stockItem) {
    return (
      <div>
        <h1>Neznámá položka</h1>
        <p>StockId: {stockId}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <button
        onClick={() => router.push("/gss")}
        style={{
          background: "none",
          border: "none",
          color: "#7aa2ff",
          cursor: "pointer",
          marginBottom: 10
        }}
      >
        ← Zpět na GSS
      </button>

      <h1>{stockItem.name}</h1>
      <p>StockId: {stockItem.id}</p>

      {/* ================= DM SCAN INFO ================= */}
      <div
        style={{
          marginTop: 20,
          padding: 20,
          border: "1px solid #333",
          borderRadius: 8
        }}
      >
        <h3>DM scan (info)</h3>

        <input
          value={dmInput}
          onChange={(e) => handleDmInfoScan(e.target.value)}
          placeholder="Zadej / naskenuj DM kód"
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
            background: "#111",
            color: "#fff",
            border: "1px solid #333"
          }}
        />

        {dmInfo && (
          <div
            style={{
              marginTop: 10,
              padding: 12,
              background: "#0f0f0f",
              borderRadius: 6
            }}
          >
            <strong>DM:</strong> {dmInfo.dm_code}
            <br />
            <strong>Stav:</strong> {dmInfo.status}
            <br />
            <strong>Lokace:</strong> {dmInfo.location}
            <br />
            <strong>Přebroušení:</strong>{" "}
            {dmInfo.sharpening_count}/{dmInfo.max_sharpening}
          </div>
        )}
      </div>

      {/* ================= LOKACE ================= */}
      <div
        style={{
          marginTop: 20,
          padding: 20,
          border: "1px solid #333",
          borderRadius: 8
        }}
      >
        <h3>Cílová lokace</h3>

        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            background: "#111",
            color: "#fff",
            border: "1px solid #333"
          }}
        >
          <option value="">-- vyber lokaci --</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      {/* ================= CONFIRM ================= */}
      <div style={{ marginTop: 20 }}>
        <button
          onClick={handleConfirm}
          style={{
            padding: "10px 16px",
            background: "#7aa2ff",
            color: "#000",
            border: "none",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Potvrdit
        </button>

        {infoMessage && (
          <div style={{ marginTop: 10, color: "#aaa" }}>
            {infoMessage}
          </div>
        )}
      </div>

      <div style={{ marginTop: 30, color: "#555" }}>
        (Další akce, stavový engine a pohyby přijdou v D3 / C2)
      </div>
    </div>
  );
}
