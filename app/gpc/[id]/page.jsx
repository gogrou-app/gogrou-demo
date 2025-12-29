// /app/gpc/[id]/page.jsx
import Link from "next/link";
import tools from "../data";

function getToolById(id) {
  return tools.find((t) => String(t.gpc_id) === String(id)) || null;
}

function Row({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div style={{ display: "flex", gap: 12, padding: "6px 0" }}>
      <div style={{ width: 180, color: "#aaa" }}>{label}</div>
      <div style={{ color: "#fff" }}>{String(value)}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 14,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function GpcDetailPage({ params }) {
  const tool = getToolById(params.id);

  if (!tool) {
    return (
      <div style={{ padding: 28 }}>
        <h1 style={{ fontSize: 34, margin: 0 }}>GPC – detail</h1>
        <p style={{ color: "#aaa" }}>Položka nenalezena: {params.id}</p>
        <Link
          href="/gpc"
          style={{
            display: "inline-block",
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "#fff",
            textDecoration: "none",
          }}
        >
          ← Zpět do GPC
        </Link>
      </div>
    );
  }

  const geom = tool.geometry || {};
  const feats = tool.tool_features || {};
  const cutting = tool.cutting || {};
  const usage = tool.usage || {};
  const lifecycle = tool.lifecycle || {};

  // Pro demo: GSS detail se typicky váže na stejný ID jako gpc_id (stockId = gpc_id)
  const gssDetailHref = `/gss/${encodeURIComponent(tool.gpc_id)}`;

  return (
    <div style={{ padding: 28, maxWidth: 1100 }}>
      {/* Sticky top actions */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          paddingBottom: 12,
          marginBottom: 16,
          background: "linear-gradient(#000 60%, rgba(0,0,0,0))",
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            href="/gpc"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            ← Zpět do GPC
          </Link>

          <Link
            href="/gss"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            ← Zpět do GSS
          </Link>

          <Link
            href={gssDetailHref}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              textDecoration: "none",
              marginLeft: "auto",
            }}
          >
            Přejít na GSS detail →
          </Link>
        </div>
      </div>

      {/* Header */}
      <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#aaa", fontSize: 13, marginBottom: 6 }}>
            GPC – Produktová karta (statická pravda)
          </div>

          <h1 style={{ fontSize: 36, margin: 0, lineHeight: 1.15 }}>
            {tool.name}
          </h1>

          <div style={{ color: "#bbb", marginTop: 10 }}>
            <b style={{ color: "#fff" }}>{tool.manufacturer}</b> •{" "}
            {tool.type || "—"}
          </div>

          <div style={{ color: "#aaa", marginTop: 8, fontSize: 13 }}>
            GPC ID: <b style={{ color: "#fff" }}>{tool.gpc_id}</b>
            {tool.gtin ? (
              <>
                {" "}
                • GTIN: <b style={{ color: "#fff" }}>{tool.gtin}</b>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Images */}
      <Section title="Obrázky / výkres">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div
            style={{
              borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: 12,
              minHeight: 220,
            }}
          >
            <div style={{ color: "#aaa", fontSize: 13, marginBottom: 10 }}>
              Hlavní foto
            </div>
            {tool.image_main ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tool.image_main}
                alt={tool.name}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 12,
                  display: "block",
                }}
              />
            ) : (
              <div style={{ color: "#777" }}>Bez obrázku</div>
            )}
          </div>

          <div
            style={{
              borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: 12,
              minHeight: 220,
            }}
          >
            <div style={{ color: "#aaa", fontSize: 13, marginBottom: 10 }}>
              Výkres
            </div>
            {tool.image_drawing ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tool.image_drawing}
                alt={`${tool.name} drawing`}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 12,
                  display: "block",
                  background: "#111",
                }}
              />
            ) : (
              <div style={{ color: "#777" }}>Bez výkresu</div>
            )}
          </div>
        </div>
      </Section>

      {/* Geometry */}
      <Section title="Geometrie">
        <Row label="Průměr (mm)" value={geom.diameter_mm} />
        <Row label="Délka břitu (mm)" value={geom.flute_length_mm} />
        <Row label="Celková délka (mm)" value={geom.overall_length_mm} />
        <Row label="Průměr stopky (mm)" value={geom.shank_diameter_mm} />
        <Row label="Počet zubů" value={geom.flutes} />
        <Row label="Šroubovice (°)" value={geom.helix_angle_deg} />
        <Row label="Úhel špičky (°)" value={geom.point_angle_deg} />
        <Row label="Rohový radius (mm)" value={geom.corner_radius_mm} />
        <Row label="Krček (mm)" value={geom.neck_length_mm} />
      </Section>

      {/* Tool features */}
      <Section title="Materiál / povlak / vlastnosti">
        <Row label="Materiál" value={feats.material} />
        <Row label="Povlak" value={feats.coating} />
        <Row label="Tolerance" value={feats.tolerance} />
        <Row label="Směr (hand)" value={feats.hand} />
        <Row label="Kvalita povrchu" value={feats.finish_quality} />
      </Section>

      {/* Cutting */}
      <Section title="Řezné parametry (pokud jsou)">
        <Row label="Dop. vc (m/min)" value={cutting.recommended_vc_m_min} />
        <Row label="Dop. fz (mm)" value={cutting.recommended_fz_mm} />
        <Row label="Chlazení povinné" value={cutting.coolant_required} />
        <Row label="Vnitřní chlazení" value={cutting.internal_coolant} />
        <Row label="Chipbreaker" value={cutting.chipbreaker} />
      </Section>

      {/* Usage */}
      <Section title="Použití">
        <Row
          label="Operace"
          value={Array.isArray(usage.operations) ? usage.operations.join(", ") : usage.operations}
        />
        <Row
          label="Materiály obrobku"
          value={
            Array.isArray(usage.workpiece_materials)
              ? usage.workpiece_materials.join(", ")
              : usage.workpiece_materials
          }
        />
        <Row label="Poznámky" value={usage.notes} />
      </Section>

      {/* Lifecycle (GPC-only = obecně zobrazitelné) */}
      <Section title="Životní cyklus (informačně)">
        <Row label="Brousitelný" value={lifecycle.resharpenable ? "ANO" : "NE"} />
        <Row label="Max. přebroušení" value={lifecycle.max_resharpens} />
        <Row label="Servisní poznámky" value={lifecycle.service_notes} />
        <Row label="Oček. život (min)" value={lifecycle.expected_tool_life_min} />
        <div style={{ marginTop: 10, color: "#888", fontSize: 12 }}>
          Pozn.: Skutečný životní cyklus kusů (nový / ostřený / použitý, historie, DM tracking)
          řeší až GSS.
        </div>
      </Section>

      <div style={{ height: 28 }} />
    </div>
  );
}
