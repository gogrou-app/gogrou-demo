import tools from "../data";
import Image from "next/image";
import Link from "next/link";

export default function GPCDetailPage({ params }) {
  const tool = tools.find((t) => t.gpc_id === params.id);

  if (!tool) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Nástroj nenalezen</h2>
        <Link href="/gpc">← Zpět do GPC</Link>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <Link href="/gpc" style={styles.back}>
        ← Zpět do GPC
      </Link>

      <h1 style={styles.title}>{tool.name}</h1>
      <div style={styles.subtitle}>
        {tool.manufacturer} • {tool.type}
      </div>

      <div style={styles.grid}>
        <div style={styles.images}>
          {tool.image_main && (
            <Image
              src={tool.image_main}
              alt={tool.name}
              width={360}
              height={240}
              style={styles.image}
            />
          )}

          {tool.image_drawing && (
            <Image
              src={tool.image_drawing}
              alt="Výkres"
              width={360}
              height={240}
              style={styles.image}
            />
          )}
        </div>

        <div style={styles.section}>
          <h3>Základní informace</h3>
          <Row label="GPC ID" value={tool.gpc_id} />
          <Row label="GTIN" value={tool.gtin || "—"} />
          <Row label="Materiál" value={tool.tool_features?.material || "—"} />
          <Row label="Povlak" value={tool.tool_features?.coating || "—"} />
        </div>

        <div style={styles.section}>
          <h3>Geometrie</h3>
          <Row label="Průměr" value={tool.geometry?.diameter_mm + " mm"} />
          <Row label="Délka břitu" value={tool.geometry?.flute_length_mm + " mm"} />
          <Row label="Celková délka" value={tool.geometry?.overall_length_mm + " mm"} />
          <Row label="Počet zubů" value={tool.geometry?.flutes} />
        </div>

        <div style={styles.section}>
          <h3>Použití</h3>
          <Row
            label="Operace"
            value={tool.usage?.operations?.join(", ") || "—"}
          />
          <Row label="Poznámka" value={tool.usage?.notes || "—"} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={styles.row}>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{value}</div>
    </div>
  );
}

const styles = {
  wrapper: {
    padding: "32px",
    maxWidth: "1200px",
  },
  back: {
    display: "inline-block",
    marginBottom: "20px",
    color: "#aaa",
    textDecoration: "none",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
  },
  subtitle: {
    marginBottom: "24px",
    color: "#aaa",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },
  images: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  image: {
    borderRadius: "12px",
    background: "#111",
  },
  section: {
    background: "#111",
    borderRadius: "12px",
    padding: "20px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    fontSize: "14px",
  },
  label: {
    color: "#aaa",
  },
  value: {
    fontWeight: "500",
  },
};
