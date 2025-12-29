// /app/gss/page.jsx
import Link from "next/link";

// GSS data
import { stockItems } from "./data/stock";

// GPC data (read-only)
import tools from "../gpc/data";

export default function GSSPage() {
  // napojení GSS → GPC
  const rows = stockItems.map((stock) => {
    const tool = tools.find((t) => t.gpc_id === stock.gpc_id);

    return {
      ...stock,
      tool,
    };
  });

  return (
    <div style={{ maxWidth: 900 }}>
      <h1>Hlavní sklad</h1>
      <p>
        Firma: <b>DEMO</b> · Sklad: <b>MAIN</b>
      </p>

      {rows.length === 0 && <p>Sklad je zatím prázdný</p>}

      {rows.map((row) => (
        <div
          key={row.id}
          style={{
            background: "#111",
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: "bold" }}>
              {row.tool ? row.tool.name : "⚠️ Neznámý nástroj"}
            </div>

            <div style={{ opacity: 0.7, fontSize: 13 }}>
              {row.tool?.manufacturer} · {row.tool?.type}
            </div>

            <div style={{ marginTop: 6 }}>
              Skladem: <b>{row.quantity} ks</b>{" "}
              <span style={{ opacity: 0.6 }}>
                (min {row.min} / max {row.max})
              </span>
            </div>
          </div>

          <Link
            href={`/gss/${row.id}`}
            style={{
              background: "#222",
              padding: "8px 14px",
              borderRadius: 8,
              textDecoration: "none",
              color: "#fff",
              fontSize: 14,
            }}
          >
            Detail →
          </Link>
        </div>
      ))}
    </div>
  );
}
