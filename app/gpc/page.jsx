import tools from "./data";
import Link from "next/link";

export default function GPCPage() {
  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <h1>GPC – Produktový katalog</h1>
      <p>Interní katalog nástrojů (DEMO režim)</p>

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        {tools.map((tool) => (
          <div
            key={tool.gpc_id}
            style={{
              display: "flex",
              gap: 16,
              padding: 16,
              borderRadius: 12,
              background: "#111",
              alignItems: "center",
            }}
          >
            {/* OBRÁZEK */}
            {tool.images?.main && (
              <img
                src={tool.images.main}
                alt={tool.name}
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "contain",
                  background: "#000",
                  borderRadius: 8,
                }}
              />
            )}

            {/* TEXT */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{tool.manufacturer} – {tool.type}</div>
              <div style={{ opacity: 0.8 }}>{tool.name}</div>

              {/* SEMAFOR */}
              <div
                style={{
                  marginTop: 6,
                  display: "inline-block",
                  padding: "2px 10px",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                  background:
                    tool.status === "active"
                      ? "#2ecc71"
                      : tool.status === "phaseout"
                      ? "#f1c40f"
                      : "#e74c3c",
                }}
              >
                {tool.status === "active"
                  ? "AKTIVNÍ"
                  : tool.status === "phaseout"
                  ? "VÝBĚHOVÁ"
                  : "UKONČENÁ"}
              </div>
            </div>

            {/* DETAIL */}
            <Link
              href={`/gpc/${tool.gpc_id}`}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                background: "#222",
                textDecoration: "none",
                color: "#fff",
                fontWeight: 600,
              }}
            >
              Detail →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
