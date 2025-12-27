"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const companyName = "Gogrou Demo s.r.o.";

  let moduleName = "Dashboard";
  let warehouseName = null;

  if (pathname.startsWith("/gpc")) {
    moduleName = "GPC – Produktový katalog";
  }
  if (pathname.startsWith("/gss")) {
    moduleName = "GSS – Skladový systém";
    warehouseName = "Hlavní sklad";
  }
  if (pathname.startsWith("/smartsplit")) {
    moduleName = "SmartSplit";
  }
  if (pathname.startsWith("/ai")) {
    moduleName = "AI Assistant";
  }

  return (
    <html lang="cs">
      <body style={{ margin: 0, background: "#000", color: "#fff" }}>
        {/* LEVÉ MENU */}
        <aside style={sidebar}>
          <h2>GOGROU<br />DEMO</h2>
          <nav style={nav}>
            <Link href="/" style={navItem}>Dashboard</Link>
            <Link href="/gpc" style={navItem}>GPC</Link>
            <Link href="/gss" style={navItem}>GSS</Link>
            <Link href="/smartsplit" style={navItem}>SmartSplit</Link>
            <Link href="/ai" style={navItem}>AI Assistant</Link>
          </nav>
        </aside>

        {/* OBSAH */}
        <main style={{ marginLeft: 220, padding: 32 }}>
          {/* HLAVIČKA */}
          <div style={contextBar}>
            <strong>Firma:</strong> {companyName}
            {" • "}
            <strong>Modul:</strong> {moduleName}
            {warehouseName && (
              <>
                {" • "}
                <strong>Sklad:</strong> {warehouseName}
              </>
            )}
          </div>

          {children}
        </main>
      </body>
    </html>
  );
}

const sidebar = {
  width: 220,
  height: "100vh",
  position: "fixed",
  left: 0,
  top: 0,
  background: "#111",
  padding: 20,
  borderRight: "1px solid #222",
};

const nav = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const navItem = {
  color: "#fff",
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: 6,
  background: "#1a1a1a",
};

const contextBar = {
  background: "#0b0b0b",
  border: "1px solid #222",
  borderRadius: 10,
  padding: "10px 16px",
  marginBottom: 24,
  fontSize: 14,
};
