export default function GPCPage() {
  return (
    <div style={{ padding: 40, color: "white" }}>
      <h1>GPC</h1>

      <p style={{ opacity: 0.7 }}>
        Gogrou Product Center – DEMO
      </p>

      <div
        style={{
          marginTop: 30,
          padding: 20,
          border: "1px solid #222",
          borderRadius: 12,
          background: "#0b0b0b",
        }}
      >
        <strong>Stav:</strong>
        <div style={{ opacity: 0.6, marginTop: 6 }}>
          Základní placeholder stránky GPC.<br />
          Zde bude produktový katalog, GTIN, varianty, datové modely.
        </div>
      </div>
    </div>
  );
}
