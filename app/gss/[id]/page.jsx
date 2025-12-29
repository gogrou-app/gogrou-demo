"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getStockItemById,
  receiveStock,
  issueStock,
  sendToSharpening,
} from "../data/gssStore";

export default function GSSDetailPage() {
  const { id } = useParams();
  const item = getStockItemById(id);

  if (!item) {
    return (
      <div style={{ padding: 30, color: "white" }}>
        Položka nenalezena
      </div>
    );
  }

  return (
    <div style={{ padding: 30, color: "white", maxWidth: 900 }}>
      <Link href="/gss" style={{ opacity: 0.6 }}>← Zpět do skladu</Link>

      <h1 style={{ marginTop: 20 }}>{item.name}</h1>
      <div style={{ opacity: 0.7 }}>{item.type}</div>

      {/* STAV */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <Stat label="🆕 Nové" value={item.qty_new} />
        <Stat label="🔧 Broušené" value={item.qty_sharpened} />
        <Stat label="↩️ Použité" value={item.qty_used} />
      </div>

      {/* INFO */}
      <div style={{ marginTop: 20, fontSize: 14, opacity: 0.7 }}>
        Brousitelný: {item.sharpenable ? `ANO (${item.max_cycles}×)` : "NE"}
      </div>

      {/* AKCE */}
      <div style={{ marginTop: 30, display: "flex", gap: 12 }}>
        <Action
          label="+ Příjem"
          onClick={() => receiveStock(id, 1)}
        />
        <Action
          label="− Výdej"
          onClick={() => issueStock(id, 1)}
        />
        <Action
          label="🔧 Na broušení"
          onClick={() => sendToSharpening(id)}
        />
      </div>

      <div style={{ marginTop: 20, opacity: 0.5 }}>
        (DEMO: změny jsou lokální v paměti)
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div
      style={{
        border: "1px solid #222",
        borderRadius: 10,
        padding: 14,
        minWidth: 120,
        background: "#0b0b0b",
      }}
    >
      <div style={{ fontSize: 13, opacity: 0.6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Action({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 16px",
        background: "#1a1a1a",
        border: "1px solid #333",
        borderRadius: 8,
        color: "white",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
