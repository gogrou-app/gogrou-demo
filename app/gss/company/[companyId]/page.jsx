"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import gpcData from "../../../gpc/data.js";

/* =========================
   HELPERS
========================= */
const norm = v => String(v || "").toLowerCase().trim();

const searchable = item =>
  [item.name, item.gpc_id, item.gtin, item.code, item.manufacturer, item.type]
    .filter(Boolean)
    .map(norm)
    .join(" | ");

/* =========================
   PAGE
========================= */
export default function CompanyGSSPage() {
  const { companyId } = useParams();

  const [company, setCompany] = useState(null);
  const [mode, setMode] = useState("GSS");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [activeItemId, setActiveItemId] = useState(null);

  const [stockForm, setStockForm] = useState({
    qty: "",
    state: "new",
    price: "",
    reference: "",
  });

  /* ===== LOAD ===== */
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

  /* ===== SAVE ===== */
  useEffect(() => {
    if (!company) return;
    localStorage.setItem(
      `gss_wh_${companyId}_MAIN`,
      JSON.stringify(items)
    );
  }, [items, company, companyId]);

  /* ===== SEARCH ===== */
  const gpcResults = useMemo(() => {
    if (mode !== "GPC" || !query.trim()) return [];
    return gpcData.filter(i => searchable(i).includes(norm(query)));
  }, [mode, query]);

  const activeItem = items.find(i => i.gpc_id === activeItemId);

  /* ===== ACTIONS ===== */
  const addToGSS = tool => {
    if (items.find(i => i.gpc_id === tool.gpc_id)) return;

    setItems(prev => [
      ...prev,
      {
        ...tool,
        origin: "GPC",
        settings: {
          min: "",
          max: "",
          warning: "",
          dmEnabled: false,
          sharpen: { enabled: false, cycles: 0 },
        },
        stockSummary: {
          new: 0,
          resharpened: 0,
          production: 0,
          returned: 0,
        },
      },
    ]);
  };

  const updateActiveItem = (path, value) => {
    setItems(prev =>
      prev.map(i => {
        if (i.gpc_id !== activeItemId) return i;
        const c = structuredClone(i);
        let ref = c;
        for (let p of path.slice(0, -1)) ref = ref[p];
        ref[path.at(-1)] = value;
        return c;
      })
    );
  };

  const handleStockIn = () => {
    if (!stockForm.qty) return;

    updateActiveItem(
      ["stockSummary", stockForm.state],
      activeItem.stockSummary[stockForm.state] + Number(stockForm.qty)
    );

    setStockForm({
      qty: "",
      state: "new",
      price: "",
      reference: "",
    });
  };

  if (!company) return <div style={wrap}>Firma nenalezena</div>;

  return (
    <div style={wrap}>
      <h1 style={title}>{company.name} ({company.prefix})</h1>

      <div style={{ opacity: 0.7, marginBottom: 16 }}>
        📦 Aktivní sklad: <b>Hlavní sklad</b>
      </div>

      {/* SEARCH */}
      <div style={row}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={mode === "GSS" ? "Hledat v GSS" : "Hledat v GPC"}
          style={{
            ...input,
            ...(mode === "GPC" ? glowInput : {}),
            transition: "box-shadow 0.2s ease",
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

      {/* GPC */}
      {mode === "GPC" && (
        <div style={box}>
          <h2 style={subtitle}>Výsledky v GPC</h2>
          {gpcResults.map(i => (
            <div key={i.gpc_id} style={resultRow}>
              <div>
                <b>{i.name}</b>
                <div style={meta}>{i.gpc_id}</div>
              </div>
              <button style={btn} onClick={() => addToGSS(i)}>
                Převzít do GSS
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MAIN */}
      <div style={box}>
        <h2 style={subtitle}>Hlavní sklad</h2>
        {items.map(i => (
          <div
            key={i.gpc_id}
            style={{
              ...resultRow,
              cursor: "pointer",
              background:
                activeItemId === i.gpc_id
                  ? "rgba(124,58,237,0.15)"
                  : "transparent",
            }}
            onClick={() => {
              setActiveItemId(i.gpc_id);
              setMode("GSS");
            }}
          >
            <div>
              <b>{i.name}</b>
              <div style={meta}>{i.gpc_id}</div>
            </div>
            <div>
              {i.stockSummary.new +
                i.stockSummary.resharpened +
                i.stockSummary.production +
                i.stockSummary.returned} ks
            </div>
          </div>
        ))}
      </div>

      {/* DETAIL */}
      {activeItem && (
        <div style={box}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2 style={subtitle}>Nastavení položky</h2>
            <button style={btn} onClick={() => setActiveItemId(null)}>
              ✕ Zavřít
            </button>
          </div>

          <div style={grid}>
            <label>MIN</label>
            <input
              value={activeItem.settings.min}
              onChange={e =>
                updateActiveItem(["settings","min"], e.target.value)
              }
            />

            <label>MAX</label>
            <input
              value={activeItem.settings.max}
              onChange={e =>
                updateActiveItem(["settings","max"], e.target.value)
              }
            />

            <label>Výstraha</label>
            <input
              value={activeItem.settings.warning}
              onChange={e =>
                updateActiveItem(["settings","warning"], e.target.value)
              }
            />

            <label>DM sledování</label>
            <input
              type="checkbox"
              checked={activeItem.settings.dmEnabled}
              onChange={e =>
                updateActiveItem(["settings","dmEnabled"], e.target.checked)
              }
            />

            <label>Brousit</label>
            <input
              type="checkbox"
              checked={activeItem.settings.sharpen.enabled}
              onChange={e =>
                updateActiveItem(
                  ["settings","sharpen","enabled"],
                  e.target.checked
                )
              }
            />

            {activeItem.settings.sharpen.enabled && (
              <>
                <label>Počet přebroušení</label>
                <input
                  type="number"
                  value={activeItem.settings.sharpen.cycles}
                  onChange={e =>
                    updateActiveItem(
                      ["settings","sharpen","cycles"],
                      Number(e.target.value)
                    )
                  }
                />
              </>
            )}
          </div>

          <h3 style={{ marginTop: 20 }}>➕ Naskladnit</h3>

          <div style={grid}>
            <label>Kusy</label>
            <input
              type="number"
              value={stockForm.qty}
              onChange={e =>
                setStockForm({ ...stockForm, qty: e.target.value })
              }
            />

            <label>Stav</label>
            <select
              value={stockForm.state}
              onChange={e =>
                setStockForm({ ...stockForm, state: e.target.value })
              }
            >
              <option value="new">Nový</option>
              <option value="resharpened">Přebroušený</option>
              <option value="production">Z výroby</option>
              <option value="returned">Vrácený z výroby</option>
            </select>

            <label>Doklad / důvod</label>
            <input
              placeholder="DL 12345 / Počáteční stav / Zakázka XY"
              value={stockForm.reference}
              onChange={e =>
                setStockForm({ ...stockForm, reference: e.target.value })
              }
            />
          </div>

          <button style={{ ...btn, marginTop: 16 }} onClick={handleStockIn}>
            ➕ Naskladnit
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================
   STYLES
========================= */
const wrap = { minHeight: "100vh", background: "#000", color: "#fff", padding: 32 };
const title = { fontSize: 26, fontWeight: 900 };
const subtitle = { fontSize: 18, fontWeight: 800 };
const row = { display: "flex", gap: 12, marginBottom: 20 };
const input = { flex: 1, padding: 12, borderRadius: 8 };
const btn = {
  padding: "10px 14px",
  background: "rgba(124,58,237,0.35)",
  border: "1px solid rgba(124,58,237,0.6)",
  color: "#fff",
  cursor: "pointer",
};
const box = { border: "1px solid #333", padding: 16, marginBottom: 20 };
const resultRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0",
  borderBottom: "1px solid #222",
};
const meta = { fontSize: 12, opacity: 0.6 };
const grid = { display: "grid", gridTemplateColumns: "200px 1fr", gap: 10 };
const glowInput = {
  boxShadow: "0 0 0 2px rgba(124,58,237,0.9), 0 0 18px rgba(124,58,237,0.6)",
  border: "1px solid rgb(124,58,237)",
};
