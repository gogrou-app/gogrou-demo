"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { tools } from "../data";

export default function ToolDetail({ params }) {
  const router = useRouter();
  const id = params.id;

  // --------------------------------------------------------
  // 1️⃣ NALEZENÍ NÁSTROJE
  // --------------------------------------------------------
  const tool = tools.find((t) => String(t.gpc_id) === String(id));

  useEffect(() => {
    console.log("🔍 DETAIL – požadované ID:", id);
    console.log("📦 Nalezený nástroj:", tool);
  }, [id, tool]);

  if (!tool) {
    return (
      <div style={{ padding: "40px", color: "white" }}>
        <h1>Nástroj nebyl nalezen.</h1>
        <button
          onClick={() => router.push("/gpc")}
          style={{
            marginTop: "20px",
            padding: "12px 20px",
            background: "#333",
            borderRadius: "8px",
            border: "1px solid #444",
            color: "white",
            cursor: "pointer",
          }}
        >
          ← Zpět na seznam
        </button>
      </div>
    );
  }

  // --------------------------------------------------------
  // 2️⃣ PARAMETRY
  // --------------------------------------------------------
  const parameters = tool.parameters || {};
  const entries = Object.entries(parameters);

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h1 style={{ fontSize: "30px", marginBottom: "20px" }}>
        {tool.name}
      </h1>

      {/* INFO BLOK */}
      <div
        style={{
          background: "#111",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "35px",
          width: "420px",
        }}
      >
        <p><b>GPC ID:</b> {tool.gpc_id}</p>
        <p><b>GTIN / Order ID:</b> {tool.id}</p>
        <p><b>Výrobce:</b> {tool.manufacturer}</p>
        <p><b>Typ:</b> {tool.type}</p>
        <p><b>Průměr:</b> {tool.diameter}</p>
        <p><b>Celková délka:</b> {tool.overall_length}</p>
      </div>

      {/* HLAVNÍ OBRÁZEK */}
      <h2>Hlavní obrázek</h2>
      <div
        style={{
          width: "420px",
          border: "1px solid #333",
          padding: "10px",
          marginBottom: "30px",
        }}
      >
        <Image
          src={tool.image}
          alt="Náhled"
          width={420}
          height={150}
          onError={(e) => {
            console.log("❌ DETAIL – obrázek se nenačetl:", tool.image);
            e.target.src = "/images/fallback.png";
          }}
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* TECHNICKÝ VÝKRES */}
      <h2>Technický výkres</h2>
      <div
        style={{
          width: "420px",
          border: "1px solid #333",
          padding: "10px",
          marginBottom: "30px",
        }}
      >
        <Image
          src={tool.drawing}
          alt="Výkres"
          width={420}
          height={150}
          onError={(e) => {
            console.log("❌ DETAIL – výkres se nenačetl:", tool.drawing);
            e.target.src = "/images/fallback.png";
          }}
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* PARAMETRY */}
      <h2>Technické parametry</h2>

      {entries.length === 0 && (
        <p style={{ opacity: 0.5 }}>Parametry nejsou k dispozici.</p>
      )}

      {entries.map(([key, param]) => (
        <div
          key={key}
          style={{
            background: "#111",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
            border: "1px solid #333",
            width: "420px",
          }}
        >
          <div style={{ opacity: 0.6, fontSize: "13px" }}>{param.cz}</div>
          <div style={{ fontSize: "16px", color: "#4ba3ff" }}>{param.value}</div>
        </div>
      ))}

      {/* TLAČÍTKO ZPĚT */}
      <button
        onClick={() => router.push("/gpc")}
        style={{
          marginTop: "30px",
          padding: "12px 20px",
          background: "#333",
          borderRadius: "8px",
          border: "1px solid #444",
          color: "white",
          cursor: "pointer",
        }}
      >
        ← Zpět na seznam
      </button>
    </div>
  );
}
