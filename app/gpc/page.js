import Link from "next/link";
import { tools } from "./data";

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
            {/* Název */}
            <h2 style={{ marginBottom: "10px" }}>
              {tool.name}
            </h2>

            {/* Základní parametry */}
            <p><strong>GTIN:</strong> {tool.id}</p>
            <p><strong>Výrobce:</strong> {tool.manufacturer}</p>
            <p><strong>Průměr:</strong> {tool.diameter}</p>
            <p><strong>Délka:</strong> {tool.overall_length}</p>

            {/* Popis, pokud existuje */}
            {tool.description && (
              <p style={{ marginTop: "10px", opacity: 0.8 }}>
                {tool.description}
              </p>
            )}

            {/* Obrázek nástroje */}
            {tool.image && (
              <img
                src={tool.image}
                alt={tool.name}
                style={{
                  width: "140px",
                  marginTop: "15px",
                  borderRadius: "6px",
                  border: "1px solid #333",
                  display: "block",
                }}
              />
            )}

            {/* Tlačítko detailu */}
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
