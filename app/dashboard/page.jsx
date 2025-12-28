"use client";

export default function DashboardPage() {
  return (
    <div style={{ padding: 30 }}>
      <h1 style={{ marginBottom: 20 }}>Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        <Box
          title="GPC"
          desc="Produktový katalog nástrojů, GTIN, datové modely"
          href="/gpc"
        />

        <Box
          title="GSS"
          desc="Skladový systém, pohyby, minima / maxima"
          href="/gss"
        />

        <Box
          title="SmartSplit"
          desc="Skupinové nákupy a cenové akce"
          href="/smartsplit"
        />

        <Box
          title="AI"
          desc="Analytika a asistence (zatím vypnuto)"
          href="/ai"
        />
      </div>
    </div>
  );
}

function Box({ title, desc, href }) {
  return (
    <a
      href={href}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          border: "1px solid #222",
          borderRadius: 12,
          padding: 20,
          background: "#0b0b0b",
          cursor: "pointer",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: "bold" }}>{title}</div>
        <div style={{ opacity: 0.6, marginTop: 6 }}>{desc}</div>
      </div>
    </a>
  );
}
