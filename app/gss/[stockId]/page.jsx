"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getMainWarehouseStock,
  updateServiceSettings,
  getServiceSettings,
} from "../data/gssStore";

export default function GssStockDetailPage() {
  const { stockId } = useParams();
  const [stockItem, setStockItem] = useState(null);
  const [service, setService] = useState(null);

  useEffect(() => {
    const items = getMainWarehouseStock();
    const found = items.find(
      (i) => String(i.gss_stock_id) === String(stockId)
    );
    setStockItem(found || null);
    setService(getServiceSettings(stockId));
  }, [stockId]);

  if (!stockItem) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        <h2>Položka nenalezena</h2>
      </div>
    );
  }

  function updateService(partial) {
    const next = {
      sharpenable: service?.sharpenable ?? false,
      max_resharpens: service?.max_resharpens ?? 0,
      service_provider: service?.service_provider ?? "MTTM",
      note: service?.note ?? "",
      ...partial,
    };

    updateServiceSettings(stockId, next);
    setService(next);
  }

  return (
    <div style={{ padding: 40, color: "white", maxWidth: 900 }}>
      <h1>{stockItem.name}</h1>

      <div style={{ opacity: 0.6, marginBottom: 20 }}>
        GSS STOCK · {stockItem.gpc_id}
      </div>

      {/* ========================= */}
      {/* SERVIS / OSTŘENÍ BOX */}
      {/* ========================= */}
      <div
        style={{
          border: "1px solid #222",
          borderRadius: 12,
          padding: 20,
          marginTop: 30,
          background: "#0b0b0b",
        }}
      >
        <h3 style={{ marginBottom: 16 }}>
          🔧 Servis / ostření nástroje
        </h3>

        {/* Brousitelný */}
        <label style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input
            type="checkbox"
            checked={service?.sharpenable || false}
            onChange={(e) =>
              updateService({ sharpenable: e.target.checked })
            }
          />
          <span>Nástroj je brousitelný</span>
        </label>

        {/* Max přebroušení */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ opacity: 0.7, marginBottom: 6 }}>
            Maximální počet přebroušení
          </div>
          <input
            type="number"
            min={0}
            disabled={!service?.sharpenable}
            value={service?.max_resharpens ?? 0}
            onChange={(e) =>
              updateService({
                max_resharpens: Number(e.target.value),
              })
            }
            style={{
              width: 120,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #333",
              background: "#000",
              color: "white",
            }}
          />
          <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>
            1× nový + X× přeostřený
          </div>
        </div>

        {/* Brusírna */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ opacity: 0.7, marginBottom: 6 }}>
            Brusírna / servis
          </div>
          <select
            value={service?.service_provider || "MTTM"}
            onChange={(e) =>
              updateService({ service_provider: e.target.value })
            }
            disabled={!service?.sharpenable}
            style={{
              padding: 8,
              borderRadius: 6,
              border: "1px solid #333",
              background: "#000",
              color: "white",
            }}
          >
            <option value="MTTM">MTTM (default)</option>
            <option value="JINA_BRUSIRNA">Jiná brusírna</option>
          </select>
        </div>

        {/* Poznámka */}
        <div>
          <div style={{ opacity: 0.7, marginBottom: 6 }}>
            Poznámka (povlak, omezení, cokoliv)
          </div>
          <textarea
            rows={3}
            disabled={!service?.sharpenable}
            value={service?.note || ""}
            onChange={(e) =>
              updateService({ note: e.target.value })
            }
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              border: "1px solid #333",
              background: "#000",
              color: "white",
            }}
          />
        </div>
      </div>
    </div>
  );
}
