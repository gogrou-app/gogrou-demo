"use client";

import { useParams, useRouter } from "next/navigation";
import tools from "../data";

export default function GpcDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const tool = tools.find(
    (t) => String(t.gpc_id) === String(id)
  );

  if (!tool) {
    return (
      <div style={{ padding: 40, color: "#fff" }}>
        <h2>Nástroj nenalezen</h2>
        <button
          onClick={() => router.push("/gpc")}
          style={{
            marginTop: 20,
            padding: "8px 14px",
            background: "#333",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          ← Zpět na seznam
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, color: "#fff", maxWidth: 900 }}>
      <h1>{tool.name}</h1>

      <p style={{ opacity: 0.6 }}>
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

      <button
        onClick={() => router.push("/gpc")}
        style={{
          padding: "8px 14px",
          background: "transparent",
          color: "#aaa",
          border: "none",
          cursor: "pointer",
        }}
      >
        ← Zpět
      </button>
    </div>
  );
}
