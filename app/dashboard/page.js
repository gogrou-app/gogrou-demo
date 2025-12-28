export default function DashboardPage() {
  return (
    <div style={{ padding: 40, color: "white" }}>
      <h1>Dashboard</h1>

      <p style={{ opacity: 0.7 }}>
        Přehled systému Gogrou – DEMO
      </p>

      <div
        style={{
          marginTop: 30,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <Box
          title="GPC"
          desc="Produktový katalog nástrojů, GTIN, datové modely"
        />
        <Box
          title="GSS"
          desc="Skladový systém, min/max, servis, pohyby"
        />
        <Box
          title="SmartSplit"
          desc="Skupinové nákupy a cenová optimalizace"
        />
        <Box
          title="AI (GINA)"
          desc="Analytika – zatím vypnuto"
        />
      </div>
    </div>
  );
}

function Box({ title, desc }: { title: string; desc: string }) {
  return (
    <div
      style={{
        border: "1px solid #222",
        borderRadius: 12,
        padding: 20,
        background: "#0b0b0b",
      }}
    >
      <strong>{title}</strong>
      <div style={{ opacity: 0.6, marginTop: 6 }}>{desc}</div>
    </div>
  );
}
