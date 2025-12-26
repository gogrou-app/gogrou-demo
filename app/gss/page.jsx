"use client";

import gssStock from "./data/gssStock";
import gpcTools from "../gpc/data";
import Link from "next/link";

export default function GssPage() {
  return (
    <div style={{ padding: 30, color: "white" }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>
        GSS – Hlavní sklad
      </h1>

      {/* HLAVIČKA TABULKY */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "3fr 1fr 2fr 2fr",
          gap: 12,
          padding: "12px 16px",
          background: "#222",
          borderRadius: 8,
          fontWeight: "bold",
          fontSize: 14,
          marginBottom: 10
        }}
      >
        <div>Název položky</div>
        <div>Typ</div>
        <div>Skladem (nové / ostřené)</div>
        <div>Stav</div>
      </div>

      {/* ŘÁDKY */}
      {gssStock.map((stock) => {
        const tool = gpcTools.find(
          (t) => String(t.gpc_id) === String(stock.gpc_id)
        );

        const newCount =
          stock.tracking_mode === "dm"
            ? stock.items.filter(
                (i) =>
                  i.status === "in_stock" &&
                  i.resharpen_count === 0
              ).length
            : stock.quantity;

        const sharpenedCount =
          stock.tracking_mode === "dm"
            ? stock.items.filter(
                (i) =>
                  i.status === "in_stock" &&
                  i.resharpen_count > 0
              ).length
            : 0;

        return (
          <div
            key={stock.gss_stock_id}
            style={{
              display: "grid",
              gridTemplateColumns: "3fr 1fr 2fr 2fr",
              gap: 12,
              padding: "14px 16px",
              background: "#111",
              borderRadius: 8,
              marginBottom: 6,
              alignItems: "center"
            }}
          >
            {/* NÁZEV + NATVRDO TESTOVACÍ ID */}
            <div>
              <Link
                href="/gss/STOCK-001"
                style={{
                  color: "#4da6ff",
                  textDecoration: "none",
                  fontWeight: "bold"
                }}
              >
                {tool?.name || "Neznámá položka"}
              </Link>
            </div>

            <div style={{ opacity: 0.8 }}>
              {tool?.type || "—"}
            </div>

            <div>
              <strong>{newCount}</strong> /{" "}
              <strong>{sharpenedCount}</strong>
            </div>

            <div style={{ opacity: 0.6 }}>—</div>
          </div>
        );
      })}
    </div>
  );
}
