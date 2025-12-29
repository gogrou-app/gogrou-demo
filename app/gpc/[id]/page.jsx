import Link from "next/link";
import { gpcData } from "../data";

export default function GPCDetail({ params }) {
  const item = gpcData.find((i) => i.id === params.id);

  if (!item) {
    return (
      <div style={{ padding: 40, color: "#fff" }}>
        Produkt nenalezen
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      {/* HLAVIČKA – BEZ GSS TLAČÍTEK */}
      <div style={styles.header}>
        <Link href="/gpc" style={styles.back}>
          ← Zpět do GPC
        </Link>
      </div>

      {/* TITUL */}
      <div style={styles.titleBlock}>
        <div style={styles.label}>
          GPC – Produktová karta (statická pravda)
        </div>

        <h1 style={styles.title}>{item.name}</h1>

        <div style={styles.subtitle}>
          {item.brand} · {item.type}
        </div>

        <div style={styles.meta}>
          GPC ID: {item.id} · GTIN: {item.gtin}
        </div>
      </div>

      {/* OBRÁZKY */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Obrázky / výkres</h3>

        <div style={styles.imageGrid}>
          <div>
            <div style={styles.imageLabel}>Hlavní foto</div>
            <div style={styles.imageBox}>
              {item.image ? (
                <img src={item.image} style={styles.image} />
              ) : (
                "—"
              )}
            </div>
          </div>

          <div>
            <div style={styles.imageLabel}>Výkres</div>
            <div style={styles.imageBox}>
              {item.drawing ? (
                <img src={item.drawing} style={styles.image} />
              ) : (
                "—"
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GEOMETRIE */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Geometrie</h3>

        <div style={styles.grid}>
          <div>
            <div style={styles.key}>Průměr (mm)</div>
            <div style={styles.value}>{item.diameter}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== STYLY ===================== */

const styles = {
  wrapper: {
    padding: "32px 40px",
    color: "#fff",
    maxWidth: 1100,
  },

  header: {
    marginBottom: 20,
  },

  back: {
    color: "#aaa",
    textDecoration: "none",
    fontSize: 14,
  },

  titleBlock: {
    marginBottom: 30,
  },

  label: {
    fontSize: 13,
    color: "#888",
    marginBottom: 6,
  },

  title: {
    fontSize: 34,
    margin: 0,
  },

  subtitle: {
    fontSize: 16,
    marginTop: 6,
  },

  meta: {
    fontSize: 13,
    color: "#aaa",
    marginTop: 6,
  },

  card: {
    background: "#111",
    borderRadius: 14,
    padding: 24,
    marginBottom: 24,
  },

  cardTitle: {
    margin: 0,
    marginBottom: 16,
  },

  imageGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },

  imageLabel: {
    fontSize: 13,
    color: "#aaa",
    marginBottom: 6,
  },

  imageBox: {
    height: 200,
    border: "1px solid #333",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#555",
  },

  image: {
    maxWidth: "100%",
    maxHeight: "100%",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },

  key: {
    fontSize: 13,
    color: "#aaa",
  },

  value: {
    fontSize: 18,
    marginTop: 4,
  },
};
