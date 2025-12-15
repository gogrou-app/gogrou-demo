// /app/gpc/[id]/page.js
"use client";

import Link from "next/link";
import Image from "next/image";
import tools from "../data";

const LABELS = {
  // geometry
  diameter_mm: "Průměr (mm)",
  flute_length_mm: "Délka břitu (mm)",
  overall_length_mm: "Celková délka (mm)",
  shank_diameter_mm: "Průměr stopky (mm)",
  flutes: "Počet zubů (Z)",
  helix_angle_deg: "Šroubovice (°)",
  point_angle_deg: "Úhel hrotu (°)",
  corner_radius_mm: "Rohový rádius (mm)",
  neck_length_mm: "Délka krčku (mm)",

  // cutting
  recommended_vc_m_min: "Dop. řezná rychlost Vc (m/min)",
  recommended_fz_mm: "Dop. posuv na zub fz (mm)",
  coolant_required: "Chlazení nutné",
  internal_coolant: "Vnitřní chlazení",
  chipbreaker: "Lamač třísky",

  // tool_features
  material: "Materiál nástroje",
  coating: "Povlak",
  tolerance: "Tolerance",
  hand: "Směr (L/R)",
  finish_quality: "Kvalita povrchu",

  // usage
  operations: "Operace",
  workpiece_materials: "Materiály obrobku",
  notes: "Poznámka",

  // lifecycle
  resharpenable: "Brousitelný",
  max_resharpens: "Max. přebroušení",
  service_notes: "Servisní poznámky",
  expected_tool_life_min: "Oček. životnost (min)",
};

function formatValue(v) {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Ano" : "Ne";
  if (Array.isArray(v)) return v.length ? v.join(", ") : "—";
  return String(v);
}

export default function ToolDetail({ params }) {
  const id = params?.id;

  const tool = tools.find((x) => String(x.gpc_id) === String(id));

  if (!tool) {
    return (
      <div style={{ color: "white", padding: "40px" }}>
        ❌ Nástroj nebyl nalezen: {String(id)}
        <div style={{ marginTop: 20 }}>
          <Link href="/gpc" style={{ color: "#4ba3ff" }}>
            ← Zpět na seznam
          </Link>
        </div>
      </div>
    );
  }

  const sections = [
    { key: "geometry", title: "Geometrie (měřitelná data)", data: tool.geometry },
    { key: "cutting", title: "Řezné vlastnosti", data: tool.cutting },
    { key: "tool_features", title: "Konstrukční vlastnosti", data: tool.tool_features },
    { key: "usage", title: "Použití", data: tool.usage },
    { key: "lifecycle", title: "Životnost / servis", data: tool.lifecycle },
  ];

  const mainImg = tool.image_main || "/images/placeholder.png";
  const drawImg = tool.image_drawing || null;

  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>{tool.name}</h1>
      <div style={{ opacity: 0.75, marginBottom: "18px" }}>
        {tool.manufacturer} • {tool.type}
      </div>

      {/* INFO BOX */}
      <div
        style={{
          background: "#111",
          padding: "18px",
          borderRadius: "10px",
          marginBottom: "26px",
          maxWidth: "520px",
          border: "1px solid #333",
        }}
      >
        <div><b>GPC ID:</b> {tool.gpc_id}</div>
        <div><b>GTIN:</b> {tool.gtin || "—"}</div>
        <div><b>Průměr:</b> {formatValue(tool.geometry?.diameter_mm)}</div>
        <div><b>Celková délka:</b> {formatValue(tool.geometry?.overall_length_mm)}</div>
        <div><b>Zuby:</b> {formatValue(tool.geometry?.flutes)}</div>
      </div>

      {/* MAIN IMAGE */}
      <h2 style={{ marginTop: 0 }}>Hlavní obrázek</h2>
      <div
        style={{
          border: "1px solid #333",
          borderRadius: "10px",
          padding: "12px",
          maxWidth: "540px",
          background: "#0b0b0b",
          marginBottom: "28px",
        }}
      >
        <Image
          src={mainImg}
          alt={tool.name}
          width={520}
          height={180}
          style={{ objectFit: "contain", width: "100%", height: "auto" }}
        />
      </div>

      {/* DRAWING */}
      <h2>Technický výkres</h2>
      {drawImg ? (
        <div
          style={{
            border: "1px solid #333",
            borderRadius: "10px",
            padding: "12px",
            maxWidth: "540px",
            background: "#0b0b0b",
            marginBottom: "28px",
          }}
        >
          <Image
            src={drawImg}
            alt="Výkres"
            width={520}
            height={220}
            style={{ objectFit: "contain", width: "100%", height: "auto" }}
          />
        </div>
      ) : (
        <div style={{ opacity: 0.7, marginBottom: "28px" }}>— výkres není k dispozici</div>
      )}

      {/* PARAMETRY */}
      <h2>Technické parametry</h2>

      {sections.map((sec) => {
        if (!sec.data) return null;

        const entries = Object.entries(sec.data);

        // když je sekce prázdná (všechno null/—), pořád ji zobrazíme, ale klidně můžeš později chtít skrýt
        return (
          <div key={sec.key} style={{ marginBottom: "26px", maxWidth: "650px" }}>
            <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>
              {sec.title}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {entries.map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    background: "#111",
                    padding: "14px",
                    borderRadius: "10px",
                    border: "1px solid #333",
                  }}
                >
                  <div style={{ opacity: 0.7 }}>{LABELS[k] || k}</div>
                  <div style={{ fontSize: "16px", color: "#4ba3ff" }}>
                    {formatValue(v)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* ZPĚT */}
      <Link
        href="/gpc"
        style={{
          display: "inline-block",
          marginTop: "20px",
          padding: "12px 18px",
          background: "#222",
          color: "white",
          borderRadius: "10px",
          border: "1px solid #444",
          textDecoration: "none",
        }}
      >
        ← Zpět na seznam
      </Link>
    </div>
  );
}
