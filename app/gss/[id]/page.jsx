import { notFound } from "next/navigation";
import gssItems from "../data/gssStore";

export default function GSSDetailPage({ params }) {
  const { id } = params;

  const item = gssItems.find((i) => i.id === id);

  if (!item) {
    return notFound();
  }

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.title}>GSS – Detail nástroje</h1>

      <div style={styles.card}>
        <div style={styles.row}>
          <span style={styles.label}>Název</span>
          <span>{item.name}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Výrobce</span>
          <span>{item.manufacturer}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Typ</span>
          <span>{item.type}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Stav</span>
          <span>{item.status}</span>
        </div>

        <div style={styles.actions}>
          <button style={styles.disabledButton} disabled>
            Poslat na ostření (WIP)
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    padding: "32px",
    maxWidth: "900px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    marginBottom: "20px",
  },
  card: {
    background: "#111",
    borderRadius: "14px",
    padding: "24px",
    boxShadow: "0 0 0 1px #222 inset",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    fontSize: "14px",
  },
  label: {
    color: "#aaa",
  },
  actions: {
    marginTop: "24px",
  },
  disabledButton: {
    background: "#222",
    color: "#777",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "not-allowed",
  },
};
