"use client";

import Link from "next/link";
import gssStock from "./data";
import gpcTools from "../gpc/data";

export default function GssPage() {
  return (
    <div style={{ padding: 30, color: "white" }}>
      <h1 style={{ fontSize: 32, marginBottom: 25 }}>
        GSS – Skladové položky
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {gssStock.map((stock) => {
          const tool = gpcTools.find(
            (t) => String(t.gpc_id) === String(stock.gpc_id)
          );

          return (
            <div
              key={stock.gss_stock_id}
              style={{
                background: "#111",
                padding: 16,
                borderRadius: 10,
                border: "1px solid #333",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <div style={{ fontWeight: "bold", fontSize: 18 }}>
                  {tool?.name || "Neznámá položka"}
                </div>
                <div style={{ opacity: 0.7 }}>
                  Režim: {stock.tracking_mode.toUpperCase()}
                </div>
                <div style={{ opacity: 0.7 }}>
                  Lokace: {stock.default_location}
                </div>
              </div>

              <div>
                {stock.tracking_mode === "dm" ? (
                  <div>Ks: {stock.items.length}</div>
                ) : (
                  <div>Množství: {stock.quantity}</div>
                )}
              </div>

              <Link
                href={`/gss/${stock.gss_stock_id}`}
                style={{
                  padding: "10px 14px",
                  background: "#444",
                  borderRadius: 6,
                  textDecoration: "none",
                  color: "white",
                  fontWeight: "bold"
                }}
              >
                Detail →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
