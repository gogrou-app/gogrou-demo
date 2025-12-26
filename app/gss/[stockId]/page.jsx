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

  const [dmItems, setDmItems] = useState(stock?.items || {});
  const [selectedLocations, setSelectedLocations] = useState({});

  if (!stock) {
    return <div style={{ padding: 20 }}>Položka nenalezena</div>;
  }

  // ===== STATISTIKY =====
  const countNew = dmItems.filter(
    (i) => i.status === "in_stock" && i.resharpen_count === 0
  ).length;

  const countSharpened = dmItems.filter(
    (i) => i.status === "in_stock" && i.resharpen_count > 0
  ).length;

  const countInProduction = dmItems.filter(
    (i) => i.status === "in_production"
  ).length;

  // ===== AKCE =====
  function handleAction(dmCode, action) {
    const locationId = selectedLocations[dmCode] || null;

    const needsLocation =
      action === ACTIONS.SEND_TO_PRODUCTION ||
      action === ACTIONS.SEND_TO_SERVICE;

    if (needsLocation && !locationId) {
      alert("Vyber lokaci");
      return;
    }

    setDmItems((prev) =>
      prev.map((item) => {
        if (item.dm_code !== dmCode) return item;

        const result = applyActionToDmItem(item, action, {
          locationId,
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
      <button onClick={() => router.push("/gss")}>
        ← Zpět na GSS
      </button>

      {/* HLAVIČKA */}
      <div
        style={{
          background: "#111",
          padding: 20,
          borderRadius: 12,
          margin: "16px 0 24px",
        }}
      >
        <h1>{stock.name}</h1>
        <div style={{ opacity: 0.7 }}>
          Typ: {stock.type || "—"} | Režim: {stock.mode}
        </div>
      </div>

      {/* STAVY */}
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
      <h2>DM kusy</h2>

      <table width="100%" cellPadding={8}>
        <thead>
          <tr style={{ opacity: 0.7 }}>
            <th>DM kód</th>
            <th>Stav</th>
            <th>Přebroušení</th>
            <th>Lokace</th>
            <th>Akce</th>
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

                {/* DROPDOWN LOKACE */}
                <td>
                  <select
                    value={selectedLocations[item.dm_code] || ""}
                    onChange={(e) =>
                      setSelectedLocations((prev) => ({
                        ...prev,
                        [item.dm_code]: e.target.value,
                      }))
                    }
                  >
                    <option value="">— vyber —</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </td>

                {/* AKCE */}
                <td>
                  {allowed.map((action) => (
                    <button
                      key={action}
                      onClick={() =>
                        handleAction(item.dm_code, action)
                      }
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

// ===== KOMPONENTY =====

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "#111",
        padding: 16,
        borderRadius: 12,
      }}
    >
      <div style={{ opacity: 0.7 }}>{title}</div>
      <div style={{ fontSize: 28 }}>{value}</div>
    </div>
  );
}
