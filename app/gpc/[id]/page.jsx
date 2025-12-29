import gpcData from "../data";

export default function GPCDetailPage({ params }) {
  const product = gpcData.find(p => p.id === params.id);

  if (!product) {
    return (
      <div style={{ padding: "40px", color: "#fff" }}>
        Produkt nenalezen
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px" }}>
      
      <div style={{ marginBottom: "24px" }}>
        <div style={{ color: "#888", fontSize: "13px" }}>
          GPC – Produktová karta (statická pravda)
        </div>

        <h1 style={{ fontSize: "32px", margin: "8px 0" }}>
          {product.name}
        </h1>

        <div style={{ color: "#aaa", fontSize: "15px" }}>
          {product.brand} · {product.type}
        </div>

        <div style={{ color: "#666", fontSize: "13px", marginTop: "6px" }}>
          GPC ID: {product.id} · GTIN: {product.gtin}
        </div>
      </div>

      {/* OBRÁZKY */}
      <div style={box}>
        <h2 style={boxTitle}>Obrázky / výkres</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div>
            <div style={label}>Hlavní foto</div>
            <img
              src={product.image}
              alt={product.name}
              style={img}
            />
          </div>

          <div>
            <div style={label}>Výkres</div>
            <img
              src={product.drawing}
              alt="Výkres"
              style={img}
            />
          </div>
        </div>
      </div>

      {/* GEOMETRIE */}
      <div style={box}>
        <h2 style={boxTitle}>Geometrie</h2>

        <div style={grid}>
          <div>
            <div style={label}>Průměr (mm)</div>
            <div style={value}>{product.diameter}</div>
          </div>

          <div>
            <div style={label}>Délka břitu (mm)</div>
            <div style={value}>{product.cutLength}</div>
          </div>

          <div>
            <div style={label}>Celková délka (mm)</div>
            <div style={value}>{product.totalLength}</div>
          </div>

          <div>
            <div style={label}>Počet zubů</div>
            <div style={value}>{product.flutes}</div>
          </div>
        </div>
      </div>

      {/* POPIS */}
      <div style={box}>
        <h2 style={boxTitle}>Popis</h2>
        <div style={{ color: "#ccc", fontSize: "14px", lineHeight: "1.6" }}>
          {product.description}
        </div>
      </div>

    </div>
  );
}

/* ===== STYLY ===== */

const box = {
  background: "#111",
  borderRadius: "14px",
  padding: "24px",
  marginBottom: "24px",
};

const boxTitle = {
  fontSize: "18px",
  marginBottom: "16px",
};

const label = {
  fontSize: "12px",
  color: "#777",
  marginBottom: "6px",
};

const value = {
  fontSize: "15px",
  fontWeight: "600",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "16px",
};

const img = {
  width: "100%",
  borderRadius: "10px",
  background: "#000",
};
