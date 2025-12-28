"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { gssData, addStockItemFromGPC } from "./data/gssStore";
import { gpcData } from "../gpc/data";

export default function GSSPage() {
  const { company, warehouse, setModule } = useAppContext();
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    setModule("GSS – Skladový systém");
  }, [setModule]);

  const items = gssData?.[company]?.[warehouse] || [];

  return (
    <div style={{ padding: 30, color: "white", maxWidth: 1000 }}>
      {/* HLAVIČKA KONTEXTU */}
      <div
        style={{
          opacity: 0.7,
          marginBottom: 10,
          fontSize: 13,
        }}
      >
        Firma: <b>{company}</b> • Modul: <b>GSS – Skladový systém</b> • Sklad:{" "}
        <b>{warehouse}</b>
      </div>

      <h1>GSS – Hlavní sklad</h1>
      <p style={{ opacity: 0.7 }}>Centrální sklad firmy</p>

      {/* TLAČÍTKO */}
      <button
        onClick={() => setShowPicker((v) => !v)}
        style={{
          background: "#2563eb",
          padding: "10px 16px",
          borderRadius: 8,
          fontWeight: 600,
          marginBottom: 20,
        }}
      >
        + Přidat položku do hlavního skladu
      </button>

      {/* INLINE GPC PICKER */}
      {showPicker && (
        <div
          style={{
            border: "1px solid #222",
            borderRadius: 12,
            padding: 16,
            marginBottom: 30,
            background: "#0b0b0b",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 10 }}>
            Vyber položku z katalogu (GPC)
          </div>

          {gpcData.map((tool) => (
            <div
              key={tool.id}
              onClick={() => {
                addStockItemFromGPC(tool, company, warehouse);
                setShowPicker(false);
              }}
              style={{
                padding: 12,
                borderBottom: "1px solid #1f1f1f",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 600 }}>{tool.name}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {tool.manufacturer} • {tool.type}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OBSAH SKLADU */}
      {items.length === 0 && (
        <div style={{ opacity: 0.6, marginTop: 20 }}>
          Tento sklad je zatím prázdný
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #222",
              borderRadius: 12,
              padding: 16,
              marginBottom: 10,
              background: "#0b0b0b",
            }}
          >
            <div style={{ fontWeight: 700 }}>{item.name}</div>
            <div style={{ opacity: 0.75 }}>
              Stav: <b>{item.qty} ks</b>
            </div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              MIN: {item.min ?? "—"} / MAX: {item.max ?? "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
