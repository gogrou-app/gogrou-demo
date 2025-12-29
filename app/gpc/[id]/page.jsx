import Image from "next/image";

export default function GPCDetailPage() {
  const product = {
    name: "Walter DC170-05-10.500A1-WJ30EJ",
    manufacturer: "Walter",
    type: "Vrták – monolitní TK",
    gpcId: "73-555-321-50392",
    gtin: "06745276",
    images: {
      main: "/images/tools/walter_dc170.png",
      drawing: "/images/tools/walter_dc170_drawing.png",
    },
    geometry: {
      diameter: "10.5",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.metaTitle}>GPC – Produktová karta (statická pravda)</div>
        <h1 style={styles.title}>{product.name}</h1>
        <div style={styles.subtitle}>
          {product.manufacturer} · {product.type}
        </div>
        <div style={styles.meta}>
          GPC ID: {product.gpcId} · GTIN: {product.gtin}
        </div>
      </div>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Obrázky / výkres</h2>
        <div style={styles.images}>
          <div style={styles.imageBox}>
            <div style={styles.imageLabel}>Hlavní foto</div>
            <Image
              src={product.images.main}
              alt={product.name}
              width={400}
              height={160}
              style={styles.image}
            />
          </div>
          <div style={styles.imageBox}>
            <div style={styles.imageLabel}>Výkres</div>
            <Image
              src={product.images.drawing}
              alt="Výkres"
              width={400}
              height={160}
              style={styles.image}
            />
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Geometrie</h2>
        <div style={styles.grid}>
          <div>
            <div style={styles.label}>Průměr (mm)</div>
            <div style={styles.value}>{product.geometry.diameter}</div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "32px 24px 80px",
  },
  header: {
    marginBottom: "32px",
  },
  metaTitle: {
    fontSize: "13px",
    color: "#888",
    marginBottom: "8px",
  },
  title: {
    fontSize: "34px",
    fontWeight: "700",
    marginBottom: "6px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#ccc",
    marginBottom: "6px",
  },
  meta: {
    fontSize: "13px",
    color: "#777",
  },
  section: {
    marginTop: "32px",
    padding: "24px",
    background: "linear-gradient(180deg,#111,#0b0b0b)",
    borderRadius: "14px",
  },
  sectionTitle: {
    fontSize: "18px",
    marginBottom: "16px",
  },
  images: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  imageBox: {
    background: "#0e0e0e",
    borderRadius: "12px",
    padding: "16px",
  },
  imageLabel: {
    fontSize: "13px",
    color: "#aaa",
    marginBottom: "10px",
  },
  image: {
    width: "100%",
    height: "auto",
    objectFit: "contain",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: "20px",
  },
  label: {
    fontSize: "13px",
    color: "#888",
    marginBottom: "4px",
  },
  value: {
    fontSize: "16px",
    fontWeight: "600",
  },
};
