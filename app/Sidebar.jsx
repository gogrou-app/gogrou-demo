"use client";
import Link from "next/link";

export default function Sidebar() {
  return (
    <div
      style={{
        width: "220px",
        height: "100vh",
        backgroundColor: "#111",
        color: "white",
        padding: "20px",
        boxSizing: "border-box",
        position: "fixed",
        top: 0,
        left: 0,
        borderRight: "1px solid #222",
      }}
    >
      <h2 style={{ marginBottom: "25px", fontSize: "22px" }}>GOGROU<br />DEMO</h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Link href="/dashboard" style={linkStyle}>Dashboard</Link>
        <Link href="/gpc" style={linkStyle}>GPC</Link>
        <Link href="/gss" style={linkStyle}>GSS</Link>
        <Link href="/ss" style={linkStyle}>SmartSplit</Link>
        <Link href="/ai" style={linkStyle}>AI Asistent</Link>
      </nav>
    </div>
  );
}

const linkStyle = {
  padding: "12px 14px",
  backgroundColor: "#1a1a1a",
  borderRadius: "8px",
  border: "1px solid #333",
  textDecoration: "none",
  color: "white",
  fontSize: "16px",
};
