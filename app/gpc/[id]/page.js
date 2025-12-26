"use client";

import { useParams, useRouter } from "next/navigation";
import tools from "../data";
import { addStockItemFromGPC } from "@/app/gss/data/gssStore";

export default function GpcDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params; // ⬅️ POZOR: je to [id], ne [gpcId]

  const tool = tools.find(
    (t) => String(t.gpc_id) === String(id)
  );

  if (!tool) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        <h1>Nástroj nenalezen</h1>
        <button onClick={() => router.push("/gpc")}>
          Zpět na GPC
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, color: "white" }}>
      <h1 style={{ fontSize: 28 }}>{tool.name}</h1>

      <p style={{ opacity: 0.7 }}>
        {tool.manufacturer} · {tool.type}
      </p>

      <hr style={{ margin: "20px 0", opacity: 0.2 }} />

      <h3>Základní parametry</h3>
      <ul style={{ lineHeight: "1.8" }}>
        <li>Průměr: {tool.geometry?.diameter_mm ?? "—"} mm</li>
        <li>Délka břitu: {tool.geometry?.flute_length_mm ?? "—"} mm</li>
        <li>Počet zubů: {tool.geometry?.flutes ?? "—"}</li>
      </ul>

      <hr style={{ margin: "20px 0", opacity: 0.2 }} />

      {/* === TLAČÍTKO GSS === */}
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
        }}
      >
        Přidat do skladu (GSS)
      </button>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => router.push("/gpc")}
          style={{
            background: "transparent",
            color: "#aaa",
            border: "none",
            cursor: "pointer",
            marginTop: 10,
          }}
        >
          ← Zpět na GPC
        </button>
      </div>
    </div>
  );
}
