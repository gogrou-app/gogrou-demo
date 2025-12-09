"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", path: "/" },
    { name: "GPC", path: "/gpc" },
    { name: "GSS", path: "/gss" },
    { name: "SmartSplit", path: "/ss" },
    { name: "AI Asistent", path: "/ai" },
  ];

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
      <h2 style={{ color: "white", marginBottom: "30px" }}>GOGROU DEMO</h2>

      {menu.map((item) => {
        // 🔥 OPRAVENÉ ZVÝRAZNĚNÍ
        const active =
          item.path === "/"
            ? pathname === "/"
            : pathname.startsWith(item.path);

        return (
          <Link
            key={item.path}
            href={item.path}
            style={{
              display: "block",
              padding: "10px 12px",
              marginBottom: "5px",
              textDecoration: "none",
              borderRadius: "6px",
              background: active ? "#333" : "transparent",
              color: active ? "#fff" : "#aaa",
              fontWeight: active ? "600" : "400",
              transition: "0.2s",
            }}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}
