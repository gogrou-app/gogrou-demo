import { tools } from "../data";

export default function Page({ params }) {
  const tool = tools.find((t) => String(t.id) === params.id);

  if (!tool) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Nástroj nenalezen ❌</h2>
        <p>ID: {params.id} neexistuje v databázi.</p>

        <a
          href="/gpc"
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "10px 15px",
            background: "#444",
            color: "white",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          ← Zpět na seznam
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      {/* Název nástroje */}
      <h1 style={{ marginBottom: "30px" }}>{tool.name}</h1>

      {/* HLAVNÍ KARTA S PARAMETRY */}
      <div
        style={{
          background: "#111",
          padding: "25px",
          borderRadius: "12px",
          width: "480px",
          border: "1px solid #333",
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

      {/* Obrázky */}
      {tool.image && (
        <div style={{ marginBottom: "40px" }}>
          <h2>Hlavní obrázek</h2>
          <img
            src={tool.image}
            alt={tool.name}
            style={{
              width: "260px",
              borderRadius: "10px",
              border: "1px solid #333",
              marginTop: "10px",
            }}
          />
        </div>
      )}

      {tool.drawing && (
        <div style={{ marginBottom: "60px" }}>
          <h2>Technický výkres</h2>
          <img
            src={tool.drawing}
            alt="Technický výkres"
            style={{
              width: "480px",
              borderRadius: "10px",
              border: "1px solid #333",
              marginTop: "10px",
            }}
          />
        </div>
      )}

      {/* Technické parametry */}
      <div style={{ marginTop: "40px" }}>
        <h2>Technické parametry</h2>

        <div style={{ marginTop: "15px" }}>
          {Object.entries(tool.parameters).map(([code, item]) => (
            <div
              key={code}
              style={{
                marginBottom: "10px",
                padding: "10px 15px",
                background: "#111",
                borderRadius: "8px",
                border: "1px solid #222",
                width: "480px",
              }}
            >
              <strong>{item.cz}:</strong>
              <br />
              <span style={{ color: "#4da3ff" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STICKY TLAČÍTKO – vždy viditelné */}
      <a
        href="/gpc"
        style={{
          position: "fixed",
          bottom: "25px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "14px 26px",
          background: "#555",
          color: "white",
          borderRadius: "10px",
          textDecoration: "none",
          fontSize: "18px",
          fontWeight: "500",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          zIndex: 9999,
        }}
      >
        ← Zpět na seznam
      </a>
    </div>
  );
}
