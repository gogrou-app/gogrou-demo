// app/gpc/[id]/page.jsx
import tools from "../data";
import Link from "next/link";

export default function GpcDetailPage({ params }) {
  const { id } = params;
  const tool = tools.find((t) => t.gpc_id === id);

  if (!tool) {
    return (
      <div style={{ padding: 40 }}>
        <Link href="/gpc">← Zpět do GPC</Link>
        <h1>Nástroj nenalezen</h1>
      </div>
    );
  }

  const {
    name,
    manufacturer,
    type,
    image_main,
    image_drawing,
    geometry,
    cutting,
    tool_features,
    usage,
    lifecycle,
  } = tool;

  return (
    <div style={{ padding: 40, maxWidth: 1200 }}>
      <Link href="/gpc">← Zpět do GPC</Link>

      <h1 style={{ marginTop: 20 }}>{name}</h1>
      <p><strong>Výrobce:</strong> {manufacturer}</p>
      <p><strong>Typ:</strong> {type}</p>

      {/* ======================= */}
      {/* OBRÁZKY */}
      {/* ======================= */}
      <div style={{ display: "flex", gap: 40, marginTop: 30 }}>
        {image_main && (
          <div>
            <p><strong>Produkt</strong></p>
            <img
              src={image_main}
              alt={name}
              style={{ maxWidth: 300, background: "#111" }}
            />
          </div>
        )}

        {image_drawing && (
          <div>
            <p><strong>Výkres</strong></p>
            <img
              src={image_drawing}
              alt={`${name} drawing`}
              style={{ maxWidth: 300, background: "#111" }}
            />
          </div>
        )}
      </div>

      <hr style={{ margin: "40px 0" }} />

      {/* ======================= */}
      {/* GEOMETRIE */}
      {/* ======================= */}
      <Section title="Geometrie">
        <Param label="Průměr [mm]" value={geometry?.diameter_mm} />
        <Param label="Délka břitu [mm]" value={geometry?.flute_length_mm} />
        <Param label="Celková délka [mm]" value={geometry?.overall_length_mm} />
        <Param label="Průměr stopky [mm]" value={geometry?.shank_diameter_mm} />
        <Param label="Počet zubů" value={geometry?.flutes} />
        <Param label="Úhel šroubovice [°]" value={geometry?.helix_angle_deg} />
        <Param label="Úhel špičky [°]" value={geometry?.point_angle_deg} />
        <Param label="Rádius rohu [mm]" value={geometry?.corner_radius_mm} />
      </Section>

      {/* ======================= */}
      {/* ŘEZNÉ PODMÍNKY */}
      {/* ======================= */}
      <Section title="Řezné podmínky">
        <Param label="Vc [m/min]" value={cutting?.recommended_vc_m_min} />
        <Param label="Fz [mm]" value={cutting?.recommended_fz_mm} />
        <Param label="Chlazení" value={cutting?.coolant_required} />
        <Param label="Vnitřní chlazení" value={cutting?.internal_coolant} />
      </Section>

      {/* ======================= */}
      {/* VLASTNOSTI */}
      {/* ======================= */}
      <Section title="Vlastnosti nástroje">
        <Param label="Materiál" value={tool_features?.material} />
        <Param label="Povlak" value={tool_features?.coating} />
        <Param label="Tolerance" value={tool_features?.tolerance} />
        <Param label="Směr" value={tool_features?.hand} />
      </Section>

      {/* ======================= */}
      {/* POUŽITÍ */}
      {/* ======================= */}
      <Section title="Použití">
        <Param
          label="Operace"
          value={usage?.operations?.join(", ")}
        />
        <Param label="Poznámka" value={usage?.notes} />
      </Section>

      {/* ======================= */}
      {/* ŽIVOTNÍ CYKLUS */}
      {/* ======================= */}
      <Section title="Životní cyklus">
        <Param
          label="Brousitelný"
          value={lifecycle?.resharpenable ? "Ano" : "Ne"}
        />
        <Param
          label="Max. přebroušení"
          value={lifecycle?.max_resharpens}
        />
        <Param
          label="Oček. životnost [min]"
          value={lifecycle?.expected_tool_life_min}
        />
      </Section>
    </div>
  );
}

/* ======================= */
/* POMOCNÉ KOMPONENTY */
/* ======================= */

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 30 }}>
      <h2>{title}</h2>
      <table>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Param({ label, value }) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <tr>
      <td style={{ paddingRight: 20, opacity: 0.7 }}>{label}</td>
      <td>{value}</td>
    </tr>
  );
}
