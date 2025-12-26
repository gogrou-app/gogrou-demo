"use client";

import { useParams } from "next/navigation";
import gssStock from "../data/gssStock";
import gpcTools from "../../gpc/data";
import Link from "next/link";

export default function GssItemDetailPage() {
  const { stockId } = useParams();

  const stock = gssStock.find(
    (s) => String(s.gss_stock_id) === String(stockId)
  );

  if (!stock) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        <h2>Položka nenalezena</h2>
        <Link href="/gss">← Zpět na GSS</Link>
      </div>
    );
  }

  const tool = gpcTools.find(
    (t) => String(t.gpc_id) === String(stock.gpc_id)
  );

  // ===== POČTY =====
  const newCount =
    stock.tracking_mode === "dm"
      ? stock.items.filter(
          (i) => i.status === "in_stock" && i.resharpen_count === 0
        ).length
      : stock.quantity;

  const sharpenedCount =
    stock.tracking_mode === "dm"
      ? stock.items.filter(
          (i) => i.status === "in_stock" && i.resharpen_count > 0
        ).length
      : 0;

  const inUseCount =
    stock.tracking_mode === "dm"
      ? stock.items.filter(
          (i) => i.status !== "in_stock"
        ).length
      : 0;

  return (
    <div style={{ padding: 30, color: "white", maxWidth: 1100 }}>
      {/* NAV */}
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/gss"
          style={{ color: "#4da6ff", textDecoration: "none" }}
        >
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
          marginBottom: 24
        }}
      >
        <h1 style={{ marginBottom: 6 }}>
          {tool?.name || "Neznámá položka"}
        </h1>

        <div style={{ opacity: 0.8, marginBottom: 8 }}>
          Typ: {tool?.type || "—"} | Režim:{" "}
          <strong>{stock.tracking_mode.toUpperCase()}</strong>
        </div>

        <div style={{ opacity: 0.6 }}>
          Hlavní sklad: {stock.default_location}
        </div>
      </div>

      {/* STAVOVÁ LIŠTA */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 16,
          marginBottom: 32
        }}
      >
        <StatusBox
          title="Skladem – nové"
          value={newCount}
          color="#4da6ff"
        />
        <StatusBox
          title="Skladem – ostřené"
          value={sharpenedCount}
          color="#7ddc8a"
        />
        <StatusBox
          title="V oběhu"
          value={inUseCount}
          color="#ffb84d"
        />
      </div>

      {/* DM PANEL */}
      {stock.tracking_mode === "dm" && (
        <>
          <h2 style={{ marginBottom: 12 }}>
            DM kusy
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
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
            <div>Přebroušení</div>
          </div>

          {stock.items.map((item) => (
            <div
              key={item.gss_item_id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr",
                gap: 10,
                padding: "12px 14px",
                background: "#111",
                borderRadius: 8,
                marginBottom: 6,
                border: "1px solid #333"
              }}
            >
              <div>{item.dm_code}</div>
              <div>{humanStatus(item.status)}</div>
              <div>
                {item.resharpen_count} / {item.max_resharpen_count}
              </div>
            </div>
          ))}
        </>
      )}

      {/* AKCE – DEMO */}
      <div style={{ marginTop: 40 }}>
        <h2>Akce (demo)</h2>

        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <ActionButton label="Vydat do výroby" />
          <ActionButton label="Vrátit z výroby" />
          <ActionButton label="Poslat na servis" />
          <ActionButton label="Vyřadit nástroj" danger />
        </div>
      </div>
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
      <div style={{ opacity: 0.7, marginBottom: 6 }}>
        {title}
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: "bold",
          color
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ActionButton({ label, danger }) {
  return (
    <button
      disabled
      style={{
        padding: "12px 16px",
        background: danger ? "#552222" : "#333",
        color: "white",
        borderRadius: 8,
        border: "1px solid #444",
        cursor: "not-allowed",
        opacity: 0.7
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
    default:
      return status;
  }
}
