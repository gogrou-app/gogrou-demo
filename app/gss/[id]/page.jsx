"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getStockItemById,
  receiveStock,
  issueStock,
  updateStockMinMax,
  sendToGrinding,
  returnFromGrinding,
} from "../data/gssStore";

export default function GssStockDetailPage() {
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [inQty, setInQty] = useState("");
  const [outQty, setOutQty] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  function refresh() {
    const data = getStockItemById(id);
    setItem({ ...data });
    setMin(data?.min ?? "");
    setMax(data?.max ?? "");
  }

  useEffect(() => {
    refresh();
  }, [id]);

  if (!item) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        <h2>Položka nenalezena</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, color: "white", maxWidth: 900 }}>
      <h1>{item.name}</h1>

      <div style={{ opacity: 0.7, marginBottom: 20 }}>
        ID: {item.id}
      </div>

      {/* STAV */}
      <div
        style={{
          border: "1px solid #222",
          borderRadius: 12,
          padding: 20,
          background: "#0b0b0b",
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 14, opacity: 0.6 }}>Skladem</div>
        <div style={{ fontSize: 32, fontWeight: "bold" }}>
          {item.count} ks
        </div>

        {item.grinding && (
          <div
            style={{
              marginTop: 10,
              padding: 10,
              borderRadius: 8,
              background: "#2a1f14",
              color: "#ffd089",
              fontWeight: "bold",
            }}
          >
            🔧 NÁSTROJ JE NA BROUŠENÍ
          </div>
        )}
      </div>

      {/* PŘÍJEM / VÝDEJ */}
      <div
        style={{
          border: "1px solid #222",
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <h3>Příjem / Výdej</h3>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <input
            placeholder="+ ks"
            value={inQty}
            onChange={(e) => setInQty(e.target.value)}
          />
          <button
            onClick={() => {
              receiveStock(item.id, Number(inQty));
              setInQty("");
              refresh();
            }}
          >
            Přijmout
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <input
            placeholder="- ks"
            value={outQty}
            onChange={(e) => setOutQty(e.target.value)}
          />
          <button
            onClick={() => {
              issueStock(item.id, Number(outQty));
              setOutQty("");
              refresh();
            }}
          >
            Vydat
          </button>
        </div>
      </div>

      {/* MIN / MAX */}
      <div
        style={{
          border: "1px solid #222",
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}
      >
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
          style={{ marginLeft: 10 }}
          onClick={() => {
            updateStockMinMax(item.id, Number(min), Number(max));
            refresh();
          }}
        >
          Uložit
        </button>
      </div>

      {/* BROUŠENÍ */}
      <div
        style={{
          border: "1px solid #222",
          borderRadius: 12,
          padding: 20,
        }}
      >
        <h3>Servis / broušení</h3>

        {!item.grinding ? (
          <button
            onClick={() => {
              sendToGrinding(item.id);
              refresh();
            }}
          >
            Odeslat na broušení
          </button>
        ) : (
          <button
            onClick={() => {
              returnFromGrinding(item.id);
              refresh();
            }}
          >
            Vrátit z broušení
          </button>
        )}
      </div>
    </div>
  );
}
