"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import tools from "../data";

export default function ToolDetail({ params }) {
  const router = useRouter();
  const id = params.id;

  console.log("🔍 DEBUG: hledám gpc_id =", id);

  const tool = tools.find((t) => String(t.gpc_id) === String(id));

  if (!tool) {
    console.error("❌ Nástroj nebyl nalezen! gpc_id =", id);
    console.log("Seznam všech gpc_id:", tools.map((t) => t.gpc_id));
    return (
      <div style={{ padding: "40px", color: "white" }}>
        <h2>Nástroj nebyl nalezen.</h2>
        <button
          onClick={() => router.push("/gpc")}
          style={{
            marginTop: "20px",
            padding: "10px 15px",
            background: "#333",
            borderRadius: "6px",
          }}
        >
          ← Zpět na seznam
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h1>{tool.name}</h1>

      <div style={{ marginBottom: "20px" }}>
        <p><b>GPC ID:</b> {tool.gpc_id}</p>
        <p><b>GTIN:</b> {tool.id}</p>
        <p><b>Výrobce:</b> {tool.manufacturer}</p>
      </div>

      {/* Obrázek */}
      <h2>Hlavní obrázek</h2>
      <div
        style={{
          border: "2px solid #333",
          width: "420px",
          padding: "10px",
          marginBottom: "30px",
        }}
      >
        {tool.image_local ? (
          <Image
            src={tool.image_local}
            width={400}
            height={200}
            alt="Nástroj"
            style={{ objectFit: "contain" }}
          />
        ) : (
          <p>Obrázek není dostupný</p>
        )}
      </div>

      {/* Výkres */}
      <h2>Technický výkres</h2>
      <div
        style={{
          border: "2px solid #333",
          width: "420px",
          padding: "10px",
        }}
      >
        {tool.drawing_local ? (
          <Image
            src={tool.drawing_local}
            width={400}
            height={200}
            alt="Výkres"
            style={{ objectFit: "contain" }}
          />
        ) : (
          <p>Výkres není dostupný</p>
        )}
      </div>

      {/* Parametry */}
      <h2 style={{ marginTop: "40px" }}>Technické parametry</h2>

      {!tool.parameters && (
        <p>❗ Žádné parametry nejsou vyplněny.</p>
      )}

      {tool.parameters && (
        <div style={{ marginTop: "10px" }}>
          {Object.entries(tool.parameters).map(([key, p]) => (
            <div
              key={key}
              style={{
                background: "#111",
                padding: "10px",
                marginBottom: "8px",
                borderRadius: "6px",
                border: "1px solid #333",
                width: "420px",
              }}
            >
              <div style={{ opacity: 0.7 }}>{p.cz || p.label}</div>
              <div style={{ color: "#4ba3ff" }}>{p.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Zpět */}
      <button
        onClick={() => router.push("/gpc")}
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          padding: "12px 18px",
          background: "#333",
          borderRadius: "6px",
        }}
      >
        ← Zpět na seznam
      </button>
    </div>
  );
}
