"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import tools from "../data";

export default function ToolDetail({ params }) {
  const router = useRouter();
  const id = params.id;

  // najdeme nástroj
  const tool = tools.find(t => String(t.gpc_id) === String(id));

  if (!tool) {
    console.error("❗ Detail: Nástroj nebyl nalezen pro ID:", id);
    return (
      <div style={{ padding: "50px", color: "white" }}>
        <h2>Nástroj nebyl nalezen.</h2>
        <button 
          style={{
            marginTop: "20px",
            background: "#333",
            color: "white",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #444",
          }}
          onClick={() => router.push("/gpc")}
        >← Zpět na seznam</button>
      </div>
    );
  }

  // Bezpečný název souboru
  const safeName = tool.safe_name || tool.name.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();

  const mainImg = `/images/tools/${safeName}_main.png`;
  const drawingImg = `/images/tools/${safeName}_drawing.png`;

  const parameters = tool.parameters || {};
  const entries = Object.entries(parameters);

  return (
    <div style={{ padding: "40px", color: "white" }}>
      
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>{tool.name}</h1>

      {/* INFO BLOK */}
      <div
        style={{
          background: "#111",
          padding: "20px",
          width: "420px",
          borderRadius: "12px",
          marginBottom: "30px",
        }}
      >
        <p><b>GPC ID:</b> {tool.gpc_id}</p>
        <p><b>GTIN:</b> {tool.id}</p>
        <p><b>Výrobce:</b> {tool.manufacturer}</p>
        <p><b>Typ:</b> {tool.type}</p>
        <p><b>Průměr:</b> {tool.diameter}</p>
        <p><b>Celková délka:</b> {tool.overall_length}</p>
      </div>

      {/* HLAVNÍ OBRÁZEK */}
      <h2>Hlavní obrázek</h2>
      <div style={{ border: "1px solid #333", padding: "12px", width: "420px", marginBottom: "30px" }}>
        <Image
          src={mainImg}
          alt={tool.name}
          width={400}
          height={150}
          style={{ objectFit: "contain" }}
          onError={() => console.warn("❗ Chybí hlavní obrázek:", mainImg)}
        />
      </div>

      {/* TECHNICKÝ VÝKRES */}
      <h2>Technický výkres</h2>
      <div style={{ border: "1px solid #333", padding: "12px", width: "420px", marginBottom: "30px" }}>
        <Image
          src={drawingImg}
          alt="Technický výkres"
          width={400}
          height={160}
          style={{ objectFit: "contain" }}
          onError={() => console.warn("❗ Chybí technický výkres:", drawingImg)}
        />
      </div>

      {/* PARAMETRY */}
      <h2>Technické parametry</h2>

      {entries.length === 0 && (
        <p style={{ opacity: 0.6 }}>❗ Žádné parametry nebyly vyplněny.</p>
      )}

      <div style={{ maxWidth: "450px", marginBottom: "50px" }}>
        {entries.map(([k, p]) => (
          <div
            key={k}
            style={{
              background: "#111",
              padding: "14px",
              borderRadius: "8px",
              border: "1px solid #333",
              marginBottom: "10px",
            }}
          >
            <div style={{ opacity: 0.7 }}>{p.cz || p.label}</div>
            <div style={{ color: "#4ba3ff" }}>{p.value}</div>
          </div>
        ))}
      </div>

      {/* FIXNÍ ZPĚT */}
      <button
        style={{
          position: "fixed",
          bottom: "25px",
          left: "25px",
          padding: "12px 20px",
          fontSize: "16px",
          background: "#333",
          color: "white",
          borderRadius: "8px",
          border: "1px solid #444",
        }}
        onClick={() => router.push("/gpc")}
      >
        ← Zpět na seznam
      </button>

    </div>
  );
}
