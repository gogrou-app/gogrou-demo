// /app/layout.jsx
"use client";

import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // určení modulu podle URL
  let moduleLabel = "Dashboard";
  let warehouseLabel = null;

  if (pathname.startsWith("/gpc")) {
    moduleLabel = "GPC – Produktový katalog";
  } else if (pathname.startsWith("/gss")) {
    moduleLabel = "GSS – Skladový systém";
    warehouseLabel = "Hlavní sklad";
  } else if (pathname.startsWith("/smartsplit")) {
    moduleLabel = "SmartSplit";
  }

  return (
    <html lang="cs">
      <body
        style={{
          margin: 0,
          background: "#000",
          color: "#fff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* LEVÉ MENU – zatím beze změn */}
        <div
          style={{
            width: 220,
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            background: "#111",
            padding: 20,
            boxSizing: "border-box",
            borderRight: "1px solid #222",
          }}
        >
          <h2 style={{ marginTop: 0 }}>GOGROU<br />DEMO</h2>

          <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a href="/" style={navStyle}>Dashboard</a>
            <a href="/gpc" style={navStyle}>GPC</a>
            <a href="/gss" style={navStyle}>GSS</a>
            <a href="/smartsplit" style={navStyle}>SmartSplit</a>
            <a href="#" style={navStyle}>AI Assistant</a>
          </nav>
        </div>

        {/* HLAVNÍ OBSAH */}
        <div
          style={{
            marginLeft: 220,
            padding: "24px 32px",
            boxSizing: "border-box",
          }}
        >
          {/* 🔥 CENTRÁLNÍ HLAVIČKA – VŠUDE */}
          <div
            style={{
              marginBottom: 20,
              padding: "10px 14px",
              border: "1px solid #222",
              borderRadius: 10,
              background: "#0b0b0b",
              fontSize: 14,
              opacity: 0.9,
            }}
          >
            <strong>Firma:</strong> Gogrou Demo s.r.o.
            {"  •  "}
            <strong>Modul:</strong> {moduleLabel}
            {warehouseLabel && (
              <>
                {"  •  "}
                <strong>Sklad:</strong> {warehouseLabel}
              </>
            )}
          </div>

          {children}
        </div>
      </body>
    </html>
  );
}

const navStyle = {
  color: "#fff",
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: 6,
  background: "#1a1a1a",
};
