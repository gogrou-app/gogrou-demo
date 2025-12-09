import { tools } from "../data";

export default function Page({ params }) {
  const tool = tools.find(t => String(t.id) === params.id);

  if (!tool) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Nástroj nenalezen</h2>
        <p>ID: {params.id} neexistuje.</p>
        <a href="/gpc" style={{ color: "#4af" }}>← Zpět na seznam</a>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 0 80px 260px", color: "white" }}>
      <h1>{tool.name}</h1>

      {/* KARTA INFORMACÍ */}
      <div
        style={{
          background: "#111",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #333",
          width: "550px",
          marginBottom: "40px",
        }}
      >
        <p><strong>GPC ID:</strong> {tool.gpc_id}</p>
        <p><strong>GTIN / Order ID:</strong> {tool.id}</p>
        <p><strong>Výrobce:</strong> {tool.manufacturer}</p>
        <p><strong>Typ:</strong> {tool.type}</p>
        <p><strong>Průměr:</strong> {tool.diameter}</p>
        <p><strong>Celková délka:</strong> {tool.overall_length}</p>
      </div>

      {/* HLAVNÍ OBRÁZEK */}
      <h2>Hlavní obrázek</h2>
      {tool.image ? (
        <img
          src={tool.image}
          alt={tool.name}
          style={{
            width: "260px",
            padding: "12px",
            background: "#000",
            borderRadius: "10px",
            border: "1px solid #333",
            marginBottom: "40px",
          }}
        />
      ) : (
        <p style={{ opacity: 0.6 }}>Obrázek není dostupný</p>
      )}

      {/* TECHNICKÝ VÝKRES */}
      <h2>Technický výkres</h2>
      {tool.drawing ? (
        <img
          src={tool.drawing}
          alt="Technický výkres"
          style={{
            width: "360px",
            padding: "15px",
            background: "#000",
            borderRadius: "10px",
            border: "1px solid #333",
            marginBottom: "40px",
          }}
        />
      ) : (
        <p style={{ opacity: 0.6 }}>Výkres není dostupný</p>
      )}

      {/* PARAMETRY */}
      <h2>Technické parametry</h2>

      {Object.entries(tool.parameters).map(([key, p]) => (
        <div
          key={key}
          style={{
            background: "#111",
            marginBottom: "10px",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #333",
            width: "500px",
          }}
        >
          <strong>{p.cz}:</strong>
          <br />
          <span style={{ color: "#4af" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}
