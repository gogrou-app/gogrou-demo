"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getMainWarehouseStock,
  saveStockItem,
} from "../data/gssStore";

export default function GssStockDetailPage() {
  const { stockId } = useParams();
  const router = useRouter();

  const [item, setItem] = useState(null);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    const stock = getMainWarehouseStock();
    const found = stock.find(
      (s) => String(s.gss_stock_id) === String(stockId)
    );

    if (!found) return;

    setItem(found);
    setMin(found.min ?? "");
    setMax(found.max ?? "");
  }, [stockId]);

  if (!item) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        <h2>Položka nenalezena</h2>
        <button onClick={() => router.push("/gss")}>
          ← Zpět na sklad
        </button>
      </div>
    );
  }

  function saveLimits() {
    const updated = {
      ...item,
      min: min === "" ? null : Number(min),
      max: max === "" ? null : Number(max),
    };

    saveStockItem(updated);
    setItem(updated);
    setInfo("Uloženo");
    setTimeout(() => setInfo(""), 1500);
  }

  return (
    <div style={{ padding: 40, color: "white", maxWidth: 900 }}>
      <button
        onClick={() => router.push("/gss")}
        style={{
          marginBottom: 20,
          background: "transparent",
          color: "#aaa",
          border: "none",
          cursor: "pointer",
        }}
      >
        ← Zpět na hlavní sklad
      </button>

      <h1 style={{ fontSize: 28 }}>{item.name}</h1>

      <div style={{ opacity: 0.6, marginBottom: 20 }}>
        GSS STOCK · režim:{" "}
        <strong>{item.tracking_mode}</strong>
      </div>

      {/* STAV */}
      <div
        style={{
          border: "1px solid #222",
          borderRadius: 10,
          padding: 16,
          marginBottom: 20,
          background: "#0b0b0b",
        }}
      >
        <strong>Aktuální stav</strong>
        <div style={{ fontSize: 24, marginTop: 6 }}>
          {item.quantity} ks
        </div>
      </div>

      {/* MIN / MAX */}
      <div
        style={{
          border: "1px solid #222",
          borderRadius: 10,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <strong>Nastavení skladu</strong>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr",
            gap: 12,
            marginTop: 12,
            maxWidth: 300,
          }}
        >
          <label>MIN</label>
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder="—"
            style={inputStyle}
          />

          <label>MAX</label>
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder="—"
            style={inputStyle}
          />
        </div>

        <button
          onClick={saveLimits}
          style={{
            marginTop: 16,
            padding: "8px 14px",
            borderRadius: 6,
            background: "#2563eb",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Uložit
        </button>

        {info && (
          <div style={{ marginTop: 10, color: "#4ade80" }}>
            {info}
          </div>
        )}
      </div>

      {/* DALŠÍ KROKY (zatím vypnuté) */}
      <div
        style={{
          border: "1px dashed #333",
          borderRadius: 10,
          padding: 16,
          opacity: 0.4,
        }}
      >
        <strong>Další kroky (brzy)</strong>
        <ul>
          <li>Příjem na sklad</li>
          <li>Výdej do výroby</li>
          <li>DM režim</li>
          <li>Převody na dceřiné sklady</li>
        </ul>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "6px 8px",
  borderRadius: 6,
  border: "1px solid #333",
  background: "#000",
  color: "white",
};
