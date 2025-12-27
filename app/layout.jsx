"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // ===== DEMO KONTEXT (zatím natvrdo) =====
  const companyName = "Gogrou Demo s.r.o.";

  let moduleName = "Dashboard";
  let warehouseName = null;

  if (pathname.startsWith("/gss")) {
    moduleName = "GSS – Skladový systém";
    warehouseName = "Hlavní sklad";
  }

  if (pathname.startsWith("/gpc")) {
    moduleName = "GPC – Produktová databáze";
  }

  if (pathname.startsWith("/smartsplit")) {
    moduleName = "SmartSplit";
  }

  if (pathname.startsWith("/ai")) {
    moduleName = "AI Assistant";
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
        {/* ===== LEVÉ MENU ===== */}
        <div
          style={{
            width: 220,
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            background: "#111",
            borderRight: "1px solid #222",
            padding: 20,
            boxSizing: "border-box",
          }}
        >
          <h2 style={{ marginTop: 0 }}>GOGROU<br />DEMO</h2>

          <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/" style={navStyle}>Dashboard</Link>
            <Link href="/gpc" style={navStyle}>GPC</Link>
            <Link href="/gss" style={navStyle}>GSS</Link>
            <Link href="/smartsplit" style={navStyle}>SmartSplit</Link>
            <Link href="/ai" style={navStyle}>AI Assistant</Link>
          </nav>
        </div>

        {/* ===== OBSAH ===== */}
        <div
          style={{
            marginLeft: 220,
            padding: 30,
            boxSizing: "border-box",
          }}
        >
          {/* ===== GLOBÁLNÍ HLAVIČKA ===== */}
          <div
            style={{
              background: "#0b0b0b",
              border: "1px solid #222",
              borderRadius: 10,
              padding: "10px 16px",
              marginBottom: 24,
              fontSize: 14,
              opacity: 0.9,
            }}
          >
            <strong>Firma:</strong> {companyName}
            {"  •  "}
            <strong>Modul:</strong> {moduleName}
            {warehouseName && (
              <>
                {"  •  "}
                <strong>Sklad:</strong> {warehouseName}
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
  color: "white",
  textDecoration: "none",
  padding: "8px 10px",
  borderRadius: 6,
  background: "#1a1a1a",
};
