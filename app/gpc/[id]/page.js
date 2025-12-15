"use client";

import { useRouter } from "next/navigation";
import tools from "../data";
import Image from "next/image";

export default function ToolDetail({ params }) {
  const router = useRouter();
  const tool = tools.find(t => String(t.gpc_id) === String(params.id));

  if (!tool) {
    return (
      <div style={{ color: "white", padding: "40px" }}>
        Nástroj nebyl nalezen
      </div>
    );
  }

  const geometry = tool.geometry || {};

  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h1>{tool.name}</h1>

      {/* INFO */}
      <div style={{
        background: "#111",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "30px",
        width: "380px"
      }}>
        <p><b>GPC ID:</b> {tool.gpc_id}</p>
        <p><b>GTIN:</b> {tool.gtin || "—"}</p>
        <p><b>Výrobce:</b> {tool.manufacturer}</p>
        <p><b>Typ:</b> {tool.type}</p>
      </div>

      {/* HLAVNÍ OBRÁZEK */}
      {tool.image_main && (
        <>
          <h2>Hlavní obrázek</h2>
          <div style={{ border: "2px solid #333", width: "420px", padding: "10px", marginBottom: "40px" }}>
            <Image
              src={tool.image_main}
              alt={tool.name}
              width={400}
              height={160}
              style={{ objectFit: "contain" }}
            />
          </div>
        </>
      )}

      {/* TECHNICKÝ VÝKRES */}
      {tool.image_drawing && (
        <>
          <h2>Technický výkres</h2>
          <div style={{ border: "2px solid #333", width: "420px", padding: "10px", marginBottom: "40px" }}>
            <Image
              src={tool.image_drawing}
              alt="Technický výkres"
              width={400}
              height={200}
              style={{ objectFit: "contain" }}
            />
          </div>
        </>
      )}

      {/* PARAMETRY */}
      <h2>Technické parametry</h2>

      <div style={{ maxWidth: "450px" }}>
        {Object.entries(geometry).map(([key, value]) => (
          <div key={key} style={{
            background: "#111",
            marginBottom: "10px",
            padding: "14px",
            borderRadius: "8px",
            border: "1px solid #333"
          }}>
            <div style={{ opacity: 0.7 }}>{key}</div>
            <div style={{ color: "#4ba3ff" }}>{value}</div>
          </div>
        ))}

        {tool.material && (
          <div style={{ background: "#111", padding: "14px", borderRadius: "8px", marginBottom: "10px" }}>
            <div style={{ opacity: 0.7 }}>Materiál</div>
            <div style={{ color: "#4ba3ff" }}>{tool.material}</div>
          </div>
        )}

        {tool.coating && (
          <div style={{ background: "#111", padding: "14px", borderRadius: "8px" }}>
            <div style={{ opacity: 0.7 }}>Povlak</div>
            <div style={{ color: "#4ba3ff" }}>{tool.coating}</div>
          </div>
        )}
      </div>

      {/* ZPĚT */}
      <button
        onClick={() => router.push("/gpc")}
        style={{
          position: "fixed",
          bottom: "25px",
          left: "25px",
          padding: "12px 20px",
          background: "#222",
          color: "white",
          borderRadius: "8px",
          border: "1px solid #444",
          cursor: "pointer"
        }}
      >
        ← Zpět na seznam
      </button>
    </div>
  );
}
