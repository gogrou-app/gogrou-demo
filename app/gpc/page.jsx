"use client";

export default function GpcPage() {
  return (
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>
        GPC – Produktový katalog
      </h1>

      <p style={{ opacity: 0.7, marginBottom: 24 }}>
        Interní katalog nástrojů (DEMO režim)
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={cardStyle}>
          Sandvik Coromant – Vrták – monolitní TK
        </div>

        <div style={cardStyle}>
          Walter – Vrták – monolitní TK
        </div>

        <div style={cardStyle}>
          Seco Tools – Fréza – monolitní TK
        </div>

        <div style={cardStyle}>
          ISCAR – Fréza – monolitní TK
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  padding: 16,
  borderRadius: 14,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
};
