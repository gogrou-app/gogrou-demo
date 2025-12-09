"use client";

import { useRouter } from "next/navigation";
import data from "../../data"; // cesta ke GPC databázi
import Image from "next/image";

export default function ToolDetail({ params }) {
  const router = useRouter();
  const id = params.id;

  // Najdeme konkrétní nástroj
  const tool = data.find((x) => String(x.gpc_id) === String(id));

  if (!tool) {
    return (
      <div style={{ color: "white", padding: "50px" }}>
        <h2>Nástroj nebyl nalezen.</h2>
      </div>
    );
  }

  // -------------------------
  // 1) AUTOMATICKÁ DETEKCE PARAMETRŮ
  // -------------------------
  const parameters =
    tool.parameters ||
    tool.params ||
    tool.specs ||
    tool.data ||
    null;

  const parameterEntries = parameters ? Object.entries(parameters) : [];

  return (
    <div style={{ padding: "40px", color: "white" }}>
      {/* TITULEK */}
      <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>{tool.name}</h1>

      {/* HLAVNÍ INFO BLOK */}
      <div
        style={{
          background: "#111",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "35px",
          width: "380px",
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
          border: "2px solid #333",
          width: "400px",
          padding: "10px",
          marginBottom: "40px",
        }}
      >
        {tool.image ? (
          <Image
            src={tool.image}
            alt={tool.name}
            width={400}
            height={120}
            style={{ objectFit: "contain" }}
          />
        ) : (
          <p>Obrázek není dostupný</p>
        )}
      </div>

      {/* TECHNICKÝ VÝKRES */}
      <h2>Technický výkres</h2>
      <div
        style={{
          border: "2px solid #333",
          width: "400px",
          padding: "10px",
          marginBottom: "40px",
        }}
      >
        {tool.drawing ? (
          <Image
            src={tool.drawing}
            alt="Technický výkres"
            width={400}
            height={160}
            style={{ objectFit: "contain" }}
          />
        ) : (
          <p>Výkres není dostupný</p>
        )}
      </div>

      {/* 🔧 TECHNICKÉ PARAMETRY */}
      <h2>Technické parametry</h2>

      {parameterEntries.length === 0 && (
        <p>❗ Parametry nejsou v databázi vyplněny.</p>
      )}

      <div style={{ maxWidth: "450px" }}>
        {parameterEntries.map(([key, obj]) => (
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
            <div style={{ fontSize: "14px", opacity: 0.7 }}>
              {obj.cz || obj.label || key}:
            </div>
            <div style={{ fontSize: "16px", color: "#4ba3ff" }}>
              {obj.value}
            </div>
          </div>
        ))}
      </div>

      {/* FIXNÍ ZPĚT TLAČÍTKO */}
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
          cursor: "pointer",
        }}
        onClick={() => router.push("/gpc")}
      >
        ← Zpět na seznam
      </button>
    </div>
  );
}
