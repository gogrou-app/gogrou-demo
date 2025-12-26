"use client";

import { useParams, useRouter } from "next/navigation";
import tools from "../data";

export default function GpcDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const tool = tools.find(
    (t) => String(t.gpc_id) === String(id)
  );

  if (!tool) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        <h2>Položka nenalezena</h2>

        <button
          onClick={() => router.push("/gpc")}
          style={{
            marginTop: 20,
            background: "transparent",
            color: "#1e90ff",
            border: "none",
            cursor: "pointer",
          }}
        >
          ← Zpět na seznam
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, color: "white", maxWidth: 800 }}>
      <h1 style={{ fontSize: 28 }}>{tool.name}</h1>

      <p style={{ opacity: 0.7, marginBottom: 20 }}>
        {tool.manufacturer} · {tool.type}
      </p>

      <hr style={{ opacity: 0.2, marginBottom: 20 }} />

      <h3>Základní parametry</h3>

      <ul style={{ lineHeight: "1.8", marginTop: 10 }}>
        <li>Průměr: {tool.geometry?.diameter_mm ?? "—"} mm</li>
        <li>Délka břitu: {tool.geometry?.flute_length_mm ?? "—"} mm</li>
        <li>Počet zubů: {tool.geometry?.flutes ?? "—"}</li>
      </ul>

      <hr style={{ opacity: 0.2, margin: "30px 0" }} />

      <button
        onClick={() => router.push("/gpc")}
        style={{
          background: "transparent",
          color: "#aaa",
          border: "none",
          cursor: "pointer",
        }}
      >
        ← Zpět na GPC
      </button>
    </div>
  );
}
