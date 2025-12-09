export default function Page() {
  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "20px" }}>
        GPC – Gogrou Product Center
      </h1>

      <p style={{ fontSize: "20px", opacity: 0.8 }}>
        Centrální databáze produktů. Tady bude mini-demo GPC:
      </p>

      <ul style={{ marginTop: "20px", fontSize: "18px", lineHeight: "1.6" }}>
        <li>• Přehled nástrojů</li>
        <li>• Parametry, filtry a kategorie</li>
        <li>• Napojení na ToolsUnited</li>
        <li>• Detail produktu (GTIN, varianty, dokumenty)</li>
      </ul>
    </div>
  );
}
