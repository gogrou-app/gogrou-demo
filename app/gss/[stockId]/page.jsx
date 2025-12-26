"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import gssStock from "../data/gssStock";
import locations from "../data/locations";

import {
  ACTIONS,
  applyActionToDmItem,
  getAllowedActions,
} from "../data/stateEngine";

export default function GssItemDetailPage() {
  const { stockId } = useParams();
  const router = useRouter();

  const stock = gssStock.find(
    (item) => String(item.gss_item_id) === String(stockId)
  );

  // 🔹 lokální stav DM kusů (DEMO – zatím bez persistence)
  const [dmItems, setDmItems] = useState(stock?.items || []);

  if (!stock) {
    return <div style={{ padding: 20 }}>Položka nenalezena</div>;
  }

  // ======= STATISTIKY =======
  const countNew = dmItems.filter(
    (i) => i.status === "in_stock" && i.resharpen_count === 0
  ).length;

  const countSharpened = dmItems.filter(
    (i) => i.status === "in_stock" && i.resharpen_count > 0
  ).length;

  const countInProduction = dmItems.filter(
    (i) => i.status === "in_production"
  ).length;

  // ======= AKCE =======
  function handleAction(dmCode, action) {
    setDmItems((prev) =>
      prev.map((item) => {
        if (item.dm_code !== dmCode) return item;

        const result = applyActionToDmItem(item, action, {
          locationId: "CNC_01", // DEMO – později výběr z locations
        });

        if (!result.ok) {
          alert(result.error);
          return item;
        }

        return result.item;
      })
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* ZPĚT */}
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => router.push("/gss")}>
          ← Zpět na GSS
        </button>
      </div>

      {/* HLAVIČKA */}
      <div
        style={{
          background: "#111",
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <h1 style={{ marginBottom: 6 }}>{stock.name}</h1>
        <div style={{ opacity: 0.7 }}>
          Typ: {stock.type || "—"} | Režim: {stock.mode}
        </div>
        <div style={{ opacity: 0.7 }}>
          Hlavní sklad: {stock.main_location}
        </div>
      </div>

      {/* STAVOVÉ KARTY */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 30,
        }}
      >
        <StatCard title="Skladem – nové" value={countNew} />
        <StatCard title="Skladem – ostřené" value={countSharpened} />
        <StatCard title="V oběhu" value={countInProduction} />
      </div>

      {/* DM TABULKA */}
      <h2 style={{ marginBottom: 10 }}>DM kusy</h2>

      <table width="100%" cellPadding={8}>
        <thead>
          <tr style={{ textAlign: "left", opacity: 0.7 }}>
            <th>DM kód</th>
            <th>Stav</th>
            <th>Přebroušení</th>
            <th>Lokace</th>
            <th>Akce (demo)</th>
          </tr>
        </thead>
        <tbody>
          {dmItems.map((item) => {
            const allowed = getAllowedActions(item.status);

            return (
              <tr key={item.dm_code}>
                <td>{item.dm_code}</td>
                <td>{item.status}</td>
                <td>
                  {item.resharpen_count} / {item.max_resharpen_count}
                </td>
                <td>{item.current_location_id || "—"}</td>
                <td>
                  {allowed.map((action) => (
                    <button
                      key={action}
                      onClick={() => handleAction(item.dm_code, action)}
                      style={{
                        marginRight: 6,
                        padding: "4px 8px",
                        fontSize: 12,
                      }}
                    >
                      {action}
                    </button>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ======= KOMPONENTY =======

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "#111",
        padding: 16,
        borderRadius: 12,
      }}
    >
      <div style={{ opacity: 0.7, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 28 }}>{value}</div>
    </div>
  );
}
