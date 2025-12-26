"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import gssStock from "../data/gssStock";
import locations from "../data/locations";
import auditLog from "../data/auditLog";

// stateEngine – očekávané exporty:
// - getAllowedActions(status) -> ["SEND_TO_PRODUCTION", ...]
// - applyAction({ status }, action) -> { status: "in_production", action: "SEND_TO_PRODUCTION" }
// - actionMeta (optional) -> { [action]: { label, needsLocation, locationFilter } }
import {
  getAllowedActions,
  applyAction,
  actionMeta,
} from "../data/stateEngine";

/**
 * DEMO: append-only audit log helper
 */
function pushAudit(entry) {
  auditLog.push(entry);
}

/**
 * Najde poslední audit pro DM kód
 */
function getLastAudit(dmCode) {
  const items = auditLog.filter((a) => a.dm_code === dmCode);
  if (items.length === 0) return null;
  // nejnovější podle timestamp (ISO)
  return items
    .slice()
    .sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))[0];
}

/**
 * DEMO: automatická inicializace DM kusu, pokud nemá žádný audit
 * - nastaví stav in_stock
 * - lokaci warehouse:MAIN
 */
function ensureInitAudit(dmCode) {
  const exists = auditLog.some((a) => a.dm_code === dmCode);
  if (exists) return;

  pushAudit({
    id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    dm_code: dmCode,
    timestamp: new Date().toISOString(),
    action: "INIT",
    from_status: null,
    to_status: "in_stock",
    location: "warehouse:MAIN",
    user: "system",
    note: "Automatická inicializace (demo)",
  });
}

/**
 * Pomocná: popisek stavu (jen demo)
 */
function statusLabel(s) {
  if (!s) return "—";
  const map = {
    in_stock: "Skladem",
    in_production: "Ve výrobě",
    in_service: "V servisu",
    scrapped: "Vyřazeno",
  };
  return map[s] || s;
}

/**
 * Lokace pro akci – filtr (demo).
 * Pokud stateEngine poskytuje actionMeta[action].locationFilter, použijeme ji.
 */
function getLocationOptionsForAction(action) {
  const meta = actionMeta?.[action];
  const filter = meta?.locationFilter;

  if (!filter) return locations;

  // filter může být:
  // - string prefix (např. "machine:")
  // - array prefixů
  if (typeof filter === "string") {
    return locations.filter((l) => (l.id || "").startsWith(filter));
  }
  if (Array.isArray(filter)) {
    return locations.filter((l) =>
      filter.some((p) => (l.id || "").startsWith(p))
    );
  }
  return locations;
}

/**
 * Bezpečně vytáhne dm_code z dm kusu (můžeš mít v datech různé názvy)
 * POŽADAVEK: "jen jedno pole = celý kód" -> používáme dm.dm_code
 */
function readDmCode(dm) {
  return dm?.dm_code || dm?.code || dm?.id || "";
}

