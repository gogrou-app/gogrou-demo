"use client";

export default function GssToolCard({ item }) {
  const total = item.total_qty || 0;
  const min = item.min_qty;
  const max = item.max_qty;

  let statusLabel = "OK";
  let statusColor = "#22c55e";

  if (min && total < min) {
    statusLabel = "POD MIN";
    statusColor = "#ef4444";
  } else if (max && total > max) {
    statusLabel = "NAD MAX";
    statusColor = "#f59e0b";
  }

  return (
    <div
      style={{
        border: "1px solid #222",
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 12,
        background: "#0b0b0b",
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr 1fr auto",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* LEVÁ ČÁST – NÁZEV */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          {item.name}
        </div>
        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>
          {item.type || "Nástroj"} · GPC: {item.gpc_id}
        </div>

        {item.service_enabled && (
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
            🔧 Brousitelný ({item.max_resharpen}×)
          </div>
        )}
      </div>

      {/* STŘED – POČTY */}
      <div style={{ fontSize: 13 }}>
        <div>Celkem: <b>{total}</b></div>
        <div style={{ opacity: 0.7 }}>
          MIN: {min ?? "–"} / MAX: {max ?? "–"}
        </div>
      </div>

      {/* STAV */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: statusColor,
          textAlign: "center",
        }}
      >
        {statusLabel}
      </div>

      {/* AKCE / DETAIL (připraveno do budoucna) */}
      <div
        style={{
          fontSize: 12,
          opacity: 0.6,
          cursor: "pointer",
        }}
      >
        Detail →
      </div>
    </div>
  );

