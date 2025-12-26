"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import gssStockData from "../data/gssStock";
import gpcTools from "../../gpc/data";
import locations from "../data/locations";

export default function GssItemDetailPage() {
  const { stockId } = useParams();

  const [stockState, setStockState] = useState(() => {
    const s = gssStockData.find(
      (x) => String(x.gss_stock_id) === String(stockId)
    );
    return s ? structuredClone(s) : null;
  });

  const [uiInfo, setUiInfo] = useState("");
  const [uiError, setUiError] = useState("");

  if (!stockState) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        <h2>Položka nenalezena</h2>
        <Link href="/gss" style={{ color: "#4da6ff" }}>
          ← Zpět na GSS
        </Link>
      </div>
    );
  }

  const tool = gpcTools.find(
    (t) => String(t.gpc_id) === String(stockState.gpc_id)
  );

  // ====== AKCE: vydat do výroby (KUSOVĚ) ======
  function issueToProduction() {
    setUiError("");
    setUiInfo("");

    if (stockState.quantity <= 0) {
      setUiError("Není co vydat – stav skladu je 0 ks.");
      return;
    }

    setStockState((prev) => ({
      ...prev,
      quantity: prev.quantity - 1
    }));

    setUiInfo("Kus vydán do výroby (−1 ks).");
  }

  return (
    <div style={{ padding: 30, color: "white", maxWidth: 1000 }}>
      {/* NAV */}
      <Link href="/gss" style={{ color: "#4da6ff", fontWeight: "bold" }}>
        ← Zpět na GSS
      </Link>

      {/* HLAVIČKA */}
      <div
        style={{
          background: "#111",
          padding: 20,
          borderRadius: 12,
          border: "1px solid #333",
          marginTop: 16
        }}
      >
        <h1>{tool?.name || "Neznámá položka"}</h1>
        <div style={{ opacity: 0.8 }}>
          Typ: {tool?.type || "—"}
        </div>
        <div style={{ opacity: 0.6, marginTop: 6 }}>
          Hlavní sklad: {stockState.default_location}
        </div>
      </div>

      {/* INFO / ERROR */}
      {(uiInfo || uiError) && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 10,
            background: uiError ? "#2a1414" : "#102214",
            border: "1px solid #333",
            color: uiError ? "#ffb3b3" : "#b8ffbf"
          }}
        >
          {uiError || uiInfo}
        </div>
      )}

      {/* STAV */}
      <div
        style={{
          marginTop: 18,
          background: "#111",
          padding: 16,
          borderRadius: 12,
          border: "1px solid #333"
        }}
      >
        <div style={{ fontSize: 14, opacity: 0.7 }}>Aktuální stav</div>
        <div style={{ fontSize: 34, fontWeight: "bold", color: "#4da6ff" }}>
          {stockState.quantity} ks
        </div>
      </div>

      {/* AKCE */}
      <div style={{ marginTop: 18 }}>
        <button
          onClick={issueToProduction}
          style={{
            padding: "12px 18px",
            borderRadius: 10,
            border: "1px solid #2b5",
            background: "#113322",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Vydat do výroby
        </button>
      </div>
    </div>
  );
}
