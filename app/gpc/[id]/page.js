import Link from "next/link";
import { notFound } from "next/navigation";
import tools from "../../data";

export default function ToolDetail({ params }) {
  const { id } = params;
  const tool = tools.find((t) => t.id === id);

  if (!tool) return notFound();

  return (
    <div style={{ padding: "40px", color: "white" }}>
      
      {/* Horní tlačítko zpět */}
      <Link
        href="/gpc"
        style={{
          display: "inline-block",
          marginBottom: "25px",
          padding: "10px 20px",
          border: "1px solid #fff",
          borderRadius: "8px",
          background: "#222",
        }}
      >
        ← Zpět na seznam
      </Link>

      {/* Název nástroje */}
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>{tool.name}</h1>

      {/* Základní info box */}
      <div
        style={{
          background: "#111",
          padding: "20px",
          borderRadius: "10px",
          border: "1px solid #333",
          marginBottom: "30px",
          maxWidth: "500px",
        }}
      >
        <p><strong>GPC ID:</strong> {tool.id}</p>
        <p><strong>GTIN / Order ID:</strong> {tool.gtin}</p>
        <p><strong>Výrobce:</strong> {tool.manufacturer}</p>
        <p><strong>Typ:</strong> {tool.type}</p>
        <p><strong>Průměr:</strong> {tool.diameter}</p>
        <p><strong>Celková délka:</strong> {tool.length}</p>
      </div>

      {/* Hlavní obrázek */}
      <h2 style={{ marginTop: "20px" }}>Hlavní obrázek</h2>
      <img
        src={tool.image}
        alt="Hlavní obrázek"
        style={{
          width: "400px",
          borderRadius: "8px",
          border: "1px solid #333",
          background: "#fff",
        }}
      />

      {/* Technický výkres */}
      <h2 style={{ marginTop: "40px" }}>Technický výkres</h2>
      <div
        style={{
          width: "450px",
          height: "250px",
          borderRadius: "10px",
          border: "1px solid #333",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "40px",
        }}
      >
        <img
          src={tool.techImage}
          alt="Technický výkres"
          style={{
            maxHeight: "90%",
            maxWidth: "90%",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Technické parametry */}
      <h2 style={{ marginBottom: "20px" }}>Technické parametry</h2>

      <div style={{ maxWidth: "600px" }}>
        {Object.entries(tool.params).map(([key, value]) => (
          <div
            key={key}
            style={{
              background: "#111",
              padding: "12px 18px",
              marginBottom: "12px",
              borderRadius: "8px",
              border: "1px solid #333",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
              {key}:
            </div>
            <div>{value}</div>
          </div>
        ))}
      </div>

      {/* Dolní tlačítko zpět */}
      <div style={{ marginTop: "40px" }}>
        <Link
          href="/gpc"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            border: "1px solid #fff",
            borderRadius: "8px",
            background: "#222",
          }}
        >
          ← Zpět na seznam
        </Link>
      </div>
    </div>
  );
}
