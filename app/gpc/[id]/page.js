import { tools } from "../data";

export default function ToolDetail({ params }) {
  const tool = tools.find((t) => t.id.toString() === params.id);

  if (!tool) {
    return (
      <div style={{ padding: "40px" }}>
        <h1>Nástroj nenalezen</h1>
        <p>ID: {params.id} neexistuje v databázi.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
        Detail produktu
      </h1>

      <div
        style={{
          background: "#1a1a1a",
          padding: "30px",
          borderRadius: "10px",
          width: "600px",
          border: "1px solid #333",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>{tool.name}</h2>

        <p><strong>GTIN:</strong> {tool.gtin}</p>
        <p><strong>Výrobce:</strong> {tool.manufacturer}</p>
        <p><strong>Průměr:</strong> {tool.diameter}</p>
        <p><strong>Délka:</strong> {tool.length}</p>
        <p><strong>Povlak:</strong> {tool.coating}</p>

        <p style={{ marginTop: "20px", opacity: 0.8 }}>
          {tool.description}
        </p>
      </div>
    </div>
  );
}
