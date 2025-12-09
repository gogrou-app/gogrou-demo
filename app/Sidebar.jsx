"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div
      style={{
        width: "200px",
        background: "#111",
        color: "white",
        padding: "20px",
        height: "100vh",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      {/* Horní sekce */}
      <div>
        <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>GOGROU<br/>DEMO</h2>

        <NavLink href="/dashboard" pathname={pathname}>Dashboard</NavLink>
        <NavLink href="/gpc" pathname={pathname}>GPC</NavLink>
        <NavLink href="/gss" pathname={pathname}>GSS</NavLink>
        <NavLink href="/ss" pathname={pathname}>SmartSplit</NavLink>
        <NavLink href="/ai" pathname={pathname}>AI Asistent</NavLink>
      </div>

      {/* Spodní sekce – fixní tlačítko */}
      <div style={{ marginTop: "20px" }}>
        <Link
          href="/gpc"
          style={{
            display: "block",
            padding: "12px",
            textAlign: "center",
            background: "#333",
            color: "white",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "15px",
            border: "1px solid #555"
          }}
        >
          ← Zpět na seznam
        </Link>
      </div>
    </div>
  );
}

function NavLink({ href, pathname, children }) {
  const active = pathname === href;

  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "12px",
        marginBottom: "10px",
        background: active ? "#444" : "#222",
        borderRadius: "6px",
        textDecoration: "none",
        color: "white",
        border: active ? "1px solid #777" : "1px solid #333",
        fontSize: "15px"
      }}
    >
      {children}
    </Link>
  );
}
