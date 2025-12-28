"use client";

import React from "react";
import GssToolCard from "./components/GssToolCard";

/**
 * GSS – Hlavní sklad zákazníka
 * Zde se pracuje se skutečnými nástroji (ne katalog)
 */
export default function GssPage() {
  // DEMO DATA – simulace hlavního skladu
  const stockItems = [
    {
      id: "stk-001",
      name: "Vrták 10.5 mm – monolit TK",
      type: "Vrták",
      gpc_id: "SANDVIK-10.5-056A1",
      total_qty: 8,
      new_qty: 2,
      used_qty: 3,
      sharpened_qty: 3,
      min_qty: 5,
      max_qty: 12,
      service_enabled: true,
      max_resharpen: 3,
    },
    {
      id: "stk-002",
      name: "Fréza 12 mm – monolit TK",
      type: "Fréza",
      gpc_id: "WALTER-12-WK40",
      total_qty: 3,
      new_qty: 1,
      used_qty: 2,
      sharpened_qty: 0,
      min_qty: 5,
      max_qty: 10,
      service_enabled: true,
      max_resharpen: 2,
    },
    {
      id: "stk-003",
      name: "Vrták 6 mm – HSS",
      type: "Vrták",
      gpc_id: "HSS-06-STD",
      total_qty: 15,
      new_qty: 15,
      used_qty: 0,
      sharpened_qty: 0,
      min_qty: 5,
      max_qty: 10,
      service_enabled: false,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* HLAVIČKA */}
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>
        GSS – Hlavní sklad
      </h1>

      <p style={{ opacity: 0.7, marginTop: 4 }}>
        Zde spravujete skutečný sklad nástrojů firmy
      </p>

      {/* SEZNAM NÁSTROJŮ */}
      <div style={{ marginTop: 24 }}>
        {stockItems.length === 0 && (
          <div style={{ opacity: 0.6 }}>
            Zatím žádné položky ve skladu
          </div>
        )}

        {stockItems.map((item) => (
          <GssToolCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
