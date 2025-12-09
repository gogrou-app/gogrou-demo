export default function Page() {
  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "20px" }}>
        Dashboard
      </h1>

      <p style={{ fontSize: "20px", opacity: 0.8 }}>
        Vítej v Gogrou DEMO 🚀  
        Toto je hlavní přehled, odkud se dostaneš do všech modulů:
      </p>

      <ul style={{ marginTop: "20px", fontSize: "18px", lineHeight: "1.6" }}>
        <li>🔧 GPC – Product Center</li>
        <li>📦 GSS – Storage System</li>
        <li>⚡ SmartSplit – dynamické akce</li>
        <li>🤖 AI Asistent – inteligentní pomoc</li>
      </ul>
    </div>
  );
}
