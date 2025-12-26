"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import gssStock from "../data/gssStock";
import locations from "../data/locations";
import auditLog from "../data/auditLog";

import {
  DM_ACTIONS,
  applyActionToDmItem
} from "../data/stateEngine";

export default function GssItemDetailPage() {
  const params = useParams();
  const stockId = params?.stockId;

  const stockItem = gssStock.find(s => s.id === stockId);

  // ==============================
  // DM SCAN (INFO ONLY)
  // ==============================
  const [dmInput, setDmInput] = useState("");
  const [dmInfo, setDmInfo] = useState(null);

  function handleDmScan(value) {
    setDmInput(value);

    const lastAudit = [...auditLog]
      .reverse()
      .find(a => a.dm_code === value);

    if (!lastAudit) {
      setDmInfo(null);
      return;
    }

    setDmInfo({
      dm_code: value,
      status: lastAudit.to_status,
      location: lastAudit.location
    });
  }

  // ==============================
  // D2 – AKCE + POVINNÁ LOKACE
  // ==============================
  const [selectedLocation, setSelectedLocation] = useState("");
  const [actionResult, setActionResult] = useState(null);

  function handleAction(actionKey) {
    if (!dmInfo) {
      alert("Nejdřív naskenuj DM kód.");
      return;
    }

    if (!selectedLocation) {
      alert("Vyber lokaci (povinné).");
      return;
    }

    const result = applyActionToDmItem({
      item: {
        dm_code: dmInfo.dm_code,
        status: dmInfo.status,
        location: dmInfo.location
      },
      action: actionKey,
      locationId: selectedLocation
    });

    setActionResult(result);

    if (result.ok) {
      setDmInfo(result.item);
    }
  }

  // ==============================
  // UI
  // ==============================
  return (
    <div>
      <a href="/gss" style={{ color: "#6ea8ff" }}>
        ← Zpět na GSS
      </a>

      <h1>{stockItem?.name || "Neznámá položka"}</h1>
      <div style={{ opacity: 0.6 }}>
        StockId: {stockId}
      </div>

      {/* ================= DM SCAN INFO ================= */}
      <div
        style={{
          marginTop: 30,
          padding: 20,
          border: "1px solid #333",
          borderRadius: 8,
          maxWidth: 420
        }}
      >
        <h3>DM scan (info)</h3>

        <input
          type="text"
          placeholder="Zadej / naskenuj DM kód"
          value={dmInput}
          onChange={e => handleDmScan(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            background: "#111",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: 4
          }}
        />

        {dmInfo && (
          <div
            style={{
              marginTop: 12,
              padding: 10,
              background: "#111",
              border: "1px solid #333",
              borderRadius: 6
            }}
          >
            <div><b>DM:</b> {dmInfo.dm_code}</div>
            <div><b>Stav:</b> {dmInfo.status}</div>
            <div><b>Lokace:</b> {dmInfo.location}</div>
          </div>
        )}
      </div>

      {/* ================= D2 – AKCE + LOKACE ================= */}
      <div
        style={{
          marginTop: 30,
          padding: 20,
          border: "1px solid #333",
          borderRadius: 8,
          maxWidth: 420
        }}
      >
        <h3>Akce s DM kusem</h3>

        {/* VÝBĚR LOKACE */}
        <label style={{ display: "block", marginBottom: 6 }}>
          Lokace (povinné)
        </label>

        <select
          value={selectedLocation}
          onChange={e => setSelectedLocation(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            background: "#111",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: 4,
            marginBottom: 12
          }}
        >
          <option value="">— vyber lokaci —</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>

        {/* DEMO AKCE */}
        <button
          onClick={() => handleAction("SEND_TO_PRODUCTION")}
          style={{
            width: "100%",
            padding: 10,
            background: "#1e40af",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Odeslat do výroby
        </button>

        {actionResult && !actionResult.ok && (
          <div style={{ color: "#ff6b6b", marginTop: 10 }}>
            {actionResult.error}
          </div>
        )}
      </div>

      {/* POZNÁMKA */}
      <div style={{ marginTop: 20, opacity: 0.5 }}>
        Další akce, role, autorizace a workflow přijdou v D3 / E.
      </div>
    </div>
  );
}
