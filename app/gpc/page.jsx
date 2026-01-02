"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import tools from "./data";

const STATUS = {
  active: { label: "AKTIVNÍ", bg: "#1f6f3b" },
  phasing_out: { label: "VÝBĚHOVÁ", bg: "#8a6a00" },
  discontinued: { label: "UKONČENÁ", bg: "#7a1b1b" },
};

const TYPE_OPTIONS = ["Vrták – monolitní TK", "Fréza – monolitní TK"];

export default function GPCPage() {
  const [q, setQ] = useState("");
  const [diam, setDiam] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const qq = q.toLowerCase();
    return tools.filter((t) => {
      if (qq) {
        const hay = [
          t.gpc_id,
          t.gtin,
          t.name,
          t.manufacturer,
          t.type,
          String(t.geometry?.diameter_mm ?? ""),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(qq)) return false;
      }

      if (diam) {
        if (Number(t.geometry?.diameter_mm) !== Number(diam.replace(",", "."))) return false;
      }

      if (type !== "all" && t.type !== type) return false;
      if (status !== "all" && t.status !== status) return false;

      return true;
    });
  }, [q, diam, type, status]);

  return (
    <div style={{ maxWidth: 1200 }}>
      <h1>GPC – Produktový katalog</h1>

      <div style={filters}>
        <input
          placeholder="Hledat (název, výrobce, Ø, čtečka...)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={input}
        />
        <input
          placeholder="Ø"
          value={diam}
          onChange={(e) => setDiam(e.target.value)}
          style={small}
        />
        <select value={type} onChange={(e) => setType(e.target.value)} style={select}>
          <option value="all">Všechny typy</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={select}>
          <option value="all">Všechny stavy</option>
          <option value="active">AKTIVNÍ</option>
          <option value="phasing_out">VÝBĚHOVÁ</option>
          <option value="discontinued">UKONČENÁ</option>
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.map((t) => (
          <div key={t.gpc_id} style={row}>
            <div style={thumb}>
              {t.images?.main ? (
                <img src={t.images.main} alt={t.name} style={img} />
              ) : (
                <div style={empty}>bez obrázku</div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900 }}>{t.name}</div>
              <div style={{ opacity: 0.7 }}>
                {t.manufacturer} • {t.type}
              </div>
              <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                <span style={{ ...chip, background: STATUS[t.status]?.bg }}>
                  {STATUS[t.status]?.label}
                </span>
                {t.geometry?.diameter_mm && <span style={pill}>Ø {t.geometry.diameter_mm}</span>}
              </div>
            </div>

            <Link href={`/gpc/${t.gpc_id}`} style={btn}>
              Detail →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

const filters = { display: "flex", gap: 10, marginBottom: 16 };
const input = { flex: 1, padding: 10, borderRadius: 10 };
const small = { width: 90, padding: 10, borderRadius: 10 };
const select = { padding: 10, borderRadius: 10 };

const row = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  padding: 14,
  borderRadius: 16,
  background: "rgba(255,255,255,0.05)",
};

const thumb = {
  width: 80,
  height: 80,
  borderRadius: 12,
  background: "rgba(0,0,0,0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const img = { width: "100%", height: "100%", objectFit: "contain" };
const empty = { fontSize: 12, opacity: 0.6 };
const btn = { padding: "10px 14px", borderRadius: 10, textDecoration: "none", color: "white" };

const chip = {
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
};

const pill = {
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  border: "1px solid rgba(255,255,255,0.2)",
};
