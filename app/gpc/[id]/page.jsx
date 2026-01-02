import Link from "next/link";
import tools from "../data";

export default function GpcDetailPage({ params }) {
  const tool = tools.find((t) => t.gpc_id === params.id);

  if (!tool) {
    return (
      <div>
        <Link href="/gpc">← Zpět do GPC</Link>
        <h2>Položka nenalezena</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* NAVIGACE */}
      <Link href="/gpc" style={back}>
        ← Zpět do GPC
      </Link>

      {/* HLAVIČKA */}
      <h1>{tool.name}</h1>
      <div style={{ opacity: 0.7, marginBottom: 20 }}>
        {tool.manufacturer} • {tool.type} • GPC ID: {tool.gpc_id}
      </div>

      {/* OBRÁZKY */}
      <div style={imagesWrap}>
        <div style={imageBox}>
          <div style={imageTitle}>Hlavní obrázek</div>
          {tool.images?.main ? (
            <img src={tool.images.main} style={img} />
          ) : (
            <div style={empty}>Bez obrázku</div>
          )}
        </div>

        <div style={imageBox}>
          <div style={imageTitle}>Výkres</div>
          {tool.images?.drawing ? (
            <img src={tool.images.drawing} style={img} />
          ) : (
            <div style={empty}>Bez výkresu</div>
          )}
        </div>
      </div>

      {/* TECHNICKÝ ROZPAD */}
      <Section title="Geometrie">
        <Row label="Průměr (Ø)" value={tool.geometry?.diameter_mm} unit="mm" />
        <Row label="Délka břitu" value={tool.geometry?.flute_length_mm} unit="mm" />
        <Row label="Celková délka" value={tool.geometry?.overall_length_mm} unit="mm" />
        <Row label="Stopka Ø" value={tool.geometry?.shank_diameter_mm} unit="mm" />
        <Row label="Počet zubů" value={tool.geometry?.flutes} />
        <Row label="Úhel šroubovice" value={tool.geometry?.helix_angle_deg} unit="°" />
        <Row label="Úhel špice" value={tool.geometry?.point_angle_deg} unit="°" />
      </Section>

      <Section title="Řezné podmínky">
        <Row label="Vc" value={tool.cutting?.recommended_vc_m_min} unit="m/min" />
        <Row label="fz" value={tool.cutting?.recommended_fz_mm} unit="mm" />
        <Row label="Vnitřní chlazení" value={yesno(tool.cutting?.internal_coolant)} />
        <Row label="Chlazení nutné" value={yesno(tool.cutting?.coolant_required)} />
      </Section>

      <Section title="Materiál & povrch">
        <Row label="Materiál" value={tool.tool_features?.material} />
        <Row label="Povlak" value={tool.tool_features?.coating} />
        <Row label="Tolerance" value={tool.tool_features?.tolerance} />
        <Row label="Směr" value={tool.tool_features?.hand} />
      </Section>

      {/* EDIT */}
      <div style={{ marginTop: 40 }}>
        <Link href={`/gpc/${tool.gpc_id}/edit`} style={editBtn}>
          Editovat položku
        </Link>
      </div>
    </div>
  );
}

/* ===================== HELPERY ===================== */

function Row({ label, value, unit }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div style={row}>
      <div style={labelStyle}>{label}</div>
      <div>
        {value} {unit}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={section}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function yesno(v) {
  if (v === true) return "ANO";
  if (v === false) return "NE";
  return null;
}

/* ===================== STYLY ===================== */

const back = {
  display: "inline-block",
  marginBottom: 20,
  textDecoration: "none",
};

const imagesWrap = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
  marginBottom: 30,
};

const imageBox = {
  padding: 16,
  borderRadius: 16,
  background: "rgba(255,255,255,0.05)",
};

const imageTitle = {
  marginBottom: 10,
  fontWeight: 700,
};

const img = {
  width: "100%",
  height: 300,
  objectFit: "contain",
};

const empty = {
  height: 300,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0.5,
};

const section = {
  marginTop: 30,
  padding: 20,
  borderRadius: 16,
  background: "rgba(255,255,255,0.05)",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  padding: "6px 0",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const labelStyle = {
  opacity: 0.7,
};

const editBtn = {
  padding: "12px 18px",
  borderRadius: 12,
  background: "#2b6cb0",
  color: "white",
  textDecoration: "none",
};
