"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import gssStockData from "../data/gssStock";
import gpcTools from "../../gpc/data";

import locations from "../data/locations";
import auditLog from "../data/auditLog";
import { applyActionToDmItem, DM_STATUSES } from "../data/stateEngine";

export default function GssItemDetailPage() {
  const { stockId } = useParams();

  // ====== DEMO: držíme si lokální kopii skladu (aby šly dělat změny) ======
  const [stockState, setStockState] = useState(() => {
    const s = gssStockData.find((x) => String(x.gss_stock_id) === String(stockId));
    return s ? structuredClone(s) : null;
  });

  const [scanValue, setScanValue] = useState("");
  const [selectedDm, setSelectedDm] = useState(null); // dm_code
  const [uiError, setUiError] = useState("");
  const [uiInfo, setUiInfo] = useState("");

  // modal pro lokaci
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // např. "SEND_TO_PRODUCTION"
  const [pendingDmCode, setPendingDmCode] = useState(null);
  const [pickedLocationId, setPickedLocationId] = useState("");

  if (!stockState) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        <h2>Položka nenalezena</h2>
        <Link href="/gss" style={{ color: "#4da6ff", textDecoration: "none" }}>
          ← Zpět na GSS
        </Link>
      </div>
    );
  }

  const tool = gpcTools.find((t) => String(t.gpc_id) === String(stockState.gpc_id));

  // ====== počty ======
  const counts = useMemo(() => {
    const isDm = stockState.tracking_mode === "dm";
    if (!isDm) {
      return { newCount: stockState.quantity || 0, sharpenedCount: 0, inUseCount: 0 };
    }

    const newCount = stockState.items.filter(
      (i) => i.status === "in_stock" && i.resharpen_count === 0
    ).length;

    const sharpenedCount = stockState.items.filter(
      (i) => i.status === "in_stock" && i.resharpen_count > 0
    ).length;

    const inUseCount = stockState.items.filter((i) => i.status !== "in_stock").length;

    return { newCount, sharpenedCount, inUseCount };
  }, [stockState]);

  // ====== selected item ======
  const selectedItem = useMemo(() => {
    if (stockState.tracking_mode !== "dm") return null;
    if (!selectedDm) return null;
    return stockState.items.find((i) => i.dm_code === selectedDm) || null;
  }, [stockState, selectedDm]);

  const selectedAudit = useMemo(() => {
    if (!selectedDm) return [];
    return auditLog
      .filter((a) => a.dm_code === selectedDm)
      .slice()
      .reverse();
  }, [selectedDm]);

  // ====== DM scan / find ======
  function handleScanSubmit(e) {
    e.preventDefault();
    setUiError("");
    setUiInfo("");

    const code = scanValue.trim();
    if (!code) return;

    if (stockState.tracking_mode !== "dm") {
      setUiError("Tato položka není v DM režimu.");
      return;
    }

    const found = stockState.items.find((i) => i.dm_code === code);
    if (!found) {
      setUiError(`DM kód '${code}' v této položce neexistuje.`);
      return;
    }

    setSelectedDm(found.dm_code);
    setUiInfo(`Načteno: ${found.dm_code}`);
  }

  // ====== ACTION: vydat do výroby (KROK 3) ======
  function startSendToProduction() {
    setUiError("");
    setUiInfo("");

    if (stockState.tracking_mode !== "dm") {
      setUiError("Akce je dostupná jen pro DM režim.");
      return;
    }
    if (!selectedItem) {
      setUiError("Nejdřív vyber DM kus (klikni v tabulce nebo načti kód).");
      return;
    }
    if (selectedItem.status !== DM_STATUSES.IN_STOCK) {
      setUiError("Vydat do výroby jde jen ze stavu 'Skladem'.");
      return;
    }

    // povinná lokace → otevřeme modal
    setPendingAction("SEND_TO_PRODUCTION");
    setPendingDmCode(selectedItem.dm_code);
    setPickedLocationId("");
    setShowLocationModal(true);
  }

  function confirmLocationAndApply() {
    setUiError("");
    setUiInfo("");

    if (!pendingAction || !pendingDmCode) {
      setShowLocationModal(false);
      return;
    }
    if (!pickedLocationId) {
      setUiError("Vyber lokaci (stroj / výroba).");
      return;
    }

    setStockState((prev) => {
      const next = structuredClone(prev);

      const idx = next.items.findIndex((i) => i.dm_code === pendingDmCode);
      if (idx === -1) {
        setUiError("DM kus nenalezen (interní chyba demo).");
        return prev;
      }

      const currentItem = next.items[idx];

      const result = applyActionToDmItem({
        item: currentItem,
        action: pendingAction,
        locationId: pickedLocationId
      });

      if (!result.ok) {
        setUiError(result.error || "Akce selhala.");
        return prev;
      }

      next.items[idx] = result.item;
      return next;
    });

    setUiInfo("Hotovo: kus je ve výrobě + audit zapsán.");
    setShowLocationModal(false);
    setPendingAction(null);
    setPendingDmCode(null);
    setPickedLocationId("");
  }

  // ====== helpers ======
  function humanStatus(status) {
    switch (status) {
      case "in_stock":
        return "Skladem";
      case "in_production":
        return "Ve výrobě";
      case "service":
        return "Servis / brusírna";
      case "discarded":
        return "Vyřazen";
      default:
        return status;
    }
  }

  function locationLabel(id) {
    const l = locations.find((x) => x.id === id);
    return l ? l.label : id;
  }

  // ====== UI ======
  return (
    <div style={{ padding: 30, color: "white", maxWidth: 1150 }}>
      {/* NAV */}
      <div style={{ marginBottom: 18 }}>
        <Link
          href="/gss"
          style={{
            color: "#4da6ff",
            textDecoration: "none",
            fontWeight: "bold"
          }}
        >
          ← Zpět na GSS
        </Link>
      </div>

      {/* HLAVIČKA */}
      <div
        style={{
          background: "#111",
          padding: 22,
          borderRadius: 12,
          border: "1px solid #333",
          marginBottom: 18
        }}
      >
        <h1 style={{ margin: 0, marginBottom: 6 }}>
          {tool?.name || "Neznámá položka"}
        </h1>
        <div style={{ opacity: 0.85 }}>
          Typ: {tool?.type || "—"} | Režim:{" "}
          <strong>{String(stockState.tracking_mode).toUpperCase()}</strong>
        </div>
        <div style={{ opacity: 0.6, marginTop: 6 }}>
          Hlavní sklad: {stockState.default_location}
        </div>
      </div>

      {/* INFO/ERROR */}
      {(uiError || uiInfo) && (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #333",
            background: uiError ? "#2a1414" : "#102214",
            color: uiError ? "#ffb3b3" : "#b8ffbf"
          }}
        >
          {uiError || uiInfo}
        </div>
      )}

      {/* STAVOVÁ LIŠTA */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 14,
          marginBottom: 22
        }}
      >
        <StatusBox title="Skladem – nové" value={counts.newCount} color="#4da6ff" />
        <StatusBox title="Skladem – ostřené" value={counts.sharpenedCount} color="#7ddc8a" />
        <StatusBox title="V oběhu" value={counts.inUseCount} color="#ffb84d" />
      </div>

      {/* DM SCAN + AKCE */}
      {stockState.tracking_mode === "dm" && (
        <div
          style={{
            background: "#0f0f0f",
            border: "1px solid #333",
            borderRadius: 12,
            padding: 16,
            marginBottom: 18
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
            <form onSubmit={handleScanSubmit} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div>
                <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>Načti DM kód</div>
                <input
                  value={scanValue}
                  onChange={(e) => setScanValue(e.target.value)}
                  placeholder="DM-TEST-0001"
                  style={{
                    width: 280,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #444",
                    background: "#111",
                    color: "white",
                    outline: "none"
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #444",
                  background: "#222",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Najít
              </button>
            </form>

            <div style={{ flex: 1 }} />

            {/* KROK 3: aktivní akce */}
            <button
              onClick={startSendToProduction}
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid #2b5",
                background: "#113322",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Vydat do výroby
            </button>

            {/* ostatní zatím necháme jako disabled */}
            <button disabled style={disabledBtnStyle}>Vrátit z výroby</button>
            <button disabled style={disabledBtnStyle}>Poslat na servis</button>
            <button disabled style={{ ...disabledBtnStyle, background: "#2a1414" }}>Vyřadit nástroj</button>
          </div>

          {/* vybraná položka */}
          <div style={{ marginTop: 14, opacity: 0.85 }}>
            Vybráno:{" "}
            <strong>{selectedItem ? selectedItem.dm_code : "—"}</strong>
            {selectedItem && (
              <>
                {" "} | Stav: <strong>{humanStatus(selectedItem.status)}</strong>
                {" "} | Lokace: <strong>{locationLabel(selectedItem.location)}</strong>
              </>
            )}
          </div>
        </div>
      )}

      {/* DM PANEL */}
      {stockState.tracking_mode === "dm" && (
        <>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>DM kusy</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 2fr",
              gap: 10,
              fontWeight: "bold",
              padding: "10px 14px",
              background: "#222",
              borderRadius: 10,
              marginBottom: 6
            }}
          >
            <div>DM kód</div>
            <div>Stav</div>
            <div>Přebroušení</div>
            <div>Lokace</div>
          </div>

          {stockState.items.map((item) => {
            const isSelected = selectedDm === item.dm_code;
            return (
              <div
                key={item.gss_item_id}
                onClick={() => setSelectedDm(item.dm_code)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 2fr",
                  gap: 10,
                  padding: "12px 14px",
                  background: isSelected ? "#162033" : "#111",
                  borderRadius: 10,
                  marginBottom: 6,
                  border: isSelected ? "1px solid #4da6ff" : "1px solid #333",
                  cursor: "pointer"
                }}
              >
                <div style={{ fontWeight: "bold" }}>{item.dm_code}</div>
                <div>{humanStatus(item.status)}</div>
                <div>
                  {item.resharpen_count} / {item.max_resharpen_count}
                </div>
                <div style={{ opacity: 0.85 }}>{locationLabel(item.location)}</div>
              </div>
            );
          })}
        </>
      )}

      {/* AUDIT */}
      {stockState.tracking_mode === "dm" && (
        <div style={{ marginTop: 26 }}>
          <h2 style={{ marginBottom: 10 }}>Historie pohybů (audit)</h2>

          {!selectedDm ? (
            <div style={{ opacity: 0.7 }}>Vyber DM kus, ať zobrazím audit.</div>
          ) : selectedAudit.length === 0 ? (
            <div style={{ opacity: 0.7 }}>Pro tento DM kus zatím není audit.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {selectedAudit.map((a) => (
                <div
                  key={a.id}
                  style={{
                    background: "#111",
                    border: "1px solid #333",
                    borderRadius: 10,
                    padding: "10px 12px"
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>
                    {a.action} → {humanStatus(a.to_status)}
                  </div>
                  <div style={{ opacity: 0.75, marginTop: 4 }}>
                    {new Date(a.timestamp).toLocaleString()} | Lokace: {locationLabel(a.location)} | User: {a.user}
                  </div>
                  {a.note ? <div style={{ opacity: 0.7, marginTop: 4 }}>{a.note}</div> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: výběr lokace */}
      {showLocationModal && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <div style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
              Vyber lokaci pro výrobu
            </div>
            <div style={{ opacity: 0.75, marginBottom: 14 }}>
              (povinné) – bez lokace nejde kus vydat do výroby
            </div>

            <select
              value={pickedLocationId}
              onChange={(e) => setPickedLocationId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #444",
                background: "#111",
                color: "white",
                outline: "none"
              }}
            >
              <option value="">— vyber lokaci —</option>
              {locations
                .filter((l) => String(l.id).startsWith("machine:") || String(l.id).startsWith("production:"))
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
            </select>

            <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  setPendingAction(null);
                  setPendingDmCode(null);
                  setPickedLocationId("");
                }}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #444",
                  background: "#222",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Zrušit
              </button>

              <button
                onClick={confirmLocationAndApply}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #2b5",
                  background: "#113322",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Potvrdit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBox({ title, value, color }) {
  return (
    <div
      style={{
        background: "#111",
        borderRadius: 12,
        padding: 18,
        border: `1px solid ${color}`
      }}
    >
      <div style={{ opacity: 0.7, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 34, fontWeight: "bold", color }}>{value}</div>
    </div>
  );
}

const disabledBtnStyle = {
  padding: "12px 16px",
  borderRadius: 10,
  border: "1px solid #444",
  background: "#333",
  color: "white",
  fontWeight: "bold",
  cursor: "not-allowed",
  opacity: 0.6
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.65)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999
};

const modalCard = {
  width: 520,
  maxWidth: "92vw",
  background: "#0f0f0f",
  border: "1px solid #333",
  borderRadius: 14,
  padding: 18
};
