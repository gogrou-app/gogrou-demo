import Link from "next/link";
import tools from "./data";

export default function GPCPage() {
  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>GPC – Produktový katalog</h1>
      <p style={styles.subtitle}>Interní katalog nástrojů (DEMO režim)</p>

      <div style={styles.list}>
        {tools.map((tool) => (
          <div key={tool.gpc_id} style={styles.card}>
            <div style={styles.left}>
              <div style={styles.name}>
                {tool.manufacturer} – {tool.type}
              </div>
              <div style={styles.meta}>{tool.name}</div>
            </div>

            <div style={styles.actions}>
              <Link href={`/gpc/${tool.gpc_id}`} style={styles.link}>
                Detail →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    padding: "32px",
    maxWidth: "1100px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    marginBottom: "6px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#aaa",
    marginBottom: "24px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  card: {
    background: "#111",
    borderRadius: "12px",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 0 0 1px #222 inset",
  },
  left: {
    display: "flex",
    flexDirection: "column",
  },
  name: {
    fontSize: "16px",
    fontWeight: "600",
  },
  meta: {
    fontSize: "13px",
    color: "#aaa",
    marginTop: "4px",
  },
  actions: {
    display: "flex",
    gap: "10px",
  },
  link: {
    background: "#222",
    padding: "8px 14px",
    borderRadius: "8px",
    textDecoration: "none",
    color: "#fff",
    fontSize: "13px",
  },
};
