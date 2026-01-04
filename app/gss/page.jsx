"use client";

import { useMemo, useState } from "react";
import tools from "../gpc/data.js";

// ===========================
// Helpers – PREFIX
// ===========================
const generatePrefix = (companyName, existing = []) => {
  const clean = companyName
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .padEnd(2, "X")
    .slice(0, 2);

  for (let i = 1; i <= 99; i++) {
    const num = String(i).padStart(2, "0");
    const prefix = `${clean}${num}`;
    if (!existing.includes(prefix)) return prefix;
  }

  return `${clean}99`;
};

const hasValue = (v) => !(v === null || v === undefined || v === "");

const fmt = (v, unit = "") => {
  if (!hasValue(v)) return "–";
  const s = typeof v === "boolean" ? (v ? "Ano" : "Ne") : String(v);
  return unit ? `${s} ${unit}` : s;
};

// ===========================
// Page
// ===========================
export default function GSSPage() {
  // DEMO – obsazené prefixy (později z DB)
  const usedPrefixes = ["MT01", "AA01"];

  const [company, setCompany] = useState(null);
  const [name, setName] = useState("");

  // režimy práce se stavovým řádkem
  const [mode, setMode] = useState("GSS"); // GSS | GPC
  const [query, setQuery] = useState("");

  // DEMO: položky v GSS (jen gpc_id list)
  const [gssItems, setGssItems] = useState([]); // [{ gpc_id, min, max, warning, sharpen, sharpen_count, dm_mode }]

  const createCompany = () => {
    if (!name.trim()) return;
    const prefix = generatePrefix(name, usedPrefixes);

    setCompany({
      name: name.trim(),
      prefix,
      warehouses: [
        {
          id: "MAIN",
          name: "Hlavní sklad",
        },
      ],
    });
  };

  const norm = (s) => String(s || "").toLowerCase().trim();

  const isInGss = (gpc_id) => gssItems.some((x) => String(x.gpc_id) === String(gpc_id));

  const gssResults = useMemo(() => {
    if (!company) return [];
    const q = norm(query);
    if (!q) return [];

    // v demu hledáme v názvu + gpc_id + gtin jen nad položkami, které už jsou v GSS
    const ids = new Set(gssItems.map((x) => String(x.gpc_id)));
    const list = tools.filter((t) => ids.has(String(t.gpc_id)));

    return list.filter((t) => {
      const hay = [
        t.name,
        t.gpc_id,
        t.gtin,
        t.manufacturer,
        t.type,
      ]
        .filter(Boolean)
        .map((x) => norm(x))
        .join(" | ");
      return hay.includes(q);
    });
  }, [company, query, gssItems]);

  const gpcResults = useMemo(() => {
    if (!company) return [];
    const q = norm(query);
    if (!q) return [];

    // hledání v GPC: název, gpc_id, gtin (demo)
    return tools
      .filter((t) => {
        const hay = [t.name, t.gpc_id, t.gtin, t.manufacturer, t.type]
          .filter(Boolean)
          .map((x) => norm(x))
          .join(" | ");
        return hay.includes(q);
      })
      .slice(0, 20);
  }, [company, query]);

  const addToGss = (tool) => {
    const id = String(tool.gpc_id);
    if (isInGss(id)) return;

    setGssItems((prev) => [
      ...prev,
      {
        gpc_id: id,
        min: "",
        max: "",
        warning: "",
        sharpen: false,
        sharpen_count: "",
        dm_mode: false,
        note: "",
      },
    ]);
  };

  // ===========================
  // STAV A – firma neexistuje
  // ===========================
  if (!company) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 420,
            padding: 32,
            borderRadius: 16,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>
            Založení firmy
          </h1>

          <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 24 }}>
            Založením firmy vznikne automaticky Hlavní sklad
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Název firmy"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "#000",
              color: "#fff",
              marginBottom: 16,
            }}
          />

          <button
            onClick={createCompany}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              background: "#2563eb",
              color: "#fff",
              fontWeight: 800,
              border: "none",
              cursor: "pointer",
            }}
          >
            Založit firmu
          </button>
        </div>
      </div>
    );
  }

  // ===========================
  // STAV B – firma existuje
  // ===========================
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        padding: "32px 40px",
        maxWidth: 1600,
        margin: "0 auto",
      }}
    >
      {/* KONTEKST */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 14, opacity: 0.6 }}>Firma</div>
        <div style={{ fontSize: 22, fontWeight: 900 }}>
          {company.name} ({company.prefix})
        </div>
        <div style={{ fontSize: 14, opacity: 0.6, marginTop: 6 }}>
          Sklad: Hlavní sklad
          <span style={{ marginLeft: 10, opacity: 0.35 }}>(přepínač skladu později)</span>
        </div>
      </div>

      {/* STAVOVÝ ŘÁDEK */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            mode === "GSS"
              ? "Hledat v GSS (název, GPC ID, GTIN, DM)"
              : "Hledat v GPC (název, GPC ID, GTIN)"
          }
          style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: 10,
            border:
              mode === "GPC"
                ? "2px solid #7c3aed"
                : "1px solid rgba(255,255,255,0.15)",
            background:
              mode === "GPC"
                ? "rgba(124,58,237,0.10)"
                : "rgba(255,255,255,0.04)",
            color: "#fff",
            fontSize: 15,
          }}
        />

        {mode === "GSS" ? (
          <button
            onClick={() => {
              setMode("GPC");
              setQuery("");
            }}
            style={btnSecondary}
          >
            Hledat v GPC
          </button>
        ) : (
          <button
            onClick={() => {
              setMode("GSS");
              setQuery("");
            }}
            style={btnSecondary}
          >
            Zpět do GSS
          </button>
        )}

        {mode === "GPC" ? (
          <span
            style={{
              padding: "8px 10px",
              borderRadius: 999,
              background: "rgba(124,58,237,0.18)",
              border: "1px solid rgba(124,58,237,0.35)",
              color: "#c4b5fd",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 0.3,
            }}
          >
            GPC režim
          </span>
        ) : null}
      </div>

      {/* VÝSLEDKY HLEDÁNÍ */}
      {query.trim() ? (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, opacity: 0.65, marginBottom: 10 }}>
            Výsledky ({mode === "GSS" ? "GSS" : "GPC"})
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {(mode === "GSS" ? gssResults : gpcResults).map((t) => {
              const inGss = isInGss(t.gpc_id);
              return (
                <div
                  key={String(t.gpc_id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900 }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>
                      GPC ID: <b>{fmt(t.gpc_id)}</b>
                      {hasValue(t.gtin) ? (
                        <>
                          <span style={{ margin: "0 8px", opacity: 0.4 }}>•</span>
                          GTIN: <b>{fmt(t.gtin)}</b>
                        </>
                      ) : null}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.55, marginTop: 2 }}>
                      {hasValue(t.manufacturer) ? `Výrobce: ${t.manufacturer}` : "—"}
                      <span style={{ margin: "0 8px", opacity: 0.35 }}>•</span>
                      {hasValue(t.type) ? `Typ: ${t.type}` : "—"}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {mode === "GPC" ? (
                      inGss ? (
                        <span
                          style={{
                            padding: "8px 10px",
                            borderRadius: 999,
                            background: "rgba(34,197,94,0.12)",
                            border: "1px solid rgba(34,197,94,0.30)",
                            color: "rgba(187,247,208,0.95)",
                            fontSize: 12,
                            fontWeight: 900,
                          }}
                        >
                          Už v GSS
                        </span>
                      ) : (
                        <button
                          onClick={() => addToGss(t)}
                          style={btnPrimary}
                        >
                          Převzít do GSS
                        </button>
                      )
                    ) : (
                      <a
                        href={`/gpc/${t.gpc_id}`}
                        style={{
                          ...btnGhost,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        Otevřít kartu
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            {(mode === "GSS" ? gssResults : gpcResults).length === 0 ? (
              <div style={{ opacity: 0.6, padding: "10px 4px" }}>Nic nenalezeno</div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* HLAVNÍ SKLAD – PŘEHLED */}
      <div
        style={{
          padding: 24,
          borderRadius: 16,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>Hlavní sklad</div>
            <div style={{ fontSize: 13, opacity: 0.6, marginTop: 4 }}>
              Položky evidované v GSS: <b>{gssItems.length}</b>
            </div>
          </div>

          <button
            onClick={() => {
              setMode("GPC");
              setQuery("");
            }}
            style={btnSecondary}
          >
            ➕ Přidat položku z GPC
          </button>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.10)", margin: "18px 0" }} />

        {gssItems.length === 0 ? (
          <div
            style={{
              padding: 26,
              borderRadius: 14,
              border: "1px dashed rgba(255,255,255,0.18)",
              textAlign: "center",
              opacity: 0.7,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 900, marginBottom: 6 }}>
              Hlavní sklad je prázdný
            </div>
            <div style={{ fontSize: 13 }}>
              Klikni na <b>„➕ Přidat položku z GPC“</b> nebo přepni režim <b>Hledat v GPC</b>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {gssItems.map((it) => {
              const t = tools.find((x) => String(x.gpc_id) === String(it.gpc_id));
              return (
                <div
                  key={String(it.gpc_id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 12,
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900 }}>
                      {t?.name || `Položka ${it.gpc_id}`}
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>
                      GPC ID: <b>{it.gpc_id}</b>
                      {t?.gtin ? (
                        <>
                          <span style={{ margin: "0 8px", opacity: 0.4 }}>•</span>
                          GTIN: <b>{t.gtin}</b>
                        </>
                      ) : null}
                      <span style={{ margin: "0 8px", opacity: 0.4 }}>•</span>
                      Stav: <b>0 ks</b>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <a
                      href={`/gpc/${it.gpc_id}`}
                      style={{
                        ...btnGhost,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      Karta GPC
                    </a>

                    <button
                      onClick={() =>
                        setGssItems((prev) => prev.filter((x) => String(x.gpc_id) !== String(it.gpc_id)))
                      }
                      style={btnDanger}
                    >
                      Odebrat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================
// Styles
// ===========================
const btnPrimary = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(124,58,237,0.45)",
  background: "rgba(124,58,237,0.20)",
  color: "#c4b5fd",
  fontWeight: 900,
  cursor: "pointer",
};

const btnSecondary = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const btnGhost = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "transparent",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const btnDanger = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(239,68,68,0.35)",
  background: "rgba(239,68,68,0.12)",
  color: "rgba(254,202,202,0.95)",
  fontWeight: 900,
  cursor: "pointer",
};
