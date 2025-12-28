"use client";

import { usePathname } from "next/navigation";
import { useAppContext } from "../context/AppContext";

export default function ContextBar() {
  const pathname = usePathname();
  const { company, warehouse } = useAppContext();

  let moduleLabel = "Dashboard";

  if (pathname.startsWith("/gpc")) moduleLabel = "GPC – Produktový katalog";
  else if (pathname.startsWith("/gss")) moduleLabel = "GSS – Skladový systém";
  else if (pathname.startsWith("/ss")) moduleLabel = "SmartSplit";
  else if (pathname.startsWith("/ai")) moduleLabel = "AI Assistant";

  return (
    <div
      style={{
        background: "#0b0b0b",
        borderBottom: "1px solid #222",
        padding: "10px 16px",
        fontSize: 14,
        color: "#e5e7eb",
      }}
    >
      <strong>Firma:</strong> {company?.name}
      {"  •  "}
      <strong>Modul:</strong> {moduleLabel}
      {warehouse && (
        <>
          {"  •  "}
          <strong>Sklad:</strong> {warehouse.name}
        </>
      )}
    </div>
  );
}