export default function GssStockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const stockId = params?.stockId;

  // najdi skladovou kartu
  const stockItem = useMemo(() => {
    // gssStock může být pole nebo objekt – ošetříme oboje
    if (Array.isArray(gssStock)) {
      return gssStock.find((s) => String(s.id) === String(stockId)) || null;
    }
    // pokud je to objekt mapovaný podle id
    return gssStock[String(stockId)] || null;
  }, [stockId]);

  // dm kusy – ošetření různých struktur
  const rawDmItems = useMemo(() => {
    if (!stockItem) return [];
    // preferované: stockItem.dm_items
    if (Array.isArray(stockItem.dm_items)) return stockItem.dm_items;
    if (Array.isArray(stockItem.dmItems)) return stockItem.dmItems;
    if (Array.isArray(stockItem.items)) return stockItem.items;
    return [];
  }, [stockItem]);

  // Lokální UI state (v demo režimu)
  const [selectedDm, setSelectedDm] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [error, setError] = useState("");

  // 1) INIT audit pro všechny DM kusy (DEMO)
  useEffect(() => {
    rawDmItems.forEach((dm) => {
      const dmCode = readDmCode(dm);
      if (dmCode) ensureInitAudit(dmCode);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockId]);

  // 2) “obohacené” DM kusy o aktuální stav a lokaci (z auditu)
  const dmItems = useMemo(() => {
    return rawDmItems
      .map((dm) => {
        const dmCode = readDmCode(dm);
        const last = dmCode ? getLastAudit(dmCode) : null;
        return {
          ...dm,
          dm_code: dmCode, // sjednocení – JEN JEDNO pole s celým kódem
          current_status: last?.to_status || "in_stock",
          current_location: last?.location || "warehouse:MAIN",
          last_action: last?.action || "INIT",
          // demo metrika: přebroušení (pokud existuje)
          regrinds_used:
            dm?.regrinds_used ?? dm?.regrind_used ?? dm?.regrinds ?? 0,
          regrinds_max: dm?.regrinds_max ?? dm?.regrind_max ?? dm?.max_regrinds ?? 1,
        };
      })
      .filter((dm) => !!dm.dm_code);
  }, [rawDmItems]);

  // 3) Guard – když nejsou DM kusy, detail ukážeme, ale bez akcí
  const hasDm = dmItems.length > 0;

  // 4) vybraný DM objekt
  const dmObj = useMemo(() => {
    if (!selectedDm) return null;
    return dmItems.find((d) => d.dm_code === selectedDm) || null;
  }, [dmItems, selectedDm]);

  // 5) allowed actions pro vybraný DM
  const allowedActions = useMemo(() => {
    if (!dmObj) return [];
    try {
      return getAllowedActions(dmObj.current_status) || [];
    } catch {
      return [];
    }
  }, [dmObj]);

  // 6) meta pro vybranou akci
  const selectedActionMeta = useMemo(() => {
    if (!selectedAction) return null;
    return actionMeta?.[selectedAction] || null;
  }, [selectedAction]);

  // 7) lokace pro akci
  const locationOptions = useMemo(() => {
    if (!selectedAction) return [];
    return getLocationOptionsForAction(selectedAction);
  }, [selectedAction]);

  // 8) souhrnné počty (demo)
  const counts = useMemo(() => {
    const inStock = dmItems.filter((d) => d.current_status === "in_stock");
    const inProd = dmItems.filter((d) => d.current_status === "in_production");

    // demo “nové / ostřené”: podle regrinds_used
    const stockNew = inStock.filter((d) => (d.regrinds_used || 0) === 0).length;
    const stockSharpened = inStock.filter((d) => (d.regrinds_used || 0) > 0).length;

    return {
      stockNew,
      stockSharpened,
      inProd: inProd.length,
    };
  }, [dmItems]);

  function handleDoAction() {
    setError("");

    if (!dmObj) {
      setError("Vyber DM kus.");
      return;
    }
    if (!selectedAction) {
      setError("Vyber akci.");
      return;
    }

    const needsLocation = selectedActionMeta?.needsLocation ?? true; // demo: default true
    if (needsLocation && !selectedLocation) {
      setError("Vyber lokaci.");
      return;
    }

    // aplikuj state engine
    let next;
    try {
      next = applyAction({ status: dmObj.current_status }, selectedAction);
    } catch (e) {
      setError("Akci nelze provést (stateEngine odmítl přechod).");
      return;
    }

    const now = new Date().toISOString();
    pushAudit({
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      dm_code: dmObj.dm_code,
      timestamp: now,
      action: selectedAction,
      from_status: dmObj.current_status,
      to_status: next?.status || dmObj.current_status,
      location: selectedLocation || dmObj.current_location,
      user: "operator:demo",
      note: "",
    });

    // reset UI
    setSelectedAction("");
    setSelectedLocation("");

    // “refresh” – v demo je auditLog v paměti, stačí re-render,
    // ale v App Routeru někdy pomůže malý trik: změna state přes timestamp
    // (vyřeší to useMemo závislost na rawDmItems – audit čteme přímo)
  }

  if (!stockItem) {
    return (
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 10, opacity: 0.7 }}>
          <button onClick={() => router.push("/gss")} style={{ cursor: "pointer" }}>
            ← Zpět na GSS
          </button>
        </div>
        <h2>Neznámá položka</h2>
        <div style={{ opacity: 0.7 }}>StockId: {String(stockId)}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 10, opacity: 0.7 }}>
        <button onClick={() => router.push("/gss")} style={{ cursor: "pointer" }}>
          ← Zpět na GSS
        </button>
      </div>

      <div
        style={{
          border: "1px solid #222",
          borderRadius: 14,
          padding: 18,
          background: "rgba(255,255,255,0.03)",
          marginBottom: 16,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 36 }}>
          {stockItem?.name || "Neznámá položka"}
        </h1>
        <div style={{ opacity: 0.8, marginTop: 6 }}>
          Typ: {stockItem?.type || "—"} | Režim: DM
        </div>
        <div style={{ opacity: 0.6, marginTop: 2 }}>
          Hlavní sklad: {stockItem?.warehouse || "MAIN"}
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
        <div style={{ flex: 1, border: "1px solid #2b4a7a", borderRadius: 14, padding: 16 }}>
          <div style={{ opacity: 0.8 }}>Skladem – nové</div>
          <div style={{ fontSize: 34, marginTop: 6 }}>{counts.stockNew}</div>
        </div>
        <div style={{ flex: 1, border: "1px solid #2b7a44", borderRadius: 14, padding: 16 }}>
          <div style={{ opacity: 0.8 }}>Skladem – ostřené</div>
          <div style={{ fontSize: 34, marginTop: 6 }}>{counts.stockSharpened}</div>
        </div>
        <div style={{ flex: 1, border: "1px solid #7a5b2b", borderRadius: 14, padding: 16 }}>
          <div style={{ opacity: 0.8 }}>V oběhu</div>
          <div style={{ fontSize: 34, marginTop: 6 }}>{counts.inProd}</div>
        </div>
      </div>

      {/* DM kusy */}
      <h2 style={{ marginTop: 0 }}>DM kusy</h2>

      {!hasDm ? (
        <div style={{ opacity: 0.7, padding: 12, border: "1px solid #222", borderRadius: 12 }}>
          Žádné DM kusy – není co přesouvat.
        </div>
      ) : (
        <>
          <div style={{ border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr",
                gap: 0,
                padding: "10px 14px",
                background: "rgba(255,255,255,0.06)",
                fontWeight: 600,
              }}
            >
              <div>DM kód</div>
              <div>Stav</div>
              <div>Přebroušení</div>
            </div>

            {dmItems.map((d) => (
              <div
                key={d.dm_code}
                onClick={() => {
                  setSelectedDm(d.dm_code);
                  setSelectedAction("");
                  setSelectedLocation("");
                  setError("");
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr",
                  padding: "10px 14px",
                  borderTop: "1px solid #1a1a1a",
                  cursor: "pointer",
                  background:
                    selectedDm === d.dm_code ? "rgba(0,150,255,0.10)" : "transparent",
                }}
              >
                <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                  {d.dm_code}
                  <div style={{ opacity: 0.6, fontSize: 12, marginTop: 2 }}>
                    {d.current_location}
                  </div>
                </div>
                <div>{statusLabel(d.current_status)}</div>
                <div>
                  {(d.regrinds_used ?? 0)} / {(d.regrinds_max ?? 1)}
                </div>
              </div>
            ))}
          </div>

          {/* Akce */}
          <h2 style={{ marginTop: 18 }}>Akce (demo)</h2>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {/* DM select */}
            <div style={{ minWidth: 240 }}>
              <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>Vybraný DM</div>
              <select
                value={selectedDm}
                onChange={(e) => {
                  setSelectedDm(e.target.value);
                  setSelectedAction("");
                  setSelectedLocation("");
                  setError("");
                }}
                style={{ width: "100%", padding: 10, borderRadius: 10 }}
              >
                <option value="">— vyber —</option>
                {dmItems.map((d) => (
                  <option key={d.dm_code} value={d.dm_code}>
                    {d.dm_code}
                  </option>
                ))}
              </select>
            </div>

            {/* Action select */}
            <div style={{ minWidth: 260 }}>
              <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>Akce</div>
              <select
                value={selectedAction}
                onChange={(e) => {
                  setSelectedAction(e.target.value);
                  setSelectedLocation("");
                  setError("");
                }}
                disabled={!dmObj}
                style={{ width: "100%", padding: 10, borderRadius: 10 }}
              >
                <option value="">— vyber —</option>
                {allowedActions.map((a) => (
                  <option key={a} value={a}>
                    {actionMeta?.[a]?.label || a}
                  </option>
                ))}
              </select>
            </div>

            {/* Location select */}
            <div style={{ minWidth: 280 }}>
              <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>Lokace</div>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                disabled={!selectedAction}
                style={{ width: "100%", padding: 10, borderRadius: 10 }}
              >
                <option value="">— vyber —</option>
                {locationOptions.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label || l.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Execute */}
            <button
              onClick={handleDoAction}
              disabled={!dmObj || !selectedAction}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                cursor: !dmObj || !selectedAction ? "not-allowed" : "pointer",
                border: "1px solid #222",
                background: "rgba(255,255,255,0.06)",
              }}
            >
              Provést akci
            </button>

            {error ? (
              <div style={{ color: "#ff7b7b", marginLeft: 6 }}>{error}</div>
            ) : null}
          </div>

          {/* Mini audit náhled pro vybraný DM */}
          {dmObj ? (
            <div style={{ marginTop: 18 }}>
              <h3 style={{ marginBottom: 8 }}>Historie (vybraný DM)</h3>
              <div style={{ border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
                {auditLog
                  .filter((a) => a.dm_code === dmObj.dm_code)
                  .slice()
                  .sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))
                  .slice(0, 8)
                  .map((a) => (
                    <div
                      key={a.id}
                      style={{
                        padding: "10px 14px",
                        borderTop: "1px solid #1a1a1a",
                        opacity: 0.9,
                      }}
                    >
                      <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                        {a.timestamp}
                      </div>
                      <div style={{ opacity: 0.8 }}>
                        {a.action} | {a.from_status ?? "—"} → {a.to_status} | {a.location}
                      </div>
                      {a.note ? <div style={{ opacity: 0.6 }}>{a.note}</div> : null}
                    </div>
                  ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
