"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { getStockItemById } from "../data/gssStore";

export default function GssDetailPage() {
  const { id } = useParams();

  const item = getStockItemById(id);

  if (!item) {
    return (
      <div style={{ padding: "24px" }}>
        <h1>GSS – Detail položky</h1>
        <p>Položka nebyla nalezena.</p>
        <Link href="/gss">← Zpět do skladu</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "900px" }}>
      <h1>{item.name}</h1>

      <p style={{ opacity: 0.7 }}>
        {item.type} · GPC: {item.gpcCode}
      </p>

      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          borderRadius: "12px",
          background: "#111",
          border: "1px solid #222",
        }}
      >
        <p><strong>Celkem:</strong> {item.qty} ks</p>
        <p><strong>Minimum:</strong> {item.min}</p>
        <p><strong>Maximum:</strong> {item.max}</p>
        <p>
          <strong>Stav:</strong>{" "}
          <span
            style={{
              color:
                item.qty < item.min
                  ? "#ff5555"
                  : item.qty > item.max
                  ? "#ffaa00"
                  : "#22cc88",
            }}
          >
            {item.qty < item.min
              ? "POD MIN"
              : item.qty > item.max
              ? "NAD MAX"
              : "OK"}
          </span>
        </p>

        {item.sharpenable && (
          <p style={{ marginTop: "12px", opacity: 0.8 }}>
            🔧 Brousitelný ({item.sharpenCount}×)
          </p>
        )}
      </div>

      <div style={{ marginTop: "24px" }}>
        <Link href="/gss">← Zpět do skladu</Link>
      </div>
    </div>
  );
}
