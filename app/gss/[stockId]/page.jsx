"use client";

import { useParams, useRouter } from "next/navigation";
import { getGssState } from "../data/gssStore";

export default function GssStockDetailPage() {
  const { stockId } = useParams();
  const router = useRouter();

  const state = getGssState();
  if (!state) return null;

  const mainWarehouse = state.warehouses.find(w => w.is_default);
  const stockItem = mainWarehouse?.stock.find(
    s => String(s.gss_stock_id) === String(stockId)
  );

  if (!stockItem) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        <h2>Položka nenalezena</h2>
        <button onClick={() => router.push("/gss")}>
          ← Zpět na GSS
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, color: "white", maxWidth: 800 }}>
      <h1>{stockItem.name}</h1>

      <p style={{ opacity: 0.7 }}>
        GPC_ID: {stockItem.gpc_id}
      </p>

      <hr style={{ margin: "20px 0", opacity: 0.2 }} />

      <h3>📦 Stav skladu</h3>
      <p>
        <strong>Množství:</strong> {stockItem.quantity} ks
      </p>
      <p>
        <strong>Režim sledování:</strong>{" "}
        {stockItem.tracking_mode === "quantity"
          ? "Množství"
          : "Jednotlivé kusy (DM)"}
      </p>

      <hr style={{ margin: "20px 0", opacity: 0.2 }} />

      <h3>⚙️ Nastavení</h3>
      <p>
        <strong>Minimum:</strong>{" "}
        {stockItem.min ?? "nenastaveno"}
      </p>
      <p>
        <strong>Maximum:</strong>{" "}
        {stockItem.max ?? "nenastaveno"}
      </p>

      <hr style={{ margin: "20px 0", opacity: 0.2 }} />

      <h3>🔧 Akce (zatím jednoduché)</h3>

      <div style={{ display: "flex", gap: 10 }}>
        <button disabled>➕ Příjem</button>
        <button disabled>➖ Výdej</button>
      </div>

      <p style={{ opacity: 0.5, marginTop: 10 }}>
        (logika pohybů přijde v dalším kroku)
      </p>

      <hr style={{ margin: "30px 0", opacity: 0.2 }} />

      <button onClick={() => router.push("/gss")}>
        ← Zpět na GSS
      </button>
    </div>
  );
}
