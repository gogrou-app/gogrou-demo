"use client";

import { useRouter } from "next/navigation";
import data from "../../data";
import Image from "next/image";

export default function ToolDetail({ params }) {
  const router = useRouter();
  const id = params.id;

  // Hledáme podle GPC ID (správně!)
  const tool = data.find((x) => String(x.gpc_id) === String(id));

  if (!tool) {
    return (
      <div style={{ color: "white", padding: "50px" }}>
        <h2>Nástroj nebyl nalezen.</h2>

        <button
          style={{
            marginTop: "20px",
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

      {/* HLAVNÍ OBRAZEK */}
      <h2>Hlavní obrázek</h2>
      <div
        style={{
          border: "2px solid #333",
          width: "420px",
          padding: "10px",
          marginBottom: "40px",
        }}
      >
        {tool.image ? (
          <Image
            src={tool.image}
            alt={tool.name}
            width={420}
            height={150}
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
          width: "420px",
          padding: "10px",
          marginBottom: "40px",
        }}
      >
        {tool.drawing ? (
          <Image
            src={tool.drawing}
            alt="Technický výkres"
            width={420}
            height={180}
            style={{ objectFit: "contain" }}
          />
        ) : (
          <p>Výkres není dostupný</p>
        )}
      </div>

      {/* PARAMETRY */}
      <h2>Technické parametry</h2>
      {entries.length === 0 && (
        <p>❗ Parametry nejsou vyplněny.</p>
      )}

      <div style={{ maxWidth: "480px" }}>
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
            <div style={{ fontSize: "14px", opacity: 0.7 }}>
              {obj.cz || obj.label || key}
            </div>
            <div style={{ fontSize: "16px", color: "#4ba3ff" }}>
              {obj.value}
            </div>
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
          cursor: "pointer",
        }}
        onClick={() => router.push("/gpc")}
      >
        ← Zpět na seznam
      </button>
    </div>
  );
}
