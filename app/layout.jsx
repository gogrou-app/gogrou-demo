"use client";

import { usePathname } from "next/navigation";
import { AppProvider, useAppContext } from "./context/AppContext";

function LayoutInner({ children }) {
  const pathname = seePathnameSafe();
  const { companies, company, warehouse, setCompanyId, setWarehouseId } =
    useAppContext();

  let moduleLabel = "Dashboard";

  if (pathname.startsWith("/gpc")) moduleLabel = "GPC – Produktový katalog";
  else if (pathname.startsWith("/gss")) moduleLabel = "GSS – Skladový systém";
  else if (pathname.startsWith("/smartsplit")) moduleLabel = "SmartSplit";

  return (
    <div>
      {/* LEVÉ MENU */}
      <div
        style={{
          width: 220,
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          background: "#111",
          padding: 20,
          borderRight: "1px solid #222",
        }}
      >
        <h2>GOGROU<br />DEMO</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a href="/" style={nav}>Dashboard</a>
          <a href="/gpc" style={nav}>GPC</a>
          <a href="/gss" style={nav}>GSS</a>
          <a href="/smartsplit" style={nav}>SmartSplit</a>
          <a href="#" style={nav}>AI Assistant</a>
        </nav>
      </div>

      {/* OBSAH */}
      <div style={{ marginLeft: 220, padding: 32 }}>
        {/* 🔥 GLOBÁLNÍ HLAVIČKA */}
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            padding: "10px 14px",
            marginBottom: 24,
            background: "#0b0b0b",
            border: "1px solid #222",
            borderRadius: 10,
            fontSize: 14,
          }}
        >
          <strong>Firma:</strong>
          <select
            value={company.id}
            onChange={(e) => {
              const c = companies.find(x => x.id === e.target.value);
              setCompanyId(c.id);
              setWarehouseId(c.warehouses.find(w => w.is_default)?.id);
            }}
          >
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <strong>Modul:</strong> {moduleLabel}

          {warehouse && (
            <>
              <strong>Sklad:</strong>
              <select
                value={warehouse.id}
                onChange={(e) => setWarehouseId(e.target.value)}
              >
                {company.warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body style={{ margin: 0, background: "#000", color: "#fff" }}>
        <AppProvider>
          <LayoutInner>{children}</LayoutInner>
        </AppProvider>
      </body>
    </html>
  );
}

function seePathnameSafe() {
  try {
    return usePathname() || "/";
  } catch {
    return "/";
  }
}

const nav = {
  color: "#fff",
  textDecoration: "none",
  background: "#1a1a1a",
  padding: "8px 12px",
  borderRadius: 6,
};
