"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import gssStock from "../data/gssStock";
import auditLog from "../data/auditLog";
import locations from "../data/locations";
import { getAllowedActions } from "../data/stateEngine";

export default function GSSItemDetail() {
  const params = useParams();
  const stockId = params.stockId;

  const stockItem = gssStock.find((i) => i.id === stockId);

  if (!stockItem) {
    return (
      <div style={{ padding: 30 }}>
        <Link href="/gss">← Zpět na GSS</Link>
        <h1>Položka nenalezena</h1>
        <p>StockId: {stockId}</p>
      </div>
    );
  }

  const dmItems = stockItem.dm_items || [];

  const countNew = dmItems.filter((d) => d.condition === "new").length;
  const countSharpened = dmItems.filter((d) => d.condition === "sharpened").length;
  const countInUse = dmItems.filter((d) => d.status === "in_production").length;

  return (
    <div style={{ padding: 30, maxWidth: 1100 }}>
      <Link href="/gss" style={{ color: "#7aa2ff" }}>
        ← Zpět na GSS
      </Link>

      {/* HLAVIČKA */}
      <div style={{ marginTop: 20, marginBottom: 30 }}>
        <h1>{stockItem.name || "Neznámá položka"}</h1>
        <div style={{ opacity: 0.7 }}>
          StockId: {stockItem.id} <br />
          Typ: {stockItem.type || "—"} | Režim: {stockItem.mode}
        </div>
      </div>

      {/* STAVOVÁ LIŠTA */}
      <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
        <StatusCard title="Skladem – nové" value={countNew} color="#4da3ff" />
        <StatusCard title="Skladem – ostřené" value={countSharpened} color="#6bd26b" />
        <StatusCard title="V oběhu" value={countInUse} color="#f0b94d" />
      </div>

      {/* DM KUSY */}
      <h2>DM kusy</h2>

      {dmItems.length === 0 ? (
        <p style={{ opacity: 0.6 }}>Zatím nejsou evidovány žádné DM kusy.</p>
      ) : (
        <table style={{ width: "100%", marginBottom: 30 }}>
          <thead>
            <tr>
              <th align="left">DM kód</th>
              <th align="left">Stav</th>
              <th align="left">Lokace</th>
              <th align="left">Přebroušení</th>
              <th align="left">Akce</th>
            </tr>
          </thead>
          <tbody>
            {dmItems.map((dm) => {
              const allowed = getAllowedActions(dm.status);

              return (
                <tr key={dm.dm_code}>
                  <td>{dm.dm_code}</td>
                  <td>{dm.status}</td>
                  <td>{dm.location || "—"}</td>
                  <td>
                    {dm.sharpen_count}/{dm.max_sharpen}
                  </td>
                  <td>
                    {allowed.length === 0 ? (
                      <span style={{ opacity: 0.4 }}>—</span>
                    ) : (
                      allowed.map((a) => (
                        <button
                          key={a}
                          disabled
                          style={{ marginRight: 8, opacity: 0.5 }}
                        >
                          {a}
                        </button>
                      ))
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* AUDIT LOG */}
      <h2>Historie pohybů</h2>

      <table style={{ width: "100%", opacity: 0.9 }}>
        <thead>
          <tr>
            <th align="left">Čas</th>
            <th align="left">DM</th>
            <th align="left">Akce</th>
            <th align="left">Lokace</th>
            <th align="left">Uživatel</th>
          </tr>
        </thead>
        <tbody>
          {auditLog
            .filter((a) => a.dm_code?.includes(stockItem.id))
            .map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.dm_code}</td>
                <td>{log.action}</td>
                <td>{log.location}</td>
                <td>{log.user}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

/* ===== POMOCNÉ KOMPONENTY ===== */

function StatusCard({ title, value, color }) {
  return (
    <div
      style={{
        border: `1px solid ${color}`,
        borderRadius: 10,
        padding: 20,
        minWidth: 180,
      }}
    >
      <div style={{ opacity: 0.7 }}>{title}</div>
      <div style={{ fontSize: 32, color }}>{value}</div>
    </div>
  );
}
