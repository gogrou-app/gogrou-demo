"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getStockItemById,
  updateStockMinMax,
  receiveStock,
  issueStock,
  updateServiceConfig,
  incrementUseCount,
} from "../data/gssStore";

export default function GssStockDetailPage() {
  const { stockId } = useParams();
  const router = useRouter();

  const [item, setItem] = useState(null);

  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [receiveQty, setReceiveQty] = useState("");
  const [issueQty, setIssueQty] = useState("");

  const [service, setService] = useState({
    sharpenable: false,
    max_sharpenings: 0,
    grinder: "MTTM",
    note: "",
    use_count: 0,
  });

  function load() {
    const ctx = getStockItemById(stockId);
    if (!ctx?.item) {
      setItem(null);
      return;
    }

    setItem(ctx.item);
    setMin(ctx.item.min ?? "");
    setMax(ctx.item.max ?? "");

    // map V2 -> UI
    setService({
      sharpenable: !!ctx.item.service_enabled,
      max_sharpenings: Number(ctx.item.max_resharpen || 0),
      grinder: ctx.item.grinder || "MTTM",
      note: ctx.item.service_note || "",
      use_count: Number(ctx.item.uses_count || 0),
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stockId]);

  if (!item) {
    return (
      <div style={{ padding: 40, color: "white" }}>
        <h2>Položka nenalezena</h2>
        <button onClick={() => router.push("/gss")}>← Zpět</button>
      </div>
    );
  }

  const maxUses = 1 + (service.max_sharpenings || 0);
  const recommendDiscard = service.sharpenable && service.use_count >= maxUses;

  return (
    <div style={{ padding: 40, color: "white", maxWidth: 900 }}>
      <button onClick={() => router.push("/gss")} style={{ marginBottom: 20 }}>
        ← Zpět na sklad
      </button>

      <h1>{item.name}</h1>
      <p style={{ opacity: 0.6 }}>GSS STOCK · {item.gss_stock_id}</p>

      <div style={{ border: "1px solid #222", borderRadius: 12, padding: 18, background: "#0b0b0b", marginBottom: 18 }}>
        <div style={{ fontSize: 14, opacity: 0.6 }}>Skladem</div>
        <div style={{ fontSize: 28, fontWeight: "bold" }}>{item.quantity} ks</div>

        <div style={{ marginTop: 10 }}>
          <button
            onClick={() => {
              incrementUseCount(item.gss_stock_id);
              load();
            }}
            style={{ marginRight: 8 }}
          >
            Vrátit z výroby
          </button>
        </div>

        {service.sharpenable && (
          <div
            style={{
              marginTop: 14,
              padding: "10px 14px",
              borderRadius: 10,
              fontWeight: "bold",
              background: recommendDiscard ? "#2a1414" : service.use_count >= maxUses - 1 ? "#2a2414" : "#142a1a",
              border: "1px solid #333",
            }}
          >
            🔧 Použití: {service.use_count} / {maxUses}
            {recommendDiscard && <span style={{ marginLeft: 10 }}>⚠️ Doporučeno vyřadit</span>}
          </div>
        )}
      </div>

      <div style={{ border: "1px solid #222", borderRadius: 12, padding: 18, marginBottom: 18 }}>
        <h3>Min / Max</h3>
        <input placeholder="MIN" value={min} onChange={(e) => setMin(e.target.value)} />
        <input placeholder="MAX" value={max} onChange={(e) => setMax(e.target.value)} style={{ marginLeft: 10 }} />
        <button
          onClick={() => {
            updateStockMinMax(item.gss_stock_id, min, max);
            load();
          }}
          style={{ marginLeft: 10 }}
        >
          Uložit
        </button>
      </div>

      <div style={{ border: "1px solid #222", borderRadius: 12, padding: 18, marginBottom: 18 }}>
        <h3>Příjem / Výdej</h3>

        <input placeholder="Příjem +ks" value={receiveQty} onChange={(e) => setReceiveQty(e.target.value)} />
        <button
          onClick={() => {
            receiveStock(item.gss_stock_id, receiveQty);
            setReceiveQty("");
            load();
          }}
          style={{ marginLeft: 8 }}
        >
          Přijmout
        </button>

        <br />

        <input placeholder="Výdej -ks" value={issueQty} onChange={(e) => setIssueQty(e.target.value)} style={{ marginTop: 10 }} />
        <button
          onClick={() => {
            issueStock(item.gss_stock_id, issueQty);
            setIssueQty("");
            load();
          }}
          style={{ marginLeft: 8 }}
        >
          Vydat
        </button>
      </div>

      <div style={{ border: "1px solid #222", borderRadius: 12, padding: 18 }}>
        <h3>Servis / ostření</h3>

        <label>
          <input
            type="checkbox"
            checked={service.sharpenable}
            onChange={(e) => setService({ ...service, sharpenable: e.target.checked })}
          />
          &nbsp;Nástroj je brousitelný
        </label>

        <div style={{ marginTop: 8 }}>
          Max. přebroušení (X):
          <input
            value={service.max_sharpenings}
            onChange={(e) => setService({ ...service, max_sharpenings: Number(e.target.value) })}
            style={{ marginLeft: 10 }}
          />
        </div>

        <div style={{ marginTop: 8 }}>
          Brusírna:
          <select value={service.grinder} onChange={(e) => setService({ ...service, grinder: e.target.value })} style={{ marginLeft: 10 }}>
            <option value="MTTM">MTTM (default)</option>
          </select>
        </div>

        <div style={{ marginTop: 8 }}>
          Poznámka:
          <textarea value={service.note} onChange={(e) => setService({ ...service, note: e.target.value })} style={{ width: "100%", marginTop: 4 }} />
        </div>

        <button
          onClick={() => {
            updateServiceConfig(item.gss_stock_id, service);
            load();
          }}
          style={{ marginTop: 10 }}
        >
          Uložit servisní nastavení
        </button>
      </div>
    </div>
  );
}
