"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { name: "Dashboard", path: "/", icon: "🏠" },
  { name: "GPC – Product Center", path: "/gpc", icon: "📦" },
  { name: "GSS – Skladový systém", path: "/gss", icon: "📊" },
  { name: "AI Assistant (GINA DEMO)", path: "/ai", icon: "🤖" },
  { name: "Settings", path: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div
      style={{
        width: "260px",
        background: "#000",
        height: "100vh",
        padding: "24px",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        borderRight: "1px solid #222",
      }}
    >
      <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "20px" }}>
        GOGROU DEMO
      </h2>

      {menu.map((item) => {
        const active = pathname === item.path;

        return (
          <Link
            key={item.path}
            href={item.path}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              background: active ? "#4EF7C3" : "transparent",
              color: active ? "#000" : "#fff",
              fontWeight: active ? "700" : "400",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>{item.icon}</span> {item.name}
          </Link>
        );
      })}
    </div>
  );
}
