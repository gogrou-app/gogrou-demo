"use client";

import { useRouter } from "next/navigation";
import tools from "../data";
import Image from "next/image";

export default function ToolDetail({ params }) {
  const router = useRouter();
  const id = params.id;

  // Najdeme nástroj podle GPC_ID
  const tool = tools.find((x) => String(x.gpc_id) === String(id));

  if (!tool) {
    console.error("❌ DETAIL: Nástroj nenalezen:", id);
    return <div style={{ color: "white", padding: "40px" }}>Nástroj nebyl nalezen.</div>;
  }

  const parameters = tool.parameters || {};
  const entries = Object.entries(parameters);

  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>{tool.name}</h1>

      {/* INFO */}
      <div
        style={{
          background: "#111",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "30px",
          width: "380px",
        }}
      >
        <p><b>GPC ID:</b> {tool.gpc_id}</p>
        <p><b>GTIN:</b> {tool.id}</p>
        <p><b>Výrobce:</b> {tool.manufacturer}</p>
        <p><b>Průměr:</b> {tool.diameter}</p>
        <p><b>Celková délka:</b> {tool.overall_length}</p>
      </div>

      {/* MAIN IMAGE */}
      <h2>Hlavní obrázek</h2>
      <div style={{ border: "2px solid #333", width: "420px", padding: "10px", marginBottom: "40px" }}>
        <Image
          src={tool.image_main}
          alt={tool.name}
          width={400}
          height={140}
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* DRAWING */}
      <h2>Technický výkres</h2>
      <div style={{ border: "2px solid #333", width: "420px", padding: "10px", marginBottom: "40px" }}>
        <Image
          src={tool.image_drawing}
          alt="Výkres"
          width={400}
          height={160}
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* PARAMETRY */}
      <h2>Technické parametry</h2>

      <div style={{ maxWidth: "450px" }}>
        {entries.map(([key, obj]) => (
          <div
            key={key}
            style={{
              background: "#111",
              marginBottom: "10px",
              padding: "14px",
              borderRadius: "8px",
              border: "1px solid #333",
            }}
          >
            <div style={{ opacity: 0.7 }}>{obj.cz}</div>
            <div style={{ fontSize: "16px", color: "#4ba3ff" }}>{obj.value}</div>
          </div>
        ))}
      </div>

      {/* ZPĚT */}
      <button
        style={{
          position: "fixed",
          bottom: "25px",
          left: "25px",
          padding: "12px 20px",
          background: "#222",
          color: "white",
          borderRadius: "8px",
          border: "1px solid #444",
          cursor: "pointer",
        }}
        onClick={() => router.push("/gpc")}
      >
        ← Zpět na seznam
      </button>
    </div>
  );
}
