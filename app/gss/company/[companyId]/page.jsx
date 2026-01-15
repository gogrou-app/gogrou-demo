"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import gpcData from "../../../gpc/data.js";

/* =========================
   HELPERS
========================= */
const norm = v => String(v || "").toLowerCase().trim();

const searchable = item =>
  [
    item.name,
    item.gpc_id,
    item.gtin,
    item.code,
    item.manufacturer,
    item.type,
  ]
    .filter(Boolean)
    .map(norm)
    .join(" | ");

/* =========================
   PAGE
========================= */
export default function CompanyGSSPage() {
  const { companyId } = useParams();

  const [company, setCompany] = useState(null);
  const [mode, setMode] = useState("GSS"); // GSS | GPC
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);

  /* ===== LOAD COMPANY ===== */
  useEffect(() => {
    const stored = localStorage.getItem("gss_companies");
    if (!stored) return;

    const companies = JSON.parse(stored);
    const found = companies.find(c => c.id === companyId);
    if (!found) return;

    setCompany(found);

    const key = `gss_wh_${companyId}_MAIN`;
    const storedItems = localStorage.getItem(key);
    setItems(storedItems ? JSON.parse(storedItems) : []);
  }, [companyId]);

  /* ===== SAVE ITEMS ===== */
  useEffect(() => {
    if (!company) return;
    const key = `gss_wh_${companyId}_MAIN`;
    localStorage.setItem(key, JSON.stringify(items));
  }, [items, company, companyId]);

  /* ===== SEARCH ===== */
  const gpcResults = useMemo(() => {
    if (mode !== "GPC" || !query.trim()) return [];
    const q = norm(query);
    return gpcData.filter(i => searchable(i).includes(q));
  }, [mode, query]);

  const gssResults = useMemo(() => {
    if (mode !== "GSS" || !query.trim()) return [];
    const q = norm(query);
    return items.filter(i => searchable(i).includes(q));
  }, [mode, query, items]);

  /* ===== ACTIONS ===== */
  const addToGSS = tool => {
    if (items.find(i => i.gpc_id === tool.gpc_id)) return;

    setItems(prev => [
      ...prev,
      {
        ...tool,
        stock: 0,
        warehouse: "MAIN",
      },
    ]);
  };

  if (!company) {
    return (
      <div style={wrap}>
        <h1>Firma nenalezena</h1>
      </div>
    );
  }

  return (
    <div style={wrap}>
      {/* CONTEXT */}
      <h1 style={title}>
        {company.name} ({company.prefix})
      </h1>
      <div style={{ opacity: 0.7, marginBottom: 16 }}>
        📦 Aktivní sklad: <b>Hlavní sklad</b>
      </div>

      {/* SEARCH BAR */}
      <div style={row}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={
            mode === "GSS"
              ? "Hledat v GSS (lokální sklad)"
              : "Hledat v GPC (celý katalog)"
          }
          style={{
            ...input,
            boxShadow:
              mode === "GPC"
                ? "0 0 0 2px rgba(124,58,237,0.9)"
                : "none",
          }}
        />

        <button
          style={btn}
          onClick={() => {
            setMode(mode === "GSS" ? "GPC" : "GSS");
            setQuery("");
          }}
        >
          {mode === "GSS" ? "🔎 Hledat v GPC" : "↩︎ Zpět do skladu"}
        </button>
      </div>

      {/* RESULTS */}
      {mode === "GPC" && (
        <div style={box}>
          <h2 style={subtitle}>Výsledky v GPC</h2>
          {gpcResults.length === 0 ? (
            <div style={{ opacity: 0.6 }}>Nic nenalezeno</div>
          ) : (
            gpcResults.map(item => (
              <div key={item.gpc_id} style={resultRow}>
                <div>
                  <b>{item.name}</b>
                  <div style={meta}>
                    {item.gpc_id} · {item.gtin}
                  </div>
                </div>
                <button style={btn} onClick={() => addToGSS(item)}>
                  Převzít do GSS
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* MAIN WAREHOUSE */}
      <div style={box}>
        <h2 style={subtitle}>Hlavní sklad</h2>
        {items.length === 0 ? (
          <div style={{ opacity: 0.6 }}>Sklad je prázdný</div>
        ) : (
          (mode === "GSS" ? gssResults : items).map(i => (
            <div key={i.gpc_id} style={resultRow}>
              <div>
                <b>{i.name}</b>
                <div style={meta}>{i.gpc_id}</div>
              </div>
              <div>0 ks</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* =========================
   STYLES
========================= */
const wrap = {
  minHeight: "100vh",
  background: "#000",
  color: "#fff",
  padding: 32,
};

const title = {
  fontSize: 26,
  fontWeight: 900,
  marginBottom: 6,
};

const subtitle = {
  fontSize: 18,
  fontWeight: 800,
  marginBottom: 10,
};

const row = {
  display: "flex",
  gap: 12,
  marginBottom: 20,
};

const input = {
  flex: 1,
  padding: 10,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "#000",
  color: "#fff",
};

const btn = {
  padding: "10px 14px",
  borderRadius: 8,
  background: "rgba(124,58,237,0.35)",
  border: "1px solid rgba(124,58,237,0.6)",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const box = {
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  padding: 16,
  marginBottom: 20,
};

const resultRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 0",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
};

const meta = {
  fontSize: 12,
  opacity: 0.6,
};
