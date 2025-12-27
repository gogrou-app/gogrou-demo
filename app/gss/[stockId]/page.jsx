"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getMainWarehouseStock,
  receiveToMainWarehouse,
  issueToProduction,
} from "../data/gssStore";

export default function GssStockDetailPage() {
  const { stockId } = useParams();
  const [item, setItem] = useState(null);

  const [inQty, setInQty] = useState("");
  const [inDoc, setInDoc] = useState("");

  const [outQty, setOutQty] = useState("");
  const [outTarget, setOutTarget] = useState("");

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    const stock = getMainWarehouseStock();
    const found = stock.find(
      (s) => String(s.gss_stock_id) === String(stockId)
    );
    setItem(found || null);
  }

  if (!item) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        <h2>Položka nenalezena</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, color: "white", maxWidth: 800 }}>
      <h1>{item.name}</h1>

      <div style={{ opacity: 0.6, marginBottom: 20 }}>
        Stav skladu: <strong>{item.quantity} ks</strong>
      </div>

      {/* ===============================
          PŘÍJEM NA SKLAD
      =============================== */}
      <div
        style={{
          border: "1px solid #1f2937",
          borderRadius: 10,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <h3>➕ Příjem na hlavní sklad</h3>

        <input
          placeholder="Počet ks"
          type="number"
          value={inQty}
          onChange={(e) => setInQty(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Dodací list / faktura / poznámka"
          value={inDoc}
          onChange={(e) => setInDoc(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={() => {
            receiveToMainWarehouse({
              gss_stock_id: item.gss_stock_id,
              quantity: Number(inQty),
              document_ref: inDoc || "bez dokladu",
            });
            setInQty("");
            setInDoc("");
            refresh();
          }}
          style={primaryBtn}
        >
          Přijmout na sklad
        </button>
      </div>

      {/* ===============================
          VÝDEJ DO VÝROBY
      =============================== */}
      <div
        style={{
          border: "1px solid #1f2937",
          borderRadius: 10,
          padding: 16,
        }}
      >
        <h3>⬇️ Výdej do výroby</h3>

        <input
          placeholder="Počet ks"
          type="number"
          value={outQty}
          onChange={(e) => setOutQty(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Zakázka / stroj / pracoviště"
          value={outTarget}
          onChange={(e) => setOutTarget(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={() => {
            issueToProduction({
              gss_stock_id: item.gss_stock_id,
              quantity: Number(outQty),
              target_ref: outTarget || "neurčeno",
            });
            setOutQty("");
            setOutTarget("");
            refresh();
          }}
          style={secondaryBtn}
        >
          Vydat do výroby
        </button>
      </div>

      {/* ===============================
          POSLEDNÍ POHYB
      =============================== */}
      {item.last_movement && (
        <div style={{ marginTop: 30, opacity: 0.6 }}>
          Poslední pohyb:{" "}
          <strong>{item.last_movement.type}</strong> ·{" "}
          {item.last_movement.quantity} ks
        </div>
      )}
    </div>
  );
}

/* ===============================
   STYLY
=============================== */

const inputStyle = {
  display: "block",
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 6,
  border: "1px solid #333",
  background: "#000",
  color: "white",
};

const primaryBtn = {
  background: "#16a34a",
  color: "white",
  padding: "10px 16px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
};

const secondaryBtn = {
  background: "#2563eb",
  color: "white",
  padding: "10px 16px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
};
