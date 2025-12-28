export default function GPCPage() {
  return (
    <div style={{ padding: 40, color: "white" }}>
      <h1>GPC – Product Center</h1>

      <p style={{ opacity: 0.7 }}>
        Tady bude katalog nástrojů, GTIN, datové modely, parametry…
      </p>

      <div
        style={{
          marginTop: 30,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        <Card
          title="Produkty"
          desc="Řezné nástroje, upínače, měřidla"
        />
        <Card
          title="GTIN / ID"
          desc="Jednoznačná identifikace položek"
        />
        <Card
          title="Parametry"
          desc="Průměr, délka, povlak, materiál…"
        />
        <Card
          title="Data & přílohy"
          desc="PDF, výkresy, 3D modely"
        />
      </div>
    </div>
  );
}

function Card({ title, desc }) {
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
