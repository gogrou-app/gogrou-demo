"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppContext } from "../../context/AppContext";
import { gssData } from "../data/gssStore";

export default function GssItemDetailPage() {
  const { id } = useParams();
  const { company, warehouse, setModule } = useAppContext();

  useEffect(() => {
    setModule("GSS – Detail položky");
  }, [setModule]);

  const items = gssData?.[company]?.[warehouse] || [];
  const item = items.find((i) => i.id === id);

  if (!item) {
    return (
      <div style={{ padding: 30, color: "white" }}>
        Položka nenalezena
      </div>
    );
  }

  return (
    <div style={{ padding: 30, color: "white", maxWidth: 900 }}>
      <h1>{item.name}</h1>
      <p style={{ opacity: 0.7 }}>{item.type}</p>

      <hr style={{ margin: "20px 0", borderColor: "#222" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <h3>📦 Stav kusů</h3>
          <div>Nové: <b>{item.qty_new || 0}</b></div>
          <div>Broušené: <b>{item.qty_sharpened || 0}</b></div>
          <div>Vrácené: <b>{item.qty_used || 0}</b></div>
        </div>

        <div>
          <h3>⚙️ Nastavení</h3>
          <div>
            Brousitelný:{" "}
            <b>{item.resharpenable ? "ANO" : "NE"}</b>
          </div>
          <div>
            Max. přebroušení:{" "}
            <b>{item.max_resharpens ?? "-"}</b>
          </div>
          <div>
            DM tracking:{" "}
            <b>{item.dm_tracking ? "ANO" : "NE"}</b>
          </div>
        </div>

        <div>
          <h3>📊 Limity – hlavní sklad</h3>
          <div>
            MIN: <b>{item.min ?? "-"}</b>
          </div>
          <div>
            MAX: <b>{item.max ?? "-"}</b>
          </div>
        </div>

        <div>
          <h3>🔁 Návrat po broušení</h3>
          <div style={{ opacity: 0.7 }}>
            Vrátit na původní dceřiný sklad:{" "}
            <b>
              {item.dm_tracking ? "ANO (DM)" : "NE"}
            </b>
          </div>
        </div>
      </div>

      <hr style={{ margin: "30px 0", borderColor: "#222" }} />

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => console.log("ADD")}>➕ Přidat kus</button>
        <button onClick={() => console.log("REMOVE")}>➖ Odebrat kus</button>
        <button onClick={() => console.log("SHARPEN")}>🔧 Označit k broušení</button>
        <button onClick={() => console.log("SCRAP")}>🗑 Vyřadit</button>
      </div>
    </div>
  );
}
