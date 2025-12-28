"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import tools from "./data";

export default function GpcPage() {
  const [q, setQ] = useState("");
  const [manufacturer, setManufacturer] = useState("ALL");
  const [type, setType] = useState("ALL");

  const manufacturers = useMemo(() => {
    const s = new Set();
    tools.forEach((t) => t.manufacturer && s.add(t.manufacturer));
    return ["ALL", ...Array.from(s).sort()];
  }, []);

  const types = useMemo(() => {
    const s = new Set();
    tools.forEach((t) => t.type && s.add(t.type));
    return ["ALL", ...Array.from(s).sort()];
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return tools.filter((t) => {
      if (manufacturer !== "ALL" && t.manufacturer !== manufacturer) return false;
      if (type !== "ALL" && t.type !== type) return false;

      if (!qq) return true;

      const hay = [
        t.name,
        t.gpc_id,
        t.gtin,
        t.manufacturer,
        t.type,
        String(t.geometry?.diameter_mm ?? ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(qq);
    });
  }, [q, manufacturer, type]);

  return (
    <div style={{ padding: 30, color: "white", maxWidth: 1200 }}>
      <h1 style={{ margin: 0 }}>GPC – Produktový katalog</h1>
      <p style={{ opacity: 0.7, marginTop: 8 }}>
        Katalog nástrojů (demo). Zde zákazník prohlíží položky, které později přidává do GSS.
      </p>

      {/* TOOLBAR */}
      <div
        style={{
          marginTop: 18,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          padding: 14,
          borderRadius: 12,
          border: "1px solid #222",
          background: "#0b0b0b",
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Hledat: název / GTIN / GPC_ID / průměr…"
          style={input}
        />

        <select value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} style={select}>
          {manufacturers.map((m) => (
            <option key={m} value={m}>
              {m === "ALL" ? "Výrobce: všichni" : m}
            </option>
          ))}
        </select>

        <select value={type} onChange={(e) => setType(e.target.value)} style={select}>
          {types.map((t) => (
            <option key={t} value={t}>
              {t === "ALL" ? "Typ: všechny" : t}
            </option>
          ))}
        </select>

        <div style={{ opacity: 0.7, marginLeft: "auto" }}>
          Položek: <b>{filtered.length}</b>
        </div>
      </div>

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 14,
          marginTop: 18,
        }}
      >
        {filtered.map((t) => (
          <Link
            key={t.gpc_id}
            href={`/gpc/${encodeURIComponent(t.gpc_id)}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                border: "1px solid #222",
                borderRadius: 14,
                background: "#0b0b0b",
                overflow: "hidden",
                cursor: "pointer",
                transition: "transform 0.08s ease",
              }}
            >
              <div
                style={{
                  height: 160,
                  background: "#060606",
                  borderBottom: "1px solid #111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {t.image_main ? (
                  <img
                    src={t.image_main}
                    alt={t.name}
                    style={{ maxWidth: "92%", maxHeight: "92%", objectFit: "contain" }}
                  />
                ) : (
                  <div style={{ opacity: 0.5, fontSize: 12 }}>bez obrázku</div>
                )}
              </div>

              <div style={{ padding: 14 }}>
                <div style={{ fontWeight: 800, lineHeight: 1.25, marginBottom: 8 }}>
                  {t.name}
                </div>

                <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>
                  {t.manufacturer} • {t.type}
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Badge label={`GPC_ID: ${t.gpc_id}`} />
                  {t.gtin ? <Badge label={`GTIN: ${t.gtin}`} /> : <Badge label="GTIN: —" />}
                  {t.geometry?.diameter_mm != null ? (
                    <Badge label={`⌀ ${t.geometry.diameter_mm} mm`} />
                  ) : (
                    <Badge label="⌀ —" />
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ marginTop: 20, opacity: 0.6 }}>Nic nenalezeno.</div>
      )}
    </div>
  );
}

function Badge({ label }) {
  return (
    <span
      style={{
        fontSize: 12,
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid #222",
        background: "#000",
        opacity: 0.9,
      }}
    >
      {label}
    </span>
  );
}

const input = {
  flex: "1 1 360px",
  padding: 10,
  borderRadius: 10,
  border: "1px solid #333",
  background: "#000",
  color: "white",
  outline: "none",
};

const select = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #333",
  background: "#000",
  color: "white",
};
