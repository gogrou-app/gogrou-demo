"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import gssStockData from "../data/gssStock";
import gpcTools from "../../gpc/data";
import auditLog from "../data/auditLog";
import { getAllowedActions, applyAction } from "../data/stateEngine";

export default function GssItemDetailPage() {
  const { stockId } = useParams();

  const stock = gssStockData.find(
    (s) => String(s.gss_stock_id) === String(stockId)
  );

  if (!stock) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        <h2>Položka nenalezena</h2>
        <Link href="/gss">← Zpět</Link>
      </div>
    );
  }

  const tool = gpcTools.find(
    (t) => String(t.gpc_id) === String(stock.gpc_id)
  );

  // ⚠️ DEMO – lokální stav DM kusů
  const [items, setItems] = useState(stock.items || []);

  // ===== HANDLER AKCE =====
  function handleAction(dmItem, action, targetLocation) {
    const updatedItem = applyAction(dmItem, action, targetLocation);

    setItems((prev) =>
      prev.map((i) =>
        i.gss_item_id === updatedItem.gss_item_id ? updatedItem : i
      )
    );

    auditLog.push({
      id: `AUD-${Date.now()}`,
      dm_code: dmItem.dm_code,
      timestamp: new Date().toISOString(),
      action,
      from_status: dmItem.status,
      to_status: updatedItem.status,
      location: targetLocation || updatedItem.location,
      user: "demo-user",
      note: ""
    });
  }

  return (
    <div style={{ padding: 30, color: "white", maxWidth: 1200 }}>
      {/* NAV */}
      <Link href="/gss" style={{ color: "#4da6ff" }}>
        ← Zpět na GSS
      </Link>

      {/* HLAVIČKA */}
      <div style={{ marginTop: 20, marginBottom: 30 }}>
        <h1>{tool?.name}</h1>
        <div style={{ opacity: 0.7 }}>
          Typ: {tool?.type} | Režim: {stock.tracking_mode.toUpperCase()}
        </div>
      </div>

      {/* DM KUSY */}
      <h2>DM kusy</h2>

      {items.map((item) => {
        const allowedActions = getAllowedActions(item.status);

        return (
          <div
            key={item.gss_item_id}
            style={{
              background: "#111",
              padding: 16,
              borderRadius: 10,
              marginBottom: 12,
              border: "1px solid #333"
            }}
          >
            <div style={{ fontWeight: "bold" }}>
              {item.dm_code}
            </div>

            <div style={{ opacity: 0.7, marginBottom: 8 }}>
              Stav: <strong>{humanStatus(item.status)}</strong> | Lokace:{" "}
              {item.location}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {allowedActions.map((action) => (
                <ActionButton
                  key={action}
                  label={actionLabels[action]}
                  onClick={() =>
                    handleAction(
                      item,
                      action,
                      defaultLocationForAction(action)
                    )
                  }
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ===== HELPERS ===== */

function ActionButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 12px",
        background: "#333",
        color: "white",
        border: "1px solid #444",
        borderRadius: 6,
        cursor: "pointer"
      }}
    >
      {label}
    </button>
  );
}

function humanStatus(status) {
  switch (status) {
    case "in_stock":
      return "Skladem";
    case "in_production":
      return "Ve výrobě";
    case "service":
      return "Servis / brusírna";
    case "retired":
      return "Vyřazený";
    default:
      return status;
  }
}

const actionLabels = {
  SEND_TO_PRODUCTION: "Vydat do výroby",
  RETURN_FROM_PRODUCTION: "Vrátit z výroby",
  SEND_TO_SERVICE: "Poslat na servis",
  RETIRE: "Vyřadit nástroj"
};

function defaultLocationForAction(action) {
  switch (action) {
    case "SEND_TO_PRODUCTION":
      return "machine:CNC_MAZAK_01";
    case "RETURN_FROM_PRODUCTION":
      return "warehouse:MAIN";
    case "SEND_TO_SERVICE":
      return "service:BRUSIRNA";
    default:
      return null;
  }
}
