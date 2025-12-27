"use client";

import { usePathname } from "next/navigation";

export default function AppHeader() {
  const pathname = usePathname();

  let module = "Dashboard";
  if (pathname.startsWith("/gss")) module = "GSS – Skladový systém";
  else if (pathname.startsWith("/gpc")) module = "GPC – Katalog";
  else if (pathname.startsWith("/smartsplit")) module = "SmartSplit";
  else if (pathname.startsWith("/ai")) module = "AI Assistant";

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#0b0b0b",
        borderBottom: "1px solid #222",
        padding: "10px 30px",
        fontSize: 14,
        opacity: 0.9,
      }}
    >
      <strong>Firma:</strong> Gogrou Demo s.r.o.
      <span style={{ margin: "0 8px" }}>•</span>
      <strong>Modul:</strong> {module}
      <span style={{ margin: "0 8px" }}>•</span>
      <strong>Sklad:</strong> Hlavní sklad
    </div>
  );
}
