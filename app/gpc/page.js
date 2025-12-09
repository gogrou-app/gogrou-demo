import Link from "next/link";
import tools from "./data";

export default function GPC_List() {
  console.log("DEBUG → Render GPC list:", tools);

  return (
    <div style={{ padding: "20px" }}>
      <h1>GPC – Product Center</h1>
      <p>Ukázkový přehled nástrojů uložených v GPC:</p>

      {tools.map((tool) => (
        <div key={tool.gpc_id} className="tool-card">
          <h2>{tool.name}</h2>

          <p><strong>GTIN:</strong> {tool.gtin}</p>
          <p><strong>Výrobce:</strong> {tool.producer}</p>
          <p><strong>Průměr:</strong> {tool.parameters?.diameter || "—"} mm</p>
          <p><strong>Délka:</strong> {tool.parameters?.length || "—"} mm</p>

          <img
            src={tool.image_main}
            alt="Nástroj"
            className="tool-thumb"
            onError={(e) => {
              console.error("❌ THUMB ERROR:", tool.image_main);
              e.target.src = "/images/tools/fallback.png";
            }}
          />

          <Link href={`/gpc/${tool.gpc_id}`}>
            <button className="detail-button">Detail →</button>
          </Link>
        </div>
      ))}
    </div>
  );
}
