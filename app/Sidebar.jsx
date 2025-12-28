"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "GPC", href: "/gpc" },
  { label: "GSS", href: "/gss" },
  { label: "SmartSplit", href: "/ss" },
  { label: "AI Asistent", href: "/ai" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 260,
        flexShrink: 0,
        padding: 18,
        borderRight: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.1, marginBottom: 18 }}>
        GOGROU
        <br />
        DEMO
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((it) => {
          const active = pathname?.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              style={{
                display: "block",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.10)",
                background: active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
