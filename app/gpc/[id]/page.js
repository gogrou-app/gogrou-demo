import { tools } from "../data";

export default function Page({ params }) {
  const tool = tools.find((t) => String(t.id) === params.id);

  if (!tool) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Nástroj nebyl nalezen ❌</h2>
        <a
          href="/gpc"
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "10px 15px",
            background: "#444",
            color: "#fff",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          ← Zpět na seznam
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      {/* 🔥 NADPIS */}
      <h2 style={{ fontSize: "28px", marginBottom: "15px" }}>
        {tool.name}
      </h2>

      {/* 🔥 ZÁKLADNÍ PARAMETRY */}
      <div
        style={{
          background: "#1a1a1a",
          padding: "20px",
          borderRadius: "10px",
          border: "1px solid #333",
          marginBottom: "30px",
          maxWidth: "520px",
          lineHeight: "1.7",
        }}
      >
        <p><strong>GPC ID:</strong> {tool.gpc_id}</p>
        <p><strong>GTIN / Order ID:</strong> {tool.id}</p>
        <p><strong>Výrobce:</strong> {tool.manufacturer}</p>
        <p><strong>Typ:</strong> {tool.type}</p>
        <p><strong>Průměr:</strong> {tool.diameter}</p>
        <p><strong>Celková délka:</strong> {tool.overall_length}</p>

        {tool.description && (
          <p style={{ marginTop: "10px", opacity: 0.8 }}>
            {tool.description}
          </p>
        )}
      </div>

      {/* 🔥 HLAVNÍ OBRÁZEK */}
      {tool.image && (
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ marginBottom: "8px" }}>Hlavní obrázek</h3>
          <img
            src={tool.image}
            alt={tool.name}
            style={{
              width: "200px",
              borderRadius: "10px",
              border: "1px solid #333",
              background: "#fff",
              padding: "5px",
            }}
          />
        </div>
      )}

      {/* 🔥 TECHNICKÝ VÝKRES */}
      {tool.drawing && (
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ marginBottom: "8px" }}>Technický výkres</h3>
          <img
            src={tool.drawing}
            alt="Technický výkres"
            style={{
              width: "300px",
              borderRadius: "10px",
              border: "1px solid #333",
              background: "white",
              padding: "8px",
            }}
          />
        </div>
      )}

      {/* 🔥 DETAILNÍ TECHNICKÉ PARAMETRY */}
      {tool.parameters && (
        <div
          style={{
            marginTop: "40px",
            background: "#111",
            padding: "25px",
            borderRadius: "10px",
            border: "1px solid #333",
            maxWidth: "600px",
          }}
        >
          <h3 style={{ marginBottom: "15px" }}>Technické parametry (DIN4000)</h3>

          {Object.entries(tool.parameters).map(([key, p]) => (
            <div
              key={key}
              style={{
                borderBottom: "1px solid #222",
                padding: "6px 0",
                fontSize: "15px",
              }}
            >
              <strong>{key}</strong> — {p.label}
              <div style={{ opacity: 0.7, fontSize: "13px" }}>
                {p.cz}
              </div>
              <div>
                <strong style={{ color: "#4da3ff" }}>{p.value}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔙 ZPĚT */}
      <a
        href="/gpc"
        style={{
          display: "inline-block",
          marginTop: "35px",
          padding: "10px 15px",
          background: "#444",
          color: "#fff",
          borderRadius: "6px",
          textDecoration: "none",
        }}
      >
        ← Zpět na seznam
      </a>
    </div>
  );
}
