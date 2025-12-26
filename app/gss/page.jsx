"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import gpcTools from "../gpc/data";
import {
  loadGssStock,
} from "./data/gssStore";

export default function GssPage() {
  const [stock, setStock] = useState([]);

  // ==================================================
  // LOAD ZE STORAGE
  // ==================================================
  useEffect(() => {
    const data = loadGssStock();
    setStock(data);
  }, []);

  return (
    <div style={{ padding: 30, color: "white" }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>
        GSS – Hlavní sklad
      </h1>

      {/* HLAVIČKA */}
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

      {/* OBSAH */}
      {stock.length === 0 && (
        <div style={{ opacity: 0.6 }}>
          Žádné položky ve skladu
        </div>
      )}

      {stock.map((s) => {
        const tool = gpcTools.find(
          (t) => t.gpc_id === s.gpc_id
        );

        const newCount =
          s.tracking_mode === "dm"
            ? s.items.filter(
                (i) =>
                  i.status === "in_stock" &&
                  i.resharpen_count === 0
              ).length
            : s.quantity || 0;

        const sharpenedCount =
          s.tracking_mode === "dm"
            ? s.items.filter(
                (i) =>
                  i.status === "in_stock" &&
                  i.resharpen_count > 0
              ).length
            : 0;

        return (
          <div
            key={s.gss_stock_id}
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
            <div>
              <Link
                href={`/gss/${s.gss_stock_id}`}
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

            <div style={{ opacity: 0.6 }}>
              {s.default_location}
            </div>
          </div>
        );
      })}
    </div>
  );
}
