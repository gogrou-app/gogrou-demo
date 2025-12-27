export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p style={{ opacity: 0.6 }}>
        Gogrou DEMO – centrální přehled
      </p>

      <div
        style={{
          marginTop: 24,
          padding: 20,
          border: "1px solid #222",
          borderRadius: 12,
          background: "#0b0b0b",
          maxWidth: 600,
        }}
      >
        <strong>Stav aplikace</strong>
        <ul style={{ marginTop: 10, opacity: 0.8 }}>
          <li>✔ GPC – katalog nástrojů</li>
          <li>✔ GSS – skladový systém</li>
          <li>⏳ SmartSplit – připravuje se</li>
          <li>⏳ AI Assistant – připravuje se</li>
        </ul>
      </div>
    </div>
  );
}
