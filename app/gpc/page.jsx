import Card from "../components/Card";

export default function GPCPage() {
  return (
    <>
      <h1>GPC – Produktový katalog</h1>
      <p style={{ opacity: 0.7, marginBottom: "24px" }}>
        Interní katalog nástrojů (DEMO režim)
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Card>Sandvik Coromant – Vrták – monolitní TK</Card>
        <Card>Walter – Vrták – monolitní TK</Card>
        <Card>Seco Tools – Fréza – monolitní TK</Card>
        <Card>ISCAR – Fréza – monolitní TK</Card>
      </div>
    </>
  );
}
