export default function GPCPage() {
  return (
    <>
      <h1>GPC – Produktový katalog</h1>
      <p style={{ opacity: 0.7, marginBottom: "24px" }}>
        Interní katalog nástrojů (DEMO režim)
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className="card">Sandvik Coromant – Vrták – monolitní TK</div>
        <div className="card">Walter – Vrták – monolitní TK</div>
        <div className="card">Seco Tools – Fréza – monolitní TK</div>
        <div className="card">ISCAR – Fréza – monolitní TK</div>
      </div>
    </>
  );
}
