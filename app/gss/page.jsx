// /app/gss/page.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import tools from "../gpc/data";
import { addStockItemFromGPC, getMainWarehouseStock } from "./data/gssStore";

export default function GssPage() {
  const [stock, setStock] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState("");
  const [msg, setMsg] = useState("");
  const inputRef = useRef(null);

  // načtení skladu
  useEffect(() => {
    setStock(getMainWarehouseStock());
  }, []);

  // autofocus na input po otevření
  useEffect(() => {
    if (showAdd) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [showAdd]);

  // helper
  const norm = (v) =>
    String(v ?? "")
      .toLowerCase()
      .trim();

  // live filtrování v "GPC" (interní databázi)
  const matches = useMemo(() => {
    const q = norm(query);
    if (!q) return [];

    // omezíme počet výsledků kvůli UX
    const out = [];
    for (const t of tools) {
      const hay = [
        t.gpc_id,
        t.gtin,
        t.name,
        t.manufacturer,
        t.type,
      ]
        .map(norm)
        .join(" | ");

      if (hay.includes(q)) {
        out.push(t);
        if (out.length >= 20) break;
      }
    }
    return out;
  }, [query]);

  function refreshStock() {
    setStock(getMainWarehouseStock());
  }

  function handleAddTool(tool) {
    try {
      addStockItemFromGPC(tool);
      refreshStock();
      setMsg(`✅ Přidáno do hlavního skladu: ${tool.name}`);
      setQuery("");
      setShowAdd(false);
      setTimeout(() => setMsg(""), 2500);
    } catch (e) {
      // kdyby něco spadlo
      setMsg("❌ Nepodařilo se přidat položku.");
      setTimeout(() => setMsg(""), 2500);
    }
  }

  function onSubmit(e) {
    e.preventDefault();

    // ENTER: když je přesně 1 shoda → přidat rovnou
    if (matches.length === 1) {
      handleAddTool(matches[0]);
      return;
    }

    // když není 1 výsledek, nic nepřesměrovávat
    if (!query.trim()) return;
    setMsg(matches.length === 0 ? "❌ Položka nenalezena v databázi." : "⬇️ Vyber položku ze seznamu výsledků.");
    setTimeout(() => setMsg(""), 2500);
  }

  return (
    <div style={{ padding: 40, color: "white" }}>
      <h1 style={{ fontSize: 28, margin: 0 }}>GSS – Hlavní sklad</h1>
      <div style={{ opacity: 0.7, marginTop: 6 }}>
        Centrální sklad firmy (uživatelský pohled)
      </div>

      {/* FIXNÍ / STICKY PANEL – bez scrollu */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          paddingTop: 14,
          paddingBottom: 14,
          background: "linear-gradient(#000 85%, rgba(0,0,0,0))",
        }}
      >
        <button
          onClick={() => {
            setShowAdd((v) => !v);
            setMsg("");
          }}
          style={{
            padding: "12px 18px",
            background: "#1e90ff",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          + Přidat položku do hlavního skladu
        </button>

        {/* INLINE PŘIDÁNÍ */}
        {showAdd && (
          <div
            style={{
              marginTop: 14,
              padding: 16,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              maxWidth: 760,
            }}
          >
            <form onSubmit={onSubmit}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                🔍 Zadej název / GTIN / GPC_ID (nebo načti čtečkou)
              </div>

              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="např. 08419421 / 73-555-321-50391 / Seco 980100..."
                style={{
                  width: "100%",
                  padding: "12px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(0,0,0,0.35)",
                  color: "white",
                  outline: "none",
                  fontSize: 14,
                }}
              />

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button
                  type="submit"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    background: "rgba(255,255,255,0.12)",
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  Enter / Vyhledat
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAdd(false);
                    setQuery("");
                    setMsg("");
                  }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.18)",
                    cursor: "pointer",
                    background: "transparent",
                    color: "rgba(255,255,255,0.75)",
                    fontWeight: 700,
                  }}
                >
                  Zrušit
                </button>
              </div>
            </form>

            {/* VÝSLEDKY */}
            <div style={{ marginTop: 14 }}>
              {query.trim() && matches.length === 0 && (
                <div style={{ opacity: 0.75 }}>❌ Položka nenalezena v databázi.</div>
              )}

              {matches.length > 0 && (
                <div style={{ display: "grid", gap: 10 }}>
                  {matches.map((t) => (
                    <div
                      key={String(t.gpc_id)}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(0,0,0,0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {t.name}
                        </div>
                        <div style={{ opacity: 0.7, fontSize: 13 }}>
                          {t.manufacturer} · {t.type}
                        </div>
                        <div style={{ opacity: 0.55, fontSize: 12, marginTop: 2 }}>
                          GPC_ID: {t.gpc_id} {t.gtin ? `· GTIN: ${t.gtin}` : ""}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddTool(t)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 10,
                          border: "none",
                          cursor: "pointer",
                          background: "#22c55e",
                          color: "black",
                          fontWeight: 900,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Přidat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MESSAGE BAR */}
        {msg && (
          <div style={{ marginTop: 10, opacity: 0.9 }}>
            {msg}
          </div>
        )}
      </div>

      {/* SEZNAM POLOŽEK V HLAVNÍM SKLADU */}
      <div style={{ marginTop: 18, display: "grid", gap: 14, maxWidth: 760 }}>
        {stock.length === 0 ? (
          <div style={{ opacity: 0.7 }}>Zatím nemáš v hlavním skladu žádné položky.</div>
        ) : (
          stock.map((s) => (
            <div
              key={s.gss_stock_id}
              style={{
                padding: 18,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div style={{ fontWeight: 900 }}>{s.name}</div>
              <div style={{ opacity: 0.7, marginTop: 4 }}>Stav: {s.quantity} ks</div>
              <div style={{ opacity: 0.45, marginTop: 6, fontSize: 12 }}>
                GPC_ID: {s.gpc_id} · režim: {s.tracking_mode}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
