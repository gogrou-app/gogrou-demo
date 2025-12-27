"use client";

import { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { gssData } from "./data/gssStore";

export default function GSSPage() {
  const { company, warehouse, setModule } = useAppContext();

  useEffect(() => {
    setModule("GSS – Skladový systém");
  }, [setModule]);

  const items = gssData?.[company]?.[warehouse] || [];

  return (
    <div style={{ padding: 30, color: "white", maxWidth: 1000 }}>
      <ContextHeader />

      <h1>GSS – Hlavní sklad</h1>
      <p style={{ opacity: 0.7 }}>
        Firma: <b>{company}</b> • Sklad: <b>{warehouse}</b>
      </p>

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
              MIN: {item.min} / MAX: {item.max}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
