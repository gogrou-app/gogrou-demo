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
        padding: 16,
        marginBottom: 12,
        background: "#0b0b0b",
      }}
    >
      {/* NÁZEV */}
      <div style={{ fontSize: 16, fontWeight: 700 }}>
        {item.name}
      </div>

      {/* INFO */}
      <div style={{ fontSize: 13, opacity: 0.6, marginTop: 4 }}>
        {item.type || "Nástroj"} · GPC: {item.gpc_id}
      </div>

      {/* STAV */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 10,
          fontSize: 13,
        }}
      >
        <div>Celkem: <b>{total}</b> ks</div>
        <div>MIN: {min ?? "-"}</div>
        <div>MAX: {max ?? "-"}</div>
        <div style={{ fontWeight: "bold", color: statusColor }}>
          {statusLabel}
        </div>
      </div>

      {/* ŽIVOTNÍ CYKLUS – patří SEM (GSS) */}
      {item.service_enabled && (
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
          🔧 Brousitelný ({item.max_resharpen}×)
        </div>
      )}
    </div>
  );
}
