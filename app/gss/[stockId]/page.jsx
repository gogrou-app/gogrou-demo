"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import gssStock from "../data/gssStock";
import gpcTools from "../../gpc/data";

import locations from "../data/locations";
import auditLog from "../data/auditLog";
import { DM_ACTIONS, applyActionToDmItem } from "../data/stateEngine";

export default function GssItemDetailPage() {
  const { stockId } = useParams();

  const initialStock = gssStock.find(
    (s) => String(s.gss_stock_id) === String(stockId)
  );

  const [stockState, setStockState] = useState(initialStock || null);

  // DM „čtečka řádek“
  const [dmInput, setDmInput] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [error, setError] = useState("");

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

  const tool = gpcTools.find(
    (t) => String(t.gpc_id) === String(stockState.gpc_id)
  );

  const items = stockState.tracking_mode === "dm" ? stockState.items : [];

  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    return items.find((i) => i.gss_item_id === selectedItemId) || null;
  }, [items, selectedItemId]);

  // ===== POČTY =====
  const newCount =
    stockState.tracking_mode === "dm"
      ? items.filter((i) => i.status === "in_stock" && i.resharpen_count === 0)
          .length
      : stockState.quantity || 0;

  const sharpenedCount =
    stockState.tracking_mode === "dm"
      ? items.filter((i) => i.status === "in_stock" && i.resharpen_count > 0)
          .length
      : 0;

  const inUseCount =
    stockState.tracking_mode === "dm"
      ? items.filter((i) => i.status !== "in_stock" && i.status !== "discarded")
          .length
      : 0;

  // audit pro tento stock (filtrujeme jen na dm kódy které jsou v této položce)
  const dmCodesInThisStock = useMemo(() => new Set(items.map((i) => i.dm_code)), [items]);

  const auditForThisStock = useMemo(() => {
    return auditLog
      .filter((a) => dmCodesInThisStock.has(a.dm_code))
      .slice()
      .reverse();
  }, [dmCodesInThisStock]);

  const auditForSelectedItem = useMemo(() => {
    if (!selectedItem?.dm_code) return [];
    return auditLog
      .filter((a) => a.dm_code === selectedItem.dm_code)
      .slice()
      .reverse();
  }, [selectedItem?.dm_code]);

  // ===== helper: vyhodnocení zda akce vyžaduje lokaci =====
  const actionRequiresLocation = (actionKey) => {
    // pokud ve stateEnginu existuje requiresLocation → respektuj
    if (DM_ACTIONS?.[actionKey]?.requiresLocation !== undefined) {
      return !!DM_ACTIONS[actionKey].requiresLocation;
    }

    // fallback logika pro demo:
    // - výroba = vyžaduje konkrétní stroj/pozici
    // - servis = vyžaduje servis lokaci
    if (actionKey === "SEND_TO_PRODUCTION") return true;
    if (actionKey === "SEND_TO_SERVICE") return true;
    return false;
  };

  const allowedActionsForItem = (item) => {
    if (!item) return [];
    return Object.entries(DM_ACTIONS || {})
      .filter(([, def]) => (def?.from || []).includes(item.status))
      .map(([key]) => key);
  };

  const locationOptionsForAction = (actionKey) => {
    if (!actionKey) return locations;

    if (actionKey === "SEND_TO_PRODUCTION") {
      return locations.filter((l) => l.type === "machine");
    }

    if (actionKey === "SEND_TO_SERVICE") {
      return locations.filter((l) => l.type === "service");
    }

    // návraty / sklad:
    return locations.filter((l) => l.type === "warehouse");
  };

  const applyAction = () => {
    setError("");

    if (!selectedItem) {
      setError("Vyber DM kus.");
      return;
    }
    if (!selectedAction) {
      setError("Vyber akci.");
      return;
    }

    const needsLoc = actionRequiresLocation(selectedAction);

    if (needsLoc && !selectedLocation) {
      setError("Vyber lokaci (povinné).");
      return;
    }

    const result = applyActionToDmItem({
      item: selectedItem,
      action: selectedAction,
      locationId: selectedLocation || selectedItem.location
    });

    if (!result.ok) {
      setError(result.error || "Akce se nepovedla");
      return;
    }

    // aktualizace kusu přímo ve stockState (demo)
    const updated = result.item;
    setStockState((prev) => {
      const next = { ...prev };
      next.items = prev.items.map((i) =>
        i.gss_item_id === updated.gss_item_id ? updated : i
      );
      return next;
    });

    // reset UI
    setSelectedAction("");
    setSelectedLocation("");
  };

  const handleDmLookup = () => {
    const trimmed = (dmInput || "").trim();
    if (!trimmed) return;

    const found = items.find((i) => i.dm_code === trimmed);
    if (!found) {
      setError("DM kód nenalezen v této položce.");
      return;
    }

    setSelectedItemId(found.gss_item_id);
    setSelectedAction("");
    setSelectedLocation("");
    setError("");
  };

  return (
    <div style={{ padding: 30, color: "white", maxWidth: 1150 }}>
      {/* NAV */}
      <div style={{ marginBottom: 20 }}>
        <Link href="/gss" style={{ color: "#4da6ff", textDecoration: "none" }}>
          ← Zpět na GSS
        </Link>
      </div>

      {/* HLAVIČKA */}
      <div
        style={{
          background: "#111",
          padding: 24,
          borderRadius: 12,
          border: "1px solid #333",
          marginBottom: 18
        }}
      >
        <h1 style={{ marginBottom: 6 }}>{tool?.name || "Neznámá položka"}</h1>

        <div style={{ opacity: 0.8, marginBottom: 8 }}>
          Typ: {tool?.type || "—"} | Režim:{" "}
          <strong>{stockState.tracking_mode.toUpperCase()}</strong>
        </div>

        <div style={{ opacity: 0.6 }}>
          Hlavní sklad: {stockState.default_location}
        </div>
      </div>

      {/* STAVOVÁ LIŠTA */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
          marginBottom: 26
        }}
      >
        <StatusBox title="Skladem – nové" value={newCount} color="#4da6ff" />
        <StatusBox title="Skladem – ostřené" value={sharpenedCount} color="#7ddc8a" />
        <StatusBox title="V oběhu" value={inUseCount} color="#ffb84d" />
      </div>

      {/* DM QUICK LOOKUP */}
      {stockState.tracking_mode === "dm" && (
        <div
          style={{
            background: "#111",
            padding: 16,
            borderRadius: 12,
            border: "1px solid #333",
            marginBottom: 18
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>
            Načti DM kód (jen info / výběr kusu)
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              value={dmInput}
              onChange={(e) => setDmInput(e.target.value)}
              placeholder="např. DM-SANDVIK-0001"
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1px solid #444",
                background: "#0b0b0b",
                color: "white",
                width: 320
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleDmLookup();
              }}
            />

            <button
              onClick={handleDmLookup}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #444",
                background: "#333",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Hledej
            </button>

            <div style={{ opacity: 0.7, fontSize: 13 }}>
              Tip: čtečka v telefonu se chová jako klávesnice → jen „napípneš“ do pole.
            </div>
          </div>
        </div>
      )}

      {/* CHYBA */}
      {error && (
        <div
          style={{
            background: "#2a0f0f",
            border: "1px solid #7a2a2a",
            padding: 12,
            borderRadius: 10,
            color: "#ffb3b3",
            marginBottom: 18
          }}
        >
          {error}
        </div>
      )}

      {/* DM PANEL */}
      {stockState.tracking_mode === "dm" && (
        <>
          <h2 style={{ marginBottom: 12 }}>DM kusy</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: 10,
              fontWeight: "bold",
              padding: "10px 14px",
              background: "#222",
              borderRadius: 8,
              marginBottom: 6
            }}
          >
            <div>DM kód</div>
            <div>Stav</div>
            <div>Lokace</div>
            <div>Přebroušení</div>
          </div>

          {items.map((item) => (
            <div
              key={item.gss_item_id}
              onClick={() => {
                setSelectedItemId(item.gss_item_id);
                setSelectedAction("");
                setSelectedLocation("");
                setError("");
              }}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                gap: 10,
                padding: "12px 14px",
                background:
                  selectedItemId === item.gss_item_id ? "#151f2b" : "#111",
                borderRadius: 8,
                marginBottom: 6,
                border: "1px solid #333",
                cursor: "pointer"
              }}
            >
              <div style={{ fontWeight: "bold" }}>{item.dm_code}</div>
              <div>{humanStatus(item.status)}</div>
              <div style={{ opacity: 0.85 }}>{humanLocation(item.location)}</div>
              <div>
                {item.resharpen_count} / {item.max_resharpen_count}
              </div>
            </div>
          ))}
        </>
      )}

      {/* AKCE */}
      {stockState.tracking_mode === "dm" && (
        <div style={{ marginTop: 26 }}>
          <h2>Akce s DM kusem</h2>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
            {/* vybraný kus */}
            <div
              style={{
                background: "#111",
                border: "1px solid #333",
                borderRadius: 12,
                padding: 14,
                minWidth: 330
              }}
            >
              <div style={{ opacity: 0.7, marginBottom: 6 }}>Vybraný kus</div>
              <div style={{ fontWeight: "bold", marginBottom: 6 }}>
                {selectedItem ? selectedItem.dm_code : "—"}
              </div>
              <div style={{ opacity: 0.8 }}>
                Stav: {selectedItem ? humanStatus(selectedItem.status) : "—"}
              </div>
              <div style={{ opacity: 0.8 }}>
                Lokace: {selectedItem ? humanLocation(selectedItem.location) : "—"}
              </div>
            </div>

            {/* výběr akce + lokace */}
            <div
              style={{
                background: "#111",
                border: "1px solid #333",
                borderRadius: 12,
                padding: 14,
                minWidth: 330
              }}
            >
              <div style={{ opacity: 0.7, marginBottom: 8 }}>Akce</div>

              <select
                value={selectedAction}
                onChange={(e) => {
                  setSelectedAction(e.target.value);
                  setSelectedLocation("");
                  setError("");
                }}
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #444",
                  background: "#0b0b0b",
                  color: "white"
                }}
                disabled={!selectedItem}
              >
                <option value="">— vyber akci —</option>
                {allowedActionsForItem(selectedItem).map((a) => (
                  <option key={a} value={a}>
                    {humanAction(a)}
                  </option>
                ))}
              </select>

              {/* lokace */}
              {selectedAction && actionRequiresLocation(selectedAction) && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ opacity: 0.7, marginBottom: 6 }}>Lokace (povinné)</div>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid #444",
                      background: "#0b0b0b",
                      color: "white"
                    }}
                  >
                    <option value="">— vyber lokaci —</option>
                    {locationOptionsForAction(selectedAction).map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={applyAction}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid #444",
                  background: "#4da6ff",
                  color: "black",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
                disabled={!selectedItem || !selectedAction}
              >
                Potvrdit akci
              </button>

              <div style={{ opacity: 0.6, marginTop: 8, fontSize: 12 }}>
                Pozn.: je to DEMO – data jsou v paměti (refresh = reset).
              </div>
            </div>
          </div>

          {/* AUDIT */}
          <div style={{ marginTop: 26 }}>
            <h2>Audit log</h2>

            <div style={{ opacity: 0.7, marginBottom: 10 }}>
              {selectedItem
                ? `Záznamy pro: ${selectedItem.dm_code}`
                : "Vyber DM kus (klik v tabulce), ať vidíš jeho historii."}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 1.3fr 1fr 1fr",
                gap: 10,
                fontWeight: "bold",
                padding: "10px 14px",
                background: "#222",
                borderRadius: 8,
                marginBottom: 6
              }}
            >
              <div>Čas</div>
              <div>Akce</div>
              <div>Stav</div>
              <div>Lokace</div>
            </div>

            {(selectedItem ? auditForSelectedItem : auditForThisStock)
              .slice(0, 12)
              .map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr 1.3fr 1fr 1fr",
                    gap: 10,
                    padding: "10px 14px",
                    background: "#111",
                    borderRadius: 8,
                    marginBottom: 6,
                    border: "1px solid #333"
                  }}
                >
                  <div style={{ opacity: 0.85 }}>
                    {new Date(a.timestamp).toLocaleString()}
                  </div>
                  <div style={{ fontWeight: "bold" }}>{humanAction(a.action)}</div>
                  <div style={{ opacity: 0.85 }}>
                    {humanStatus(a.from_status)} → {humanStatus(a.to_status)}
                  </div>
                  <div style={{ opacity: 0.85 }}>{humanLocation(a.location)}</div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== POMOCNÉ KOMPONENTY =====

