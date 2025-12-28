"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ padding: 40, color: "white" }}>
      <h1>GOGROU DEMO</h1>

      <p style={{ opacity: 0.7, marginTop: 10 }}>
        Demo prostředí systému Gogrou
      </p>

      <div
        style={{
          marginTop: 30,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Link href="/dashboard" style={btn}>
          Dashboard
        </Link>

        <Link href="/gpc" style={btn}>
          GPC
        </Link>

        <Link href="/gss" style={btn}>
          GSS
        </Link>

        <Link href="/ss" style={btn}>
          SmartSplit
        </Link>

        <Link href="/ai" style={btnSecondary}>
          AI (off)
        </Link>
      </div>
    </div>
  );
}

const btn = {
  background: "#2563eb",
  color: "white",
  padding: "10px 16px",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: "bold",
};

const btnSecondary = {
  ...btn,
  background: "#374151",
};
