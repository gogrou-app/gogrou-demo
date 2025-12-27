import "./globals.css";
import AppHeader from "./components/AppHeader";

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body
        style={{
          margin: 0,
          background: "#000",
          color: "#fff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* LEVÉ MENU */}
        <div
          style={{
            width: 220,
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            background: "#111",
            borderRight: "1px solid #222",
            padding: 20,
            boxSizing: "border-box",
          }}
        >
          <h2>
            GOGROU
            <br />
            DEMO
          </h2>

          <nav style={{ marginTop: 20 }}>
            <a href="/" style={linkStyle}>Dashboard</a>
            <a href="/gpc" style={linkStyle}>GPC</a>
            <a href="/gss" style={linkStyle}>GSS</a>
            <a href="/smartsplit" style={linkStyle}>SmartSplit</a>
            <a href="/ai" style={linkStyle}>AI Assistant</a>
          </nav>
        </div>

        {/* OBSAH + HEADER */}
        <div style={{ marginLeft: 220 }}>
          <AppHeader />

          <div style={{ padding: 30 }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

const linkStyle = {
  display: "block",
  padding: "10px 0",
  color: "#ccc",
  textDecoration: "none",
};
