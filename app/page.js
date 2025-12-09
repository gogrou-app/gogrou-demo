export default function Page() {
  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "20px" }}>
        GSS – Gogrou Storage System
      </h1>

      <p style={{ fontSize: "20px", opacity: 0.8 }}>
        Inteligentní skladový systém. Tady bude mini-demo GSS:
      </p>

      <ul style={{ marginTop: "20px", fontSize: "18px", lineHeight: "1.6" }}>
        <li>• Přehled skladových položek</li>
        <li>• Stav zásob, minima / maxima</li>
        <li>• Evidence nástrojů podle DM kódu</li>
        <li>• Historie pohybů a měření</li>
        <li>• Napojení na výdejní automaty a ERP</li>
      </ul>
    </div>
  );
}
