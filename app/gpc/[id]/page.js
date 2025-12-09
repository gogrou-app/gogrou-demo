<h2 style={{ fontSize: "26px", marginBottom: "15px" }}>
  {tool.name}
</h2>

{/* ZÁKLADNÍ PARAMETRY */}
<div style={{ marginBottom: "20px", lineHeight: "1.6" }}>
  <p><strong>GPC ID:</strong> {tool.gpc_id}</p>
  <p><strong>GTIN / Order ID:</strong> {tool.id}</p>
  <p><strong>Výrobce:</strong> {tool.manufacturer}</p>
  <p><strong>Typ:</strong> {tool.type}</p>
  <p><strong>Průměr:</strong> {tool.diameter}</p>
  <p><strong>Celková délka:</strong> {tool.overall_length}</p>
</div>

{/* POPIS */}
{tool.description && (
  <p style={{ marginTop: "10px", opacity: 0.85, fontSize: "15px" }}>
    {tool.description}
  </p>
)}

{/* OBRÁZEK NÁSTROJE */}
{tool.image && (
  <div style={{ marginTop: "20px" }}>
    <img
      src={tool.image}
      alt={tool.name}
      style={{
        width: "180px",
        borderRadius: "6px",
        border: "1px solid #333",
        display: "block"
      }}
    />
  </div>
)}

{/* TECHNICKÝ VÝKRES */}
{tool.drawing && (
  <div style={{ marginTop: "25px" }}>
    <h3 style={{ marginBottom: "8px" }}>Technický výkres</h3>
    <img
      src={tool.drawing}
      alt="technical drawing"
      style={{
        width: "260px",
        borderRadius: "6px",
        border: "1px solid #333",
        background: "#fff",
        padding: "5px"
      }}
    />
  </div>
)}

{/* TLAČÍTKO ZPĚT */}
<a
  href="/gpc"
  style={{
    display: "inline-block",
    marginTop: "30px",
    padding: "10px 15px",
    background: "#444",
    color: "#fff",
    borderRadius: "6px",
    textDecoration: "none",
  }}
>
  ← Zpět na seznam
</a>
