// app/gpc/[id]/page.jsx
import Image from "next/image";
import Link from "next/link";
import tools from "../data.js";

// ===========================
// Helpers
// ===========================
const fmt = (v, unit = "") => {
  if (v === null || v === undefined || v === "") return "–";
  const s = typeof v === "boolean" ? (v ? "Ano" : "Ne") : String(v);
  return unit ? `${s} ${unit}` : s;
};

const hasValue = (v) => !(v === null || v === undefined || v === "");

const isUrl = (v) => typeof v === "string" && /^https?:\/\//i.test(v);

// ===========================
// Quick summary block (TOP info)
// ===========================
const SummaryGrid = ({ geom = {}, feat = {}, usage = {} }) => {
  const rows = [
    { label: "Průměr", value: geom.diameter_mm, unit: "mm" },
    { label: "Délka břitu", value: geom.flute_length_mm, unit: "mm" },
    { label: "Celková délka", value: geom.overall_length_mm, unit: "mm" },
    { label: "Počet zubů", value: geom.flutes, unit: "" },
    { label: "Materiál", value: feat.material, unit: "" },
    { label: "Povlak / třída", value: feat.coating, unit: "" },
    { label: "Směr", value: feat.hand, unit: "" },
    { label: "Tolerance", value: feat.tolerance, unit: "" },
    { label: "Operace", type: "array", value: usage.operations || [] },
  ].filter((r) =>
    r.type === "array"
      ? Array.isArray(r.value) && r.value.length
      : hasValue(r.value)
  );

  if (!rows.length) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 12,
        marginTop: 24,
        marginBottom: 18,
      }}
    >
      {rows.map((r, idx) => (
        <div
          key={idx}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ fontSize: 13, opacity: 0.65, marginBottom: 4 }}>
            {r.label}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            {r.type === "array" ? r.value.join(", ") : fmt(r.value, r.unit)}
          </div>
        </div>
      ))}
    </div>
  );
};

// ===========================
// UI helpers
// ===========================
const Section = ({ title, children }) => (
  <div style={{ marginTop: 28 }}>
    <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
      {title}
    </div>
    <div style={{ opacity: 0.95 }}>{children}</div>
  </div>
);

const Table = ({ rows }) => {
  const filtered = rows.filter(
    (r) =>
      hasValue(r.value) ||
      (r.type === "array" && Array.isArray(r.value) && r.value.length)
  );
  if (!filtered.length) return <div style={{ opacity: 0.7 }}>–</div>;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {filtered.map((r, idx) => (
        <div
          key={idx}
          style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: 12,
            padding: "8px 10px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div style={{ opacity: 0.85 }}>
            {r.label}
            {r.tu ? (
              <span
                style={{
                  marginLeft: 10,
                  opacity: 0.65,
                  fontSize: 12,
                }}
              >
                {r.tu}
              </span>
            ) : null}
          </div>

          <div style={{ fontWeight: 750 }}>
            {r.type === "array"
              ? Array.isArray(r.value) && r.value.length
                ? r.value.join(", ")
                : "–"
              : fmt(r.value, r.unit)}
          </div>
        </div>
      ))}
    </div>
  );
};

// ===========================
// Volitelný TU blok
// ===========================
const TU_CZ = {
  // sem si časem dáme hezké české popisky TU kódů
};

