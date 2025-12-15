"use client";

import { useRouter } from "next/navigation";
import gssStock from "../data";
import gpcTools from "../../gpc/data";

export default function GssDetail({ params }) {
  const router = useRouter();
  const stock = gssStock.find(
    (s) => String(s.gss_stock_id) === String(params.stockId)
  );

  if (!stock) {
    return <div style={{ color: "white", padding: 40 }}>Nenalezeno</div>;
  }

  const tool = gpcTools.find(
    (t) => String(t.gpc_id) === String(stock.gpc_id)
  );

  return (
    <div style={{ padding: 30, color: "white" }}>
      <h1 style={{ fontSize: 28 }}>{tool?.name}</h1>

      <p><b>Režim evidence:</b> {stock.tracking_mode}</p>
      <p><b>Lokace:</b> {stock.default_location}</p>

      {stock.tracking_mode === "dm" && (
        <>
          <h2>Jednotlivé kusy (DM)</h2>
          {stock.items.map((item) => (
            <div
              key={item.gss_item_id}
              style={{
                background: "#111",
                padding: 12,
                marginBottom: 10,
                borderRadius: 8,
                border: "1px solid #333"
              }}
            >
              <div>DM: {item.dm_code}</div>
              <div>Status: {item.status}</div>
              <div>
                Přebroušení: {item.resharpen_count} /{" "}
                {item.max_resharpen_count}
              </div>
            </div>
          ))}
        </>
      )}

      {stock.tracking_mode === "quantity" && (
        <>
          <h2>Množství</h2>
          <div
            style={{
              background: "#111",
              padding: 20,
              borderRadius: 8,
              border: "1px solid #333",
              width: 200
            }}
          >
            {stock.quantity} ks
          </div>
        </>
      )}

      <button
        onClick={() => router.push("/gss")}
        style={{
          marginTop: 30,
          padding: "12px 20px",
          background: "#222",
          border: "1px solid #444",
          borderRadius: 8,
          color: "white",
          cursor: "pointer"
        }}
      >
        ← Zpět na sklad
      </button>
    </div>
  );
}
