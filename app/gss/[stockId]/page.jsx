"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import gssStock from "../data/gssStock";
import auditLog from "../data/auditLog";
import locations from "../data/locations";
import { scanDmCode } from "../data/dmScanner";

export default function GssItemDetail() {
  const params = useParams();
  const stockId = params.stockId;

  const stockItem = gssStock.find(s => s.stockId === stockId);

  if (!stockItem) {
    return (
      <div>
        <Link href="/gss">← Zpět na GSS</Link>
        <h1>Neznámá položka</h1>
        <p>StockId: {stockId}</p>
      </div>
    );
  }

  const dmItems = stockItem.dm_items || [];

  const countNew = dmItems.filter(d => d.status === "in_stock" && d.sharpening_count === 0).length;
  const countSharpened = dmItems.filter(d => d.status === "in_stock" && d.sharpening_count > 0).length;
  const countInProduction = dmItems.filter(d => d.status === "in_production").length;

  // 🔵 TEST SCAN – simulace DM čtečky
  const testScan = () => {
    try {
      const result = scanDmCode({
        dmCode: "DM-SANDVIK-0001",
        action: "SEND_TO_PRODUCTION",
        targetLocation: "machine:CNC_MAZAK_01",
        user: "operator:demo"
      });

      alert(
        `DM ${result.dm.dm_code}\nNový stav: ${result.status}\nLokace: machine:CNC_MAZAK_01`
      );
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <Link href="/gss">← Zpět na GSS</Link>

      {/* HLAVIČKA */}
      <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #333", borderRadius: "10px" }}>
        <h1>{stockItem.name}</h1>
        <p>Typ: {stockItem.type || "—"} | Režim: DM</p>
        <p>Hlavní sklad: {stockItem.main_location}</p>
      </div>

      {/* STAVOVÉ KARTY */}
      <div style={{ display: "flex", gap: "16px", marginTop: "20px" }}>
        <div style={{ flex: 1, border: "1px solid #2563eb", padding: "16px", borderRadius: "10px" }}>
          <div>Skladem – nové</div>
          <strong style={{ fontSize: "24px" }}>{countNew}</strong>
        </div>

        <div style={{ flex: 1, border: "1px solid #22c55e", padding: "16px", borderRadius: "10px" }}>
          <div>Skladem – ostřené</div>
          <strong style={{ fontSize: "24px" }}>{countSharpened}</strong>
        </div>

        <div style={{ flex: 1, border: "1px solid #f59e0b", padding: "16px", borderRadius: "10px" }}>
          <div>V oběhu</div>
          <strong style={{ fontSize: "24px" }}>{countInProduction}</strong>
        </div>
      </div>

      {/* DM KUSY */}
      <h2 style={{ marginTop: "30px" }}>DM kusy</h2>
      <table width="100%" style={{ borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr>
            <th align="left">DM kód</th>
            <th align="left">Stav</th>
            <th align="left">Přebroušení</th>
            <th align="left">Lokace</th>
          </tr>
        </thead>
        <tbody>
          {dmItems.map(dm => (
            <tr key={dm.dm_code}>
              <td>{dm.dm_code}</td>
              <td>{dm.status}</td>
              <td>{dm.sharpening_count}</td>
              <td>{dm.location}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* AKCE – DEMO */}
      <h2 style={{ marginTop: "30px" }}>Akce (demo)</h2>

      <button
        onClick={testScan}
        style={{
          marginTop: "10px",
          padding: "10px 16px",
          background: "#2563eb",
          color: "white",
          borderRadius: "6px",
          border: "none"
        }}
      >
        TEST – simulovat scan DM
      </button>

      {/* AUDIT LOG */}
      <h2 style={{ marginTop: "40px" }}>Historie pohybů</h2>
      <table width="100%" style={{ borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr>
            <th align="left">Čas</th>
            <th align="left">DM</th>
            <th align="left">Akce</th>
            <th align="left">Z → Do</th>
            <th align="left">Lokace</th>
            <th align="left">Uživatel</th>
          </tr>
        </thead>
        <tbody>
          {auditLog
            .filter(a => dmItems.some(d => d.dm_code === a.dm_code))
            .map(a => (
              <tr key={a.id}>
                <td>{a.timestamp}</td>
                <td>{a.dm_code}</td>
                <td>{a.action}</td>
                <td>{a.from_status || "—"} → {a.to_status}</td>
                <td>{a.location}</td>
                <td>{a.user}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
