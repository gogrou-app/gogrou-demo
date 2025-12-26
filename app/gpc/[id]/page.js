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
        <h2>Nástroj nenalezen</h2>
        <button onClick={() => router.push("/gpc")}>
          Zpět
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, color: "white" }}>
      <h1>{tool.name}</h1>

      <p style={{ opacity: 0.7 }}>
        {tool.manufacturer} · {tool.type}
      </p>

      <ul>
        <li>Průměr: {tool.geometry?.diameter_mm} mm</li>
        <li>Délka břitu: {tool.geometry?.flute_length_mm} mm</li>
        <li>Zuby: {tool.geometry?.flutes}</li>
      </ul>

      <button
        onClick={() => router.push("/gpc")}
        style={{ marginTop: 20 }}
      >
        ← Zpět
      </button>
    </div>
  );
}
