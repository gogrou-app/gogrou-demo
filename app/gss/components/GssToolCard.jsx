"use client";

export default function GssToolCard({ item }) {
  const total = item.total ?? 0;
  const min = item.min ?? "-";
  const max = item.max ?? "-";

  let statusLabel = "OK";
  let statusColor = "#22c55e"; // green

  if (typeof min === "number" && total < min) {
    statusLabel = "POD MIN";
    statusColor = "#ef4444"; // red
  } else if (typeof max === "number" && total > max) {
    statusLabel = "NAD MAX";
    statusColor = "#f59e0b"; // orange
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderRadius: 12,
        background: "linear-gradient(180deg,#111,#0a0a0a)",
        border: "1px solid #1f1f1f",
        marginBottom: 12,
      }}
    >
      {/* LEVÁ ČÁST */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          {item.name}
        </div>

        <div style={{ fontSize: 13, opacity: 0.6 }}>
          {item.type || "Nástroj"} · GPC: {item.gpc_id}
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
          <div>Celkem: <b>{total} ks</b></div>
          <div>MIN: {min}</div>
          <div>MAX: {max}</div>
          <div style={{ fontWeight: 700, color: statusColor }}>
            {statusLabel}
          </div>
        </div>

        {item.service_enabled && (
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            🔧 Brousitelný ({item.max_resharpen}×)
          </div>
        )}
      </div>

      {/* PRAVÁ ČÁST */}
      <div>
        <button
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "8px 14px",
            borderRadius: 10,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Detail →
        </button>
      </div>
    </div>
  );
}
