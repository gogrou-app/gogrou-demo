export default function Page() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>Dashboard</h1>

      <p
        style={{
          marginTop: "10px",
          fontSize: "20px",
          opacity: 0.9,
        }}
      >
        Vítej v Gogrou DEMO 🚀 Toto je hlavní přehled, odkud se dostaneš do všech modulů:
      </p>

      <ul style={{ marginTop: "20px", fontSize: "18px", lineHeight: "1.6" }}>
        <li>🛠️ GPC – Product Center</li>
        <li>📦 GSS – Storage System</li>
        <li>⚡ SmartSplit – dynamické akce</li>
        <li>🤖 AI Asistent – inteligentní pomoc</li>
      </ul>
    </div>
  );
}
