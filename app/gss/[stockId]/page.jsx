"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getStockItemById,
  updateStockMinMax,
  receiveStock,
  issueStock,
  returnFromProduction,
} from "../data/gssStore";

export default function GssStockDetailPage() {
  const { stockId } = useParams();
  const router = useRouter();

  const [ctx, setCtx] = useState(null);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [receiveQty, setReceiveQty] = useState("");
  const [issueQty, setIssueQty] = useState("");

  useEffect(() => {
    const data = getStockItemById(stockId);
    if (!data) return;
    setCtx(data);
    setMin(data.item.min ?? "");
    setMax(data.item.max ?? "");
  }, [stockId]);

  if (!ctx) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        <h2>Položka nenalezena</h2>
        <button onClick={() => router.push("/gss")}>
          ← Zpět na GSS
        </button>
      </div>
    );
  }

  const { item, company, warehouse } = ctx;

  return (
    <div style={{ padding: 40, color: "white", maxWidth: 900 }}>
      <button onClick={() => router.push("/gss")}>
        ← Zpět na sklad
      </button>

      <h1>{item.name}</h1>
      <p style={{ opacity: 0.6 }}>
        Firma: {company.name} · Sklad: {warehouse.name}
      </p>

      <div style={{ marginTop: 20 }}>
        <strong>Stav:</strong> {item.quantity} ks
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Min / Max</h3>
        <input
          placeholder="MIN"
          value={min}
          onChange={(e) => setMin(e.target.value)}
        />
        <input
          placeholder="MAX"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          style={{ marginLeft: 10 }}
        />
        <button
          onClick={() =>
            updateStockMinMax(item.gss_stock_id, min, max)
          }
          style={{ marginLeft: 10 }}
        >
          Uložit
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Příjem</h3>
        <input
          value={receiveQty}
          onChange={(e) => setReceiveQty(e.target.value)}
        />
        <button
          onClick={() => {
            receiveStock(item.gss_stock_id, receiveQty);
            setReceiveQty("");
          }}
        >
          Přijmout
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Výdej</h3>
        <input
          value={issueQty}
          onChange={(e) => setIssueQty(e.target.value)}
        />
        <button
          onClick={() => {
            issueStock(item.gss_stock_id, issueQty);
            setIssueQty("");
          }}
        >
          Vydat
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => returnFromProduction(item.gss_stock_id)}
        >
          Vrátit z výroby
        </button>
      </div>
    </div>
  );
}
