"use client";

import { useParams, useRouter } from "next/navigation";
import tools from "../data";

// ❗️DŮLEŽITÉ: žádný alias @/, ale RELATIVNÍ CESTA
import { addStockItemFromGPC } from "../../gss/data/gssStore";

export default function GpcDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params; // [id] odpovídá složce /gpc/[id]

  const tool = tools.find(
    (t) => String(t.gpc_id) === String(id)
  );

  if (!tool) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        <h1>Nástroj nenalezen</h1>
        <button
          onClick={() => router.push("/gpc")}
          style={{
            marginTop: 20,
            padding: "10px 16px",
            background: "#222",
            color: "white",
            border: "1px solid #444",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Zpět na GPC
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, color: "white", maxWidth: 900 }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>{tool.name}</h1>

      <div style={{ opacity: 0.7, marginBottom: 20 }}>
        {tool.manufacturer} · {tool.type}
      </div>

      <hr style={{ margin: "20px 0", opacity: 0.2 }} />

      <h3>Základní parametry</h3>
      <ul style={{ lineHeight: "1.8", opacity: 0.85 }}>
        <li>Průměr: {tool.geometry?.diameter_mm ?? "—"} mm</li>
        <li>Délka břitu: {tool.geometry?.flute_length_mm ?? "—"} mm</li>
        <li>Počet zubů: {tool.geometry?.flutes ?? "—"}</li>
      </ul>

      <hr style={{ margin: "20px 0", opacity: 0.2 }} />

      {/* ========================= */}
      {/*  TLAČÍTKO → GSS (KROK 1) */}
      {/* ========================= */}
      <button
        onClick={() => {
          addStockItemFromGPC(tool);
          alert("Položka byla přidána do GSS (0 ks)");
        }}
        style={{
          padding: "12px 20px",
          background: "#1e90ff",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 14,
          fontWeight: "bold",
        }}
      >
        Přidat do skladu (GSS)
      </button>

      <div style={{ marginTop: 24 }}>
        <button
          onClick={() => router.push("/gpc")}
          style={{
            background: "transparent",
            color: "#aaa",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ← Zpět na GPC
        </button>
      </div>
    </div>
  );
}
