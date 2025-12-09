import Link from "next/link";
import tools from "../data";

export default function ToolDetail({ params }) {
  const toolId = params.id;

  // Debug logování
  console.log("DEBUG → Param ID:", toolId);

  const tool = tools.find((t) => t.gpc_id === toolId);

  console.log("DEBUG → Tool object:", tool);

  if (!tool) {
    console.error("❌ ERROR: Tool not found →", toolId);
    return (
      <div style={{ padding: "20px" }}>
        <h1>Nástroj nebyl nalezen</h1>
        <p>ID: {toolId}</p>

        <Link href="/gpc">
          <button className="back-button">← Zpět na seznam</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>{tool.name}</h1>
      <p><strong>GPC ID:</strong> {tool.gpc_id}</p>
      <p><strong>GTIN:</strong> {tool.gtin}</p>
      <p><strong>Výrobce:</strong> {tool.producer}</p>

      {/* Hlavní obrázek */}
      <h2>Hlavní obrázek</h2>
      <img
        src={tool.image_main}
        alt="Nástroj"
        className="tool-image"
        onError={(e) => {
          console.error("❌ Obrázek MAIN se nepodařilo načíst:", tool.image_main);
          e.target.src = "/images/tools/fallback.png";
        }}
      />

      {/* Výkres */}
      <h2>Technický výkres</h2>
      <img
        src={tool.image_drawing}
        alt="Výkres"
        className="tool-image"
        onError={(e) => {
          console.error("❌ Obrázek DRAWING se nepodařilo načíst:", tool.image_drawing);
          e.target.src = "/images/tools/fallback.png";
        }}
      />

      {/* Technické parametry */}
      <h2>Technické parametry</h2>
      <div className="param-box">
        {Object.entries(tool.parameters || {}).map(([key, value]) => (
          <div key={key} className="param-row">
            <strong>{key}:</strong> {value}
          </div>
        ))}
      </div>

      {/* Tlačítko zpět */}
      <Link href="/gpc">
        <button className="back-button">← Zpět na seznam</button>
      </Link>
    </div>
  );
}
