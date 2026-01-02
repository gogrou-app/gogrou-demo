import gpcData from "../data";

const STATUS_LABEL = {
  active: "Aktivní",
  phase_out: "Výběhová",
  discontinued: "Ukončená",
};

const STATUS_DOT = {
  active: "🟢",
  phase_out: "🟡",
  discontinued: "🔴",
};

function fmt(v, unit = "") {
  if (v === null || v === undefined || v === "") return "—";
  return `${v}${unit}`;
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: "1px solid #222" }}>
      <div style={{ opacity: 0.75 }}>{label}</div>
      <div style={{ textAlign: "right", maxWidth: 520 }}>{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 22, border: "1px solid #333", borderRadius: 12, padding: 16 }}>
      <div style={{ fontWeight: 800, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

export default function GpcDetailPage({ params }) {
  const item = gpcData.find((x) => x.identity?.gpc_id === params.id);

  if (!item) {
    return (
      <div style={{ padding: 40, color: "#fff" }}>
        <a href="/gpc" style={{ color: "#9cc3ff" }}>← Zpět</a>
        <h1 style={{ marginTop: 16 }}>Položka nenalezena</h1>
      </div>
    );
  }

  const id = item.identity || {};
  const geo = item.geometry || {};
  const cut = item.cutting || {};
  const feat = item.tool_features || {};
  const use = item.usage || {};

  const status = id.status || "active";

  return (
    <div style={{ padding: 40, color: "#fff" }}>
      <a href="/gpc" style={{ color: "#9cc3ff" }}>← Zpět do GPC</a>

      <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            {id.gpc_id} {id.gtin ? `· GTIN ${id.gtin}` : ""}
          </div>
          <h1 style={{ margin: "6px 0 0 0" }}>{id.name}</h1>
          <div style={{ marginTop: 6, opacity: 0.9 }}>
            {id.manufacturer || "—"} · {id.type || "—"}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16 }}>
          <span style={{ fontSize: 18 }}>{STATUS_DOT[status] || "⚪"}</span>
          <span style={{ opacity: 0.9 }}>{STATUS_LABEL[status] || status}</span>
        </div>
      </div>

      <Section title="Geometrie (ToolsUnited / výrobce)">
        <Row label="Průměr (D1)" value={fmt(geo.diameter_mm, " mm")} />
        <Row label="Délka břitu (LC)" value={fmt(geo.flute_length_mm, " mm")} />
        <Row label="Celková délka (L1)" value={fmt(geo.overall_length_mm, " mm")} />
        <Row label="Průměr stopky (D2)" value={fmt(geo.shank_diameter_mm, " mm")} />
        <Row label="Počet zubů (Z)" value={fmt(geo.flutes)} />
        <Row label="Úhel šroubovice" value={fmt(geo.helix_angle_deg, "°")} />
        <Row label="Úhel hrotu" value={fmt(geo.point_angle_deg, "°")} />
        <Row label="Rádius rohu" value={fmt(geo.corner_radius_mm, " mm")} />
        <Row label="Délka krčku" value={fmt(geo.neck_length_mm, " mm")} />
      </Section>

      <Section title="Řezné parametry (katalogové)">
        <Row label="Doporučená řezná rychlost vc" value={fmt(cut.recommended_vc_m_min, " m/min")} />
        <Row label="Doporučený posuv na zub fz" value={fmt(cut.recommended_fz_mm, " mm")} />
        <Row label="Chlazení vyžadováno" value={fmt(cut.coolant_required)} />
        <Row label="Vnitřní chlazení" value={fmt(cut.internal_coolant)} />
        <Row label="Třískolam" value={fmt(cut.chipbreaker)} />
      </Section>

      <Section title="Materiál / povlak / vlastnosti">
        <Row label="Základní materiál" value={fmt(feat.base_material)} />
        <Row label="Povlak" value={fmt(feat.coating)} />
        <Row label="Tolerance" value={fmt(feat.tolerance)} />
        <Row label="Směr" value={fmt(feat.hand)} />
        <Row label="Kvalita povrchu" value={fmt(feat.finish_quality)} />
      </Section>

      <Section title="Použití (katalogové)">
        <Row label="Operace" value={(use.operations && use.operations.length) ? use.operations.join(", ") : "—"} />
        <Row label="Materiály obrobku" value={(use.workpiece_materials && use.workpiece_materials.length) ? use.workpiece_materials.join(", ") : "—"} />
        <Row label="Poznámka" value={fmt(use.notes)} />
      </Section>
    </div>
  );
}
