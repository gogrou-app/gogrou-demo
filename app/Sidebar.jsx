export default function Sidebar() {
  return (
    <div
      style={{
        width: "220px",
        height: "100vh",
        background: "#111",
        padding: "20px",
        boxSizing: "border-box",
        borderRight: "1px solid #222",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <h2
        style={{
          color: "white",
          marginBottom: "20px",
          fontSize: "20px",
          fontWeight: "bold",
        }}
      >
        GOGROU <br />
        DEMO
      </h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <a
          href="/dashboard"
          style={linkStyle}
        >
          Dashboard
        </a>

        <a
          href="/gpc"
          style={linkStyle}
        >
          GPC
        </a>

        <a
          href="/gss"
          style={linkStyle}
        >
          GSS
        </a>

        <a
          href="/ss"
          style={linkStyle}
        >
          SmartSplit
        </a>

        <a
          href="/ai"
          style={linkStyle}
        >
          AI Asistent
        </a>
      </nav>

      {/* ---- TLAČÍTKO ZPĚT NA SEZNAM ---- */}
      <div style={{ position: "absolute", bottom: "25px", left: "20px" }}>
        <a
          href="/gpc"
          style={{
            display: "inline-block",
            padding: "10px 15px",
            background: "#333",
            color: "white",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "15px",
          }}
        >
          ← Zpět na seznam
        </a>
      </div>
    </div>
  );
}

const linkStyle = {
  padding: "10px 14px",
  background: "#222",
  border: "1px solid #333",
  color: "white",
  borderRadius: "6px",
  textDecoration: "none",
  fontSize: "15px",
};
