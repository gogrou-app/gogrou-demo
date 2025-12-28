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
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        <Card
          title="Produkty"
          desc="Nástroje, položky, varianty, GTIN"
        />

        <Card
          title="Kategorie"
          desc="Typy nástrojů, stromová struktura"
        />

        <Card
          title="Parametry"
          desc="Průměry, délky, povlaky, normy"
        />

        <Card
          title="Výrobci"
          desc="Výrobci, značky, zdroje dat"
        />

        <Card
          title="Data & modely"
          desc="Datové struktury, GPC_ID, vazby"
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
      <div style={{ opacity: 0.6, marginTop: 6 }}>
        {desc}
      </div>
    </div>
  );
}