const TuTable = ({ tuObj }) => {
  if (!tuObj || typeof tuObj !== "object") return null;

  const entries = Object.entries(tuObj)
    .map(([code, payload]) => {
      if (
        payload &&
        typeof payload === "object" &&
        ("value" in payload || "unit" in payload || "label" in payload)
      ) {
        return {
          code,
          label: TU_CZ[code] || payload.label || code,
          value: payload.value,
          unit: payload.unit || "",
        };
      }
      return { code, label: TU_CZ[code] || code, value: payload, unit: "" };
    })
    .filter((x) => hasValue(x.value));

  if (!entries.length) return null;

  return (
    <div style={{ marginTop: 14 }}>
      <div
        style={{
          fontSize: 14,
          fontWeight: 900,
          opacity: 0.75,
          marginBottom: 8,
        }}
      >
        ToolsUnited kódy
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {entries.map((e) => (
          <div
            key={e.code}
            style={{
              display: "grid",
              gridTemplateColumns: "260px 1fr",
              gap: 12,
              padding: "8px 10px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div style={{ opacity: 0.85 }}>
              {e.label}
              <span
                style={{
                  marginLeft: 10,
                  opacity: 0.65,
                  fontSize: 12,
                }}
              >
                {e.code}
              </span>
            </div>
            <div style={{ fontWeight: 750 }}>{fmt(e.value, e.unit)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===========================
// Links / Attachments
// ===========================
const LinkRow = ({ label, href, note }) => {
  if (!href) return null;

  const pill = (
    <span
      style={{
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        fontSize: 12,
        opacity: 0.9,
      }}
    >
      Otevřít
    </span>
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        gap: 12,
        padding: "8px 10px",
        borderRadius: 10,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div style={{ opacity: 0.85 }}>{label}</div>
      <div style={{ fontWeight: 750 }}>
        {isUrl(href) ? (
          <a href={href} target="_blank" rel="noreferrer">
            {pill}
          </a>
        ) : (
          <span style={{ opacity: 0.9 }}>{href}</span>
        )}
        {note ? (
          <span style={{ marginLeft: 10, opacity: 0.65, fontSize: 12 }}>
            {note}
          </span>
        ) : null}
      </div>
    </div>
  );
};

// ===========================
// Page
// ===========================
export default function GpcToolDetailPage({ params }) {
  const { id } = params;
  const tool = tools.find((t) => String(t.gpc_id) === String(id));

  if (!tool) {
    return (
      <div style={{ padding: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900 }}>Položka nenalezena</h1>
        <div style={{ opacity: 0.8, marginTop: 8 }}>
          GPC ID: <b>{String(id)}</b>
        </div>
        <div style={{ marginTop: 18 }}>
          <Link href="/gpc" style={{ color: "#7c3aed" }}>
            ← Zpět do GPC
          </Link>
        </div>
      </div>
    );
  }

  const geom = tool.geometry || {};
  const cutting = tool.cutting || {};
  const feat = tool.tool_features || {};
  const usage = tool.usage || {};

  const geometryRows = [
    { label: "Průměr", value: geom.diameter_mm, unit: "mm" },
    { label: "Průměr stopky", value: geom.shank_diameter_mm, unit: "mm" },
    { label: "Délka břitu (LU/LF)", value: geom.flute_length_mm, unit: "mm" },
    { label: "Celková délka (OAL)", value: geom.overall_length_mm, unit: "mm" },
    { label: "Počet zubů", value: geom.flutes, unit: "" },
    { label: "Max. hloubka (APMX)", value: geom.apmx_mm, unit: "mm" },
    { label: "Úhel čela (GAMF)", value: geom.gamf_deg, unit: "°" },
    { label: "Šířka fazetky (CHW)", value: geom.chw_mm, unit: "mm" },
  ];

  const cuttingRows = [
    { label: "Doporučené vc", value: cutting.recommended_vc_m_min, unit: "m/min" },
    { label: "Doporučené fz", value: cutting.recommended_fz_mm, unit: "mm" },
    { label: "Chlazení vyžadováno", value: cutting.coolant_required, unit: "" },
    { label: "Vnitřní chlazení", value: cutting.internal_coolant, unit: "" },
    { label: "Poznámka", value: cutting.notes, unit: "" },
  ];

  const featureRows = [
    { label: "Materiál", value: feat.material, unit: "" },
    { label: "Povlak / třída", value: feat.coating, unit: "" },
    { label: "Tolerance", value: feat.tolerance, unit: "" },
    { label: "Směr", value: feat.hand, unit: "" },
    { label: "Stav dodání", value: feat.delivery_state, unit: "" },
    { label: "Platnost od", value: feat.valid_from, unit: "" },
  ];

  const connectionRows = [
    { label: "Connection Type", value: feat.connection_type, unit: "", tu: "DIN/ISO" },
    { label: "Size Code", value: feat.size_code, unit: "", tu: "DIN/ISO" },
    { label: "Form", value: feat.form, unit: "", tu: "DIN/ISO" },
    { label: "Unit Base", value: feat.unit_base, unit: "", tu: "DIN/ISO" },
    { label: "Style", value: feat.style, unit: "", tu: "DIN/ISO" },
    { label: "DIN kód", value: feat.din_code, unit: "" },
    { label: "ISO kód", value: feat.iso_code, unit: "" },
  ];

  const usageRows = [
    { label: "Operace", type: "array", value: usage.operations || [] },
    { label: "Materiály obrobku", type: "array", value: usage.workpiece_materials || [] },
    { label: "Poznámka", value: usage.notes, unit: "" },
  ];

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 16 }}>
        <Link href="/gpc" style={{ color: "#7c3aed" }}>
          ← Zpět do GPC
        </Link>
      </div>

      {/* HLAVIČKA */}
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ fontSize: 44, fontWeight: 950, lineHeight: 1.05 }}>
          {tool.name}
        </div>

        <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
          <div>
            <b>Výrobce:</b> {fmt(tool.manufacturer)}
          </div>
          <div>
            <b>Typ:</b> {fmt(tool.type)}
          </div>
          <div>
            <b>GPC ID:</b> {fmt(tool.gpc_id)}
          </div>
          {hasValue(tool.gtin) && (
            <div>
              <b>GTIN:</b> {fmt(tool.gtin)}
            </div>
          )}
        </div>
      </div>

      {/* 🔥 RYCHLÝ PŘEHLED */}
      <SummaryGrid geom={geom} feat={feat} usage={usage} />

      {/* ODKAZY / PDF */}
      {(tool.pdf_url || tool.product_url || tool.tu_url) && (
        <Section title="Odkazy a přílohy">
          <div style={{ display: "grid", gap: 8 }}>
            <LinkRow label="PDF datasheet" href={tool.pdf_url} note={tool.pdf_note} />
            <LinkRow label="Produktová stránka" href={tool.product_url} />
            <LinkRow label="ToolsUnited odkaz" href={tool.tu_url} />
          </div>
        </Section>
      )}

      <div
        style={{
          marginTop: 22,
          height: 1,
          background: "rgba(255,255,255,0.15)",
        }}
      />

      {/* OBRÁZKY */}
      <Section title="Obrázky">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div
            style={{
              borderRadius: 14,
              padding: 12,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
              minHeight: 260,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 900,
                opacity: 0.75,
                marginBottom: 10,
              }}
            >
              Hlavní
            </div>
            {tool.image_main ? (
              <div style={{ position: "relative", width: "100%", height: 320 }}>
                <Image
                  src={tool.image_main}
                  alt={tool.name}
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="(max-width: 1200px) 50vw, 600px"
                />
              </div>
            ) : (
              <div style={{ opacity: 0.7 }}>–</div>
            )}
          </div>

          <div
            style={{
              borderRadius: 14,
              padding: 12,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
              minHeight: 260,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 900,
                opacity: 0.75,
                marginBottom: 10,
              }}
            >
              Výkres
            </div>
            {tool.image_drawing ? (
              <div style={{ position: "relative", width: "100%", height: 320 }}>
                <Image
                  src={tool.image_drawing}
                  alt={`${tool.name} – výkres`}
                  fill
                  style={{ objectFit: "contain" }}
                  sizes="(max-width: 1200px) 50vw, 600px"
                />
              </div>
            ) : (
              <div style={{ opacity: 0.7 }}>–</div>
            )}
          </div>
        </div>
      </Section>

      {/* DATA */}
      <Section title="Geometrie">
        <Table rows={geometryRows} />
        <TuTable tuObj={tool.tu?.geometry} />
      </Section>

      <Section title="Řezné podmínky">
        <Table rows={cuttingRows} />
        <TuTable tuObj={tool.tu?.cutting} />
      </Section>

      <Section title="Vlastnosti nástroje">
        <Table rows={featureRows} />
        <TuTable tuObj={tool.tu?.features} />
      </Section>

      <Section title="Upnutí a normy">
        <Table rows={connectionRows} />
        <TuTable tuObj={tool.tu?.connection} />
      </Section>

      <Section title="Použití">
        <Table rows={usageRows} />
        <TuTable tuObj={tool.tu?.usage} />
      </Section>

      {/* Záměrně mimo GPC */}
      <div
        style={{
          marginTop: 28,
          height: 1,
          background: "rgba(255,255,255,0.08)",
        }}
      />
      <div style={{ marginTop: 14, opacity: 0.65, fontSize: 12 }}>
        Pozn.: Životní cyklus a servisní logika jsou mimo GPC (patří do GSS zákazníka).
      </div>
    </div>
  );
}
