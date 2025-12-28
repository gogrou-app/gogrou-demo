"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import tools from "../data";

export default function GpcDetailPage() {
  const params = useParams();
  const idRaw = params?.id ? decodeURIComponent(String(params.id)) : "";

  const item = useMemo(() => {
    return tools.find((t) => String(t.gpc_id) === String(idRaw)) || null;
  }, [idRaw]);

  if (!item) {
    return (
      <div style={{ padding: 30, color: "white" }}>
        <h2>Položka nenalezena</h2>
        <div style={{ opacity: 0.7, marginTop: 6 }}>GPC_ID: {idRaw}</div>
        <div style={{ marginTop: 16 }}>
          <Link href="/gpc" style={linkBtn}>← Zpět na GPC</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 30, color: "white", maxWidth: 1100 }}>
      <Link href="/gpc" style={linkBtn}>← Zpět na GPC</Link>

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "420px 1fr", gap: 18 }}>
        {/* LEFT */}
        <div
          style={{
            border: "1px solid #222",
            borderRadius: 14,
            background: "#0b0b0b",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: 14, borderBottom: "1px solid #111", fontWeight: 800 }}>
            Obrázek
          </div>
          <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {item.image_main ? (
              <img src={item.image_main} alt={item.name} style={{ maxWidth: "92%", maxHeight: "92%", objectFit: "contain" }} />
            ) : (
              <div style={{ opacity: 0.6 }}>bez obrázku</div>
            )}
          </div>

          <div style={{ padding: 14, borderTop: "1px solid #111" }}>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Výkres</div>
            <div style={{ marginTop: 10, height: 220, display: "flex", alignItems: "center", justifyContent: "center", background: "#060606", borderRadius: 12, border: "1px solid #111" }}>
              {item.image_drawing ? (
                <img src={item.image_drawing} alt="drawing" style={{ maxWidth: "92%", maxHeight: "92%", objectFit: "contain" }} />
              ) : (
                <div style={{ opacity: 0.6 }}>bez výkresu</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <h1 style={{ margin: 0 }}>{item.name}</h1>
          <div style={{ opacity: 0.75, marginTop: 8 }}>
            {item.manufacturer} • {item.type}
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Chip label={`GPC_ID: ${item.gpc_id}`} />
            <Chip label={`GTIN: ${item.gtin ?? "—"}`} />
            <Chip label={`⌀ ${item.geometry?.diameter_mm ?? "—"} mm`} />
            <Chip label={`L: ${item.geometry?.overall_length_mm ?? "—"} mm`} />
            <Chip label={`Z: ${item.geometry?.flutes ?? "—"}`} />
          </div>

          <Section title="Geometrie">
            <Row k="Průměr" v={fmt(item.geometry?.diameter_mm, "mm")} />
            <Row k="Délka břitu" v={fmt(item.geometry?.flute_length_mm, "mm")} />
            <Row k="Celková délka" v={fmt(item.geometry?.overall_length_mm, "mm")} />
            <Row k="Stopka" v={fmt(item.geometry?.shank_diameter_mm, "mm")} />
            <Row k="Zuby" v={fmt(item.geometry?.flutes)} />
            <Row k="Helix" v={fmt(item.geometry?.helix_angle_deg, "°")} />
            <Row k="Úhel špice" v={fmt(item.geometry?.point_angle_deg, "°")} />
            <Row k="Rádius" v={fmt(item.geometry?.corner_radius_mm, "mm")} />
          </Section>

          <Section title="Vlastnosti">
            <Row k="Materiál" v={item.tool_features?.material ?? "—"} />
            <Row k="Povlak" v={item.tool_features?.coating ?? "—"} />
            <Row k="Směr" v={item.tool_features?.hand ?? "—"} />
          </Section>

          <Section title="Životní cyklus">
            <Row k="Brousitelné" v={item.lifecycle?.resharpenable ? "ANO" : "NE"} />
            <Row k="Max. přebroušení" v={item.lifecycle?.max_resharpens ?? "—"} />
          </Section>

          <div style={{ marginTop: 16, opacity: 0.65, fontSize: 13 }}>
            (Napojení na GSS / DM / AI / ToolsUnited doplníme v dalších krocích.)
          </div>
        </div>
      </div>
    </div>
  );
}

function fmt(v, unit = "") {
  if (v === null || v === undefined || v === "") return "—";
  return unit ? `${v} ${unit}` : String(v);
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 18, border: "1px solid #222", borderRadius: 14, background: "#0b0b0b" }}>
      <div style={{ padding: 12, borderBottom: "1px solid #111", fontWeight: 800 }}>{title}</div>
      <div style={{ padding: 12 }}>{children}</div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: "1px solid #111" }}>
      <div style={{ opacity: 0.7 }}>{k}</div>
      <div style={{ fontWeight: 700 }}>{v}</div>
    </div>
  );
}

function Chip({ label }) {
  return (
    <span style={{ fontSize: 12, padding: "6px 10px", borderRadius: 999, border: "1px solid #222", background: "#000" }}>
      {label}
    </span>
  );
}

const linkBtn = {
  display: "inline-block",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #333",
  background: "#111",
  color: "white",
  textDecoration: "none",
  fontWeight: 700,
};
