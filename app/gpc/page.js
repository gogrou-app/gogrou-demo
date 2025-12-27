"use client";

import { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import tools from "./data";

export default function GpcPage() {
  const { setModule } = useAppContext();

  useEffect(() => {
    setModule("GPC");
  }, [setModule]);

  return (
    <div style={{ padding: 30, color: "white", maxWidth: 1000 }}>
      <ContextHeader />

      <h1>GPC – Seznam nástrojů (interní)</h1>
      <p style={{ opacity: 0.7 }}>
        Master data (zatím statická demo data)
      </p>

      <div style={{ marginTop: 20 }}>
        {tools.map((t) => (
          <div
            key={t.gpc_id}
            style={{
              border: "1px solid #222",
              borderRadius: 12,
              padding: 16,
              marginBottom: 10,
              background: "#0b0b0b",
            }}
          >
            <div style={{ fontWeight: 700 }}>{t.name}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {t.manufacturer} · {t.tool_type} · {t.gpc_id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
