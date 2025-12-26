"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getGssStock } from "@/app/gss/data/gssStore";

export default function GssPage() {
  const [stock, setStock] = useState([]);

  useEffect(() => {
    const data = getGssStock();
    setStock(data);
  }, []);

  return (
    <div style={{ padding: 30, color: "white", maxWidth: 1100 }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>Hlavní sklad (GSS)</h1>

      {stock.length === 0 ? (
        <div style={{ opacity: 0.6 }}>
          Ve skladu zatím nejsou žádné položky.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {stock.map((item) => (
            <Link
              key={item.gss_stock_id}
              href={`/gss/${item.gss_stock_id}`}
              style={{
                textDecoration: "none",
                color: "white",
                border: "1px solid #333",
                borderRadius: 12,
                padding: 16,
                background: "#111",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: "bold" }}>
                {item.name}
              </div>

              <div style={{ opacity: 0.7, marginTop: 4 }}>
                Typ: {item.type} · Režim:{" "}
                <strong>{item.tracking_mode.toUpperCase()}</strong>
              </div>

              <div style={{ marginTop: 6 }}>
                Stav:{" "}
                <strong style={{ color: "#4da6ff" }}>
                  {item.quantity} ks
                </strong>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
