export default function Page() {
  return (
    <div style={{ padding: "40px" }}>
      <h1>GPC – Gogrou Product Center</h1>
      <p>Centrální databáze produktů. Tady bude mini-demo GPC:</p>

      <ul style={{ marginTop: "20px", fontSize: "18px", lineHeight: "1.6" }}>
        <li>Přehled nástrojů</li>
        <li>Parametry, filtry a kategorie</li>
        <li>Napojení na ToolsUnited</li>
        <li>Detail produktu (GTIN, varianty, dokumenty)</li>
      </ul>
    </div>
  );
}
