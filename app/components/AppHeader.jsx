"use client";

import { usePathname } from "next/navigation";

export default function AppHeader() {
  const pathname = usePathname();

  // DEMO DATA – zatím napevno (později z contextu / store)
  const companyName = "Gogrou Demo s.r.o.";
  const warehouseName =
    pathname.startsWith("/gss") ? "Hlavní sklad" : "—";

  let moduleName = "Dashboard";
  if (pathname.startsWith("/gpc")) moduleName = "GPC – Product Center";
  if (pathname.startsWith("/gss")) moduleName = "GSS – Skladový systém";
  if (pathname.startsWith("/smartsplit")) moduleName = "SmartSplit";
  if (pathname.startsWith("/ai")) moduleName = "AI Assistant";

  return (
    <div
      style={{
        marginLeft: 220,
        padding: "12px 24px",
        background: "#0b0b0b",
        borderBottom: "1px solid #222",
        color: "#ddd",
        fontSize: 14,
      }}
    >
      <strong>Firma:</strong> {companyName}
      {" • "}
      <strong>Modul:</strong> {moduleName}
      {" • "}
      <strong>Sklad:</strong> {warehouseName}
    </div>
  );
}
