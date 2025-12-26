"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import gssStockDataImport from "../data/gssStock";
import gpcToolsImport from "../../gpc/data";

function safeClone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj;
  }
}

export default function GssItemDetailPage() {
  const { stockId } = useParams();

  // ✅ pojistka: kdyby import nebyl pole
  const gssStockData = Array.isArray(gssStockDataImport)
    ? gssStockDataImport
    : (gssStockDataImport?.default && Array.isArray(gssStockDataImport.default))
    ? gssStockDataImport.default
    : [];

  const gpcTools = Array.isArray(gpcToolsImport)
    ? gpcToolsImport
    : (gpcToolsImport?.default && Array.isArray(gpcToolsImport.default))
    ? gpcToolsImport.default
    : [];

  const [stockState, setStockState] = useState(() => {
    const s = gssStockData.find((x) => String(x.gss_stock_id) === String(stockId));
    return s ? safeClone(s) : null;
  });

  const [uiInfo, setUiInfo] = useState("");
  const [uiError, setUiError] = useState("");

  if (!stockState) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        <h2>Položka nenalezena</h2>
        <Link href="/gss" style={{ color: "#4da6ff", fontWeight: "bold" }}>
          ← Zpět na GSS
        </Link>
      </div>
    );
  }

  const tool = gpcTools.find((t) => String(t.gpc_id) === String(stockState.gpc_id));

  function issueToProduction() {
    setUiError("");
    setUiInfo("");

    const qty = Number(stockState.quantity || 0);
    if (qty <= 0) {
      setUiError("Není co vydat – stav skladu je 0 ks.");
      return;
    }

    setStockState((prev) => ({
      ...prev,
      quantity: Number(prev.quantity || 0) - 1,
    }));

    setUiInfo("Kus vydán do výroby (−1 ks).");
  }

  return (
    <div style={{ padding: 30, color: "white", maxWidth: 1000 }}>
      <Link href="/gss" style={{ color: "#4da6ff", fontWeight: "bold" }}>
        ← Zpět na GSS
      </Link>

      <div
        style={{
          background: "#111",
          padding: 20,
          borderRadius: 12,
          border: "1px solid #333",
          marginTop: 16,
        }}
      >
        <h1 style={{ margin: 0 }}>{tool?.name || "Neznámá položka"}</h1>
        <div style={{ opacity: 0.8, marginTop: 6 }}>Typ: {tool?.type || "—"}</div>
        <div style={{ opacity: 0.6, marginTop: 6 }}>
          Hlavní sklad: {stockState.default_location || "—"}
        </div>
      </div>

      {(uiInfo || uiError) && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 10,
            background: uiError ? "#2a1414" : "#102214",
            border: "1px solid #333",
            color: uiError ? "#ffb3b3" : "#b8ffbf",
          }}
        >
          {uiError || uiInfo}
        </div>
      )}

      <div
        style={{
          marginTop: 18,
          background: "#111",
          padding: 16,
          borderRadius: 12,
          border: "1px solid #333",
        }}
      >
        <div style={{ fontSize: 14, opacity: 0.7 }}>Aktuální stav</div>
        <div style={{ fontSize: 34, fontWeight: "bold", color: "#4da6ff" }}>
          {Number(stockState.quantity || 0)} ks
        </div>
      </div>

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
            cursor: "pointer",
          }}
        >
          Vydat do výroby
        </button>
      </div>
    </div>
  );
}
