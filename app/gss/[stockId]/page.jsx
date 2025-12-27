"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  getMainWarehouseStock,
  adjustQuantity,
  setMinMax,
  getServiceSettings,
  updateServiceSettings,
  registerReturnFromProduction,
  registerSendToService,
  registerDiscard,
} from "../data/gssStore";

export default function GssStockDetailPage() {
  const { stockId } = useParams();

  const [stockItem, setStockItem] = useState(null);
  const [service, setService] = useState(null);

  const [minVal, setMinVal] = useState("");
  const [maxVal, setMaxVal] = useState("");

  const [deltaIn, setDeltaIn] = useState("");
  const [deltaOut, setDeltaOut] = useState("");

  const [panelOpen, setPanelOpen] = useState(false);
  const [uiInfo, setUiInfo] = useState("");

  function refresh() {
    const items = getMainWarehouseStock();
    const found = items.find((i) => String(i.gss_stock_id) === String(stockId));
    setStockItem(found || null);

    const s = getServiceSettings(stockId);
    setService(s || null);

    setMinVal(found?.min ?? "");
    setMaxVal(found?.max ?? "");
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockId]);

  const maxUses = useMemo(() => {
    if (!service?.sharpenable) return null;
    const mr = Number(service?.max_resharpens || 0);
    return 1 + mr; // 1× nový + X× přeostřený
  }, [service]);

  const recommendDiscard = useMemo(() => {
    if (!service?.sharpenable) return false;
    if (!maxUses) return false;
    const useCount = Number(service?.use_count || 0);
    return useCount >= maxUses;
  }, [service, maxUses]);

  if (!stockItem) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        <h2>Položka nenalezena</h2>
      </div>
    );
  }

  function updateService(partial) {
    const next = {
      sharpenable: service?.sharpenable ?? false,
      max_resharpens: service?.max_resharpens ?? 0,
      service_provider: service?.service_provider ?? "MTTM",
      note: service?.note ?? "",
      use_count: service?.use_count ?? 0,
      service_count: service?.service_count ?? 0,
      discarded_count: service?.discarded_count ?? 0,
      ...partial,
    };
    updateServiceSettings(stockId, next);
    setService(next);
  }

  // =======================
  // KROK 11: návrat z výroby
  // =======================
  function handleReturnFromProduction() {
    const next = registerReturnFromProduction(stockId);
    setService(next);
    setPanelOpen(true);
    setUiInfo("Návrat z výroby zapsán (use_count +1).");
  }

  function handleSendToService() {
    const next = registerSendToService(stockId);
    setService(next);
    setUiInfo("Zapsáno: NA SERVIS (service_count +1).");
    setPanelOpen(false);
  }

  function handleDiscard() {
    const next = registerDiscard(stockId);
    setService(next);
    setUiInfo("Zapsáno: VYŘADIT (evidenčně).");
    setPanelOpen(false);
  }

  function handleReceive() {
    const n = Number(deltaIn || 0);
    if (!n || n <= 0) return;
    adjustQuantity(stockId, n);
    setDeltaIn("");
    refresh();
    setUiInfo(`Příjem: +${n} ks.`);
  }

  function handleIssue() {
    const n = Number(deltaOut || 0);
    if (!n || n <= 0) return;
    adjustQuantity(stockId, -n);
    setDeltaOut("");
    refresh();
    setUiInfo(`Výdej: -${n} ks.`);
  }

  function handleSaveMinMax() {
    setMinMax(stockId, minVal, maxVal);
    setUiInfo("Min/Max uloženo.");
    refresh();
  }

  return (
    <div style={{ padding: 40, color: "white", maxWidth: 950 }}>
      <h1 style={{ marginBottom: 6 }}>{stockItem.name}</h1>
      <div style={{ opacity: 0.6, marginBottom: 18 }}>
        GSS STOCK · {stockItem.gpc_id}
      </div>

      {uiInfo ? (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #222",
            background: "#0b1a10",
            marginBottom: 16,
            opacity: 0.95,
          }}
        >
          {uiInfo}
        </div>
      ) : null}

      {/* STAV */}
      <div
        style={{
          border: "1px solid #222",
          borderRadius: 12,
          padding: 18,
          background: "#0b0b0b",
          marginBottom: 18,
        }}
      >
        <div style={{ fontSize: 14, opacity: 0.7 }}>Skladem</div>
        <div style={{ fontSize: 34, fontWeight: "bold" }}>
          {Number(stockItem.quantity || 0)} ks
        </div>

        {/* KROK 11: návrat z výroby */}
        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={handleReturnFromProduction}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #444",
              background: "#111",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Vrátit z výroby
          </button>

          <button
            onClick={() => setPanelOpen((v) => !v)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #444",
              background: "#111",
              color: "white",
              cursor: "pointer",
              opacity: 0.85,
            }}
          >
            Rozhodnutí (panel)
          </button>
        </div>
      </div>

      {/* PANEL: doporučení po návratu */}
      {panelOpen && (
        <div
          style={{
            border: "1px solid #333",
            borderRadius: 12,
            padding: 18,
            background: "#0f0f0f",
            marginBottom: 18,
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>
            🧠 Návrat z výroby – doporučení systému
          </div>

          <div style={{ opacity: 0.8, marginBottom: 10 }}>
            Použití:{" "}
            <strong>{Number(service?.use_count || 0)}</strong>
            {maxUses ? (
              <>
                {" "} / <strong>{maxUses}</strong> (max)
              </>
            ) : (
              <span> (bez limitu)</span>
            )}
            {" "} · Servisů: <strong>{Number(service?.service_count || 0)}</strong>
          </div>

          {service?.sharpenable ? (
            recommendDiscard ? (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #553",
                  background: "#221a10",
                  color: "#ffda9a",
                  marginBottom: 12,
                }}
              >
                ✅ Systém <strong>doporučuje vyřadit</strong> (dosažen limit použití).
                Neprovádí se automaticky.
              </div>
            ) : (
              <div style={{ opacity: 0.7, marginBottom: 12 }}>
                OK – nástroj je v limitu. Může jít na servis nebo zpět do skladu.
              </div>
            )
          ) : (
            <div style={{ opacity: 0.7, marginBottom: 12 }}>
              Nástroj není nastaven jako brousitelný (servisní logika se neaplikuje).
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={handleSendToService}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #2b5",
                background: "#113322",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              NA SERVIS
            </button>

            <button
              onClick={handleDiscard}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #633",
                background: "#2a1414",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              VYŘADIT
            </button>

            <button
              onClick={() => setPanelOpen(false)}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #444",
                background: "#111",
                color: "white",
                cursor: "pointer",
                opacity: 0.9,
              }}
            >
              ZAVŘÍT
            </button>
          </div>
        </div>
      )}

      {/* MIN / MAX */}
      <div
        style={{
          border: "1px solid #222",
          borderRadius: 12,
          padding: 18,
          background: "#0b0b0b",
          marginBottom: 18,
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: 10 }}>📉 Min / Max</div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>MIN</div>
            <input
              value={minVal}
              onChange={(e) => setMinVal(e.target.value)}
              placeholder="např. 5"
              style={inputStyle}
            />
          </div>

          <div>
            <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>MAX</div>
            <input
              value={maxVal}
              onChange={(e) => setMaxVal(e.target.value)}
              placeholder="např. 20"
              style={inputStyle}
            />
          </div>

          <button onClick={handleSaveMinMax} style={btnStyle}>
            Uložit
          </button>
        </div>
      </div>

      {/* PŘÍJEM / VÝDEJ (bez historie, jednoduché) */}
      <div
        style={{
          border: "1px solid #222",
          borderRadius: 12,
          padding: 18,
          background: "#0b0b0b",
          marginBottom: 18,
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: 10 }}>
          📦 Příjem / Výdej (jednoduše)
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>PŘÍJEM +ks</div>
            <input
              value={deltaIn}
              onChange={(e) => setDeltaIn(e.target.value)}
              placeholder="např. 10"
              style={inputStyle}
            />
          </div>
          <button onClick={handleReceive} style={btnStyle}>
            Přijmout
          </button>

          <div style={{ width: 16 }} />

          <div>
            <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>VÝDEJ -ks</div>
            <input
              value={deltaOut}
              onChange={(e) => setDeltaOut(e.target.value)}
              placeholder="např. 3"
              style={inputStyle}
            />
          </div>
          <button onClick={handleIssue} style={btnStyle}>
            Vydat
          </button>
        </div>
      </div>

      {/* SERVIS BOX (KROK 10) */}
      <div
        style={{
          border: "1px solid #222",
          borderRadius: 12,
          padding: 18,
          background: "#0b0b0b",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: 10 }}>
          🔧 Servis / ostření
        </div>

        <label style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <input
            type="checkbox"
            checked={service?.sharpenable || false}
            onChange={(e) => updateService({ sharpenable: e.target.checked })}
          />
          <span>Nástroj je brousitelný</span>
        </label>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>
              Max. přebroušení (X)
            </div>
            <input
              type="number"
              min={0}
              disabled={!service?.sharpenable}
              value={service?.max_resharpens ?? 0}
              onChange={(e) =>
                updateService({ max_resharpens: Number(e.target.value) })
              }
              style={inputStyle}
            />
            <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>
              Max použití = 1 + X
            </div>
          </div>

          <div>
            <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>
              Brusírna
            </div>
            <select
              disabled={!service?.sharpenable}
              value={service?.service_provider || "MTTM"}
              onChange={(e) => updateService({ service_provider: e.target.value })}
              style={{
                ...inputStyle,
                width: 220,
              }}
            >
              <option value="MTTM">MTTM (default)</option>
              <option value="JINA_BRUSIRNA">Jiná brusírna</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>
            Poznámka (povlak, omezení, cokoliv)
          </div>
          <textarea
            rows={3}
            disabled={!service?.sharpenable}
            value={service?.note || ""}
            onChange={(e) => updateService({ note: e.target.value })}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #333",
              background: "#000",
              color: "white",
            }}
          />
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: 140,
  padding: 10,
  borderRadius: 8,
  border: "1px solid #333",
  background: "#000",
  color: "white",
};

const btnStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #444",
  background: "#111",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};
