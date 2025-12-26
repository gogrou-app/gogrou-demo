"use client";

import { useState } from "react";
import Link from "next/link";

import gssStock from "../data/gssStock";
import auditLog from "../data/auditLog";
import locations from "../data/locations";

export default function GSSItemDetail({ params }) {
  const { stockId } = params;

  // demo – vezmeme první položku
  const stockItem = gssStock[0];

  // --- C1: DM scan (INFO ONLY) ---
  const [dmInput, setDmInput] = useState("");
  const [dmInfo, setDmInfo] = useState(null);

  const handleDmScan = () => {
    const dm = stockItem.dm_items.find(
      (item) => item.dm_code === dmInput.trim()
    );

    if (!dm) {
      setDmInfo({
        error: true,
        message: "DM kód nenalezen"
      });
      return;
    }

    setDmInfo({
      error: false,
      dm_code: dm.dm_code,
      status: dm.status,
      location: dm.location,
      sharpenings: `${dm.sharpened}/${dm.max_sharpenings}`
    });
  };

  return (
    <div>
      {/* NAVIGACE */}
      <Link
        href="/gss"
        style={{ color: "#7aa2ff", display: "inline-block", marginBottom: 16 }}
      >
        ← Zpět na GSS
      </Link>

      {/* HLAVIČKA */}
      <h1 style={{ marginBottom: 4 }}>{stockItem.name}</h1>
      <div style={{ opacity: 0.7, marginBottom: 24 }}>
        StockId: {stockId}
      </div>

      {/* C1 – DM SCAN PANEL */}
      <div
        style={{
          border: "1px solid #333",
          borderRadius: 10,
          padding: 16,
          marginBottom: 24,
          maxWidth: 480
        }}
      >
        <h3 style={{ marginBottom: 12 }}>DM scan (info)</h3>

        <input
          type="text"
          placeholder="Zadej / naskenuj DM kód"
          value={dmInput}
          onChange={(e) => setDmInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleDmScan()}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            border: "1px solid #555",
            background: "#000",
            color: "#fff",
            marginBottom: 12
          }}
        />

        {dmInfo && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 6,
              background: dmInfo.error ? "#330000" : "#111",
              border: "1px solid #333"
            }}
          >
            {dmInfo.error ? (
              <strong>{dmInfo.message}</strong>
            ) : (
              <>
                <div><strong>DM:</strong> {dmInfo.dm_code}</div>
                <div><strong>Stav:</strong> {dmInfo.status}</div>
                <div><strong>Lokace:</strong> {dmInfo.location}</div>
                <div><strong>Přebroušení:</strong> {dmInfo.sharpenings}</div>
              </>
            )}
          </div>
        )}
      </div>

      {/* DALŠÍ ČÁSTI (zatím beze změn) */}
      <p style={{ opacity: 0.5 }}>
        (Další akce, stavový engine a pohyby přijdou v C2 / C3)
      </p>
    </div>
  );
}