function StatusBox({ title, value, color }) {
  return (
    <div
      style={{
        background: "#111",
        borderRadius: 12,
        padding: 20,
        border: `1px solid ${color}`
      }}
    >
      <div style={{ opacity: 0.7, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 36, fontWeight: "bold", color }}>{value}</div>
    </div>
  );
}

function humanStatus(status) {
  if (!status) return "—";
  switch (status) {
    case "in_stock":
      return "Skladem";
    case "in_production":
      return "Ve výrobě";
    case "service":
      return "Servis / brusírna";
    case "discarded":
      return "Vyřazeno";
    default:
      return status;
  }
}

function humanAction(action) {
  if (!action) return "—";
  switch (action) {
    case "SEND_TO_PRODUCTION":
      return "Vydat do výroby";
    case "RETURN_FROM_PRODUCTION":
      return "Vrátit z výroby";
    case "SEND_TO_SERVICE":
      return "Poslat na servis";
    case "RETURN_FROM_SERVICE":
      return "Vrátit ze servisu";
    case "DISCARD":
      return "Vyřadit";
    default:
      return action;
  }
}

function humanLocation(locId) {
  if (!locId) return "—";
  // hezký fallback pro demo
  if (locId.startsWith("warehouse:")) return locId.replace("warehouse:", "Sklad: ");
  if (locId.startsWith("machine:")) return locId.replace("machine:", "Stroj: ");
  if (locId.startsWith("service:")) return locId.replace("service:", "Servis: ");
  return locId;
}
