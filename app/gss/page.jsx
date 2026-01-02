import tools from "../gpc/data";

export default function GSSPage() {
  return (
    <div style={{ padding: 24, maxWidth: 1000 }}>
      <h1>GSS – Výběr položky ze skladu</h1>
      <p>GSS si pouze VYŽÁDÁ položku z GPC (read-only)</p>

      <input
        placeholder="Hledej název / výrobce / průměr / GPC ID"
        style={{
          marginTop: 16,
          padding: 10,
          width: "100%",
          borderRadius: 8,
          border: "1px solid #333",
          background: "#111",
          color: "#fff",
        }}
      />

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        {tools.map((tool) => (
          <div
            key={tool.gpc_id}
            style={{
              display: "flex",
              gap: 16,
              padding: 16,
              borderRadius: 12,
              background: "#0f0f0f",
              alignItems: "center",
            }}
          >
            {/* obrázek */}
            {tool.images?.main && (
              <img
                src={tool.images.main}
                alt={tool.name}
                style={{
                  width: 80,
                  height: 80,
                  objectFit: "contain",
                  background: "#000",
                  borderRadius: 8,
                }}
              />
            )}

            {/* text */}
            <div style={{ flex: 1 }}>
              <strong>{tool.name}</strong>
              <div style={{ opacity: 0.7 }}>
                {tool.manufacturer} · Ø {tool.geometry?.diameter_mm ?? "?"} mm
              </div>
            </div>

            {/* akce */}
            <button
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                background: "#1e90ff",
                border: "none",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Vyžádat do GSS
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
