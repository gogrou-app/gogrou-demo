"use client";

import { tools } from "@/app/gpc/data";
import { addStockItemFromGPC } from "../data/gssStore";
import { useRouter } from "next/navigation";

export default function AddToGSSPage() {
  const router = useRouter();

  function handleAdd(tool) {
    addStockItemFromGPC(tool);
    router.push("/gss");
  }

  return (
    <div style={{ padding: "30px", maxWidth: "900px" }}>
      <h1>Vyber položku do skladu</h1>
      <p style={{ opacity: 0.6 }}>
        Interní katalog – uživatel netuší, odkud data pochází
      </p>

      {tools.map((tool) => (
        <div
          key={tool.gpc_id}
          style={{
            border: "1px solid #333",
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "12px",
          }}
        >
          <strong>{tool.name}</strong>
          <div>{tool.type}</div>

          <button
            onClick={() => handleAdd(tool)}
            style={{
              marginTop: "10px",
              padding: "8px 14px",
              background: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Přidat do skladu
          </button>
        </div>
      ))}
    </div>
  );
}
