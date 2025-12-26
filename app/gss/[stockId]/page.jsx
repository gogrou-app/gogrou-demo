"use client";

import { useState } from "react";
import Link from "next/link";

import gssStock, { findDmByCode } from "../data/gssStock";

export default function GssItemDetail({ params }) {
  const { stockId } = params;

  const stockItem = gssStock.find((s) => s.id === stockId);

  const [dmInput, setDmInput] = useState("");
  const [dmResult, setDmResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  function handleScan(e) {
    e.preventDefault();

    const result = findDmByCode(dmInput.trim());

    if (result) {
      setDmResult(result);
      setNotFound(false);
    } else {
      setDmResult(null);
      setNotFound(true);
    }

    setDmInput("");
  }

  if (!stockItem) {
    return <div>Položka nenalezena</div>;
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <Link href="/gss" style={{ color: "#6aa9ff" }}>
        ← Zpět na GSS
      </Link>

      <h1 style={{ marginTop: 16 }}>{stockItem.name}</h1>
      <div style={{ opacity: 0.7 }}>StockId: {stockItem.id}</div>

      {/* DM SCAN INFO */}
      <form
        onSubmit={handleScan}
        style={{
          marginTop: 24,
          padding: 16,
          border: "1px solid #333",
          borderRadius: 8
        }}
      >
        <strong>DM scan (info)</strong>

        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <input
            type="text"
            value={dmInput}
            onChange={(e) => setDmInput(e.target.value)}
            placeholder="Zadej / naskenuj DM kód"
            autoFocus
            style={{
              flex: 1,
              padding: 10,
              background: "#000",
              color: "#fff",
              border: "1px solid #444",
              borderRadius: 6
            }}
          />

          <button
            type="submit"
            style={{
              padding: "10px 16px",
              background: "#1e293b",
              color: "#fff",
              border: "1px solid #334155",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            OK
          </button>
        </div>
      </form>

      {/* VÝSLEDEK */}
      {dmResult && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            border: "1px solid #2e7d32",
            borderRadius: 8,
            background: "#061b0f"
          }}
        >
          <strong>DM nalezen</strong>

          <div style={{ marginTop: 8 }}>
            <div>DM kód: <b>{dmResult.dm_code}</b></div>
            <div>Stav: {dmResult.status}</div>
            <div>Lokace: {dmResult.location}</div>
            <div>Položka: {dmResult.stockName}</div>
          </div>
        </div>
      )}

      {notFound && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            border: "1px solid #7f1d1d",
            borderRadius: 8,
            background: "#1a0505"
          }}
        >
          ❌ DM kód nenalezen
        </div>
      )}

      <div style={{ marginTop: 24, opacity: 0.5 }}>
        (Další akce, stavový engine a pohyby přijdou v C3)
      </div>
    </div>
  );
}
