import { tools } from "./data";
import Link from "next/link";

export default function Page() {
  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
        GPC – Product Center
      </h1>

      <p style={{ fontSize: "18px", opacity: 0.8 }}>
        Ukázkový přehled nástrojů uložených v GPC:
      </p>

      <div style={{ marginTop: "30px" }}>
        {tools.map((tool) => (
          <div
            key={tool.id}
            style={{
              background: "#1a1a1a",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #333",
              width: "500px",
            }}
          >
            <h2 style={{ marginBottom: "10px" }}>{tool.name}</h2>

            <p><strong>GTIN:</strong> {tool.gtin}</p>
            <p><strong>Výrobce:</strong> {tool.manufacturer}</p>
            <p><strong>Průměr:</strong> {tool.diameter}</p>
            <p><strong>Délka:</strong> {tool.length}</p>
            <p><strong>Povlak:</strong> {tool.coating}</p>

            <p style={{ marginTop: "10px", opacity: 0.8 }}>
              {tool.description}
            </p>

            {/* Tlačítko → Detail */}
            <Link
              href={`/gpc/${tool.id}`}
              style={{
                marginTop: "15px",
                display: "inline-block",
                padding: "10px 15px",
                background: "#444",
                color: "white",
                borderRadius: "6px",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Detail →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
