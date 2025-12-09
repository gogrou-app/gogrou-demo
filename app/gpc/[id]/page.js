import { tools } from "../data";

export default function Page({ params }) {
  const toolId = params.id;
  const tool = tools.find((t) => t.id === toolId);

  if (!tool) {
    return (
      <div style={{ padding: "40px" }}>
        <h1>Nástroj nenalezen</h1>
        <p>ID: {toolId}</p>

        <button
          onClick={() => window.history.back()}
          style={{
            marginTop: "20px",
            padding: "10px 15px",
            background: "#444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          ← Zpět
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>{tool.name}</h1>

      <p style={{ fontSize: "18px", opacity: 0.8, marginBottom: "20px" }}>
        Detail nástroje uloženého v GPC
      </p>

      <div
        style={{
          background: "#1a1a1a",
          padding: "25px",
          borderRadius: "8px",
          border: "1px solid #333",
          maxWidth: "600px",
        }}
      >
        <p><strong>GTIN:</strong> {tool.gtin}</p>
        <p><strong>Výrobce:</strong> {tool.manufacturer}</p>
        <p><strong>Typ:</strong> {tool.type}</p>
        <p><strong>Průměr:</strong> {tool.diameter}</p>
        <p><strong>Délka:</strong> {tool.length}</p>
        <p><strong>Povlak:</strong> {tool.coating}</p>

        <p style={{ marginTop: "15px", opacity: 0.8 }}>
          {tool.description}
        </p>
      </div>

      <button
        onClick={() => window.history.back()}
        style={{
          marginTop: "25px",
          padding: "10px 18px",
          background: "#444",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        ← Zpět
      </button>
    </div>
  );
}
