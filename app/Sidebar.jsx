"use client";
import Link from "next/link";

export default function Sidebar() {
  return (
    <div
      style={{
        width: "220px",
        height: "100vh",
        background: "#111",
        padding: "20px",
        boxSizing: "border-box",
        borderRight: "1px solid #222",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <h2 style={{ color: "white", marginBottom: "20px" }}>GOGROU<br />DEMO</h2>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginTop: "10px",
        }}
      >
        <Link href="/dashboard" style={linkStyle}>Dashboard</Link>
        <Link href="/gpc" style={linkStyle}>GPC</Link>
        <Link href="/gss" style={linkStyle}>GSS</Link>
        <Link href="/ss" style={linkStyle}>SmartSplit</Link>
        <Link href="/ai" style={linkStyle}>AI Asistent</Link>
      </nav>

      {/* ----- ZPĚT NA SEZNAM ----- */}
      <div style={{ marginTop: "40px" }}>
        <a
          href="/gpc"
          style={{
            display: "block",
            padding: "12px 14px",
            background: "#333",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            textAlign: "center",
            fontSize: "15px",
            border: "1px solid #444",
          }}
        >
          ← Zpět na seznam
        </a>
      </div>
    </div>
  );
}

const linkStyle = {
  padding: "10px 14px",
  background: "#222",
  borderRadius: "6px",
  color: "white",
  textDecoration: "none",
  fontSize: "15px",
};
