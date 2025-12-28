export default function GPCPage() {
  return (
    <div style={{ padding: 40, color: "white" }}>
      <h1>GPC – Product Center</h1>

      <p style={{ opacity: 0.7 }}>
        Produktový katalog nástrojů, GTIN, datové modely a parametry.
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
        <strong>STAV:</strong>
        <div style={{ opacity: 0.6, marginTop: 6 }}>
          Modul připraven.  
          Zatím bez dat – slouží jako stabilní základ pro GPC.
        </div>
      </div>
    </div>
  );
}
