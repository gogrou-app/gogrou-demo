"use client";

import Link from "next/link";

import gssStockImport from "./data/gssStock";
import gpcToolsImport from "../gpc/data";

function normalizeArray(input) {
  if (Array.isArray(input)) return input;
  if (input?.default && Array.isArray(input.default)) return input.default;
  return [];
}

export default function GssPage() {
  // ✅ absolutní pojistka proti pádům
  const gssStock = normalizeArray(gssStockImport);
  const gpcTools = normalizeArray(gpcToolsImport);

  return (
    <div style={{ padding: 30, color: "white", maxWidth: 1100 }}>
      <h1 style={{ marginBottom: 20 }}>GSS – Hlavní sklad</h1>

      {gssStock.length === 0 ? (
        <div
          style={{
            background: "#111",
            border: "1px solid #333",
            borderRadius: 12,
            padding: 20,
            opacity: 0.8
          }}
        >
          Žádné položky ve skladu
        </div>
      ) : (
        <>
          {/* HLAVIČKA TABULKY */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "3fr 2fr 1fr 1fr",
              gap: 12,
              padding: "12px 16px",
              background: "#222",
              borderRadius: 10,
              fontWeight: "bold",
              marginBottom: 8
            }}
          >
            <div>Název položky</div>
            <div>Typ</div>
            <div>Sklad</div>
            <div>Akce</div>
          </div>

          {/* ŘÁDKY */}
          {gssStock.map((row) => {
            const tool = gpcTools.find(
              (t) => String(t.gpc_id) === String(row.gpc_id)
            );

            return (
              <div
                key={row.gss_stock_id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "3fr 2fr 1fr 1fr",
                  gap: 12,
                  padding: "14px 16px",
                  background: "#111",
                  borderRadius: 10,
                  border: "1px solid #333",
                  marginBottom: 8
                }}
              >
                <div style={{ fontWeight: "bold" }}>
                  {tool?.name || "Neznámá položka"}
                </div>

                <div>{tool?.type || "—"}</div>

                <div>
                  {Number(row.quantity ?? 0)} ks
                </div>

                <div>
                  <Link
                    href={`/gss/${row.gss_stock_id}`}
                    style={{
                      color: "#4da6ff",
                      fontWeight: "bold",
                      textDecoration: "none"
                    }}
                  >
                    Detail →
                  </Link>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
